import { types, SnapshotOrInstance, Instance, cast } from 'mobx-state-tree';
import { updateStoresAttribute, createEmptySchemaTreeModel } from './util';
import {  SchemaTreeModel } from './index';
import { debugInteract } from '../../lib/debug';

export const STORE_ID_PREIX = 'sst_';

export const Stores = types
  .model('StoresModel', {
    id: types.refinement(
      types.identifier,
      identifier => identifier.indexOf(STORE_ID_PREIX) === 0
    ),
    schemaTree: SchemaTreeModel
  })
  .actions(self => {
    return {
      setSchemaTree(model: SnapshotOrInstance<typeof self.schemaTree>) {
        self.schemaTree = cast(model);
      }
    };
  })
  .actions(self => {
    return {
      updateAttribute(name: string, value: any) {
        updateStoresAttribute(self as any, name, value);
      }
    };
  })
  .actions(self => {
    return {
      /**
       * 重置 schema，相当于创建空树
       * 影响范围：整棵树
       */
      resetToEmpty() {
        self.setSchemaTree(createEmptySchemaTreeModel());
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
    schemaTree: createEmptySchemaTreeModel() as any
  });
}
