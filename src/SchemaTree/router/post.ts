import Router from 'ette-router';
import { getAllNodes } from '../schema/util';
import { IContext } from './helper';


export const router = new Router();

// 创建新的 tree
router.post('nodes', '/tree', function (ctx: IContext) {
  const { stores, request } = ctx;
  const { schema } = request.data;

  // const newSchema = createSchemaModel(schema);
  stores.setSchemaTree({schema});
  // console.log('777', getAllNodes(schema, 'id'));
  const nodes = getAllNodes(schema, 'id');
  const ids = nodes.map((o: any) => o.id);
  stores.schemaTree.setExpandedIds(ids);
  ctx.response.status = 200;
});
