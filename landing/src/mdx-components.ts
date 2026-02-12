import { useMDXComponents as getThemeComponents } from 'nextra-theme-docs'; // nextra-theme-blog or your custom theme

const themeComponents = getThemeComponents();

export function useMDXComponents(
  components: Record<string, React.ComponentType<any>>,
): Record<string, React.ComponentType<any>> {
  return {
    ...themeComponents,
    ...components,
  };
}
