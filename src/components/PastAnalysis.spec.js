import Vue from 'vue'
import PastAnalysis from './PastAnalysis.vue'
import { expect, assert } from 'chai'
import sinon from 'sinon'

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

  global.fetch = () => {}
  global.localStorage = {
    setItem: () => {},
    getItem: () => {}
  }
  const fetchAnalysisList = sinon.stub(global, 'fetch')
  fetchAnalysisList.resolves({
    json: () => testAnalyses
  })

  const localStorageGetItem = sinon.stub(global.localStorage, 'getItem')
  const localStorageSetItem = sinon.stub(global.localStorage, 'setItem')

  it('on mount, get list', async () => {
    const vm = new Vue(PastAnalysis)
    vm.$mount()
    await Vue.nextTick()
    assert(fetchAnalysisList.called)
    expect(vm.listAnalysis).to.be.deep.equal(testAnalyses)
  })
})