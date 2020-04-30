const router = require('express').Router()
const bodyParser = require('body-parser')
const { POST_BODY_TMP_STORE } = require('./constants')
const { getNBFromPostReq } = require('./util')
const { saveUserData, WEBJUGEX_DIR_NAME } = require('./store')

const HBP_COLLAB_HOST = process.env.HBP_COLLAB_HOST || `https://lab.ebrains.eu`
const HBP_COLLAB_PATH = process.env.HBP_COLLAB_PATH || '/hub/user-redirect/lab/tree/drive/My%20Libraries/My%20Library/'

const fs = require('fs')
const path = require('path')

const pathToRedirectHTML = path.join(__dirname, 'data/redirect.html')
const redirectPage = fs.readFileSync(pathToRedirectHTML, 'utf-8')
const metaSubstitutionString = `<!-- METAREDIRECT -->`

const authMiddleware = (req, res, next) => {
  if (req.user) return next()
  req.session[POST_BODY_TMP_STORE] = req.body
  return res.redirect('hbp-oidc-v2/auth')
}

router.get('/', (req, res) => {
  res.status(200).end()
})

const saveNb = async (req, res) => {
  const { user, session, body: _body } = req
  if (!user) return res.status(401).end()

  const body = (_body && _body['webjugex-analysis-id'] && _body) || session[POST_BODY_TMP_STORE]

  if (!body) return res.status(400).send('either body is not defined or session item no longer exists')
  session[POST_BODY_TMP_STORE] = null

  const nb = getNBFromPostReq({ body })
  const id = body['webjugex-analysis-id']

  try {
    await saveUserData(user, nb, { filename: `webjugex-${id}.ipynb` })
    
    res.status(200).send(redirectPage.replace(metaSubstitutionString, `<meta http-equiv="refresh" content="60;url=${HBP_COLLAB_HOST}${HBP_COLLAB_PATH}${encodeURIComponent(WEBJUGEX_DIR_NAME)}/${encodeURIComponent(`webjugex-${id}.ipynb`)}" />`))
  } catch (e) {
    res.status(501).send(e.toString())
  }
}

router.get('/resume', saveNb)

router.post('/', bodyParser.urlencoded({ extended: true }), authMiddleware, saveNb)

router.post('/download', bodyParser.urlencoded({ extended: true }), (req, res) => {
  const { body } = req
  const nb = getNBFromPostReq({ body })
  const date = new Date().toString()
  res.setHeader('Content-Disposition', `attachment; filename="webjugex-${date}.ipynb"`)
  res.status(200).send(nb)
})

module.exports = router
