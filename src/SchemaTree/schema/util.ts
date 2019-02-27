import {
  SchemaModel,
  ISchemaModel,
  ISchemaTreeModel,
  SchemaTreeModel
} from './index';
import { invariant, pick, capitalize } from 'ide-lib-utils';


import { uuid } from '../../lib/util';
import { debugModel } from '../../lib/debug';
import { map, traverse, TRAVERSE_TYPE } from 'ss-tree';
import { IStoresModel } from './stores';
import { DEFAULT_PROPS, ISchemaProps, ISchemaTreeProps } from '../index';

// 列举 schema 中特殊的字段名，一般是可以根据现有 schema 计算出来的属性，不需要硬编码
// 而诸如 props、fetch 等字段，需要存储起来
export enum SPECIAL_ATTRIBUTE_NAME {
  IDS = 'ids', // 该值是辅助编辑器判断 id 是否重复
  CHILDREN = 'children', // children 属性
  ID = 'id', // id 属性,
  NAME = 'name', // name 属性
  PARENTID = 'parentId', // parentId 属性
  SCREENID = 'screenId' // screenId 属性
}
export const SPECIAL_NAMES = Object.values(SPECIAL_ATTRIBUTE_NAME);

/**
 * 根据组件名生成 id
 *
 * @export
 * @param {string} [name='unknow'] - 组件名，如果不指定则为 'unknown'
 * @param {boolean} [isMasterApp=false] - 是否是母版环境，如果是的话，添加 'master_' 前缀
 * @returns
 */
export function genCompIdByName(
  name: string = 'unknown',
  isMasterApp: boolean = false,
  isUUID: boolean = false
) {
  let uid = uuid();
  let prefix = isMasterApp ? 'master_' : '';
  let ssPrefix = isUUID ? 'uu_' : '';
  return `\$${ssPrefix}${prefix}${name}_${uid}`;
}

// 忽略 children 的值，该属性做特殊处理
// 忽略 ids 的值，该值是辅助编辑器判断 id 是否重复
// 忽略 id、name、parentId ，等可以通过 schema 模型推算出来的数值
function replacer(key: string, value: any) {
  if (SPECIAL_NAMES.includes(key)) {
    return undefined;
  }

  return value;
}

/**
 * 将普通的 schema 对象转换成字符串形式
 * 转换过程中，将使用 replacer 函数将 schema 中的特殊属性 “剔除掉”
 * @export
 * @param {ISchemaProps} schema
 * @returns
 */
export function stringifyAttribute(schema: ISchemaProps) {
  return JSON.stringify(schema, replacer);
}

/**
 * 将普通对象转换成 schema Model
 * 具体操作是：利用树遍历算法生成组件模型
 *
 * @export
 * @param {ISchemaProps} schema
 * @returns {ISchemaModel}
 */
export function createSchemaModel(
  schema: ISchemaProps = DEFAULT_PROPS.schema
): ISchemaModel {
  const mergedSchema = Object.assign({}, DEFAULT_PROPS.schema, schema);

  // 传递给 map 函数的对象，必须具备 `children` 属性，否则没法迭代
  if (!mergedSchema.children) {
    mergedSchema.children = [];
  }

  return map(
    mergedSchema,
    (node: any) => {
      // 设置属性
      const newSchema = SchemaModel.create({
        id:
          (<ISchemaProps>node).id ||
          genCompIdByName((<ISchemaProps>node).name, false, true),
        screenId:
          (<ISchemaProps>node).screenId ||
          genCompIdByName((<ISchemaProps>node).name),
        name: (<ISchemaProps>node).name, // 组件名
        attrs: stringifyAttribute(<ISchemaProps>node)
      });
      return newSchema;
    },
    true,
    (parent: any, children: any[]) => {
      parent.setChildren(children); // 调用 comp.setChildren 方法
    }
  ) as ISchemaModel;
}

/**
 * 创建一个空白的 schema
 *
 * @export
 * @returns
 */
export function createEmptySchema() {
  return createSchemaModel();
}

export function createSchemaTreeModel(
  modelObject: ISchemaTreeProps = DEFAULT_PROPS
) {
  const mergedProps = Object.assign({}, DEFAULT_PROPS, modelObject);
  const { schema, selectedId, expandedIds } = mergedProps;
  return SchemaTreeModel.create({
    schema,
    selectedId,
    expandedIds
  });
}

export function createEmptySchemaTreeModel() {
  return createSchemaTreeModel();
}

type SchemaOrModel = ISchemaModel | ISchemaProps;
/**
 * 从当前的 schema 中提取出所有的节点；按广度遍历
 *
 * @export
 * @param {SchemaOrModel} schema - 要提取 ids 的 schema/model 引用值
 * @returns {SchemaOrModel[]}
 */
export function getAllNodes(
  model: SchemaOrModel,
  filterArray?: string | string[]
) {
  const filters = [].concat(filterArray || []); // 使用逗号隔开
  return traverse(
    model as ISchemaProps,
    (node: any, lastResult: SchemaOrModel[] = []) => {
      lastResult.push(filters.length ? pick(node, filters) : node);
      return lastResult;
    }
  );
}

/**
 * 根据节点 id 找到到子 Model 实例
 *
 * @export
 * @param {(ISchemaModel | ISchemaProps)} model - 根节点
 * @param {string} id - 想要查找的节点 id
 * @returns {(ISchemaModel | null)}
 */
export function findById(
  model: ISchemaModel | ISchemaProps,
  id: string,
  filterArray?: string | string[]
): ISchemaModel | ISchemaProps | null {
  if (!id) return null;

  let modelNode = null;
  const filters = [].concat(filterArray || []); // 使用逗号隔开

  traverse(
    model as ISchemaProps,
    (node: any) => {
      if (node.id === id) {
        modelNode = filters.length ? pick(node, filters) : node;
        return true;
      }
      return false;
    },
    TRAVERSE_TYPE.BFS,
    true
  );

  return modelNode;
}

/* ----------------------------------------------------
    更新节点信息
----------------------------------------------------- */
const update = (valueSet: string[]) => (
  item: ISchemaModel | ISchemaTreeModel | IStoresModel,
  attrName: string,
  value: any
): boolean => {
  invariant(!!item, '入参 item 必须存在');
  // 如果不是可更新的属性，那么将返回 false
  if (!valueSet.includes(attrName)) {
    debugModel(
      `[更新属性] 属性名 ${attrName} 不属于可更新范围，无法更新成 ${value} 值；（附:可更新属性列表：${valueSet}）`
    );
    return false;
  }

  const functionName = `set${capitalize(attrName)}`; // 比如 attrName 是 `type`, 则调用 `setType` 方法
  (item as any)[functionName](value);
  return true;
};

// 定义 panel 可更新信息的属性
const SCHEMA_EDITABLE_ATTRIBUTE = ['name', 'screenId', 'attrs'];
export const updateSchema = update(SCHEMA_EDITABLE_ATTRIBUTE);

// 定义 panel 可更新信息的属性
const SCHEMATREE_EDITABLE_ATTRIBUTE = ['schema', 'selectedId', 'expandedIds'];
export const updateSchemaTree = update(SCHEMATREE_EDITABLE_ATTRIBUTE);

// 定义 stores 可更新信息的属性
const STORES_EDITABLE_ATTRIBUTE = ['schemaTree'];
export const updateStoresAttribute = update(STORES_EDITABLE_ATTRIBUTE);
