interface AppConfTemplate {
  name: string,
  docs?: string,
  render?: { [key: string]: any }
}

interface AppConf {
  container: AppConfTemplate,
  suites: string[],
  docker: Docker,
}
