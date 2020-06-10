const { resolve } = require('path')
const nodeExternals = require('webpack-node-externals')

module.exports = [
  {
    entry: './src/index.js',
    output: {
      path: resolve(__dirname, 'lib'),
      filename: 'index.js',
      libraryTarget: 'commonjs'
    },
    plugins: [],
    externals: [nodeExternals()],
    module: {
      rules: [{
        test: /\.js$/,
        exclude: /node_modules/,
        use: { loader: 'babel-loader' }
      }]
    }
  },
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
  },
]
