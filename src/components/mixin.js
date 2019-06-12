import { WORKSPACE_STRING } from './constants'

export const workspaceMixin = {
  data: function () {
    return {
      _workspaceMixin__workspace: 'public'
    }
  },
  mounted() {
    this.workspaceMixin__workspace = localStorage.getItem(WORKSPACE_STRING) || 'public'
  },
  computed: {
    workspaceMixin__workspace: {
      get: function () {
        return this._workspaceMixin__workspace
      },
      set: function (val) {
        localStorage.setItem(WORKSPACE_STRING, val)
        this._workspaceMixin__workspace = val
      }
    },
    workspaceMixin__queryParam: function () {
      const param = new URLSearchParams()
      param.set('workspace', this.workspaceMixin__workspace)
      return '?' + param.toString()
    }
  },
}