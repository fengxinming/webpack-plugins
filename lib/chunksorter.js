const toposort = require('toposort');
const _ = require('lodash');

/**
 * 排序chunks
 *
 * @param  {Array} chunks 待排序的chunks数组
 * @return {Array} 排序后的chunks数组
 */
module.exports.dependency = (chunks) => {
  if (!chunks) {
    return chunks;
  }

  const nodeMap = {};

  chunks.forEach((chunk) => {
    nodeMap[chunk.id] = chunk;
  });

  const edges = [];

  chunks.forEach((chunk) => {
    if (chunk.parents) {
      chunk.parents.forEach((parentId) => {
        var parentChunk = _.isObject(parentId) ? parentId : nodeMap[parentId];
        if (parentChunk) {
          edges.push([parentChunk, chunk]);
        }
      });
    }
  });

  return toposort.array(chunks, edges);
};

/**
 * 通过id排序
 *
 * @param  {Array} chunks 待排序的chunks数组
 * @return {Array} 排序后的chunks数组
 */
module.exports.id = (chunks) => {
  return chunks.sort((a, b) => {
    if (a.entry !== b.entry) {
      return b.entry ? 1 : -1;
    } else {
      return b.id - a.id;
    }
  });
};

/**
 * 直接返回
 * @param  {Array} chunks 待排序的chunks数组
 * @return {Array} 排序后的chunks数组
 */
module.exports.none = (chunks) => {
  return chunks;
};

/**
 * 根据指定的数组排序
 * @param  {Array} chunks 待排序的chunks数组
 * @param  {Array} specifyChunks 排序条件
 * @return {Array} 排序后的chunks数组
 */
module.exports.manual = (chunks, specifyChunks) => {
  const chunksResult = [];
  const filterResult = [];
  if (Array.isArray(specifyChunks)) {
    for (let i = 0; i < specifyChunks.length; i++) {
      filterResult = chunks.filter((chunk) => {
        return chunk.names[0] && chunk.names[0] === specifyChunks[i];
      });
      filterResult.length > 0 && chunksResult.push(filterResult[0]);
    }
  }
  return chunksResult;
};

/**
 * 暴露模块ID
 */
module.exports.auto = module.exports.id;

// 兼容webpack1、2
if (Number(require('webpack/package.json').version.split('.')[0]) > 1) {
  module.exports.auto = module.exports.dependency;
}
