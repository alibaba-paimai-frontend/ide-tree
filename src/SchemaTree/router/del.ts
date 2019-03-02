import Router from 'ette-router';
import { IContext } from './helper';
import { buildNormalResponse } from 'ide-lib-base-component';
export const router = new Router();

/**
 * 移除整棵树
 */
router.del('delTree', '/tree', function(ctx: IContext) {
  const { stores } = ctx;
  ctx.response.body = {
    node: stores.resetToEmpty()
  };
  ctx.response.status = 200;
});


/**
 * 移除指定节点
 */
router.del('delNode', '/nodes/:id', function(ctx: IContext) {
  const { stores, params } = ctx;
  const { id } = params;
  // 这里有个特殊情况，如果 id 是根节点的 id，需要调用 `resetToEmpty` 方法
  const result =
    id === stores.model.schema.id
      ? stores.resetToEmpty()
      : stores.model.schema.removeNode(id);
  let message = `节点 ${id} 删除成功`;

  buildNormalResponse(ctx, 200, { node: result }, message);
});
