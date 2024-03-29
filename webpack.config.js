const path = require('path');
const webpack = require('webpack');

module.exports = {
  target: 'electron-main',
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: {
    server: path.join(__dirname, 'server/index.ts'),
    preload: path.join(__dirname, 'server/routes/preload.ts'),
  },
  output: {
    path: path.join(__dirname, 'cache/server'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        // Typescript loader
        test: /\.ts?$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.ts', '.json'],
    alias: {},
  },
  stats: 'minimal',
};