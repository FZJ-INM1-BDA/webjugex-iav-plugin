const VueLoaderPlugin = require('vue-loader/lib/plugin')
const DefinePlugin = require('webpack').DefinePlugin

module.exports = {
  entry: './src/main.js',
  resolve: {
    extensions: ['.vue', '.js', '.css']
  },
  output: {
    filename: 'vue-script.js'
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
      VUE_APP_BACKEND_URL: JSON.stringify(process.env.VUE_APP_BACKEND_URL || 'http://localhost:8003'),
      PLUGIN_NAME: JSON.stringify(process.env.PLUGIN_NAME || 'fzj.xg.webjugex-frontend')
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