import Layout from './layout';

export default {
  name: 'layout-rde',

  type: 'layout',

  async apply(ctx) {
    let layout = null;

    await ctx.api.layout.register({
      name: 'layout-rde',

      mount(node, {
        ctx
      }) {
        if (!layout) {
          layout = new Layout();
        }

        layout.$mount(node);
      },

      unmount() {
        if (!layout) {
          return;
        }

        layout.$destroy();
      },

      update(data = {}) {
        if (!layout) {
          return;
        }

        layout.ctx = data.ctx;
        layout.$forceUpdate();
      },

      getMountNode() {
        return layout && layout.$refs.$$mount;
      },
    });
  }
};
