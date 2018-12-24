import Router from 'ette-router';
export const router = new Router();

// 移除整棵树
(router as any).del('nodes', '/nodes', function(ctx: any) {
  const { stores } = ctx;
  ctx.response.body = {
    node: stores.resetToEmpty()
  };
  ctx.response.status = 200;
});

// 移除指定节点
(router as any).del('nodes', '/nodes/:id', function(ctx: any) {
  const { stores, params } = ctx;
  const { id } = params;
  // 这里有个特殊情况，如果 id 是根节点的 id，需要调用 `resetToEmpty` 方法
  const result =
    id === stores.schema.id
      ? stores.resetToEmpty()
      : stores.schema.removeNode(id);

  ctx.response.body = {
    node: result
  };
  ctx.response.status = 200;
});
