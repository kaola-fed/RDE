type Framework = 'vue' | 'regular' | 'react' | 'angular'

interface Docs {
  logo: string
  keywords: string[]
}

interface Render {
  includes: string[]
}

interface Mapping {
  from: string
  to: string
}

interface Docker {
  expose: number[]
}

interface RdtConf {
  framework: Framework
  spa: boolean
  docs: Docs
  render: Render
  mapping: Mapping[]
  docker: Docker
}
