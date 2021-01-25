import { parcIdMap } from '../components/constants'

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

export const prepareAnalysisBody = ({ roi1s, roi2s, genes, selectedParcId, ...rest }) => {

  const parc = parcIdMap.get(selectedParcId)
  if (!parc) throw new Error(`parcId ${selectedParcId} not found in parcIdMap`)

  const { version, name, id } = parc

  let errors = []

  const removeNull = (entry) => !!entry

  const getV118RegionObj = regionObj => {
    const match = /^(.+) - (left|right)\shemisphere$/.exec(regionObj.name)
    
    if (!match) return null
    return {
      name: match[1],
      hemisphere: match[2],
      atlas: {
        name, version, id
      }
    }
  }

  const getV24RegionObj = regionObj => {
    return {
      name: regionObj.name,
      hemisphere: regionObj.status === 'left hemisphere'
        ? 'left'
        : regionObj.status === 'right hemisphere'
          ? 'right'
          : null,
      atlas: {
        name, version, id
      }
    }
  }

  const v24Roi1 = roi1s.map(r => getV118RegionObj(r) || getV24RegionObj(r)).filter(removeNull)
  const v24Roi2 = roi2s.map(r => getV118RegionObj(r) || getV24RegionObj(r)).filter(removeNull)

  const { threshold } = rest
      
  const body = {
    id: Date.now().toString(),
    area1: {
      threshold: Number(threshold),
      areas:v24Roi1,
    },
    area2: {
      threshold: Number(threshold),
      areas: v24Roi2,
    },
    selectedGenes: genes,

    ...rest,
  }
  return [
    errors.length === 0 ? null : errors,
    body
  ]
}

