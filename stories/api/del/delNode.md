
## 删除节点信息

## 删除指定节点信息

以下请求将更新指定 id 节点的信息：
```js
client.put(`/nodes/${id}`, { name: attrName, value: newValue })
```
将更改指定属性名（目前可更改的属性有 `screenId`、`name` 和 `attrs`）所对应的值为 `newValue`;

