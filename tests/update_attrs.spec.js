'use strict';

var vdom = require('../lib/vdom');

var ATTACHED_CONTEXT = {flags: vdom.Component.ATTACHED};

function injectBefore(parent, node, nextRef) {
  var c = vdom.create(node, ATTACHED_CONTEXT);
  parent.insertBefore(c.ref, nextRef);
  vdom.render(c, ATTACHED_CONTEXT);
  return c;
}

describe('update attrs', function() {
  it('null => null', function() {
    var f = document.createDocumentFragment();
    var a = vdom.e('div');
    var b = vdom.e('div');
    var c = injectBefore(f, a, null);
    vdom.update(c, b, ATTACHED_CONTEXT);
    expect(f.firstChild.hasAttributes()).to.be.false();
  });

  it('null => {}', function() {
    var f = document.createDocumentFragment();
    var a = vdom.e('div');
    var b = vdom.e('div');
    b.attrs = {};
    var c = injectBefore(f, a, null);
    vdom.update(c, b, ATTACHED_CONTEXT);
    expect(f.firstChild.hasAttributes()).to.be.false();
  });

  it('{} => null', function() {
    var f = document.createDocumentFragment();
    var a = vdom.e('div');
    var b = vdom.e('div');
    a.attrs = {};
    var c = injectBefore(f, a, null);
    vdom.update(c, b, ATTACHED_CONTEXT);
    expect(f.firstChild.hasAttributes()).to.be.false();
  });

  it('{} => {}', function() {
    var f = document.createDocumentFragment();
    var a = vdom.e('div');
    var b = vdom.e('div');
    a.attrs = {};
    b.attrs = {};
    var c = injectBefore(f, a, null);
    vdom.update(c, b, ATTACHED_CONTEXT);
    expect(f.firstChild.hasAttributes()).to.be.false();
  });

  it('null => {a: 1}', function() {
    var f = document.createDocumentFragment();
    var a = vdom.e('div');
    var b = vdom.e('div');
    b.attrs = {a: '1'};
    var c = injectBefore(f, a, null);
    vdom.update(c, b, ATTACHED_CONTEXT);
    expect(f.firstChild.hasAttributes()).to.be.true();
    expect(f.firstChild.getAttribute('a')).to.be.equal('1');
  });

  it('{} => {a: 1}', function() {
    var f = document.createDocumentFragment();
    var a = vdom.e('div');
    var b = vdom.e('div');
    a.attrs = {};
    b.attrs = {a: '1'};
    var c = injectBefore(f, a, null);
    vdom.update(c, b, ATTACHED_CONTEXT);
    expect(f.firstChild.hasAttributes()).to.be.true();
    expect(f.firstChild.getAttribute('a')).to.be.equal('1');
  });

  it('{} => {a: 1, b: 2}', function() {
    var f = document.createDocumentFragment();
    var a = vdom.e('div');
    var b = vdom.e('div');
    a.attrs = {};
    b.attrs = {a: '1', b: '2'};
    var c = injectBefore(f, a, null);
    vdom.update(c, b, ATTACHED_CONTEXT);
    expect(f.firstChild.hasAttributes()).to.be.true();
    expect(f.firstChild.getAttribute('a')).to.be.equal('1');
    expect(f.firstChild.getAttribute('b')).to.be.equal('2');
  });

  it('{} => {a: 1, b: 2, c: 3}', function() {
    var f = document.createDocumentFragment();
    var a = vdom.e('div');
    var b = vdom.e('div');
    a.attrs = {};
    b.attrs = {a: '1', b: '2', c: '3'};
    var c = injectBefore(f, a, null);
    vdom.update(c, b, ATTACHED_CONTEXT);
    expect(f.firstChild.hasAttributes()).to.be.true();
    expect(f.firstChild.getAttribute('a')).to.be.equal('1');
    expect(f.firstChild.getAttribute('b')).to.be.equal('2');
    expect(f.firstChild.getAttribute('c')).to.be.equal('3');
  });

  it('{a: 1} => null', function() {
    var f = document.createDocumentFragment();
    var a = vdom.e('div');
    var b = vdom.e('div');
    a.attrs = {a: '1'};
    var c = injectBefore(f, a, null);
    vdom.update(c, b, ATTACHED_CONTEXT);
    expect(f.firstChild.hasAttributes()).to.be.false();
  });

  it('{a: 1} => {}', function() {
    var f = document.createDocumentFragment();
    var a = vdom.e('div');
    var b = vdom.e('div');
    a.attrs = {a: '1'};
    b.attrs = {};
    var c = injectBefore(f, a, null);
    vdom.update(c, b, ATTACHED_CONTEXT);
    expect(f.firstChild.hasAttributes()).to.be.false();
  });

  it('{a: 1, b: 2} => {}', function() {
    var f = document.createDocumentFragment();
    var a = vdom.e('div');
    var b = vdom.e('div');
    a.attrs = {a: '1', b: '2'};
    b.attrs = {};
    var c = injectBefore(f, a, null);
    vdom.update(c, b, ATTACHED_CONTEXT);
    expect(f.firstChild.hasAttributes()).to.be.false();
  });

  it('{a: 1} => {b: 2}', function() {
    var f = document.createDocumentFragment();
    var a = vdom.e('div');
    var b = vdom.e('div');
    a.attrs = {a: '1'};
    b.attrs = {b: '2'};
    var c = injectBefore(f, a, null);
    vdom.update(c, b, ATTACHED_CONTEXT);
    expect(f.firstChild.hasAttributes()).to.be.true();
    expect(f.firstChild.hasAttribute('a')).to.be.false();
    expect(f.firstChild.getAttribute('b')).to.be.equal('2');
  });

  it('{a: 1, b: 2} => {c: 3: d: 4}', function() {
    var f = document.createDocumentFragment();
    var a = vdom.e('div');
    var b = vdom.e('div');
    a.attrs = {a: '1', b: '2'};
    b.attrs = {c: '3', d: '4'};
    var c = injectBefore(f, a, null);
    vdom.update(c, b, ATTACHED_CONTEXT);
    expect(f.firstChild.hasAttributes()).to.be.true();
    expect(f.firstChild.hasAttribute('a')).to.be.false();
    expect(f.firstChild.hasAttribute('b')).to.be.false();
    expect(f.firstChild.getAttribute('c')).to.be.equal('3');
    expect(f.firstChild.getAttribute('d')).to.be.equal('4');
  });

  it('{a: 1} => {a: 10}', function() {
    var f = document.createDocumentFragment();
    var a = vdom.e('div');
    var b = vdom.e('div');
    a.attrs = {a: '1'};
    b.attrs = {a: '10'};
    var c = injectBefore(f, a, null);
    vdom.update(c, b, ATTACHED_CONTEXT);
    expect(f.firstChild.hasAttributes()).to.be.true();
    expect(f.firstChild.getAttribute('a')).to.be.equal('10');
  });

  it('{a: 1, b: 2} => {a: 10, b: 20}', function() {
    var f = document.createDocumentFragment();
    var a = vdom.e('div');
    var b = vdom.e('div');
    a.attrs = {a: '1', b: '2'};
    b.attrs = {a: '10', b: '20'};
    var c = injectBefore(f, a, null);
    vdom.update(c, b, ATTACHED_CONTEXT);
    expect(f.firstChild.hasAttributes()).to.be.true();
    expect(f.firstChild.getAttribute('a')).to.be.equal('10');
    expect(f.firstChild.getAttribute('b')).to.be.equal('20');
  });
});
