<template>
  <form
    autocomplete="off"
    class="p-1 bg-dark mb-2">
    <div
      @keydown.stop
      @keydown.enter.prevent
      style = "z-index: 5"
      class="input-group">
      <div class="input-group-prepend">
        <div class="input-group-text">
          {{ label }}
        </div>
      </div>
      <auto-complete
        ref="autocomplete"
        :warning="warning"
        class="form-control fzj.xg.webjugex.formcontrol fzj.xg.webjugexFrontend.autocomplete"
        @selectslice="selectSlice($event)"
        :rawarray="autocompleteArray"
        :placeholder="compuetdPlaceholderText"/>
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
      mouseoverRegion: null,
      clickFlag: false
    }
  },
  computed: {
    compuetdPlaceholderText: function () {
      return this.scanActive 
        ? this.mouseoverRegion
          ? this.mouseoverRegion.name
          : 'Scanning ...'
        : this.placeholderText
    }
  },
  mounted: function () {
    const { subscriptions } = this.$options.nonReactive

    subscriptions.push(
      window.interactiveViewer.viewerHandle.mouseOverNehubaLayers.subscribe(layers => {
        const suitableLayer = layers && layers.find(({ segment }) => !!segment)
        if (!suitableLayer) return this.updateMouseOverRegion(null)
        const { segment } = suitableLayer
        this.updateMouseOverRegion(segment)
      })
    )

    subscriptions.push(
      window.interactiveViewer.viewerHandle.mouseEvent.subscribe(ev => {
        if (this.scanActive) this.handleMouseEvent(ev)
      })
    )
    
  },
  beforeDestroy: function () {
    const { subscriptions } = this.$options.nonReactive
    while (subscriptions.length > 0) {
      subscriptions.pop().unsubscribe()
    }
  },
  methods:{
    handleMouseEvent: function (ev) {
      const { eventName } = ev
      if (eventName === 'mousedown') {
        this.clickFlag = true
        setTimeout(() => this.clickFlag = false, 200)
        return
      }
      if (eventName === 'mouseup' && this.clickFlag && this.mouseoverRegion) {
        const { name } = this.mouseoverRegion
        this.selectRoi(name)
        return
      }
    },
    updateMouseOverRegion: function (roi) {
      this.mouseoverRegion = roi
    },
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
    toggleScanMode: function () {
      this.scanActive = !this.scanActive
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