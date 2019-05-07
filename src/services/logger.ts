import * as signale from 'signale'

signale.config({
  displayBadge: true,
  displayTimestamp: true,
})

const {Signale} = signale
export const logger = signale.scope('RDE')

class Spinner {
  public readonly interval = 80

  public readonly frames = [
    ['🌑 ', '🌒 ', '🌓 ', '🌔 ', '🌕 ', '🌖 ', '🌗 ', '🌘 '],
    ['🙈 ', '🙈 ', '🙉 ', '🙊 '],
    ['.  ', '.. ', '...', ' ..', '  .', '   '],
    ['[    ]', '[=   ]', '[==  ]', '[=== ]', '[ ===]', '[  ==]', '[   =]', '[    ]',
      '[   =]', '[  ==]', '[ ===]', '[====]', '[=== ]', '[==  ]', '[=   ]'],
    ['🌲', '🎄'],
    ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  ]

  public logger = null

  public timerId = null

  public counter = 0

  constructor() {}

  public start(info) {
    if (!this.logger) {
      this.logger = new Signale({interactive: true, scope: 'RDE'})
      this.logger.config({
        displayBadge: true,
        displayTimestamp: true,
      })
    }

    if (this.timerId) {
      clearInterval(this.timerId)
    }

    const index = Math.floor(Math.random() * this.frames.length)
    const frames = this.frames[index]
    this.timerId = setInterval(() => {
      this.counter = this.counter % (frames.length)
      this.logger.await(`%s: ${info}`, frames[this.counter])
      this.counter++
    }, this.interval)
  }

  public stop() {
    clearInterval(this.timerId)
    this.logger = null
  }
}

export const spinner = new Spinner()

// only for async function
export default function log(message) {
  return (_t, _p, descriptor) => {
    const origin = descriptor.value
    if (typeof origin !== 'function') {
      return
    }

    descriptor.value = async function (...args) {
      let now = +new Date()
      const result = await origin.apply(this, args)

      logger.info(message, '| costing：', +new Date() - now, 'ms')
      return result
    }

    return descriptor
  }
}
