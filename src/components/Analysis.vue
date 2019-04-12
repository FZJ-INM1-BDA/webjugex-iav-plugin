<template>
  <div class="panel panel-default">
    <div
      @click="showBody = !showBody"
      class="panel-header btn btn-default btn-block">
      <span v-if="analysisComplete">
        analysis id:{{ vueId }} completed at {{ completionTimeString }}
      </span>
      <span v-if="!analysisComplete">
        analysis id:{{ vueId }}, analysing <div class="spinner">&bull;</div>
      </span>
      <span
        @click.prevent.stop="$emit('close')"
        class="pull-right close">
        &times;
      </span>
    </div>
    <div
      v-if="showBody"
      class="panel-body p-2">

      <div v-if="error">
        {{ error }}
      </div>
      <div v-else-if="pvaldata && coorddata">
        <a download="pval.csv" :href="'data:text/csv;charset=utf-8,' + pvaldata">download pvals</a><br />
        <a download="coord.csv" :href="'data:text/csv;charset=utf-8,' + coorddata">download coord data</a>
      </div>
      <div v-else>
        We are still working on on analysing your data ...
      </div>
    </div>
  </div>
</template>
<script>
const POLLING_INTERVAL = 3000
export default {
  props: {
    data: {
      type: Object,
      default: null
    }
  },
  data: function () {
    return {
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
      return fetch(`${VUE_APP_HOSTNAME}/analysis/${this.vueId}`)
        .then(res => res.json())
        .then(json => {
          const analysisBody = json && json.analysis && json.analysis.body
          if (analysisBody) {
            clearInterval(this.intervalId)
            const body = JSON.parse(analysisBody)
            return Promise.resolve(body)
          } else {
            return Promise.reject('no results yet')
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
          .catch(() => {
            this.intervalId = setInterval(() => {
              this.fetching()
                .then(json => {
                  clearInterval(this.intervalId)
                  resolve(json)
                })
                .catch(e => {
                  console.log('retrying', e)
                })
            }, POLLING_INTERVAL)
          })


        /**
         * v1.0
         */
        // const data = {
        //   ...this.data,
        //   threshold: 0.2,
        //   mode: false
        // }
        // fetch(`${VUE_APP_BACKEND_URL}/jugex`, {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json'
        //   },
        //   body: JSON.stringify(data)
        // })
        //   .then(res => res.json())
        //   .then(resolve)
        //   .catch(reject)

      })
    },
    parseFetchedData: function (json) {
      const parseCoordToFile = (json) => {
        return Object.keys(json).reduce((acc, curr) => {
          const newRows = json[curr].map(item => {
            return `${curr},${item.xyz.join(',')},${item.winsorzed_mean.join(',')}`
          })
          return acc.concat(newRows)
        }, []).join('\n')
      }

      const parsePvalToFile = (json) => {
        return Object.keys(json).map(key => `${key},${json[key]}`).join('\n')
      }

      const pval = json[1]
      const coord = json[0]
      const stringCoordFile = parseCoordToFile(coord)
      const stringPvalFile = parsePvalToFile(pval)
      const stringTitledCoordFile = Object.keys(pval).join(',').concat('\n').concat(stringCoordFile)
      return {
        pval : stringPvalFile,
        coord : stringTitledCoordFile
      }
    }
  },
  mounted: function () {
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

</style>
