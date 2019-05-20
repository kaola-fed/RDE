import {expect} from 'chai'
import * as semver from 'semver'

describe('semver', () => {
  it('should update version correctly', () => {
    let version = semver.inc('0.0.1', 'prerelease')
    expect(version).to.equal('0.0.2-0')

    version = semver.inc('0.0.0', 'prerelease', 'beta')
    expect(version).to.equal('0.0.1-beta.0')

    version = semver.inc('0.0.1', 'prerelease', 'beta')
    expect(version).to.equal('0.0.2-beta.0')

    version = semver.inc('0.0.1-beta.1', 'prerelease')
    expect(version).to.equal('0.0.1-beta.2')

    version = semver.inc('0.0.1-beta.1', 'prerelease', 'beta')
    expect(version).to.equal('0.0.1-beta.2')
  })
})
