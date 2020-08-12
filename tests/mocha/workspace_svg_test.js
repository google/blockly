/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('WorkspaceSvg', function() {
  setup(function() {
    sharedTestSetup.call(this);
    var toolbox = document.getElementById('toolbox-categories');
    this.workspace = Blockly.inject('blocklyDiv', {toolbox: toolbox});
    Blockly.defineBlocksWithJsonArray([{
      'type': 'simple_test_block',
      'message0': 'simple test block',
      'output': null
    },
    {
      'type': 'test_val_in',
      'message0': 'test in %1',
      'args0': [
        {
          'type': 'input_value',
          'name': 'NAME'
        }
      ]
    }]);
  });

  teardown(function() {
    sharedTestTeardown.call(this);
    delete Blockly.Blocks['simple_test_block'];
    delete Blockly.Blocks['test_val_in'];
  });

  test('appendDomToWorkspace alignment', function() {
    var dom = Blockly.Xml.textToDom(
        '<xml xmlns="https://developers.google.com/blockly/xml">' +
        '  <block type="math_random_float" inline="true" x="21" y="23">' +
        '  </block>' +
        '</xml>');
    Blockly.Xml.appendDomToWorkspace(dom, this.workspace);
    chai.assert.equal(this.workspace.getAllBlocks(false).length, 1,
        'Block count');
    Blockly.Xml.appendDomToWorkspace(dom, this.workspace);
    chai.assert.equal(this.workspace.getAllBlocks(false).length, 2,
        'Block count');
    var blocks = this.workspace.getAllBlocks(false);
    chai.assert.equal(blocks[0].getRelativeToSurfaceXY().x, 21,
        'Block 1 position x');
    chai.assert.equal(blocks[0].getRelativeToSurfaceXY().y, 23,
        'Block 1 position y');
    chai.assert.equal(blocks[1].getRelativeToSurfaceXY().x, 21,
        'Block 2 position x');
    // Y separation value defined in appendDomToWorkspace as 10
    chai.assert.equal(blocks[1].getRelativeToSurfaceXY().y,
        23 + blocks[0].getHeightWidth().height + 10,
        'Block 2 position y');
  });

  test('Replacing shadow disposes svg', function() {
    var dom = Blockly.Xml.textToDom(
        '<xml xmlns="https://developers.google.com/blockly/xml">' +
        '<block type="test_val_in">' +
        '<value name="NAME">' +
        '<shadow type="simple_test_block"></shadow>' +
        '</value>' +
        '</block>' +
        '</xml>');

    Blockly.Xml.appendDomToWorkspace(dom, this.workspace);
    var blocks = this.workspace.getAllBlocks(false);
    chai.assert.equal(blocks.length, 2,'Block count');
    var shadowBlock = blocks[1];
    chai.assert.exists(shadowBlock.getSvgRoot());

    var block = this.workspace.newBlock('simple_test_block');
    block.initSvg();

    var inputConnection =
        this.workspace.getTopBlocks()[0].getInput('NAME').connection;
    inputConnection.connect(block.outputConnection);
    chai.assert.exists(block.getSvgRoot());
    chai.assert.notExists(shadowBlock.getSvgRoot());
  });

  suite('updateToolbox', function() {
    test('Passes in null when toolbox exists', function() {
      chai.assert.throws(function() {
        this.workspace.updateToolbox(null);
      }.bind(this), 'Can\'t nullify an existing toolbox.');
    });
    test('Passes in toolbox def when current toolbox is null', function() {
      this.workspace.options.languageTree = null;
      chai.assert.throws(function() {
        this.workspace.updateToolbox([]);
      }.bind(this), 'Existing toolbox is null.  Can\'t create new toolbox.');
    });
    test('Existing toolbox has no categories', function() {
      sinon.stub(Blockly.utils.toolbox, 'hasCategories').returns(true);
      this.workspace.toolbox_ = null;
      chai.assert.throws(function() {
        this.workspace.updateToolbox([]);
      }.bind(this), 'Existing toolbox has no categories.  Can\'t change mode.');
    });
    test('Existing toolbox has categories', function() {
      sinon.stub(Blockly.utils.toolbox, 'hasCategories').returns(false);
      this.workspace.flyout_ = null;
      chai.assert.throws(function() {
        this.workspace.updateToolbox([]);
      }.bind(this), 'Existing toolbox has categories.  Can\'t change mode.');
    });
    test('Passing in string as toolboxdef', function() {
      var parseToolboxFake = sinon.spy(Blockly.Options, 'parseToolboxTree');
      this.workspace.updateToolbox('<xml><category name="something"></category></xml>');
      sinon.assert.calledOnce(parseToolboxFake);
    });
  });

  suite.only('Viewport change events', function() {
    function assertViewportEvent(eventTriggerFunc, eventsFireStub,
        changeListenerSpy, workspace, expectedEventCount = 1) {
      eventsFireStub.resetHistory();
      changeListenerSpy.resetHistory();
      eventTriggerFunc();
      // Check viewport event was fired
      assertEventFired(
          eventsFireStub, Blockly.Events.Ui, {element: 'viewport'},
          workspace.id, null);
      assertEventFired(
          changeListenerSpy, Blockly.Events.Ui, {element: 'viewport'},
          workspace.id, null);
      // Check viewport event was fired with correct properties.
      var metrics = workspace.getMetrics();
      var expectedProperties = {
        element: 'viewport',
        newValue: {scale: workspace.scale, top: metrics.viewTop,
          left: metrics.viewLeft}
      };
      assertEventFired(eventsFireStub, Blockly.Events.Ui, expectedProperties,
          workspace.id, null);
      assertEventFired(changeListenerSpy, Blockly.Events.Ui, expectedProperties,
          workspace.id, null);
      // Assert that only one event was listened to.
      sinon.assert.callCount(changeListenerSpy, expectedEventCount);
    }
    setup(function() {
      defineStackBlock();
      this.changeListenerSpy = createFireChangeListenerSpy(this.workspace);
    });
    teardown(function() {
      delete Blockly.Blocks['stack_block'];
    });

    test('inject?', function() {
      // trigger scroll
      // expect event
      // compare metrics value
    });
    test('createDom?', function() {
      // trigger scroll
      // expect event
      // compare metrics value
    });
    test('dispose?', function() {
      // trigger scroll
      // expect event
      // compare metrics value
    });

    suite('zoom', function() {
      test('setScale', function() {
        assertViewportEvent(() => this.workspace.setScale(2),
            this.eventsFireStub, this.changeListenerSpy, this.workspace);
      });
      test('zoom(50, 50, 1)', function() {
        assertViewportEvent(() => this.workspace.zoom(50, 50, 1),
            this.eventsFireStub, this.changeListenerSpy, this.workspace);
      });
      test('zoom(50, 50, -1)', function() {
        assertViewportEvent(() => this.workspace.zoom(50, 50, -1),
            this.eventsFireStub, this.changeListenerSpy, this.workspace);
      });
      test('zoomCenter(1)', function() {
        assertViewportEvent(() => this.workspace.zoomCenter(1),
            this.eventsFireStub, this.changeListenerSpy, this.workspace);
      });
      test('zoomCenter(-1)', function() {
        assertViewportEvent(() => this.workspace.zoomCenter(-1),
            this.eventsFireStub, this.changeListenerSpy, this.workspace);
      });
      test('zoomToFit', function() {
        var block = this.workspace.newBlock('stack_block');
        block.initSvg();
        block.render();
        assertViewportEvent(() => this.workspace.zoomToFit(),
            this.eventsFireStub, this.changeListenerSpy, this.workspace);
      });
    });
    suite('scroll', function() {
      test('centerOnBlock', function() {
        var block = this.workspace.newBlock('stack_block');
        block.initSvg();
        block.render();
        assertViewportEvent(() => this.workspace.zoomToFit(block.id),
            this.eventsFireStub, this.changeListenerSpy, this.workspace);
      });
      test('scroll', function() {
        assertViewportEvent(() => this.workspace.scrollCenter(),
            this.eventsFireStub, this.changeListenerSpy, this.workspace);
      });
      test('scrollCenter', function() {
        assertViewportEvent(() => this.workspace.scrollCenter(),
            this.eventsFireStub, this.changeListenerSpy, this.workspace);
      });
      test('translate', function() {
        assertViewportEvent(() => this.workspace.translate(50, 50),
            this.eventsFireStub, this.changeListenerSpy, this.workspace);
      });
      test.skip('newBlock that triggers scroll', function() {
        // TODO
      });
      test.skip('paste that triggers scroll', function() {
        // TODO
      });
    });
    suite('resize', function() {
      test('resize', function() {
        assertViewportEvent(() => this.workspace.resize(),
            this.eventsFireStub, this.changeListenerSpy, this.workspace);
      });
      test('resizeContents', function() {
        assertViewportEvent(() => this.workspace.resizeContents(),
            this.eventsFireStub, this.changeListenerSpy, this.workspace);
      });

    });
  });

  suite('Workspace Base class', function() {
    testAWorkspace();
  });
});
