import {expect} from 'chai'
import * as sinon from 'sinon'

import mapping from '../../src/services/mapping'

const sandbox = sinon.createSandbox()
let mappings = [{
  from: '/app',
  to: 'src/test',
}, {
  from: '/app/test/',
  to: 'src/',
}, {
  from: '/app/abc.js',
  to: 'src/test/abcd.js',
}]

describe('mapping', () => {
  before(() => {
    sandbox.stub(mapping, 'getMappings').returns(mappings)
  })

  after(() => {
    sandbox.restore()
  })

  it('should return correct destPath with from path', async () => {
    const destPath = mapping.dest2From('src/abc.js')
    expect(destPath).to.equal('app/test/abc.js')
  })

  it('should return correct srcPath with dest path', async () => {
    const destPath = mapping.from2Dest('app/test/abc.js')
    expect(destPath).to.equal('src/abc.js')
  })

  it('should return correct destPath with from path if matches two mapping', async () => {
    const destPath = mapping.from2Dest('app/test/abc.js')
    expect(destPath).to.equal('src/abc.js')
  })

  it('should return correct srcPath with dest path if matches two mapping', async () => {
    const destPath = mapping.dest2From('src/test/test/abc.js')
    expect(destPath).to.equal('app/test/abc.js')
  })

  it('should return correct destPath with from path if type is file', async () => {
    const destPath = mapping.from2Dest('app/abc.js')
    expect(destPath).to.equal('src/test/abcd.js')
  })

  it('should return correct srcPath with from destPath if type is file', async () => {
    const destPath = mapping.dest2From('src/test/abcd.js')
    expect(destPath).to.equal('app/abc.js')
  })
})
