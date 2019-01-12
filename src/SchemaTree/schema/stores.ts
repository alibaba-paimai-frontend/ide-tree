import { types, SnapshotOrInstance, Instance } from 'mobx-state-tree';
import { createEmptyModel } from './util';
import { ISchemaModel, SchemaModel } from './index';
import { debugInteract } from '../../lib/debug';

export const STORE_ID_PREIX = 'sst_';
export const Stores = types
  .model('StoresModel', {
    id: types.refinement(
      types.identifier,
      identifier => identifier.indexOf(STORE_ID_PREIX) === 0
    ),
    schema: SchemaModel,
    selectedId: types.optional(types.string, ''),
    expandedIds: types.array(types.string)
  })
  .actions(self => {
    return {
      setSchema(model: ISchemaModel) {
        self.schema = model;
      },
      setExpandedIds(ids: SnapshotOrInstance<typeof self.expandedIds> = []) {
        self.expandedIds = ids as any;
      },
      setSelectedId(id: SnapshotOrInstance<typeof self.selectedId>) {
        self.selectedId = id;
      }
    };
  })
  .actions(self => {
    return {
      // 自动展开节点，让其出现在视野内
      autoExpandIdIntoView(id: string) {
        /* ----------------------------------------------------
        自动展开看到当前节点，注意放在 expandedIds 是目标节点的父节点 id
        还有一种情况是，某个节点是深层次折叠的（比如直接折叠根节点），此时需要往上溯源
      ----------------------------------------------------- */
        if (!id) return;

        let currentId = id; // id 指针
        const shouldExpand: string[] = [];

        const expandedIds = self.expandedIds.slice() as any;

        // 从子节点一直溯源到父节点，注意不要死循环了。。。
        while (!!currentId) {
          const node = self.schema.findNode(currentId);
          const parentId = node && node.parentId; // 定位到父节点
          currentId = parentId; // 更新 id 指针
          // 如果不存在 id，则更新 shouldExpand
          if (!~expandedIds.indexOf(currentId) && !!currentId) {
            shouldExpand.push(currentId);
          }
        }

        debugInteract(
          `[自动展开节点] expandedIds: ${expandedIds}, shouldExpand: ${shouldExpand}`
        );
        self.setExpandedIds(expandedIds.concat(shouldExpand));
      },

      /**
       * 重置 schema，相当于创建空树
       * 影响范围：整棵树
       */
      resetToEmpty() {
        const nodeToRemoved = (self.schema as any).toJSON();
        self.setSchema(createEmptyModel());
        return nodeToRemoved;
      }
    };
  });

export interface IStoresModel extends Instance<typeof Stores> {}

let autoId = 1;
/**
 * 工厂方法，用于创建 stores
 */
export function StoresFactory(): IStoresModel {
  return Stores.create({
    id: `${STORE_ID_PREIX}${autoId++}`,
    schema: createEmptyModel() as any
  });
}
