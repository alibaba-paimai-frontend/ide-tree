import { IStoresEnv } from 'ide-lib-base-component';
import { IStoresModel } from '../../schema/stores';
import { ISchemaProps } from '../../index';

/**
 * 显示 list 列表项
 * @param env - IStoresEnv
 */
export const updateSelectedId = (env: IStoresEnv<IStoresModel>) => (
  node: ISchemaProps
) => {
  const { stores } = env;
  stores.model.setSelectedId(node.id);
};
