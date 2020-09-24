/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('Utils', function() {
  setup(function() {
    sharedTestSetup.call(this);
  });
  teardown(function() {
    sharedTestTeardown.call(this);
  });

  test('genUid', function() {
    var uuids = {};
    chai.assert.equal([1,2,3].indexOf(4), -1);
    for (var i = 0; i < 1000; i++) {
      var uuid = Blockly.utils.genUid();
      chai.assert.isFalse(uuid in uuids, 'UUID different: ' + uuid);
      uuids[uuid] = true;
    }
  });

  suite('tokenizeInterpolation', function() {
    test('Basic', function() {
      var tokens = Blockly.utils.tokenizeInterpolation('');
      chai.assert.deepEqual(tokens, [], 'Null interpolation');

      tokens = Blockly.utils.tokenizeInterpolation('Hello');
      chai.assert.deepEqual(tokens, ['Hello'], 'No interpolation');

      tokens = Blockly.utils.tokenizeInterpolation('Hello%World');
      chai.assert.deepEqual(tokens, ['Hello%World'], 'Unescaped %.');

      tokens = Blockly.utils.tokenizeInterpolation('Hello%%World');
      chai.assert.deepEqual(tokens, ['Hello%World'], 'Escaped %.');

      tokens = Blockly.utils.tokenizeInterpolation('Hello %1 World');
      chai.assert.deepEqual(tokens, ['Hello ', 1, ' World'], 'Interpolation.');

      tokens = Blockly.utils.tokenizeInterpolation('%123Hello%456World%789');
      chai.assert.deepEqual(tokens, [123, 'Hello', 456, 'World', 789], 'Interpolations.');

      tokens = Blockly.utils.tokenizeInterpolation('%%%x%%0%00%01%');
      chai.assert.deepEqual(tokens, ['%%x%0', 0, 1, '%'], 'Torture interpolations.');
    });

    test('String table', function() {
      Blockly.Msg = Blockly.Msg || {};
      Blockly.Msg.STRING_REF = 'test string';
      var tokens = Blockly.utils.tokenizeInterpolation('%{bky_string_ref}');
      chai.assert.deepEqual(tokens, ['test string'], 'String table reference, lowercase');
      tokens = Blockly.utils.tokenizeInterpolation('%{BKY_STRING_REF}');
      chai.assert.deepEqual(tokens, ['test string'], 'String table reference, uppercase');

      Blockly.Msg.WITH_PARAM = 'before %1 after';
      tokens = Blockly.utils.tokenizeInterpolation('%{bky_with_param}');
      chai.assert.deepEqual(tokens, ['before ', 1, ' after'], 'String table reference, with parameter');

      Blockly.Msg.RECURSE = 'before %{bky_string_ref} after';
      tokens = Blockly.utils.tokenizeInterpolation('%{bky_recurse}');
      chai.assert.deepEqual(tokens, ['before test string after'], 'String table reference, with subreference');
    });

    test('Error cases', function() {
      var tokens = Blockly.utils.tokenizeInterpolation('%{bky_undefined}');
      chai.assert.deepEqual(tokens, ['%{bky_undefined}'], 'Undefined string table reference');

      Blockly.Msg['1'] = 'Will not match';
      tokens = Blockly.utils.tokenizeInterpolation('before %{1} after');
      chai.assert.deepEqual(tokens, ['before %{1} after'], 'Invalid initial digit in string table reference');

      Blockly.Msg['TWO WORDS'] = 'Will not match';
      tokens = Blockly.utils.tokenizeInterpolation('before %{two words} after');
      chai.assert.deepEqual(tokens, ['before %{two words} after'], 'Invalid character in string table reference: space');

      Blockly.Msg['TWO-WORDS'] = 'Will not match';
      tokens = Blockly.utils.tokenizeInterpolation('before %{two-words} after');
      chai.assert.deepEqual(tokens, ['before %{two-words} after'], 'Invalid character in string table reference: dash');

      Blockly.Msg['TWO.WORDS'] = 'Will not match';
      tokens = Blockly.utils.tokenizeInterpolation('before %{two.words} after');
      chai.assert.deepEqual(tokens, ['before %{two.words} after'], 'Invalid character in string table reference: period');

      Blockly.Msg['AB&C'] = 'Will not match';
      tokens = Blockly.utils.tokenizeInterpolation('before %{ab&c} after');
      chai.assert.deepEqual(tokens, ['before %{ab&c} after'], 'Invalid character in string table reference: &');

      Blockly.Msg['UNCLOSED'] = 'Will not match';
      tokens = Blockly.utils.tokenizeInterpolation('before %{unclosed');
      chai.assert.deepEqual(tokens, ['before %{unclosed'], 'String table reference, with parameter');
    });
  });

  test('replaceMessageReferences', function() {
    Blockly.Msg = Blockly.Msg || {};
    Blockly.Msg.STRING_REF = 'test string';
    Blockly.Msg.SUBREF = 'subref';
    Blockly.Msg.STRING_REF_WITH_ARG = 'test %1 string';
    Blockly.Msg.STRING_REF_WITH_SUBREF = 'test %{bky_subref} string';

    var resultString = Blockly.utils.replaceMessageReferences('');
    chai.assert.equal(resultString, '', 'Empty string produces empty string');

    resultString = Blockly.utils.replaceMessageReferences('%%');
    chai.assert.equal(resultString, '%', 'Escaped %');
    resultString = Blockly.utils.replaceMessageReferences('%%{bky_string_ref}');
    chai.assert.equal(resultString, '%{bky_string_ref}', 'Escaped %');

    resultString = Blockly.utils.replaceMessageReferences('%a');
    chai.assert.equal(resultString, '%a', 'Unrecognized % escape code treated as literal');

    resultString = Blockly.utils.replaceMessageReferences('%1');
    chai.assert.equal(resultString, '%1', 'Interpolation tokens ignored.');
    resultString = Blockly.utils.replaceMessageReferences('%1 %2');
    chai.assert.equal(resultString, '%1 %2', 'Interpolation tokens ignored.');
    resultString = Blockly.utils.replaceMessageReferences('before %1 after');
    chai.assert.equal(resultString, 'before %1 after', 'Interpolation tokens ignored.');

    // Blockly.Msg.STRING_REF cases:
    resultString = Blockly.utils.replaceMessageReferences('%{bky_string_ref}');
    chai.assert.equal(resultString, 'test string', 'Message ref dereferenced.');
    resultString = Blockly.utils.replaceMessageReferences('before %{bky_string_ref} after');
    chai.assert.equal(resultString, 'before test string after', 'Message ref dereferenced.');

    // Blockly.Msg.STRING_REF_WITH_ARG cases:
    resultString = Blockly.utils.replaceMessageReferences('%{bky_string_ref_with_arg}');
    chai.assert.equal(resultString, 'test %1 string', 'Message ref dereferenced with argument preserved.');
    resultString = Blockly.utils.replaceMessageReferences('before %{bky_string_ref_with_arg} after');
    chai.assert.equal(resultString, 'before test %1 string after', 'Message ref dereferenced with argument preserved.');

    // Blockly.Msg.STRING_REF_WITH_SUBREF cases:
    resultString = Blockly.utils.replaceMessageReferences('%{bky_string_ref_with_subref}');
    chai.assert.equal(resultString, 'test subref string', 'Message ref and subref dereferenced.');
    resultString = Blockly.utils.replaceMessageReferences('before %{bky_string_ref_with_subref} after');
    chai.assert.equal(resultString, 'before test subref string after', 'Message ref and subref dereferenced.');
  });

  test('arrayRemove', function() {
    var arr = [1, 2, 3, 2];
    chai.assert.isFalse(Blockly.utils.arrayRemove(arr, 0), 'Remove Not found');
    chai.assert.equal(arr.join(','), '1,2,3,2', 'Remove Not found result');
    chai.assert.isTrue(Blockly.utils.arrayRemove(arr, 2), 'Remove item');
    chai.assert.equal(arr.join(','), '1,3,2', 'Remove item result');
    chai.assert.isTrue(Blockly.utils.arrayRemove(arr, 2), 'Remove item again');
    chai.assert.equal(arr.join(','), '1,3', 'Remove item again result');
  });

  test('XY_REGEX_', function() {
    var regex = Blockly.utils.getRelativeXY.XY_REGEX_;
    var m;
    m = 'INVALID'.match(regex);
    chai.assert.isNull(m);

    m = 'translate(10)'.match(regex);
    chai.assert.equal(m[1], '10', 'translate(10), x');
    chai.assert.isUndefined(m[3], 'translate(10), y');

    m = 'translate(11, 12)'.match(regex);
    chai.assert.equal(m[1], '11', 'translate(11, 12), x');
    chai.assert.equal(m[3], '12', 'translate(11, 12), y');

    m = 'translate(13,14)'.match(regex);
    chai.assert.equal(m[1], '13', 'translate(13,14), x');
    chai.assert.equal(m[3], '14', 'translate(13,14), y');

    m = 'translate(15 16)'.match(regex);
    chai.assert.equal(m[1], '15', 'translate(15 16), x');
    chai.assert.equal(m[3], '16', 'translate(15 16), y');

    m = 'translate(1.23456e+42 0.123456e-42)'.match(regex);
    chai.assert.equal(m[1], '1.23456e+42', 'translate(1.23456e+42 0.123456e-42), x');
    chai.assert.equal(m[3], '0.123456e-42', 'translate(1.23456e+42 0.123456e-42), y');
  });

  test('XY_STYLE_REGEX_', function() {
    var regex = Blockly.utils.getRelativeXY.XY_STYLE_REGEX_;
    var m;
    m = 'INVALID'.match(regex);
    chai.assert.isNull(m);

    m = 'transform:translate(9px)'.match(regex);
    chai.assert.equal(m[1], '9', 'transform:translate(9px), x');
    chai.assert.isUndefined(m[3], 'transform:translate(9px), y');

    m = 'transform:translate3d(10px)'.match(regex);
    chai.assert.equal(m[1], '10', 'transform:translate3d(10px), x');
    chai.assert.isUndefined(m[3], 'transform:translate(10px), y');

    m = 'transform: translate(11px, 12px)'.match(regex);
    chai.assert.equal(m[1], '11', 'transform: translate(11px, 12px), x');
    chai.assert.equal(m[3], '12', 'transform: translate(11px, 12px), y');

    m = 'transform: translate(13px,14px)'.match(regex);
    chai.assert.equal(m[1], '13', 'transform: translate(13px,14px), x');
    chai.assert.equal(m[3], '14', 'transform: translate(13px,14px), y');

    m = 'transform: translate(15px 16px)'.match(regex);
    chai.assert.equal(m[1], '15', 'transform: translate(15px 16px), x');
    chai.assert.equal(m[3], '16', 'transform: translate(15px 16px), y');

    m = 'transform: translate(1.23456e+42px 0.123456e-42px)'.match(regex);
    chai.assert.equal(m[1], '1.23456e+42', 'transform: translate(1.23456e+42px 0.123456e-42px), x');
    chai.assert.equal(m[3], '0.123456e-42', 'transform: translate(1.23456e+42px 0.123456e-42px), y');

    m = 'transform:translate3d(20px, 21px, 22px)'.match(regex);
    chai.assert.equal(m[1], '20', 'transform:translate3d(20px, 21px, 22px), x');
    chai.assert.equal(m[3], '21', 'transform:translate3d(20px, 21px, 22px), y');

    m = 'transform:translate3d(23px,24px,25px)'.match(regex);
    chai.assert.equal(m[1], '23', 'transform:translate3d(23px,24px,25px), x');
    chai.assert.equal(m[3], '24', 'transform:translate3d(23px,24px,25px), y');

    m = 'transform:translate3d(26px 27px 28px)'.match(regex);
    chai.assert.equal(m[1], '26', 'transform:translate3d(26px 27px 28px), x');
    chai.assert.equal(m[3], '27', 'transform:translate3d(26px 27px 28px), y');

    m = 'transform:translate3d(1.23456e+42px 0.123456e-42px 42px)'.match(regex);
    chai.assert.equal(m[1], '1.23456e+42', 'transform:translate3d(1.23456e+42px 0.123456e-42px 42px), x');
    chai.assert.equal(m[3], '0.123456e-42', 'transform:translate3d(1.23456e+42px 0.123456e-42px 42px), y');
  });

  suite('DOM', function() {
    test('addClass', function() {
      var p = document.createElement('p');
      Blockly.utils.dom.addClass(p, 'one');
      chai.assert.equal(p.className, 'one', 'Adding "one"');
      Blockly.utils.dom.addClass(p, 'one');
      chai.assert.equal(p.className, 'one', 'Adding duplicate "one"');
      Blockly.utils.dom.addClass(p, 'two');
      chai.assert.equal(p.className, 'one two', 'Adding "two"');
      Blockly.utils.dom.addClass(p, 'two');
      chai.assert.equal(p.className, 'one two', 'Adding duplicate "two"');
      Blockly.utils.dom.addClass(p, 'three');
      chai.assert.equal(p.className, 'one two three', 'Adding "three"');
    });

    test('hasClass', function() {
      var p = document.createElement('p');
      p.className = ' one three  two three  ';
      chai.assert.isTrue(Blockly.utils.dom.hasClass(p, 'one'), 'Has "one"');
      chai.assert.isTrue(Blockly.utils.dom.hasClass(p, 'two'), 'Has "two"');
      chai.assert.isTrue(Blockly.utils.dom.hasClass(p, 'three'), 'Has "three"');
      chai.assert.isFalse(Blockly.utils.dom.hasClass(p, 'four'), 'Has no "four"');
      chai.assert.isFalse(Blockly.utils.dom.hasClass(p, 't'), 'Has no "t"');
    });

    test('removeClass', function() {
      var p = document.createElement('p');
      p.className = ' one three  two three  ';
      Blockly.utils.dom.removeClass(p, 'two');
      chai.assert.equal(p.className, 'one three three', 'Removing "two"');
      Blockly.utils.dom.removeClass(p, 'four');
      chai.assert.equal(p.className, 'one three three', 'Removing "four"');
      Blockly.utils.dom.removeClass(p, 'three');
      chai.assert.equal(p.className, 'one', 'Removing "three"');
      Blockly.utils.dom.removeClass(p, 'ne');
      chai.assert.equal(p.className, 'one', 'Removing "ne"');
      Blockly.utils.dom.removeClass(p, 'one');
      chai.assert.equal(p.className, '', 'Removing "one"');
      Blockly.utils.dom.removeClass(p, 'zero');
      chai.assert.equal(p.className, '', 'Removing "zero"');
    });
  });

  suite('String', function() {
    test('starts with', function() {
      chai.assert.isFalse(Blockly.utils.string.startsWith('123', '2'), 'Does not start with');
      chai.assert.isTrue(Blockly.utils.string.startsWith('123', '12'), 'Start with');
      chai.assert.isTrue(Blockly.utils.string.startsWith('123', ''), 'Start with empty string 1');
      chai.assert.isTrue(Blockly.utils.string.startsWith('', ''), 'Start with empty string 12');
    });

    test('shortest string length', function() {
      var len = Blockly.utils.string.shortestStringLength('one,two,three,four,five'.split(','));
      chai.assert.equal(len, 3, 'Length of "one"');
      len = Blockly.utils.string.shortestStringLength('one,two,three,four,five,'.split(','));
      chai.assert.equal(len, 0, 'Length of ""');
      len = Blockly.utils.string.shortestStringLength(['Hello World']);
      chai.assert.equal(len, 11, 'List of one');
      len = Blockly.utils.string.shortestStringLength([]);
      chai.assert.equal(len, 0, 'Empty list');
    });

    test('comment word prefix', function() {
      var len = Blockly.utils.string.commonWordPrefix('one,two,three,four,five'.split(','));
      chai.assert.equal(len, 0, 'No prefix');
      len = Blockly.utils.string.commonWordPrefix('Xone,Xtwo,Xthree,Xfour,Xfive'.split(','));
      chai.assert.equal(len, 0, 'No word prefix');
      len = Blockly.utils.string.commonWordPrefix('abc de,abc de,abc de,abc de'.split(','));
      chai.assert.equal(len, 6, 'Full equality');
      len = Blockly.utils.string.commonWordPrefix('abc deX,abc deY'.split(','));
      chai.assert.equal(len, 4, 'One word prefix');
      len = Blockly.utils.string.commonWordPrefix('abc de,abc deY'.split(','));
      chai.assert.equal(len, 4, 'Overflow no');
      len = Blockly.utils.string.commonWordPrefix('abc de,abc de Y'.split(','));
      chai.assert.equal(len, 6, 'Overflow yes');
      len = Blockly.utils.string.commonWordPrefix(['Hello World']);
      chai.assert.equal(len, 11, 'List of one');
      len = Blockly.utils.string.commonWordPrefix([]);
      chai.assert.equal(len, 0, 'Empty list');
      len = Blockly.utils.string.commonWordPrefix('turn&nbsp;left,turn&nbsp;right'.split(','));
      chai.assert.equal(len, 0, 'No prefix due to &amp;nbsp;');
      len = Blockly.utils.string.commonWordPrefix('turn\u00A0left,turn\u00A0right'.split(','));
      chai.assert.equal(len, 0, 'No prefix due to \\u00A0');
    });

    test('comment word suffix', function() {
      var len = Blockly.utils.string.commonWordSuffix('one,two,three,four,five'.split(','));
      chai.assert.equal(len, 0, 'No suffix');
      len = Blockly.utils.string.commonWordSuffix('oneX,twoX,threeX,fourX,fiveX'.split(','));
      chai.assert.equal(len, 0, 'No word suffix');
      len = Blockly.utils.string.commonWordSuffix('abc de,abc de,abc de,abc de'.split(','));
      chai.assert.equal(len, 6, 'Full equality');
      len = Blockly.utils.string.commonWordSuffix('Xabc de,Yabc de'.split(','));
      chai.assert.equal(len, 3, 'One word suffix');
      len = Blockly.utils.string.commonWordSuffix('abc de,Yabc de'.split(','));
      chai.assert.equal(len, 3, 'Overflow no');
      len = Blockly.utils.string.commonWordSuffix('abc de,Y abc de'.split(','));
      chai.assert.equal(len, 6, 'Overflow yes');
      len = Blockly.utils.string.commonWordSuffix(['Hello World']);
      chai.assert.equal(len, 11, 'List of one');
      len = Blockly.utils.string.commonWordSuffix([]);
      chai.assert.equal(len, 0, 'Empty list');
    });
  });

  suite('Math', function() {
    test('toRadians', function() {
      var quarter = Math.PI / 2;
      chai.assert.equal(Blockly.utils.math.toRadians(-90), -quarter, '-90');
      chai.assert.equal(Blockly.utils.math.toRadians(0), 0, '0');
      chai.assert.equal(Blockly.utils.math.toRadians(90), quarter, '90');
      chai.assert.equal(Blockly.utils.math.toRadians(180), 2 * quarter, '180');
      chai.assert.equal(Blockly.utils.math.toRadians(270), 3 * quarter, '270');
      chai.assert.equal(Blockly.utils.math.toRadians(360), 4 * quarter, '360');
      chai.assert.equal(Blockly.utils.math.toRadians(360 + 90), 5 * quarter, '450');
    });

    test('toDegrees', function() {
      var quarter = Math.PI / 2;
      chai.assert.equal(Blockly.utils.math.toDegrees(-quarter), -90, '-90');
      chai.assert.equal(Blockly.utils.math.toDegrees(0), 0, '0');
      chai.assert.equal(Blockly.utils.math.toDegrees(quarter), 90, '90');
      chai.assert.equal(Blockly.utils.math.toDegrees(2 * quarter), 180, '180');
      chai.assert.equal(Blockly.utils.math.toDegrees(3 * quarter), 270, '270');
      chai.assert.equal(Blockly.utils.math.toDegrees(4 * quarter), 360, '360');
      chai.assert.equal(Blockly.utils.math.toDegrees(5 * quarter), 360 + 90, '450');
    });
  });
});
