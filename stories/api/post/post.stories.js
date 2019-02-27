import React from 'react';
import { storiesOf } from '@storybook/react';
import { Row, Col, Input, Button, Select } from 'antd';
import { wInfo } from '../../../.storybook/utils';
import mdPost from './post.md';

import { SchemaTreeFactory } from '../../../src';
import { treegen } from '../../helper';
// const { SchemaTreeWithStore, client } = SchemaTreeFactory();

const {SchemaTreeWithStore, client} = SchemaTreeFactory();

const { Option } = Select;
const styles = {
  demoWrap: {
    display: 'flex',
    width: '100%'
  }
};

function createNew() {
  const schema = treegen({});
  client.post('/tree', { schema: schema });
}

function insertUnderRoot() {
  client.post('/tree/children', { name: 'name', value: 'ggggod' });
}


const insertNew = (type = 'CHILD') => () => {
  const id = document.getElementById('nodeId').value;
  if (!id) {
    document.getElementById('info').innerText = '请输入节点 id';
    return;
  }

  const value = document.getElementById('targeValue').value;
  const targetIndex = document.getElementById('targetIndex').value;

  let api = `/nodes/${id}/children`;
  switch (type) {
    case 'CHILD':
      api = `/nodes/${id}/children`
      break;
    case 'SIB':
      api = `/nodes/${id}/sibling`
      break;
    default:
      break;
  }

  // 更新节点属性，返回更新后的数值
  client
    .post(api, Object.assign({ schema: JSON.parse(value) }, type === 'CHILD' ? { targetIndex: targetIndex} : {offset: targetIndex}))
    .then(res => {
      const { status, body } = res;
      if (status === 200) {
        const isSuccess = body.success;
        const message = body.message;
        client.get(`/nodes/${id}`).then(res => {
          const { status, body } = res;
          if (status === 200) {
            const node = body.node || {};
            document.getElementById('info').innerText =
              `插入节点：${isSuccess}- ${message}\n` +
              JSON.stringify(node.toJSON ? node.toJSON() : node, null, 4);
              // 同时选中那个节点
              client.put(`/selection/${node.id}`);
          }
        });

      }
    })
    .catch(err => {
      document.getElementById('info').innerText =
        `更新失败： \n` + JSON.stringify(err, null, 4);
    });
}
storiesOf('API - post', module)
  .addParameters(wInfo(mdPost))
  .addWithJSX('/nodes/:id/children 新增子节点', () => {
    return (
      <Row style={styles.demoWrap}>
        <Col span={10} offset={2}>
          <Row>
            <Col span={4}>
              <Input placeholder="目标节点 ID" id="nodeId" />
            </Col>
            
            <Col span={8}>
              <Input placeholder="要插入的 schema" id="targeValue" />
            </Col>
            <Col span={4}>
              <Input placeholder="插入后子节点位置" id="targetIndex" />
            </Col>
            <Col span={8}>
              <Button onClick={insertNew('CHILD')}>插成子节点</Button>
              <Button onClick={insertNew('SIB')}>插成兄弟节点</Button>
              <Button onClick={insertUnderRoot}>在根节点下插入</Button>
              <Button onClick={createNew}>创建随机树</Button>
            </Col>
          </Row>

          <SchemaTreeWithStore />
        </Col>
        <Col span={12}>
          <div id="info" />
        </Col>
      </Row>
    );
  });
