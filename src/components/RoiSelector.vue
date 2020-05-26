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
    subscriptions: [],
    selectRoiPromise: null
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
  mounted: function() {
    const fnStr = window.interactiveViewer.uiHandle.getUserToSelectARegion.toString()
    this.useV2 = !/this\.rejectUserSelectionMode/.test(fnStr)
  },
  data: function () {
    return {
      selectedRois: [],
      useV2: false,
      v1ScanActive: false,
      v2ScanActive: false,
      clickFlag: false,
      setRegionSelectionSubscription: null

    }
  },
  beforeDestroy: function () {
    this.v1DeactivateScan()
  },
  computed: {
    scanActive: {
      get: function() {
        return this.useV2 ? this.v2ScanActive : this.v1ScanActive
      },
      set: function (val) {
        if (this.useV2) {
          this.v2ScanActive = val
        } else {
          this.v1ScanActive = val
        }
      }
    }
  },
  watch: {
    scanActive: function(val) {
      if (val) this.$emit('DisableRoi1scan', true)
    }
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
      if (this.useV2) {
        if (!this.scanActive) this.v2ActivateScan() 
        else {
          this.v2DeactiveScan()
        }
      } else {
        this.scanActive = !this.scanActive
        if (this.scanActive) {
          this.$emit('DisableRoi1scan', true)
          this.regionSelectionPromise()

        } else {
          this.v1DeactivateScan()
        }
      }
    },
    deactivateScan(){
      if (this.useV2) this.v2DeactiveScan()
      else this.v1DeactivateScan()
    },
    v1DeactivateScan() {
      window.interactiveViewer.uiHandle.cancelPromise(
              window.interactiveViewer.uiHandle.getUserToSelectARegion
      )
      this.scanActive = false
    },

    v2ActivateScan(){
      if(this.scanActive) throw new Error(`scan is already active`)
      this.scanActive = true
      if (this.$options.selectRoiPromise) window.interactiveViewer.uiHandle.cancelPromise(
        this.$options.selectRoiPromise
      )

      const getSingleRegion = () => {
        this.$options.selectRoiPromise = window.interactiveViewer.uiHandle.getUserToSelectARegion(`Select a region for ${this.label}`)
        this.$options.selectRoiPromise
          .then(obj => {
            this.selectRoi(obj.segment.name)
            getSingleRegion()
          })
          .catch(e => {
            const { userInitiated } = e
            this.v2DeactiveScan()
          })
      }
      getSingleRegion()
    },
    v2DeactiveScan(){

      this.scanActive = false
      if (this.$options.selectRoiPromise) {
        try {
          window.interactiveViewer.uiHandle.cancelPromise(
            this.$options.selectRoiPromise
          )
        } catch (e) {

        }
      }
      this.$options.selectRoiPromise = null
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