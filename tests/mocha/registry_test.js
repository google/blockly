/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {assertWarnings} from './test_helpers/warnings.js';
import {
  sharedTestSetup,
  sharedTestTeardown,
} from './test_helpers/setup_teardown.js';

suite('Registry', function () {
  const TestClass = function () {};
  TestClass.prototype.testMethod = function () {
    return 'something';
  };

  setup(function () {
    sharedTestSetup.call(this);
  });

  teardown(function () {
    sharedTestTeardown.call(this);
    if (Blockly.registry.hasItem('test', 'test_name')) {
      Blockly.registry.unregister('test', 'test_name');
    }
  });

  suite('Registration', function () {
    test('Simple', function () {
      Blockly.registry.register('test', 'test_name', TestClass);
    });

    test('Empty String Key', function () {
      chai.assert.throws(function () {
        Blockly.registry.register('test', ' ', TestClass);
      }, 'Empty name');
    });

    test('Class as Key', function () {
      chai.assert.throws(function () {
        Blockly.registry.register('test', TestClass, TestClass);
      }, 'Invalid name');
    });

    test('Overwrite a Key', function () {
      Blockly.registry.register('test', 'test_name', TestClass);
      // Duplicate registration of the same object is ok.
      Blockly.registry.register('test', 'test_name', TestClass);
      // Registering some other value is not ok.
      chai.assert.throws(function () {
        Blockly.registry.register('test', 'test_name', {});
      }, 'already registered');
      // Changing the case or padding doesn't help.
      chai.assert.throws(function () {
        Blockly.registry.register('test', ' test_NAME ', {});
      }, 'Inconsistent case');
      // But it's ok if explicitly allowed with 'true'.
      Blockly.registry.register('test', 'test_name', {}, true);
      // But not ok if it's a different case.
      chai.assert.throws(function () {
        Blockly.registry.register('test', 'Test_Name', {}, true);
      }, 'Inconsistent case');
    });

    test('Null Value', function () {
      chai.assert.throws(function () {
        Blockly.registry.register('test', 'field_custom_test', null);
      }, 'Can not register a null value');
    });
  });

  suite('hasItem', function () {
    setup(function () {
      Blockly.registry.register('test', 'test_name', TestClass);
    });

    test('Has', function () {
      chai.assert.isTrue(Blockly.registry.hasItem('test', 'test_name'));
    });

    suite('Does not have', function () {
      test('Type', function () {
        chai.assert.isFalse(Blockly.registry.hasItem('bad_type', 'test_name'));
      });

      test('Name', function () {
        chai.assert.isFalse(Blockly.registry.hasItem('test', 'bad_name'));
      });
    });

    suite('Name normalization', function () {
      test('Padded', function () {
        chai.assert.isTrue(
          Blockly.registry.hasItem('  test  ', '  test_name  '),
        );
      });

      test('Case type', function () {
        chai.assert.isTrue(Blockly.registry.hasItem('TEST', 'test_name'));
      });

      test('Case name', function () {
        chai.assert.throws(function () {
          Blockly.registry.hasItem('test', 'TEST_NAME');
        }, 'Inconsistent case');
      });
    });
  });

  suite('getClass', function () {
    setup(function () {
      Blockly.registry.register('test', 'test_name', TestClass);
    });

    test('Has', function () {
      chai.assert.isNotNull(Blockly.registry.getClass('test', 'test_name'));
    });

    suite('Does not have', function () {
      test('Type', function () {
        assertWarnings(() => {
          chai.assert.isNull(
            Blockly.registry.getClass('bad_type', 'test_name'),
          );
        }, /Unable to find/);
      });

      test('Name', function () {
        assertWarnings(() => {
          chai.assert.isNull(Blockly.registry.getClass('test', 'bad_name'));
        }, /Unable to find/);
      });

      test('Throw if missing', function () {
        chai.assert.throws(function () {
          Blockly.registry.getClass('test', 'bad_name', true);
        });
      });
    });

    suite('Name normalization', function () {
      test('Padded', function () {
        chai.assert.isNotNull(
          Blockly.registry.getClass('  test  ', '  test_name'),
        );
      });

      test('Case type', function () {
        chai.assert.isNotNull(Blockly.registry.getClass('TEST', 'test_name'));
      });

      test('Case name', function () {
        chai.assert.throws(function () {
          Blockly.registry.getClass('test', 'TEST_NAME');
        }, 'Inconsistent case');
      });
    });
  });

  suite('getObject', function () {
    setup(function () {
      Blockly.registry.register('test', 'test_name', {});
    });

    test('Has', function () {
      chai.assert.isNotNull(Blockly.registry.getObject('test', 'test_name'));
    });

    suite('Does not have', function () {
      test('Type', function () {
        assertWarnings(() => {
          chai.assert.isNull(
            Blockly.registry.getObject('bad_type', 'test_name'),
          );
        }, /Unable to find/);
      });

      test('Name', function () {
        assertWarnings(() => {
          chai.assert.isNull(Blockly.registry.getObject('test', 'bad_name'));
        }, /Unable to find/);
      });

      test('Throw if missing', function () {
        chai.assert.throws(function () {
          Blockly.registry.getObject('test', 'bad_name', true);
        });
      });
    });

    suite('Name normalization', function () {
      test('Padded', function () {
        chai.assert.isNotNull(
          Blockly.registry.getObject('  test  ', '  test_name  '),
        );
      });

      test('Case type', function () {
        chai.assert.isTrue(Blockly.registry.hasItem('TEST', 'test_name'));
      });

      test('Case name', function () {
        chai.assert.throws(function () {
          Blockly.registry.getObject('test', 'TEST_NAME');
        }, 'Inconsistent case');
      });
    });
  });

  suite('getAllItems', function () {
    setup(function () {
      Blockly.registry.register('test', 'test_name', {});
      Blockly.registry.register('test', 'casedNAME', {});
    });

    teardown(function () {
      Blockly.registry.unregister('test', 'test_name');
      Blockly.registry.unregister('test', 'casedNAME');
    });

    test('Has', function () {
      chai.assert.deepEqual(Blockly.registry.getAllItems('test'), {
        'test_name': {},
        'casedNAME': {},
      });
    });

    test('Does not have', function () {
      assertWarnings(() => {
        chai.assert.isNull(Blockly.registry.getAllItems('bad_type'));
      }, /Unable to find/);
    });

    test('Throw if missing', function () {
      chai.assert.throws(function () {
        Blockly.registry.getAllItems('bad_type', undefined, true);
      });
    });

    test('Ignore type case', function () {
      chai.assert.isNotNull(Blockly.registry.getAllItems('TEST'));
    });
  });

  suite('getClassFromOptions', function () {
    setup(function () {
      this.defaultClass = function () {};
      this.defaultClass.prototype.testMethod = function () {
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

    teardown(function () {
      Blockly.registry.unregister('test', 'default');
    });

    test('Simple - Plugin name given', function () {
      const testClass = Blockly.registry.getClassFromOptions(
        'test',
        this.options,
      );
      chai.assert.instanceOf(new testClass(), TestClass);
    });

    test('Simple - Plugin class given', function () {
      this.options.plugins['test'] = TestClass;
      const testClass = Blockly.registry.getClassFromOptions(
        'test',
        this.options,
      );
      chai.assert.instanceOf(new testClass(), TestClass);
    });

    test('No Plugin Name Given', function () {
      delete this.options['plugins']['test'];
      const testClass = Blockly.registry.getClassFromOptions(
        'test',
        this.options,
      );
      chai.assert.instanceOf(new testClass(), this.defaultClass);
    });

    test('Incorrect Plugin Name', function () {
      this.options['plugins']['test'] = 'random';
      let testClass;
      assertWarnings(() => {
        testClass = Blockly.registry.getClassFromOptions('test', this.options);
      }, /Unable to find/);
      chai.assert.isNull(testClass);
    });
  });
});
