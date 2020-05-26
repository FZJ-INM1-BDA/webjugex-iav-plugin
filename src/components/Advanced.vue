<template>
  <div class="p-1">
    <div class="d-flex justify-content-between">
    <span>Filter</span>

    <a
      class="fzj-xg-webjugex-hover-default"
      @click="resetToDefault"
      :class="isDefault ? 'text-muted disabled' : ''"
      href="#">
      reset to default
    </a>
    </div>

    <div class="input-group f-flex align-items-center">
      <span class="input-group-prepend p-2">
          Probe Mode
      </span>
      <check-box
        :flag = "singleProbeMode"
        @togglecheckbox = "singleProbeMode = !singleProbeMode" />
        <span class="input-group-append p-2">
            {{ singleProbeMode ? 'Single' : 'All' }}
        </span>
    </div>
  
    <div class="input-group f-flex align-items-center">
      <span class="input-group-prepend p-2">
          Custom probe
      </span>
      <check-box
        :flag = "ignoreCustomProbe"
        @togglecheckbox = "ignoreCustomProbe = !ignoreCustomProbe" />
        <span class="input-group-append p-2">
            {{ ignoreCustomProbe ? 'Ignore' : 'Use' }}
        </span>
    </div>

    <div class="input-group f-flex align-items-center">
      <div class="input-group-prepend p-2"  for="webjugex-threshold">
          Threshold
      </div>
      <input
        v-model="threshold"
        class="form-control"
        type="range"
        min="0.05"
        max="1.00"
        step="0.05"
        id="webjugex-threshold"
        name="webjugex-threshold">
      <div class="input-group-append p-2">
          {{ threshold | numberFilter }}
      </div>
    </div>
    
    <div class="fzj.xg.webjugex.divider"></div>
  
    <div class="input-group">
      <span class="input-group-prepend">
        <span class="input-group-text">
          <small>No. of Perm</small>
        </span>
      </span>
      <input
        :value="nPermutations"
        @change="nPermChange"
        @keyup="nPermChange"
        type="number"
        class="form-control">
    </div>
  </div>
</template>
<script>
import { CheckBox } from 'vue-components'
export const defaultConfig = {
  nPermutations: 1000,
  threshold: '0.2',
  singleProbeMode: false,
  ignoreCustomProbe: false,
}
export default {
  components: {
    CheckBox
  },
  data: function () {
    return defaultConfig
  },
  computed: {
    isDefault: function () {
      return Number(this.threshold) === 0.2 && this.nPermutations === 1000 && !this.singleProbeMode && !this.ignoreCustomProbe
    }
  },
  watch: {
    isDefault: function (val) {
      this.$emit('updateIsDefault', val)
    }
  },
  methods: {
    nPermChange: function (ev) {
      const value = ev && ev.target && ev.target.value
      if (value && !isNaN(value)) this.nPermutations = Number(ev.target.value)
    },

    resetToDefault: function (event) {
      event.preventDefault()
      this.nPermutations = 1000
      this.threshold = '0.2'
      this.singleProbeMode = false
      this.ignoreCustomProbe = false
    },
  },
  filters: {

    numberFilter: function (val) {
      return Number(val).toFixed(2)
    },
  }
}
</script>