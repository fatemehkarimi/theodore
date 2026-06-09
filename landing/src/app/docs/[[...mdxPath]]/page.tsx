import { generateStaticParamsFor, importPage } from 'nextra/pages';
import { useMDXComponents as getMDXComponents } from '../../../mdx-components';

const generateStaticParams = generateStaticParamsFor('mdxPath');

export async function generateMetadata(props: any) {
  const params = await props.params;
  const { metadata } = await importPage(params.mdxPath);
  const canonical = getCanonicalPath(params.mdxPath);

  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical,
    },
    openGraph: {
      ...metadata.openGraph,
      url: canonical,
    },
  };
}

const Wrapper = getMDXComponents({}).wrapper;

function getCanonicalPath(mdxPath: string[] = []) {
  if (mdxPath.length === 0) {
    return '/docs';
  }

  return `/docs/${mdxPath.join('/')}`;
}

export default async function Page(props: any) {
  const params = await props.params;
  const {
    default: MDXContent,
    toc,
    metadata,
    sourceCode,
  } = await importPage(params.mdxPath);
  return (
    <Wrapper toc={toc} metadata={metadata} sourceCode={sourceCode}>
      <MDXContent {...props} params={params} />
    </Wrapper>
  );
}

export { generateStaticParams };
