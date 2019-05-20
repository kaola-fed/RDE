import * as chalk from 'chalk'
import * as debugLib from 'debug'
import * as readline from 'readline'

class Spinner {
  public readonly interval = 150

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

  public firstTime = true

  constructor() {
    this.logger = null
    this.timerId = null
    this.counter = 0
    this.firstTime = true
  }

  public start(message) {
    const index = Math.floor(Math.random() * this.frames.length)
    const frames = this.frames[index]

    this.timerId = setInterval(() => {
      this.counter = this.counter % (frames.length)

      readline.moveCursor(process.stdout, 0, this.firstTime ? 0 : -1)
      readline.clearLine(process.stdout, 0)
      readline.cursorTo(process.stdout, 0)
      process.stdout.write(`[RDE] › ${(chalk as any).blue('awaiting')} ${message} ${frames[this.counter]} \n`)

      this.firstTime = false
      this.counter++
    }, this.interval)
  }

  public stop() {
    clearInterval(this.timerId)
  }
}

export const debug = debugLib('rde')

export const logger = {
  info(message) {
    process.stdout.write(`[RDE] › ${(chalk as any).blue('info')} ${message} \n`)
  },
  log(message) {
    process.stdout.write(`[RDE] › ${(chalk as any).blue('info')} ${message} \n`)
  },
  error(message) {
    process.stdout.write(`[RDE] › ${(chalk as any).red('error')} ${message} \n`)
  },
  warn(message) {
    process.stdout.write(`[RDE] › ${(chalk as any).yellow('warn')} ${message} \n`)
  }
}

// only for async function
export default function log(message) {
  return (_t, _p, descriptor) => {
    const origin = descriptor.value
    if (typeof origin !== 'function') {
      return
    }

    descriptor.value = async function (...args) {
      const spinner = new Spinner()
      spinner.start(message)
      const result = await origin.apply(this, args)
      spinner.stop()
      return result
    }

    return descriptor
  }
}
