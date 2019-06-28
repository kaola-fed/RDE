const path = require('path');
const {resolve} = path;

const config = {
  port: 9000,
  router: {
    mode: 'history',
  },
  zh: 'RDE',
  layout: 'layout-rde',
  plugins: {
    'layout-rde': {
      path: require.resolve('./src/layout'),
      enable: true
    }
  },
  homepage: 'pages/index',
  html: {
    template: resolve('index.html'),
    title: 'RDE - Resign Dev Env',
    // favicon: resolve('fav.ico')
  },
  babel: {
    transpileModules: [ '@zeit-ui/vue' ]
  },
  configureWebpack: {
    resolve: {
      extensions: ['.html', '.js', '.vue', '.json', '.ts'],
      alias: {
        vue$: 'vue/dist/vue.esm.js',
      }
    },
    module: {
      rules: [
        {
          test: /\.html$/,
          exclude: [
            /node_modules/,
          ],
          use: [{
            loader: 'html-loader'
          }]
        }
      ]
    }
  }
};

if ( process.env.NODE_ENV === 'production' ) {
  config.output = {
    publicPath: 'https://kaola-fed.github.io/RDE/'
  }
}

module.exports = config;
