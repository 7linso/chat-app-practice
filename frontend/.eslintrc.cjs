module.exports = {
  root: true,
  env: { es2023: true, browser: true, node: true },
  parser: "@typescript-eslint/parser",
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  settings: {
    react: { version: "detect" },
    "import/resolver": {
      typescript: { project: "./tsconfig.json" },
      node: { extensions: [".js", ".jsx", ".ts", ".tsx"] }
    },
    "import/core-modules": ["@vitejs/plugin-react"]
  },

  plugins: ["@typescript-eslint", "import", "unused-imports", "react", "react-hooks", "prettier"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:prettier/recommended"
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    "prettier/prettier": "warn",
    "react/react-in-jsx-scope": "off",
    "import/order": [
      "warn",
      {
        groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
        "newlines-between": "always",
        alphabetize: { order: "asc", caseInsensitive: true }
      }
    ],
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": [
      "warn",
      { vars: "all", args: "after-used", varsIgnorePattern: "^_", argsIgnorePattern: "^_" }
    ],
    "import/no-unresolved": ["error", { ignore: ["^/"] }],
  },
  ignorePatterns: ["dist", "build", "node_modules", ".expo"]
};
