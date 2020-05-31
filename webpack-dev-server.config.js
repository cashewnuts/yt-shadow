const path = require('path')

const { NODE_ENV = 'development' } = process.env

const webpackConfig = {
  mode: NODE_ENV,
  entry: {
    bundle: './devServer/index.ts',
  },
  output: {
    path: path.resolve(__dirname, 'devServer', 'public'),
    filename: '[name].js',
  },
  resolve: {
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
  plugins: [],
  devServer: {
    contentBase: path.join(__dirname, 'devServer', 'public'),
    publicPath: '/',
    compress: true,
    port: 9000,
  },
}

module.exports = webpackConfig
