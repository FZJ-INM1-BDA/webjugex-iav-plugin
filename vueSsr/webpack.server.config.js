const path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
const DefinePlugin = require('webpack').DefinePlugin

module.exports = {
  entry: path.join(__dirname, './ssr.server.js'),
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  resolve: {
    extensions: ['.vue', '.js', '.css']
  },
  output: {
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '../deploy/distSsr'),
    filename: 'ssr-server.js'
  },
  module: {
    rules: [{
      test: /\.vue$/,
      use: 'vue-loader'
    },{
      test: /\.js$/,
      use: 'babel-loader'
    },{
      test: /\.css$/,
      use: ['vue-style-loader', 'css-loader']
    }]
  },
  target: 'node',
  plugins: [
    new VueLoaderPlugin(),
    new DefinePlugin({
      HOSTNAME: JSON.stringify(process.env.HOSTNAME || 'http://localhost:3001'),
      VUE_APP_HOSTNAME: JSON.stringify(process.env.VUE_APP_HOSTNAME || 'http://localhost:3001'),
      PLUGIN_NAME: JSON.stringify(process.env.PLUGIN_NAME || 'fzj.xg.webjugex-frontend')
    }),
    new VueSSRServerPlugin()
  ],
  externals: {
    whitelist: /.css$/
  },
  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    compress: true,
    port: 3002,
    contentBase: './public'
  }
}