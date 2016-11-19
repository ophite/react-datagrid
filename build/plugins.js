'use strict';

var webpack = require('webpack')
var env = require('./env')
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = [
  new ExtractTextPlugin('./[name].css', { allChunks: true }),
  //needed to supress vertx warning in es6-promise (Promise polyfill)
  new webpack.IgnorePlugin(/vertx/),
  env.HOT && new webpack.HotModuleReplacementPlugin(),
  new webpack.NoErrorsPlugin()
].filter(function(x){
  return !!x
})
