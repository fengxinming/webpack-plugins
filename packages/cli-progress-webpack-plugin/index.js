'use strict';

const chalk = require('chalk');
const { ProgressPlugin } = require('webpack');
const ProgressBar = require('cli-simple-progress');

/** @type {Object} */
const LogLevels = {
  none: 6,
  false: 6,
  error: 5,
  warn: 4,
  info: 3,
  log: 2,
  true: 2,
  verbose: 1
};

/** @type {Object} */
const colorLevels = {
  warn: chalk.yellow,
  info: chalk.green,
  log: chalk.white,
  debug: chalk.blue
};

class CliProgressWebpackPlugin extends ProgressPlugin {

  /**
   * webpack进度条插件
   *
   * @constructor
   * @param {Object} [options={}] 配置参数
   */
  constructor(options) {
    options = options || {};

    if (!options.handler) {
      const progressBar = new ProgressBar(Object.assign({
        template: `${chalk.bgRed('{complete}')}${chalk.bgWhite('{incomplete}')} {percent}% {msg}`
      }, options.progress));

      const logger = [];
      const { profileLevel } = options;
      progressBar.on('complete', function () {
        if (logger.length) {

          const logLevel = LogLevels[profileLevel] || 2;
          logger.forEach(function ([level, message]) {
            if (LogLevels[level] > logLevel) {
              console.log(colorLevels[level](`webpack.Progress [${level}] ${message}`));
            }
          });
        }
      });

      options.handler = createDefaultHandler(options.profile, progressBar, function (info) {
        logger[logger.length] = info;
      });
    }

    delete options.progress;
    delete options.profileLevel;
    super(options);
  }

}

function createDefaultHandler(profile, progressBar, log) {
  let startStateTime;
  let lastState;
  let lastStateTime;

  const defaultHandler = function (percentage, msg, moduleProgress, activeModules, moduleName) {
    switch (percentage) {
      case 0:
        startStateTime = Date.now();
        break;
      case 1:
        msg = `${msg}${msg ? ' ' : ''}${Date.now() - startStateTime}ms`;
        break;
    }
    progressBar.ratio(percentage, { msg: `${msg} ${moduleProgress || ''} ${activeModules || ''}` });
    if (profile) {
      const state = msg.replace(/^\d+\/\d+\s+/, '');
      if (percentage === 0) {
        lastState = null;
        lastStateTime = Date.now();
      } else if (state !== lastState || percentage === 1) {
        const now = Date.now();
        if (lastState) {
          const diff = now - lastStateTime;
          const stateMsg = `${diff}ms ${lastState}`;
          if (diff > 1000) {
            log(['warn', stateMsg]);
          } else if (diff > 10) {
            log(['info', stateMsg]);
          } else if (diff > 0) {
            log(['log', stateMsg]);
          } else {
            log(['debug', stateMsg]);
          }
        }
        lastState = state;
        lastStateTime = now;
      }
    }
  };

  return defaultHandler;
};

module.exports = CliProgressWebpackPlugin;
