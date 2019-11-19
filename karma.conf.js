const webpackConfig = require('./webpack.config')

module.exports = function(config) {

  config.set({
    frameworks: ['mocha'],

    files: ['src/**/*.spec.js'],

    preprocessors: {
      'src/**/*.spec.js': ['webpack', 'sourcemap']
    },

    webpack: webpackConfig,

    reporters: ['spec'],

    browsers: ['Chrome']
  })
}
