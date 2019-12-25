'use strict';
const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const ExtractChunksWebpackPlugin = require('../../packages/extract-chunks-webpack-plugin');

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
    new ExtractChunksWebpackPlugin()
  ],
  performance: {
    hints: process.env.NODE_ENV === 'production' ? 'warning' : false,
    assetFilter(assetFilename) {
      return assetFilename.endsWith('.js');
    }
  },
  mode: process.env.NODE_ENV
};
