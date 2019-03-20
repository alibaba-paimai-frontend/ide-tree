import { IStoresEnv } from 'ide-lib-base-component';
import { AntTreeNodeExpandedEvent } from 'antd/es/tree';
import { IStoresModel } from '../../schema/stores';

/**
 * 显示 list 列表项
 * @param env - IStoresEnv
 */
export const updateExpandedIds = (env: IStoresEnv<IStoresModel>) => (
  expandedKeys: string[],
  info: AntTreeNodeExpandedEvent
) => {
  const { stores } = env;
    stores.model.setExpandedIds(expandedKeys);
};
