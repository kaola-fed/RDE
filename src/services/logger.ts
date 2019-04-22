import {Signale} from 'signale'

export const logger = new Signale({
  scope: 'rde',
})

class Spinner {
  public readonly interval = 80

  public readonly frames = ['🌑 ', '🌒 ', '🌓 ', '🌔 ', '🌕 ', '🌖 ', '🌗 ', '🌘 ']

  public logger = null

  public timerId = null

  public counter = 0

  constructor() {}

  public start(info) {
    if (!this.logger) {
      this.logger = new Signale({interactive: true, scope: 'rde'})
    }

    if (this.timerId) {
      clearInterval(this.timerId)
    }

    this.timerId = setInterval(() => {
      this.counter = this.counter % (this.frames.length)
      this.logger.await(`${info} : %s`, this.frames[this.counter])
      this.counter++
    }, this.interval)
  }

  public stop() {
    clearInterval(this.timerId)
    this.logger = null
  }
}

export const spinner = new Spinner()
