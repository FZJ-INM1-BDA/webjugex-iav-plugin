const fs = require('fs')
const path = require('path')
const url = require('url')
let template

const pathToTemplate = path.join(__dirname, './data/template.ipynb')

const DEFAULT_PMAP_URL = `http://pmap-pmap-service.apps-dev.hbp.eu`

fs.readFile(pathToTemplate, 'utf-8', (err, data) => {
  if (err) throw new Error(`reading template error: ${err.toString()}`)
  template = data
})

const getPmapUrl = (u) => {
  if (!u) return DEFAULT_PMAP_URL
  const v = new url.URL(u)
  return `${v.protocol}//${v.hostname}`
}

const getArea = ({ name, hemisphere }) => `
"    {\n",
"      \"name\": \"${name}\",\n",
"      \"hemisphere\": \"${hemisphere}\"\n",
"    }\n"`

const getAreas = arr => `[\n",
${arr.map(getArea).join(',')}
"  ]`

const getAreasFromString = value => value
  .split(', ')
  .map(v => {
    const re = /^(.*?)\s\((left|right)\)$/.exec(v)
    if (!re) return null
    return {
      name: re[1],
      hemisphere: re[2]
    }
  })

const getNBFromPostReq = ({ body }) => {
  if (!body) throw new Error(`#getNBFromPostReq: body must be defined`)

  const keys = [
    'webjugex-analysis-roi1',
    'webjugex-analysis-roi2',
    'webjugex-analysis-genes'
  ]
  
  for (const key of keys){
    if(!body[key]) throw new Error(`body[${key}] needs to be defined`)
  }

  const areas1 = getAreasFromString(body['webjugex-analysis-roi1'])
  const areas2 = getAreasFromString(body['webjugex-analysis-roi2'])

  const geneReplace = JSON.stringify(JSON.parse(body['webjugex-analysis-genes']))
  
  const pmapServiceUrl = DEFAULT_PMAP_URL

  const area1Replace = getAreas(areas1)
  const area2Replace = getAreas(areas2)
  
  return template
    .replace('$$PMAP_SERVICE_URL$$', pmapServiceUrl)
    .replace('$$AREA1$$', area1Replace)
    .replace('$$AREA2$$', area2Replace)
    .replace('$$GENELIST$$', geneReplace)
}

module.exports = {
  getNBFromPostReq
}