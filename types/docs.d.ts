interface DocPageRoute {
  title: string
  url?: string,
  children?: DocPageRoute[]
}

interface DocNavRoute {
  title: string
  url: string
}
