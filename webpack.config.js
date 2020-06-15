const { resolve } = require('path')


module.exports = [
  {
    entry: './src/index.js',
    output: {
      path: resolve(__dirname, 'bin'),
      filename: 'AudioSequence.min.js',
      library: 'AudioSequence',
      libraryTarget: 'window',
      libraryExport: 'default'
    },
    plugins: [],
    module: {
      rules: [{
        test: /\.js$/,
        exclude: /node_modules/,
        use: { loader: 'babel-loader' }
      }]
    }
  }
]
