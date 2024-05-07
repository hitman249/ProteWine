module.exports = {
  root: true,
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
  },
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
    project: 'tsconfig.json',
    extraFileExtensions: ['.svelte'] // This is a required setting in `@typescript-eslint/parser` v4.24.0.
  },
  parser: '@typescript-eslint/parser',
  extends: [
    // add more generic rule sets here, such as:
    // 'eslint:recommended',
    'plugin:svelte/recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  plugins: [
    '@typescript-eslint'
  ],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }
    }
  },
  rules: {
    // disable the rules for all files
    semi: 'off',
    '@typescript-eslint/semi': ['error'],
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-this-alias': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/consistent-type-assertions': 'off',
    '@typescript-eslint/no-confusing-non-null-assertion': 'off',
    '@typescript-eslint/no-duplicate-enum-values': 'off',
    '@typescript-eslint/no-require-imports': 'off',
    '@typescript-eslint/prefer-for-of': 'off',
    '@typescript-eslint/prefer-includes': 'off', // Ошибка Parsing error: "parserOption.project" из-за этого правила, но оно триггерится только на этот файл
    '@typescript-eslint/prefer-return-this-type': 'off',
    '@typescript-eslint/prefer-string-starts-ends-with': 'off',
    '@typescript-eslint/prefer-ts-expect-error': 'off',
    '@typescript-eslint/require-array-sort-compare': 'off',
    '@typescript-eslint/switch-exhaustiveness-check': 'off',
    '@typescript-eslint/type-annotation-spacing': 'off',
    '@typescript-eslint/typedef': 'off',
    'comma-dangle': 'off',
    '@typescript-eslint/comma-dangle': 'off',
    'brace-style': 'off',
    '@typescript-eslint/brace-style': 'off',
    'comma-spacing': 'off',
    '@typescript-eslint/comma-spacing': 'off',
    'default-param-last': 'off',
    '@typescript-eslint/default-param-last': 'off',
    'func-call-spacing': 'off',
    '@typescript-eslint/func-call-spacing': 'off',
    'indent': 'off',
    '@typescript-eslint/indent': 'off',
    'keyword-spacing': 'off',
    '@typescript-eslint/keyword-spacing': 'off',
    // 'lines-between-class-members': 'off',
    // '@typescript-eslint/lines-between-class-members': 'off',
    'no-extra-semi': 'off',
    '@typescript-eslint/no-extra-semi': 'off',
    'no-throw-literal': 'off',
    '@typescript-eslint/no-throw-literal': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'quotes': 'off',
    '@typescript-eslint/quotes': 'off',
    'space-before-blocks': 'off',
    '@typescript-eslint/space-before-blocks': 'off',
    'space-infix-ops': 'off',
    '@typescript-eslint/space-infix-ops': 'off',
    'no-unsafe-declaration-merging': 'off',
    '@typescript-eslint/no-unsafe-declaration-merging': 'off',
  },
  overrides: [
    {
      files: ['*.svelte'],
      parser: 'svelte-eslint-parser',
      // Parse the `<script>` in `.svelte` as TypeScript by adding the following configuration.
      parserOptions: {
        parser: '@typescript-eslint/parser'
      }
    },
    {
      // enable the rule specifically for TypeScript files
      files: ['*.ts', "*.mts", "*.cts", '*.tsx'],
      rules: {
        '@typescript-eslint/no-confusing-non-null-assertion': 'error',
        '@typescript-eslint/no-duplicate-enum-values': 'error',
        '@typescript-eslint/no-require-imports': 'error',
        '@typescript-eslint/prefer-for-of': 'error',
        '@typescript-eslint/prefer-includes': 'error',
        '@typescript-eslint/prefer-return-this-type': 'error',
        '@typescript-eslint/prefer-string-starts-ends-with': 'error',
        '@typescript-eslint/prefer-ts-expect-error': 'error',
        '@typescript-eslint/switch-exhaustiveness-check': 'error',
        '@typescript-eslint/default-param-last': 'error',
        '@typescript-eslint/func-call-spacing': 'error',
        '@typescript-eslint/keyword-spacing': 'error',
        '@typescript-eslint/no-extra-semi': 'error',
        '@typescript-eslint/no-throw-literal': 'error',
        '@typescript-eslint/no-unused-vars': 'error',
        '@typescript-eslint/space-before-blocks': 'error',
        '@typescript-eslint/space-infix-ops': ['error', { int32Hint: false }],
        '@typescript-eslint/quotes': ['error', 'single'],
        '@typescript-eslint/indent': ['error', 2],
        '@typescript-eslint/comma-dangle': ['error', 'always-multiline'],
        '@typescript-eslint/brace-style': ['error', '1tbs', {allowSingleLine: false}],
        '@typescript-eslint/require-array-sort-compare': ['error', {ignoreStringArrays: true}],
        // '@typescript-eslint/lines-between-class-members': ['error', {exceptAfterOverload: true}],
        "@typescript-eslint/comma-spacing": ['error', {before: false, after: true}],
        '@typescript-eslint/typedef': ['error', {
          arrayDestructuring: true,
          arrowParameter: true,
          memberVariableDeclaration: true,
          objectDestructuring: false,
          parameter: true,
          propertyDeclaration: true,
          variableDeclaration: true,
          variableDeclarationIgnoreFunction: true,
        }],
        '@typescript-eslint/type-annotation-spacing': ['error', {
          before: false,
          after: true,
          overrides: { arrow: { before: true, after: true }}
        }],
        // '@typescript-eslint/sort-type-union-intersection-members': ['error', {
        //   checkIntersections: true,
        //   checkUnions: true,
        //   groupOrder: [
        //     'named',
        //     'keyword',
        //     'operator',
        //     'literal',
        //     'function',
        //     'import',
        //     'conditional',
        //     'object',
        //     'tuple',
        //     'intersection',
        //     'union',
        //     'nullish',
        //   ],
        // }],
        '@typescript-eslint/explicit-module-boundary-types': ['error', {
          allowArgumentsExplicitlyTypedAsAny: true,
          allowDirectConstAssertionInArrowFunctions: true,
          allowedNames: [],
          allowHigherOrderFunctions: false,
          allowTypedFunctionExpressions: true,
        }],
        '@typescript-eslint/consistent-generic-constructors': [
          "error",
          "type-annotation"
        ],
        '@typescript-eslint/consistent-type-assertions': ["error", {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow-as-parameter',
        }],
        '@typescript-eslint/array-type': ['error', {
          default: 'array',
          readonly: 'array',
        }],
        '@typescript-eslint/explicit-function-return-type': ['error', {
          allowExpressions: false,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
          allowDirectConstAssertionInArrowFunctions: true,
          allowConciseArrowFunctionExpressionsStartingWithVoid: false,

        }],
        '@typescript-eslint/explicit-member-accessibility': ['error', {
          accessibility: 'explicit',
          overrides: {
            accessors: 'explicit',
            constructors: 'no-public',
            methods: 'explicit',
            properties: 'explicit',
            parameterProperties: 'explicit'
          }
        }],
        // '@typescript-eslint/member-ordering': [
        //   'error',
        //   {
        //     default: {
        //       "memberTypes": [
        //         "signature",
        //         "field",
        //         "constructor",
        //         ["get", "set"],
        //         "method",
        //       ],
        //       "order": "alphabetically-case-insensitive"
        //     }
        //   }
        // ],
        '@typescript-eslint/member-delimiter-style': ['error', {
          multiline: {
            delimiter: 'comma',
            requireLast: true
          },
          singleline: {
            delimiter: 'comma',
            requireLast: false
          },
          overrides: {
            interface: {
              multiline: {
                delimiter: 'semi',
                requireLast: true
              }
            }
          }
        }],
      }
    },
  ]
};
