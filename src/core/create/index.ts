import sync from '../../services/sync'

export default class CreateCore {
  public name = ''

  public framework = 'vue'

  // format: name:version
  public rdc = ''

  public rdcRepo = ''

  constructor({name, framework, rdc, rdcRepo}) {
    this.name = name
    this.framework = framework
    this.rdc = rdc
    this.rdcRepo = rdcRepo
  }

  public async start() {
    // pull resources
    await this.prepare()

    await this.genConfFile()

    await this.genExtraFiles()

    await sync.registerHooks()
  }

  protected async prepare() {}

  protected async genConfFile() {}

  protected async genExtraFiles() {}
}
