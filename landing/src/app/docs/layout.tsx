import { Layout, Navbar } from 'nextra-theme-docs';
import { getPageMap } from 'nextra/page-map';
import 'nextra-theme-docs/style.css';
import { Footer } from '@/components/Footer';

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pageMap = await getPageMap('/docs');
  return (
    <Layout
      navbar={<Navbar logo={<NavbarLogo />} />}
      footer={<Footer />}
      docsRepositoryBase="https://github.com/yourusername/theodore/tree/main/landing"
      sidebar={{ defaultMenuCollapseLevel: 1 }}
      pageMap={pageMap}
      darkMode
    >
      {children}
    </Layout>
  );
}

export const NavbarLogo: React.FC = () => {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex h-16 items-center gap-4">
        <img
          src={'/main character.png'}
          alt="Theodore JS Logo"
          className="h-10 w-10 object-contain"
        />
        <span className="text-xl text-gray-900">theodore-js</span>
      </div>
    </div>
  );
};
