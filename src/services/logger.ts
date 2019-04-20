import {Signale} from 'signale'

export const logger = new Signale({
  scope: 'rde',
})

export class Spinner {
  public readonly interval = 80

  public readonly frames = ['🌑 ', '🌒 ', '🌓 ', '🌔 ', '🌕 ', '🌖 ', '🌗 ', '🌘 ']

  public logger = null

  public timerId = null

  public counter = 0

  public start(info) {
    this.logger = new Signale({interactive: true, scope: 'rde'})

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
