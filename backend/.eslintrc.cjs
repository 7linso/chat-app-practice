// backend/.eslintrc.cjs
module.exports = {
  root: true,
  env: { es2023: true, node: true },
  parser: "@typescript-eslint/parser",
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  plugins: ["@typescript-eslint", "import", "unused-imports", "prettier"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:prettier/recommended",
  ],
  rules: {
    // Prefer the plugin for unused imports; allow underscore-args
    "@typescript-eslint/no-unused-vars": ["off"],
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": [
      "warn",
      { args: "after-used", argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
    ],

    // Optional: turn off import/order for now so commits don’t fail on warnings
    // or keep it "warn" and remove --max-warnings=0 from lint-staged.
    "import/order": "off",

    "prettier/prettier": "warn",
  },
  ignorePatterns: ["dist", "build", "node_modules"],
};
