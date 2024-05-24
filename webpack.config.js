const path = require('path')
const webpack = require('webpack')
const FilemanagerPlugin = require('filemanager-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const ExtReloader = require('webpack-ext-reloader-mv3')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const WextManifestWebpackPlugin = require('wext-manifest-webpack-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')

const viewsPath = path.join(__dirname, 'views')
const sourcePath = path.join(__dirname, 'src')
const destPath = path.join(__dirname, 'extension')
const nodeEnv = process.env.NODE_ENV || 'development'
const targetBrowser = process.env.TARGET_BROWSER

const BrowserExtensionFileTypes = new Map([
  ['opera', 'crx'],
  ['firefox', 'xpi'],
  ['chrome', 'zip'],
])

function getReloaderPlugin() {
  if (nodeEnv !== 'development') {
    return () => { this.apply = () => {} }
  }

  const options = {
    port: 9090, // Which port use to create the server
    reloadPage: true, // Force the reload of the page also
    entries: { // TODO: reload manifest on update
      contentScript: 'js/contentScript.bundle.js',
      background: 'js/background.bundle.js',
      extensionPage: ['popup', 'options'],
    }
  }

  return new ExtReloader(options)
}

module.exports = {
  devtool: false,
  stats: {
    all: false,
    builtAt: true,
    errors: true,
    hash: true,
  },
  mode: nodeEnv,
  entry: {
    manifest: path.join(sourcePath, 'manifest.json'),
    background: path.join(sourcePath, 'Background', 'index.ts'),
    contentScript: path.join(sourcePath, 'ContentScript', 'index.ts'),
    popup: path.join(sourcePath, 'Popup', 'index.tsx'),
    options: path.join(sourcePath, 'Options', 'index.tsx'),
  },
  output: {
    path: path.join(destPath, targetBrowser),
    filename: 'js/[name].bundle.js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
    alias: {
      'webextension-polyfill': path.resolve(__dirname, 'node_modules/webextension-polyfill'),
      'lib': path.resolve(__dirname, 'lib'),
    },
  },
  module: {
    rules: [
      {
        type: 'javascript/auto', // prevent webpack handling json with its own loaders,
        test: /manifest\.json$/,
        use: {
          loader: 'wext-manifest-loader',
          options: {
            usePackageJSONVersion: true, // set to false to not use package.json version for manifest
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.(js|ts)x?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader, // It creates a CSS file per JS file which contains CSS
          },
          {
            loader: 'css-loader', // Takes the CSS files and returns the CSS with imports and url(...) for Webpack
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [['autoprefixer', {}]],
              },
            },
          },
          'resolve-url-loader', // Rewrites relative paths in url() statements
          'sass-loader', // Takes the Sass/SCSS file and compiles to the CSS
        ],
      },
    ],
  },
  plugins: [
    // Plugin to not generate js bundle for manifest entry
    // new WextManifestWebpackPlugin(),
    // Generate sourcemaps
    new webpack.SourceMapDevToolPlugin({filename: false}),
    new ForkTsCheckerWebpackPlugin({}),
    // environmental variables
    new webpack.EnvironmentPlugin(['NODE_ENV', 'TARGET_BROWSER']),
    // delete previous build files
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [
        path.join(process.cwd(), `extension/${targetBrowser}`),
        path.join(
          process.cwd(),
          `extension/${targetBrowser}.${BrowserExtensionFileTypes.get(targetBrowser)}`
        ),
      ],
      cleanStaleWebpackAssets: false,
      verbose: true,
    }),
    new HtmlWebpackPlugin({
      template: path.join(viewsPath, 'popup.html'),
      inject: 'body',
      chunks: ['popup'],
      hash: true,
      filename: 'popup.html',
    }),
    new HtmlWebpackPlugin({
      template: path.join(viewsPath, 'options.html'),
      inject: 'body',
      chunks: ['options'],
      hash: true,
      filename: 'options.html',
    }),
    // load browser polyfill
    new CopyWebpackPlugin({
      patterns: [{
        from: 'node_modules/webextension-polyfill/dist/browser-polyfill.js',
      }],
    }),
    // write css file(s) to build folder
    new MiniCssExtractPlugin({filename: 'css/[name].css'}),
    // copy static assets
    new CopyWebpackPlugin({
      patterns: [{from: 'src/assets', to: 'assets'}],
    }),
    // plugin to enable browser reloading in development mode
    getReloaderPlugin()
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
      new OptimizeCSSAssetsPlugin({
        cssProcessorPluginOptions: {
          preset: ['default', {discardComments: {removeAll: true}}],
        },
      }),
      new FilemanagerPlugin({
        events: {
          onEnd: {
            archive: [
              {
                format: 'zip',
                source: path.join(destPath, targetBrowser),
                destination: `${path.join(destPath, targetBrowser)}.${BrowserExtensionFileTypes.get(targetBrowser)}`,
                options: {zlib: {level: 6}},
              },
            ],
          },
        },
      }),
    ],
  }
}
