/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

suite('Key Map Tests', function() {
  setup(function() {
    Blockly.user.keyMap.setKeyMap(Blockly.user.keyMap.createDefaultKeyMap());
  });

  test('Test adding a new action to key map', function() {
    var newAction = new Blockly.Action('test_action', 'test', function(){
      return "test";
    });
    Blockly.user.keyMap.setActionForKey('65', newAction);
    assertEquals(Blockly.user.keyMap.map_['65'].name, 'test_action');
  });

  test('Test giving an old action a new key', function() {
    Blockly.user.keyMap.setActionForKey(Blockly.utils.KeyCodes.F,
        Blockly.navigation.ACTION_PREVIOUS);
    assertEquals(Blockly.user.keyMap.map_[Blockly.utils.KeyCodes.W], undefined);
    assertEquals(Blockly.user.keyMap.map_[Blockly.utils.KeyCodes.F],
        Blockly.navigation.ACTION_PREVIOUS);
  });

  test('Test get key by action defined', function() {
    var key = Blockly.user.keyMap.getKeyByAction(Blockly.navigation.ACTION_PREVIOUS);
    assertEquals(key, Blockly.utils.KeyCodes.W);
  });

  test('Test get key by action undefined', function() {
    var key = Blockly.user.keyMap.getKeyByAction(new Blockly.Action('something'));
    assertEquals(key, undefined);
  });

  test('Test set key map', function() {
    var testKeyMap = Blockly.user.keyMap.createDefaultKeyMap();
    testKeyMap['randomKey'] = new Blockly.Action('test','',null);
    Blockly.user.keyMap.setKeyMap(testKeyMap);
    assertEquals(Blockly.user.keyMap.map_['randomKey'].name, 'test');
  });

  test('Test get key map returns a clone', function() {
    var keyMap = Blockly.user.keyMap.getKeyMap();
    keyMap['randomKey'] = new Blockly.Action('test', '', null);
    assertEquals(Blockly.user.keyMap.map_['randomKey'], undefined);
  });

  test('Test serialize key code with modifiers', function() {
    var mockEvent = {
      getModifierState: function(){
        return true;
      },
      keyCode: 65
    };
    var serializedKey = Blockly.user.keyMap.serializeKeyEvent(mockEvent);
    assertEquals(serializedKey, 'ShiftControlAltMeta65');
  });

  test('Test serialize key code without modifiers', function() {
    var mockEvent = {
      getModifierState: function(){
        return false;
      },
      keyCode: 65
    };
    var serializedKey = Blockly.user.keyMap.serializeKeyEvent(mockEvent);
    assertEquals(serializedKey, '65');
  });

  test('Test modifiers in reverse order', function() {
    var testKey = Blockly.user.keyMap.createSerializedKey(
        Blockly.utils.KeyCodes.K, [Blockly.user.keyMap.modifierKeys.CONTROL,
          Blockly.user.keyMap.modifierKeys.SHIFT]);
    Blockly.user.keyMap.setActionForKey(testKey, new Blockly.Action('test', '', null));
    var action = Blockly.user.keyMap.getActionByKeyCode('ShiftControl75');
    assertNotNull(action);
    assertEquals(action.name, 'test');
  });

  test('Test report invalid modifiers', function() {
    var shouldThrow = function() {
      Blockly.user.keyMap.createSerializedKey(Blockly.utils.KeyCodes.K, ['s',
        Blockly.user.keyMap.modifierKeys.SHIFT]);
    };
    chai.assert.throws(shouldThrow, Error, 's is not a valid modifier key.');
  });


  teardown(function() {});
});
