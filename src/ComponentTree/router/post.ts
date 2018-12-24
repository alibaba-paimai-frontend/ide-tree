import { createSchemaModel, getAllNodes } from '../schema/util';
import Router from 'ette-router';

export const router = new Router();

// 获取所有的节点
(router as any).post('nodes', '/nodes', function(ctx: any) {
  const { stores, request } = ctx;
  const { schema } = request.data;

  // const newSchema = createSchemaModel(schema);
  stores.setSchema(createSchemaModel(schema));
  // console.log('777', getAllNodes(schema, 'id'));
  const nodes = getAllNodes(schema, 'id');
  const ids = nodes.map((o: any) => o.id);
  stores.setExpandedIds(ids);
  // stores.schema.setName(newSchema.name);
  // stores.schema.setId(newSchema.id);
  // stores.schema.setChildren(newSchema.children);
  // stores.setSchema(stores.schema);

  ctx.response.status = 200;
});
