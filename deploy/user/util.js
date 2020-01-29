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
  const threshold = Number(body['webjugex-analysis-threshold'])
  const rep = Number(body['webjugex-analysis-permutations'])

  const geneReplace = JSON.stringify(JSON.stringify(JSON.parse(body['webjugex-analysis-genes'])))
    .replace(/^\"/, '')
    .replace(/\"$/, '')

  const area1Replace = getAreas(areas1)
  const area2Replace = getAreas(areas2)
  
  return template
    .replace('$AREA1$', area1Replace)
    .replace('$AREA2$', area2Replace)
    .replace('$GENELIST$', geneReplace)
    .replace('$THRESHOLD$', threshold)
    .replace('$REPS$', rep)
}

module.exports = {
  getNBFromPostReq
}