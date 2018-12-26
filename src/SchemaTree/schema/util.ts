import { SchemaModel, ISchemaModel } from '.';
import { invariant, uuid, pick } from '../../lib/util';
import { map, traverse, NodeLikeObject, TRAVERSE_TYPE } from 'ss-tree';

// 和属性编辑器直接互相传递的 schema object 接口
export interface ISchemaObject extends NodeLikeObject {
  id: string; // 可以变更的 id
  name: string; // 组件名，比如 'Row'、'Col',
  screenId: string; // 不可变更的 id,
  parentId?: string; // 父组件 id,
  props?: object; // 组件初始化的 props 对象
  children?: ISchemaObject[]; // 子节点对象
  ids?: string[]; // 当前 schema 中的 ids 集合/子集合
}

// 空 schema 模板
export const EMPTY_COMP_ID = '-1';
export const EMPTY_COMP: ISchemaObject = {
  name: '[init comp]',
  id: EMPTY_COMP_ID,
  screenId: EMPTY_COMP_ID
};

// 根节点标志
export const FLAG_ROOT = '@root';

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
 * @param {ISchemaObject} schema
 * @returns
 */
export function stringifyAttribute(schema: ISchemaObject) {
  return JSON.stringify(schema, replacer);
}

/**
 * 将普通对象转换成 schema Model
 * 具体操作是：利用树遍历算法生成组件模型
 *
 * @export
 * @param {ISchemaObject} schema
 * @returns {ISchemaModel}
 */
export function createSchemaModel(schema: any): ISchemaModel {
  invariant(!!schema, 'schema 对象不能为空');
  invariant(!!schema.name, 'schema 对象缺少 `name` 属性');
  // invariant(isSchemaObject(schema), 'schema 对象不符合规范');
  // return comp;

  // 传递给 map 函数的对象，必须具备 `children` 属性，否则没法迭代
  if (!schema.children) {
    schema.children = [];
  }

  return map(
    schema,
    (node: any) => {
      // 设置属性
      const newSchema = SchemaModel.create({
        id:
          (<ISchemaObject>node).id ||
          genCompIdByName((<ISchemaObject>node).name, false, true),
        screenId:
          (<ISchemaObject>node).screenId ||
          genCompIdByName((<ISchemaObject>node).name),
        name: (<ISchemaObject>node).name, // 组件名
        attrs: stringifyAttribute(<ISchemaObject>node)
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
export function createEmptyModel() {
  return createSchemaModel(EMPTY_COMP);
}

type SchemaOrModel = ISchemaModel | ISchemaObject;
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
    model as ISchemaObject,
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
 * @param {(ISchemaModel | ISchemaObject)} model - 根节点
 * @param {string} id - 想要查找的节点 id
 * @returns {(ISchemaModel | null)}
 */
export function findById(
  model: ISchemaModel | ISchemaObject,
  id: string,
  filterArray?: string | string[]
): ISchemaModel | ISchemaObject | null {
  if (!id) return null;

  let modelNode = null;
  const filters = [].concat(filterArray || []); // 使用逗号隔开

  traverse(
    model as ISchemaObject,
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
// 定义可更新信息的属性，目前只有 3 个
enum EDITABLE_ATTRIBUTE {
  SCREENID = 'screenId',
  NAME = 'name',
  ATTRS = 'attrs'
}

const EDITABLE_ATTRIBUTE_VALUES = Object.values(EDITABLE_ATTRIBUTE);

export function updateNode(
  node: ISchemaModel,
  attrName: string,
  value: string | object
): boolean {
  // 如果不是可更新的属性，那么将返回 false
  if (!EDITABLE_ATTRIBUTE_VALUES.includes(attrName)) {
    return false;
  }

  switch (attrName) {
    case EDITABLE_ATTRIBUTE.SCREENID:
      node.setScreenId('' + value);
      break;
    case EDITABLE_ATTRIBUTE.NAME:
      node.setName('' + value);
      break;
    case EDITABLE_ATTRIBUTE.ATTRS:
      node.setAttrs(value);
      break;
    default:
      return false;
  }
  return true;
}
// ==============================
