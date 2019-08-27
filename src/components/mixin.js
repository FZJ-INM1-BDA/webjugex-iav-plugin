import { WORKSPACE_STRING } from './constants'

const sharedState = {
  workspaceMixin__workspace: 'public'
}

export const workspaceMixin = {
  data: function () {
    return sharedState
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
    workspaceMixin__setWorkspace: function (val) {
      localStorage.setItem(WORKSPACE_STRING, val)
      this.workspaceMixin__workspace = val
    }
  }
}