<template>
  <div class="p-2">

    <!-- show experimental parameters regardless -->
    <form method="POST" :action="formPostEndpoint" target="_blank" enctype="application/x-www-form-urlencoded">
      <!-- id -->
      <div class="input-group input-group-sm mt-1">
        <div class="input-group-prepend">
          <label for="webjugex-analysis-id" class="input-group-text">
            id
          </label>
        </div>
        <input
          type="text"
          id="webjugex-analysis-id"
          name="webjugex-analysis-id"
          class="form-control form-control-sm"
          :value="vueId"
          readonly="readonly">
      </div>

      <!-- roi1 -->
      <div class="input-group input-group-sm mt-1">
        <div class="input-group-prepend">
          <label for="webjugex-analysis-roi1" class="input-group-text">
            roi1
          </label>
        </div>
        <input
          type="text"
          id="webjugex-analysis-roi1"
          name="webjugex-analysis-roi1"
          class="form-control form-control-sm"
          :value="roi1 ? roi1.join(', ') : ''"
          readonly="readonly">
      </div>

      <!-- roi2 -->
      <div class="input-group input-group-sm mt-1">
        <div class="input-group-prepend">
          <label for="webjugex-analysis-roi2" class="input-group-text">
            roi2
          </label>
        </div>
        <input
          type="text"
          id="webjugex-analysis-roi2"
          name="webjugex-analysis-roi2"
          class="form-control form-control-sm"
          :value="roi2 ? roi2.join(', ') : ''"
          readonly="readonly">
      </div>

      <div class="input-group input-group-sm mt-1">
        <div class="input-group-prepend">
          <label for="webjugex-analysis-genes" class="input-group-text">
            genes
          </label>
          <input
            type="text"
            id="webjugex-analysis-genes"
            name="webjugex-analysis-genes"
            class="form-control form-control-sm"
            :value="genes | stringify"
            readonly="readonly">
        </div>
      </div>

      <!-- permutations -->
      <div class="input-group input-group-sm mt-1">
        <div class="input-group-prepend">
          <label for="webjugex-analysis-permutations" class="input-group-text">
            permutations
          </label>
        </div>
        <input
          type="text"
          id="webjugex-analysis-permutations"
          name="webjugex-analysis-permutations"
          class="form-control form-control-sm"
          :value="nPermutations"
          readonly="readonly">
      </div>

      <!-- threshold -->
      <div class="input-group input-group-sm mt-1">
        <div class="input-group-prepend">
          <label for="webjugex-analysis-threshold" class="input-group-text">
            threshold
          </label>
        </div>
        <input
          type="text"
          id="webjugex-analysis-threshold"
          name="webjugex-analysis-threshold"
          class="form-control form-control-sm"
          :value="threshold"
          readonly="readonly">
      </div>

      <input type="submit" class="btn btn-link" value="Save to collab.drive">
    </form>
    
    <!-- results container -->
    <div class="mt-2" v-if="!error">

      <!-- if complete show result -->
      <div v-if="analysisComplete">
        <div class="btn-group btn-block">
          <div
            @click="showCoord"
            class="btn btn-default">
            show coord
          </div>
          <div
            @click="destroyCoord"
            class="btn btn-default">
            hide coord
          </div>
        </div>

        <a
          download="pval.tsv"
          @mouseenter="showPreviewPValData=true"
          @mouseleave="showPreviewPValData=false"
          class="position-relative"
          :href="'data:text/tsv;charset=utf-8,' + pvaldata">
          download pvals
          <div
            v-if="showPreviewPValData"
            class="position-absolute tsv-preview-container">
            <PreviewTsv class="tsv-preview" :tsv="pvaldata" />
          </div>
        </a>
        
        <br />
        
        <a
          download="coord.tsv"
          @mouseenter="showPreviewCoordData=true"
          @mouseleave="showPreviewCoordData=false"
          class="position-relative"
          :href="'data:text/tsv;charset=utf-8,' + coorddata">
          download coord data
          <div
            v-if="showPreviewCoordData"
            class="position-absolute tsv-preview-container">
            <PreviewTsv class="tsv-preview" :tsv="coorddata" />
          </div>
        </a>
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
import { workspaceMixin } from './mixin'
import PreviewTsv from './previewTsv'
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

export default {
  components: {
    PreviewTsv
  },
  props: {
    data: {
      type: Object,
      default: null
    },
    formPostEndpoint: {
      type: String,
      default: `${HOSTNAME}/user`
    }
  },
  mixins:[
    workspaceMixin
  ],
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
      coorddata: null,

      /**
       * polling
       */
      intervalId: null,
      vueId: null,

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
      shownLandmarks: []
    }
  },
  computed: {
    completionTimeString: function () {
      return this.completionTime
        ? this.completionTime
        : `Not yet complete`
    }
  },
  filters: {
    stringify: function (array) {
      return JSON.stringify(array)
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
            const {body, resp} = analysis
            const { statusCode } = resp
            if (statusCode && statusCode >= 400) {
              return Promise.reject(statusCode)
            }
            return Promise.resolve(JSON.parse(body))
          } else {
            return Promise.reject(NO_RESULTS_YET)
          }
        })
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
    parseFetchedData: function (json) {
      const parseCoordToFile = (json) => {
        return Object.keys(json).reduce((acc, curr) => {
          const newRows = json[curr].map(item => {
            return `${curr}${DELIMITER}${item.xyz.join(DELIMITER)}${DELIMITER}${item.winsorzed_mean.join(DELIMITER)}`
          })
          return acc.concat(newRows)
        }, []).join('\n')
      }

      const parsePvalToFile = (json) => {
        return Object.keys(json).map(key => `${key}${DELIMITER}${json[key]}`).join('\n')
      }

      const pval = json[1]
      const coord = json[0]
      const stringCoordFile = parseCoordToFile(coord)
      const stringPvalFile = parsePvalToFile(pval)
      const stringTitledCoordFile = `Area name${DELIMITER}x${DELIMITER}y${DELIMITER}z${DELIMITER}`+Object.keys(pval).join(DELIMITER).concat('\n').concat(stringCoordFile)
      return {
        pval : stringPvalFile,
        coord : stringTitledCoordFile
      }
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
    this.vueId = this.$parent.queryId
    this.getData()
      .then(this.parseFetchedData)
      .then(rjson => {
        this.completionTime = new Date().toString()
        this.analysisComplete = true
        this.pvaldata = rjson.pval
        this.coorddata = rjson.coord
      })
      .catch(e => {
        console.error('error', e)
        this.error = e
        this.$emit('error', e)
      })
  },
  beforeDestroy: function () {
    /**
     * remove coord on destroy
     */
    if (this.intervalId) clearInterval(this.intervalId)
    this.destroyCoord()
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
