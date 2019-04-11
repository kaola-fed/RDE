import * as fs from 'fs'

export default {
  isEmptyDir(dir: string) {
    const files = fs.readdirSync(dir)
    return files.length === 0
  },
}
