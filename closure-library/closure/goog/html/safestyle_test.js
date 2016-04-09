// Copyright 2014 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Unit tests for goog.html.SafeStyle and its builders.
 */

goog.provide('goog.html.safeStyleTest');

goog.require('goog.html.SafeStyle');
goog.require('goog.object');
goog.require('goog.string.Const');
goog.require('goog.testing.jsunit');

goog.setTestOnly('goog.html.safeStyleTest');


function testSafeStyle() {
  var style = 'width: 1em;height: 1em;';
  var safeStyle =
      goog.html.SafeStyle.fromConstant(goog.string.Const.from(style));
  var extracted = goog.html.SafeStyle.unwrap(safeStyle);
  assertEquals(style, extracted);
  assertEquals(style, safeStyle.getTypedStringValue());
  assertEquals('SafeStyle{' + style + '}', String(safeStyle));

  // Interface marker is present.
  assertTrue(safeStyle.implementsGoogStringTypedString);
}


/** @suppress {checkTypes} */
function testUnwrap() {
  var privateFieldName = 'privateDoNotAccessOrElseSafeStyleWrappedValue_';
  var markerFieldName = 'SAFE_STYLE_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_';
  var propNames = goog.object.getKeys(
      goog.html.SafeStyle.fromConstant(goog.string.Const.from('')));
  assertContains(privateFieldName, propNames);
  assertContains(markerFieldName, propNames);
  var evil = {};
  evil[privateFieldName] = 'width: expression(evil);';
  evil[markerFieldName] = {};

  var exception =
      assertThrows(function() { goog.html.SafeStyle.unwrap(evil); });
  assertContains('expected object of type SafeStyle', exception.message);
}


function testFromConstant_allowsEmptyString() {
  assertEquals(
      goog.html.SafeStyle.EMPTY,
      goog.html.SafeStyle.fromConstant(goog.string.Const.from('')));
}

function testFromConstant_throwsOnForbiddenCharacters() {
  assertThrows(function() {
    goog.html.SafeStyle.fromConstant(goog.string.Const.from('width: x<;'));
  });
  assertThrows(function() {
    goog.html.SafeStyle.fromConstant(goog.string.Const.from('width: x>;'));
  });
}


function testFromConstant_throwsIfNoFinalSemicolon() {
  assertThrows(function() {
    goog.html.SafeStyle.fromConstant(goog.string.Const.from('width: 1em'));
  });
}


function testFromConstant_throwsIfNoColon() {
  assertThrows(function() {
    goog.html.SafeStyle.fromConstant(goog.string.Const.from('width= 1em;'));
  });
}


function testEmpty() {
  assertEquals('', goog.html.SafeStyle.unwrap(goog.html.SafeStyle.EMPTY));
}


function testCreate() {
  var style = goog.html.SafeStyle.create(
      {'background': goog.string.Const.from('url(i.png)'), 'margin': '0'});
  assertEquals(
      'background:url(i.png);margin:0;', goog.html.SafeStyle.unwrap(style));
}


function testCreate_allowsEmpty() {
  assertEquals(goog.html.SafeStyle.EMPTY, goog.html.SafeStyle.create({}));
}


function testCreate_skipsNull() {
  var style = goog.html.SafeStyle.create({'background': null});
  assertEquals(goog.html.SafeStyle.EMPTY, style);
}


function testCreate_allowsLengths() {
  var style = goog.html.SafeStyle.create({'padding': '0 1px .2% 3.4em'});
  assertEquals('padding:0 1px .2% 3.4em;', goog.html.SafeStyle.unwrap(style));
}


function testCreate_allowsRgb() {
  var style = goog.html.SafeStyle.create({'color': 'rgb(10,20,30)'});
  assertEquals('color:rgb(10,20,30);', goog.html.SafeStyle.unwrap(style));
  style = goog.html.SafeStyle.create({'color': 'rgb(10%, 20%, 30%)'});
  assertEquals('color:rgb(10%, 20%, 30%);', goog.html.SafeStyle.unwrap(style));
}


function testCreate_allowsRgba() {
  var style = goog.html.SafeStyle.create({'color': 'rgba(10,20,30,0.1)'});
  assertEquals('color:rgba(10,20,30,0.1);', goog.html.SafeStyle.unwrap(style));
  style = goog.html.SafeStyle.create({'color': 'rgba(10%, 20%, 30%, .5)'});
  assertEquals(
      'color:rgba(10%, 20%, 30%, .5);', goog.html.SafeStyle.unwrap(style));
}


function testCreate_throwsOnForbiddenCharacters() {
  assertThrows(function() { goog.html.SafeStyle.create({'<': '0'}); });
  assertThrows(function() {
    goog.html.SafeStyle.create({'color': goog.string.Const.from('<')});
  });
}


function testCreate_values() {
  var valids = [
    '0', '0 0', '1px', '100%', '2.3px', '.1em', 'red', '#f00', 'red !important',
    '"Times New Roman"', "'Times New Roman'", '"Bold \'nuff"',
    '"O\'Connor\'s Revenge"'
  ];
  for (var i = 0; i < valids.length; i++) {
    var value = valids[i];
    assertEquals(
        'background:' + value + ';',
        goog.html.SafeStyle.unwrap(
            goog.html.SafeStyle.create({'background': value})));
  }

  var invalids = [
    '', 'expression(alert(1))', 'url(i.png)', '"', '"\'"\'',
    goog.string.Const.from('red;')
  ];
  for (var i = 0; i < invalids.length; i++) {
    var value = invalids[i];
    assertThrows(function() {
      goog.html.SafeStyle.create({'background': value});
    });
  }
}


function testConcat() {
  var width =
      goog.html.SafeStyle.fromConstant(goog.string.Const.from('width: 1em;'));
  var margin = goog.html.SafeStyle.create({'margin': '0'});
  var padding = goog.html.SafeStyle.create({'padding': '0'});

  var style = goog.html.SafeStyle.concat(width, margin);
  assertEquals('width: 1em;margin:0;', goog.html.SafeStyle.unwrap(style));

  style = goog.html.SafeStyle.concat([width, margin]);
  assertEquals('width: 1em;margin:0;', goog.html.SafeStyle.unwrap(style));

  style = goog.html.SafeStyle.concat([width], [padding, margin]);
  assertEquals(
      'width: 1em;padding:0;margin:0;', goog.html.SafeStyle.unwrap(style));
}


function testConcat_allowsEmpty() {
  var empty = goog.html.SafeStyle.EMPTY;
  assertEquals(empty, goog.html.SafeStyle.concat());
  assertEquals(empty, goog.html.SafeStyle.concat([]));
  assertEquals(empty, goog.html.SafeStyle.concat(empty));
}
