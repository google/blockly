/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('Keyboard Shortcut Registry Test', function() {
  setup(function() {
    sharedTestSetup.call(this);
    this.registry = new Blockly.ShortcutRegistry();
  });
  teardown(function() {
    sharedTestTeardown.call(this);
  });

  suite('Registering', function() {
    test('Registering a shortcut', function() {
      var testShortcut = {'name': 'test_shortcut'};
      this.registry.register(testShortcut, true);
      var shortcut = this.registry.registry_['test_shortcut'];
      chai.assert.equal(shortcut.name, 'test_shortcut');
    });
    test('Registers shortcut with same name', function() {
      var registry = this.registry;
      var testShortcut = {'name': 'test_shortcut'};

      registry.registry_['test_shortcut'] = [testShortcut];

      var shouldThrow = function() {
        registry.register(testShortcut);
      };
      chai.assert.throws(
          shouldThrow, Error,
          'Shortcut with name "test_shortcut" already exists.');
    });
    test(
        'Registers shortcut with same name opt_allowOverrides=true',
        function() {
          var registry = this.registry;
          var testShortcut = {'name': 'test_shortcut'};
          var otherShortcut = {
            'name': 'test_shortcut',
            'callback': function() {}
          };

          registry.registry_['test_shortcut'] = [testShortcut];

          var shouldNotThrow = function() {
            registry.register(otherShortcut, true);
          };
          chai.assert.doesNotThrow(shouldNotThrow);
          chai.assert.exists(registry.registry_['test_shortcut'].callback);
        });
  });

  suite('Unregistering', function() {
    test('Unregistering a shortcut', function() {
      var testShortcut = {'name': 'test_shortcut'};
      this.registry.registry_['test'] = [testShortcut];
      chai.assert.isOk(this.registry.registry_['test']);
      this.registry.unregister('test', 'test_shortcut');
      chai.assert.isUndefined(this.registry.registry_['test']);
    });
    test('Unregistering a nonexistent shortcut', function() {
      var consoleStub = sinon.stub(console, 'warn');
      chai.assert.isUndefined(this.registry.registry_['test']);

      var registry = this.registry;
      chai.assert.isFalse(registry.unregister('test', 'test_shortcut'));
      sinon.assert.calledOnceWithExactly(consoleStub, 'Keyboard shortcut with name "test" not found.');
    });
    test('Unregistering a shortcut with key mappings', function() {
      var testShortcut = {'name': 'test_shortcut'};
      this.registry.keyMap_['keyCode'] = ['test_shortcut'];
      this.registry.registry_['test_shortcut'] = testShortcut;

      this.registry.unregister('test_shortcut');

      var shortcut = this.registry.registry_['test'];
      var keyMappings = this.registry.keyMap_['keyCode'];
      chai.assert.isUndefined(shortcut);
      chai.assert.isUndefined(keyMappings);
    });
    test('Unregistering a shortcut with colliding key mappings', function() {
      var testShortcut = {'name': 'test_shortcut'};
      this.registry.keyMap_['keyCode'] = ['test_shortcut', 'other_shortcutt'];
      this.registry.registry_['test_shortcut'] = testShortcut;

      this.registry.unregister('test_shortcut');

      var shortcut = this.registry.registry_['test'];
      var keyMappings = this.registry.keyMap_['keyCode'];
      chai.assert.lengthOf(keyMappings, 1);
      chai.assert.isUndefined(shortcut);
    });
  });

  suite('addKeyMapping', function() {
    test('Adds a key mapping', function() {
      this.registry.registry_['test_shortcut'] = {'name': 'test_shortcut'};

      this.registry.addKeyMapping('keyCode', 'test_shortcut');

      var shortcutNames = this.registry.keyMap_['keyCode'];
      chai.assert.lengthOf(shortcutNames, 1);
      chai.assert.equal(shortcutNames[0], 'test_shortcut');
    });
    test('Adds a colliding key mapping - opt_allowCollision=true', function() {
      this.registry.registry_['test_shortcut'] = {'name': 'test_shortcut'};
      this.registry.keyMap_['keyCode'] = ['test_shortcut_2'];

      this.registry.addKeyMapping('keyCode', 'test_shortcut', true);

      var shortcutNames = this.registry.keyMap_['keyCode'];
      chai.assert.lengthOf(shortcutNames, 2);
      chai.assert.equal(shortcutNames[0], 'test_shortcut');
      chai.assert.equal(shortcutNames[1], 'test_shortcut_2');
    });
    test('Adds a colliding key mapping - opt_allowCollision=false', function() {
      this.registry.registry_['test_shortcut'] = {'name': 'test_shortcut'};
      this.registry.keyMap_['keyCode'] = ['test_shortcut_2'];

      var registry = this.registry;
      var shouldThrow = function() {
        registry.addKeyMapping('keyCode', 'test_shortcut');
      };
      chai.assert.throws(
          shouldThrow, Error,
          'Shortcut with name "test_shortcut" collides with shortcuts test_shortcut_2');
    });
  });

  suite('removeKeyMapping', function() {
    test('Removes a key mapping', function() {
      this.registry.registry_['test_shortcut'] = {'name': 'test_shortcut'};
      this.registry.keyMap_['keyCode'] = ['test_shortcut', 'test_shortcut_2'];

      var isRemoved =
          this.registry.removeKeyMapping('keyCode', 'test_shortcut');

      var shortcutNames = this.registry.keyMap_['keyCode'];
      chai.assert.lengthOf(shortcutNames, 1);
      chai.assert.equal(shortcutNames[0], 'test_shortcut_2');
      chai.assert.isTrue(isRemoved);
    });
    test('Removes last key mapping for a key', function() {
      this.registry.registry_['test_shortcut'] = {'name': 'test_shortcut'};
      this.registry.keyMap_['keyCode'] = ['test_shortcut'];

      this.registry.removeKeyMapping('keyCode', 'test_shortcut');

      var shortcutNames = this.registry.keyMap_['keyCode'];
      chai.assert.isUndefined(shortcutNames);
    });
    test('Removes a key map that does not exist opt_quiet=false', function() {
      var consoleStub = sinon.stub(console, 'warn');
      this.registry.keyMap_['keyCode'] = ['test_shortcut_2'];

      var isRemoved =
          this.registry.removeKeyMapping('keyCode', 'test_shortcut');

      chai.assert.isFalse(isRemoved);
      sinon.assert.calledOnceWithExactly(
          consoleStub,
          'No keyboard shortcut with name "test_shortcut" registered with key code "keyCode"');
    });
    test(
        'Removes a key map that does not exist from empty key mapping opt_quiet=false',
        function() {
          var consoleStub = sinon.stub(console, 'warn');

          var isRemoved =
              this.registry.removeKeyMapping('keyCode', 'test_shortcut');

          chai.assert.isFalse(isRemoved);
          sinon.assert.calledOnceWithExactly(
              consoleStub,
              'No keyboard shortcut with name "test_shortcut" registered with key code "keyCode"');
        });
  });

  suite('Setters/Getters', function() {
    test('Sets the key map', function() {
      this.registry.setKeyMap({'keyCode': ['test_shortcut']});
      chai.assert.lengthOf(Object.keys(this.registry.keyMap_), 1);
      chai.assert.equal(this.registry.keyMap_['keyCode'][0], 'test_shortcut');
    });
    test('Gets a copy of the key map', function() {
      this.registry.keyMap_['keyCode'] = ['a'];
      var keyMapCopy = this.registry.getKeyMap();
      keyMapCopy['keyCode'] = ['b'];
      chai.assert.equal(this.registry.keyMap_['keyCode'][0], 'a');
    });
    test('Gets a copy of the registry', function() {
      this.registry.registry_['shortcutName'] = {'name': 'shortcutName'};
      var registrycopy = this.registry.getRegistry();
      registrycopy['shortcutName']['name'] = 'shortcutName1';
      chai.assert.equal(
          this.registry.registry_['shortcutName']['name'], 'shortcutName');
    });
    test('Gets keyboard shortcuts from a key code', function() {
      this.registry.keyMap_['keyCode'] = ['shortcutName'];
      var shortcutNames = this.registry.getShortcutNamesByKeyCode('keyCode');
      chai.assert.equal(shortcutNames[0], 'shortcutName');
    });
    test('Gets keycodes by shortcut name', function() {
      this.registry.keyMap_['keyCode'] = ['shortcutName'];
      this.registry.keyMap_['keyCode1'] = ['shortcutName'];
      var shortcutNames =
          this.registry.getKeyCodesByShortcutName('shortcutName');
      chai.assert.lengthOf(shortcutNames, 2);
      chai.assert.equal(shortcutNames[0], 'keyCode');
      chai.assert.equal(shortcutNames[1], 'keyCode1');
    });
  });

  suite('onKeyDown', function() {
    function addShortcut(registry, shortcut, keyCode, returns) {
      registry.register(shortcut, true);
      registry.addKeyMapping(keyCode, shortcut.name, true);
      return sinon.stub(shortcut, 'callback').returns(returns);
    }

    setup(function() {
      this.testShortcut = {
        'name': 'test_shortcut',
        'callback': function() {
          return true;
        },
        'precondition': function() {
          return true;
        }
      };
      this.callBackStub =
          addShortcut(this.registry, this.testShortcut, 'keyCode', true);
    });
    test('Execute a shortcut from event', function() {
      var event = createKeyDownEvent('keyCode', '');
      chai.assert.isTrue(this.registry.onKeyDown(this.workspace, event));
      sinon.assert.calledOnce(this.callBackStub);
    });
    test('No shortcut executed from event', function() {
      var event = createKeyDownEvent('nonExistentKeyCode', '');
      chai.assert.isFalse(this.registry.onKeyDown(this.workspace, event));
    });
    test('No precondition available - execute callback', function() {
      delete this.testShortcut['precondition'];
      var event = createKeyDownEvent('keyCode', '');
      chai.assert.isTrue(this.registry.onKeyDown(this.workspace, event));
      sinon.assert.calledOnce(this.callBackStub);
    });
    test('Execute all shortcuts in list', function() {
      var event = createKeyDownEvent('keyCode', '');
      var testShortcut2 = {
        'name': 'test_shortcut_2',
        'callback': function() {
          return false;
        },
        'precondition': function() {
          return false;
        }
      };
      var testShortcut2Stub =
          addShortcut(this.registry, testShortcut2, 'keyCode', false);
      chai.assert.isTrue(this.registry.onKeyDown(this.workspace, event));
      sinon.assert.calledOnce(testShortcut2Stub);
      sinon.assert.calledOnce(this.callBackStub);
    });
    test('Stop executing shortcut when event is handled', function() {
      var event = createKeyDownEvent('keyCode', '');
      var testShortcut2 = {
        'name': 'test_shortcut_2',
        'callback': function() {
          return false;
        },
        'precondition': function() {
          return false;
        }
      };
      var testShortcut2Stub =
          addShortcut(this.registry, testShortcut2, 'keyCode', true);
      chai.assert.isTrue(this.registry.onKeyDown(this.workspace, event));
      sinon.assert.calledOnce(testShortcut2Stub);
      sinon.assert.notCalled(this.callBackStub);
    });
  });

  suite('createSerializedKey', function() {
    test('Serialize key', function() {
      var serializedKey =
          this.registry.createSerializedKey(Blockly.utils.KeyCodes.A);
      chai.assert.equal(serializedKey, '65');
    });

    test('Serialize key code and modifier', function() {
      var serializedKey = this.registry.createSerializedKey(
          Blockly.utils.KeyCodes.A, [Blockly.utils.KeyCodes.CTRL]);
      chai.assert.equal(serializedKey, 'Control+65');
    });
    test('Serialize only a modifier', function() {
      var serializedKey = this.registry.createSerializedKey(
          null, [Blockly.utils.KeyCodes.CTRL]);
      chai.assert.equal(serializedKey, 'Control');
    });
    test('Serialize multiple modifiers', function() {
      var serializedKey = this.registry.createSerializedKey(
          null, [Blockly.utils.KeyCodes.CTRL, Blockly.utils.KeyCodes.SHIFT]);
      chai.assert.equal(serializedKey, 'Shift+Control');
    });
    test('Order of modifiers should result in same serialized key', function() {
      var serializedKey = this.registry.createSerializedKey(
          null, [Blockly.utils.KeyCodes.CTRL, Blockly.utils.KeyCodes.SHIFT]);
      chai.assert.equal(serializedKey, 'Shift+Control');
      var serializedKeyNewOrder = this.registry.createSerializedKey(
          null, [Blockly.utils.KeyCodes.SHIFT, Blockly.utils.KeyCodes.CTRL]);
      chai.assert.equal(serializedKeyNewOrder, 'Shift+Control');
    });
  });

  suite('serializeKeyEvent', function() {
    test('Serialize key', function() {
      var mockEvent = createKeyDownEvent(Blockly.utils.KeyCodes.A, '');
      var serializedKey = this.registry.serializeKeyEvent_(mockEvent);
      chai.assert.equal(serializedKey, '65');
    });
    test('Serialize key code and modifier', function() {
      var mockEvent = createKeyDownEvent(
          Blockly.utils.KeyCodes.A, '', [Blockly.utils.KeyCodes.CTRL]);
      var serializedKey = this.registry.serializeKeyEvent_(mockEvent);
      chai.assert.equal(serializedKey, 'Control+65');
    });
    test('Serialize only a modifier', function() {
      var mockEvent =
          createKeyDownEvent(null, '', [Blockly.utils.KeyCodes.CTRL]);
      var serializedKey = this.registry.serializeKeyEvent_(mockEvent);
      chai.assert.equal(serializedKey, 'Control');
    });
    test('Serialize multiple modifiers', function() {
      var mockEvent = createKeyDownEvent(
          null, '',
          [Blockly.utils.KeyCodes.CTRL, Blockly.utils.KeyCodes.SHIFT]);
      var serializedKey = this.registry.serializeKeyEvent_(mockEvent);
      chai.assert.equal(serializedKey, 'Shift+Control');
    });
    test('Throw error when incorrect modifier', function() {
      var registry = this.registry;
      var shouldThrow = function() {
        registry.createSerializedKey(Blockly.utils.KeyCodes.K, ['s']);
      };
      chai.assert.throws(shouldThrow, Error, 's is not a valid modifier key.');
    });
  });

  teardown(function() {});
});
