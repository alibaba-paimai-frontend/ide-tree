import { findById } from '../schema/util';
import Router from 'ette-router';
import { IContext } from './helper';

export const router = new Router();

// 默认获取所有的节点，可以通过 filter 返回指定的属性值
// 比如 /nodes?filter=name,screenId ，返回的集合只有这两个属性
router.get('nodes', '/tree/nodes', function(ctx: IContext) {
  const { stores, request } = ctx;
  const { query } = request;
  const filterArray = query && query.filter && query.filter.trim().split(',');
  ctx.response.body = {
    nodes: stores.schemaTree.schema.allNodesWithFilter(filterArray)
  };
  ctx.response.status = 200;
});

// 返回某个节点的 schema 信息
router.get('nodes', '/tree/nodes/:id', function(ctx: IContext) {
  const { stores, request } = ctx;
  const { query } = request;
  const { id } = ctx.params;
  const filterArray = query && query.filter && query.filter.trim().split(',');
  ctx.response.body = {
    node: findById(stores.schemaTree.schema, id, filterArray)
  };
  ctx.response.status = 200;
});
