
## 新增子节点

## 新增子节点

以下请求将在对应 id 节点下的第 `targetIndex` 位置新增子节点：
```js
client.post(`/nodes/children/${id}`, { schema: schema, targetIndex: index })
```
将更改指定属性名;

