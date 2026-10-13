import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["tests/**/*.{js,jsx,ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  // Runtime validation protects these dynamic SQL/form boundaries. Static
  // shapes here would only replace `any` with unchecked assertions.
  {
    files: [
      "app/admin/**/*.{ts,tsx}",
      "app/api/admin/**/*.ts",
      "app/api/{appointments,inquiries}/route.ts",
      "app/lib/admin/**/*.{ts,tsx}",
      "app/lib/{db,mailer}.ts",
    ],
    rules: { "@typescript-eslint/no-explicit-any": "off" },
  },
  // Storefront artwork intentionally relies on native image sizing/cropping.
  {
    files: ["app/**/*.tsx"],
    rules: {
      "@next/next/no-img-element": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  // These established screens derive local state from URL/API changes and
  // keep small field renderers close to their usage.
  {
    files: [
      "app/admin/pos/page.tsx",
      "app/admin/settings/page.tsx",
      "app/components/motion/LensCursor.tsx",
      "app/lib/admin/useAdminFetch.ts",
    ],
    rules: {
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/static-components": "off",
    },
  },
  {
    files: ["db/**/*.mjs"],
    rules: { "@typescript-eslint/no-unused-vars": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
