type Framework = 'vue' | 'regular' | 'react' | 'angular'

interface Docs {
  url: string
  logo: string
  keywords: string[]
}

interface Render {
  includes: string[]
  tags: string[]
  validate: ((dataView: any) => boolean)[]
}

interface Mapping {
  from: string
  to: string
  transform?(from: string, to: string): string
}

interface Docker {
  ports: number[]
}

interface RdtConf {
  extends: string
  framework: Framework
  docs: Docs
  render: Render
  mappings: Mapping[]
  docker: Docker,
  packageWhiteList: string[]
  dev: {
    render: {[key: string]: any}
    watchFiles: string[]
  }
}
