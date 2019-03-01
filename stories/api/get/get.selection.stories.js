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


const getSelection = client => () =>{
  client.get(`/selection`).then(res => {
    const { status, body } = res;
    if (status === 200) {
      const message = body.message;
      const node = body.data.id || 'no selected';
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
  .addWithJSX('/selection 获取当前选中节点 id', () => {
    return (
      <Row style={styles.demoWrap}>
        <Col span={10} offset={2}>
          {/* <Input
            placeholder="输入节点 ID"
            id="nodeId"
          /> */}
          <>
            <Button onClick={getSelection(client1)}>获取选中节点 id</Button>
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
