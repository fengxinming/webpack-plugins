# cli-progress-webpack-plugin

[![npm package](https://nodei.co/npm/cli-progress-webpack-plugin.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/cli-progress-webpack-plugin)

> A cli progress bar for Webpack.

[![NPM version](https://img.shields.io/npm/v/cli-progress-webpack-plugin.svg?style=flat)](https://npmjs.org/package/cli-progress-webpack-plugin)
[![NPM Downloads](https://img.shields.io/npm/dm/cli-progress-webpack-plugin.svg?style=flat)](https://npmjs.org/package/cli-progress-webpack-plugin)

## Installation

```bash
$ npm install cli-progress-webpack-plugin --save-dev
```

## Usage

**First, import the plugin into your Webpack configuration file:**

```js
const ProgressPlugin = require('cli-progress-webpack-plugin');
```

**Then, instantiate it within the list of plugins:**

```js
{
  plugins: [
    new ProgressPlugin(),
    // new ProgressPlugin({
    //   ...options
    //   profileLevel: 'info',
    //   progress: {},
    // })
  ]
}
```

## Options

* `profileLevel` (profileLevel = 'info') log level (`'verbose'`/`'log'`/`'info'`/`'warn'`/`'error'`/`'none'`)

* `progress` [pass `cli-simple-progress` options](https://github.com/fengxinming/cli-simple-progress#options)

* `...rest` [pass `progress-plugin` options](https://webpack.docschina.org/plugins/progress-plugin/)