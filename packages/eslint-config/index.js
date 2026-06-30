// @ts-check

/**
 * Returns a base flat config array.
 *
 * Accepts plugins as arguments so that the caller (always the root
 * eslint.config.mjs) controls which module instances are used.
 * This avoids pnpm's isolated node_modules causing duplicate plugin
 * instances when the config package and the root resolve the same
 * plugin to different CJS cache keys.
 *
 * @param {{ tsPlugin: unknown; tsParser: unknown; importX: unknown; prettier: unknown }} plugins
 * @returns {import('eslint').Linter.Config[]}
 */
function base({ tsPlugin, tsParser, importX, prettier }) {
  return [
    {
      plugins: {
        '@typescript-eslint': tsPlugin,
        'import-x': importX,
      },
      languageOptions: {
        parser: tsParser,
        parserOptions: {
          ecmaVersion: 'latest',
          sourceType: 'module',
        },
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
        '@typescript-eslint/no-non-null-assertion': 'warn',
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        'prefer-const': 'error',
        'no-var': 'error',
        eqeqeq: ['error', 'always'],
        'no-duplicate-imports': 'error',
        'import-x/order': [
          'error',
          {
            groups: [
              'builtin',
              'external',
              'internal',
              ['parent', 'sibling'],
              'index',
              'object',
              'type',
            ],
            'newlines-between': 'always',
            alphabetize: { order: 'asc', caseInsensitive: true },
          },
        ],
      },
    },
    prettier,
  ];
}

/**
 * @param {{ tsPlugin: unknown; tsParser: unknown; importX: unknown; prettier: unknown }} plugins
 * @returns {import('eslint').Linter.Config[]}
 */
function nestjs(plugins) {
  return [
    ...base(plugins),
    {
      rules: {
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/no-empty-function': ['error', { allow: ['constructors'] }],
      },
    },
  ];
}

/**
 * @param {{ tsPlugin: unknown; tsParser: unknown; importX: unknown; prettier: unknown }} plugins
 * @returns {import('eslint').Linter.Config[]}
 */
function nextjs(plugins) {
  return [
    ...base(plugins),
    {
      rules: {
        'react/display-name': 'off',
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],
      },
    },
  ];
}

module.exports = { base, nestjs, nextjs };
