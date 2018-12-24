## 使用说明


也可以直接传递普通 schema 对象：（比如 `.toJSON()` 后的数据格式）：


```js
const plainObject = {
    "id": "Row_1",
    "screenId": "$Row_30735",
    "name": "Row",
    "attrs": "{\"props\":{\"isZebra\":true,\"dataSource\":[]}}",
    "parentId": "",
    "functions": {},
    "children": [
        {
            "id": "Col_1",
            "screenId": "$Col_9b635",
            "name": "Col",
            "attrs": "{}",
            "parentId": "Row_1",
            "functions": {},
            "children": [
                {
                    "id": "Row_2",
                    "screenId": "$Row_9e05f",
                    "name": "Row",
                    "attrs": "{\"props\":{\"isZebra\":true,\"dataSource\":[]}}",
                    "parentId": "Col_1",
                    "functions": {},
                    "children": []
                },
                {
                    "id": "Row_3",
                    "screenId": "$Row_ddf5c",
                    "name": "Row",
                    "attrs": "{\"props\":{\"isZebra\":true,\"dataSource\":[]}}",
                    "parentId": "Col_1",
                    "functions": {},
                    "children": []
                }
            ]
        }
    ]
};
```

传递普通对象数据的话，就没有了 mobx 的自动响应变化的能力了。

```js
<ComponentTree schema={plainObject} selectedId={'Col_1'} />
```

