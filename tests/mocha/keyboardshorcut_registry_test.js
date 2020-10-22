/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('Keyboard Shortcut Registry Test', function() {
  setup(function() {
    sharedTestSetup.call(this);
    this.registry = new Blockly.KeyboardShortcutRegistry();
  });
  teardown(function() {
    sharedTestTeardown.call(this);
  });

  suite('Registering', function() {
    test('Registering a shortcut', function() {
      var testShortcut = {
        'name': 'test_action'
      };
      this.registry.register(testShortcut, true);
      var shortcut = this.registry.registry_['test_action'];
      chai.assert.equal(shortcut.name, 'test_action');
    });
    test('Registers colliding shortcut - opt_allowOverrides = true', function() {
      var testShortcut = {
        'name': 'test_shortcut'
      };
      var otherTestShortcut = {
        'name': 'test_shortcut_2'
      };
      this.registry.registry_['test'] = [otherTestShortcut];
      this.registry.register(testShortcut, true);
      var shortcuts = this.registry.registry_['test'];
      chai.assert.equal(shortcuts.length, 2);
      chai.assert.equal(shortcuts[0].name, 'test_shortcut');
      chai.assert.equal(shortcuts[1].name, 'test_shortcut_2');
    });
  });

  suite('Unregistering', function() {
    test('Unregistering a shortcut', function() {
      var testShortcut = {
        'name': 'test_action'
      };
      this.registry.registry_['test'] = [testShortcut];
      chai.assert.isNotFalse(this.registry.registry_['test']);
      this.registry.unregister('test', 'test_action');
      chai.assert.isUndefined(this.registry.registry_['test']);
    });
    test('Unregistering a nonexistent shortcut', function() {
      chai.assert.isUndefined(this.registry.registry_['test']);

      var registry = this.registry;
      var shouldThrow = function() {
        registry.unregister('test', 'test_action');
      };

      chai.assert.throws(shouldThrow, Error, 'Keyboard shortcut with name "test_action" not found.');
    });
    test('Unregistering a colliding shortcut', function() {
      var testShortcut = {
        'name': 'test_shortcut'
      };
      var otherTestShortcut = {
        'name': 'test_shortcut_2'
      };
      this.registry.registry_['test'] = [testShortcut, otherTestShortcut];
      this.registry.unregister('test', 'test_shortcut');
      var shortcuts = this.registry.registry_['test'];
      chai.assert.equal(shortcuts.length, 1);
      chai.assert.equal(shortcuts[0].name, 'test_shortcut_2');
    });
  });

  suite('createSerializedKey', function() {
    test('Serialize key', function() {
      var serializedKey = this.registry.createSerializedKey(Blockly.utils.KeyCodes.A);
      chai.assert.equal(serializedKey, '65');
    });

    test('Serialize key code and modifier', function() {
      var serializedKey = this.registry.createSerializedKey(
          Blockly.utils.KeyCodes.A, [Blockly.KeyboardShortcutRegistry.modifierKeys.CONTROL]);
      chai.assert.equal(serializedKey, 'Control+65');
    });
    test('Serialize only a modifier', function() {
      var serializedKey = this.registry.createSerializedKey(
          null, [Blockly.KeyboardShortcutRegistry.modifierKeys.CONTROL]);
      chai.assert.equal(serializedKey, 'Control');
    });
    test('Serialize multiple modifiers', function() {
      var serializedKey = this.registry.createSerializedKey(
          null, [Blockly.KeyboardShortcutRegistry.modifierKeys.CONTROL,
            Blockly.KeyboardShortcutRegistry.modifierKeys.SHIFT]);
      chai.assert.equal(serializedKey, 'Shift+Control');
    });
    test('Order of modifiers should result in same serialized key', function() {
      var serializedKey = this.registry.createSerializedKey(
          null, [Blockly.KeyboardShortcutRegistry.modifierKeys.CONTROL,
            Blockly.KeyboardShortcutRegistry.modifierKeys.SHIFT]);
      chai.assert.equal(serializedKey, 'Shift+Control');
      var serializedKeyNewOrder = this.registry.createSerializedKey(
          null, [Blockly.KeyboardShortcutRegistry.modifierKeys.SHIFT,
            Blockly.KeyboardShortcutRegistry.modifierKeys.CONTROL]);
      chai.assert.equal(serializedKeyNewOrder, 'Shift+Control');
    });
  });

  suite('serializeKeyEvent', function() {
    test('Serialize key', function() {
      var mockEvent = createKeyDownEvent(Blockly.utils.KeyCodes.A, '');
      var serializedKey = this.registry.serializeKeyEvent(mockEvent);
      chai.assert.equal(serializedKey, '65');
    });
    test('Serialize key code and modifier', function() {
      var mockEvent = createKeyDownEvent(Blockly.utils.KeyCodes.A, '', [Blockly.utils.KeyCodes.CTRL]);
      var serializedKey = this.registry.serializeKeyEvent(mockEvent);
      chai.assert.equal(serializedKey, 'Control+65');
    });
    test('Serialize only a modifier', function() {
      var mockEvent = createKeyDownEvent(null, '', [Blockly.utils.KeyCodes.CTRL]);
      var serializedKey = this.registry.serializeKeyEvent(mockEvent);
      chai.assert.equal(serializedKey, 'Control');
    });
    test('Serialize multiple modifiers', function() {
      var mockEvent = createKeyDownEvent(null, '', [Blockly.utils.KeyCodes.CTRL, Blockly.utils.KeyCodes.SHIFT]);
      var serializedKey = this.registry.serializeKeyEvent(mockEvent);
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

  // test('Test giving an old action a new key', function() {
  //   Blockly.user.keyMap.setActionForKey(Blockly.utils.KeyCodes.F,
  //       Blockly.navigation.ACTION_PREVIOUS);
  //   chai.assert.isUndefined(Blockly.user.keyMap.map_[Blockly.utils.KeyCodes.W]);
  //   chai.assert.equal(Blockly.user.keyMap.map_[Blockly.utils.KeyCodes.F],
  //       Blockly.navigation.ACTION_PREVIOUS);
  // });
  //
  // test('Test get key by the shortcut name', function() {
  //   var testShortcut = {
  //     'name': 'test_action'
  //   };
  //   Blockly.KeyboardShortcutRegistry.registry.register('test', testShortcut, true);
  //   var shortcut = Blockly.KeyboardShortcutRegistry.registry.getKeyByAction()
  //   chai.assert.equal(shortcut.name, 'test_action');
  //
  //   var key = Blockly.user.keyMap.getKeyByAction(Blockly.navigation.ACTION_PREVIOUS);
  //   chai.assert.equal(key, Blockly.utils.KeyCodes.W);
  // });
  //
  // test('Test get key by action not defined', function() {
  //   var key = Blockly.user.keyMap.getKeyByAction(new Blockly.Action('something'));
  //   chai.assert.notExists(key);
  // });
  //
  // test('Test set key map', function() {
  //   var testKeyMap = Blockly.user.keyMap.createDefaultKeyMap();
  //   testKeyMap['randomKey'] = new Blockly.Action('test','',null);
  //   Blockly.user.keyMap.setKeyMap(testKeyMap);
  //   chai.assert.equal(Blockly.user.keyMap.map_['randomKey'].name, 'test');
  // });
  //
  // test('Test get key map returns a clone', function() {
  //   var keyMap = Blockly.user.keyMap.getKeyMap();
  //   keyMap['randomKey'] = new Blockly.Action('test', '', null);
  //   chai.assert.isUndefined(Blockly.user.keyMap.map_['randomKey']);
  // });
  //


  teardown(function() {});
});
