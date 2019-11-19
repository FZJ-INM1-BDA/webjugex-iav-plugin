import Vue from 'vue'
import StandAlone from './views/StandAlone'
import './util/useMaterial'

new Vue({
  el: '#container',
  render: h => h(StandAlone)
})