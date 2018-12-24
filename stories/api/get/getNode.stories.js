import React from 'react';
import { storiesOf } from '@storybook/react';
import { Row, Col, Input, Button } from 'antd';
import { wInfo } from '../../../.storybook/utils';
import mdGetNode from './getNode.md';

import { ComponentTreeFactory } from '../../../src';
import { treegen } from '../../helper';
// const { ComponentTreeWithStore, client } = ComponentTreeFactory();

const {
  ComponentTreeWithStore: ComponentTreeWithStore1,
  client: client1
} = ComponentTreeFactory();
const {
  ComponentTreeWithStore: ComponentTreeWithStore2,
  client: client2
} = ComponentTreeFactory();

const {
  ComponentTreeWithStore: ComponentTreeWithStore3,
  client: client3
} = ComponentTreeFactory();

const styles = {
  demoWrap: {
    display: 'flex',
    width: '100%'
  }
};

let nodes = [];

const getNodeInfo = client => () => {
  client.get('/nodes?filter=id,attrs').then(res => {
    const { status, body } = res;
    if (status === 200) {
      nodes = body.nodes;
    }

    document.getElementById('info').innerText = JSON.stringify(nodes, null, 4);
  });
};

const createNew = client => () => {
  const schema = treegen({});
  client.post('/nodes', { schema: schema });
};

const getById = client => () => {
  const id = document.getElementById('nodeId').value;
  client.get(`/nodes/${id}`).then(res => {
    const { status, body } = res;
    if (status === 200) {
      const node = body.node || {};
      document.getElementById('info').innerText = JSON.stringify(
        node.toJSON ? node.toJSON() : node,
        null,
        4
      );
    }
  });

  // 同时选中那个节点
  client.put(`/selection/${id}`);
};
storiesOf('API - get（schema隔离）', module)
  .addParameters(wInfo(mdGetNode))
  .addWithJSX('节点：/nodes 获取所有节点（独立的schema上下文）', () => {
    return (
      <Row style={styles.demoWrap}>
        <Col span={10} offset={2}>
          <Button onClick={getNodeInfo(client1)}>
            获取所有节点信息（id,attrs)
          </Button>
          <Button onClick={createNew(client1)}>创建随机树</Button>

          <ComponentTreeWithStore1 />
        </Col>
        <Col span={12}>
          <div id="info" />
        </Col>
      </Row>
    );
  })
  .addWithJSX('节点：/nodes/:id 获取指定节点信息（独立的schema上下文）', () => {
    return (
      <Row style={styles.demoWrap}>
        <Col span={10} offset={2}>
          <Input
            placeholder="输入节点 ID"
            id="nodeId"
            addonAfter={
              <>
                <Button onClick={getById(client2)}>获取节点信息</Button>
                <Button onClick={createNew(client2)}>创建随机树</Button>
              </>
            }
          />
          <ComponentTreeWithStore2 />
        </Col>
        <Col span={12}>
          <div id="info" />
        </Col>
      </Row>
    );
  });

storiesOf('API - get（schema非隔离）', module)
  .addParameters(wInfo(mdGetNode))
  .addWithJSX('节点：/nodes 获取所有节点（schema共享）', () => {
    return (
      <Row style={styles.demoWrap}>
        <Col span={10} offset={2}>
          <Button onClick={getNodeInfo(client3)}>
            获取所有节点信息（id,attrs)
          </Button>
          <Button onClick={createNew(client3)}>创建随机树</Button>

          <ComponentTreeWithStore3 />
        </Col>
        <Col span={12}>
          <div id="info" />
        </Col>
      </Row>
    );
  })
  .addWithJSX('节点：/nodes/:id 获取指定节点信息（schema共享）', () => {
    return (
      <Row style={styles.demoWrap}>
        <Col span={10} offset={2}>
          <Input
            placeholder="输入节点 ID"
            id="nodeId"
            addonAfter={
              <>
                <Button onClick={getById(client3)}>获取节点信息</Button>
                <Button onClick={createNew(client3)}>创建随机树</Button>
              </>
            }
          />
          <ComponentTreeWithStore3 />
        </Col>
        <Col span={12}>
          <div id="info" />
        </Col>
      </Row>
    );
  });
