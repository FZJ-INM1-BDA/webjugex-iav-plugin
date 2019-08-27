import { createAnalysis } from './vueSsrApp'

setTimeout(() => {
  const el = document.getElementById('fzj-xg-webjugex-placeholder')
  const queryId = el && el.dataset && el.dataset.queryId
  if (el && queryId) {
    const { analysis } = createAnalysis({
      queryId
    })
    analysis.$mount(el)

    interactiveViewer.pluginControl['fzj-xg-webjugex-placeholder'].onShutdown(() => {
      analysis.$destroy()
    })
  }

})