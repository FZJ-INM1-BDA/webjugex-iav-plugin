import { hardcode } from '../components/constants'

export const sanitizeAreaName = (name) => name
  // remove synonym e.g. Area TE 1.1 (HESCHL) => Area TE 1.1
  .replace(/\s\(.*?\)$/,'')
  // replace whitespaces with dashes e.g. Area TE 1.1 => Area-TE-1.1
  .replace(/\s/g, '-')
  // remove all dots e.g. Area-TE-1.1 => Area-TE-11
  .replace(/\./, '')

export const readFile = file => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = (evt) => {
    const result = evt && evt.target && evt.target.result
    if (result) {
      resolve(result)
    } else {
      reject('result undefined')
    }
  }
  reader.onerror = reject
  reader.readAsText(file)
})

export const validateGetError = ({ roi1s, roi2s, genes }) => {

  if(roi1s.length > 0 && roi2s.length > 0 && genes.length > 0){
    return []
  }
  const warning = []
  if(roi1s.length === 0){
    warning.push('roi1')
  }
  if(roi2s.length === 0){
    warning.push('roi2')
  }
  if(genes.length <= 0){
    warning.push('selectedgenes')
  }
  return warning
}

export const prepareAnalysisBody = ({ roi1s, roi2s, genes, ...rest }) => {

  const PMAP_URL = (VUE_APP_PMAP_URL || 'https://pmaps-sk-test-project.apps-dev.hbp.eu') + '/multimerge'
      
  let errors = []

  /**
   * bandaid for JuBrain v18
   */
  const getRoi = (name) => {
    const match = /^(.*?)\s\(.*?\s(left|right)\shemisphere$/.exec(name)
    return (match && [ match[1], match[2] ]) || (errors.push(`Cannot getRoi for ${name}`), null)
  }

  const removeNull = (entry) => !!entry

  const getActualAreaName = ([name, hemisphere]) => {
    // in order to prevent PF to match PFm
    const regexString = name.replace(/\s/g, '-') + '_pub'
    const regex = new RegExp(regexString, 'i')
    const foundEntry = hardcode.find(entry => regex.test(entry))
    if (foundEntry) {
      return {
        name: foundEntry
          .replace('https://object.cscs.ch/v1/AUTH_227176556f3c4bb38df9feea4b91200c/hbp-d000001_jubrain-cytoatlas-', '')
          .replace('_pub', ''),
        hemisphere
      }
    } else {
      errors.push(`Cannot getActualAreanName for ${name} ${hemisphere}`)
      return null
    }
  }
  const v18Roi1 = roi1s
    .map(getRoi)
    .filter(removeNull)
    .map(getActualAreaName)
    .filter(removeNull)

  const v18Roi2 = roi2s
    .map(getRoi)
    .filter(removeNull)
    .map(getActualAreaName)
    .filter(removeNull)

  const { threshold } = rest
      
  const body = {
    id: Date.now().toString(),
    area1: {
      name: roi1s.join('-'),
      PMapURL: PMAP_URL || null,
      body: {
        areas:v18Roi1,
        threshold: Number(threshold)
      }
    },
    area2: {
      name: roi2s.join('-'),
      PMapURL: PMAP_URL || null,
      body: {
        areas:v18Roi2,
        threshold: Number(threshold)
      }
    },
    selectedGenes: genes,

    ...rest,
  }
  return [
    errors.length === 0 ? null : errors,
    body
  ]
}

