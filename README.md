# extract-chunks-webpack-plugin

> Note: that `extract-chunks-webpack-plugin` supports being visited on WeChat

<br/>

# Development & Deployment

## How to get codes from remote GIT repository

```bash
$ git@gitlab.ziztour.loc:tmc/h5-travel-plus.git
$ cd h5-travel-plus
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
