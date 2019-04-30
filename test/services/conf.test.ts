import {expect} from 'chai'
import * as globby from 'globby'
import * as path from 'path'

describe('markdown', () => {
  it('should return h1 with a class rde-h1', async () => {
    const paths = await globby(['**/package.json'], {
      cwd: path.resolve(__dirname, '../run')
    })

    expect(paths.length).to.equal(2)
  })
})
