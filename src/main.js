import Vue from 'vue'
import App from './components/App'

setTimeout(() => {
  new Vue({
    el: '#fzj-xg-webjugex-container',
    render: h => h(App)
  })
})