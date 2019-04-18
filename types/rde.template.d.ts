type Framework = 'vue' | 'regular' | 'react' | 'angular'

interface Docs {
  logo: string
  keywords: string[]
}

interface Render {
  includes: string[],
  tags: string[],
  mock: {[key: string]: any},
  validate(dataView: any): boolean,
}

interface Mapping {
  from: string
  to: string
}

interface Docker {
  ports: number[]
}

interface RdtConf {
  extends: string
  framework: Framework
  docs: Docs
  render: Render
  mapping: Mapping[]
  docker: Docker,
  packageWhiteList: string[]
}
