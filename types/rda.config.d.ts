interface AppConfTemplate {
  name: string,
  docs?: string,
  render?: { [key: string]: any }
}

interface Suite {
  name: string,
  framework: Framework,
}

interface AppConf {
  container: AppConfTemplate,
  suites: Suite[],
  docker: Docker,
  docs: Docs,
}
