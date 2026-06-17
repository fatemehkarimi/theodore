#!/usr/bin/env python3
"""Run a local OAuth flow for read-only Google Search Console access."""

from __future__ import annotations

import argparse
import base64
import hashlib
import http.server
import json
import os
import secrets
import socketserver
import sys
import time
import urllib.parse
import urllib.request


DEFAULT_SECRET_DIR = "/home/fatemeh/.config/codex/secrets/google-search-console"
DEFAULT_CLIENT_FILE = f"{DEFAULT_SECRET_DIR}/oauth-client.json"
DEFAULT_TOKEN_FILE = f"{DEFAULT_SECRET_DIR}/oauth-token.json"
DEFAULT_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly"


def b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode().rstrip("=")


class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True


def load_oauth_client(path: str) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data.get("installed") or data.get("web") or data


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--client-file", default=DEFAULT_CLIENT_FILE)
    parser.add_argument("--token-file", default=DEFAULT_TOKEN_FILE)
    parser.add_argument("--scope", default=DEFAULT_SCOPE)
    parser.add_argument("--timeout", type=int, default=300)
    args = parser.parse_args()

    client = load_oauth_client(args.client_file)
    client_id = client["client_id"]
    client_secret = client.get("client_secret", "")
    code_verifier = b64url(secrets.token_bytes(48))
    challenge = b64url(hashlib.sha256(code_verifier.encode()).digest())
    state = secrets.token_urlsafe(24)

    class Handler(http.server.BaseHTTPRequestHandler):
        def log_message(self, fmt: str, *args: object) -> None:
            return

        def do_GET(self) -> None:
            parsed = urllib.parse.urlparse(self.path)
            params = urllib.parse.parse_qs(parsed.query)
            if params.get("state", [""])[0] != state:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(b"Invalid OAuth state. You can close this tab.")
                self.server.result = False
                return

            if "error" in params:
                msg = "OAuth error: " + params["error"][0]
                self.send_response(400)
                self.end_headers()
                self.wfile.write((msg + ". You can close this tab.").encode())
                print(msg, flush=True)
                self.server.result = False
                return

            code = params.get("code", [""])[0]
            if not code:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(b"Missing OAuth code. You can close this tab.")
                self.server.result = False
                return

            form = {
                "client_id": client_id,
                "code": code,
                "code_verifier": code_verifier,
                "grant_type": "authorization_code",
                "redirect_uri": self.server.redirect_uri,
            }
            if client_secret:
                form["client_secret"] = client_secret

            req = urllib.request.Request(
                "https://oauth2.googleapis.com/token",
                data=urllib.parse.urlencode(form).encode(),
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                method="POST",
            )

            try:
                with urllib.request.urlopen(req, timeout=30) as resp:
                    token = json.loads(resp.read().decode())

                now = int(time.time())
                token["scope_requested"] = args.scope
                token["created_at"] = now
                token["expires_at"] = now + int(token.get("expires_in", 3600))

                os.makedirs(os.path.dirname(args.token_file), exist_ok=True)
                tmp = args.token_file + ".tmp"
                with open(tmp, "w", encoding="utf-8") as f:
                    json.dump(token, f, indent=2)
                    f.write("\n")
                os.chmod(tmp, 0o600)
                os.replace(tmp, args.token_file)
                os.chmod(args.token_file, 0o600)

                self.send_response(200)
                self.send_header("Content-Type", "text/plain; charset=utf-8")
                self.end_headers()
                self.wfile.write(
                    b"Authorization complete. You can close this tab and return to Codex."
                )
                print(f"OAUTH_COMPLETE saved token to {args.token_file}", flush=True)
                self.server.result = True
            except Exception as exc:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(("Token exchange failed: " + repr(exc)).encode())
                print("TOKEN_EXCHANGE_FAILED " + repr(exc), flush=True)
                self.server.result = False

    with ReusableTCPServer(("127.0.0.1", 0), Handler) as httpd:
        httpd.timeout = args.timeout
        port = httpd.server_address[1]
        redirect_uri = f"http://127.0.0.1:{port}/"
        httpd.redirect_uri = redirect_uri
        httpd.result = None

        params = {
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": args.scope,
            "access_type": "offline",
            "prompt": "consent",
            "code_challenge": challenge,
            "code_challenge_method": "S256",
            "state": state,
        }
        url = "https://accounts.google.com/o/oauth2/v2/auth?" + urllib.parse.urlencode(
            params
        )
        print("OPEN_THIS_URL=" + url, flush=True)
        httpd.handle_request()

        if httpd.result is None:
            print("OAUTH_TIMEOUT", flush=True)
            return 2
        return 0 if httpd.result else 1


if __name__ == "__main__":
    sys.exit(main())
