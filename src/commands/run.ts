import conf from '../services/conf'

import RdtRun from './template/run'

export default class Run extends RdtRun {
  public static description = 'run scripts provided by rdt'

  public static examples = [
    '$ rde run <script>',
  ]

  public async preInit() {
    const {args} = this.parse(Run)

    const {app} = conf.getRdeConf()
    const {template, mappings} = app
    if (!template) {
      throw Error('template is not provided in you config file, please check')
    }

    return {
      cmd: args.cmd,
      rdtName: template.name,
      renderData: template.render,
      mappings,
    }
  }

  public async initialize({cmd, rdtName, renderData, mappings}) {
    this.cmd = cmd

    this.rdtName = rdtName
    this.renderData = renderData
    this.mappings = mappings
  }
}
