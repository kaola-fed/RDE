interface RdtPkgJson {
  name: string,
  description: string,
  keywords: string[],
  dependencies: {[key: string]: string},
  devDependencies: {[key: string]: string},
  [key: string]: any
}
