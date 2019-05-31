const copy = require('recursive-copy');
const path = require('path');
const fs = require('fs');
const through = require('through2');

const {resolve, join} = path;
const mdIt = require(resolve(__dirname, '../lib/services/markdown')).default;
const render = require(resolve(__dirname, '../lib/services/render')).default;

const srcDir = path.resolve(__dirname, "pages");
const destDir = path.resolve(__dirname, "dist");

copy(srcDir, destDir, {
  overwrite: true,
  rename(filePath) {
    if (filePath.endsWith(".md")) {
      const dirname = path.dirname(filePath);
      const filename = path.basename(filePath, ".md");
      return join(dirname, `${filename}.html`);
    }
    return filePath;
  },

  transform: () => {
    return through((chunk, _enc, done) => {
      const content = mdIt.render(chunk.toString());

      const layout = fs.readFileSync(
        path.resolve(__dirname, `./layout.html`),
      ).toString();

      const output = render.render(layout, {
        content,
      }, ["<%", "%>"]);

      done(null, output);
    });
  },
});
