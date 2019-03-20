import * as React from 'react';
import { Button, Row, Col, Input, Select } from 'antd';
import { render } from 'react-dom';
import { SchemaTree, createSchemaModel, SchemaTreeFactory } from '../src/';
import { treegen } from '../stories/helper';

const Option = Select.Option;

const base = id => {
  return {
    name: 'Row',
    screenId: id,
    id: id,
    props: {
      isZebra: true,
      dataSource: []
    }
  };
};
const schema1 = {
  ...base('Row_1'),
  children: [
    {
      name: 'Col',
      id: 'Col_1',
      screenId: 'Col_1',
      children: [base('Row_2'), base('Row_3')]
    }
  ]
};
const schema = createSchemaModel(schema1);

const onExpand = function(keys) {
  console.log(999, keys);
};

// 当 store 有变更的时候，调用该方法
// 作用：增删改 shema 的时候，通知外界什么出现了变更
// 机理：监听 mst 的变更
const onModelChange = function(key: string, value: any) {
  console.log('model changed:', key, value.toJSON ? value.toJSON() : value);
};

// render(
//   <SchemaTree
//     schema={schema}
//     selectedId={'Col_1'}
//     expandedIds={['Row_1']}
//     onExpand={onExpand}
//   />,
//   document.getElementById('example') as HTMLElement
// );

// ========== with store ==============

const { SchemaTreeWithStore, client, stores } = SchemaTreeFactory();
let selectedAttrName = '';
function updateById() {
  const id = (document.getElementById('nodeId') as HTMLInputElement).value;
  if (!id) {
    document.getElementById('info').innerText = '请输入节点 id';
    return;
  }
  if (!selectedAttrName) {
    document.getElementById('info').innerText = '请选择要更改的属性';
    return;
  }

  const value = (document.getElementById('targeValue') as HTMLInputElement)
    .value;

  // 更新节点属性，返回更新后的数值
  client
    .put(`/nodes/${id}`, { name: selectedAttrName, value: value })
    .then(res => {
      const { status, body } = res;
      if (status === 200) {
        const isSuccess = body.success;
        client.get(`/nodes/${id}`).then(res => {
          const { status, body } = res;
          if (status === 200) {
            const node = body.node || {};
            document.getElementById('info').innerText =
              `更新操作：${isSuccess}; \n` +
              JSON.stringify(node.toJSON ? node.toJSON() : node, null, 4);
          }
        });

        // 同时选中那个节点
        client.put(`/selection/${id}`);
      }
    })
    .catch(err => {
      document.getElementById('info').innerText =
        `更新失败： \n` + JSON.stringify(err, null, 4);
    });
}

function handleChange(value) {
  console.log(`selected ${value}`);
  selectedAttrName = value;
}

render(
  <>
    <Row>
      <Col span={4}>
        <Input placeholder="节点 ID" id="nodeId" />
      </Col>
      <Col span={4}>
        <Select
          style={{ width: 200 }}
          onChange={handleChange}
          placeholder="要更改的属性"
        >
          <Option value="name">name</Option>
          <Option value="screenId">screenId</Option>
          <Option value="attrs">attrs</Option>
        </Select>
      </Col>
      <Col span={6}>
        <Input placeholder="新属性值" id="targeValue" />
      </Col>
      <Col span={10}>
        <Button onClick={updateById}>更改节点信息</Button>
        <Button onClick={updateRootName}>更新根节点名字</Button>
        <Button onClick={createNew}>创建随机树</Button>
        <Button onClick={updateRootName}>随机 root 名</Button>
        <div id="info" style={{ position: 'absolute', right: 100 }} />
      </Col>
    </Row>
    <SchemaTreeWithStore onExpand={onExpand} onModelChange={onModelChange} />
  </>,
  document.getElementById('example-stores') as HTMLElement
);

function createNew() {
  const schema = treegen({});
  client.post('/tree', { schema: schema });
  console.log(999, stores.id, stores.model.schema.name);
}

function updateRootName() {
  client.put('/tree/root', {
    name: 'name',
    value: `gggg${Math.random() * 100}`
  });
}
