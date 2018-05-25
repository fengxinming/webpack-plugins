# extract-chunks-webpack-plugin

> Note: that `extract-chunks-webpack-plugin` supports webpack3-

<br/>

# Development & Deployment

## How to get codes from remote GIT repository

```bash
$ git@github.com:fengxinming/extract-chunks-webpack-plugin.git
$ cd extract-chunks-webpack-plugin
$ cnpm install
```

## How to use it

```bash
plugins: [
  new webpack.optimize.ModuleConcatenationPlugin(),
  new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
  new ExtractChunks({
    filename: path.join(process.cwd(), 'tmp', 'chunks.json')
  })
],
```
