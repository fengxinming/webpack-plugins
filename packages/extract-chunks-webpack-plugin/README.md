# extract-chunks-webpack-plugin

> Note: that `extract-chunks-webpack-plugin` saves chunks from webpack as a JSON file and supports webpack3-4

<br/>

## Installation

```bash
$ npm install extract-chunks-webpack-plugin --save-dev
```

## Usage

** First, import the plugin into your Webpack configuration file: **

```js
const ProgressPlugin = require('extract-chunks-webpack-plugin');
```

** Then, instantiate it within the list of plugins: **

```js
plugins: [
  new webpack.optimize.ModuleConcatenationPlugin(),
  new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
  new ExtractChunks({
    filename: path.join(process.cwd(), 'tmp', 'chunks.json')
  })
]
```