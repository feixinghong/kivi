'use strict';

var vdom = require('../lib/vdom.js');

var ATTACHED_CONTEXT = {flags: vdom.Component.ATTACHED};

function injectBefore(parent, node, nextRef) {
  var c = vdom.create(node, ATTACHED_CONTEXT);
  parent.insertBefore(c.ref, nextRef);
  vdom.render(c, ATTACHED_CONTEXT);
  return c;
}

function e(key, c) {
  var e = vdom.e('div');
  e.children = c;
  return e;
}

function gen(item) {
  var i;
  var e;

  if (typeof item === 'number') {
    return vdom.t(item.toString());
  } else if (Array.isArray(item)) {
    var result = [];
    for (i = 0; i < item.length; i++) {
      result.push(gen(item[i]));
    }
    return result;
  } else {
    e = vdom.e('div');
    e.children = gen(item.children);
    return e;
  }
}

function checkSync(ax, bx) {
  var a = e(0, gen(ax));
  var b = e(0, gen(bx));

  var aDiv = document.createElement('div');
  var bDiv = document.createElement('div');
  var ac = injectBefore(aDiv, a, null);
  var bc = injectBefore(bDiv, b, null);

  vdom.update(ac, b, ATTACHED_CONTEXT);

  expect(aDiv.innerHTML).to.be.equal(bDiv.innerHTML);
}

var TESTS = [
  [[0], [0]],
  [[0, 1, 2], [0, 1, 2]],

  [[], [1]],
  [[], [4, 9]],
  [[], [9, 3, 6, 1, 0]],

  [[999], [1]],
  [[999], [1, 999]],
  [[999], [999, 1]],
  [[999], [4, 9, 999]],
  [[999], [999, 4, 9]],
  [[999], [9, 3, 6, 1, 0, 999]],
  [[999], [999, 9, 3, 6, 1, 0]],
  [[999], [0, 999, 1]],
  [[999], [0, 3, 999, 1, 4]],
  [[999], [0, 999, 1, 4, 5]],

  [[998, 999], [1, 998, 999]],
  [[998, 999], [998, 999, 1]],
  [[998, 999], [998, 1, 999]],
  [[998, 999], [1, 2, 998, 999]],
  [[998, 999], [998, 999, 1, 2]],
  [[998, 999], [1, 998, 999, 2]],
  [[998, 999], [1, 998, 2, 999, 3]],
  [[998, 999], [1, 4, 998, 2, 5, 999, 3, 6]],
  [[998, 999], [1, 998, 2, 999]],
  [[998, 999], [998, 1, 999, 2]],
  [[998, 999], [1, 2, 998, 3, 4, 999]],
  [[998, 999], [998, 1, 2, 999, 3, 4]],
  [[998, 999], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 998, 999]],
  [[998, 999], [998, 999, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]],
  [[998, 999], [0, 1, 2, 3, 4, 998, 999, 5, 6, 7, 8, 9]],
  [[998, 999], [0, 1, 2, 998, 3, 4, 5, 6, 999, 7, 8, 9]],
  [[998, 999], [0, 1, 2, 3, 4, 998, 5, 6, 7, 8, 9, 999]],
  [[998, 999], [998, 0, 1, 2, 3, 4, 999, 5, 6, 7, 8, 9]],

  [[1], []],
  [[1, 2], [2]],
  [[1, 2], [1]],
  [[1, 2, 3], [2, 3]],
  [[1, 2, 3], [1, 2]],
  [[1, 2, 3], [1, 3]],
  [[1, 2, 3, 4, 5], [2, 3, 4, 5]],
  [[1, 2, 3, 4, 5], [1, 2, 3, 4]],
  [[1, 2, 3, 4, 5], [1, 2, 4, 5]],

  [[1, 2], []],
  [[1, 2, 3], [3]],
  [[1, 2, 3], [1]],
  [[1, 2, 3, 4], [3, 4]],
  [[1, 2, 3, 4], [1, 2]],
  [[1, 2, 3, 4], [1, 4]],
  [[1, 2, 3, 4, 5, 6], [2, 3, 4, 5]],
  [[1, 2, 3, 4, 5, 6], [2, 3, 5, 6]],
  [[1, 2, 3, 4, 5, 6], [1, 2, 3, 5]],
  [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [2, 3, 4, 5, 6, 7, 8, 9]],
  [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [0, 1, 2, 3, 4, 5, 6, 7]],
  [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 2, 3, 4, 6, 7, 8, 9]],
  [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [0, 1, 2, 3, 4, 6, 7, 8]],
  [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [0, 1, 2, 4, 6, 7, 8, 9]],

  [[0, 1], [1, 0]],
  [[0, 1, 2, 3], [3, 2, 1, 0]],
  [[0, 1, 2, 3, 4], [1, 2, 3, 4, 0]],
  [[0, 1, 2, 3, 4], [4, 0, 1, 2, 3]],
  [[0, 1, 2, 3, 4], [1, 0, 2, 3, 4]],
  [[0, 1, 2, 3, 4], [2, 0, 1, 3, 4]],
  [[0, 1, 2, 3, 4], [0, 1, 4, 2, 3]],
  [[0, 1, 2, 3, 4], [0, 1, 3, 4, 2]],
  [[0, 1, 2, 3, 4], [0, 1, 3, 2, 4]],
  [[0, 1, 2, 3, 4, 5, 6], [2, 1, 0, 3, 4, 5, 6]],
  [[0, 1, 2, 3, 4, 5, 6], [0, 3, 4, 1, 2, 5, 6]],
  [[0, 1, 2, 3, 4, 5, 6], [0, 2, 3, 5, 6, 1, 4]],
  [[0, 1, 2, 3, 4, 5, 6], [0, 1, 5, 3, 2, 4, 6]],
  [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [8, 1, 3, 4, 5, 6, 0, 7, 2, 9]],
  [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [9, 5, 0, 7, 1, 2, 3, 4, 6, 8]],

  [[0, 1], [2, 1, 0]],
  [[0, 1], [1, 0, 2]],
  [[0, 1, 2], [3, 0, 2, 1]],
  [[0, 1, 2], [0, 2, 1, 3]],
  [[0, 1, 2], [0, 2, 3, 1]],
  [[0, 1, 2], [1, 2, 3, 0]],
  [[0, 1, 2, 3, 4], [5, 4, 3, 2, 1, 0]],
  [[0, 1, 2, 3, 4], [5, 4, 3, 6, 2, 1, 0]],
  [[0, 1, 2, 3, 4], [5, 4, 3, 6, 2, 1, 0, 7]],

  [[0, 1, 2], [1, 0]],
  [[2, 0, 1], [1, 0]],
  [[7, 0, 1, 8, 2, 3, 4, 5, 9], [7, 5, 4, 8, 3, 2, 1, 0]],
  [[7, 0, 1, 8, 2, 3, 4, 5, 9], [5, 4, 8, 3, 2, 1, 0, 9]],
  [[7, 0, 1, 8, 2, 3, 4, 5, 9], [7, 5, 4, 3, 2, 1, 0, 9]],
  [[7, 0, 1, 8, 2, 3, 4, 5, 9], [5, 4, 3, 2, 1, 0, 9]],
  [[7, 0, 1, 8, 2, 3, 4, 5, 9], [5, 4, 3, 2, 1, 0]],

  [[0], [1]],
  [[0], [1, 2]],
  [[0, 2], [1]],
  [[0, 2], [1, 2]],
  [[0, 2], [2, 1]],
  [[0, 1, 2], [3, 4, 5]],
  [[0, 1, 2], [2, 4, 5]],
  [[0, 1, 2, 3, 4, 5], [6, 7, 8, 9, 10, 11]],
  [[0, 1, 2, 3, 4, 5], [6, 1, 7, 3, 4, 8]],
  [[0, 1, 2, 3, 4, 5], [6, 7, 3, 8]],

  [[0, 1, 2], [3, 2, 1]],
  [[0, 1, 2], [2, 1, 3]],
  [[1, 2, 0], [2, 1, 3]],
  [[1, 2, 0], [3, 2, 1]],
  [[0, 1, 2, 3, 4, 5], [6, 1, 3, 2, 4, 7]],
  [[0, 1, 2, 3, 4, 5], [6, 1, 7, 3, 2, 4]],
  [[0, 1, 2, 3, 4, 5], [6, 7, 3, 2, 4]],
  [[0, 2, 3, 4, 5], [6, 1, 7, 3, 2, 4]],

  [[{key: 0, children: [0]}],
   [{key: 0, children: []}]],

  [[0, 1, {key: 2, children: [0]}],
   [{key: 2, children: []}]],

  [[{key: 0, children: []}],
   [1, 2, {key: 0, children: [0]}]],

  [[0, {key: 1, children: [0, 1]}, 2],
   [3, 2, {key: 1, children: [1, 0]}]],

  [[0, {key: 1, children: [0, 1]}, 2],
   [2, {key: 1, children: [1, 0]}, 3]],

  [[{key: 1, children: [0, 1]}, {key: 2, children: [0, 1]}, 0],
   [{key: 2, children: [1, 0]}, {key: 1, children: [1, 0]}, 3]],

  [[{key: 1, children: [0, 1]}, {key: 2, children: []}, 0],
   [3, {key: 2, children: [1, 0]}, {key: 1, children: []}]],

  [[0, {key: 1, children: []}, 2, {key: 3, children: [1, 0]}, 4, 5],
   [6, {key: 1, children: [0, 1]}, {key: 3, children: []}, 2, 4, 7]],

  [[0, {key: 1, children: []}, {key: 2, children: []}, {key: 3, children: []}, {key: 4, children: []}, 5],
   [{key: 6, children: [{key: 1, children: [1]}]}, 7, {key: 3, children: [1]}, {key: 2, children: [1]}, {key: 4, children: [1]}]],

  [[0, 1, {key: 2, children: [0]}, 3, {key: 4, children: [0]}, 5],
   [6, 7, 3, {key: 2, children: []}, {key: 4, children: []}]]
];

describe('update()', function() {
  TESTS.forEach(function(t) {
    var name = JSON.stringify(t[0]) + ' => ' + JSON.stringify(t[1]);
    var testFn = function() { checkSync(t[0], t[1]); };

    if (t.length === 3 && t[2].only === true) {
      it.only(name, testFn);
    } else {
      it(name, testFn);
    }
  });
});
