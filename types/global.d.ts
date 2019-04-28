type RdType = 'application' | 'container' | 'suite'

interface RdeConf {
  app: AppConf
  template: RdcConf
  suites?: RdsConf[]
}
