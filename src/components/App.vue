<template>
  <div
    @animationend = "animationend($event)"
    id = "fzj-xg-webjugex-container">

    <!-- description -->
    <readmore :collapsed-height = "40">
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
    <div class="input-group">
      <span class="input-group-addon">
        Simple mode
      </span>
      <check-box
        class = "fzj.xg.webjugex.checkbox"
        @togglecheckbox = "simpleMode = !simpleMode"
        :flag = "simpleMode"/>
    </div>

    <div class = "fzj.xg.webjugex.divider">
    </div>

    <!-- roi1 -->
    <div style = "z-index: 5" class="input-group">
      <div class="input-group-addon">
        ROI1
      </div>
      <auto-complete
        ref = "roi1"
        :warning = "roi1Warning"
        class = "form-control fzj.xg.webjugex.formcontrol fzj.xg.webjugexFrontend.autocomplete"
        @selectslice = "selectSlice($event, null, true)"
        :rawarray = "autocompleteRawArray"
        :placeholder = "autocomplete1Placeholder"/>
      <div class="input-group-btn">
        <div
          webjugex-tooltip = "toggle scan mode for ROI1"
          @click.stop.prevent = "toggleScanMode(1)"
          :class = "scanMode === 1 ? 'btn-active' : 'btn-inactive'"
          class="btn btn-default">
          <i class="glyphicon glyphicon-screenshot"></i>
        </div>
      </div>
    </div>
    <div>
      <pill
        class = "pill"
        @remove-pill = "removeRoi(1, roi)"
        :name = "roi"
        :key = "roi"
        v-for = "roi in roi1s" />
    </div>

    <!-- roi2 -->
    <div style = "z-index: 4" class="input-group">
      <div class="input-group-addon">
        ROI2
      </div>
      <auto-complete
        ref = "roi2"
        :warning = "roi2Warning"
        class = "form-control fzj.xg.webjugex.formcontrol fzj.xg.webjugexFrontend.autocomplete"
        @selectslice = "selectSlice(null, $event, true)"
        :rawarray = "autocompleteRawArray"
        :placeholder = "autocomplete2Placeholder"/>
      <div class="input-group-btn">
        <div
          webjugex-tooltip = "toggle scan mode for ROI2"
          @click.stop.prevent = "toggleScanMode(2)"
          :class = "scanMode === 2 ? 'btn-active' : 'btn-inactive'"
          class="btn btn-default">
          <i class="glyphicon glyphicon-screenshot"></i>
        </div>
      </div>
    </div>
    <div>
      <pill
        class = "pill"
        @remove-pill = "removeRoi(2, roi)"
        :name = "roi"
        :key = "roi"
        v-for = "roi in roi2s" />
    </div>

    <div class = "fzj.xg.webjugex.divider">
    </div>

    <!-- genelist -->
    <div style = "z-index: 3" class="input-group">
      <auto-complete
        :warning = "selectedgenesWarning"
        class = "form-control fzj.xg.webjugex.formcontrol fzj.xg.webjugexFrontend.autocomplete"
        ref = "genelist"
        :rawarray = "allgenes"
        @selectslice = "selectgene"/>
      <div class="input-group-btn">
        <div
          webjugex-tooltip = "accepts a comma delimited utf-8 encoded file"
          class="btn btn-default">
          Import
        </div>
      </div>
      <div class="input-group-btn">
        <div
          webjugex-tooltip = "saves the gene list as a comma delimited, utf8 encoded csv file" 
          class="btn btn-default">
          Export
        </div>
      </div>
    </div>
    <div>
      <pill
        class = "pill"
        @remove-pill = "removeRoi(3, gene)"
        :name = "gene"
        :key = "gene"
        v-for = "gene in selectedgenes" />
    </div>

    <div class="fzj.xg.webjugex.divider"></div>

    <!-- complex mode -->
    <transition name = "fzj-xg-webjugex-fade">
      <div v-if = "!simpleMode">

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
            Number of permutations
          </span>
          <input v-model = "nPermutations" type="text" class="form-control">
        </div>
      
        <div class="fzj.xg.webjugex.divider"></div>  
      </div>
    </transition>

    <div class="fzj.xg.webjugex.divider"></div>

    <!-- analysis GO -->
    <div 
      @click = "startAnalysis"
      class="btn btn-default btn-block">
      Start Differential Analysis
    </div>
    
    <!-- warning -->
    <transition name = "fzj-xg-webjugex-fade">
      <div style = "margin-top:0.5em" class = "alert alert-danger" v-if = "warning.length > 0">
        <i class="glyphicon glyphicon-alert"></i> WARNING: 
        <ul>
          <li :key = "w" v-for = "w in warning">
            {{ getWarning(w) }}
          </li>
        </ul>
      </div>
    </transition>

    <div class="fzj.xg.webjugex.divider"></div>

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

export default {
  components: {
    AutoComplete,
    Pill,
    Readmore,
    CheckBox,
    AnalysisCard
  },
  data: function () {
    return {
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
      simpleMode: true,
      singleProbeMode: true,
      ignoreCustomProbe:false,
      lefthemisphere:true,
      righthemisphere:true,
      nPermutations:1000,

      /**
       * analysis
       */
      analyses: []
    }
  },
  mounted: function () {
    this.subscriptions.push(
      window.interactiveViewer.metadata.datasetsBSubject
        .subscribe(array => {
          this.regionNamesUrlArray = array
            .filter(item => item.type === 'Probabilistic cytoarchitectonic map'
              && typeof item.regionName !== 'undefined' 
              && item.regionName.constructor === Array 
              && item.regionName.length > 0
              && typeof item.files !== 'undefined'
              && item.files.constructor === Array
              && item.files.length > 0
              && typeof item.files[0].url !== 'undefined')
            .map(item => [item.regionName[0].regionName, item.files[0].url])
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

    fetch(VUE_APP_BACKEND_URL)
      .then(res => res.json())
      .then(arr => this.allgenes = arr)
      .catch(this.catchError)
  },
  methods: {
    catchError: function (e) {
      console.log(e)
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
    startAnalysis: function () {
      if(!this.validation()){
        return
      }
        
      const body = {
        id: Date.now(),
        area1: {
          name: this.roi1s.join('-'),
          PMapURL: this.regionNamesUrlArray.find(r => r[0] === this.roi1s[0])[1]
        },
        area2: {
          name: this.roi2s.join('-'),
          PMapURL: this.regionNamesUrlArray.find(r => r[0] === this.roi2s[0])[1]
        },

        simpleMode: this.simpleMode,
        singleProbeMode: this.singleProbeMode,
        ignoreCustomProbe: this.ignoreCustomProbe,

        lh: this.lefthemisphere,
        rh: this.righthemisphere,
        selectedGenes: [...this.selectedgenes]
      }

      this.analyses.push(body)
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
    }
  },
  beforeDestroy: function () {
    this.subscriptions.forEach(s => s.unsubscribe())
  }
}
</script>
<style>
#fzj-xg-webjugex-container
{
  padding: 0.5em;
  padding-bottom: 5em;
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
</style>
