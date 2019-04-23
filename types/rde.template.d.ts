type Framework = 'vue' | 'regular' | 'react' | 'angular'

interface Docs {
  logo: string
  keywords: string[]
  url: string
}

interface Render {
  includes: string[],
  tags: string[],
  validate: ((dataView: any) => boolean)[],
}

interface Mapping {
  from: string
  to: string
  option?: any
}

interface RdtConf {
  extends: string
  framework: Framework
  docs: Docs
  render: Render
  mappings: Mapping[]
  packageWhiteList: string[]
  dev: {
    render: {[key: string]: any}
  }
}
