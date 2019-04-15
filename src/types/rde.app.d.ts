interface AppConf {
  template: string
  suites: string[]
  readme: {
    template: string,
    suites: any[]
  },
  render: { [key: string]: any }
}
