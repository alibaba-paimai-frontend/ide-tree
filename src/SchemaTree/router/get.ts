import Router from 'ette-router';
import { buildNormalResponse } from 'ide-lib-base-component';

import { SCHEMA_CONTROLLED_KEYS } from '../schema/';
import { findById } from '../schema/util';
import { IContext, extracFilters, getBufferNode, BUFFER_NODETYPE } from './helper';
import { pick } from 'ide-lib-utils';

export const router = new Router();


// 默认获取所有的节点，可以通过 filter 返回指定的属性值
// 比如 /nodes?filter=name,screenId ，返回的集合只有这两个属性
router.get('getAllNodes', '/nodes', function(ctx: IContext) {
  const { stores, request } = ctx;
  const { query } = request;
  const filterArray = extracFilters(query && query.filter, SCHEMA_CONTROLLED_KEYS);
  ctx.response.body = {
    nodes: stores.model.schema.allNodesWithFilter(filterArray)
  };
  ctx.response.status = 200;
});

// 返回某个节点的 schema 信息
router.get('getNodeById', '/nodes/:id', function(ctx: IContext) {
  const { stores, request } = ctx;
  const { query } = request;
  const { id } = ctx.params;
  const filterArray = extracFilters(query && query.filter, SCHEMA_CONTROLLED_KEYS);

  ctx.response.body = {
    node: findById(stores.model.schema, id, filterArray)
  };
  ctx.response.status = 200;
});

// 返回 buffer 中的 clone 节点信息
router.get('getCloneNode', '/buffers/clone', function(ctx: IContext) {
  const { stores, request } = ctx;
  const { query } = request;
  const filterArray = extracFilters(query && query.filter, SCHEMA_CONTROLLED_KEYS);

  const node = getBufferNode(stores, BUFFER_NODETYPE.CLONED);

  let message = '';
  if (!node) {
    message = '当前缓存区中去 clone 类型节点 `cloneFromSubId`';
  } else {
    message = `获取成功. clone 节点 id: ${node.id}`
  } 
  
  buildNormalResponse(ctx, 200, { node: node && pick(node, filterArray) }, message);
});
