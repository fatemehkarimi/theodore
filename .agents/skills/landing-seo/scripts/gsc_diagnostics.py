#!/usr/bin/env python3
"""Collect Google Search Console and public HTTP diagnostics for a landing site."""

from __future__ import annotations

import argparse
import html.parser
import json
import os
import ssl
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import date, timedelta


DEFAULT_SECRET_DIR = "/home/fatemeh/.config/codex/secrets/google-search-console"
DEFAULT_CLIENT_FILE = f"{DEFAULT_SECRET_DIR}/oauth-client.json"
DEFAULT_TOKEN_FILE = f"{DEFAULT_SECRET_DIR}/oauth-token.json"
DEFAULT_SITE = "sc-domain:theodore-js.dev"
DEFAULT_ORIGIN = "https://theodore-js.dev"
DEFAULT_OUT = "/tmp/theodore-gsc-diagnostics.json"


class HeadParser(html.parser.HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.in_title = False
        self.title_parts: list[str] = []
        self.meta: list[dict[str, str]] = []
        self.links: list[dict[str, str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr = {k.lower(): v or "" for k, v in attrs}
        if tag.lower() == "title":
            self.in_title = True
        elif tag.lower() == "meta":
            self.meta.append(attr)
        elif tag.lower() == "link":
            self.links.append(attr)

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "title":
            self.in_title = False

    def handle_data(self, data: str) -> None:
        if self.in_title:
            self.title_parts.append(data)

    def summary(self) -> dict:
        def meta_value(key: str, value: str) -> str | None:
            for item in self.meta:
                if item.get(key) == value:
                    return item.get("content")
            return None

        canonical = None
        for item in self.links:
            if item.get("rel", "").lower() == "canonical":
                canonical = item.get("href")
                break

        return {
            "title": "".join(self.title_parts).strip() or None,
            "description": meta_value("name", "description"),
            "robots": meta_value("name", "robots"),
            "googlebot": meta_value("name", "googlebot"),
            "canonical": canonical,
            "og_url": meta_value("property", "og:url"),
        }


def load_oauth_client(path: str) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data.get("installed") or data.get("web") or data


def load_access_token(client_file: str, token_file: str) -> str:
    client = load_oauth_client(client_file)
    with open(token_file, "r", encoding="utf-8") as f:
        token = json.load(f)

    if token.get("expires_at", 0) > time.time() + 60:
        return token["access_token"]

    form = {
        "client_id": client["client_id"],
        "client_secret": client.get("client_secret", ""),
        "refresh_token": token["refresh_token"],
        "grant_type": "refresh_token",
    }
    req = urllib.request.Request(
        "https://oauth2.googleapis.com/token",
        data=urllib.parse.urlencode(form).encode(),
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        refreshed = json.loads(resp.read().decode())

    token.update(refreshed)
    now = int(time.time())
    token["created_at"] = now
    token["expires_at"] = now + int(token.get("expires_in", 3600))

    tmp = token_file + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(token, f, indent=2)
        f.write("\n")
    os.chmod(tmp, 0o600)
    os.replace(tmp, token_file)
    os.chmod(token_file, 0o600)
    return token["access_token"]


def request_json(
    method: str, url: str, token: str, payload: dict | None = None
) -> dict:
    data = None
    headers = {"Authorization": f"Bearer {token}"}
    if payload is not None:
        data = json.dumps(payload).encode()
        headers["Content-Type"] = "application/json"

    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            raw = resp.read().decode()
            return {
                "ok": True,
                "status": resp.status,
                "data": json.loads(raw) if raw else {},
            }
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode(errors="replace")
        try:
            body = json.loads(raw)
        except Exception:
            body = raw
        return {"ok": False, "status": exc.code, "error": body}


def gsc_get(path: str, token: str) -> dict:
    return request_json("GET", "https://searchconsole.googleapis.com/webmasters/v3/" + path, token)


def gsc_post(path: str, token: str, payload: dict) -> dict:
    return request_json(
        "POST", "https://searchconsole.googleapis.com/webmasters/v3/" + path, token, payload
    )


def inspect_url(site: str, url: str, token: str) -> dict:
    return request_json(
        "POST",
        "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
        token,
        {"inspectionUrl": url, "siteUrl": site},
    )


def fetch_public(url: str, insecure: bool = False) -> dict:
    context = ssl._create_unverified_context() if insecure else None
    req = urllib.request.Request(url, headers={"User-Agent": "Codex landing-seo audit"})
    try:
        with urllib.request.urlopen(req, timeout=30, context=context) as resp:
            body = resp.read(250000)
            text = body.decode("utf-8", errors="replace")
            headers = dict(resp.headers.items())
            result = {
                "ok": True,
                "status": resp.status,
                "final_url": resp.geturl(),
                "headers": headers,
                "body_sample": text[:2000],
            }
            ctype = headers.get("Content-Type", "")
            if "html" in ctype.lower() or text.lstrip().lower().startswith("<!doctype"):
                parser = HeadParser()
                parser.feed(text)
                result["head"] = parser.summary()
            return result
    except Exception as exc:
        return {"ok": False, "error": repr(exc)}


def print_summary(result: dict) -> None:
    print(f"site: {result['site']}")
    print("visible properties:")
    for item in result.get("sites", {}).get("data", {}).get("siteEntry", []):
        print(f"  - {item.get('siteUrl')} ({item.get('permissionLevel')})")

    print("sitemaps:")
    for item in result.get("sitemaps", {}).get("data", {}).get("sitemap", []):
        contents = item.get("contents", [])
        counts = ", ".join(
            f"{c.get('type')}: submitted={c.get('submitted')} indexed={c.get('indexed')}"
            for c in contents
        )
        print(
            f"  - {item.get('path')} errors={item.get('errors')} "
            f"warnings={item.get('warnings')} pending={item.get('isPending')} {counts}"
        )

    summary = result.get("summary_28d", {}).get("data", {}).get("rows", [])
    if summary:
        row = summary[0]
        print(
            "28d search: "
            f"clicks={row.get('clicks')} impressions={row.get('impressions')} "
            f"ctr={row.get('ctr'):.3f} position={row.get('position'):.2f}"
        )

    print("url inspection:")
    for url, info in result.get("url_inspection", {}).items():
        status = info.get("data", {}).get("inspectionResult", {}).get("indexStatusResult", {})
        print(
            f"  - {url}: {status.get('coverageState')} "
            f"fetch={status.get('pageFetchState')} canonical={status.get('googleCanonical')}"
        )

    print("public probes:")
    for url, info in result.get("public", {}).items():
        if info.get("ok"):
            head = info.get("head", {})
            print(
                f"  - {url}: status={info.get('status')} final={info.get('final_url')} "
                f"canonical={head.get('canonical')}"
            )
        else:
            print(f"  - {url}: ERROR {info.get('error')}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--client-file", default=DEFAULT_CLIENT_FILE)
    parser.add_argument("--token-file", default=DEFAULT_TOKEN_FILE)
    parser.add_argument("--site", default=DEFAULT_SITE)
    parser.add_argument("--origin", default=DEFAULT_ORIGIN)
    parser.add_argument("--out", default=DEFAULT_OUT)
    parser.add_argument("--inspect", action="append", default=[])
    args = parser.parse_args()

    token = load_access_token(args.client_file, args.token_file)
    encoded_site = urllib.parse.quote(args.site, safe="")
    today = date.today()
    end = today - timedelta(days=3)
    start_28 = end - timedelta(days=27)
    start_90 = end - timedelta(days=89)

    origin = args.origin.rstrip("/")
    inspect_targets = [
        origin + "/",
        origin + "/docs",
        origin.replace("https://", "http://", 1) + "/",
        origin.replace("https://", "https://www.", 1) + "/",
    ]
    inspect_targets.extend(args.inspect)
    inspect_targets = list(dict.fromkeys(inspect_targets))

    public_targets = [
        origin + "/robots.txt",
        origin + "/sitemap.xml",
        origin + "/",
        origin + "/docs",
        origin.replace("https://", "http://", 1) + "/",
        origin.replace("https://", "https://www.", 1) + "/",
    ]
    public_targets = list(dict.fromkeys(public_targets))

    result: dict = {
        "site": args.site,
        "origin": origin,
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "date_ranges": {"28d": [str(start_28), str(end)], "90d": [str(start_90), str(end)]},
        "sites": gsc_get("sites", token),
        "sitemaps": gsc_get(f"sites/{encoded_site}/sitemaps", token),
    }

    analytics_specs = [
        ("summary_28d", start_28, [], 10),
        ("pages_90d", start_90, ["page"], 100),
        ("queries_90d", start_90, ["query"], 100),
        ("countries_90d", start_90, ["country"], 50),
        ("devices_90d", start_90, ["device"], 10),
        ("dates_90d", start_90, ["date"], 100),
        ("page_query_90d", start_90, ["page", "query"], 200),
    ]
    for name, start, dims, limit in analytics_specs:
        payload = {
            "startDate": str(start),
            "endDate": str(end),
            "dimensions": dims,
            "rowLimit": limit,
            "dataState": "all",
        }
        result[name] = gsc_post(f"sites/{encoded_site}/searchAnalytics/query", token, payload)

    result["url_inspection"] = {
        url: inspect_url(args.site, url, token) for url in inspect_targets
    }
    result["public"] = {url: fetch_public(url) for url in public_targets}

    www_url = origin.replace("https://", "https://www.", 1) + "/"
    if www_url in result["public"] and not result["public"][www_url].get("ok"):
        result["public"][www_url + " (insecure retry)"] = fetch_public(www_url, insecure=True)

    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, sort_keys=True)
        f.write("\n")

    print_summary(result)
    print(f"wrote: {args.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
