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
    Blockly.user.keyMap.setActionForKey(goog.events.KeyCodes.F, Blockly.navigation.ACTION_PREVIOUS);
    assertEquals(Blockly.user.keyMap.map_[goog.events.KeyCodes.W], undefined);
    assertEquals(Blockly.user.keyMap.map_[goog.events.KeyCodes.F],
        Blockly.navigation.ACTION_PREVIOUS);
  });

  test('Test get key by action defined', function() {
    var key = Blockly.user.keyMap.getKeyByAction(Blockly.navigation.ACTION_PREVIOUS);
    assertEquals(key, goog.events.KeyCodes.W);
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
  teardown(function() {});
});
