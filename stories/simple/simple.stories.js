import React from 'react';
import { storiesOf } from '@storybook/react';
import { wInfo } from '../../.storybook/utils';

import { SchemaTree, createSchemaModel } from '../../src/';

import mdMobx from './simple-mobx.md';
import mdPlain from './simple-plain.md';
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
var schema1 = {
  ...base('Row_1'),
  children: [
    {
      name: 'Col',
      id: 'Col_1',
      children: [base('Row_2'), base('Row_3')]
    }
  ]
};
const schema = createSchemaModel(schema1);

function clickBtn() {
  schema.setName('jscon222');
}

const plainSchema = schema.toJSON();

const onExpand = function(keys) {
  console.log(999, keys);
};

storiesOf('基础使用', module)
  .addParameters(wInfo(mdMobx))
  .addWithJSX('使用 mobx 对象', () => (
    <div>
      <SchemaTree
        schema={schema}
        selectedId={'Col_1'}
        expandedIds={['Row_1']}
        onExpand={onExpand}
      />
      <button onClick={clickBtn}>点击更换 name （会响应）</button>
    </div>
  ))
  .addParameters(wInfo(mdPlain))
  .addWithJSX('普通 schema 对象', () => (
    <div>
      <SchemaTree
        schema={plainSchema}
        selectedId={'Col_1'}
        expandedIds={['Row_1']}
        onExpand={onExpand}
      />
      <button onClick={clickBtn}>点击更换 name （无效）</button>
    </div>
  ));
