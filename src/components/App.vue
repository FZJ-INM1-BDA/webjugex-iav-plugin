<template>
  <div>
    <div
      v-if="active"
      @animationend = "animationend($event)"
      id = "fzj-xg-webjugex-container">

      <!-- description -->
      <DescBlock />

      <div class="fzj.xg.webjugex.divider"></div>

      <!-- roi selection -->
      <RoiSelector
        ref="roi1Selector"
        label="Region(s) 1"
        class="position-relative"
        style="z-index:6"
        placeholderText="Search & Add ROI 1"
        @DisableRoi1scan="$refs.roi2Selector.deactivateScan()"
        :warning="roi1Warning"
        :autocompleteArray="regionAutocompleteRawArray">
      </RoiSelector>

      <RoiSelector
        ref="roi2Selector"
        label="Region(s) 2"
        class="position-relative"
        style="z-index:5"
        placeholderText="Search & Add ROI 2"
        @DisableRoi1scan="$refs.roi1Selector.deactivateScan()"
        :warning="roi2Warning"
        :autocompleteArray="regionAutocompleteRawArray">
      </RoiSelector>

      <!-- genelist -->
      <GeneSelector
        ref="geneSelector"
        class="position-relative"
        label="Gene(s)"
        style="z-index:4"
        :warning="selectedgenesWarning">
      </GeneSelector>

      <div class="fzj.xg.webjugex.divider"></div>

      <!-- analysis GO -->
      <div class="w-100 mb-1">
        <div
          @click="showAdvancedMenu = !showAdvancedMenu"
          class="btn btn-secondary w-100"
          data-toggle="dropdown">
          <div class="d-flex align-items-center">
          <span style="flex: 1">Settings</span>
          <i :class="'fas ' + (showAdvancedMenu? 'fa-angle-up' : 'fa-angle-down')"></i>
          </div>
        </div>

        <!-- advanced menu -->
        <Advanced
          @updateIsDefault="advancedIsDefault = $event"
          ref="advancedRef"
          style="z-index:3"
          class="bg-dark p-3 w-100"
          v-show="showAdvancedMenu"/>
      </div>

      <div class="bg-dark">
        <div>
          Differential Analysis
        </div>
        <div @click = "startAnalysis(), $refs.roi1Selector.deactivateScan(), $refs.roi2Selector.deactivateScan()"
          :class="(initAnalysisFlag ? 'text-muted' : '') + ' btn btn-secondary d-inline-block'">
          <i class="fas fa-running"></i>
          <span>
            Run
          </span>
          <span v-if="!advancedIsDefault" class="text-warning">
            <i class="fas fa-exclamation-triangle"></i>
          </span>
        </div>

        <SaveNb class="d-inline-block" v-bind="saveNbObj"/>
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

      <AnalysisCard v-show="this.analysisId" :vue-id="analysisId"/>

    </div>
    <h5
      class="p-2 text-muted"
      v-else>
      JuGEx only works with JuBrain Cytoarchitectonic Atlas in MNI 152 ICBM 2009c Nonlinear Asymmetric template space.
    </h5>
  </div>
</template>
<script>

import { Readmore, AutoComplete, Pill, CheckBox } from 'vue-components'
import AnalysisCard from './Analysis'
import Vue from 'vue'
import { sanitizeAreaName, validateGetError, prepareAnalysisBody } from '../util/fn'
import RoiSelector from './RoiSelector'
import GeneSelector from './GeneSelector'
import Advanced, { defaultConfig } from './Advanced'
import DescBlock from './Desc'
import PastAnalysis from './PastAnalysis'
import SaveNb from './SaveNb'

const fA = (arr) => (arr && arr.concat(
  ...arr.map(item =>item.children && item.children.length
    ? fA(item.children)
    : [])) || []
)

import { allowedParcellationName, allowedTemplateSpaces, baseUrl } from './constants' 
import { workspaceMixin } from './mixin'

export default {
  components: {
    AutoComplete,
    Pill,
    Readmore,
    CheckBox,
    AnalysisCard,
    RoiSelector,
    GeneSelector,
    Advanced,
    DescBlock,
    PastAnalysis,
    SaveNb,
  },
  
  /** 
    * key values in non standard vue components (ie, not in data, or methods), can be accessed via this.$options[OPTION_NAME]
    * the advantage is that these properties are non reactive. Thus Vue framework does not attach getters and setters. 
    */
  nonReactive: {
    toastHandler: null,
    subscriptions: []
  },
  mixins:[
    workspaceMixin
  ],
  props: {
    formPostEndpointRoot: {
      type: String,
      default: `${baseUrl}/user`
    }
  },
  data: function () {
    return {
      refsReady: false,

      activeParcellationName: null,
      activeTemplateName: null,

      regionNamesUrlArray: [],
      
      warning : [],

      /**
       * complex mode
       */
      showAdvancedMenu: false,

      /**
       * analysis
       */
      listAnalysis: [],

      advancedIsDefault: true,
      initAnalysisFlag: false,

      getNewName: null,

      launchPastAnalysis: null,

      analysisId: null
    }
  },
  mounted: function () {

    this.getNewName = window.interactiveViewer.uiHandle.getUserInput
      ? val => window.interactiveViewer.uiHandle.getUserInput({
          title: 'Rename webJuGEx Analysis',
          message: 'Enter a new name for this analysis',
          defaultValue: val,
          placeholder: 'Enter a new name for this analysis'
        })
      : null

    this.launchPastAnalysis = ({ id, workspaceMixin__queryParam }) => fetch(`${baseUrl}/analysis/i-v-manifest/${id}${workspaceMixin__queryParam || ''}`)
      .then(res => res.json())
      .then(json => window.interactiveViewer.uiHandle.launchNewWidget(json))
    
    const toastHandler = interactiveViewer.uiHandle.getToastHandler()
    toastHandler.dismissable = false
    toastHandler.timeout = -1
    
    this.$options.nonReactive.toastHandler = toastHandler

    this.$options.nonReactive.subscriptions.push(
      interactiveViewer.metadata.selectedParcellationBSubject.subscribe(({ name, regions } = {}) => {
        this.activeParcellationName = name
        this.regionNamesUrlArray = fA(regions).filter(v => v.labelIndex).map(v => [v.name, v])
      })
    )

    this.$options.nonReactive.subscriptions.push(
      interactiveViewer.metadata.selectedTemplateBSubject.subscribe(({name} ={}) => {
        this.activeTemplateName = name
      })
    )
  },
  methods: {
    setWorksSpace: function (val) {
      if (val === '') return
      this.workspaceMixin__setWorkspace(val)

      /**
       * side effects of setting workspace
       */
      this.listAnalysis = []
      this.getListAnalysisResults()
    },
    openOldAnalysis: function (id) {
      this.launchResultPanel(id)
        .catch(this.catchError)
    },
    launchResultPanel: function (id) {
      return fetch(`${VUE_APP_HOSTNAME}/analysis/i-v-manifest/${id}${this.workspaceMixin__queryParam || ''}`)
        .then(res => res.json())
        .then(json => window.interactiveViewer.uiHandle.launchNewWidget(json))
    },
    deleteAnalysis: function (id) {
      fetch(`${VUE_APP_HOSTNAME}/analysis/${id}${this.workspaceMixin__queryParam || ''}`, {
        method: 'DELETE'
      }).then(this.getListAnalysisResults)
        .catch(this.getListAnalysisResults)
    },
    getListAnalysisResults: function () {
      fetch(`${VUE_APP_HOSTNAME}/analysis/list${this.workspaceMixin__queryParam || ''}`)
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
        default:
          return `Some other fields need to be filled.`
      }
    },
    startAnalysis: function () {

      if (this.initAnalysisFlag) return
      
      const { roi1Selector, roi2Selector, geneSelector, advancedRef } = this.$refs
      const { 
        nPermutations,
        threshold,
        singleProbeMode,
        ignoreCustomProbe
       } = advancedRef || defaultConfig

      const roi1s = roi1Selector.selectedRois
      const roi2s = roi2Selector.selectedRois
      const genes = geneSelector.selectedGenes

      this.warning = []
      this.warning = validateGetError({
        roi1s,
        roi2s,
        genes
      })
      if (this.warning.length > 0) return
      
      /**
       * send the prepared payload to past analysis 
       */
      const [error, body] = prepareAnalysisBody({
        roi1s,
        roi2s,
        genes,

        nPermutations,
        threshold,
        singleProbeMode,
        ignoreCustomProbe
      })
      this.initAnalysisFlag = true
      this.newAnalysis(body)
        .then(() => {
          this.initAnalysisFlag = false
        })
        .catch(console.error)
    },
    newAnalysis: function (payload) {
      const { id, ...body } = payload
      return fetch(`${baseUrl}/analysis/${id}${this.workspaceMixin__queryParam || ''}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }).then(() => this.analysisId = id)
    },
  },
  updated() {
    const { roi1Selector, roi2Selector, geneSelector, advancedRef } = this.$refs
    if (roi1Selector && roi2Selector && geneSelector) this.refsReady = true
  },
  computed: {
    saveNbObj: function () {

      if (!this.refsReady) return {}
      
      const { roi1Selector, roi2Selector, geneSelector, advancedRef } = this.$refs
      const { 
        nPermutations,
        threshold,
        singleProbeMode,
        ignoreCustomProbe
      } = advancedRef || defaultConfig

      return {
        roi1: roi1Selector && roi1Selector.selectedRois,
        roi2: roi2Selector && roi2Selector.selectedRois,
        genes: geneSelector && geneSelector.selectedGenes,
        nPermutations: Number(nPermutations),
        threshold: Number(threshold),
      }
    },
    active: function () {
      return this.activeParcellationName && this.activeTemplateName
        && allowedParcellationName.indexOf(this.activeParcellationName) >= 0
        && allowedTemplateSpaces.indexOf(this.activeTemplateName) >= 0
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
    regionAutocompleteRawArray: function () {
      return this.regionNamesUrlArray.map(v => v[0])
    }
  },
  beforeDestroy: function () {
    window.interactiveViewer.uiHandle.cancelPromise(
      window.interactiveViewer.uiHandle.getUserToSelectARegion
    )
    this.$options.nonReactive.subscriptions.forEach(s => s.unsubscribe())
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
  left: 0;
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
