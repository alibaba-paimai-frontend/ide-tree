import { IStoresModel } from '../schema/stores';
import { IContext as IEtteContext } from 'ette';
import { ISchemaModel } from '../schema';
import { ISchemaProps } from '../index';
export interface IContext extends IEtteContext{
  stores: IStoresModel;
  [propName: string]: any;
}

export function extracFilters(filter?: string, defaultFilters?: string[]) {
  return filter && filter.trim().split(',') || defaultFilters;
}


export enum BUFFER_NODETYPE {
  CLONED = 'CLONED'
}

type TBufferNodeType = Partial<Map<BUFFER_NODETYPE, ISchemaModel | ISchemaProps >>;
interface INodeBuffer {
  stores: IStoresModel;
  nodes: TBufferNodeType;
}

// 缓存区，用于缓存操作中的节点，比如拷贝时生成的节点
export const BUFFER_NODES = new Map<string, INodeBuffer>();
export const EMPTY_BUFFER_NODE: TBufferNodeType = {};

export function addBufferNode(stores: IStoresModel, nodeType: BUFFER_NODETYPE, node: ISchemaModel | ISchemaProps) {
  const buffer = BUFFER_NODES.get(stores.id);
  const nodes = buffer && buffer.nodes || new Map<BUFFER_NODETYPE, ISchemaModel | ISchemaProps>();
  nodes.set(nodeType, node); // 重置指定 type 的节点
  // 更新 buffer
  BUFFER_NODES.set(stores.id, {
    stores, nodes
  });
}

export function removeBufferNode(stores: IStoresModel, nodeType: BUFFER_NODETYPE) {
  const buffer = BUFFER_NODES.get(stores.id);
  if(!buffer) return;

  // 删除指定 nodeType 的节点
  buffer.nodes.delete(nodeType);

  // 如果删除完之后 nodes 为空，则把这个 buffer 也删除
  if(!buffer.nodes.size) {
    BUFFER_NODES.delete(stores.id);
  }
}

export function getBufferNode(stores: IStoresModel, nodeType: BUFFER_NODETYPE) {
  const buffer = BUFFER_NODES.get(stores.id);
  if (!buffer) return;

  // 返回指定 nodeType 的节点
  return buffer.nodes.get(nodeType);
}







