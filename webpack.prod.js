const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

const targetDir = 'dist';

const defaultConfig = common.map(config => {
  return merge(config, {
    mode: 'production',
    devtool: 'source-map',
    optimization: {
      minimizer: [new TerserPlugin()]
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: 'demo 页面',
        excludeChunks: ['index', 'index.js', 'index.umd.js'],
        // Load a custom template (lodash by default)
        template: 'demo/index.html'
      }),
      new CleanWebpackPlugin(targetDir),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
      })
    ]
  });
});

// 我们输出三份配置
module.exports = defaultConfig.concat([
  merge(defaultConfig[0], {
    entry: './src/index.tsx',
    output: {
      filename: 'index.umd.js',
      path: path.resolve(__dirname, 'dist'),
      libraryTarget: 'umd',
      library: 'IdeTree',
      umdNamedDefine: true
    }
  })
]);
