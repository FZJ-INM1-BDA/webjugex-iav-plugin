/**
 * This is required somehow... or something breaks (?)
 */
require('tls').DEFAULT_ECDH_CURVE = 'auto'


const express = require('express')
const path = require('path')
const fs = require('fs')
const request = require('request')
const cors = require('cors')
const session = require('express-session')
const MemoryStore = require('memorystore')(session)
const setupAuth = require('./auth')
const { createBundleRenderer } = require('vue-server-renderer')
const { POST_BODY_TMP_STORE } = require('./user/constants')

const OUTPUT_PATH = path.join(__dirname, 'distSsr')

const renderer = createBundleRenderer(path.join(OUTPUT_PATH, 'vue-ssr-server-bundle.json'))
const js = fs.readFileSync(path.join(OUTPUT_PATH, 'ssr-app.js'), 'utf-8')

const app = express()
app.use(cors())
app.disable('x-powered-by')

const HOSTNAME = process.env.HOSTNAME || `http://localhost:3001`
const PLUGIN_NAME = process.env.PLUGIN_NAME || `fzj.xg.webjugex`
const PLUGIN_DISPLAY_NAME = process.env.PLUGIN_DISPLAY_NAME || 'JuGEx differential gene expression analysis'
const BACKEND_URL= process.env.BACKEND_URL || 'http://localhost:8003'
const SECRET = process.env.SECRET || 'thisisnotaverygoodsecret' // needed to be set for cookie parser

const manifest = {
  name: PLUGIN_NAME,
  displayName: PLUGIN_DISPLAY_NAME,
  templateURL: `${HOSTNAME}/template.html`,
  scriptURL: `${HOSTNAME}/vue-script.js`,
  desc: 'WebJuGEx is a simple and intuitive graphical user interface for [JuGEx](https://pyjugex.readthedocs.io/) - a workflow for analyzing differential gene expressions in different regions of the JuBrain probabilistic cytoarchitectonic human brain atlas.',
  homepage: 'https://webjugex-iav-plugin.readthedocs.io/',
  authors: `BDA-INM1 <inm1-bda@fz-juelich.de>, Xiaoyun Gui <x.gui@fz-juelich.de>, Daviti Gogshelidze <d.gogshelidze@fz-juelich.de>`
}

const store = new MemoryStore({
  checkPeriod: 1000 * 60 * 60 * 24
})

app.use(session({
  cookie: {
    maxAge: 1000 * 60 * 60 * 24
  },
  resave: false,
  saveUninitialized: true,
  store,
  secret: SECRET
}))

setupAuth(app)
  .then(() => {
    console.log(`auth setup successfully`)
  })
  .catch(e => {
    console.error(`auth setup failed`, e)
    process.exit(1)
  })

app.set('BACKEND_URL', BACKEND_URL)
app.set('HOSTNAME', HOSTNAME)

app.get('/', (req, res) => {
  const { user, session } = req
  if (user && session && session[POST_BODY_TMP_STORE]) return res.redirect('user/resume')
  if (user) res.status(200).send(`authenticated`)
  else res.status(401).send('not authenticated')
})

app.use('/user', require('./user'))
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