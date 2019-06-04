interface DocPageRoute {
  title: string
  subTitle?: string
  url?: string
  children?: DocPageRoute[],
  order?: number
}

interface DocNavRoute {
  title: string
  url: string
}
