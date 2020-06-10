// babel.config.js
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        debug: false,
        targets: {
          node: 10,
          browsers: ['last 5 version']
        }
      }
    ]
  ],
  plugins: []
}
