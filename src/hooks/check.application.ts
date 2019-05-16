import axios from 'axios'
import * as path from 'path'

import conf from '../services/conf'

export default async function () {
  const {appConfPath, cwd} = conf
  const checkDate = 5

  const needCheck = () => {
    return new Date().getDay() === checkDate
  }

  const uploadAppInfo = async data => {
    await axios({
      method: 'post',
      url: 'https://apollo-kl.netease.com/rde/version/upsert',
      data
    })
  }

  const checkApplication = async () => {
    const {container: {name: version}} = require(appConfPath)
    const {name} = path.parse(cwd)

    await uploadAppInfo({version, name})
  }

  if (needCheck()) {
    await checkApplication()
  }
}
