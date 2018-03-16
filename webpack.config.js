/* eslint-disable */
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const babelExclude = /node_modules/;

const alias = {}
if (process.env.NODE_ENV !== 'production' && process.env.NO_STUBS === undefined) {
};

var config = {
  entry: path.join(__dirname, 'retro-tool-lambda/index.js'),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    libraryTarget: 'commonjs',
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: ['babel-loader'],
        exclude: babelExclude,
      },
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias
  },
  externals: {
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.MONGODB_URL': JSON.stringify(process.env.MONGODB_URL),
      'process.env.DATABASE_NAME': JSON.stringify(process.env.DATABASE_NAME),
    })
  ],
  target: 'node'
}
module.exports = config
