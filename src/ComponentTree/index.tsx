import React, { Component } from 'react';
import { Tree } from 'antd';
import { AntTreeNodeExpandedEvent } from 'antd/es/tree';
import { AntTreeNodeMouseEvent, AntTreeNodeSelectedEvent } from 'antd/es/tree';
import { observer } from 'mobx-react';
import { ISchemaObject, findById } from './schema/util';
import { traverse } from 'ss-tree';
import { ISchemaModel } from './schema';
import { StoresFactory, IStoresModel } from './schema/stores';
import { AppFactory } from './controller/index';

const TreeNode = Tree.TreeNode;

export type ComponentTreeNodeMouseEvent = {
  node: ISchemaObject;
  event: React.MouseEventHandler<any>;
};

interface NodeProps {
  name: string;
  id: string;
  childArray?: any[];
}

export function TreeNodeCanAddChild({ name, id, childArray = [] }: NodeProps) {
  return (
    <TreeNode title={name} key={id}>
      {childArray || null}
    </TreeNode>
  );
}

type onExpandFunction = (
  expandedKeys: string[],
  info: AntTreeNodeExpandedEvent
) => void;

type onSelectNodeFunction = (node: ISchemaObject) => void;

interface TreeProps {
  /**
   * 默认被选中项的 id
   */
  selectedId?: string;

  /**
   * 默认展开的树节点 id
   */
  expandedIds?: string[];

  /**
   * 右键点击节点的回调函数
   */
  onRightClickNode?: (options: ComponentTreeNodeMouseEvent) => void;

  /** 展开/收起节点时触发 */
  onExpand?: onExpandFunction;

  /**
   * 选中节点时的回调函数
   */
  onSelectNode?: onSelectNodeFunction;
}

interface TreeWithSchemaProps extends TreeProps {
  /**
   * 生成组件树的 schema 对象
   */
  schema: ISchemaModel | ISchemaObject;
}

interface TreeState {
  // selectedId?: string;
}

// 推荐使用 decorator 的方式，否则 stories 的导出会缺少 **Prop Types** 的说明
// 因为 react-docgen-typescript-loader 需要  named export 导出方式
@observer
export class ComponentTree extends Component<TreeWithSchemaProps, TreeState> {
  constructor(props: TreeWithSchemaProps) {
    super(props);
    this.state = {};
  }

  onSelectNode = (selectedKeys: any, info: AntTreeNodeSelectedEvent) => {
    const { onSelectNode, schema } = this.props;
    const id = selectedKeys && selectedKeys[0];

    if (!!id && onSelectNode) {
      let node = findById(schema, id) as ISchemaObject;
      onSelectNode && onSelectNode(node);
    }
  };

  /**
   * 非递归生成组件树结构
   *
   * @memberof ComponentTree
   */
  renderTree = (root: ISchemaModel | ISchemaObject) => {
    const treeNodeIdMap: any = {};
    let count = 0;
    const nodes = traverse(root, (node: ISchemaObject, nodeArray: any = []) => {
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
    if (!!id && onRightClickNode) {
      let node = findById(schema, id) as ISchemaObject;
      onRightClickNode({ event, node });
    }
  };

  render() {
    const { schema, selectedId, expandedIds = [], onExpand } = this.props;
    const keys = expandedIds.slice();

    return (
      <Tree
        key="componentTree"
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
const onExpandWithStore = (
  stores: IStoresModel,
  onExpand: onExpandFunction
) => (expandedKeys: string[], info: AntTreeNodeExpandedEvent) => {
  stores.setExpandedIds(expandedKeys);
  onExpand && onExpand(expandedKeys, info);
};

const onSelectNodeWithStore = (
  stores: IStoresModel,
  onSelectNode: onSelectNodeFunction
) => (node: ISchemaObject) => {
  stores.setSelectedId(node.id);
  onSelectNode && onSelectNode(node);
};

/**
 * 科里化创建 ComponentTreeWithStore 组件
 * @param stores - store 模型实例
 */
export const ComponentTreeAddStore = (stores: IStoresModel) =>
  observer(function ComponentTreeWithStore(props: TreeWithSchemaProps) {
    return (
      <ComponentTree
        schema={stores.schema}
        selectedId={stores.selectedId}
        expandedIds={stores.expandedIds}
        onExpand={onExpandWithStore(stores, props.onExpand)}
        onSelectNode={onSelectNodeWithStore(stores, props.onSelectNode)}
        {...props}
      />
    );
  });
/**
 * 工厂函数，每调用一次就获取一副 MVC
 * 用于隔离不同的 ComponentTreeWithStore 的上下文
 */
export const ComponentTreeFactory = () => {
  const stores = StoresFactory(); // 创建 model
  const app = AppFactory(stores); // 创建 controller，并挂载 model
  return {
    stores,
    app,
    client: app.client,
    ComponentTreeWithStore: ComponentTreeAddStore(stores)
  };
};
