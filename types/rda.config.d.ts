interface AppConfTemplate {
  name: string,
  docs?: string,
  render?: { [key: string]: any },
  variables?: { [key: string]: any },
}

interface Suite {
  name: string,
  framework: Framework,
}

interface AppConf {
  useLocal: boolean,
  container: AppConfTemplate,
  suites: Suite[],
  docker: Docker,
  docs: Docs,
}
