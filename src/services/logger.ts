import {Signale} from 'signale'

export const logger = new Signale({
  scope: 'rde',
})

export const spinner = {
  logger: null,
  timerId: null,
  interval: 80,
  frames:  ['🌑 ', '🌒 ', '🌓 ', '🌔 ', '🌕 ', '🌖 ', '🌗 ', '🌘 '],
  counter: 0,

  getLogger() {
    return new Signale({interactive: true, scope: 'rde'})
  },

  start(info) {
    this.logger = this.getLogger()

    this.timerId = setInterval(() => {
      this.counter = this.counter % (this.frames.length)
      this.logger.await(`${info} : %s`, this.frames[this.counter])
      this.counter++
    }, this.interval)
  },

  stop() {
    clearInterval(this.timerId)
    this.logger = null
  }
}
