import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  // Next registers the jsx-a11y plugin but only enables a few rules; turn on its full recommended set.
  { rules: jsxA11y.flatConfigs.recommended.rules },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
