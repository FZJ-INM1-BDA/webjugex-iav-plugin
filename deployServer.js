const express = require('express')
const path = require('path')
const app = express()
const cors = require('cors')

const HOSTNAME = process.env.HOSTNAME || `http://localhost`
const PORT = process.env.PORT || 3000
const PLUGIN_NAME = process.env.PLUGIN_NAME || `fzj.xg.untitled-${Date.now()}`
const PLUGIN_DISPLAY_NAME = process.env.PLUGIN_DISPLAY_NAME || 'Untitled Plugin'

app.use(cors())
app.disable('x-powered-by')

const manifest = {
  name: PLUGIN_NAME,
  displayName: PLUGIN_DISPLAY_NAME,
  templateURL: `${HOSTNAME}/template.html`,
  scriptURL: `${HOSTNAME}/vue-script.js`,
}

app.get('/manifest.json', (req, res) => {
  res.status(200).send(JSON.stringify(manifest))
})

app.use(express.static(path.resolve(__dirname, 'dist')))

app.listen(PORT)