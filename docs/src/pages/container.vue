<template>
<div>
  <div class="g-top">
    <div class="g-topc">
      <a class="u-logo u-logo-index" @click="go('/pages/index')">RDE</a>
      <ul class="m-navbar f-fr">
        <li><a href="/RDE/rda/quickstart.html">开始使用</a></li>
        <li><a href="/RDE/about.html">文档</a></li>
        <li><a href="/RDE/container.html">容器示例</a></li>
      </ul>
    </div>
  </div>

  <div class="g-bd" id="containers">
    <ul class="containers">
      <li class="container">
        <a target="_blank" href="https://rdepro.github.io/rdc-vue-starter/">
          <div class="container-info">
            <h3 class="container-name">rdebase/rdc-vue-starter<span class="container-version">latest</span></h3>
            <p class="container-desc">
              Starter demo container project for RDE
            </p>
            <p>
              <span class="container-createdate">created at 2019-06-01</span>
              <span class="container-author">by wangsong</span>
            </p>
          </div>
          <ul class="container-tags">
            <li class="container-tag container-tag-webpack"></li>
            <li class="container-tag container-tag-vue"></li>
          </ul>
        </a>
      </li>

      <li class="container">
        <a target="_blank" href="https://kaola-fed.github.io/rdc-nut/">
          <div class="container-info">
            <h3 class="container-name">rdebase/rdc-nut <span class="container-version">latest</span></h3>
            <p class="container-desc">
              Container based on Nutjs
            </p>
            <p>
              <span class="container-createdate">created at 2019-06-01</span>
              <span class="container-author">by wangsong</span>
            </p>
          </div>
          <ul class="container-tags">
            <li class="container-tag container-tag-webpack"></li>
            <li class="container-tag container-tag-nut"></li>
          </ul>
        </a>
      </li>

      <li class="container">
        <a target="_blank" href="https://rdepro.github.io/rdc-regular-suite/">
          <div class="container-info">
            <h3 class="container-name">rdebase/rdc-regular-suite<span class="container-version">latest</span></h3>
            <p class="container-desc">
              Container based on RegularJs
            </p>
            <p>
              <span class="container-createdate">created at 2019-06-01</span>
              <span class="container-author">by hale</span>
            </p>
          </div>
          <ul class="container-tags">
            <li class="container-tag container-tag-webpack"></li>
            <li class="container-tag container-tag-regular"></li>
          </ul>
        </a>
      </li>

      <li class="container">
        <a target="_blank" href="https://rdepro.github.io/rdc-vue-suite/">
          <div class="container-info">
            <h3 class="container-name">rdebase/rdc-vue-suite<span class="container-version">latest</span></h3>
            <p class="container-desc">
              Container for RDS Development with vue
            </p>
            <p>
              <span class="container-createdate">created at 2019-06-01</span>
              <span class="container-author">by keyunlei</span>
            </p>
          </div>
          <ul class="container-tags">
            <li class="container-tag container-tag-webpack"></li>
            <li class="container-tag container-tag-vue"></li>
          </ul>
        </a>
      </li>
    </ul>
  </div>

  <div class="g-ft">
    <footer class="m-footer">
      <p>
        <a href="/RDE/index.html" class="footer_logo">
          <img width="48px" src="https://haitao.nos.netease.com/6f8e6539-cfca-4d4b-869c-dc6bf9bc4c65_323_329.png" />
        </a>
      </p>
      <p>
        <a href="https://github.com/kaola-fed/RDE" target="_blank">GitHub</a> |
        <a href="https://github.com/kaola-fed/RDE/issues" target="_blank">Issues</a> |
        <a href="https://github.com/kaola-fed/RDE/releases" target="_blank">ChangeLog</a> |
        <a href="https://github.com/kaola-fed/RDE/blob/master/CONTRIBUTING.md" target="_blank">Contributing</a>
      </p>
      <p>Licensed under <a href="https://github.com/kaola-fed/RDE/blob/master/LICENSE" target="_blank">MIT license</a>.</p>
    </footer>
  </div>
</div>
</template>

<script>
export default {
  methods: {
    go(url) {
      this.$ctx.api.router.push(url);
    }
  }
}
</script>

<style scoped>
  body { color: #333; font-size: 12px; padding: 0; margin: 0; font-family: Helvetica Neue,Helvetica,PingFang SC,Hiragino Sans GB,Microsoft YaHei,SimSun,sans-serif; -webkit-font-smoothing: antialiased; }
  .f-fr { float: right; }

  .g-top { font: 14px/1.6 "Microsoft YaHei","Hiragino Sans GB","WenQuanYi Micro Hei",sans-serif; position: fixed; top: 0; left: 0; right: 0; height: 68px; z-index: 5; background: #68BAEB;  }
  .g-topc { margin: 0 auto; width: 1080px; }
  .u-logo { display: block; float: left; margin-left: 12px; background: url(https://haitao.nos.netease.com/6f8e6539-cfca-4d4b-869c-dc6bf9bc4c65_323_329.png) center center no-repeat #fff; width: 72px; height: 72px; font-size: 0; background-size: 54px; }
  .m-navbar { background: none; list-style: none; margin: 0; padding: 0; color: #fff; letter-spacing: -4px; }
  .m-navbar li { display: inline-block; letter-spacing: normal; }
  .m-navbar li a, .m-navbar li span {display: block; text-decoration: none; text-align: center; min-width: 120px; height: 68px; line-height: 68px; color: rgba(255,255,255,.75); transition: color .3s;  }
  .m-navbar li a:hover { color: #fff; }

  body { background: #F7F7F8; }
  .g-bd { padding-top: 68px; display: flex; flex-direction: row; width: 1200px; margin: 0 auto; min-height: calc(100vh - 240px); }

  .g-ft { clear: both; }
  .m-footer {
    text-align: center;
    padding: 40px 0 60px;
    background: #262626;
    color: #777;
    font-size: 12px
  }

  .m-footer a {
    color: #ccc;
    text-decoration: none
  }

  .m-footer a:hover {
    color: #eee
  }

  .m-footer .footer_logo {
    display: block;
    margin: 10px 0 20px
  }

  /* style md */
  .rde-h1, .rde-h2, .rde-h3, .rde-h4, .rde-h5 { font-weight: 400; color: #1f2f3d; margin: 15px 0; }
  .rde-h1 { font-size: 28px; margin-top: 40px; }
  .rde-h2 { font-size: 28px; margin-top: 40px; }
  .rde-h3 { font-size: 22px; margin-top: 40px; }
  .rde-h4 { font-size: 18px; margin-top: 40px; }
  .rde-h5 { font-size: 14px; }

  .rde-p { line-height: 26px; }
  .rde-p + .rde-p { margin-top: 20px; }
  .rde-p img { width: 700px; display: block; margin: 0 auto; }

  .rde-a { color: var(--link-color); text-decoration: none; }
  blockquote { font-weight: bold; margin: 20px 0; padding-left: 20px; border-left: 2px solid #68BAEB; }

  .hljs { font-family: Menlo,Monaco,Consolas,Courier,monospace; line-height: 1.8; font-size: 13px; padding: 12px 20px; }

  /* rde-component api */
  .rde-table { table-layout: fixed; font-size: 12px; width: 100%; margin: 8px 0; }
  .rde-table th { text-align: center; background: #eef1f4; border-bottom: 1px solid #ecf2f9; color: #666; }
  .rde-table td, .rde-table th { line-height: 1.5em; padding: 0.5em 1.4em; border: none; }
  .rde-table td { border-bottom: 1px solid #ecf2f9; }
  .rde-table tr:nth-child(2n-1) { background: #fff; }
  .rde-table tr:nth-child(2n) { background: #f6f9fc; }

  .containers { width: 100%; list-style: none; margin-top: 22px; }
  .container { float: left; cursor: pointer; box-sizing: border-box; width: 30%; height: 210px; margin: 10px; padding: 20px; background: #fff; box-shadow: inset -1px 0 0 0 rgba(224,227,231,.6), inset 0 -1px 0 0 #e0e4e7, inset 1px 0 0 0 rgba(224,227,231,.6); }
  .container a { text-decoration: none; color: #333; }
  .container:hover { box-shadow: 0 2px 6px 0 #e0e4e7, inset -1px 0 0 0 rgba(224,227,231,.3), inset 0 -1px 0 0 #e0e4e7, inset 1px 0 0 0 rgba(224,227,231,.2); }
  .container-version { font-size: 12px; margin-left: 8px; padding: 1px 3px; background: #68BAEB; border-radius: 3px; color: #fff; }
  .container-desc { margin: 40px 0; }
  .container-author { float: right; }
  .container-author:before { content: ''; display: inline-block; width: 16px; height: 16px; background-image: url('../assets/images/user.png'); background-size: cover; vertical-align: middle; margin-right: 8px; }

  .container-tags { text-align: right; }
  .container-tag { display: inline-block; width: 20px; height: 20px; background-size: cover; }
  .container-tag-vue { background-image: url('../assets/images/vuejs.png'); }
  .container-tag-webpack { width: 26px; height: 26px; vertical-align: bottom; background-image: url('../assets/images/webpack.png'); }
  .container-tag-nut { background-image: url('../assets/images/logo-nut.png'); }
  .container-tag-regular { background-image: url('../assets/images/regular-icon-neg.png'); }
</style>
