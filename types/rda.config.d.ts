interface AppConfTemplate {
  name: string,
  docs: string,
  render: { [key: string]: any }
}

interface AppConfSuite {
  name: string,
  version: string,
  docs: string,
}

interface AppConf {
  container: AppConfTemplate,
  suites: AppConfSuite[],
  mappings: Mapping[],
  docker: Docker,
}
