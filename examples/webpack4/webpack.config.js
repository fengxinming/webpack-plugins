'use strict';
const path = require('path');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const ExtractChunksWebpackPlugin = require('../..');

const resolve = dir => path.join(__dirname, dir);

module.exports = {
  entry: {
    'test.jquery': resolve('./src/test.jquery.js'),
    'test.vue': resolve('./src/test.vue.js')
  },
  output: {
    path: resolve('./dist'),
    filename: '[name].js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.js', '.vue', '.json']
  },
  module: {
    rules: [{
      test: /\.vue$/,
      loader: 'vue-loader'
    }, {
      test: /\.js$/,
      loader: 'babel-loader',
      include: [resolve('src')]
    }, {
      test: /\.pug$/,
      loaders: 'pug-loader'
    }]
  },
  plugins: [
    new VueLoaderPlugin(),
    new FriendlyErrorsPlugin(),
    new ExtractChunksWebpackPlugin()
  ],
  performance: {
    hints: process.env.NODE_ENV === 'production' ? 'warning' : false,
    assetFilter(assetFilename) {
      return assetFilename.endsWith('.js');
    }
  },
  mode: 'development'
};
