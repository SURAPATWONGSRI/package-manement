import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: ["next/core-web-vitals", "next/typescript"],
    rules: {
      // Performance rules
      "react/no-array-index-key": "warn", // Warn about using array indices as keys
      "react/jsx-no-constructed-context-values": "warn", // Avoid creating objects in JSX
      "react-hooks/exhaustive-deps": "warn", // Enforce proper dependency arrays
      "no-console": process.env.NODE_ENV === "production" ? "warn" : "off", // Warn about console in production
    },
    ignorePatterns: ["src/lib/generated/**/*.ts"],
  }),
];

export default eslintConfig;
