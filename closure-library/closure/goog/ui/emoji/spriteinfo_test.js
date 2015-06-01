// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.ui.emoji.SpriteInfoTest');
goog.setTestOnly('goog.ui.emoji.SpriteInfoTest');

goog.require('goog.testing.jsunit');
goog.require('goog.ui.emoji.SpriteInfo');
function testGetCssValues() {
  var si = new goog.ui.emoji.SpriteInfo(null, 'im/s.png', 10, 10, 0, 128);
  assertEquals('10px', si.getWidthCssValue());
  assertEquals('10px', si.getHeightCssValue());
  assertEquals('0', si.getXOffsetCssValue());
  assertEquals('-128px', si.getYOffsetCssValue());
}

function testIncompletelySpecifiedSpriteInfoFails() {
  assertThrows('CSS class can\'t be null if the rest of the metadata ' +
               'isn\'t specified', function() {
        new goog.ui.emoji.SpriteInfo(null)});

  assertThrows('Can\'t create an incompletely specified sprite info',
      function() {
        new goog.ui.emoji.SpriteInfo(null, 's.png', 10);
      });

  assertThrows('Can\'t create an incompletely specified sprite info',
      function() {
        new goog.ui.emoji.SpriteInfo(null, 's.png', 10, 10);
      });

  assertThrows('Can\'t create an incompletely specified sprite info',
      function() {new goog.ui.emoji.SpriteInfo(null, 's.png', 10, 10, 0);});
}
