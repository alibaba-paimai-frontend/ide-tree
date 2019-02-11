import {
  types,
  destroy,
  IAnyModelType,
  Instance,
  SnapshotOrInstance,
  cast
} from 'mobx-state-tree';
import { debugModel, debugInteract } from '../../lib/debug';
import { invariant, sortNumberDesc, pick } from '../../lib/util';
import {
  stringifyAttribute,
  findById,
  getAllNodes,
  updateSchema,
  createEmptySchema,
  updateSchemaTree
} from './util';

import { ISchemaProps } from '../../index';

import { map } from 'ss-tree';

/**
 * 组件 schema 模型
 */
export const SchemaModel = types
  .model('SchemaModel', {
    id: types.optional(types.string, ''), // 创建之后固定，不能再更改
    screenId: types.optional(types.string, ''), // 这个是显示在页面上的 id，是可以被更改的，该 id 是用在回调函数等地方
    name: types.optional(types.string, ''),
    attrs: types.optional(types.string, '{}'), // 保存属性字符串,
    parentId: types.optional(types.string, ''), // 保存父节点
    children: types.array(types.late((): IAnyModelType => SchemaModel)) // 在 mst v3 中， `types.array` 默认值就是 `[]`
  })

  // 基于 mobx 的 computed 功能，默认会有缓存功能
  .views(self => {
    return {
      /**
       * 获取 JSON 格式的 attrs
       * 依赖属性：attrs
       */
      get attrsJSON() {
        return JSON.parse(self.attrs);
      },

      /**
       * 获取直系子类的 id 列表
       * 依赖属性：children
       */
      get childrenIds() {
        return (self.children || []).map((child: ISchemaModel) => child.id);
      },

      /**
       * 获取 schema json 格式数据
       * 依赖属性：attrs
       */
      get schemaJSON() {
        return map(
          self,
          (node: ISchemaProps) => {
            return Object.assign({}, (node as any).attrsJSON, {
              id: node.id,
              screenId: node.screenId,
              name: node.name
            });
          },
          true
        );
      },

      /**
       * 返回包含所有节点的列表集合
       * 依赖属性：所有
       */
      get allNodes() {
        return getAllNodes(self as ISchemaModel);
      }
    };
  })
  .views(self => {
    return {
      /**
       * 根据 id 返回后代节点（不一定是直系子节点），如果有过滤条件，则返回符合过滤条件的节点
       */
      findNode(id: string, filterArray?: string | string[]) {
        return findById(self as any, id, filterArray);
      },
      /**
       * 根据 id 定位到直系子节点的索引值；
       * 即，返回子节点中指定 id 对应的节点位置
       */
      indexOfChildren(id: string) {
        if (!id) {
          return -1;
        }
        let ids = (this.children || []).map((child: ISchemaModel) => child.id);
        return ids.indexOf(id);
      },

      /**
       * 只返回所有的节点的属性子集合，其实该方法和 util 中的 `allNodesWithFilter` 有异曲同工之处
       * 依赖：allNodes
       */
      allNodesWithFilter(filterArray: string | string[] = CONTROLLED_KEYS) {
        const filters = [].concat(filterArray || []);
        return self.allNodes.map((node: any) => pick(node, filters));
      }
    };
  })
  .actions(self => {
    return {
      /**
       * 更新 parentId 属性
       * 影响属性：parentId
       */
      setParentId(id: string) {
        invariant(!!id, `不能将 id 设置成空`);
        self.parentId = id;
      },
      /**
       * 更新 children 属性
       * 影响属性：当前节点的 children 属性、children 的 parentId 属性
       */
      setChildren(children: any) {
        // 设置子节点的时候需要绑定父节点
        // this.children = children || [];
        children.forEach((child: any) => {
          child.setParentId(self.id); // 绑定父节点
        });
        self.children = children || [];
      },

      /**
       * 更新 id 属性
       * 影响属性：id
       */
      setId(id: string) {
        invariant(!!id, '将要更改的 id 为空');
        self.id = id;
      },

      /**
       * 更新 screenId 属性
       * 影响属性：screenId
       */
      setScreenId(id: string) {
        invariant(!!id, '将要更改的 screen id 为空');
        self.screenId = id;
      },

      /**
       * 更新 name 属性
       * 影响属性：name
       */
      setName(name: string) {
        invariant(!!name, '不能将 name 更改为空值');
        self.name = name;
      },

      /**
       * 更新 attrs 属性
       * 影响属性：attrs
       */
      setAttrs(attrOrObject: string | object) {
        let attrObject = attrOrObject;
        // 如果
        if (typeof attrOrObject === 'string') {
          attrObject = JSON.parse(attrOrObject);
        }

        self.attrs = stringifyAttribute(attrObject as ISchemaProps);
      }
    };
  })
  // update 操作
  .actions(self => {
    return {
      /**
       * 更新当前节点的属性
       * 影响属性：attrName 对应的属性
       */
      updateAttribute: (attrName: string, value: string | object): boolean => {
        return updateSchema(self as ISchemaModel, attrName, value);
      },

      /**
       * 更新当前节点下的后代节点属性
       * 影响属性：后代节点中 attrName 对应的属性
       */
      updateAttributeById: (
        id: string,
        attrName: string,
        value: string | object
      ): boolean => {
        if (!id) return false;
        // 首先找到节点
        const node = self.findNode(id);

        if (!!node) {
          // 首先找到节点
          return updateSchema(node as ISchemaModel, attrName, value);
        }
        return false;
      }
    };
  })
  // 删除操作
  .actions(self => {
    return {
      removeNode: (id: string): false | ISchemaProps => {
        if (!id) return false;

        const node = self.findNode(id); // 找到指定的节点
        if (node) {
          const nodeTobeRemove = (node as any).toJSON();
          destroy(node as ISchemaModel); // 从 mst 中移除节点
          return nodeTobeRemove;
        }

        return false;
      }
    };
  })
  // 子节点相关
  .actions(self => {
    return {
      /**
       * 新增直系节点
       * 影响属性：children
       */
      addChildren: (nodeOrNodeArray: ISchemaModel | ISchemaModel[]) => {
        const nodes = [].concat(nodeOrNodeArray);
        nodes.forEach(node => {
          node.setParentId(self.id);
          self.children.push(node);
        });
      },
      /**
       * 根据 id 删除直系节点，如果想要整个重置 children，请使用 `setChildren` 方法
       * 影响属性：children
       */
      removeChildren: (idOrIdArray: string | string[]) => {
        const ids = [].concat(idOrIdArray);
        debugModel(
          `[comp] 删除前 children 长度: ${
            self.children.length
          }, 待删除的 ids: ${ids.join('、')}`
        );

        const originIds = [].concat(self.childrenIds);

        const targetIndexes = ids.map(id => {
          return originIds.indexOf(id);
        });

        // 降序排列
        targetIndexes.sort(sortNumberDesc);

        // 逆序删除子元素
        targetIndexes.forEach(index => {
          if (index !== -1) {
            let nodeToBeRemoved = self.children[index];
            destroy(nodeToBeRemoved);
          }
        });

        debugModel(
          `[comp] 删除后 children 长度: ${
            self.children.length
          }，ids: ${self.children.map(o => o.id).join('、')}`
        );
      }
    };
  });

export interface ISchemaModel extends Instance<typeof SchemaModel> {}

// 获取被 store 控制的 key 的列表
export type TSchemaTreeControlledKeys = keyof SnapshotOrInstance<
  typeof SchemaTreeModel
>;

// 定义被 store 控制的 key 的列表，没法借用 ts 的能力动态从 TSchemaControlledKeys 中获取
export const CONTROLLED_KEYS: string[] = [
  'schema',
  'selectedId',
  'expandedIds'
];

export const SchemaTreeModel = types
  .model('SchemaTreeModel', {
    schema: SchemaModel,
    selectedId: types.optional(types.string, ''),
    expandedIds: types.array(types.string)
  })
  .actions(self => {
    return {
      setSchema(model: SnapshotOrInstance<typeof self.schema>) {
        self.schema = cast(model);
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
      updateAttribute(name: string, value: any) {
        return updateSchemaTree(self as ISchemaTreeModel, name, value);
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
      resetToEmptyTree() {
        const nodeToRemoved = (self.schema as any).toJSON();
        self.setSchema(createEmptySchema());
        return nodeToRemoved;
      }
    };
  });

export interface ISchemaTreeModel extends Instance<typeof SchemaTreeModel> {}
