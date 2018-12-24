
## 获取所有节点信息

直接访问将返回所有的节点列表：
```js
client.get('/nodes')
```

可以添加 `filter` 查询参数框定所想要返回的字段集，比如以下请求返回的节点结果集只包含节点的 `id` 和 `attrs` 属性

```js
client.get('/nodes?filter=id,attrs')
```

## 获取指定节点信息

以下请求将返回指定 id 节点的信息：
```js
client.get('/nodes/:id')
```

可以添加 `filter` 查询参数框定所想要返回的字段集，比如以下请求返回将只包含节点的 `id` 和 `attrs` 属性

```js
client.get('/nodes/:id?filter=id,attrs')
```
