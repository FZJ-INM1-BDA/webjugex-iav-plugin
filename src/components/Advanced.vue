<template>
  <div>
    <a
      class="fzj-xg-webjugex-hover-default"
      @click="resetToDefault"
      :class="isDefault ? 'text-muted disabled' : ''"
      href="#">
      reset to default
    </a>

    <div class="input-group">
      <span class="input-group-prepend">
        <span class="input-group-text">
          Probe Mode
        </span>
      </span>
      <check-box
        :flag = "singleProbeMode"
        @togglecheckbox = "singleProbeMode = !singleProbeMode" />
        <span class="input-group-append">
          <span class="input-group-text">
            {{ singleProbeMode ? 'Single' : 'All' }}
          </span>
        </span>
    </div>
  
    <div class="input-group">
      <span class="input-group-prepend">
        <span class="input-group-text">
          Custom probe
        </span>
      </span>
      <check-box
        :flag = "ignoreCustomProbe"
        @togglecheckbox = "ignoreCustomProbe = !ignoreCustomProbe" />
        <span class="input-group-append">
          <span class="input-group-text">
            {{ ignoreCustomProbe ? 'Ignore' : 'Use' }}
          </span>
        </span>
    </div>

    <div class="input-group">
      <div class="input-group-prepend">
        <label class="input-group-text" for="webjugex-threshold">
          Threshold
        </label>
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
      <div class="input-group-append">
        <span class="input-group-text">
          {{ threshold | numberFilter }}
        </span>
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