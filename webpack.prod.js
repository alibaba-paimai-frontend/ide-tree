const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const targetDir = 'dist';

module.exports = common.map(config => {
  return merge(config, {
    mode: 'production',
    devtool: 'source-map',
    plugins: [
      new HtmlWebpackPlugin({
        title: 'demo 页面',
        // Load a custom template (lodash by default)
        template: 'demo/index.html'
      }),
      new CleanWebpackPlugin(targetDir),
      new UglifyJSPlugin({
        sourceMap: true
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
      })
    ]
  });
});
