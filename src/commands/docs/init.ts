import {Command} from '@oclif/command'

import {logger} from '../../services/logger'
import _ from '../../util'

export default class DocsInit extends Command {
  public static examples = [
    '$ rde docs:init',
  ]

  public async run() {
    await _.asyncExec('mkdir ./_docs')
    await _.asyncExec(`echo "---
title: 关于
subTitle: About
order: 12
---" > ./_docs/index.md`)
    await _.asyncExec(`echo "---
title: FAQ
order: 0
---
" > ./_docs/faq.md`)

    logger.log('Init successfully')
  }
}
