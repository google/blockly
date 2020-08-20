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

  setup(function() {
    sharedTestSetup.call(this);
  });
  teardown(function() {
    sharedTestTeardown.call(this);
    if (Blockly.registry.typeMap_['test'] &&
        Blockly.registry.typeMap_['test']['test_name']) {
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
  });
  suite('getClassFromOptions', function() {
    setup(function() {
      this.defaultClass = function() {};
      this.defaultClass.prototype.testMethod = function() {
        return 'default';
      };
      this.options = {
        'plugins': {
          'test' : 'test_name'
        }
      };
      Blockly.registry.typeMap_['test'] = {
        'test_name': TestClass,
        'default': this.defaultClass
      };
    });
    test('Simple - Plugin name given', function() {
      var testClass = Blockly.registry.getClassFromOptions('test', this.options);
      chai.assert.instanceOf(new testClass(), TestClass);
    });
    test('Simple - Plugin class given', function() {
      this.options.plugins['test'] = TestClass;
      var testClass = Blockly.registry.getClassFromOptions('test', this.options);
      chai.assert.instanceOf(new testClass(), TestClass);
    });
    test('No Plugin Name Given', function() {
      delete this.options['plugins']['test'];
      var testClass = Blockly.registry.getClassFromOptions('test', this.options);
      chai.assert.instanceOf(new testClass(), this.defaultClass);
    });
    test('Incorrect Plugin Name', function() {
      this.options['plugins']['test'] = 'random';
      var testClass;
      var warnings = captureWarnings(() => {
        testClass = Blockly.registry.getClassFromOptions('test', this.options);
      });
      chai.assert.isNull(testClass);
      chai.assert.equal(warnings.length, 1,
          'Expecting 1 warning about no name "random" found.');
    });
  });
});
