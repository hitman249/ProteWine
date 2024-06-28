const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  target: 'electron-main',
  plugins: [
    new CopyPlugin({
      patterns: [{
        from: 'icons/512.png',
        to: 'icons/512.png',
      }]
    }),
  ],

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