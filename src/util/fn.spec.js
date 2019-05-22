
import { expect } from 'chai'
import { sanitizeAreaName } from './fn'

const testCases = [
  ['Area TE 1.1 (HESCHL)', 'Area-TE-11']
]

describe('mocha works', () => {
  it('works', () => {
    expect(1).to.be.equal(1)
  })
})

describe('fn.js', () => {
  it('filters name correctly', () => {
    testCases.forEach(pair => {
      expect(sanitizeAreaName(pair[0])).to.be.equal(pair[1])
    })
  })
})