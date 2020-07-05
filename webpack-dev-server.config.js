/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

const { NODE_ENV = 'development' } = process.env

const webpackConfig = {
  mode: NODE_ENV,
  entry: {
    bundle: './devServer/index.tsx',
  },
  output: {
    path: path.resolve(__dirname, 'devServer', 'public'),
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
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'babel-loader',
            options: { cacheDirectory: true },
          },
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        ],
      },
    ],
  },
  plugins: [],
  devServer: {
    contentBase: path.join(__dirname, 'devServer', 'public'),
    publicPath: '/',
    compress: true,
    port: 9000,
  },
}

module.exports = webpackConfig
