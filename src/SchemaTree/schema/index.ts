import {
  types,
  destroy,
  IAnyModelType,
  Instance,
  SnapshotOrInstance,
  cast,
  detach
} from 'mobx-state-tree';
import { invariant, pick, isExist } from 'ide-lib-utils';

import { sortNumberDesc } from '../../lib/util';
import { debugModel, debugInteract } from '../../lib/debug';
import {
  stringifyAttribute,
  findById,
  getAllNodes,
  updateSchema,
  createEmptySchema,
  updateSchemaTree,
  getIdRegex,
  genCompIdByName
} from './util';

import { ISchemaProps } from '../../index';

import { map, traverse, TRAVERSE_TYPE } from 'ss-tree';


// 获取被 schema tree 控制的 key 的列表
export type TSchemaControlledKeys = keyof SnapshotOrInstance<
  typeof SchemaModel
>;
// 定义被 store 控制的 key 的列表，没法借用 ts 的能力动态从 TSchemaControlledKeys 中获取
export const SCHEMA_CONTROLLED_KEYS: string[] = [
  'screenId',
  'name',
  'id',
  'attrs',
  'children'
];

/**
 * 组件 schema 模型
 */
export const SchemaModel = types
  .model('SchemaModel', {
    id: types.string, // 创建之后不要让用户层面轻易更改
    screenId: types.optional(types.string, '_unset'), // 这个是显示在页面上的 id，是可以被更改的，该 id 是用在回调函数等地方
    name: types.optional(types.string, ''),
    attrs: types.optional(types.string, '{}'), // 保存属性字符串,
    parentId: types.optional(types.string, ''), // 保存父节点
    children: types.array(types.late((): IAnyModelType => SchemaModel)) // 在 mst v3 中， `types.array` 默认值就是 `[]`
  })

  // L0:get 基于 mobx 的 computed 功能，默认会有缓存功能
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
      },

      /**
       * 是否是根节点
       * 依赖属性：parentId
       */
      get isRoot() {
        return !!self.parentId;
      }

    };
  })
  // L0:update 更新节点属性
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
        invariant(!!id, '目标 screenId 不应该为空');
        
        // 同时需要保证更改后的 screenId 是树节点中唯一的，不能和现有的重复
        const isExist = traverse(
          self,
          (node: ISchemaProps) => {
            return node.screenId == id;
          },
          TRAVERSE_TYPE.BFS,
          true
        );

        invariant(!isExist, '修改不生效，因为目标 screenId 已存在');

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
      setAttrs(attrOrObject: Partial<ISchemaProps>) {
        // let attrObject = attrOrObject;
        // // 如果
        // if (typeof attrOrObject === 'string') {
        //   attrObject = JSON.parse(attrOrObject);
        // }
        self.attrs = stringifyAttribute(attrOrObject);
      }
    };
  })
  // L1:get 根据 id 等定位获得特定子节点
  .views(self => {
    return {
      /**
       * 根据 id 返回后代节点（不一定是直系子节点），如果有过滤条件，则返回符合过滤条件的节点
       */
      findNode(id: string, filterArray?: string | string[]) {
        debugModel(`[findNode] 开始查找节点 ${id}, filterArray: ${filterArray}`)
        return findById(self as any, id, filterArray);
      },
      /**
       * 根据 id 定位到直系子节点的索引值；
       * 即，返回子节点中指定 id 对应的节点位置
       */
      indexOfChild(id: string): number {
        if (!id) {
          return -1;
        }
        let ids = (this.children || []).map((child: ISchemaModel) => child.id);
        return ids.indexOf(id);
      },

      /**
       * 只返回所有的节点的属性子集合
       * 依赖：allNodes
       */
      allNodesWithFilter(filterArray: string | string[] = SCHEMA_CONTROLLED_KEYS) {
        const filters = [].concat(filterArray || []);
        return self.allNodes.map((node: any) => pick(node, filters));
      },

      /**
       * 拷贝当前的一份节点，注意不要拷贝 id、functions 等属性
       */
      clone() {
        let clonedNode = map(self, function (node: ISchemaModel) {
          let regex = getIdRegex(node.screenId); // 生成 screen id 相关的正则匹配
          let newScreenId = genCompIdByName(node.name); // 生成屏幕可见的 id，方便用户更改，也可以被用户在其他地方去引用
          let newUId = genCompIdByName(node.name, true); // 生成节点的唯一 id，用户层面不可被操作，用于内部程序级别的操作；
          let attrStr = JSON.stringify(node.attrsJSON).replace(regex, newScreenId);  // 将内部的 screen id 替换成新的 screen id 变量

          return SchemaModel.create({
            name: node.name,
            attrs: attrStr,
            id: newUId,
            screenId: newScreenId
          })
        }, true, (parent: any, children: any) => {
          parent.setChildren(children); // 调用 comp.setChildren 方法
        }) as ISchemaModel;

        debugModel(`[clone] 将节点 ${self.id} 拷贝成新节点 ${clonedNode.id}, 生成的节点对象：%o`, clonedNode);
        return clonedNode;
      }
    };
  }) 
  // L1:update, 批量更新指定属性，本质是组合调用上一层的 set 操作
  .actions(self => {
    return {
      /**
       * 更新当前节点的属性
       * 影响属性：attrName 对应的属性
       */
      updateAttribute: (attrName: string, value: string | object): boolean => {
        return updateSchema(self, attrName, value);
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
          return updateSchema(node, attrName, value);
        }
        return false;
      },

      /**
        * 新增直系节点，简单的 append
        * 影响属性：children
        */
      addChildren: (nodeOrNodeArray: ISchemaModel | ISchemaModel[]) => {
        const nodes = [].concat(nodeOrNodeArray);
        nodes.forEach(node => {
          node.setParentId(self.id);
          self.children.push(node);
        });
      }
    };
  })
  // L1:del 删除操作
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
  // L2:get 复杂获取操作，比如获取拷贝后的新节点
  .actions(self=>{
    return {
      /**
       * 根据拷贝当前的子节点（依据子节点的 id）
       */
      cloneFromSubId(id: string){
        const originNode = self.findNode(id) as ISchemaModel; // 定位节点
        debugModel(`[cloneFromSubId] 拷贝生成的节点 id ${originNode && originNode.id}`);
        return { origin: originNode, target: originNode && originNode.clone()};
      }
    }
  })
  // L2:update 子节点相关的更新操作
  .actions(self => {
    return {
      /**
       * 新增直系节点
       * 新增单个直系节点到指定位置，操作稍微复杂
       * 影响属性：children
       * @param {number} targetIndex - 指定插入的位置，该 `targetIndex` 插入的行为和 Array.splice 方法类似
       */
      addChild: (insertedNode: ISchemaModel, targetIndex?: number) => {
        const currentLen = self.children.length;

        // 无子节点的情况
        if (!currentLen) {
          self.addChildren(insertedNode);
          return;
        }

        // 注意：要将 targetIndex 转换成数字
        let resultIndex = isExist(targetIndex) ? + targetIndex : currentLen;
        // const originChildren = self.children.toJSON();
        insertedNode.setParentId(self.id);
        self.children.splice(resultIndex, 0, insertedNode);

      }
    };
  })
  // L2:del 删除操作
  .actions(self=>{
    return {
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
    }
  })
  // L3:update 基于上述基础 api 封装的较高层级 API
  .actions(self=>{
    return {
      /**
      * 给当前（孙）子节点新增单个兄弟节点到指定位置
      * offset 指定偏移量，0 表示自己的前一个位置，1 表示自己的后一个位置，以此类推
      * 备注：进行这种操作的前提条件是 subNode 存在父节点
      * 影响属性：父节点下的 children
      * @param {number} targetIndex - 指定插入的位置，该 `targetIndex` 插入的行为和 Array.splice 方法类似
      */
      addSibling: (subNode: ISchemaModel, insertedNode: ISchemaModel, offset: number | string = 0): boolean => {

        if (!isExist(subNode.parentId)) {
          debugModel(`[addSibling] 节点 ${subNode.id} 无父元素，无法进行新增兄弟节点的操作`);
          return false;
        }

        const parentNode = self.findNode(subNode.parentId) as ISchemaModel; // 找到该 subNode 的父节点
        if(!parentNode) {
          debugModel(`[addSibling] 当前节点 ${self.id} 中无 ${subNode.parentId} 节点，按理说不应出现这种异常状态，请检查树形结构合理性`);
          return false;
        }

        // 找到要插入节点在 parentModel 的 child 位置
        const nodeIndex = parentNode.indexOfChild(subNode.id);
        const targetIndex = parseInt(offset as string) + nodeIndex;
        debugModel(`[addSibling] 计算插入位置：${nodeIndex} + ${offset}= ${targetIndex}`);
        
        // 调用上一层 api 完成该项功能，注意这里的 offset 是字符
        parentNode.addChild(insertedNode, + targetIndex);

        return true;
      },
    }
  
  });

export interface ISchemaModel extends Instance<typeof SchemaModel> {}

// 获取被 schema tree 控制的 key 的列表
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
  .views(self => {
    return {
      /**
       * 只返回当前模型的属性，可以通过 filter 字符串进行属性项过滤
       */
      allAttibuteWithFilter(filterArray: string | string[] = CONTROLLED_KEYS) {
        const filters = [].concat(filterArray || []);
        return pick(self, filters);
      }
    };
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
