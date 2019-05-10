<template>
  <div
    @animationend = "animationend($event)"
    id = "fzj-xg-webjugex-container">

    <!-- description -->
    <div class="fzj-xg-webjugex-truncate bg-dark p-2">
      <small v-if="descReadmore">
        <p>
          Find a set of differentially expressed genes between two user defined volumes of interest based on JuBrain maps.
        </p>
        <p>
          The tool downloads expression values of user specified sets of genes from Allen Brain API<sup>[1]</sup>.
        </p>
        <p>
          Then, it uses zscores to find which genes are expressed differentially between the user specified regions of interests.
        </p>
        <p>
          After the analysis is finished, the genes and their calculated p values are displayed. There is also an option of downloading the gene names and their p values and the roi coordinates used in the analysis.
        </p>
        <p>
          <sup>[1]</sup> &copy; 2015 Allen Institute for Brain Science. Allen Brain Atlas API. Available from: <a target = "_blank" href = "brain-map.org/api/index.html">brain-map.org/api/index.html</a>
        </p>
        <a @click="$event.preventDefault(); descReadmore = false" href="#"> readless </a>
      </small>
      <small v-else>
        <p>
          Find a set of differentially expressed genes between two user defined volumes of interest ... 
          <a @click="$event.preventDefault(); descReadmore = true" href="#"> readmore </a>
        </p>
      </small>
    </div>
    <readmore v-if="false" :collapsed-height = "40">
      <template slot = "readmoreContent">
        <small>
          <p>
            Find a set of differentially expressed genes between two user defined volumes of interest based on JuBrain maps.
          </p>
          <p>
            The tool downloads expression values of user specified sets of genes from Allen Brain API<sup>[1]</sup>.
          </p>
          <p>
            Then, it uses zscores to find which genes are expressed differentially between the user specified regions of interests.
          </p>
          <p>
            After the analysis is finished, the genes and their calculated p values are displayed. There is also an option of downloading the gene names and their p values and the roi coordinates used in the analysis.
          </p>
          <p>
            <sup>[1]</sup> &copy; 2015 Allen Institute for Brain Science. Allen Brain Atlas API. Available from: <a target = "_blank" href = "brain-map.org/api/index.html">brain-map.org/api/index.html</a>
          </p>
        </small>
      </template>
      <template slot = "resizeSliverContentCollapsed">
        <div class = "text-center">
          <i class = "glyphicon glyphicon-chevron-down"></i>
        </div>
      </template>
      <template slot = "resizeSliverContentShown">
        <div class = "text-center">
          <i class = "glyphicon glyphicon-chevron-up"></i>
        </div>
      </template>
    </readmore>

    <div class = "fzj.xg.webjugex.divider">
    </div>
    
    <!-- simple mode -->
    <div v-if="false" class="input-group">
      <div class="input-group-prepend">
        <span class="input-group-te">
          Simple mode
        </span>
      </div>
      <check-box
        class = "fzj.xg.webjugex.checkbox"
        @togglecheckbox = "simpleMode = !simpleMode"
        :flag = "simpleMode"/>
    </div>

    <div class = "fzj.xg.webjugex.divider">
    </div>

    <!-- roi1 -->
    <div class="p-1 bg-dark mb-2">
      <div style = "z-index: 5" class="input-group">
        <div class="input-group-prepend">
          <div class="input-group-text">
            ROI1
          </div>
        </div>
        <auto-complete
          ref="roi1"
          :warning="roi1Warning"
          class="form-control fzj.xg.webjugex.formcontrol fzj.xg.webjugexFrontend.autocomplete"
          @focusin.native="focusAutocomplete(1)"
          @selectslice="selectSlice($event, null, true)"
          :rawarray="autocompleteRawArray"
          :placeholder="autocomplete1Placeholder"/>
        <div class="input-group-append">
          <div
            webjugex-tooltip="toggle scan mode for ROI1"
            @click.stop.prevent="toggleScanMode(1)"
            :class="scanMode === 1 ? 'btn-active' : 'btn-inactive'"
            class="btn btn-secondary">
            <i class="fas fa-satellite-dish"></i>
          </div>
        </div>
      </div>
      <div>
        <pill
          class="pill mt-1 mb-0"
          @remove-pill="removeRoi(1, roi)"
          :name="roi"
          :key="roi"
          v-for="roi in roi1s" />
      </div>
    </div>

    <!-- roi2 -->
    <div class="p-1 bg-dark mb-2">
      <div style = "z-index: 4" class="input-group">
        <div class="input-group-prepend">
          <div class="input-group-text">
            ROI2
          </div>
        </div>
        <auto-complete
          ref="roi2"
          :warning="roi2Warning"
          class="form-control fzj.xg.webjugex.formcontrol fzj.xg.webjugexFrontend.autocomplete"
          @focusin.native="focusAutocomplete(2)"
          @selectslice="selectSlice(null, $event, true)"
          :rawarray="autocompleteRawArray"
          :placeholder="autocomplete2Placeholder"/>
        <div class="input-group-append">
          <div
            webjugex-tooltip="toggle scan mode for ROI2"
            @click.stop.prevent="toggleScanMode(2)"
            :class="scanMode === 2 ? 'btn-active' : 'btn-inactive'"
            class="btn btn-default">
            <i class="fas fa-satellite-dish"></i>
          </div>
        </div>
      </div>
      <div>
        <pill
          class="pill mt-1 mb-0"
          @remove-pill = "removeRoi(2, roi)"
          :name = "roi"
          :key = "roi"
          v-for = "roi in roi2s" />
      </div>
    </div>
    <div class = "fzj.xg.webjugex.divider">
    </div>

    <!-- genelist -->
    <div class="p-1 bg-dark mb-2">
      <div style="z-index: 3" class="input-group">
        <auto-complete
          :warning="selectedgenesWarning"
          @focusin.native="focusAutocomplete(null)"
          class="form-control fzj.xg.webjugex.formcontrol fzj.xg.webjugexFrontend.autocomplete"
          ref="genelist"
          :rawarray="allgenes"
          @selectslice="selectgene"/>
        <div
          webjugex-tooltip='accepts a stringified list of gene names. e.g, ["MAOA", "TAC1"]'
          class="input-group-btn">
          <div
            @click="importGeneJSON"
            class="btn btn-default">
            Import
            <input
              @change="fileChosen"
              class="hidden"
              hidden="hidden"
              type="file"
              ref="importGeneRef" />
          </div>
        </div>
        <div
          :webjugex-tooltip="selectedgenes.length === 0 ? 'you need to have at least 1 gene selected to export' : 'saves the gene list as a comma separated, utf8 encoded csv file'" 
          class="input-group-btn">
          <div
            :disabled="selectedgenes.length === 0"
            @click="exportGeneJSON"
            :class="selectedgenes.length === 0 ? 'fzj-xg-webjugex-pointer-events text-muted' : ''"
            class="btn btn-default">
            Export
            <a class="hidden" hidden download="genelist.json" ref="exportAnchor" :href="geneListJSON">Export Genelist as JSON</a>
          </div>
        </div>
      </div>
      <div>
        <pill
          class="pill"
          @remove-pill="removeRoi(3, gene)"
          :name="gene"
          :key="gene"
          v-for="gene in selectedgenes" />
      </div>
    </div>
    <div class="fzj.xg.webjugex.divider"></div>

    <!-- complex mode -->
    <transition name="fzj-xg-webjugex-fade">
      <div v-if="!simpleMode">

        <div class="input-group">
          <span class="input-group-addon">
            Single probe mode
          </span>
          <check-box
            :flag = "singleProbeMode"
            @togglecheckbox = "singleProbeMode = !singleProbeMode" />
        </div>
      
        <div class="input-group">
          <span class="input-group-addon">
            Ignore custom probe
          </span>
          <check-box
            :flag = "ignoreCustomProbe"
            @togglecheckbox = "ignoreCustomProbe = !ignoreCustomProbe" />
        </div>
        
        <div class="fzj.xg.webjugex.divider"></div>
      
        <div class="input-group">
          <span class="input-group-addon">
            Hemisphere
          </span>
          <div
            style = "display:inline-block"
            :warning = "hemisphereWarning">
            <div 
              @click = "lefthemisphere = !lefthemisphere"
              :class = " lefthemisphere == true ? 'btn-active' : 'btn-inactive'"
              class="btn btn-default">
              Left
            </div>
            <div 
              @click = "righthemisphere = !righthemisphere"
              :class = " righthemisphere == true ? 'btn-active' : 'btn-inactive'"
              class="btn btn-default">
              Right
            </div>
          </div>
        </div>
      
        <div class="fzj.xg.webjugex.divider"></div>
      
        <div class="input-group">
          <span class="input-group-addon">
            <small>No. of Perm</small>
          </span>
          <input v-model = "nPermutations" type="number" class="form-control">
        </div>
      
        <div class="fzj.xg.webjugex.divider"></div>  
      </div>
    </transition>

    <div class="fzj.xg.webjugex.divider"></div>

    <!-- analysis GO -->
    <div class="btn-group w-100">
      <div 
        @click = "startAnalysis"
        class="btn btn-secondary">
        Start Differential Analysis
        <span
          v-if="!isDefault"
          class="text-warning">
          <i class="fas fa-exclamation-triangle"></i>
        </span>
      </div>
      <div
        @click="showAdvancedMenu = !showAdvancedMenu"
        class="btn btn-secondary dropdown-toggle dropdown-toggle-split fzj-xg-webjugex-fg-0"
        data-toggle="dropdown">
        <span class="sr-only">
          Toggle Dropdown
        </span>
      </div>

      <!-- advanced menu -->
      <div
        class="bg-dark p-3 fzj-xg-webjugex-advanced-menu"
        v-if="showAdvancedMenu">

        <a
          class="fzj-xg-webjugex-hover-default"
          @click="reset"
          :class="isDefault ? 'text-muted disabled' : ''"
          href="#">
          reset to default
        </a>

        <div class="input-group">
          <span class="input-group-prepend">
            <span class="input-group-text">
              Single probe mode
            </span>
          </span>
          <check-box
            :flag = "singleProbeMode"
            @togglecheckbox = "singleProbeMode = !singleProbeMode" />
        </div>
      
        <div class="input-group">
          <span class="input-group-prepend">
            <span class="input-group-text">
              Ignore custom probe
            </span>
          </span>
          <check-box
            :flag = "ignoreCustomProbe"
            @togglecheckbox = "ignoreCustomProbe = !ignoreCustomProbe" />
        </div>
        
        <div class="fzj.xg.webjugex.divider"></div>
      
        <div class="input-group">
          <span class="input-group-prepend">
            <span class="input-group-text">
              Hemisphere
            </span>
          </span>
          <div
            style = "display:inline-block"
            :warning = "hemisphereWarning">
            <div 
              @click = "lefthemisphere = !lefthemisphere"
              :class = " lefthemisphere == true ? 'btn-active' : 'btn-inactive'"
              class="btn btn-default">
              Left
            </div>
            <div 
              @click = "righthemisphere = !righthemisphere"
              :class = " righthemisphere == true ? 'btn-active' : 'btn-inactive'"
              class="btn btn-default">
              Right
            </div>
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
    </div>
    
    <!-- warning -->
    <transition name="fzj-xg-webjugex-fade">
      <div style="margin-top:0.5em" class="alert alert-danger" v-if="warning.length > 0">
        <i class="glyphicon glyphicon-alert"></i> WARNING: 
        <ul>
          <li :key="w" v-for="w in warning">
            {{ getWarning(w) }}
          </li>
        </ul>
      </div>
    </transition>

    <div class="fzj.xg.webjugex.divider"></div>

    <!-- past analysis -->
    <div v-if="listAnalysis.length > 0">
      Past analysis:
    </div>
    <pill
      class="pill mt-1 mb-0"
      @click.native="openOldAnalysis(a)"
      @remove-pill="deleteAnalysis(a)"
      :name="a"
      :key="a"
      v-for="a in listAnalysis">
    </pill>

    <!-- results -->
    <div class="fzj-xg-webjugex-analysis-container">
      <AnalysisCard
        :data = "a"
        :key = "a.id"
        v-for = "a in analyses" />
    </div>
  </div>
</template>
<script>

import { Readmore, AutoComplete, Pill, CheckBox } from 'vue-components'
import AnalysisCard from './Analysis'
import Vue from 'vue'

export default {
  components: {
    AutoComplete,
    Pill,
    Readmore,
    CheckBox,
    AnalysisCard
  },
  nonReactive: {
    toastHandler: null
  },
  data: function () {
    return {
      desc: `Find a set of differentially expressed genes between two user defined volumes of interest based on JuBrain maps.

        The tool downloads expression values of user specified sets of genes from Allen Brain API[1].

        Then, it uses zscores to find which genes are expressed differentially between the user specified regions of interests.

        After the analysis is finished, the genes and their calculated p values are displayed. There is also an option of downloading the gene names and their p values and the roi coordinates used in the analysis.
        
        [1] &copy; 2015 Allen Institute for Brain Science. Allen Brain Atlas API. Available from: <a target = "_blank" href = "brain-map.org/api/index.html">brain-map.org/api/index.html</a>`,
      descTruncate: 100,
      descReadmore: false,

      subscriptions: [],
      regionNamesUrlArray: [],
      roi1s: [],
      roi2s: [],
      allgenes: [],
      selectedgenes: [],
      warning : [],
      scanMode: null,

      /**
       * scan mode
       */
      mouseOverRegion: null,
      scanFlag: false,

      /**
       * complex mode
       */
      showAdvancedMenu: false,
      simpleMode: true,
      singleProbeMode: true,
      ignoreCustomProbe:false,
      lefthemisphere:true,
      righthemisphere:true,
      nPermutations:1000,

      /**
       * analysis
       */
      analyses: [],
      listAnalysis: []

    }
  },
  mounted: function () {
    
    this.$options.nonReactive.toastHandler = interactiveViewer.uiHandle.getToastHandler()
    this.$options.nonReactive.toastHandler.dismissable = false
    this.$options.nonReactive.toastHandler.timeout = -1

    this.subscriptions.push(
      window.interactiveViewer.metadata.datasetsBSubject
        .subscribe(array => {
          this.regionNamesUrlArray = array
            .filter(item => /Probabilistic\ cytoarchitectonic\ map/.test(item.name)
              && item.parcellationRegion
              && item.parcellationRegion.length
              && item.parcellationRegion[0].name
              && item.files
              && item.files.length)
            .map(item => [item.parcellationRegion[0].name, item.files.find(file => !/mnicolin27\.nii/.test(file.name)).absolutePath])
        })
    )

    this.subscriptions.push(
      window.interactiveViewer.viewerHandle.mouseOverNehuba.subscribe(region => {
        this.mouseOverRegion = region
      })
    )

    this.subscriptions.push(
      window.interactiveViewer.viewerHandle.mouseEvent
        .subscribe(ev => {
          if (ev.eventName === 'mousedown') {
            this.scanFlag = true
            setTimeout(() => this.scanFlag = false, 300)
          }
          if (ev.eventName === 'mouseup' && this.scanFlag) {
            this.scanCaptureRegion()
          }
        })
    )

    fetch(`${VUE_APP_HOSTNAME}/genelist`)
      .then(res => res.json())
      .then(arr => this.allgenes = arr)
      .catch(this.catchError)

    this.getListAnalysisResults()
  },
  watch:{
    scanMode: function (val) {
      this.$options.nonReactive.toastHandler.hide()
      if (val) {

        this.$options.nonReactive.toastHandler.message = val === 1
          ? `Hover and click on the viewer to add region to ROI1`
          : `Hover and click on the viewer to add region to ROI2`
        this.$options.nonReactive.toastHandler.show()

      }
    }
  },
  methods: {
    openOldAnalysis: function (id) {
      this.launchResultPanel(id)
        .catch(this.catchError)
    },
    launchResultPanel: function (id) {
      return fetch(`${VUE_APP_HOSTNAME}/analysis/i-v-manifest/${id}`)
        .then(res => res.json())
        .then(json => window.interactiveViewer.uiHandle.launchNewWidget(json))
    },
    deleteAnalysis: function (id) {
      fetch(`${VUE_APP_HOSTNAME}/analysis/${id}`, {
        method: 'DELETE'
      }).then(this.getListAnalysisResults)
        .catch(this.getListAnalysisResults)
    },
    getListAnalysisResults: function () {
      fetch(`${VUE_APP_HOSTNAME}/analysis/list`)
        .then(res => res.json())
        .then(arr => this.listAnalysis = arr)
        .catch(this.catchError)
    },
    focusAutocomplete: function (idx) {
      this.scanMode = idx
    },
    catchError: function (e) {
      console.log(e)
    },
    importGeneJSON: function () {
      const importInput = this.$refs.importGeneRef
      if (importInput)
        importInput.click()
    },
    exportGeneJSON: function () {
      /**
       * TODO this method breaks if gene names contain spaces, comma etc. 
       * need a more permanent solution
       * perhaps use csv?
       */

      const anchor = this.$refs.exportAnchor
      if (anchor)
        anchor.click()
    },
    fileChosen: function (ev) {
      
      const file = ev.target && ev.target.files && ev.target.files[0]
      if (file) {
        this.readFile(file)
          .then(text => JSON.parse(text))
          .then(arr => {
            const validate = arr && Array.isArray(arr) && arr.every(item => typeof item === 'string')
            if (validate) return arr
            else throw new Error('file was not validated')  
          })
          .then(arr => this.selectedgenes = arr)
          .then(() => {
            /**
             * TODO
             * reset file input
             */
          })
          .catch(console.error)
      }
    },
    readFile: function (file){
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (evt) => {
          const result = evt && evt.target && evt.target.result
          if (result) {
            resolve(result)
          } else {
            reject('result undefined')
          }
        }
        reader.onerror = reject
        reader.readAsText(file)
      })
    },
    reset: function (event) {
      event.preventDefault()
      this.lefthemisphere = true
      this.righthemisphere = true
      this.nPermutations = 1000
      this.singleProbeMode = true
      this.ignoreCustomProbe = false
    },
    scanCaptureRegion: function () {
      if (this.mouseOverRegion !== null) {
        if (this.scanMode === 1) {
          this.roi1s = this.reduce([...this.roi1s, this.mouseOverRegion.name])
        }
        if (this.scanMode === 2) {
          this.roi2s = this.reduce([...this.roi2s, this.mouseOverRegion.name])
        }
      }
    },
    animationend: function (event) {
      if (event.animationName === 'flash') {
        this.warning = []
      }
    },
    getWarning: function (w) {
      switch (w) {
        case 'roi1':
          return `ROI1 must be selected.`
        case 'roi2':
          return `ROI2 must be selected.`
        case 'selectedgenes':
          return `At least 1 gene needs to be selected.`
        case 'hemisphere':
          return `If simple mode is off, at least 1 hemisphere needs to be selected.`
        default:
          return `Some other fields need to be filled.`
      }
    },
    validation: function () {
      this.warning = []
      if(this.roi1s.length > 0 && this.roi2s.length > 0 && this.selectedgenes.length > 0 && (this.simpleMode || (this.lefthemisphere || this.righthemisphere))){
        return true
      }
      const warning = []
      if(this.roi1s.length === 0){
        warning.push('roi1')
      }
      if(this.roi2s.length === 0){
        warning.push('roi2')
      }
      if(this.selectedgenes.length <= 0){
        warning.push('selectedgenes')
      }
      if(!this.simpleMode && !(this.lefthemisphere || this.righthemisphere)){
        warning.push('hemisphere')
      }
      this.warning = warning
      return false
    },
    nPermChange: function (ev) {
      const value = ev && ev.target && ev.target.value
      if (value && !isNaN(value))
        this.nPermutations = Number(ev.target.value)
    },
    startAnalysis: function () {

      const getMerge = (arr) => arr.map(v => 
        v.replace(/\W\(.*?\)$/,'').replace(/\W/g, '-').replace(/\./, '')).join(',')
      const PMAP_URL = VUE_APP_PMAP_URL || 'https://pmaps-sk-test-project.apps-dev.hbp.eu'
      const roi1Url = `${PMAP_URL}/multimerge?threshold=0.5&areas=${getMerge(this.roi1s)}&filename=happyface.nii`
      const roi2Url = `${PMAP_URL}/multimerge?threshold=0.5&areas=${getMerge(this.roi2s)}&filename=happyface.nii`
      
      if(!this.validation()){
        return
      }

      const roi1 = this.regionNamesUrlArray.find(r => r[0] === this.roi1s[0])
      const roi2 = this.regionNamesUrlArray.find(r => r[0] === this.roi2s[0])
        
      const body = {
        id: Date.now(),
        area1: {
          name: this.roi1s.join('-'),
          PMapURL: roi1Url || null
        },
        area2: {
          name: this.roi2s.join('-'),
          PMapURL: roi2Url || null
        },

        simpleMode: this.simpleMode,
        singleProbeMode: this.singleProbeMode,
        ignoreCustomProbe: this.ignoreCustomProbe,

        lh: this.lefthemisphere,
        rh: this.righthemisphere,
        selectedGenes: [...this.selectedgenes]
      }

      const id = Date.now().toString()
      fetch(`${VUE_APP_HOSTNAME}/analysis/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })
        .then(() => this.getListAnalysisResults())
        .then(() => this.launchResultPanel(id))
        .catch(this.catchError)

      // this.analyses.push(body)
    },
    removeRoi: function (idx, roi) {
      if (idx === 1) {
        this.roi1s = this.roi1s.filter(r => r !== roi)
      }
      if (idx === 2) {
        this.roi2s = this.roi2s.filter(r => r !== roi)
      }
      if (idx === 3) {
        this.selectedgenes = this.selectedgenes.filter(g => g !== roi)
      }
    },
    reduce: function (array) {
      return array.reduce((acc, curr) => {
        return new Set(acc).has(curr)
          ? acc
          : acc.concat(curr)
      }, [])
    },
    selectgene: function (gene) {
      this.selectedgenes = this.reduce([...this.selectedgenes, gene])
      this.$refs.genelist.$refs.input.focus()
    },
    selectSlice: function(roi1, roi2, refocus) {
      if (roi1) {
        this.roi1s = this.reduce([...this.roi1s, roi1])
      }
      if (roi2) {
        this.roi2s = this.reduce([...this.roi2s, roi2])
      }
      if (refocus) {
        if (roi1) {
          this.$refs.roi1.$refs.input.focus()
        }
        if (roi2) {
          this.$refs.roi2.$refs.input.focus()
        }
      }
    },
    toggleScanMode: function (idx) {
      this.scanMode = this.scanMode === idx
        ? null
        : idx
    }
  },
  computed: {
    geneListJSON: function () {
      return `data:text/plain;charset=utf-8,${JSON.stringify(this.selectedgenes)}`
    },
    hemisphereWarning : function(){
      return this.warning.findIndex(v => v === 'hemisphere') >= 0
    },
    roi1Warning: function(){
      return this.warning.findIndex(v => v === 'roi1') >= 0
    },
    roi2Warning: function(){
      return this.warning.findIndex(v => v === 'roi2') >= 0
    },
    selectedgenesWarning: function(){
      return this.warning.findIndex(v => v === 'selectedgenes') >= 0
    },
    autocomplete1Placeholder: function () {
      return `Search all the regions ...`
    },
    autocomplete2Placeholder: function () {
      return `Search all the regions ...`
    },
    autocompleteRawArray: function () {
      return this.regionNamesUrlArray.map(v => v[0])
    },
    isDefault: function () {
      return this.lefthemisphere && this.righthemisphere && this.nPermutations === 1000 && this.singleProbeMode && !this.ignoreCustomProbe
    }
  },
  beforeDestroy: function () {
    this.subscriptions.forEach(s => s.unsubscribe())
  },
  filters: {
    truncate: function (text, length = 50, clamp = '...') {
      return length >= 0
        ? text.length > length
          ? text.slice(0, length) + clamp
          : text
        : text
    }
  }
}
</script>
<style>
#fzj-xg-webjugex-container
{
  padding: 0.5em;
}
.fzj\.xg\.webjugex\.divider
{
  width: 100%;
  height: 0.5em;
}
.fzj\.xg\.webjugex\.formcontrol
{
  padding: 0;
}
.pill
{
  border: 1px solid rgba(128, 128, 128, 0.5);
}
.pill:not(:last-child)
{
  padding-bottom: 0;
  margin-bottom: 0;
}
.fzj\.xg\.webjugexFrontend\.autocomplete .autocomplete-suggestions
{
  background-color: rgba(50,50,50,0.8);
  color: rgba(210,210,210,1.0);
  padding: 0.2em;
}
.fzj\.xg\.webjugexFrontend\.autocomplete .autocomplete-suggestions.active
{
  background-color: rgba(110,110,110,0.8);
  color: rgba(250,250,250,1.0);
}
.fzj\.xg\.webjugexFrontend\.autocomplete .autocomplete-suggestions:hover
{
  background-color: rgba(80,80,80,0.8);
  color: rgba(230,230,230,1.0);
}

#fzj-xg-webjugex-container [webjugex-tooltip]
{
  position: relative;
}

#fzj-xg-webjugex-container [webjugex-tooltip]:after
{
  content: attr(webjugex-tooltip);
  position: absolute;
  top: 3em;
  right: 0;
  color:white;
  background-color:rgba(0,0,0,0.7);
  width: 10em;
  white-space: normal;
  display: inline-block;
  padding: 0.2em;
  pointer-events: none;
  transition: all 0.2s;
  opacity: 0;

  padding: 0.5em;
}

#fzj-xg-webjugex-container [webjugex-tooltip]:hover:after
{
  opacity: 1;
}

.fzj-xg-webjugex-fade-enter-active,
.fzj-xg-webjugex-fade-leave-active
{
  transition: opacity 0.3s;
}

.fzj-xg-webjugex-fade-enter,
.fzj-xg-webjugex-fade-leave-to
{
  opacity: 0;
}

#fzj-xg-webjugex-container .btn-inactive
{
  transition: all 0.2s;
  color:rgba(0,0,0,0.5);
  text-shadow: 1px 0 0 rgba(0, 0, 0, 0.15),
    -1px 0 0 rgba(0, 0, 0, 0.15),
    0 1px 0 rgba(0, 0, 0, 0.15),
    0 -1px 0 rgba(0, 0, 0, 0.15);
}

#fzj-xg-webjugex-container .btn-active
{
  transition: all 0.2s;
  color:rgba(200, 255, 125, 1.0);
  text-shadow: 1px 0 0 rgba(0, 255, 0, 0.15),
    -1px 0 0 rgba(0, 255, 0, 0.15),
    0 1px 0 rgba(0, 255, 0, 0.15),
    0 -1px 0 rgba(0, 255, 0, 0.15);
}

[darktheme="true"] .input-group-text
{
  border:none;
  background-color: rgba(50, 50, 50, 0.8);
  color:white;
}

[darktheme="true"] #fzj-xg-webjugex-container .checkbox-dial
{
  background-color:rgba(210,210,210,1.0);
}

[darktheme="true"] #fzj-xg-webjugex-container .checkbox-on
{
  background-color:rgba(50,150,50,1.0);
}

@keyframes flash{
  0% {
    outline:2px solid rgba(250, 100, 100, 0.0);
  }
  10% {
    outline:2px solid rgba(250, 100, 100, 0.9);
  }
  100% {
    outline:2px solid rgba(250, 100, 100, 0.0);
  }
}

[warning]
{
  animation:5.5s linear flash;
}

.fzj-xg-webjugex-analysis-container > *
{
  margin-bottom: 0;
}
.fzj-xg-webjugex-advanced-menu
{
  position:absolute;
  margin-top:2.5em;
  width:100%;
}
.fzj-xg-webjugex-fg-0
{
  flex-grow: 0!important;
}

.fzj-xg-webjugex-hover-default:hover
{
  cursor: default;
}

.fzj-xg-webjugex-pointer-events
{
  pointer-events:none
}

</style>
