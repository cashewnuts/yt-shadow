const path = require('path')
const WebpackWebExt = require('webpack-webext-plugin')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin')

const { NODE_ENV = 'development', ENABLE_WEBEXT } = process.env

const webpackConfig = {
  mode: NODE_ENV,
  entry: {
    'yt-shadow': './src/yt-shadow.ts',
    'popup/popup': './src/popup.ts',
  },
  output: {
    path: path.resolve(__dirname, 'addon'),
    filename: '[name].js',
  },
  resolve: {
    plugins: [new TsconfigPathsPlugin()],
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: 'ts-loader' },
    ],
  },
  performance: {
    hints: 'error',
    maxEntrypointSize: 1000000,
    maxAssetSize: 1000000,
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from:
            'node_modules/webextension-polyfill/dist/browser-polyfill.min.js',
        },
      ],
    }),
  ],
}

if (NODE_ENV === 'development') {
  webpackConfig.devtool = 'inline-source-map'
  webpackConfig.performance = {
    hints: 'warning',
    maxEntrypointSize: 5000000,
    maxAssetSize: 5000000,
  }
}

if (ENABLE_WEBEXT === 'true') {
  webpackConfig.plugins = [
    ...webpackConfig.plugins,
    new WebpackWebExt({
      runOnce: false,
      argv: ['lint', '-s', 'addon'],
    }),
    new WebpackWebExt({
      runOnce: true,
      maxRetries: 3,
      argv: [
        'run',
        '-s',
        'addon/',
        '--reload',
        '-u',
        'https://www.youtube.com/watch?v=UfWh3OHYbEM',
      ],
    }),
  ]
}

module.exports = webpackConfig
