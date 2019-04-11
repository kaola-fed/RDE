module.exports = {
  framework: 'vue',
  spa: true,
  docs: {
    logo: 'https://cli.vuejs.org/favicon.png',
    keywords: ['vue-cli', 'typescript', 'vuex']
  },
  render: {
    includes: ['*.js'],
    /* 固定配置，封装进去， 不允许修改 */
    appPath: '../app',
    tplPath: './',
    /* 固定配置，封装进去， 不允许修改 */
  },
  mapping:[
    { from: 'views', to: 'src' },
    { from: 'router.ts', to: 'src/router.ts' },
    { from: 'store.ts', to: 'src/store.ts' },
  ],
  docker: {
    expose: [8080]
  }
};
