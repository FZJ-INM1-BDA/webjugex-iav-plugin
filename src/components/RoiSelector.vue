<template>
  <form
    autocomplete="off"
    class="p-1 bg-dark mb-2">
    {{ label }}
    <div
      @keydown.stop
      @keydown.enter.prevent
      style = "z-index: 5"
      class="input-group">
      <!-- ToDo Fully remove? -->
<!--      <div class="input-group-prepend">-->
<!--        <div class="input-group-text">-->
<!--          {{ label }}-->
<!--        </div>-->
<!--      </div>-->
      <auto-complete
        ref="autocomplete"
        :warning="warning"
        class="form-control fzj.xg.webjugex.formcontrol fzj.xg.webjugexFrontend.autocomplete"
        @selectslice="selectSlice($event)"
        :rawarray="autocompleteArray"/>
      <div class="input-group-append">
        <div
          :webjugex-tooltip="'toggle scan mode for ' + label"
          @click.stop.prevent="toggleScanMode()"
          :class="scanActive ? 'btn-active' : 'btn-inactive'"
          class="btn btn-secondary">
          <i class="fas fa-satellite-dish"></i>
        </div>
      </div>
    </div>
    <div class="overflow-hidden">
      <pill
        class="pill mt-1 mb-0 mw-100"
        @remove-pill="removeRoi(roi)"
        :name="roi"
        :key="roi"
        v-for="roi in selectedRois" />
    </div>
  </form>
</template>
<script>
import { AutoComplete, Pill } from 'vue-components'
export default {
  components:{
    AutoComplete,
    Pill
  },
  nonReactive: {
    subscriptions: []
  },
  props:{
    warning:{
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      default: 'Default ROI'
    },
    placeholderText: {
      type: String,
      default: 'Search for regions'
    },
    autocompleteArray: {
      default: function () {
        return []
      }
    }
  },
  data: function () {
    return {
      selectedRois: [],
      scanActive: false,
      clickFlag: false,
      setRegionSelectionSubscription: null

    }
  },
  beforeDestroy: function () {
    this.deactivateScan()
  },
  methods:{
    selectRoi: function (name) {
      if (this.selectedRois.indexOf(name) < 0) this.selectedRois = this.selectedRois.concat(name)
    },
    selectSlice: function (event){
      this.selectRoi(event)
      this.$refs.autocomplete.$refs.input.focus()
    },
    removeRoi: function (name) {
      this.selectedRois = this.selectedRois.filter(roi => roi !== name)
    },

    regionSelectionPromise() {
      window.interactiveViewer.uiHandle
              .getUserToSelectARegion(`Region Selection Mode for ${this.label}`)
              .then(res => {
                if (res) {
                  res.forEach(r => this.selectRoi(r.name))
                  this.regionSelectionPromise()
                }
              })
              .catch(err => {})
    },

    toggleScanMode: function () {
      this.scanActive = !this.scanActive

      if (this.scanActive) {
        this.$emit('DisableRoi1scan', true)
        this.regionSelectionPromise()

      } else {
        this.deactivateScan()
      }
    },
    deactivateScan() {
      window.interactiveViewer.uiHandle.cancelPromise(
              window.interactiveViewer.uiHandle.getUserToSelectARegion
      )
      this.scanActive = false
    }
  }
}
</script>
<style scoped>
.mw-100
{
  max-width: 100%;
}
</style>