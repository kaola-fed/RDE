type Framework = 'vue' | 'regular' | 'react' | 'angular'

interface Docs {
  logo: string
  keywords: string[]
  url: string
  userStyles?: string[]
  userScripts?: string[]
}

interface Render {
  includes: string[],
  tags: string[],
  validate: ((dataView: any) => boolean)[],
  dev: {
    render: {[key: string]: any}
  },
}

interface Mapping {
  from: string
  to: string
  option?: any
  merge?: string
}

interface Docker {
  tag: string
  ports: string[]
}

interface RdcConf {
  extends: string
  framework: Framework
  docs: Docs
  render: Render
  mappings: Mapping[]
  docker: Docker,
  nodeVersion: string,
}
