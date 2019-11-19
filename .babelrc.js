module.exports = {
  presets: ["@babel/preset-env"],
  plugins:[
    ["transform-define", {
      VUE_APP_HOSTNAME: process.env.VUE_APP_HOSTNAME || 'http://localhost:3001'
    }]
  ]
}