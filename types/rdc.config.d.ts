type Framework = 'vue' | 'regular' | 'react' | 'angular'

interface Docs {
  logo: string
  keywords: string[]
  url: string
  userStyles?: string[]
  userScripts?: string[]
}

interface Render {
  includes?: string[],
  tags?: string[],
  validate?: ((dataView: any) => boolean)[],
  mock?: {
    [key: string]: any
  },
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
  framework: Framework
  docs: Docs
  render: Render
  exportFiles: string[],
  docker: Docker,
  nodeVersion: string,
  extensions: string[],
  lint: {
    dependencies: string[],
    files: string[]
  }
}
