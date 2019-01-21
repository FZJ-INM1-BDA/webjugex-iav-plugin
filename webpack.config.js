const VueLoaderPlugin = require('vue-loader/lib/plugin')

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
    new VueLoaderPlugin()
  ],
  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    compress: true,
    port: 3002,
    contentBase: './public'
  }
}