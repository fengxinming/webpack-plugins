const chunkSorter = require('./lib/chunksorter');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const chalk = require('chalk');

class Plugin {
  constructor(options) {
    this.options = _.extend({
      filename: path.join(`${process.cwd()}`, './chunks.json'),
      hash: false,
      minify: false,
      cache: true,
      showErrors: true,
      chunks: 'all',
      excludeChunks: []
    }, options);
  }

  apply(compiler) {
    const self = this;

    // compiler.plugin('make', () => {

    // })

    compiler.plugin('emit', (compilation, callback) => {
      const allChunks = compilation.getStats().toJson().chunks;
      let chunks = self.filterChunks(allChunks, self.options.chunks, self.options.excludeChunks);
      chunks = self.sortChunks(chunks, self.options.chunksSortMode);
      const assets = self.getAssets(compilation, chunks);
      const filename = this.options.filename;
      const filedir = path.parse(filename).dir;
      if (!fs.existsSync(filedir)) {
        fs.mkdirSync(filedir);
      }
      fs.writeFileSync(filename, JSON.stringify(assets, null, 2));
      console.log(`It has created a file ${chalk.yellow(filename)}\n`);
      callback();
    });
  }

  filterChunks(chunks, includedChunks, excludedChunks) {
    return chunks.filter((chunk) => {
      const chunkName = chunk.names[0];

      if (chunkName === undefined) {
        return false;
      }

      if (typeof chunk.isInitial === 'function') {
        if (!chunk.isInitial()) {
          return false;
        }
      } else if (!chunk.initial) {
        return false;
      }

      if (Array.isArray(includedChunks) && includedChunks.indexOf(chunkName) === -1) {
        return false;
      }

      if (Array.isArray(excludedChunks) && excludedChunks.indexOf(chunkName) !== -1) {
        return false;
      }

      return true;
    });
  }

  sortChunks(chunks, sortMode) {
    if (typeof sortMode === 'undefined') {
      sortMode = 'auto';
    }
    if (typeof sortMode === 'function') {
      return chunks.sort(sortMode);
    }
    if (sortMode === 'none') {
      return chunkSorter.none(chunks);
    }
    if (typeof chunkSorter[sortMode] !== 'undefined') {
      return chunkSorter[sortMode](chunks, this.options.chunks);
    }
    throw new Error('"' + sortMode + '" is not a valid chunk sort mode');
  }

  getAssets(compilation, chunks) {
    const self = this;
    const compilationHash = compilation.hash;

    let publicPath = typeof compilation.options.output.publicPath !== 'undefined' ?
      compilation.mainTemplate.getPublicPath({ hash: compilationHash }) :
      path.relative(path.resolve(compilation.options.output.path, path.dirname(self.childCompilationOutputName)), compilation.options.output.path)
      .split(path.sep).join('/');

    if (publicPath.length && publicPath.substr(-1, 1) !== '/') {
      publicPath += '/';
    }

    const assets = {
      publicPath: publicPath,
      chunks: {},
      js: [],
      css: [],
      manifest: Object.keys(compilation.assets).filter((assetFile) => {
        return path.extname(assetFile) === '.appcache';
      })[0]
    };

    if (this.options.hash) {
      assets.manifest = self.appendHash(assets.manifest, compilationHash);
    }

    for (let i = 0, j = chunks.length; i < j; i++) {
      const chunk = chunks[i];
      const chunkName = chunk.names[0];

      assets.chunks[chunkName] = {};

      let chunkFiles = [].concat(chunk.files).map((chunkFile) => {
        return publicPath + chunkFile;
      });

      if (this.options.hash) {
        chunkFiles = chunkFiles.map((chunkFile) => {
          return self.appendHash(chunkFile, compilationHash);
        });
      }

      const entry = chunkFiles[0];
      assets.chunks[chunkName].size = chunk.size;
      assets.chunks[chunkName].entry = entry;
      assets.chunks[chunkName].hash = chunk.hash;
      assets.js.push(entry);

      const css = chunkFiles.filter((chunkFile) => {
        return /.css($|\?)/.test(chunkFile);
      });
      assets.chunks[chunkName].css = css;
      assets.css = assets.css.concat(css);
    }

    assets.css = _.uniq(assets.css);

    return assets;
  }

  appendHash(url, hash) {
    if (!url) {
      return url;
    }
    return url + (url.indexOf('?') === -1 ? '?' : '&') + hash;
  }
}

module.exports = Plugin;
