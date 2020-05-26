const fs = require('fs')
const path = require('path')
let template

const pathToTemplate = path.join(__dirname, './data/template.ipynb')

fs.readFile(pathToTemplate, 'utf-8', (err, data) => {
  if (err) throw new Error(`reading template error: ${err.toString()}`)
  template = data
})

const getAreas = arr => JSON.stringify(JSON.stringify(arr))
  .replace(/^\"/, '')
  .replace(/\"$/, '')

const getAreasFromStringV2 = value => {
  const arr = JSON.parse(value)
  return arr.map(v => {
    const re = /(^.*?)\s-\s((left|right)\shemisphere)$/.exec(v)
    return re && {
      name: re[1],
      hemisphere: re[2]
    }
  })
} 

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

  const areas1 = getAreasFromStringV2(body['webjugex-analysis-roi1'])
  const areas2 = getAreasFromStringV2(body['webjugex-analysis-roi2'])
  const threshold = Number(body['webjugex-analysis-threshold'])
  const rep = Number(body['webjugex-analysis-permutations'])

  const geneReplace = JSON.stringify(JSON.stringify(JSON.parse(body['webjugex-analysis-genes'])))
    .replace(/^\"/, '')
    .replace(/\"$/, '')

  const area1Replace = getAreas(areas1)
  const area2Replace = getAreas(areas2)
  
  return template
    .replace(/\$AREA1\$/g, area1Replace)
    .replace(/\$AREA2\$/g, area2Replace)
    .replace(/\$GENELIST\$/g, geneReplace)
    .replace(/\$THRESHOLD\$/g, threshold)
    .replace(/\$REPS\$/g, rep)
}

module.exports = {
  getNBFromPostReq
}