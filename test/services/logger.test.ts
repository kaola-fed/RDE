import {spinner} from '../../src/services/logger'

describe('logger', () => {
  it('should spin when using spinner', () => {
    spinner.start('Installing packages. This might take a while...')

    setTimeout(() => {
      spinner.stop()
    }, 2000)
  })
})
