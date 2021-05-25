/*
 * Copyright (c) 2020 Red Hat, Inc.
 * Copyright Contributors to the Open Cluster Management project
 */
const path = require('path')
const HtmlWebPackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const FontConfigWebpackPlugin = require('font-config-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const requireAll = require('require-all')
const {DefinePlugin, ProvidePlugin} = require('webpack')

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
    // for webpack 4
    // namedModules: true,
    // for webpack 5
    moduleIds: 'named',
    // for webpack 4
    // namedChunks: true
    // for webpack 5
    chunkIds: 'named'
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
      { test: /\.png$/, use: 'url-loader' },
      { test: /\.md$/, use: 'asset/source' },
      { test: /\.css$/i, exclude: thisPath('web/css/static'), use: ['style-loader', 'css-loader'] }
    ]
  },
  output: {
    // For webpack 4.  In webpack 5 it uses a unique name from package.json name field
    // jsonpFunction: 'webpackJsonpFunction3',
    path: path.resolve('./dist/webpack/kui'),
    publicPath: '/kui/'
  },
  // For webpack 4
  // node: {
    // fs: 'empty',
    // eslint-disable-next-line @typescript-eslint/camelcase
    // child_process: 'empty'
  // },
  // For webpack 5 (instead of node.* above)
  resolve: {
    fallback: {
      fs: false,
      child_process: false,
      assert: require.resolve('assert'),
      constants: require.resolve('constants-browserify'),
      crypto: require.resolve('crypto-browserify'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      os: require.resolve('os-browserify/browser'),
      path: require.resolve('path-browserify'),
      stream: require.resolve('stream-browserify'),
      util: require.resolve('util'),
      zlib: require.resolve('browserify-zlib')
    }
  },
  // externals: ['net', 'node-pty-prebuilt-multiarch','readline','module','electron', 'yargs', {'yargs-parser': 'commonjs2 yargs-parser'}],
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
    }),
    new ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: require.resolve('./process.js')
    })
  ]
}
