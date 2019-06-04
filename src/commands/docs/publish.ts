import * as ghpages from 'gh-pages'

import BaseDocs from '../../base/docs'
import conf from '../../services/conf'
import {logger} from '../../services/logger'

export default class DocsPublish extends BaseDocs {
  public static examples = [
    '$ rde docs:serve',
  ]

  public async run() {
    ghpages.publish(conf.docsPagesDir)
  }

  public async postRun() {
    logger.log('Published successfully')
  }
}
