<template>
  <div>
    
    <!-- change workspace -->
    <div class="input-group input-group-sm">
      <input
        v-model="workspaceInput"
        :placeholder="workspace"
        @keydown.esc="workspaceInput = ''"
        @keydown.enter="setWorksSpace(workspaceInput);workspaceInput = ''"
        type="text"
        class="form-control form-control-sm"
        autocomplete="off">
      <div class="input-group-append">
        <div
          @click="setWorksSpace(workspaceInput);workspaceInput = ''"
          class="btn btn-default">
          Change WorkSpace
        </div>
      </div>
    </div>

    <div class = "fzj.xg.webjugex.divider">
    </div>

    <div v-if="listAnalysis.length > 0">
      Past analysis:
    </div>

    <div class="d-flex flex-wrap">
      <div
        :key="analysis.id"
        v-for="analysis in listAnalysis"
        class="btn-group mb-1">
        <button
          @click="openOldAnalysis(analysis)"
          type="button"
          class="btn btn-sm btn-secondary">
          {{ analysis.name || (analysis.id | dateFilter) }}
        </button>
        <button
          @click="editName(analysis)"
          v-if="canBeEdited"
          type="button"
          class="btn btn-sm btn-secondary">
          <i class="far fa-edit"></i>
        </button>
        <button
          @click="deleteAnalysis(analysis)"
          v-if="canBeEdited"
          type="button"
          class="btn btn-sm btn-secondary">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import { workspaceMixin } from './mixin'
export default {
  mixins: [
    workspaceMixin
  ],
  computed: {
    workspace: function () {
      return this.workspaceMixin__workspace
    }
  },
  data: function () {
    return {
      workspaceInput: '',
      listAnalysis: [],
      canBeEdited: false,
      busyAnalyses: []
    }
  },
  mounted: function () {
    this.getListAnalysisResults()
    if (window.interactiveViewer.uiHandle.getUserInput) {
      this.canBeEdited = true
    }
  },
  methods: {
    newAnalysis: function (payload) {
      const { id, ...body } = payload
      return new Promise((resolve, reject) => {
        fetch(`${VUE_APP_HOSTNAME}/analysis/${id}${this.workspaceMixin__queryParam || ''}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        })
          .then(() => this.getListAnalysisResults())
          .then(() => this.launchResultPanel(id))
          .then(resolve)
          .catch(reject)
      })
    },
    editName: function ({id, name}) {
      window.interactiveViewer.uiHandle.getUserInput({
        title: 'Rename webJuGEx Analysis',
        message: 'Enter a new name for this analysis',
        defaultValue: name || val,
        placeholder: 'Enter a new name for this analysis'
      }).then(newValue => {
        this.busyAnalyses.push({ id })
        return fetch(`${VUE_APP_HOSTNAME}/analysis/${id}${this.workspaceMixin__queryParam || ''}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: newValue
          })
        })
      }).catch(() => {
        /**
         * user cancelled, no big deal
         */
      }).finally(() => {
        this.busyAnalyses = this.busyAnalyses.filter(({ id: _id }) => id === _id)
      })
    },
    setWorksSpace: function (val) {
      this.workspaceMixin__setWorkspace(val)

      /**
       * side effects of setting workspace
       */
      this.listAnalysis = []
      this.getListAnalysisResults()
    },
    getListAnalysisResults: function () {
      fetch(`${VUE_APP_HOSTNAME}/analysis/list${this.workspaceMixin__queryParam || ''}`)
        .then(res => res.json())
        .then(arr => this.listAnalysis = arr)
        .catch(console.error)
    },
    openOldAnalysis: function ({ id }) {
      this.launchResultPanel(id)
        .catch(console.error)
    },
    launchResultPanel: function (id) {
      return fetch(`${VUE_APP_HOSTNAME}/analysis/i-v-manifest/${id}${this.workspaceMixin__queryParam || ''}`)
        .then(res => res.json())
        .then(json => window.interactiveViewer.uiHandle.launchNewWidget(json))
    },
    deleteAnalysis: function ({id}) {
      fetch(`${VUE_APP_HOSTNAME}/analysis/${id}${this.workspaceMixin__queryParam || ''}`, {
        method: 'DELETE'
      }).then(this.getListAnalysisResults)
        .catch(this.getListAnalysisResults)
    },
  },
  filters: {
    dateFilter: function (value) {
      if (!value) return `Undated`
      const d = new Date(Number(value))
      return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}`
    }
  }
}
</script>
<style>
  
</style>