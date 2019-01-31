import React, { Component } from 'react';
import { Tree } from 'antd';
import { observer } from 'mobx-react';
import { traverse, NodeLikeObject } from 'ss-tree';
import { AntTreeNodeExpandedEvent } from 'antd/es/tree';
import { AntTreeNodeMouseEvent, AntTreeNodeSelectedEvent } from 'antd/es/tree';

import { findById } from './schema/util';
import {
  ISchemaModel,
  CONTROLLED_KEYS,
  TSchemaTreeControlledKeys
} from './schema';
import { AppFactory } from './controller/index';
import { StoresFactory, IStoresModel } from './schema/stores';
import { pick } from '../lib/util';

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

export interface ISchemaTreeProps extends ISchemaTreeEvent {
  /**
   * 生成组件树的 schema 对象
   */
  schema: ISchemaModel | ISchemaProps;

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

// 推荐使用 decorator 的方式，否则 stories 的导出会缺少 **Prop Types** 的说明
// 因为 react-docgen-typescript-loader 需要  named export 导出方式
@observer
export class SchemaTree extends Component<ISchemaTreeProps> {
  constructor(props: ISchemaTreeProps) {
    super(props);
    this.state = {};
  }

  onSelectNode = (selectedKeys: any, info: AntTreeNodeSelectedEvent) => {
    const { onSelectNode, schema } = this.props;
    const id = selectedKeys && selectedKeys[0];

    if (!!id && onSelectNode) {
      let node = findById(schema, id) as ISchemaProps;
      onSelectNode && onSelectNode(node);
    }
  };

  /**
   * 非递归生成组件树结构
   *
   * @memberof SchemaTree
   */
  renderTree = (root: ISchemaModel | ISchemaProps) => {
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

      treeNodeIdMap[id] = count; // 倒序索引
      count++;

      return nodeArray;
    });

    // 逆序遍历，将节点 reduce 成单个节点
    // 主要是依赖
    for (let i = count; i > 0; i--) {
      const currentNode = nodes[i - 1];
      if (currentNode && currentNode.parentId) {
        const targetNodeIndex = treeNodeIdMap[currentNode.parentId];
        const targetNode = nodes[targetNodeIndex]; // 方向索引出目标节点

        // 目标节点组件
        const component = targetNode.component;
        const { name, id } = targetNode;
        const { children } = component.props;

        // 将当前节点 append 到父节点上
        const newChild = children
          ? children.concat(currentNode.component)
          : [currentNode.component];
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

  onRightClick = (option: AntTreeNodeMouseEvent) => {
    const { node, event } = option;
    const { schema, onRightClickNode } = this.props;
    let id = node.props.eventKey; // key就是他

    // 注意 Event looping 特性，所需要的事件属性需要事先取出来
    const clientX = (event as any).clientX;
    const clientY = (event as any).clientY;

    if (!!id && onRightClickNode) {
      let node = findById(schema, id) as ISchemaProps;
      onRightClickNode({ event: { clientX, clientY }, node });
    }
  };

  render() {
    const { schema, selectedId, expandedIds = [], onExpand } = this.props;
    const keys = expandedIds.slice();

    return (
      <Tree
        key="SchemaTree"
        showLine
        defaultExpandAll={true}
        autoExpandParent={false}
        onExpand={onExpand}
        expandedKeys={keys}
        selectedKeys={[selectedId]}
        onSelect={this.onSelectNode}
        onRightClick={this.onRightClick}
      >
        {this.renderTree(schema)}
      </Tree>
    );
  }
}

/* ----------------------------------------------------
    以下是专门配合 store 时的组件版本
----------------------------------------------------- */
type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

const onExpandWithStore = (
  stores: IStoresModel,
  onExpand: onExpandFunction
) => (expandedKeys: string[], info: AntTreeNodeExpandedEvent) => {
  stores.schemaTree.setExpandedIds(expandedKeys);
  onExpand && onExpand(expandedKeys, info);
};

const onSelectNodeWithStore = (
  stores: IStoresModel,
  onSelectNode: onSelectNodeFunction
) => (node: ISchemaProps) => {
  stores.schemaTree.setSelectedId(node.id);
  onSelectNode && onSelectNode(node);
};

/**
 * 科里化创建 SchemaTreeWithStore 组件
 * @param stores - store 模型实例
 */
export const SchemaTreeAddStore = (stores: IStoresModel) =>
  observer(function SchemaTreeWithStore(
    props: Omit<ISchemaTreeProps, TSchemaTreeControlledKeys>
  ) {
    const { onExpand, onSelectNode, ...otherProps } = props;
    const { schemaTree } = stores;
    const controlledProps = pick(schemaTree, CONTROLLED_KEYS);
    return (
      <SchemaTree
        {...controlledProps}
        onExpand={onExpandWithStore(stores, onExpand)}
        onSelectNode={onSelectNodeWithStore(stores, onSelectNode)}
        {...otherProps}
      />
    );
  });
/**
 * 工厂函数，每调用一次就获取一副 MVC
 * 用于隔离不同的 SchemaTreeWithStore 的上下文
 */
export const SchemaTreeFactory = () => {
  const stores = StoresFactory(); // 创建 model
  const app = AppFactory(stores); // 创建 controller，并挂载 model
  return {
    stores,
    app,
    client: app.client,
    SchemaTreeWithStore: SchemaTreeAddStore(stores)
  };
};
