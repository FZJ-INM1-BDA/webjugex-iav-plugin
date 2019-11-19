<template>
  <form autocomplete="off" class="p1 bg-dark mb-2">
    <div
      @keydown.enter.prevent
      class="input-group">
      <auto-complete
        :searchFromStart="true"
        :warning="warning"
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
        :webjugex-tooltip="exportTooltip" 
        class="input-group-btn">
        <div
          :disabled="selectedGenes.length === 0"
          @click="exportGeneJSON"
          :class="selectedGenes.length === 0 ? 'fzj-xg-webjugex-pointer-events text-muted' : ''"
          class="btn btn-default">
          Export
          <a class="hidden" hidden download="genelist.json" ref="exportAnchor" :href="geneListJSON">Export Genelist as JSON</a>
        </div>
      </div>
    </div>
    <div class="d-flex flex-wrap">
      <pill
        class="pill"
        @remove-pill="removeGene(gene)"
        :name="gene"
        :key="gene"
        v-for="gene in selectedGenes" />
    </div>
  </form>
</template>

<script>
import { AutoComplete, Pill } from 'vue-components'
import { readFile } from '../util/fn'
import { baseUrl } from './constants'

export default {
  components: {
    AutoComplete,
    Pill
  },
  props: {
    warning: {
      type: Boolean,
      default: false,
    }
  },
  computed: {
    exportTooltip: function (){
      return this.selectedGenes.length === 0
        ? 'you need to have at least 1 gene selected to export'
        : 'saves the gene list as a comma separated, utf8 encoded csv file'
    },
    geneListJSON: function () {
      return `data:text/plain;charset=utf-8,${JSON.stringify(this.selectedgenes)}`
    }
  },
  data: function () {
    return {
      selectedGenes: [],
      allgenes: []
    }
  },
  mounted: function () {
    fetch(`${baseUrl}/genelist`)
      .then(res => res.json())
      .then(arr => this.allgenes = arr)
      .catch(this.catchError)
  },
  methods: {
    selectgene: function (gene) {
      if (this.selectedGenes.indexOf(gene) < 0) this.selectedGenes.push(gene)
      this.$refs.genelist.$refs.input.focus()
    },
    importGeneJSON: function () {
      const importInput = this.$refs.importGeneRef
      if (importInput) importInput.click()
      else {
        // TODO
        // reflect in UI
        console.error('import gene ref error')
      }
    },

    exportGeneJSON: function () {
      const anchor = this.$refs.exportAnchor
      if (anchor) anchor.click()
    },
    fileChosen: function (ev) {
      if (!(ev.target && ev.target.files)) {
        console.error('GeneSelector#fileChosen ev.target ev.target.files not found')
        return
      }
      if (ev.target.files.length !== 1) {
        console.error(`GeneSelector#fileChosen file selected !== 1`)
        return
      }
      readFile(file)
        .then(text => {
          
          /**
           * TODO
           * implement parse technique, such as
           * nl
           * csv
           * tsv
           * etc, depending on ext
           */
          return JSON.parse(text)
        })
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
    },
    removeGene: function (name) {
      this.selectedGenes = this.selectedGenes.filter(g => g !== name)
    }
  }
}
</script>

<style scoped>

</style>