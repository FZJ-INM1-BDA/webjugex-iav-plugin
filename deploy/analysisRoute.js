const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const router = require('express').Router()
const bodyParser = require('body-parser')
const request = require('request')
const { createBundleRenderer } = require('vue-server-renderer')

const OUTPUT_PATH = process.env.OUTPUT_PATH || path.join(__dirname, 'distSsr')

const render = createBundleRenderer(path.join(OUTPUT_PATH, 'vue-ssr-server-bundle.json'))
const jsFile = fs.readFileSync(path.join(OUTPUT_PATH, 'ssr-analysis.js'), 'utf-8')

const HOSTNAME = process.env.HOSTNAME || 'http://localhost:3001'
const PLUGIN_NAME = process.env.PLUGIN_NAME || 'fzj.xg.webjugex'


const getJsFile = (id) => jsFile
  .replace(/fzj-xg-webjugex-placeholder/g, `${PLUGIN_NAME}-${id}`)
  .replace(/fzj-xg-webjugex-tempId/g, id)
/**
 * temporary db?
 */
const cbTokenToIdMap = new Map()
const workspaceMap = new Map()
const map = new Map()
const result = new Map()

const getJson = ({ id }) => {
  return {
    name: `${PLUGIN_NAME}-${id}`,
    displayName: `Analysis Result - ${id}`,
    templateURL: `${HOSTNAME}/analysis/i-v-template/${id}`,
    scriptURL: `${HOSTNAME}/analysis/i-v-script/${id}`
  }
}

router.use(bodyParser.json())

const getWorkSpace = (req = {}) => {
  const { query = {} } = req
  const { workspace = 'public' } = query
  const arr = workspaceMap.get(workspace)
  if (arr) return arr
  workspaceMap.set(workspace, [])
  return workspaceMap.get(workspace)
}

const checkPermission = (req, res, next) => {
  const arr = getWorkSpace(req)
  const { analysisId } = req.params
  if (arr.findIndex(({ id }) => id === analysisId) >= 0) return next()
  else  return res.status(404).send('analysis does not exist on the workspace')
}

const mutateWorkspaceMiddleWare = (req, res, next) => {
  const arr = getWorkSpace(req)
  const { analysisId } = req.params
  if (analysisId) {
    if (req.method === 'PUT') {
      const found = arr.find(({ id }) => id === analysisId)
      if (!found) return res.status(404).end()
      else {
        const { id, ...rest } = req.body
        found = {
          ...found,
          ...rest
        }
        return res.status(202).end()
      }
    }
    if (req.method === 'POST') {
      const found = arr.find(({ id }) => id === analysisId)
      if (!found) arr.push({ id: analysisId })
      else res.status(409).end()
      return next()
    }
    else if (req.method === 'DELETE') {
      const idx = arr.findIndex(({ id }) => id === analysisId)
      if (idx < 0) return res.status(404).send()
      arr.splice(idx, 1)
      return next()
    } else {
      return res.status(405).send()
    }
  } else {
    return res.status(400).send('analysisId is required')
  }
}

router.get('/i-v-manifest/:analysisId', checkPermission, (req, res) => {
  const { analysisId } = req.params
  return res.status(200).json(getJson({ id: analysisId }))
})

/**
 * TODO implement proper user authentication
 */

router.get('/i-v-template/:analysisId', /* checkPermission, */ (req, res) => {
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


/**
 * TODO implement proper user authentication
 */

router.get('/i-v-script/:analysisId',  /* checkPermission, */ (req, res) => {
  const { analysisId } = req.params
  return res.status(200).send(getJsFile(analysisId))
})


router.get('/list', (req, res) => {
  const arr = getWorkSpace(req)
  return res.status(200).json(arr)
})

router.get('/:analysisId', checkPermission, (req, res) => {
  const { analysisId } = req.params
  const item = map.get(analysisId)
  const analysis = result.get(analysisId)
  return item
    ? (res.setHeader('Content-type', 'application/json'), res.status(200).send(JSON.stringify({ ...item, analysis})))
    : res.status(404).send(`analysis with id ${analysisId} not found`)
})

router.post('/analysisCB/:randomToken', (req, res) => {

  /**
   * always return success to avoid 
   */
  res.status(200).send('OK')

  const { randomToken } = req.params
  const { body } = req

  const analysisId = cbTokenToIdMap.get(randomToken)
  if (!analysisId) return
  cbTokenToIdMap.delete(randomToken)
  const flag = map.get(analysisId)
  if (flag) result.set(analysisId, {
    err: null,
    resp: {
      statusCode: 200
    },
    body: JSON.stringify(body)
  })
})

router.post('/:analysisId', mutateWorkspaceMiddleWare, (req, res) => {
  const { analysisId } = req.params
  const { body } = req

  const HOSTNAME = req.app.get('HOSTNAME') || 'http://localhost:3001'
  const randomToken = crypto.randomBytes(64).toString('hex')
  const cbUrl = `${HOSTNAME}/analysis/analysisCB/${randomToken}`
  cbTokenToIdMap.set(randomToken, analysisId)

  const fixedBody = {
    threshold: 0.2,
    mode: false,
    ...body,
    cbUrl
  }
  if (map.get(analysisId))
    return res.status(400).send('analysis already exist')
  map.set(analysisId, fixedBody)
  res.status(200).send()
  
  /**
   * query webjugex backend
   */
  const BACKEND_URL = req.app.get('BACKEND_URL')
  request(`${BACKEND_URL}/jugex_v2`, {
    /**
     * TODO
     * timeout set to 10 mins
     * In future, either use this service to orchastrate jugex execution
     * Or have webJuGEx return polling ID
     * Or provide URL for webJuGEx for CB
     */
    timeout: 10 * 60 * 1000,
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify(fixedBody)
  }, (err, resp, body) => {
    if (err) console.error(`analysis#POST error`, err)
    if (resp.statusCode >= 400) console.error(`analysis#POST statusCode ${resp.statusCode}`, body)
    else console.log(`analysis#POST successful. waiting for reply`)
    /**
     * jugex request sent
     * waiting for cb
     */
  })
})

router.delete('/:analysisId', checkPermission, mutateWorkspaceMiddleWare, (req, res) => {
  const { analysisId } = req.params
  const flag = map.delete(analysisId)
  const flag2 = result.delete(analysisId)
  if (flag)
    return res.status(200).send()
  else
    return res.status(404).send()
})

module.exports = router