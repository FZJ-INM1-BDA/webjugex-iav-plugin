<template>
  <div class="panel panel-default">
    <div
      @click="showBody = !showBody"
      class="panel-header btn btn-default btn-block">
      <span v-if="analysisComplete">
        analysis id:{{ id }} completed at {{ completionTimeString }}
      </span>
      <span v-if="!analysisComplete">
        analysing <div class="spinner">&bull;</div>
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
export default {
  props: {
    data: Object,
    default: null
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
      coorddata: null
    }
  },
  computed: {
    id: function () {
      return this.data && this.data.id
        ? this.data.id
        : `Unknown ID`
    },
    completionTimeString: function () {
      return this.completionTime
        ? this.completionTime
        : `Not yet complete`
    }
  },
  methods: {
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
    const data = {
      ...this.data,
      threshold: 0.2,
      mode: false
    }
    fetch(`${VUE_APP_BACKEND_URL}/jugex`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(res => res.json())
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
