const path = require('path')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const port = process.env.PORT || 8888

const config = {
  devtool: 'cheap-eval-source-map',
  context: path.join(__dirname, './demo'),
  entry: {
    // vendor: ['react', 'react-dom', 'faker', 'interactjs', 'moment'],
    demo: [
      `webpack-dev-server/client?http://0.0.0.0:${port}`,
      'webpack/hot/only-dev-server',
      './index.ts'
    ]
  },
  output: {
    path: path.join(__dirname, './build'),
    publicPath: '',
    chunkFilename: '[name].bundle.js',
    filename: '[name].bundle.js'
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader',
        options: {
          configFileName: 'tsconfig.json',
        },
      },
      {
        test: /\.scss$|\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: { sourceMap: true },
          },
          'resolve-url-loader',
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              sassOptions: {
                outputStyle: 'compressed',
              },
            },
          },
        ],
      }
    ]
  },
  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ['.ts', '.tsx', '.js', '.json', '.scss', '.map'],
    plugins: [new TsconfigPathsPlugin({ configFile: './tsconfig.json' })],
  },
  // resolve: {
  //   extensions: ['.js', '.jsx'],
  //   modules: [path.resolve('./demo'), 'node_modules'],
  //   alias: {
  //     '~': path.join(__dirname, './demo'),
  //     'react-calendar-timeline': path.join(__dirname, './src'),
  //     'react-calendar-timeline-css': path.join(
  //       __dirname,
  //       './src/lib/Timeline.scss'
  //     )
  //   }
  // },
  devServer: {
    contentBase: './demo',
    port
  }
}

module.exports = config
