const toposort = require('toposort');
const _ = require('lodash');

/**
 * 排序chunks
 *
 * @param  {Array} chunks 待排序的chunks数组
 * @param  {Array} compilation.chunkGroups webpack4新增
 * @return {Array} 排序后的chunks数组
 */
module.exports.dependency = (chunks, options, {
  chunkGroups
}) => {
  if (!chunks) {
    return chunks;
  }

  // We build a map (chunk-id -> chunk) for faster access during graph building.
  const nodeMap = {};

  chunks.forEach((chunk) => {
    nodeMap[chunk.id] = chunk;
  });

  // Next, we add an edge for each parent relationship into the graph
  let edges = [];

  if (chunkGroups) {
    // Add an edge for each parent (parent -> child)
    edges = chunkGroups.reduce((result, chunkGroup) => result.concat(
      Array.from(chunkGroup.parentsIterable, parentGroup => [parentGroup, chunkGroup])
    ), []);
    const sortedGroups = toposort.array(chunkGroups, edges);
    // flatten chunkGroup into chunks
    const sortedChunks = sortedGroups
      .reduce((result, chunkGroup) => result.concat(chunkGroup.chunks), [])
      .map(chunk => // use the chunk from the list passed in, since it may be a filtered list
        nodeMap[chunk.id])
      .filter((chunk, index, self) => {
        // make sure exists (ie excluded chunks not in nodeMap)
        const exists = !!chunk;
        // 确保chunk分支的唯一
        const unique = self.indexOf(chunk) === index;
        return exists && unique;
      });
    return sortedChunks;
  } else {
    // webpack4以下版本支持chunkGroups
    chunks.forEach((chunk) => {
      if (chunk.parents) {
        // Add an edge for each parent (parent -> child)
        chunk.parents.forEach((parentId) => {
          // webpack2 chunk.parents are chunks instead of string id(s)
          const parentChunk = _.isObject(parentId) ? parentId : nodeMap[parentId];
          // If the parent chunk does not exist (e.g. because of an excluded chunk)
          // we ignore that parent
          if (parentChunk) {
            edges.push([parentChunk, chunk]);
          }
        });
      }
    });
    // We now perform a topological sorting on the input chunks and built edges
    return toposort.array(chunks, edges);
  }
};

/**
 * 通过id排序
 *
 * @param  {Array} chunks 待排序的chunks数组
 * @return {Array} 排序后的chunks数组
 */
module.exports.id = chunks => chunks.sort((a, b) => {
  if (a.entry !== b.entry) {
    return b.entry ? 1 : -1;
  } else {
    return b.id - a.id;
  }
});

/**
 * 直接返回
 * @param  {Array} chunks 待排序的chunks数组
 * @return {Array} 排序后的chunks数组
 */
module.exports.none = chunks => chunks;

/**
 * 根据指定的数组排序
 * @param  {Array} chunks 待排序的chunks数组
 * @param  {Array} specifyChunks 排序条件
 * @return {Array} 排序后的chunks数组
 */
module.exports.manual = (chunks, {
  specifyChunks
}) => {
  const chunksResult = [];
  let filterResult = [];
  if (Array.isArray(specifyChunks)) {
    for (let i = 0; i < specifyChunks.length; i++) {
      filterResult = chunks.filter((chunk) => {
        if (chunk.names[0] && chunk.names[0] === specifyChunks[i]) {
          return true;
        }
        return false;
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
