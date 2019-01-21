import Vue from 'vue'
import App from './components/App'

/**
 * Normally, you would need to wrap any reference to DOM element in a setTimeout function call,
 * as template is rendered after script is parsed and executed.
 * wrapping the function call in a Promise achieve the same effect
 */
window.interactiveViewer.pluginControl.loadExternalLibraries(['vue@2.5.16'])
  .then(() => {
    new Vue({
      el: '#fzj-xg-vue-template-container',
      render: h => h(App)
    })
  })
  .catch(console.error)