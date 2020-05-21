/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Tests for Blockly.registry
 * @author aschmiedt@google.com (Abby Schmiedt)
 */
'use strict';

suite('Registry', function() {
  var TestClass = function() {};
  TestClass.prototype.testMethod = function() {
    return 'something';
  };

  teardown(function() {
    if (Blockly.registry.typeMap_['test']['test_name']) {
      delete Blockly.registry.typeMap_['test']['test_name'];
    }
  });
  suite('Registration', function() {
    test('Simple', function() {
      Blockly.registry.register('test', 'test_name', TestClass);
    });
    test('Empty String Key', function() {
      chai.assert.throws(function() {
        Blockly.registry.register('test', '', TestClass);
      }, 'Invalid name');
    });
    test('Class as Key', function() {
      chai.assert.throws(function() {
        Blockly.registry.register('test', TestClass, '');
      }, 'Invalid name');
    });
    test('Overwrite a Key', function() {
      Blockly.registry.register('test', 'test_name', TestClass);
      chai.assert.throws(function() {
        Blockly.registry.register('test', 'test_name', TestClass);
      }, 'already registered');
    });
    test('Null Value', function() {
      chai.assert.throws(function() {
        Blockly.registry.register('test', 'field_custom_test', null);
      }, 'Can not register a null value');
    });
    test('No required type', function() {
      chai.assert.throws(function() {
        Blockly.fieldRegistry.register('field_custom_test', TestClass, ['testMethod']);
      }, 'requires the following properties "fromJson"');
    });
  });
});
