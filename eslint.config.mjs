import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.conifg({
    extends: ["next/core-web-vitals", "next/typescript"],
    ignorePatterns: ["src/lib/generated/**/*.ts"],
  }),
];

export default eslintConfig;
