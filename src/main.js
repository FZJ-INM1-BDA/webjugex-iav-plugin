import Vue from 'vue'
import App from './components/App'

/**
 * Normally, you would need to wrap any reference to DOM element in a setTimeout function call,
 * as template is rendered after script is parsed and executed.
 * wrapping the function call in a Promise achieve the same effect
 */
window.interactiveViewer.pluginControl.loadExternalLibraries(['vue@2.5.16'])
  .then(() => {
    const app = new Vue({
      el: '#fzj-xg-webjugex-container',
      render: h => h(App)
    })

    window.interactiveViewer.pluginControl[PLUGIN_NAME].onShutdown(() => {
      app.$destroy()
      window.interactiveViewer.pluginControl.unloadExternalLibraries(['vue@2.5.16'])
    })
  })
  .catch(console.error)