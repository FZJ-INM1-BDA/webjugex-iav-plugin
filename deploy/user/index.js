const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const { POST_BODY_TMP_STORE } = require('./constants')
const { SIGNIN_REDIRECT } = require('../const')
const { getNBFromPostReq } = require('./util')
const { saveUserData, WEBJUGEX_DIR_NAME, tempStore } = require('./store')
const { v4: uuidV4 } = require('uuid')
const { URL } = require("url")
const { Branches, RepositoryFiles, Projects } = require("@gitbeaker/node")

const HBP_COLLAB_HOST = process.env.HBP_COLLAB_HOST || `https://lab.ebrains.eu`
const HBP_COLLAB_PATH = process.env.HBP_COLLAB_PATH || '/hub/user-redirect/lab/tree/drive/My%20Libraries/My%20Library/'

const {
  HBP_GITLAB_HOST = "https://gitlab.ebrains.eu",
  HBP_GITLAB_TOKEN,
  HBP_GITLAB_PROJECT_ID,
} = process.env

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

router.get('/login', (req, res) => {
  const { headers } = req
  const { referer } = headers
  const re = /nbId=([a-f0-9-]+)$/.exec(referer)
  const redirect = re && `/user/viewNb?nbId=${re[1]}`
  req.session[SIGNIN_REDIRECT] = redirect
  res.redirect('/hbp-oidc-v2/auth')
})

router.get('/logout', (req, res) => {
  req.logout()

  const { headers } = req
  const { referer } = headers
  const re = /nbId=([a-f0-9-]+)$/.exec(referer)
  const redirect = re && `/user/viewNb?nbId=${re[1]}`

  res.redirect(redirect)
})

const saveNb = async (req, res) => {
  const { user, session, body: _body } = req
  if (!user) return res.status(401).end()

  const body = _body || session[POST_BODY_TMP_STORE]

  if (!body) return res.status(400).send('either body is not defined or session item no longer exists')
  session[POST_BODY_TMP_STORE] = null

  const nb = getNBFromPostReq({ body })
  const id = body['webjugex-analysis-id'] || +(new Date())

  try {
    await saveUserData(user, nb, { filename: `webjugex-${id}.ipynb` })
    
    res.status(200).send(redirectPage.replace(metaSubstitutionString, `<meta http-equiv="refresh" content="60;url=${HBP_COLLAB_HOST}${HBP_COLLAB_PATH}${encodeURIComponent(WEBJUGEX_DIR_NAME)}/${encodeURIComponent(`webjugex-${id}.ipynb`)}" />`))
  } catch (e) {
    res.status(501).send(e.toString())
  }
}

router.get('/viewNb', (req, res) => {
  const { nbId } = req.query
  const { user } = req
  res.render('previewNb', {
    wjTitle: `webJuGEx notebook previewer`,
    wjHead: `webJuGEx - web wrapper for pyJuGEx`,
    wjLead: `notebook preview for ${nbId}`,
    wjNbId: nbId,
    user,
    loggedIn: !!user
  })
})

router.get('/getNb/:nbId', async (req, res) => {
  const { params } = req
  const { nbId } = params
  const nb = tempStore.get(nbId)
  
  if (!nb) return res.status(404).end()

  res.setHeader('Content-type', 'application/octet-stream')
  res.status(200).send(nb)
})

router.post('/postNb/:nbId', bodyParser.urlencoded({ extended: true }), async (req, res) => {
  
  const { params, body, user } = req
  const { nbId } = params
  const { target } = body
  const nb = tempStore.get(nbId)
  
  if (!nb) return res.status(404).end()

  if (target === 'seafile') {
    try {
      await saveUserData(user, nb, { filename: `webjugex-${nbId}.ipynb` })
      res.status(202).end()
    } catch (e) {
      res.status(500).send(e.toString())
    }
    
    return 
  }

  if (target === 'jupyter') {
    if (!user) {
      return res.status(401).send("You need to be authenticated for this operation")
    }
    const filename = "webjugex.ipynb"

    if (!(HBP_GITLAB_HOST && HBP_GITLAB_TOKEN && HBP_GITLAB_PROJECT_ID)) {
      return res.status(405).end()
    }
    const commonConfig = {
      host: HBP_GITLAB_HOST,
      token: HBP_GITLAB_TOKEN,
      version: 4,
    }
    try {
      const projectApi = new Projects(commonConfig)
      const { path_with_namespace: nameSpacedPath } = await projectApi.show(HBP_GITLAB_PROJECT_ID)
      const branchApi = new Branches(commonConfig)
      const branchName = `tmp_${uuidV4().slice(0,6)}`
      await branchApi.create(HBP_GITLAB_PROJECT_ID, branchName, "main")
      const fileApi = new RepositoryFiles(commonConfig)
      await fileApi.create(HBP_GITLAB_PROJECT_ID, filename, branchName, nb, "add file content")
      
      // NB the targetPath is specifically set to random uuid
      // if not randomised, gitpuller will attempt to git fetch rather than git clone, which will result in broken pipeline
      // cluttering user's default cwd is not an issue, since it's wiped after the container is destroyed (24h inactivation)
      const redirectUrl = new URL(`${HBP_COLLAB_HOST}/hub/user-redirect/git-pull`)
      redirectUrl.searchParams.set("repo", `${HBP_GITLAB_HOST.replace(/\/$/, '')}/${nameSpacedPath}.git`)
      redirectUrl.searchParams.set("urlpath", `lab/tree/${branchName}/${filename}`)
      redirectUrl.searchParams.set("branch", branchName)
      redirectUrl.searchParams.set("targetPath", branchName)
      return res.redirect(redirectUrl.toString())
    } catch (e) {
      return res.status(500).send(`Ops, some parts of our service is broken. ${e.toString()}`)
    }
  }

  return res.status(400).send(`target needs to be specified`)
})

router.use('/vendor', express.static(
  path.join(__dirname, 'vendor')
))

router.get('/resume', saveNb)

router.post('/', bodyParser.urlencoded({ extended: true }), (req, res) => {
  const { body, baseUrl } = req
  const nb = getNBFromPostReq({ body })
  const newId = uuidV4()
  tempStore.set(newId, nb)
  res.redirect(`${baseUrl}/viewNb?nbId=${newId}`)
})

router.post('/download', bodyParser.urlencoded({ extended: true }), (req, res) => {
  const { body } = req
  const nb = getNBFromPostReq({ body })
  const date = +(new Date())
  res.setHeader('Content-Disposition', `attachment; filename="webjugex-${date}.ipynb"`)
  res.status(200).send(nb)
})

module.exports = router
