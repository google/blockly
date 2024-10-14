/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  sharedTestSetup,
  sharedTestTeardown,
} from './test_helpers/setup_teardown.js';

suite('Names', function () {
  setup(function () {
    sharedTestSetup.call(this);
  });
  teardown(function () {
    sharedTestTeardown.call(this);
  });

  test('Safe name', function () {
    const varDB = new Blockly.Names('window,door');
    chai.assert.equal(varDB.safeName(''), 'unnamed', 'SafeName empty.');
    chai.assert.equal(varDB.safeName('foobar'), 'foobar', 'SafeName ok.');
    chai.assert.equal(
      varDB.safeName('9lives'),
      'my_9lives',
      'SafeName number start.',
    );
    chai.assert.equal(
      varDB.safeName('lives9'),
      'lives9',
      'SafeName number end.',
    );
    chai.assert.equal(
      varDB.safeName('!@#$'),
      '____',
      'SafeName special chars.',
    );
    chai.assert.equal(varDB.safeName('door'), 'door', 'SafeName reserved.');
  });

  test('Get name', function () {
    const varDB = new Blockly.Names('window,door');
    chai.assert.equal(
      varDB.getName('Foo.bar', 'var'),
      'Foo_bar',
      'Name add #1.',
    );
    chai.assert.equal(
      varDB.getName('Foo.bar', 'var'),
      'Foo_bar',
      'Name get #1.',
    );
    chai.assert.equal(
      varDB.getName('Foo bar', 'var'),
      'Foo_bar2',
      'Name add #2.',
    );
    chai.assert.equal(
      varDB.getName('foo BAR', 'var'),
      'Foo_bar2',
      'Name get #2.',
    );
    chai.assert.equal(varDB.getName('door', 'var'), 'door2', 'Name add #3.');
    chai.assert.equal(
      varDB.getName('Foo.bar', 'proc'),
      'Foo_bar3',
      'Name add #4.',
    );
    chai.assert.equal(
      varDB.getName('Foo.bar', 'var'),
      'Foo_bar',
      'Name get #1b.',
    );
    chai.assert.equal(
      varDB.getName('Foo.bar', 'proc'),
      'Foo_bar3',
      'Name get #4.',
    );

    chai.assert.equal(
      String(varDB.getUserNames('var')),
      'foo.bar,foo bar,door',
      'Get var names.',
    );
    chai.assert.equal(
      String(varDB.getUserNames('proc')),
      'foo.bar',
      'Get proc names.',
    );
  });

  test('Get distinct name', function () {
    const varDB = new Blockly.Names('window,door');
    chai.assert.equal(
      varDB.getDistinctName('Foo.bar', 'var'),
      'Foo_bar',
      'Name distinct #1.',
    );
    chai.assert.equal(
      varDB.getDistinctName('Foo.bar', 'var'),
      'Foo_bar2',
      'Name distinct #2.',
    );
    chai.assert.equal(
      varDB.getDistinctName('Foo.bar', 'proc'),
      'Foo_bar3',
      'Name distinct #3.',
    );
    varDB.reset();
    chai.assert.equal(
      varDB.getDistinctName('Foo.bar', 'var'),
      'Foo_bar',
      'Name distinct #4.',
    );
  });

  test('name equals', function () {
    chai.assert.isTrue(
      Blockly.Names.equals('Foo.bar', 'Foo.bar'),
      'Name equals #1.',
    );
    chai.assert.isFalse(
      Blockly.Names.equals('Foo.bar', 'Foo_bar'),
      'Name equals #2.',
    );
    chai.assert.isTrue(
      Blockly.Names.equals('Foo.bar', 'FOO.BAR'),
      'Name equals #3.',
    );
  });
});
