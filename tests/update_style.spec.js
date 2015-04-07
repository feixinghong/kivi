'use strict';

var vdom = require('../lib/vdom');

var ATTACHED_CONTEXT = {flags: vdom.Component.ATTACHED};

function injectBefore(parent, node, nextRef) {
  var c = vdom.create(node, ATTACHED_CONTEXT);
  parent.insertBefore(c.ref, nextRef);
  vdom.render(c, ATTACHED_CONTEXT);
  return c;
}

describe('update style', function() {
  it('null => null', function() {
    var f = document.createDocumentFragment();
    var a = vdom.e('div');
    var b = vdom.e('div');
    var c = injectBefore(f, a, null);
    vdom.update(c, b, ATTACHED_CONTEXT);
    expect(f.firstChild.style.cssText).to.be.empty();
  });

  it('null => {}', function() {
    var f = document.createDocumentFragment();
    var a = vdom.e('div');
    var b = vdom.e('div');
    b.style = {};
    var c = injectBefore(f, a, null);
    vdom.update(c, b, ATTACHED_CONTEXT);
    expect(f.firstChild.style.cssText).to.be.empty();
  });

  it('{} => {}', function() {
    var f = document.createDocumentFragment();
    var a = vdom.e('div');
    var b = vdom.e('div');
    a.style = {};
    b.style = {};
    var c = injectBefore(f, a, null);
    vdom.update(c, b, ATTACHED_CONTEXT);
    expect(f.firstChild.style.cssText).to.be.empty();
  });

  it('{} => null', function() {
    var f = document.createDocumentFragment();
    var a = vdom.e('div');
    var b = vdom.e('div');
    a.style = {};
    var c = injectBefore(f, a, null);
    vdom.update(c, b, ATTACHED_CONTEXT);
    expect(f.firstChild.style.cssText).to.be.empty();
  });

  it('null => {top: 10px}', function() {
    var f = document.createDocumentFragment();
    var a = vdom.e('div');
    var b = vdom.e('div');
    b.style = {top: '10px'};
    var c = injectBefore(f, a, null);
    vdom.update(c, b, ATTACHED_CONTEXT);
    expect(f.firstChild.style.top).to.be.equal('10px');
  });

  it('{} => {top: 10px}', function() {
    var f = document.createDocumentFragment();
    var a = vdom.e('div');
    var b = vdom.e('div');
    a.style = {};
    b.style = {top: '10px'};
    var c = injectBefore(f, a, null);
    vdom.update(c, b, ATTACHED_CONTEXT);
    expect(f.firstChild.style.top).to.be.equal('10px');
  });

  it('{} => {top: 10px, left: 10px}', function() {
    var f = document.createDocumentFragment();
    var a = vdom.e('div');
    var b = vdom.e('div');
    a.style = {};
    b.style = {top: '10px', left: '5px'};
    var c = injectBefore(f, a, null);
    vdom.update(c, b, ATTACHED_CONTEXT);
    expect(f.firstChild.style.top).to.be.equal('10px');
    expect(f.firstChild.style.left).to.be.equal('5px');
  });

  it('{top: 10px} => null', function() {
    var f = document.createDocumentFragment();
    var a = vdom.e('div');
    var b = vdom.e('div');
    a.style = {top: '10px'};
    var c = injectBefore(f, a, null);
    vdom.update(c, b, ATTACHED_CONTEXT);
    expect(f.firstChild.style.top).to.be.equal('');
  });

  it('{top: 10px} => {}', function() {
    var f = document.createDocumentFragment();
    var a = vdom.e('div');
    var b = vdom.e('div');
    a.style = {top: '10px'};
    b.style = {};
    var c = injectBefore(f, a, null);
    vdom.update(c, b, ATTACHED_CONTEXT);
    expect(f.firstChild.style.top).to.be.equal('');
  });

  it('{top: 10px, left: 5px} => {}', function() {
    var f = document.createDocumentFragment();
    var a = vdom.e('div');
    var b = vdom.e('div');
    a.style = {top: '10px', left: '5px'};
    b.style = {};
    var c = injectBefore(f, a, null);
    vdom.update(c, b, ATTACHED_CONTEXT);
    expect(f.firstChild.style.top).to.be.equal('');
    expect(f.firstChild.style.left).to.be.equal('');
  });

  it('{top: 10px} => {left: 20px}', function() {
    var f = document.createDocumentFragment();
    var a = vdom.e('div');
    var b = vdom.e('div');
    a.style = {top: '10px'};
    b.style = {left: '20px'};
    var c = injectBefore(f, a, null);
    vdom.update(c, b, ATTACHED_CONTEXT);
    expect(f.firstChild.style.top).to.be.equal('');
    expect(f.firstChild.style.left).to.be.equal('20px');
  });

  it('{top: 10px, left: 20px} => {right: 30px, bottom: 40px}', function() {
    var f = document.createDocumentFragment();
    var a = vdom.e('div');
    var b = vdom.e('div');
    a.style = {top: '10px', left: '20px'};
    b.style = {right: '30px', bottom: '40px'};
    var c = injectBefore(f, a, null);
    vdom.update(c, b, ATTACHED_CONTEXT);
    expect(f.firstChild.style.top).to.be.equal('');
    expect(f.firstChild.style.left).to.be.equal('');
    expect(f.firstChild.style.right).to.be.equal('30px');
    expect(f.firstChild.style.bottom).to.be.equal('40px');
  });

  it('{top: 10px} => {top: 100px}', function() {
    var f = document.createDocumentFragment();
    var a = vdom.e('div');
    var b = vdom.e('div');
    a.style = {top: '10px'};
    b.style = {top: '100px'};
    var c = injectBefore(f, a, null);
    vdom.update(c, b, ATTACHED_CONTEXT);
    expect(f.firstChild.style.top).to.be.equal('100px');
  });

  it('{top: 10px, left: 20px} => {top: 100px, left: 200px}', function() {
    var f = document.createDocumentFragment();
    var a = vdom.e('div');
    var b = vdom.e('div');
    a.style = {top: '10px', left: '20px'};
    b.style = {top: '100px', left: '200px'};
    var c = injectBefore(f, a, null);
    vdom.update(c, b, ATTACHED_CONTEXT);
    expect(f.firstChild.style.top).to.be.equal('100px');
    expect(f.firstChild.style.left).to.be.equal('200px');
  });
});
