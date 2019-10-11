import { WORKSPACE_STRING } from './constants'

export const workspaceMixin = {
  data: function () {
    return {
      workspaceMixin__workspace: 'public',
      workspaceMixin__listAnalysis: []
    }
  },
  mounted() {
    this.workspaceMixin__workspace = localStorage.getItem(WORKSPACE_STRING) || 'public'
  },
  computed: {
    workspaceMixin__queryParam: function () {
      const param = new URLSearchParams()
      param.set('workspace', this.workspaceMixin__workspace)
      return '?' + param.toString()
    }
  },
  methods: {
    workspaceMixin__deleteAnalysis: function ({ id }) {
      return fetch(`${VUE_APP_HOSTNAME}/analysis/${id}${this.workspaceMixin__queryParam || ''}`, {
        method: 'DELETE'
      })
    },
    workspaceMixin__editName: function ({ id, name }) {
      return fetch(`${VUE_APP_HOSTNAME}/analysis/${id}${this.workspaceMixin__queryParam || ''}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name
        })
      })
    },
    workspaceMixin__getListAnalysisResults: function () {
      return fetch(`${VUE_APP_HOSTNAME}/analysis/list${this.workspaceMixin__queryParam || ''}`)
        .then(res => res.json())
    },
    workspaceMixin__setWorkspace: function (val) {
      localStorage.setItem(WORKSPACE_STRING, val)
      this.workspaceMixin__workspace = val
    }
  }
}