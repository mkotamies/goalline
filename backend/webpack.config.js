var path = require("path")
var webpack = require('webpack')
var nodeExternals = require('webpack-node-externals')

module.exports = {
  entry: "./handler.js",
  target: "node",
  watch: true,
  module: {
    loaders: [
      {
        test: /.js?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015']
        }
      }
    ]
  },
  stats: {
    colors: true
  },
  devtool: "source-map",
  externals: [nodeExternals()]
}
