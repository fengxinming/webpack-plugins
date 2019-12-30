# cli-progress-webpack-plugin

## Installation

```bash
$ npm install cli-progress-webpack-plugin --save-dev
```

## Usage

** First, import the plugin into your Webpack configuration file: **

```js
const ProgressPlugin = require('cli-progress-webpack-plugin');
```

** Then, instantiate it within the list of plugins: **

```js
plugins: [
  new ProgressPlugin()
  new webpack.optimize.ModuleConcatenationPlugin(),
  new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
]
```