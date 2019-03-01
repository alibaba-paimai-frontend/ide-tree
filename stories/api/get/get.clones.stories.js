import React from 'react';
import { storiesOf } from '@storybook/react';
import { Row, Col, Input, Button } from 'antd';
import { wInfo } from '../../../.storybook/utils';
import mdGetNode from './getNode.md';

import { SchemaTreeFactory } from '../../../src';
import { treegen } from '../../helper';
// const { SchemaTreeWithStore, client } = SchemaTreeFactory();

const {
  SchemaTreeWithStore: SchemaTreeWithStore1,
  client: client1
} = SchemaTreeFactory();

const styles = {
  demoWrap: {
    display: 'flex',
    width: '100%'
  }
};


const createNew = client => () => {
  const schema = treegen({});
  client.post('/tree', { schema: schema });
};

const createClone = client => () => {
  const id = document.getElementById('nodeId').value;
  client.post(`/nodes/${id}/clone`).then(res => {
    const { status, body } = res;
    if (status === 200) {
      const message = body.message;
      const node = body.data.target || {};
      const origin = body.data.origin || {};
      document.getElementById('info').innerText = `${message} \n` + JSON.stringify(
        node,
        null,
        4
      ) + `\n\n 源节点信息:${JSON.stringify(origin, null, 4)}`;
    }
  });

  // 同时选中那个节点
  client.put(`/selection/${id}`);
};

const pasteClone = client => () => {
  const id = document.getElementById('nodeId').value;
  client.post(`/nodes/${id}/children`, {useBuffer: true}).then(res => {
    const { status, body } = res;
    if (status === 200) {
      const message = body.message;
      const node = body.data.node || {};
      document.getElementById('info').innerText = `${message} \n` + JSON.stringify(
        node,
        null,
        4
      ) + `\n\n 插入节点的信息:${JSON.stringify(node, null, 4)}`;
    }
  });

  // 同时选中那个节点
  client.put(`/selection/${id}`);
};

const getClone = client => () =>{
  client.get(`/buffers/clone`).then(res => {
    const { status, body } = res;
    if (status === 200) {
      const message = body.message;
      const node = body.data.node || {};
      document.getElementById('info').innerText = `${message} \n` + JSON.stringify(
        node,
        null,
        4
      );
    }
  });
}

storiesOf('API - get', module)
  .addParameters(wInfo(mdGetNode))
  .addWithJSX('/buffers/clone 获取 clone 节点', () => {
    return (
      <Row style={styles.demoWrap}>
        <Col span={10} offset={2}>
          <Input
            placeholder="输入节点 ID"
            id="nodeId"
          />
          <>
            <Button onClick={createClone(client1)}>拷贝节点</Button>
            <Button onClick={getClone(client1)}>获取拷贝节点</Button>
            <Button onClick={pasteClone(client1)}>粘贴拷贝节点</Button>
            <Button onClick={createNew(client1)}>创建随机树</Button>
          </>
          <SchemaTreeWithStore1 />
        </Col>
        <Col span={12}>
          <div id="info" />
        </Col>
      </Row>
    );
  });
