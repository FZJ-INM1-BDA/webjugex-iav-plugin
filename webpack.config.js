const VueLoaderPlugin = require('vue-loader/lib/plugin')
const DefinePlugin = require('webpack').DefinePlugin

module.exports = {
  entry: {
    'standalone': './src/standalone.js',
    'vue-script': './src/vue-script.js'
  },
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  resolve: {
    extensions: ['.vue', '.js', '.css']
  },
  output: {
    filename: '[name].js'
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
      PLUGIN_NAME: JSON.stringify(process.env.PLUGIN_NAME || 'fzj.xg.webjugex-frontend'),
      VUE_APP_HOSTNAME: JSON.stringify(process.env.VUE_APP_HOSTNAME || 'http://localhost:3001'),
    })
  ],
  externals: {
    Vue: 'vue'
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