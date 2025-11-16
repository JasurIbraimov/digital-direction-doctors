import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt([
    eslintPluginPrettierRecommended,
    // Add TypeScript support
    {
        files: ["**/*.{ts,tsx,vue}"],
        parser: "@typescript-eslint/parser",
        parserOptions: {
            ecmaVersion: 2020,
            sourceType: "module",
            project: "./tsconfig.json"
        },
        plugins: ["@typescript-eslint"],
        extends: [
            "plugin:@typescript-eslint/recommended",
            "plugin:vue/vue3-recommended",
            "plugin:prettier/recommended"
        ],
        rules: {
            // optional: customize your rules
        }
    }
]);
