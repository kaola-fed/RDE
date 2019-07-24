type Framework = 'vue' | 'regular' | 'react' | 'angular'
type Mode = 'integrate' | 'origin'

interface Docs {
  title?: string
  keywords?: string[]
  url?: string
  userStyles?: string[]
  userScripts?: string[]
}

interface Render {
  includes: string[],
  tags: string[],
  validate: ((dataView: any) => any)[],
  mock: {[key: string]: any},
}

interface Mapping {
  from: string
  to: string
  options?: any
  merge?: string
}

interface Docker {
  tag?: string
  ports?: string[]
}

interface RdcConf {
  extends: string
  mode: Mode
  useLocal: boolean
  framework: Framework
  docs: Docs
  render: Render
  variables: { [key: string]: any }
  mappings: Mapping[]
  docker: Docker,
  nodeVersion: string,
  extensions: string[],
  lint: {
    ext: string[]
  }
}
