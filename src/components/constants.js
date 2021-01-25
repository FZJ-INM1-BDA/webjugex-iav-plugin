export const WORKSPACE_STRING = `fzj-xg-webjugex:workspace`

export const allowedParcellationName = [
  `JuBrain Cytoarchitectonic Atlas`
]

export const allowedTemplateSpaces = [
  `MNI 152 ICBM 2009c Nonlinear Asymmetric`
]

export const parcIdMap = new Map([
  ['juelich/iav/atlas/v1.0.0/8', {
    ['@id']: 'juelich/iav/atlas/v1.0.0/8',
    id: 'juelich/iav/atlas/v1.0.0/8',
    name: 'Julich Brain',
    version: 'v1.18'
  }],
  ['minds/core/parcellationatlas/v1.0.0/94c1125b-b87e-45e4-901c-00daee7f2579-25', {
    ['@id']: 'minds/core/parcellationatlas/v1.0.0/94c1125b-b87e-45e4-901c-00daee7f2579-25',
    id: 'minds/core/parcellationatlas/v1.0.0/94c1125b-b87e-45e4-901c-00daee7f2579-25',
    name: "Julich Brain",
    version: 'v2.4'
  }]
])

export const allowedTmplSpcIds = [
  'minds/core/referencespace/v1.0.0/dafcffc5-4826-4bf1-8ff6-46b8a31ff8e2'
]

export const baseUrl = VUE_APP_HOSTNAME || `${window.location.origin}${window.location.pathname}`