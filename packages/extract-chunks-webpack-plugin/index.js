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
      excludeChunks: [],
      chunksSortMode: 'auto'
    }, options);
  }

  apply(compiler) {
    const self = this;

    const emitFn = (compilation, callback) => {
      const chunkOnlyConfig = {
        assets: false,
        cached: false,
        children: false,
        chunks: true,
        chunkModules: false,
        chunkOrigins: false,
        errorDetails: false,
        hash: false,
        modules: false,
        reasons: false,
        source: false,
        timings: false,
        version: false
      };
      const allChunks = compilation.getStats().toJson(chunkOnlyConfig).chunks;
      let chunks = self.filterChunks(allChunks, self.options.chunks, self.options.excludeChunks);
      chunks = self.sortChunks(chunks, self.options.chunksSortMode, compilation);
      const assets = self.getAssets(compilation, chunks);
      const filename = self.options.filename;
      const filedir = path.parse(filename).dir;
      if (!fs.existsSync(filedir)) {
        fs.mkdirSync(filedir);
      }
      fs.writeFileSync(filename, JSON.stringify(assets, null, 2));
      console.log(`The file "${chalk.yellow(filename)}" has been created\n`);
      callback();
    };

    const doneFn = () => {
      console.log(chalk.yellow('The plugin "extract-chunks-webpack-plugin" has been done!'));
    };

    if (compiler.hooks) {
      const plugin = {
        name: 'ExtractChunksWebpackPlugin'
      };
      compiler.hooks.emit.tapAsync(plugin, emitFn);
      compiler.hooks.done.tap(plugin, doneFn);
    } else {
      compiler.plugin('emit', emitFn);
      compiler.plugin('done', doneFn);
    }
  }

  /**
   * Helper to sort chunks
   */
  sortChunks(chunks, sortMode, compilation) {
    // Custom function
    if (typeof sortMode === 'function') {
      return chunks.sort(sortMode);
    }
    // Check if the given sort mode is a valid chunkSorter sort mode
    if (typeof chunkSorter[sortMode] !== 'undefined') {
      return chunkSorter[sortMode](chunks, this.options, compilation);
    }
    throw new Error('"' + sortMode + '" is not a valid chunk sort mode');
  }

  /**
   * Return all chunks from the compilation result which match the exclude and include filters
   */
  filterChunks(chunks, includedChunks, excludedChunks) {
    return chunks.filter((chunk) => {
      const chunkName = chunk.names[0];
      // This chunk doesn't have a name. This script can't handled it.
      if (chunkName === undefined) {
        return false;
      }
      // Skip if the chunk should be lazy loaded
      if (typeof chunk.isInitial === 'function') {
        if (!chunk.isInitial()) {
          return false;
        }
      } else if (!chunk.initial) {
        return false;
      }
      // Skip if the chunks should be filtered and the given chunk was not added explicity
      if (Array.isArray(includedChunks) && includedChunks.indexOf(chunkName) === -1) {
        return false;
      }
      // Skip if the chunks should be filtered and the given chunk was excluded explicity
      if (Array.isArray(excludedChunks) && excludedChunks.indexOf(chunkName) !== -1) {
        return false;
      }
      // Add otherwise
      return true;
    });
  }

  /**
   * Appends a cache busting hash
   */
  appendHash(url, hash) {
    if (!url) {
      return url;
    }
    return url + (url.indexOf('?') === -1 ? '?' : '&') + hash;
  }

  getAssets(compilation, chunks) {
    const self = this;
    const compilationHash = compilation.hash;

    // Use the configured public path or build a relative path
    let publicPath = typeof compilation.options.output.publicPath !== 'undefined'
      // If a hard coded public path exists use it
      ? compilation.mainTemplate.getPublicPath({
        hash: compilationHash
      })
      // If no public path was set get a relative url path
      : path.relative(
        path.resolve(compilation.options.output.path, path.dirname(self.options.filename)), compilation.options.output.path
      ).split(path.sep).join('/');

    if (publicPath.length && publicPath.substr(-1, 1) !== '/') {
      publicPath += '/';
    }

    const assets = {
      // The public path
      publicPath: publicPath,
      // Will contain all js & css files by chunk
      chunks: {},
      // Will contain all js files
      js: [],
      // Will contain all css files
      css: [],
      // Will contain the html5 appcache manifest files if it exists
      manifest: Object.keys(compilation.assets).filter(assetFile => path.extname(assetFile) === '.appcache')[0]
    };

    // Append a hash for cache busting
    if (this.options.hash) {
      assets.manifest = self.appendHash(assets.manifest, compilationHash);
      assets.favicon = self.appendHash(assets.favicon, compilationHash);
    }

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkName = chunk.names[0];

      assets.chunks[chunkName] = {};

      // Prepend the public path to all chunk files
      let chunkFiles = [].concat(chunk.files).map(chunkFile => publicPath + chunkFile);

      // Append a hash for cache busting
      if (this.options.hash) {
        chunkFiles = chunkFiles.map(chunkFile => self.appendHash(chunkFile, compilationHash));
      }

      // Webpack outputs an array for each chunk when using sourcemaps
      // or when one chunk hosts js and css simultaneously
      const js = chunkFiles.find(chunkFile => /.js($|\?)/.test(chunkFile));
      if (js) {
        assets.chunks[chunkName].size = chunk.size;
        assets.chunks[chunkName].entry = js;
        assets.chunks[chunkName].hash = chunk.hash;
        assets.js.push(js);
      }

      // Gather all css files
      const css = chunkFiles.filter(chunkFile => /.css($|\?)/.test(chunkFile));
      assets.chunks[chunkName].css = css;
      assets.css = assets.css.concat(css);
    }

    // Duplicate css assets can occur on occasion if more than one chunk
    // requires the same css.
    assets.css = _.uniq(assets.css);

    return assets;
  }

}

module.exports = Plugin;
