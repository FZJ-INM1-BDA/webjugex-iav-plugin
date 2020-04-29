const { Seafile } = require('hbp-seafile')
const { Readable } = require('stream')

const WEBJUGEX_DIR_NAME = `webjugex`
const WEBJUGEX_DIRECTORY = `/${WEBJUGEX_DIR_NAME}/`
const WEBJUGEX_FILENAME = 'data.json'

const getNewSeafilehandle = async ({ accessToken }) => {
  const seafileHandle = new Seafile({ accessToken })
  await seafileHandle.init()
  return seafileHandle
}

const saveUserData = async (user, dataString, { filename }) => {
  const { access_token } = user && user.tokenset || {}
  if (!access_token) throw new Error(`user or user.tokenset not set can only save logged in user data`)

  let handle = await getNewSeafilehandle({ accessToken: access_token })

  const s = await handle.ls()
  const found = s.find(({ type, name }) => type === 'dir' && name === WEBJUGEX_DIR_NAME)

  // if dir exists, check permission. throw if no writable or readable permission
  if (found && !/w/.test(found.permission) && !/r/.test(found.permission)){
    throw new Error(`Writing to file not permitted. Current permission: ${found.permission}`)
  }

  // create new dir if does not exist. Should have rw permission
  if (!found) {
    await handle.mkdir({ dir: WEBJUGEX_DIR_NAME })
  }

  const rStream = new Readable()
  rStream.path = filename
  rStream.push(dataString)
  rStream.push(null)
  return handle.uploadFile({ readStream: rStream, filename: filename }, { dir: WEBJUGEX_DIRECTORY })
}

const readUserData = async (user) => {
  const { access_token } = user && user.tokenset || {}
  if (!access_token) throw new Error(`user or user.tokenset not set can only save logged in user data`)

  let handle = await getNewSeafilehandle({ accessToken: access_token })
  try {
    const r = await handle.readFile({ dir: `${WEBJUGEX_DIRECTORY}${WEBJUGEX_FILENAME}` })
    return JSON.parse(r)
  }catch(e){
    return {}
  }
}

module.exports = {
  saveUserData,
  readUserData,
  WEBJUGEX_DIR_NAME
}
