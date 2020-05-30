module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ["react",
    "jest",
    "prettier"],
  extends: [
   // "eslint:recommended",
    "plugin:react/recommended",
    "prettier",
    "prettier/react"
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    extraFileExtensions: ['.d.ts'],
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/ban-ts-ignore': 'off',
    '@typescript-eslint/member-delimiter': 'off',
    '@typescript-eslint/type-annotation': 'off',
    'react/no-children-prop': 'off',
    'sonarjs/no-duplicate-string': 'off',
    'sonarjs/cognitive-complexity': 'off',
    'react/prop-types': 'off',
    'react/display-name': 'off',
    'prettier/prettier': 'off',
    "react/jsx-uses-react": 2,
    "react/jsx-uses-vars": 2,
    "react/no-unused-prop-types": 2,
    "react/react-in-jsx-scope": 2,
    "no-labels": 0,
    "arrow-parens": 0
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
