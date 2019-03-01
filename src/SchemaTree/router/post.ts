import Router from 'ette-router';
import { pick } from 'ide-lib-utils';
import { buildNormalResponse } from 'ide-lib-base-component';

import { SCHEMA_CONTROLLED_KEYS } from '../schema/';
import { getAllNodes, createSchemaModel, findById } from '../schema/util';
import { IContext, BUFFER_NODETYPE, addBufferNode, getBufferNode} from './helper';
import { ISchemaModel } from '../schema';

import { debugIO } from '../../lib/debug';

export const router = new Router();

/**
 * 创建新的 tree
 */
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

/**
 * 新增子节点到指定位置
 * 备注：通过 {useBuffer: true} 可以直接使用来自 buffer clone 缓存中的节点（来自拷贝操作）
 */
router.post('addChildNode', '/nodes/:id/children', function (ctx: IContext) {
  const { stores, request } = ctx;
  const { schema, targetIndex, useBuffer, useClone = true } = request.data;
  const { id } = ctx.params;

  let message: string;
  let data: any;

  if(!id) {
    message = '传入节点 id 不能为空';
  } else {
    // 从缓存区获取子节点的时候，需要节点副本后再粘贴到子节点中去，否则会提示 id 已存在
    const newNode = useBuffer ? getBufferNode(stores, BUFFER_NODETYPE.CLONED, useClone) : createSchemaModel(schema);
    const targetNode = findById(stores.model.schema, id) as ISchemaModel;

    if (useBuffer && !newNode) {
      message = '添加失败，缓存区不存在 clone 类型节点';
    } else if (!targetNode) {
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

  buildNormalResponse(ctx, 200, data ? { node: data, useBuffer: useBuffer }: 0, message);
});


/**
 * 新增兄弟节点到指定位置
 */
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


/**
 * 新增某个 clone 节点信息到 buffer 中
 */
router.post('cloneNodeIntoBuffer', '/nodes/:id/clone', function (ctx: IContext) {
  const { stores } = ctx;
  const { id } = ctx.params;
  const { origin, target } = stores.model.schema.cloneFromSubId(id);

  let message = '';
  if (!target) {
    message = '拷贝失败，问题定位源 `cloneFromSubId`';
  } else {
    message = `拷贝成功，新节点 id: ${target.id}`;

    addBufferNode(stores, BUFFER_NODETYPE.CLONED, target); // 将拷贝的节点放在缓存中
  }

  buildNormalResponse(ctx, 200, { origin: origin && pick(origin, SCHEMA_CONTROLLED_KEYS), target: target && pick(target, SCHEMA_CONTROLLED_KEYS) }, message);
});

