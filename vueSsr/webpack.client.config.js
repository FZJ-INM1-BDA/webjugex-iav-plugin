const path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const DefinePlugin = require('webpack').DefinePlugin

module.exports = {
  entry: {
    app: path.join(__dirname, './ssr.client.js'),
    analysis: path.join(__dirname, './ssr.analysis.js')
  },
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  resolve: {
    extensions: ['.vue', '.js', '.css']
  },
  output: {
    path: path.join(__dirname, '../deploy/distSsr'),
    filename: 'ssr-[name].js'
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
  plugins: [
    new VueLoaderPlugin(),
    new DefinePlugin({
      HOSTNAME: JSON.stringify(process.env.HOSTNAME || 'http://localhost:3001'),
      VUE_APP_HOSTNAME: JSON.stringify(process.env.VUE_APP_HOSTNAME || 'http://localhost:3001'),
      VUE_APP_PMAP_URL: JSON.stringify(process.env.VUE_APP_PMAP_URL || 'https://pmaps-sk-test-project.apps-dev.hbp.eu'),
      PLUGIN_NAME: JSON.stringify(process.env.PLUGIN_NAME || 'fzj.xg.webjugex-frontend')
  }),
    new VueSSRClientPlugin()
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