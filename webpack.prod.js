const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

const targetDir = 'dist';

const defaultConfig = common.map(config => {
  return merge(config, {
    entry: './src/index.tsx',
    output: {
      filename: 'index.js',
      path: path.resolve(__dirname, 'dist')
    },
    mode: 'production',
    devtool: 'source-map',
    optimization: {
      minimizer: [new TerserPlugin()]
    },
    plugins: [
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
    externals: {
      react: 'react',
      'react-dom': 'react-dom',
      antd: 'antd',
      mobx: 'mobx',
      'mobx-react': 'mobx-react',
      'mobx-state-tree': 'mobx-state-tree',
      'ss-tree': 'ss-tree'
    },
    output: {
      filename: 'index.umd.js',
      path: path.resolve(__dirname, 'dist'),
      libraryTarget: 'umd',
      library: 'ideSchemaTree',
      umdNamedDefine: true
    }
  })
]);
