
suite('Utils', function() {
  test('genUid', function() {
    var uuids = {};
    chai.assert.equal([1,2,3].indexOf(4), -1);
    for (var i = 0; i < 1000; i++) {
      var uuid = Blockly.utils.genUid();
      chai.assert.isFalse(uuid in uuids, 'UUID different: ' + uuid);
      uuids[uuid] = true;
    }
  });
  test('addClass', function() {
    var p = document.createElement('p');
    Blockly.utils.addClass(p, 'one');
    assertEquals('Adding "one"', 'one', p.className);
    Blockly.utils.addClass(p, 'one');
    assertEquals('Adding duplicate "one"', 'one', p.className);
    Blockly.utils.addClass(p, 'two');
    assertEquals('Adding "two"', 'one two', p.className);
    Blockly.utils.addClass(p, 'two');
    assertEquals('Adding duplicate "two"', 'one two', p.className);
    Blockly.utils.addClass(p, 'three');
    assertEquals('Adding "three"', 'one two three', p.className);
  });

  test('hasClass', function() {
    var p = document.createElement('p');
    p.className = ' one three  two three  ';
    assertTrue('Has "one"', Blockly.utils.hasClass(p, 'one'));
    assertTrue('Has "two"', Blockly.utils.hasClass(p, 'two'));
    assertTrue('Has "three"', Blockly.utils.hasClass(p, 'three'));
    assertFalse('Has no "four"', Blockly.utils.hasClass(p, 'four'));
    assertFalse('Has no "t"', Blockly.utils.hasClass(p, 't'));
  });

  test('removeClass', function() {
    var p = document.createElement('p');
    p.className = ' one three  two three  ';
    Blockly.utils.removeClass(p, 'two');
    assertEquals('Removing "two"', 'one three three', p.className);
    Blockly.utils.removeClass(p, 'four');
    assertEquals('Removing "four"', 'one three three', p.className);
    Blockly.utils.removeClass(p, 'three');
    assertEquals('Removing "three"', 'one', p.className);
    Blockly.utils.removeClass(p, 'ne');
    assertEquals('Removing "ne"', 'one', p.className);
    Blockly.utils.removeClass(p, 'one');
    assertEquals('Removing "one"', '', p.className);
    Blockly.utils.removeClass(p, 'zero');
    assertEquals('Removing "zero"', '', p.className);
  });

  test('shortest string length', function() {
    var len = Blockly.utils.shortestStringLength('one,two,three,four,five'.split(','));
    assertEquals('Length of "one"', 3, len);
    len = Blockly.utils.shortestStringLength('one,two,three,four,five,'.split(','));
    assertEquals('Length of ""', 0, len);
    len = Blockly.utils.shortestStringLength(['Hello World']);
    assertEquals('List of one', 11, len);
    len = Blockly.utils.shortestStringLength([]);
    assertEquals('Empty list', 0, len);
  });

  test('comment word prefix', function() {
    var len = Blockly.utils.commonWordPrefix('one,two,three,four,five'.split(','));
    assertEquals('No prefix', 0, len);
    len = Blockly.utils.commonWordPrefix('Xone,Xtwo,Xthree,Xfour,Xfive'.split(','));
    assertEquals('No word prefix', 0, len);
    len = Blockly.utils.commonWordPrefix('abc de,abc de,abc de,abc de'.split(','));
    assertEquals('Full equality', 6, len);
    len = Blockly.utils.commonWordPrefix('abc deX,abc deY'.split(','));
    assertEquals('One word prefix', 4, len);
    len = Blockly.utils.commonWordPrefix('abc de,abc deY'.split(','));
    assertEquals('Overflow no', 4, len);
    len = Blockly.utils.commonWordPrefix('abc de,abc de Y'.split(','));
    assertEquals('Overflow yes', 6, len);
    len = Blockly.utils.commonWordPrefix(['Hello World']);
    assertEquals('List of one', 11, len);
    len = Blockly.utils.commonWordPrefix([]);
    assertEquals('Empty list', 0, len);
    len = Blockly.utils.commonWordPrefix('turn&nbsp;left,turn&nbsp;right'.split(','));
    assertEquals('No prefix due to &amp;nbsp;', 0, len);
    len = Blockly.utils.commonWordPrefix('turn\u00A0left,turn\u00A0right'.split(','));
    assertEquals('No prefix due to \\u00A0', 0, len);
  });
});
