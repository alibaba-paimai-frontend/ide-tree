const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');
// const { getExternal } = require('./webpack-helper');

const targetDir = 'dist';

const externals = {
  react: {
    commonjs: 'react',
    commonjs2: 'react',
    amd: 'react',
    root: 'React'
  },
  'react-dom': {
    commonjs: 'react-dom',
    commonjs2: 'react-dom',
    amd: 'react-dom',
    root: 'ReactDOM'
  },
  antd: 'antd',
  mobx: 'mobx',
  'mobx-react': {
    commonjs: 'mobx-react',
    commonjs2: 'mobx-react',
    amd: 'mobx-react',
    root: 'mobxReact'
  },
  'mobx-state-tree': {
    commonjs: 'mobx-state-tree',
    commonjs2: 'mobx-state-tree',
    amd: 'mobx-state-tree',
    root: 'mobxStateTree'
  },
  'ss-tree': {
    commonjs: 'ss-tree',
    commonjs2: 'ss-tree',
    amd: 'ss-tree',
    root: 'ssTree'
  },
  'styled-components': {
    commonjs: 'styled-components',
    commonjs2: 'styled-components',
    amd: 'styled-components',
    root: 'styled'
  }
};

const defaultConfig = common.map(config => {
  /* 这份配置是用于引入到浏览器中时候用的
     比如 https://unpkg.com/ide-context-menu@0.1.1/dist/index.umd.js
  */
  return merge(config, {
    entry: './src/index.tsx',
    externals: externals,
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
    ],
    output: {
      filename: 'index.umd.js',
      libraryTarget: 'umd',
      library: 'ideContextMenu',
      path: path.resolve(__dirname, 'dist'),
      umdNamedDefine: true
    }
  });
});

/* 这份配置 package.json 中的 browser 配置
     主要是 `externals` 上的差别
// browser 的时候中每个 externals 不能用 map 后的变量值
  */
module.exports = defaultConfig.concat([
  merge(defaultConfig[0], {
    externals: externals,
    output: {
      filename: 'index.browser.js',
      libraryTarget: 'umd',
      library: 'ideContextMenu',
      path: path.resolve(__dirname, 'dist'),
      umdNamedDefine: true
    }
  })
]);
