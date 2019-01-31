import * as React from 'react';
import { render } from 'react-dom';
import { SchemaTree, createSchemaModel } from '../src/';

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
render(
  <SchemaTree
    schema={schema}
    selectedId={'Col_1'}
    expandedIds={['Row_1']}
    onExpand={onExpand}
  />,
  document.getElementById('example') as HTMLElement
);
