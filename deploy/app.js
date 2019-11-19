/**
 * This is required somehow... or something breaks (?)
 */
require('tls').DEFAULT_ECDH_CURVE = 'auto'


const express = require('express')
const path = require('path')
const fs = require('fs')
const request = require('request')
const cors = require('cors')
const { createBundleRenderer } = require('vue-server-renderer')

const OUTPUT_PATH = path.join(__dirname, 'distSsr')

const renderer = createBundleRenderer(path.join(OUTPUT_PATH, 'vue-ssr-server-bundle.json'))
const js = fs.readFileSync(path.join(OUTPUT_PATH, 'ssr-app.js'), 'utf-8')

const app = express()
app.use(cors())
app.disable('x-powered-by')


if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const HOSTNAME = process.env.HOSTNAME || `http://localhost:3001`
const PLUGIN_NAME = process.env.PLUGIN_NAME || `fzj.xg.webjugex`
const PLUGIN_DISPLAY_NAME = process.env.PLUGIN_DISPLAY_NAME || 'JuGEx differential gene expression analysis'
const BACKEND_URL= process.env.BACKEND_URL || 'http://localhost:8003'

const manifest = {
  name: PLUGIN_NAME,
  displayName: PLUGIN_DISPLAY_NAME,
  templateURL: `${HOSTNAME}/template.html`,
  scriptURL: `${HOSTNAME}/vue-script.js`,
}

app.set('BACKEND_URL', BACKEND_URL)
app.set('HOSTNAME', HOSTNAME)

app.use('/analysis', require('./analysisRoute'))
app.get('/genelist', (req, res) => {
  request(BACKEND_URL)
    .on('error', (err) => {
      console.log('genelist error', err)
      res.status(500).send()
    })
    .pipe(res)
})

app.get('/manifest.json', (req, res) => {
  res.status(200).json(manifest)
})

app.get('/template.html', (req, res) => {
  renderer.renderToString({ app: true })
    .then(html => {
      res.send(`<div id="fzj-xg-webjugex">${html}</div>`)
    })
    .catch(e => {
      res.status(500).send('Inertial Server Error')
    })
})

app.get("/vue-script.js", (req, res) => {
  res.status(200).send(js)
})

module.exports = app