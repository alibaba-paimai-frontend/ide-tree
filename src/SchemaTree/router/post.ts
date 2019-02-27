import Router from 'ette-router';
// import { isExist} from 'ide-lib-utils';
import { buildNormalResponse } from 'ide-lib-base-component';

import { getAllNodes, createSchemaModel, findById } from '../schema/util';
import { IContext } from './helper';
import { ISchemaModel } from '../schema';

import { debugIO } from '../../lib/debug';

export const router = new Router();

// 创建新的 tree
router.post('createNewTree', '/tree', function (ctx: IContext) {
  const { stores, request } = ctx;
  const { schema } = request.data;

  stores.setModel({schema});
  const nodes = getAllNodes(schema, 'id');
  const ids = nodes.map((o: any) => o.id);
  stores.model.setExpandedIds(ids);
  ctx.response.status = 200;

  buildNormalResponse(ctx, 200, {ids: ids}, '创建成功');
});

// 新增子节点
router.post('addChildNode', '/nodes/:id/children', function (ctx: IContext) {
  const { stores, request } = ctx;
  const { schema, targetIndex } = request.data;
  const { id } = ctx.params;

  let message: string;
  let data: any;

  if(!id) {
    message = '传入节点 id 不能为空';
  } else {
    const newNode = createSchemaModel(schema);
    const targetNode = findById(stores.model.schema, id) as ISchemaModel;

    if (!targetNode) {
      message = `id 为 ${id} 的节点不存在`;
    } else {
      const isExisted = findById(stores.model.schema, newNode.id) as ISchemaModel;

      if (isExisted) {
        message = `要插入的节点(id:${newNode.id})已存在`;
      } else {
        targetNode.addChild(newNode, targetIndex);
        data = newNode.schemaJSON;
      }
    }
  }

  buildNormalResponse(ctx, 200, data ? { node: data}: 0, message);
});

// 新增兄弟节点
router.post('addSiblingNode', '/nodes/:id/sibling', function (ctx: IContext) {
  const { stores, request } = ctx;
  const { schema, offset } = request.data;
  const { id } = ctx.params;

  let message: string;
  let data: any;


  if(!id) {
    message = '传入节点 id 不能为空';
  } else {
    const newNode = createSchemaModel(schema);
    const targetNode = findById(stores.model.schema, id) as ISchemaModel;

    if (!targetNode) {
      message = `id 为 ${id} 的节点不存在`;
    } else {
      const isExisted = findById(stores.model.schema, newNode.id) as ISchemaModel;

      if (isExisted) {
        message = `要插入的节点(id:${newNode.id})已存在`;
      } else {
        const isSuccess = stores.model.schema.addSibling(targetNode, newNode, offset);
        if(isSuccess) {
          data = newNode.schemaJSON;
        } else {
          message = '插入节点失败，请打开控制台查看 [addSibling] 部分的日志'
        }
      }
    }
  }

  buildNormalResponse(ctx, 200, data ? { node: data } : null, message);

});

