const path = require('path');

const commontConfig = {
  entry: {
    index: './src/index.tsx',
    demo: './demo/demo.tsx'
  },
  node: {
    fs: 'empty'
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    antd: 'antd',
    mobx: 'mobx',
    'mobx-react': 'mobxReact',
    'mobx-state-tree': 'mobxStateTree',
    'ss-tree': 'ssTree'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader',

        exclude: /node_modules/
      },
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          { loader: 'css-loader', options: { importLoaders: 1 } }
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  }
};

const normalConfig = Object.assign({}, commontConfig, {
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  }
});

module.exports = [normalConfig];
