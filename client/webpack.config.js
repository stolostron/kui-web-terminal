/*
 * Copyright (c) 2020 Red Hat, Inc.
 */
const path = require('path')
const HtmlWebPackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const FontConfigWebpackPlugin = require('font-config-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const requireAll = require('require-all')
const {DefinePlugin} = require('webpack')

const mode = process.env.MODE || 'development'

/**
 * Convenience function that makes a regexp out of a path; this helps with avoiding windows path.sep issues
 */
function thisPath(aPath /* : string */) {
  return new RegExp(aPath.replace(/\//g, '\\' + path.sep))
}

const sassLoaderChain = [
  {
    loader: MiniCssExtractPlugin.loader,
    options: {
      hmr: mode === 'development',
      esModule: true
    }
  },
  'css-loader',
  'sass-loader'
]

const clientBase =  'node_modules/@kui-shell/client'

const clientOptions = requireAll(path.resolve(path.join(clientBase, 'config.d')))
console.log(clientOptions)
clientOptions.style.bodyCss = ['not-electron']

module.exports = {
  optimization: {
    minimize: false,
    namedModules: true,
    namedChunks: true
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        include: thisPath('web/css/static'),
        use: sassLoaderChain
      },
      {
        test: /\.scss$/i,
        use: sassLoaderChain
      },
      {
        test: /\.(ttf|eot)$/i,
        use: 'ignore-loader'
      },
      { test: /\.ico$/, use: 'file-loader' },
      { test: /\.jpg$/, use: 'file-loader' },
      { test: /\.png$/, use: 'file-loader' },
      { test: /\.css$/i, exclude: thisPath('web/css/static'), use: ['style-loader', 'css-loader'] }
    ]
  },
  output: {
    jsonpFunction: 'webpackJsonpFunction3',
    path: path.resolve('./dist/webpack/kui'),
    publicPath: '/kui/'
  },
  node: {
    fs: 'empty',
    // eslint-disable-next-line @typescript-eslint/camelcase
    child_process: 'empty'
  },
  externals: ['net', 'node-pty-prebuilt-multiarch','readline','module','electron'],
  devServer: {
    port: 9080,

    // otherwise, webpack-dev-server spews a gigantic volume of
    // messages to the browser every time it recompiles
    clientLogLevel: 'silent',

    // these are build artifacts, no need to watch for changes therein
    watchOptions: {
      ignored: ['**/*.d.ts', '**/*.js.map', /node_modules/]
    }
  },
  stats: {
    warnings: false
  },
  plugins: [
    new CopyPlugin([
      { from: path.join(clientBase, 'icons'), to: 'icons/' },
      { from: path.join(clientBase, 'images'), to: 'images/' }
    ]),
    new HtmlWebPackPlugin({
      template: './src/index.html.ejs',
      filename: './index.html',
      clientOptions
    }),
    new MiniCssExtractPlugin(),
    new FontConfigWebpackPlugin(),
    new DefinePlugin({
      'process.env.DEBUG': JSON.stringify('*')
    })
  ]
}
