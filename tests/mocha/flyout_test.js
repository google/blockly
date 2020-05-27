/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('Flyout', function() {
  setup(function() {
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
    this.workspace.dispose();
    delete Blockly.Blocks['basic_block'];
    sinon.restore();
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
