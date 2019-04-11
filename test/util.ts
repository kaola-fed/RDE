import _ from '../src/util'

describe('utils', () => {
  describe('getNpmPkgInfo', () => {
    it('should return correct npm info if exist', async () => {
      try {
        const result = await _.getNpmPkgInfo('nek-ui')
        result.name.should.equal('nek-ui')
      } catch (e) {
        e.isNull()
      }
    })

    it('should throw an error if not exist', async () => {
      try {
        await _.getNpmPkgInfo('some-unexist-pkg-of-kaola')
      } catch (e) {
        e.isNull()
      }
    })
  })
})
