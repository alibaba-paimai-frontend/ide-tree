import * as React from 'react';
import { render } from 'react-dom';
import { ComponentTree, createSchemaModel } from '../src/';

const base = id => {
    return {
        name: 'Row',
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
            children: [base('Row_2'), base('Row_3')]
        }
    ]
};
const schema = createSchemaModel(schema1);

const onExpand = function (keys) {
    console.log(999, keys);
};
render(
    <ComponentTree
        schema={schema}
        selectedId={'Col_1'}
        expandedIds={['Row_1']}
        onExpand={onExpand}
    />,
  document.getElementById('example') as HTMLElement
);
