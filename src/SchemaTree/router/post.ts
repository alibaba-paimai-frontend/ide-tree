import Router from 'ette-router';
import { getAllNodes, createSchemaModel, findById } from '../schema/util';
import { IContext } from './helper';
import { ISchemaModel } from '../schema';

import { debugIO } from '../../lib/debug';


export const router = new Router();

// 创建新的 tree
router.post('nodes', '/tree', function (ctx: IContext) {
  const { stores, request } = ctx;
  const { schema } = request.data;

  // const newSchema = createSchemaModel(schema);
  stores.setModel({schema});
  // console.log('777', getAllNodes(schema, 'id'));
  const nodes = getAllNodes(schema, 'id');
  const ids = nodes.map((o: any) => o.id);
  stores.model.setExpandedIds(ids);
  ctx.response.status = 200;
});

// 新增子节点
router.post('nodes', '/nodes/:id/children', function (ctx: IContext) {
  const { stores, request } = ctx;
  const { schema, targetIndex } = request.data;
  const { id } = ctx.params;

  let result = {
    message: '',
    success: false
  }

  if(!id) {
    result.message = '传入节点 id 不能为空';
  } else {
    const newNode = createSchemaModel(schema);
    const targetNode = findById(stores.model.schema, id) as ISchemaModel;

    if (!targetNode) {
      result.message = `id 为 ${id} 的节点不存在`;
    } else {
      const isExisted = findById(stores.model.schema, newNode.id) as ISchemaModel;

      if (isExisted) {
        result.message = `要插入的节点(id:${newNode.id})已存在`;
      } else {
        targetNode.addChild(newNode, targetIndex);
        result = Object.assign({}, result, {
          node: newNode.schemaJSON
        })
      }
    }
  }

  ctx.response.body = result;
  ctx.response.status = 200;
});

