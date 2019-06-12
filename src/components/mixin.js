import { WORKSPACE_STRING } from './constants'

export const workspaceMixin = {
  data: function () {
    return {
      workspaceMixin__workspace: 'public'
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
    workspaceMixin__setWorkspace: function (val) {
      localStorage.setItem(WORKSPACE_STRING, val)
      this.workspaceMixin__workspace = val
    }
  }
}