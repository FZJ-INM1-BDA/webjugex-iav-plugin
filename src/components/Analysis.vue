<template>
  <div>

    <!-- results container -->
    <div class="mt-2" v-if="!error">

      <!-- if complete show result -->
      <div v-if="analysisComplete">
        <div class="input-group f-flex align-items-center">
          <span class="input-group-prepend p-2">
            Display probe locations
          </span>
          <check-box v-model="displayProbeLocation"
            :flag = "displayProbeLocation"
            @togglecheckbox="toggleDisplayProbeLocation()"/>
        </div>

        <div class=" pt-1">
          <div class="w-100 d-flex justify-content-center">Download</div>
          <div class="btn-group btn-block">
            <div class="btn btn-default">
              <a download="pval.tsv"
                v-if="pvalUrl"
                @mouseenter="showPreviewPValData=true"
                @mouseleave="showPreviewPValData=false"
                class="position-relative"
                :href="pvalUrl">
                <span>
                  p values
                </span>
                <div v-if="showPreviewPValData"
                  class="position-absolute tsv-preview-container">
                  <PreviewTsv class="tsv-preview" :tsv="pvaldata"/>
                </div>
              </a>
            </div>
            <div class="btn btn-default">
              <a download="coord.tsv"
                v-if="coordUrl"
                @mouseenter="showPreviewCoordData=true"
                @mouseleave="showPreviewCoordData=false"
                class="position-relative"
                :href="coordUrl">
                <span>
                  probe locations
                </span>
                <div v-if="showPreviewCoordData"
                  class="position-absolute tsv-preview-container">
                  <PreviewTsv class="tsv-preview" :tsv="coorddata"/>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- if not complete, show spinner. introduce percentage in the turue -->
      <div v-else>
        <span>analysis in progress</span>
        <div class="spinner">&bull;</div>
      </div>
    </div>

    <!-- showing if there is an error -->
    <div v-else>
      Error: {{ error }}
    </div>
  </div>
</template>
<script>
const POLLING_INTERVAL = 3000
const DELIMITER = `\t`
const escapeDelimiter = s => s
const svTmpl = (strings, ...keys) => keys.map(k => escapeDelimiter(k)).join(DELIMITER)
import { workspaceMixin } from './mixin'
import PreviewTsv from './previewTsv'
import { CheckBox } from 'vue-components'
import { baseUrl } from './constants'

const NO_RESULTS_YET = 'no results yet'


const getRoiArray = ({ PMapURL, body = {}, name } = {}) => {
  const { areas = [], threshold } = body
  return areas.map(({ name, hemisphere } = {}) => `${name} (${hemisphere})`)
}

const getGeneNames = (tsv) => tsv
  .split('\n')[0]
  .split('\t')
  .slice(4)

const getCoord = (tsv) => tsv
  .split('\n')
  .slice(1)
  .map(v => {
    const [name, x, y, z, ...rest] = v.split('\t')
    return {
      name,
      coord: [x, y, z],
      rest
    }
  })

  function parseFetchedData(json) {

    const parseAreaToFile = arr => arr.map(({ name, hemisphere, probes }) => 
      probes.map(({ position, probe_properties }) => 
        svTmpl([],
          `${name}${hemisphere ? (': ' + hemisphere) : ''}`,
          ...position,
          ...Object.keys(probe_properties).map(probP => probe_properties[probP])
        )
      ).join('\n')
    ).join('\n')

    const parsePvalToFile = (json) => {
      return Object.keys(json).map(key => svTmpl`${key}${json[key]}`).join('\n')
    }

    const { result, Areas } = json
    
    const stringCoordFile = parseAreaToFile(Areas)
    const stringPvalFile = parsePvalToFile(result)
    const stringTitledCoordFile = svTmpl([],
      'Area name',
      'x',
      'y',
      'z',
      ...Object.keys(Areas[0].probes[0].probe_properties)
    ).concat('\n', stringCoordFile)
    
    return {
      pval : stringPvalFile,
      coord : stringTitledCoordFile
    }
  }

export default {
  components: {
    PreviewTsv,
    CheckBox,
  },
  props: {
    vueId: null,
    data: {
      type: Object,
      default: null
    },
  },
  mixins:[
    workspaceMixin
  ],
  watch: {
    vueId: function (vueId) {

      // if coord is showing, destory it first
      if (this.displayProbeLocation) this.toggleDisplayProbeLocation()
      Object.assign(this.$data, this.$options.data.call(this))

      this.getDataRunner()
      this.vueId = vueId
    },
  },
  data: function () {
    return {
      showPreviewPValData: false,
      showPreviewCoordData: false,

      showBody: false,
      analysisComplete: false,
      error: null,
      completionTime: null,

      /**
       * download data
       */
      pvaldata: null,
      pvalUrl: null,
      coorddata: null,
      coordUrl: null,

      /**
       * polling
       */
      intervalId: null,
      // vueId: null,

      /**
       * expmt param
       */
      roi1: null,
      roi2: null,
      genes: [],
      ignoreCustomProbe: null,
      singleProbeMode: null,
      nPermutations: null,
      threshold: null,

      /**
       * showing landmark(s)
       */
      coordShown: false,
      shownLandmarks: [],

      displayProbeLocation: null
    }
  },
  computed: {
    completionTimeString: function () {
      return this.completionTime
        ? this.completionTime
        : `Not yet complete`
    }
  },
  methods: {
    fetching: function () {
      return fetch(`${baseUrl}/analysis/${this.vueId}${this.workspaceMixin__queryParam || ''}`)
        .then(res => {
          if (res.status >= 400) {
            return Promise.reject(res.status)
          } else {
            return res
          }
        })
        .then(res => res.json())
        .then(json => {
          const { analysis, ignoreCustomProbe,nPermutations,singleProbeMode, mode,threshold, selectedGenes, area1, area2, ...rest } = json

          this.ignoreCustomProbe = ignoreCustomProbe
          this.singleProbeMode = singleProbeMode
          this.selectedGenes = selectedGenes
          this.nPermutations = nPermutations
          this.threshold = threshold

          this.roi1 = getRoiArray(area1)
          this.roi2 = getRoiArray(area2)
          this.genes = selectedGenes

          if (analysis) {
            clearInterval(this.intervalId)
            const { body, resp, err } = analysis
            const { statusCode } = resp
            if (!!err) {
              return Promise.reject(err)
            }
            return Promise.resolve(JSON.parse(body))
          } else {
            return Promise.reject(NO_RESULTS_YET)
          }
        })
    },
    getDataRunner: function() {
      this.getData()
        .then(parseFetchedData)
        .then(rjson => {
          this.completionTime = new Date().toString()
          this.analysisComplete = true
          
          this.pvaldata = rjson.pval
          this.coorddata = rjson.coord

          this.cleanupUrl()
          const coordBlob = new Blob([rjson.coord], { type: 'data:text/tsv' })
          this.coordUrl = URL.createObjectURL(coordBlob)
          
          const pvalBlob = new Blob([ rjson.pval ], { type: 'data:text/tsv' })
          this.pvalUrl = URL.createObjectURL(pvalBlob)
        })
        .catch(e => {
          console.error('error', e)
          this.error = e
          this.$emit('error', e)
        })
    },
    /**
     * called on destroy
     * also called when new urls are about to be generated
     */
    cleanupUrl: function() {
      if (this.coordUrl) {
        URL.revokeObjectURL(this.coordUrl)
        this.coordUrl = null
      }
      if (this.pvalUrl) {
        URL.revokeObjectURL(this.pvalUrl)
        this.pvalUrl = null
      }
    },
    getData: function () {
      return new Promise((resolve, reject) => {
        /**
         * in v2.0, data will no longer be defined
         * instead, id will be used to query the status
         */

        this.fetching()
          .then(resolve)
          .catch((reason) => {
            if (reason === NO_RESULTS_YET) {

              this.intervalId = setInterval(() => {
                this.fetching()
                  .then(json => {
                    clearInterval(this.intervalId)
                    resolve(json)
                  })
                  .catch(e => {
                    if (e === NO_RESULTS_YET) {
                      console.log('retrying', e)
                    } else {
                      this.error = e
                    }
                  })
              }, POLLING_INTERVAL)
            } else {
              this.error = reason
            }
          })
      })
    },
    toggleDisplayProbeLocation: function() {
      this.displayProbeLocation = !this.displayProbeLocation
      if (this.displayProbeLocation)
        this.showCoord()
      if (!this.displayProbeLocation)
        this.destroyCoord()
    },
    showCoord: function () {
      if (this.shownLandmarks.length > 0) return
      if (this.coorddata) {
        const lms = getCoord(this.coorddata).map(({ name, coord, ...rest }, idx) => {
          return {
            id: `${this.vueId}-${name}-${idx}`,
            position: coord,
            ...rest
          }
        })
        interactiveViewer.viewerHandle.add3DLandmarks(lms)
        this.shownLandmarks = lms.map(({ id }) => id)
      }
    },
    destroyCoord: function () {
      if (this.shownLandmarks.length === 0) return
      interactiveViewer.viewerHandle.remove3DLandmarks([ ...this.shownLandmarks ])
      this.shownLandmarks = []
    }
  },
  mounted: function () {
    // use mixin
    // this.vueId = this.$parent.queryId
    this.getDataRunner()
  },
  beforeDestroy: function () {
    /**
     * remove coord on destroy
     */
    if (this.intervalId) clearInterval(this.intervalId)
    this.destroyCoord()
    this.cleanupUrl()
  }
}
</script>
<style scoped>

.spinner
{
  display: inline-block;
  animation: thinking 0.7s ease-in-out 0s infinite both;
}

@keyframes thinking {
  0% { transform: translateX(0px); }
  50% { transform: translateX(10px); }
  100%   { transform: translateX(0px); }
}

.tsv-preview-container
{
  width: 0px;
  right: 0;
  top: 0;
}

.tsv-preview
{
  background-color: rgba(50,50,50,0.8);
  width: 30em;
}
</style>
