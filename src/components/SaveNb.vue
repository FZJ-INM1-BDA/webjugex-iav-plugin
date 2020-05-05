<template>
  <form method="POST" :action="formPostEndpoint" target="_blank" enctype="application/x-www-form-urlencoded">
    <!-- id -->
    <div v-if="false" class="input-group input-group-sm mt-1 d-none">
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
        :value="computedId"
        readonly="readonly">
    </div>

    <!-- roi1 -->
    <div class="input-group input-group-sm mt-1 d-none">
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
        :value="roi1 | stringify"
        readonly="readonly">
    </div>

    <!-- roi2 -->
    <div class="input-group input-group-sm mt-1 d-none">
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
        :value="roi2 | stringify"
        readonly="readonly">
    </div>

    <div class="input-group input-group-sm mt-1 d-none">
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
    <div class="input-group input-group-sm mt-1 d-none">
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
    <div class="input-group input-group-sm mt-1 d-none">
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

    <button type="submit"
      :disabled="!exportReady"
      @click="downloadNbFlag = false"
      aria-label="Upload to cloud service"
      class="btn btn-secondary d-inline-block">
      <i class="fas fa-cloud-upload-alt"></i>
      <span>
        lab.ebrains.eu
      </span>
    </button>
    <button type="submit"
      :disabled="!exportReady"
      @click="downloadNbFlag = true"
      aria-label="Download to local disk"
      class="btn btn-secondary d-inline-block">
      <i class="fas fa-download"></i>
    </button>
  </form>
</template>

<script>
import { baseUrl } from './constants'

const verifyArray = obj => obj && Array.isArray(obj) && obj.length >= 1

export default {
  props: {
    id: {
      type: String,
      default: null
    },
    roi1: {
      type: Array,
    },
    roi2: {
      type: Array,
    },
    genes: {
      type: Array,
    },
    nPermutations: {
      type: Number,
    },
    threshold: {
      type: Number,
    },

    formPostEndpointRoot: {
      type: String,
      default: `${baseUrl}/user`
    }
  },
  computed: {
    computedId: function () {
      return this.id || this.created
    },
    formPostEndpoint: function () {
      return this.downloadNbFlag ? `${this.formPostEndpointRoot}/download` : `${this.formPostEndpointRoot}`
    },
    exportReady: function () {
      const { roi1, roi2, genes } = this
      return verifyArray(roi1) && verifyArray(roi2) && verifyArray(genes)
    }
  },
  data: function () {
    return {
      downloadNbFlag: false,
      created: new Date().toString()
    }
  },
  filters: {
    stringify: function (array) {
      return JSON.stringify(array)
    }
  },
}
</script>