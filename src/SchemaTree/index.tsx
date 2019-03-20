import React, { useCallback } from 'react';
import { Tree } from 'antd';
import { observer } from 'mobx-react-lite';
import { traverse, NodeLikeObject } from 'ss-tree';
import { AntTreeNodeExpandedEvent } from 'antd/es/tree';
import { AntTreeNodeMouseEvent, AntTreeNodeSelectedEvent } from 'antd/es/tree';
import { pick } from 'ide-lib-utils';
import {
  addModelChangeListener,
  based,
  Omit,
  IBaseComponentProps,
  IStoresEnv,
  useInjectedEvents
} from 'ide-lib-base-component';

import { findById } from './schema/util';
import {
  ISchemaModel,
  CONTROLLED_KEYS,
  TSchemaTreeControlledKeys
} from './schema';
import { AppFactory } from './controller/index';
import { StoresFactory, IStoresModel } from './schema/stores';
import { debugRender } from '../lib/debug';
import { updateExpandedIds, updateSelectedId } from './solution';

// 和属性编辑器直接互相传递的 schema object 接口
export interface ISchemaProps extends NodeLikeObject {
  id: string; // 不可以变更的 id
  name: string; // 组件名，比如 'Row'、'Col',
  screenId: string; // 可变更的 id,
  parentId?: string; // 父组件 id,
  children?: ISchemaProps[]; // 子节点对象
}

const TreeNode = Tree.TreeNode;

export type SchemaTreeNodeMouseEvent = {
  node: ISchemaProps;
  event: {
    clientX: number;
    clientY: number;
  };
};

type onExpandFunction = (
  expandedKeys: string[],
  info: AntTreeNodeExpandedEvent
) => void;

type onSelectNodeFunction = (node: ISchemaProps) => void;

export interface ISchemaTreeEvent {
  /**
   * 右键点击节点的回调函数
   */
  onRightClickNode?: (options: SchemaTreeNodeMouseEvent) => void;

  /** 展开/收起节点时触发 */
  onExpand?: onExpandFunction;

  /**
   * 选中节点时的回调函数
   */
  onSelectNode?: onSelectNodeFunction;
}

export interface ISchemaTreeProps
  extends ISchemaTreeEvent,
    IBaseComponentProps {
  /**
   * 生成组件树的 schema 对象
   */
  schema?: ISchemaModel | ISchemaProps;

  /**
   * 默认被选中项的 id
   */
  selectedId?: string;

  /**
   * 默认展开的树节点 id
   */
  expandedIds?: string[];
}

// 空 schema 模板
export const EMPTY_SCHEMA_ID = '-1';
export const EMPTY_SCHEMA: ISchemaProps = {
  name: '[init comp]',
  id: EMPTY_SCHEMA_ID,
  screenId: EMPTY_SCHEMA_ID
};

// 根节点标志
export const FLAG_ROOT = '@root';

export const DEFAULT_PROPS: ISchemaTreeProps = {
  schema: EMPTY_SCHEMA,
  selectedId: '',
  expandedIds: []
};

interface ISubComponents {
  // SchemaTreeComponent: React.ComponentType<OptionalSchemaTreeProps>;
}

/**
 * 非递归生成组件树结构
 *
 * @memberof SchemaTree
 */
const renderTree = (root: ISchemaModel | ISchemaProps) => {
  const treeNodeIdMap: any = {};
  let count = 0;
  const nodes = traverse(root, (node: ISchemaProps, nodeArray: any = []) => {
    const { name, id, parentId } = node;

    nodeArray.push({
      id: id,
      name: name,
      component: <TreeNode title={name} key={id} />,
      parentId: parentId
    });

    treeNodeIdMap[id] = count; // 生成字典索引，根据 id 能查阅到节点索引位置
    count++;

    return nodeArray;
  });

  // 逆序遍历，将节点 reduce 成单个节点
  // 主要是依赖
  for (let i = count; i > 0; i--) {
    const currentNode = nodes[i - 1];
    if (currentNode && currentNode.parentId) {
      const targetNodeIndex = treeNodeIdMap[currentNode.parentId];
      const targetNode = nodes[targetNodeIndex]; // 方向索引出目标节点，当前父节点

      // 目标节点组件
      const component = targetNode.component;
      const { name, id } = targetNode;
      const { children } = component.props;

      // 将当前节点 append 到父节点上，注意由于是逆序操作，所以后操作的节点要放在之前节点之前
      const newChild = [currentNode.component].concat(children || []);

      // 如果 newChild 长度大于 1 ，需要重新逆序排序

      // 重新构造父节点
      targetNode.component = (
        <TreeNode title={name} key={id}>
          {newChild}
        </TreeNode>
      );
    }
  }
  return nodes[0].component;
};

/**
 * 使用高阶组件打造的组件生成器
 * @param subComponents - 子组件列表
 */
export const SchemaTreeHOC: (
  subComponents: ISubComponents
) => React.FunctionComponent<ISchemaTreeProps> = subComponents => {
  const SchemaTreeHOC = (props: ISchemaTreeProps) => {
    const {
      schema,
      selectedId,
      expandedIds = [],
      onExpand,
      onSelectNode,
      onRightClickNode
    } = props;
    const keys = expandedIds.slice();

    const onSelectNodeCallback = useCallback(
      (selectedKeys: any, info: AntTreeNodeSelectedEvent) => {
        const id = selectedKeys && selectedKeys[0];
        if (!!id && onSelectNode) {
          let node = findById(schema, id) as ISchemaProps;
          onSelectNode && onSelectNode(node);
        }
      },
      [onSelectNode, schema]
    );

    const onRightClickNodeCallback = useCallback(
      (option: AntTreeNodeMouseEvent) => {
        const { node, event } = option;
        let id = node.props.eventKey; // key就是他

        // 注意 Event looping 特性，所需要的事件属性需要事先取出来
        const clientX = (event as any).clientX;
        const clientY = (event as any).clientY;

        if (!!id && onRightClickNode) {
          let node = findById(schema, id) as ISchemaProps;
          onRightClickNode({ event: { clientX, clientY }, node });
        }
      },
      [schema, onRightClickNode]
    );

    return (
      <Tree
        key="SchemaTree"
        showLine
        defaultExpandAll={true}
        autoExpandParent={false}
        onExpand={onExpand}
        expandedKeys={keys}
        selectedKeys={[selectedId]}
        onSelect={onSelectNodeCallback}
        onRightClick={onRightClickNodeCallback}
      >
        {renderTree(schema)}
      </Tree>
    );
  };
  SchemaTreeHOC.displayName = 'SchemaTreeHOC';
  return observer(based(observer(SchemaTreeHOC), DEFAULT_PROPS));
};

// 采用高阶组件方式生成普通的 SchemaTree 组件
export const SchemaTree = SchemaTreeHOC({
  // SchemaTreeComponent: SchemaTree,
});

/* ----------------------------------------------------
    以下是专门配合 store 时的组件版本
----------------------------------------------------- */

/**
 * 科里化创建 SchemaTreeWithStore 组件
 * @param stores - store 模型实例
 */
export const SchemaTreeAddStore: (
  storesEnv: IStoresEnv<IStoresModel>
) => React.FunctionComponent<ISchemaTreeProps> = storesEnv => {
  const { stores } = storesEnv;
  const SchemaTreeHasSubStore = SchemaTreeHOC({
    // SchemaTreeComponent: SchemaTree,
  });
  const SchemaTreeWithStore = (
    props: Omit<ISchemaTreeProps, TSchemaTreeControlledKeys>
  ) => {
    const { ...otherProps } = props;
    const { model } = stores;
    const controlledProps = pick(model, CONTROLLED_KEYS);

    // 注册 onModelChange 事件，监听 model 的变更
    debugRender(`[${stores.id}] rendering`);

    const otherPropsWithInjected = useInjectedEvents<
      ISchemaTreeProps,
      IStoresModel
    >(storesEnv, otherProps, {
      onExpand: [updateExpandedIds],
      onSelectNode: [updateSelectedId]
    });

    addModelChangeListener(
      model,
      CONTROLLED_KEYS,
      otherPropsWithInjected.onModelChange
    );

    console.log('444', controlledProps.schema);
    return (
      <SchemaTreeHasSubStore {...controlledProps} {...otherPropsWithInjected} />
    );
  };
  SchemaTreeWithStore.displayName = 'SchemaTreeWithStore';
  return observer(SchemaTreeWithStore);
};

/**
 * 生成 env 对象，方便在不同的状态组件中传递上下文
 */
export const SchemaTreeStoresEnv = () => {
  const { stores, innerApps } = StoresFactory(); // 创建 model
  const app = AppFactory(stores, innerApps); // 创建 controller，并挂载 model
  return {
    stores,
    app,
    client: app.client,
    innerApps: innerApps
  };
};

/**
 * 工厂函数，每调用一次就获取一副 MVC
 * 用于隔离不同的 SchemaTreeWithStore 的上下文
 */
export const SchemaTreeFactory = () => {
  const storesEnv = SchemaTreeStoresEnv();
  return {
    ...storesEnv,
    SchemaTreeWithStore: SchemaTreeAddStore(storesEnv)
  };
};
