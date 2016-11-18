const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');


module.exports = {
  entry: {
    'main': './index.jsx'
  },
  output: {
    // Absolute output directory
    path: path.join(__dirname, '/public/static/build/'),
    // Filename for entry points
    // Only adds hash in build mode
    filename: '[name].bundle.js',
    // Output path from the view of the page
    // Uses webpack-dev-server in development
    publicPath: 'static/build',
    // publicPath: path.join(__dirname, 'static/build/'),
    // publicPath: isProd ? '/' : 'http://localhost:8080/',
    // Filename for non-entry points
    // Only adds hash in build mode
    chunkFilename: '[name].bundle.js'
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: 'style!css' },
      {
        test: /\.styl$/,
        exclude: /node_modules/,
        loader: 'style-loader!css-loader!autoprefixer!stylus-loader'
      },
      { test: /\.(sass)/, loader: 'style!css!resolve-url!sass?sourceMap' },
      {
        test: /\.scss$/,
        loader: 'style!css?modules&sourceMap&localIdentName=[local]___[hash:base64:5]!resolve-url!sass?outputStyle=expanded&sourceMap'
      },
      { test: /\.gif$/, loader: 'url?limit=16000&mimetype=image/gif' },
      { test: /\.jpg$/, loader: 'url?limit=16000&mimetype=image/jpg' },
      { test: /\.png$/, loader: 'url?limit=16000&mimetype=image/png' },
      { test: /\.svg/, loader: 'url?limit=50000&mimetype=image/svg+xml' },
      { test: /\.(woff|woff2|ttf|eot)/, loader: 'url?limit=1' },
      // { test: /\.jsx$/, loader: 'react-hot!babel', exclude: [/node_modules/, /public/] },
      {
        test: /\.(jsx|js)$/,
        loaders: ['react-hot', 'babel'],
        exclude: [/public/],
        include: [
          path.resolve(__dirname, "app"),
          path.resolve(__dirname, "node_modules/react-datagrid/src"),
          path.resolve(__dirname, "node_modules/react-datagrid/lib"),
          path.resolve(__dirname, "node_modules/react-toolbox/lib"),
        ],
      },

      { test: /\.json$/, loader: 'json' }
    ]
  },
  resolve: {
    modulesDirectories: [
      path.join(__dirname, 'node_modules'),
      // path.resolve(__dirname, "node_modules"),
    ],
    extensions: ['', '.js', '.jsx']
  },
  postcss: [autoprefixer],
  // sassLoader: {
  //     data: '@import "assets/theme/_config.scss";',
  //     includePaths: [
  //         path.resolve(__dirname, 'app'),
  //         path.resolve(__dirname, 'app/assets/styles'),
  //         path.resolve(__dirname, 'node_modules/react-toolbox/lib')
  //     ]
  // },

  plugins: [
    new ExtractTextPlugin('./[name].css', { allChunks: true }),
    //needed to supress vertx warning in es6-promise (Promise polyfill)
    new webpack.IgnorePlugin(/vertx/),
    env.HOT && new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    // new webpack.HotModuleReplacementPlugin(),
    new ExtractTextPlugin('bundle.css', { allChunks: true }),
    new HtmlWebpackPlugin({
      filename: '../../index.html',
      template: 'app/index.html'
    }),
    new webpack.ProvidePlugin({
      'React': 'react'
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    }),
    // new webpack.optimize.CommonsChunkPlugin({
    //     name: 'vendor',
    //     filename: 'vendor.bundle.js',
    //     minChunks: Infinity
    // }),
    // https://webpack.github.io/docs/list-of-plugins.html#2-explicit-vendor-chunk
    // new webpack.optimize.CommonsChunkPlugin({
    //
    // 	// This name 'vendor' ties into the entry definition
    // 	name: 'vendor',
    //
    // 	// We don't want the default vendor.js name
    // 	filename: 'vendor-bundle.js',
    //
    // 	// Passing Infinity just creates the commons chunk, but moves no modules into it.
    // 	// In other words, we only put what's in the vendor entry definition in vendor-bundle.js
    // 	minChunks: Infinity,
    // }),
  ],
  eslint: {
    configFile: '.eslintrc'
  },
  // /**
  //  * PostCSS
  //  * Reference: https://github.com/postcss/autoprefixer-core
  //  * Add vendor prefixes to your css
  //  */
  // postcss: [
  // 	autoprefixer({
  // 		browsers: [ 'last 2 version' ]
  // 	})
  // ]
};
