type RdType = 'application' | 'container' | 'suite'

interface RdeConf {
  app: AppConf
  container: RdcConf
  suites?: RdsConf[]
}
