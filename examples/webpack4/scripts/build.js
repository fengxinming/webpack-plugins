const webpack = require('webpack');
const config = require('../webpack.config');

const compiler = webpack(config);

compiler.run(function (err) {
  if (err) {
    console.log(err);
  }
});
