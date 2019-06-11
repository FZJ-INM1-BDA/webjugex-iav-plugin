const fs = require('fs')
const path = require('path')
const router = require('express').Router()
const bodyParser = require('body-parser')
const request = require('request')
const { createBundleRenderer } = require('vue-server-renderer')
const render = createBundleRenderer(path.join(__dirname, 'distSsr/vue-ssr-server-bundle.json'))

const HOSTNAME = process.env.HOSTNAME || 'http://localhost:3000'
const PLUGIN_NAME = process.env.PLUGIN_NAME || 'fzj.xg.webjugex'

const jsFile = fs.readFileSync(path.join(__dirname, 'distSsr/ssr-analysis.js'), 'utf-8')

const getJsFile = (id) => jsFile
  .replace('fzj-xg-webjugex-placeholder', `${PLUGIN_NAME}-${id}`)
  .replace('fzj-xg-webjugex-tempId', id)

/**
 * temporary db?
 */
const map = new Map()
const result = new Map()

const getJson = (id) => {
  return {
    name: `${PLUGIN_NAME}-${id}`,
    displayName: `Analysis Result- ${id}`,
    templateURL: `${HOSTNAME}/analysis/i-v-template/${id}`,
    scriptURL: `${HOSTNAME}/analysis/i-v-script/${id}`,
    state: 'minimised'
  }
}

const defaultId = '001'
const defaultItem = getJson(defaultId)

router.use(bodyParser.json())

router.get('/i-v-manifest/:analysisId', (req, res) => {
  const { analysisId } = req.params
  return res.status(200).json(getJson(analysisId))
})

router.get('/i-v-template/:analysisId', (req, res) => {
  const { analysisId: vueId } = req.params
  render.renderToString({
    analysis: { vueId }
  })
    .then(html => {
      return res.status(200).send(`<div data-query-id="${vueId}" id="${PLUGIN_NAME}-${vueId}">${html}</div>`)
    })
    .catch(e => {
      return res.status(500).send(JSON.stringify(e))
    })
})

router.get('/i-v-script/:analysisId', (req, res) => {
  const { analysisId } = req.params
  return res.status(200).send(getJsFile(analysisId))
})

router.get('/list', (req, res) => {
  return res.status(200).json(Array.from(map.keys()))
})

router.get('/:analysisId', (req, res) => {
  const { analysisId } = req.params
  const item = map.get(analysisId)
  const analysis = result.get(analysisId)
  return item
    ? (res.setHeader('Content-type', 'application/json'), res.status(200).send(JSON.stringify({ ...item, analysis})))
    : res.status(404).send(`analysis with id ${analysisId} not found`)
})

router.put('/:analysisId', (req, res) => {
  const { body } = req
  const fixedBody = {
    ...body,
    threshold: 0.2,
    mode: false
  }
  const { analysisId } = req.params
  if (map.get(analysisId))
    return res.status(400).send('analysis already exist')
  map.set(analysisId, fixedBody)
  res.status(200).send()
  
  /**
   * query webjugex backend
   */
  const BACKEND_URL = req.app.get('BACKEND_URL')
  request(`${BACKEND_URL}/jugex_v2`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify(fixedBody)
  }, (err, resp, body) => {
    const flag = map.has(analysisId)
    if (flag)
      result.set(analysisId, {
        err,
        resp,
        body
      })
  })
})

router.delete('/:analysisId', (req, res) => {
  const { analysisId } = req.params
  const flag = map.delete(analysisId)
  const flag2 = result.delete(analysisId)
  if (flag)
    return res.status(200).send()
  else
    return res.status(404).send()
})

module.exports = router