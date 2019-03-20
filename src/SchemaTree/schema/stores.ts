import { types, SnapshotOrInstance, Instance, cast } from 'mobx-state-tree';
import {
  TAnyMSTModel,
  IStoresEnv,
  getSubAppsFromFactoryMap
} from 'ide-lib-base-component';
import { updateStoresAttribute, createEmptySchemaTreeModel } from './util';
import { SchemaTreeModel } from './index';

export const STORE_ID_PREIX = 'sst_';

export enum ESubApps {}

// 定义子 facotry 映射关系
export const FACTORY_SUBAPP: Record<
  ESubApps,
  (...args: any[]) => Partial<IStoresEnv<TAnyMSTModel>>
> = {};

export const Stores = types
  .model('StoresModel', {
    id: types.refinement(
      types.identifier,
      identifier => identifier.indexOf(STORE_ID_PREIX) === 0
    ),
    model: SchemaTreeModel
  })
  .actions(self => {
    return {
      setModel(model: SnapshotOrInstance<typeof self.model>) {
        self.model = cast(model);
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
        return self.model.resetToEmptyTree();
      }
    };
  });

export interface IStoresModel extends Instance<typeof Stores> {}

let autoId = 1;

/**
 * 工厂方法，用于创建 stores，同时注入对应子元素的 client 和 app
 */
export function StoresFactory() {
  const { subStores, subApps, subClients } = getSubAppsFromFactoryMap(
    FACTORY_SUBAPP
  );

  // see: https://github.com/mobxjs/mobx-state-tree#dependency-injection
  // 依赖注入，方便在 controller 中可以直接调用子组件的 controller
  const stores: IStoresModel = Stores.create(
    {
      id: `${STORE_ID_PREIX}${autoId++}`,
      model: createEmptySchemaTreeModel() as any,
      ...(subStores as Record<ESubApps, TAnyMSTModel>)
    },
    {
      clients: subClients
    }
  );

  return {
    stores,
    innerApps: subApps
  };
}
