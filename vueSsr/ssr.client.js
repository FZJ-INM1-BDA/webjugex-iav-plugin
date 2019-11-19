import { createApp } from './vueSsrApp'
const { app } = createApp()

/**
 * TODO need to dynamically generate id
 */
setTimeout(() => {
  app.$mount('#fzj-xg-webjugex')
})