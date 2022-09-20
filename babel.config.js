module.exports = (api) => {
  const ignore = api.env('test') ? [] : ['**/*.test.js'];
  return {
    env: {
      test: {
        plugins: ['@babel/plugin-transform-modules-commonjs']
      }
    },
    ignore: ignore,
    presets: [
      [
        '@babel/preset-env', 
        {
          modules: false
        }
      ]
    ]
  };
}
