interface DocPageRoute {
  title: string
  url?: string
  children?: DocPageRoute[]
  main?: boolean
}

interface DocNavRoute {
  title: string
  url: string
}
