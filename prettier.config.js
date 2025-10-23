export default {
  printWidth: 100,
  overrides: [
    {
      files: ['**/*.js', '**/*.mjs', '**/*.cjs', '**/*.ts'],
      options: {
        singleQuote: true,
        experimentalTernaries: true,
        experimentalOperatorPosition: 'start',
        jsdocCapitalizeDescription: false,
        jsdocCommentLineStrategy: 'multiline',
        plugins: ['prettier-plugin-jsdoc'],
      },
    },
  ],
};
