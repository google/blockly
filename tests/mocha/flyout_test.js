/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('Flyout', function() {
  setup(function() {
    sharedTestSetup.call(this);
    Blockly.defineBlocksWithJsonArray([{
      "type": "basic_block",
      "message0": "%1",
      "args0": [
        {
          "type": "field_input",
          "name": "TEXT",
          "text": "default"
        }
      ]
    }]);
    this.toolboxXml = document.getElementById('toolbox-simple');
    this.workspace = Blockly.inject('blocklyDiv',
        {
          toolbox: this.toolboxXml
        });
  });

  teardown(function() {
    sharedTestTeardown.call(this);
  });

  suite('position', function() {
    suite('vertical flyout', function() {
      suite('simple flyout', function() {
        setup(function() {
          this.flyout = this.workspace.getFlyout();
        });
        test('y is always 0', function() {
          chai.assert.equal(this.flyout.getY(), 0, 'y coordinate in vertical flyout should be 0');
        });
        test('x is right of workspace if flyout at right', function() {
          sinon.stub(this.flyout.targetWorkspace, 'getMetrics').returns({
            viewWidth: 100,
          });
          this.flyout.targetWorkspace.toolboxPosition = Blockly.TOOLBOX_AT_RIGHT;
          this.flyout.toolboxPosition_ = Blockly.TOOLBOX_AT_RIGHT;
          chai.assert.equal(this.flyout.getX(), 100, 'x should be right of workspace');
        });
        test('x is 0 if flyout at left', function() {
          this.flyout.targetWorkspace.toolboxPosition = Blockly.TOOLBOX_AT_LEFT;
          this.flyout.toolboxPosition_ = Blockly.TOOLBOX_AT_LEFT;
          chai.assert.equal(this.flyout.getX(), 0, 'x should be 0 if the flyout is on the left');
        });
      });
      suite('toolbox flyout', function() {
        setup(function() {
          var toolbox = document.getElementById('toolbox-categories');
          this.workspace = Blockly.inject('blocklyDiv',
              {
                toolbox: toolbox
              });
          this.flyout = this.workspace.getToolbox().getFlyout();
        });
        teardown(function() {
          workspaceTeardown.call(this, this.workspace);
        });
        test('x is aligned with toolbox at left', function() {
          sinon.stub(this.flyout.targetWorkspace, 'getMetrics').returns({
            toolboxWidth: 20,
          });
          this.flyout.targetWorkspace.toolboxPosition = Blockly.TOOLBOX_AT_LEFT;
          this.flyout.toolboxPosition_ = Blockly.TOOLBOX_AT_LEFT;
          chai.assert.equal(this.flyout.getX(), 20, 'x should be aligned with toolbox');
        });
        test('x is aligned with toolbox at right', function() {
          sinon.stub(this.flyout.targetWorkspace, 'getMetrics').returns({
            toolboxWidth: 20,
            viewWidth: 100,
          });
          this.flyout.width_ = 10;
          this.flyout.targetWorkspace.toolboxPosition = Blockly.TOOLBOX_AT_RIGHT;
          this.flyout.toolboxPosition_ = Blockly.TOOLBOX_AT_RIGHT;
          chai.assert.equal(this.flyout.getX(), 90,'x + width should be aligned with toolbox');
        });
      });
      // These tests simulate a trashcan flyout, i.e. the flyout under test is on the
      // opposite side of the workspace toolbox setting.
      suite('trashcan flyout', function() {
        setup(function() {
          this.flyout = this.workspace.getFlyout();
        });
        test('x is 0 if trashcan on left', function() {
          sinon.stub(this.flyout.targetWorkspace, 'getMetrics').returns({
            viewWidth: 100,
          });
          this.flyout.targetWorkspace.toolboxPosition = Blockly.TOOLBOX_AT_RIGHT;
          this.flyout.toolboxPosition_ = Blockly.TOOLBOX_AT_LEFT;
          chai.assert.equal(this.flyout.getX(), 0, 'x should be aligned with left edge');
        });
        test('trashcan on right covers right edge of workspace', function() {
          this.flyout.width_ = 20;
          sinon.stub(this.flyout.targetWorkspace, 'getMetrics').returns({
            viewWidth: 100,
            absoluteLeft: 10,
          });
          this.flyout.targetWorkspace.toolboxPosition = Blockly.TOOLBOX_AT_LEFT;
          this.flyout.toolboxPosition_ = Blockly.TOOLBOX_AT_RIGHT;
          chai.assert.equal(this.flyout.getX(), 90, 'x + width should be aligned with right edge');
        });
      });
    });

    suite('horizontal flyout', function() {
      setup(function() {
        this.workspace = Blockly.inject('blocklyDiv',
            {
              toolbox: this.toolboxXml,
              horizontalLayout: true,
            });
      });
      teardown(function() {
        workspaceTeardown.call(this, this.workspace);
      });
      suite('simple flyout', function() {
        setup(function() {
          this.flyout = this.workspace.getFlyout();
        });
        test('x is always 0', function() {
          chai.assert.equal(this.flyout.getX(), 0, 'x coordinate in horizontal flyout should be 0');
        });
        test('y is 0 if flyout at top', function() {
          this.flyout.targetWorkspace.toolboxPosition = Blockly.TOOLBOX_AT_TOP;
          this.flyout.toolboxPosition_ = Blockly.TOOLBOX_AT_TOP;
          chai.assert.equal(this.flyout.getY(), 0, 'y should be 0 if flyout is at the top');
        });
        test('y is below workspace if flyout at bottom', function() {
          this.flyout.targetWorkspace.toolboxPosition = Blockly.TOOLBOX_AT_BOTTOM;
          this.flyout.toolboxPosition_ = Blockly.TOOLBOX_AT_BOTTOM;
          sinon.stub(this.flyout.targetWorkspace, 'getMetrics').returns({
            viewHeight: 50,
          });
          chai.assert.equal(this.flyout.getY(), 50, 'y should be below the workspace');
        });
      });
      suite('toolbox flyout', function() {
        setup(function() {
          var toolbox = document.getElementById('toolbox-categories');
          this.workspace = Blockly.inject('blocklyDiv',
              {
                toolbox: toolbox,
                horizontalLayout: true,
              });
          this.flyout = this.workspace.getToolbox().getFlyout();
        });
        teardown(function() {
          workspaceTeardown.call(this, this.workspace);
        });
        test('y is aligned with toolbox at top', function() {
          sinon.stub(this.flyout.targetWorkspace, 'getMetrics').returns({
            toolboxHeight: 20,
          });
          this.flyout.targetWorkspace.toolboxPosition = Blockly.TOOLBOX_AT_TOP;
          this.flyout.toolboxPosition_ = Blockly.TOOLBOX_AT_TOP;
          chai.assert.equal(this.flyout.getY(), 20, 'y should be aligned with toolbox');
        });
        test('y is aligned with toolbox at bottom', function() {
          sinon.stub(this.flyout.targetWorkspace, 'getMetrics').returns({
            toolboxHeight: 20,
            viewHeight: 100,
          });
          this.flyout.height_ = 30;
          this.flyout.targetWorkspace.toolboxPosition = Blockly.TOOLBOX_AT_BOTTOM;
          this.flyout.toolboxPosition_ = Blockly.TOOLBOX_AT_BOTTOM;
          chai.assert.equal(this.flyout.getY(), 70, 'y + height should be aligned with toolbox');
        });
      });
      // These tests simulate a trashcan flyout, i.e. the flyout under test is on the
      // opposite side of the workspace toolbox setting.
      suite('trashcan flyout', function() {
        setup(function() {
          this.flyout = this.workspace.getFlyout();
        });
        test('y is 0 if trashcan at top', function() {
          this.flyout.targetWorkspace.toolboxPosition = Blockly.TOOLBOX_AT_BOTTOM;
          this.flyout.toolboxPosition_ = Blockly.TOOLBOX_AT_TOP;
          chai.assert.equal(this.flyout.getY(), 0, 'y should be aligned with top');
        });
        test('trashcan on bottom covers bottom of workspace', function() {
          this.flyout.targetWorkspace.toolboxPosition = Blockly.TOOLBOX_AT_TOP;
          this.flyout.toolboxPosition_ = Blockly.TOOLBOX_AT_BOTTOM;
          sinon.stub(this.flyout.targetWorkspace, 'getMetrics').returns({
            viewHeight: 50,
            absoluteTop: 10,
          });
          this.flyout.height_ = 20;
          chai.assert.equal(this.flyout.getY(), 40, 'y + height should be aligned with bottom');
        });
      });
    });
  });

  suite('createFlyoutInfo_', function() {
    setup(function() {
      this.simpleToolboxJSON = getSimpleJSON();
      this.flyout = this.workspace.getFlyout();
      this.createFlyoutSpy = sinon.spy(this.flyout, 'createFlyoutInfo_');

    });

    function checkLayoutContents(actual, expected, opt_message) {
      chai.assert.equal(actual.length, expected.length, opt_message);
      for (var i = 0; i < actual.length; i++) {
        chai.assert.equal(actual[i].type, expected[i].type, opt_message);
        if (actual[i].type == 'BLOCK') {
          chai.assert.typeOf(actual[i]['block'], 'Blockly.Block');
        } else if (actual[i].type == 'BUTTON' || actual[i].type == 'LABEL') {
          chai.assert.typeOf(actual[i]['block'], 'Blockly.FlyoutButton');
        }
      }
    }

    function checkFlyoutInfo(flyoutSpy) {
      var expectedContents = [
        {type: "block"},
        {type: "button"},
        {type: "button"}
      ];
      var expectedGaps = [20,24,24];
      var flyoutInfo = flyoutSpy.returnValues[0];
      var contents = flyoutInfo.contents;
      var gaps = flyoutInfo.gaps;
      chai.assert.deepEqual(gaps, expectedGaps);
      checkLayoutContents(contents, expectedContents, 'Contents');
    }

    test('Node', function() {
      this.flyout.show(this.toolboxXml);
      checkFlyoutInfo(this.createFlyoutSpy);
    });
    test('NodeList', function() {
      var nodeList = document.getElementById('toolbox-simple').childNodes;
      this.flyout.show(nodeList);
      checkFlyoutInfo(this.createFlyoutSpy);
    });
    test('Array of JSON', function() {
      this.flyout.show(this.simpleToolboxJSON);
      checkFlyoutInfo(this.createFlyoutSpy);
    });
    test('Array of xml', function() {
      this.flyout.show(getXmlArray());
      checkFlyoutInfo(this.createFlyoutSpy);
    });
    test('Custom Toolbox: No Category Available', function() {
      chai.assert.throws(function() {
        this.flyout.show('someString');
      }.bind(this), 'Couldn\'t find a callback function when opening' +
          ' a toolbox category.');
    });
    test('Custom Toolbox: Function does not return array', function() {
      sinon.stub(this.flyout.workspace_.targetWorkspace,
          'getToolboxCategoryCallback').returns(function(){return null;});
      chai.assert.throws(function() {
        this.flyout.show('someString');
      }.bind(this), 'Result of toolbox category callback must be an array.');
    });
    test('Custom Toolbox: Returns Array', function() {
      sinon.stub(this.flyout.workspace_.targetWorkspace,
          'getToolboxCategoryCallback').returns(function(){return getXmlArray();});
      chai.assert.doesNotThrow(function() {
        this.flyout.show('someString');
      }.bind(this));
    });
  });
});
