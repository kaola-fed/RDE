interface AppConfTemplate {
  name: string,
  docs: string,
  render: { [key: string]: any }
}

interface AppConfSuite {
  name: string,
  docs: string,
}

interface AppConf {
  template: AppConfTemplate,
  suites: AppConfSuite[],
  mappings: Mapping[]
}
