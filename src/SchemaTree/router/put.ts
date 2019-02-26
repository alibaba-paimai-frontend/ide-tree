import Router from 'ette-router';
import { IContext } from './helper';

export const router = new Router();

// 更新根节点的属性
router.put('nodes', '/tree/root', function(ctx: IContext) {
  const { stores, request } = ctx;
  const { name, value } = request.data;
  const isSuccess = stores.model.schema.updateAttribute(name, value);
  ctx.response.body = {
    success: isSuccess
  };
  ctx.response.status = 200;
});

// 更新指定节点的属性
router.put('nodes', '/nodes/:id', function(ctx: IContext) {
  const { stores, request } = ctx;
  const { name, value } = request.data;
  const { id } = ctx.params;

  //   stores.setSchema(createSchemaModel(schema));
  const isSuccess = stores.model.schema.updateAttributeById(id, name, value);
  ctx.response.body = {
    success: isSuccess
  };

  ctx.response.status = 200;
});

// 更新被选中的节点 id，同时自动展开
router.put('nodes', '/selection/:id', function(ctx: IContext) {
  const { stores, params } = ctx;
  const { id } = params;

  // stores.setSchema(createSchemaModel(schema));
  stores.model.setSelectedId(id);

  // 自动展开看到当前节点
  stores.model.autoExpandIdIntoView(id);

  ctx.response.status = 200;
});
