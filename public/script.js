/**
 * use IIFE in order to avoid poisoning the global scope
 * use const/let. Avoid using var
 */
(() => {

  /**
   * pluginControl references plugin name. Good idea to defined it
   */
  const PLUGINNAME = `fzj.xg.pluginTemplate`
  const SUBSCRIPTIONS = []
  SUBSCRIPTIONS.push(
    interactiveViewer.metadata.datasetsBSubject.subscribe(ds => {
      /**
       * look into the datasets that had been loaded
       */
    })
  )

  /**
   * always unsubscribe on shutdown to avoid memory leakage
   */
  interactiveViewer.pluginControl[PLUGINNAME].onShutdown(() => {
    while(SUBSCRIPTIONS.length > 0){
      SUBSCRIPTIONS.pop().unsubscribe()
    }
  })
})()