/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.module('Blockly.test.registry');

const {assertWarnings} = goog.require('Blockly.test.helpers.warnings');
const {sharedTestSetup, sharedTestTeardown} = goog.require('Blockly.test.helpers.setupTeardown');


suite('Registry', function() {
  const TestClass = function() {};
  TestClass.prototype.testMethod = function() {
    return 'something';
  };

  setup(function() {
    sharedTestSetup.call(this);
  });

  teardown(function() {
    sharedTestTeardown.call(this);
    if (Blockly.registry.hasItem('test', 'test_name')) {
      Blockly.registry.unregister('test', 'test_name');
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

  suite('hasItem', function() {
    setup(function() {
      Blockly.registry.register('test', 'test_name', TestClass);
    });

    test('Has', function() {
      chai.assert.isTrue(Blockly.registry.hasItem('test', 'test_name'));
    });

    suite('Does not have', function() {
      test('Type', function() {
        chai.assert.isFalse(Blockly.registry.hasItem('bad_type', 'test_name'));
      });

      test('Name', function() {
        chai.assert.isFalse(Blockly.registry.hasItem('test', 'bad_name'));
      });
    });

    suite('Case', function() {
      test('Caseless type', function() {
        chai.assert.isTrue(Blockly.registry.hasItem('TEST', 'test_name'));
      });

      test('Caseless name', function() {
        chai.assert.isTrue(Blockly.registry.hasItem('test', 'TEST_NAME'));
      });
    });
  });

  suite('getClass', function() {
    setup(function() {
      Blockly.registry.register('test', 'test_name', TestClass);
    });

    test('Has', function() {
      chai.assert.isNotNull(Blockly.registry.getClass('test', 'test_name'));
    });

    suite('Does not have', function() {
      test('Type', function() {
        assertWarnings(() => {
          chai.assert.isNull(Blockly.registry.getClass('bad_type', 'test_name'));
        }, /Unable to find/);
      });

      test('Name', function() {
        assertWarnings(() => {
          chai.assert.isNull(Blockly.registry.getClass('test', 'bad_name'));
        }, /Unable to find/);
      });

      test('Throw if missing', function() {
        chai.assert.throws(function() {
          Blockly.registry.getClass('test', 'bad_name', true);
        });
      });
    });

    suite('Case', function() {
      test('Caseless type', function() {
        chai.assert.isNotNull(Blockly.registry.getClass('TEST', 'test_name'));
      });

      test('Caseless name', function() {
        chai.assert.isNotNull(Blockly.registry.getClass('test', 'TEST_NAME'));
      });
    });
  });

  suite('getObject', function() {
    setup(function() {
      Blockly.registry.register('test', 'test_name', {});
    });

    test('Has', function() {
      chai.assert.isNotNull(Blockly.registry.getObject('test', 'test_name'));
    });

    suite('Does not have', function() {
      test('Type', function() {
        assertWarnings(() => {
          chai.assert.isNull(Blockly.registry.getObject('bad_type', 'test_name'));
        }, /Unable to find/);
      });

      test('Name', function() {
        assertWarnings(() => {
          chai.assert.isNull(Blockly.registry.getObject('test', 'bad_name'));
        }, /Unable to find/);
      });

      test('Throw if missing', function() {
        chai.assert.throws(function() {
          Blockly.registry.getObject('test', 'bad_name', true);
        });
      });
    });

    suite('Case', function() {
      test('Caseless type', function() {
        chai.assert.isNotNull(Blockly.registry.getObject('TEST', 'test_name'));
      });

      test('Caseless name', function() {
        chai.assert.isNotNull(Blockly.registry.getObject('test', 'TEST_NAME'));
      });
    });
  });

  suite('getAllItems', function() {
    setup(function() {
      Blockly.registry.register('test', 'test_name', {});
      Blockly.registry.register('test', 'casedNAME', {});
    });

    teardown(function() {
      Blockly.registry.unregister('test', 'casedname');
    });

    test('Has', function() {
      chai.assert.isNotNull(Blockly.registry.getAllItems('test'));
    });

    test('Does not have', function() {
      assertWarnings(() => {
        chai.assert.isNull(Blockly.registry.getAllItems('bad_type'));
      }, /Unable to find/);
    });

    test('Throw if missing', function() {
      chai.assert.throws(function() {
        Blockly.registry.getAllItems('bad_type', false, true);
      });
    });

    test('Ignore type case', function() {
      chai.assert.isNotNull(Blockly.registry.getAllItems('TEST'));
    });

    test('Respect name case', function() {
      chai.assert.deepEqual(
          Blockly.registry.getAllItems('test', true),
          {
            'test_name': {},
            'casedNAME': {},
          });
    });

    test('Respect overwriting name case', function() {
      Blockly.registry.register('test', 'CASEDname', {}, true);
      chai.assert.deepEqual(
          Blockly.registry.getAllItems('test', true),
          {
            'test_name': {},
            'CASEDname': {},
          });
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
          'test': 'test_name',
        },
      };
      Blockly.registry.register('test', 'test_name', TestClass);
      Blockly.registry.register('test', 'default', this.defaultClass);
    });

    teardown(function() {
      Blockly.registry.unregister('test', 'default');
    });

    test('Simple - Plugin name given', function() {
      const testClass = Blockly.registry.getClassFromOptions('test', this.options);
      chai.assert.instanceOf(new testClass(), TestClass);
    });

    test('Simple - Plugin class given', function() {
      this.options.plugins['test'] = TestClass;
      const testClass = Blockly.registry.getClassFromOptions('test', this.options);
      chai.assert.instanceOf(new testClass(), TestClass);
    });

    test('No Plugin Name Given', function() {
      delete this.options['plugins']['test'];
      const testClass = Blockly.registry.getClassFromOptions('test', this.options);
      chai.assert.instanceOf(new testClass(), this.defaultClass);
    });

    test('Incorrect Plugin Name', function() {
      this.options['plugins']['test'] = 'random';
      let testClass;
      assertWarnings(() => {
        testClass = Blockly.registry.getClassFromOptions('test', this.options);
      }, /Unable to find/);
      chai.assert.isNull(testClass);
    });
  });
});
