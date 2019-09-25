/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2019 Google Inc.
 * https://developers.google.com/blockly/
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

// Note that this doesn't test specific cases (e.g. all toolbox positions,
// simple vs category toolbox) because that would get crazy. This assumes
// that metrics are returned correctly.
suite('Bump Objects', function() {
  setup(function() {
    this.clock = sinon.useFakeTimers();

    Blockly.Events.disable();

    this.createBumpableObject = function(x, y, width, height) {
      var object = new Blockly.WorkspaceCommentSvg(
          this.workspace, '', height, width);
      object.moveTo(x, y);
      return object;
    };
    this.runBump = function(object) {
      Blockly.bumpObject_(
          object, Blockly.getWorkspaceMetrics_(this.workspace));
    };
    this.assertObjectRect = function(object, left, top, right, bottom) {
      var rect = object.getBoundingRectangle();
      chai.assert.equal(rect.left, left);
      chai.assert.equal(rect.top, top);
      chai.assert.equal(rect.right, right);
      chai.assert.equal(rect.bottom, bottom);
    };
  });
  teardown(function() {
    this.clock.restore();
    Blockly.Events.enable();
  });
  suite('LTR', function() {
    setup(function() {
      this.workspace = Blockly.inject('blocklyDiv');
    });
    teardown(function() {
      this.workspace.dispose();
    });
    suite('Object Smaller than Bounds', function() {
      test('Top Left', function() {
        var object = this.createBumpableObject(-25, -25, 50, 50);
        this.runBump(object);
        this.assertObjectRect(object, 0, 0, 50, 50);
      });
      test('Top Right', function() {
        var object = this.createBumpableObject(75, -25, 50, 50);
        this.runBump(object);
        this.assertObjectRect(object, 50, 0, 100, 50);
      });
      test('Bottom Left', function() {
        var object = this.createBumpableObject(-25, 75, 50, 50);
        this.runBump(object);
        this.assertObjectRect(object, 0, 50, 50, 100);
      });
      test('Bottom Right', function() {
        var object = this.createBumpableObject(75, 75, 50, 50);
        this.runBump(object);
        this.assertObjectRect(object, 50, 50, 100, 100);
      });
    });
    suite('Object Larger than Bounds', function() {
      test('Taller - Above', function() {
        var object = this.createBumpableObject(0, -25, 50, 150);
        this.runBump(object);
        this.assertObjectRect(object, 0, 0, 50, 150);
      });
      test('Taller - Below', function() {
        var object = this.createBumpableObject(0, 25, 50, 150);
        this.runBump(object);
        this.assertObjectRect(object, 0, 0, 50, 150);
      });
      test('Wider - Start', function() {
        var object = this.createBumpableObject(-25, 0, 150, 50);
        this.runBump(object);
        this.assertObjectRect(object, 0, 0, 150, 50);
      });
      test('Wider - End', function() {
        var object = this.createBumpableObject(25, 0, 150, 50);
        this.runBump(object);
        this.assertObjectRect(object, 0, 0, 150, 50);
      });
    });
  });
  // In RTL moveTo places the top-right off the comment relative to the
  // top-left of the workspace.
  suite('RTL', function() {
    setup(function() {
      this.workspace = Blockly.inject('blocklyDiv', {
        rtl: true
      });
    });
    teardown(function() {
      this.workspace.dispose();
    });
    suite('Object Smaller than Bounds', function() {
      test('Top Left', function() {
        var object = this.createBumpableObject(25, -25, 50, 50);
        this.runBump(object);
        this.assertObjectRect(object, 0, 0, 50, 50);
      });
      test('Top Right', function() {
        var object = this.createBumpableObject(125, -25, 50, 50);
        this.runBump(object);
        this.assertObjectRect(object, 50, 0, 100, 50);
      });
      test('Bottom Left', function() {
        var object = this.createBumpableObject(25, 75, 50, 50);
        this.runBump(object);
        this.assertObjectRect(object, 0, 50, 50, 100);
      });
      test('Bottom Right', function() {
        var object = this.createBumpableObject(125, 75, 50, 50);
        this.runBump(object);
        this.assertObjectRect(object, 50, 50, 100, 100);
      });
    });
    suite('Object Larger than Bounds', function() {
      test('Taller - Above', function() {
        var object = this.createBumpableObject(50, -25, 50, 150);
        this.runBump(object);
        this.assertObjectRect(object, 0, 0, 50, 150);
      });
      test('Taller - Below', function() {
        var object = this.createBumpableObject(50, 25, 50, 150);
        this.runBump(object);
        this.assertObjectRect(object, 0, 0, 50, 150);
      });
      test('Wider - Start', function() {
        var object = this.createBumpableObject(125, 0, 150, 50);
        this.runBump(object);
        this.assertObjectRect(object, -50, 0, 100, 50);
      });
      test('Wider - End', function() {
        var object = this.createBumpableObject(75, 0, 150, 50);
        this.runBump(object);
        this.assertObjectRect(object, -50, 0, 100, 50);
      });
    });
  });
});
