import App from '../src/components/App'
import Analysis from '../src/components/Analysis'
import Vue from 'vue'

export const createApp = () => {
  return {
    app : new Vue({
      render: h => h(App)
    })
  }
}

export const createAnalysis = ({ queryId }) => {
  return {
    analysis: new Vue({
      data: function () {
        return {
          queryId
        }
      },
      render: h => h(Analysis)
    })
  }
}