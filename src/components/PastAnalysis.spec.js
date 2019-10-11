import Vue from 'vue'
import PastAnalysis from './PastAnalysis.vue'
import fetchMock from 'fetch-mock'
import { expect, assert } from 'chai'

const VUE_APP_HOSTNAME = process.env.VUE_APP_HOSTNAME || 'http://localhost:3001'
const testAnalyses = [{
  id: 123,
  name: 'hello world'
}, {
  id: 222,
  name: 'foo bar'
}, {
  id: 1
}]
describe('PastAnalysis.vue', () => {

  it('on mount, get list', (done) => {
    const listApi = fetchMock.mock(/\/analysis\/list/, {
      status: 200,
      body: testAnalyses
    })

    const vm = new Vue(PastAnalysis)

    /**
     * TODO ugly
     */
    vm.$on('hook:mounted', () => {
      vm.$nextTick(() => {

        expect(vm.listAnalysis).to.be.deep.equal(testAnalyses)
        done()
      })
    })

    vm.$mount()
    assert(listApi.called)
  })
})