import Chance from 'chance';
import { uuid } from '../src/lib/util';
const chance = new Chance();


// 来自： https://github.com/loopmode/treegen
function createTree(args, currentDepth, parentNode) {
  currentDepth = currentDepth === undefined ? 0 : currentDepth;
  const name = args.name();
  var node = {
      name: name,
      id: name,
      parentId: parentNode && parentNode.id,
    props: args.props(),
    children: []
  };

  if (currentDepth < args.depth) {
    for (var i = 0; i < args.spread; i++) {
      node.children.push(createTree(args, currentDepth + 1, node));
    }
  }
  return node;
}

export function treegen(args) {
  args.depth = args.depth === undefined ? chance.integer({min: 1, max: 3}) : args.depth;
    args.spread = args.spread === undefined ? chance.integer({ min: 1, max: 3 }) : args.spread;
  args.name =
    args.name ||
    function() {
      return uuid();
    };

  args.props =
    args.props ||
    function() {
      return {
          data_text: chance.word(),
          span: chance.integer({ min: 1, max: 10 })
      };
    };
  return createTree(args);
}
