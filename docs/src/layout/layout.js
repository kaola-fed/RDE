import Vue from 'vue';

import template from './layout.html';
import './layout.scss';

export default Vue.extend({
  template,
  data() {
    return {
      baseUrl: 'https://kaola-fed.github.io/RDE',
      pages: [{
        title: '关于', enTitle: 'About', url: '/about.html'
      }, {
        title: '更新日志', enTitle: 'ChangeLog', url: '/changelog.html'
      }, {
        title: '快速上手', enTitle: 'QuickStart', url: '/rda/quickstart.html'
      }, {
        title: 'RDE工具', url: '/cli/cli.html'
      }, {
        title: 'RDA应用',
        children: [{
          title: '快速上手', enTitle: 'QuickStart', url: '/rda/quickstart.html'
        }, {
          title: '开发规范', enTitle: 'Guideline', url: '/rda/guideline.html'
        }, {
          title: '配置说明', enTitle: 'Config', url: '/rda/config.html'
        }, {
          title: '常见问题', enTitle: 'Q&A', url: '/rda/qa.html'
        }]
      }, {
        title: 'RDC容器',
        children: [{
          title: '快速上手', enTitle: 'QuickStart', url: '/rdc/quickstart.html'
        }, {
          title: '开发规范', enTitle: 'Guideline', url: '/rdc/guideline.html'
        }, {
          title: '模式选择', enTitle: 'Modes', url: '/rdc/modes.html'
        }, {
          title: '配置说明', enTitle: 'Config', url: '/rdc/config.html'
        }, {
          title: '常见问题', enTitle: 'Q&A', url: '/rdc/qa.html'
        }]
      }, {
        title: 'RDS套件',
        children: [{
          title: '关于', enTitle: 'About', url: '/rds/about.html'
        }]
      }, {
        title: 'Docs开发',
        children: [{
          title: '关于', enTitle: 'About', url: '/docs/about.html'
        }, {
          title: '快速上手', enTitle: 'QuickStart', url: '/docs/quickstart.html'
        }, {
          title: '扩展语法', enTitle: 'Markdown', url: '/docs/markdown.html'
        }]
      }]
    };
  },
  mounted() {
    const contentEl = new SimpleBar(document.body);
    contentEl.recalculate()
  },
  methods: {
    isCrtPage(page) {
      return location.pathname.endsWith(page.url);
    },
  },
});
