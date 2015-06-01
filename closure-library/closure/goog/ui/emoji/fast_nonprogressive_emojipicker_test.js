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

goog.provide('goog.ui.emoji.FastNonProgressiveEmojiPickerTest');
goog.setTestOnly('goog.ui.emoji.FastNonProgressiveEmojiPickerTest');

goog.require('goog.Promise');
goog.require('goog.dom.classlist');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.net.EventType');
goog.require('goog.style');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.emoji.Emoji');
goog.require('goog.ui.emoji.EmojiPicker');
goog.require('goog.ui.emoji.SpriteInfo');


var images;
var palette;
var picker;
var sprite = '../../demos/emoji/sprite.png';
var sprite2 = '../../demos/emoji/sprite2.png';


/**
 * Creates a SpriteInfo object with the specified properties. If the image is
 * sprited via CSS, then only the first parameter needs a value. If the image
 * is sprited via metadata, then the first parameter should be left null.
 *
 * @param {?string} cssClass CSS class to properly display the sprited image.
 * @param {string=} opt_url Url of the sprite image.
 * @param {number=} opt_width Width of the image being sprited.
 * @param {number=} opt_height Height of the image being sprited.
 * @param {number=} opt_xOffset Positive x offset of the image being sprited
 *     within the sprite.
 * @param {number=} opt_yOffset Positive y offset of the image being sprited
 *     within the sprite.
 * @param {boolean=} opt_animated Whether the sprite info is for an animated
 *     emoji.
 */
function si(cssClass, opt_url, opt_width, opt_height, opt_xOffset,
            opt_yOffset, opt_animated) {
  return new goog.ui.emoji.SpriteInfo(cssClass, opt_url, opt_width,
      opt_height, opt_xOffset, opt_yOffset, opt_animated);
}


// This group contains a mix of sprited emoji via css, sprited emoji via
// metadata, and non-sprited emoji.
var spritedEmoji2 = [
  'Emoji 1',
  [
   ['../../demos/emoji/200.gif', 'std.200', si('SPRITE_200')],
   ['../../demos/emoji/201.gif', 'std.201', si('SPRITE_201')],
   ['../../demos/emoji/202.gif', 'std.202', si('SPRITE_202')],
   ['../../demos/emoji/203.gif', 'std.203', si('SPRITE_203')],
   ['../../demos/emoji/204.gif', 'std.204', si('SPRITE_204')],
   ['../../demos/emoji/205.gif', 'std.205', si('SPRITE_205')],
   ['../../demos/emoji/206.gif', 'std.206', si('SPRITE_206')],
   ['../../demos/emoji/2BC.gif', 'std.2BC', si('SPRITE_2BC')],
   ['../../demos/emoji/2BD.gif', 'std.2BD', si('SPRITE_2BD')],
   ['../../demos/emoji/2BE.gif', 'std.2BE',
    si(null, sprite, 18, 18, 36, 54)],
   ['../../demos/emoji/2BF.gif', 'std.2BF',
    si(null, sprite, 18, 18, 0, 126)],
   ['../../demos/emoji/2C0.gif', 'std.2C0',
    si(null, sprite, 18, 18, 18, 305)],
   ['../../demos/emoji/2C1.gif', 'std.2C1',
    si(null, sprite, 18, 18, 0, 287)],
   ['../../demos/emoji/2C2.gif', 'std.2C2',
    si(null, sprite, 18, 18, 18, 126)],
   ['../../demos/emoji/2C3.gif', 'std.2C3',
    si(null, sprite, 18, 18, 36, 234)],
   ['../../demos/emoji/2C4.gif', 'std.2C4',
    si(null, sprite, 18, 18, 36, 72)],
   ['../../demos/emoji/2C5.gif', 'std.2C5',
    si(null, sprite, 18, 18, 54, 54)],
   ['../../demos/emoji/2C6.gif', 'std.2C6'],
   ['../../demos/emoji/2C7.gif', 'std.2C7'],
   ['../../demos/emoji/2C8.gif', 'std.2C8'],
   ['../../demos/emoji/2C9.gif', 'std.2C9'],
   ['../../demos/emoji/2CA.gif', 'std.2CA',
    si(null, sprite2, 18, 20, 36, 72, 1)],
   ['../../demos/emoji/2E3.gif', 'std.2E3',
    si(null, sprite2, 18, 18, 0, 0, 1)],
   ['../../demos/emoji/2EF.gif', 'std.2EF',
    si(null, sprite2, 18, 20, 0, 300, 1)],
   ['../../demos/emoji/2F1.gif', 'std.2F1',
    si(null, sprite2, 18, 18, 0, 320, 1)]
  ]];


/**
 * Returns true if the two paths end with the same file.
 *
 * E.g., ('../../cool.gif', 'file:///home/usr/somewhere/cool.gif') --> true
 *
 * @param {string} path1 First url
 * @param {string} path2 Second url
 */
function checkPathsEndWithSameFile(path1, path2) {
  var pieces1 = path1.split('/');
  var file1 = pieces1[pieces1.length - 1];
  var pieces2 = path2.split('/');
  var file2 = pieces2[pieces2.length - 1];

  return file1 == file2;
}


/**
 * Checks and verifies the structure of a non-progressive fast-loading picker
 * after the animated emoji have loaded.
 */
function testStructure() {
  var emoji = spritedEmoji2;

  for (var i = 0; i < emoji[1].length; i++) {
    palette.setSelectedIndex(i);
    var emojiInfo = emoji[1][i];
    var cell = palette.getSelectedItem();
    var id = cell.getAttribute(goog.ui.emoji.Emoji.ATTRIBUTE);
    var inner = /** @type {Element} */ (cell.firstChild);

    // Check that the cell is a div wrapped around something else, and that the
    // outer div contains the goomoji attribute
    assertEquals('The palette item should be a div wrapped around something',
        cell.tagName, 'DIV');
    assertNotNull('The outer div is not wrapped around another element', inner);
    assertEquals('The palette item should have the goomoji attribute',
        cell.getAttribute(goog.ui.emoji.Emoji.ATTRIBUTE), emojiInfo[1]);

    // Now check the contents of the cells
    var url = emojiInfo[0];   // url of the animated emoji
    var spriteInfo = emojiInfo[2];
    if (spriteInfo) {
      assertEquals(inner.tagName, 'DIV');
      if (spriteInfo.isAnimated()) {
        var img = images[id];
        checkPathsEndWithSameFile(
            goog.style.getStyle(inner, 'background-image'),
            url);
        assertEquals(String(img.width), goog.style.getStyle(inner, 'width').
            replace(/px/g, '').replace(/pt/g, ''));
        assertEquals(String(img.height), goog.style.getStyle(inner, 'height').
            replace(/px/g, '').replace(/pt/g, ''));
        assertEquals('0 0', goog.style.getStyle(inner,
            'background-position').replace(/px/g, '').
            replace(/pt/g, ''));
      } else {
        var cssClass = spriteInfo.getCssClass();
        if (cssClass) {
          assertTrue('Sprite should have its CSS class set',
              goog.dom.classlist.contains(inner, cssClass));
        } else {
          checkPathsEndWithSameFile(
              goog.style.getStyle(inner, 'background-image'),
              spriteInfo.getUrl());
          assertEquals(spriteInfo.getWidthCssValue(),
              goog.style.getStyle(inner, 'width'));
          assertEquals(spriteInfo.getHeightCssValue(),
              goog.style.getStyle(inner, 'height'));
          assertEquals((spriteInfo.getXOffsetCssValue() + ' ' +
                        spriteInfo.getYOffsetCssValue()).replace(/px/g, '').
              replace(/pt/g, ''),
              goog.style.getStyle(inner,
                  'background-position').replace(/px/g, '').
                  replace(/pt/g, ''));
        }
      }
    } else {
      // A non-sprited emoji is just an img
      assertEquals(inner.tagName, 'IMG');
      checkPathsEndWithSameFile(inner.src, emojiInfo[0]);
    }
  }
}


function setUp() {
  var defaultImg = '../../demos/emoji/none.gif';
  picker = new goog.ui.emoji.EmojiPicker(defaultImg);
  picker.setDelayedLoad(false);
  picker.setManualLoadOfAnimatedEmoji(true);
  picker.setProgressiveRender(false);
  picker.addEmojiGroup(spritedEmoji2[0], spritedEmoji2[1]);
  picker.render();

  palette = picker.getPage(0);
  var imageLoader = palette.getImageLoader();
  images = {};

  return new goog.Promise(function(resolve, reject) {
    goog.events.listen(imageLoader, goog.net.EventType.COMPLETE, resolve);
    goog.events.listen(imageLoader, goog.events.EventType.LOAD, function(e) {
      var image = e.target;
      images[image.id] = image;
    });

    // Now we load the animated emoji and check the structure again. The
    // animated emoji will be different.
    picker.manuallyLoadAnimatedEmoji();
  });
}


function tearDown() {
  picker.dispose();
}
