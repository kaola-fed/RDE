<template>
<div>
  <div class="g-top">
    <div class="g-topc">
      <a class="u-logo u-logo-index" @click="go('/pages/index')">Regular UI</a>
      <ul class="m-navbar f-fr">
        <li><a @click="go('')" >开始使用</a></li>
        <li><a href="/RDE/about.html">文档</a></li>
        <li><a @click="go('/pages/container')">容器示例</a></li>
      </ul>
    </div>
  </div>
  <div class="g-hd">
    <header class="m-header">
      <div class="header_bd">
        <!-- <h2>Regular UI<sup>v0.1</sup></h2> -->
        <h2>一种基于Docker的前端生态集成解决方案</h2>
        <h3>简洁、高效、框架无关</h3>
        <p>
          <a class="u-btn u-btn-primary" href="/RDE/rda/quickstart.html"><i class="u-icon u-icon-paper-plane"></i> 快速开始</a>
          <a class="u-btn" target="_blank" href="https://github.com/kaola-fed/RDE/releases/latest"><i class="u-icon u-icon-cloud-download"></i> 下载最新</a>
        </p>
      </div>
      <div class="header_ft">
        <div class="g-row">
          <a class="g-col g-col-4" target="_blank" href="https://github.com/kaola-fed/RDE/stargazers"><div class="header_number">35</div><div class="header_label"><i class="u-icon u-icon-star"></i> Stars</div></a>
          <a class="g-col g-col-4" target="_blank" href="https://github.com/kaola-fed/RDE/releases/latest"><div class="header_number">0.1.8</div><div class="header_label"><i class="u-icon u-icon-github-alt"></i> Latest Version</div></a>
          <a class="g-col g-col-4" target="_blank" href="https://github.com/kaola-fed/RDE/network/members"><div class="header_number">17</div><div class="header_label"><i class="u-icon u-icon-code-fork"></i> Forks</div></a>
        </div>
        <div><a class="u-btn" target="_blank" href="https://github.com/kaola-fed/RDE"><i class="u-icon u-icon-github"></i> View on GitHub</a></div>
      </div>
    </header>
  </div>
  <div class="g-seg">
    <div class="g-segc">
      <div class="g-row">
        <div class="g-col g-col-6">
          <div class="m-part">
            <h2><i class="u-icon u-icon-gg"></i> Docker开发环境</h2>
            <p>引入Docker开发环境，提供跨平台开发环境一致性，自动生成Docker运行文件，无需熟悉Docker即可使用 </p>
          </div>
        </div>
        <div class="g-col g-col-6">
          <div class="m-part">
            <h2><i class="u-icon u-icon-magic"></i> 工程建设新方案</h2>
            <p>将工程脚手架、基础组件库等与业务代码分离。业务工程只包含业务代码，复用统一的工程脚手架、组件库等，方便基础建设的统一升级。开发人员可以在各个业务工程间平滑过渡，无额外的上手成本。</p>
          </div>
        </div>
        <div class="g-col g-col-6">
          <div class="m-part">
            <h2><i class="u-icon u-icon"></i> 高效的文档建设方案</h2>
            <p>RDE针对业务场景，提供了常用的API、组件展示等MD扩展语法，让开发者可以直接上手写文档，不再关注搭建细节</p>
          </div>
        </div>
        <div class="g-col g-col-6">
          <div class="m-part">
            <h2><i class="u-icon u-icon"></i> 可维护的工程脚手架</h2>
            <p>由于工程脚手架是与业务代码分离的，所以同类工程可以实现全部使用一套脚手架。此外对于依赖包升级、脚手架改造优化等场景，可以只针对脚手架工程进行修改，同时又能达到修改一处，多处业务代码都生效的效果。</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="g-ft">
    <footer class="m-footer">
      <p>
        <a href="index.html" class="footer_logo">
          <img width="48px"
               src="https://haitao.nos.netease.com/6f8e6539-cfca-4d4b-869c-dc6bf9bc4c65_323_329.png" />
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
