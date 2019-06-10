import * as ghpages from 'gh-pages'

import BaseDocs from '../../base/docs'
import conf from '../../services/conf'
import {logger} from '../../services/logger'

export default class DocsPublish extends BaseDocs {
  public static examples = [
    '$ rde docs:publish',
  ]

  public async run() {
    await ghpages.publish(conf.docsPagesDir, e => {
      if (e) {
        logger.error(e)
      }
    })
  }

  public async postRun() {
    logger.log('Published successfully')
  }
}
