const path = require('path')
const Mini = require('babel-minify-webpack-plugin')
module.exports = {
  entry: path.join(path.resolve(__dirname, 'src'), 'audio_sequence.js'),
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'bin'),
    library: 'AudioSequence',
    libraryTarget: 'window',
    libraryExport: 'default'
  },
  plugins: [
    new Mini()
  ]
}
