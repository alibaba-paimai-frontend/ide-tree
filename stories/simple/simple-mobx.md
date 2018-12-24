
### 使用说明

通过 `createSchemaModel` 方法将普通对象转换成 mobx 对象：
```js
var base = id => {
  return {
    name: 'Row',
    id: id,
    props: {
      isZebra: true,
      dataSource: []
    }
  };
};
const schema = createSchemaModel({
  ...base('Row_1'),
  children: [
    {
      name: 'Col',
      id: 'Col_1',
      children: [base('Row_2'), base('Row_3')]
    }
  ]
});
```

将该 schema 传给 `ComponentTree` 组件即可。
```js
<ComponentTree schema={schema} selectedId={'Col_1'} />
```

因为是 mobx 对象，当我们更改其中的属性后属性将会生效；



