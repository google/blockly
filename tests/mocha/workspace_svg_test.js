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
    function resetEventHistory(eventsFireStub, changeListenerSpy) {
      eventsFireStub.resetHistory();
      changeListenerSpy.resetHistory();
    }
    function assertSpyFiredViewportEvent(spy, workspace, expectedProperties) {
      assertEventFired(
          spy, Blockly.Events.Ui, {element: 'viewport'},
          workspace.id, null);
      assertEventFired(spy, Blockly.Events.Ui, expectedProperties,
          workspace.id, null);
    }
    function assertViewportEventFired(eventsFireStub, changeListenerSpy,
        workspace, expectedEventCount = 1) {
      var metrics = workspace.getMetrics();
      var expectedProperties = {
        element: 'viewport',
        newValue: {scale: workspace.scale, top: metrics.viewTop,
          left: metrics.viewLeft}
      };
      assertSpyFiredViewportEvent(
          eventsFireStub, workspace, expectedProperties);
      assertSpyFiredViewportEvent(
          changeListenerSpy, workspace,expectedProperties);
      sinon.assert.callCount(changeListenerSpy, expectedEventCount);
      sinon.assert.callCount(eventsFireStub, expectedEventCount);
    }
    function runViewportEventTest(eventTriggerFunc, eventsFireStub,
        changeListenerSpy, workspace, clock, expectedEventCount = 1) {
      clock.runAll();
      resetEventHistory(eventsFireStub, changeListenerSpy, this.clock);
      eventTriggerFunc();
      assertViewportEventFired(
          eventsFireStub, changeListenerSpy, workspace, expectedEventCount);
    }
    setup(function() {
      defineStackBlock();
      this.changeListenerSpy = createFireChangeListenerSpy(this.workspace);
    });
    teardown(function() {
      delete Blockly.Blocks['stack_block'];
    });

    test.skip('inject', function() {
      // TODO: Address and remove before merging PR
      // How do we want this to behave?
      // Change listeners are attached after resizes, but events are disabled
      // so viewport event is fired, but not listened to (at this time).
      workspaceTeardown.call(this, this.workspace);
      var workspace = Blockly.inject('blocklyDiv');
      try {
        this.clock.runAll();
        assertViewportEventFired(
            this.eventsFireStub, this.changeListenerSpy, workspace);
      } finally {
        workspaceTeardown.call(this, workspace);
      }
    });
    test('dispose fires no viewport event', function() {
      // TODO: Address and remove before merging PR
      // Do we want this test?
      this.eventsFireStub.resetHistory();
      this.changeListenerSpy.resetHistory();
      this.workspace.dispose();
      assertEventNotFired(
          this.changeListenerSpy, Blockly.Events.Ui, {element: 'viewport'});
    });

    suite('zoom', function() {
      test('setScale', function() {
        runViewportEventTest(() => this.workspace.setScale(2),
            this.eventsFireStub, this.changeListenerSpy, this.workspace,
            this.clock);
      });
      test('zoom(50, 50, 1)', function() {
        runViewportEventTest(() => this.workspace.zoom(50, 50, 1),
            this.eventsFireStub, this.changeListenerSpy, this.workspace,
            this.clock);
      });
      test('zoom(50, 50, -1)', function() {
        runViewportEventTest(() => this.workspace.zoom(50, 50, -1),
            this.eventsFireStub, this.changeListenerSpy, this.workspace,
            this.clock);
      });
      test('zoomCenter(1)', function() {
        runViewportEventTest(() => this.workspace.zoomCenter(1),
            this.eventsFireStub, this.changeListenerSpy, this.workspace,
            this.clock);
      });
      test('zoomCenter(-1)', function() {
        runViewportEventTest(() => this.workspace.zoomCenter(-1),
            this.eventsFireStub, this.changeListenerSpy, this.workspace,
            this.clock);
      });
      test('zoomToFit', function() {
        var block = this.workspace.newBlock('stack_block');
        block.initSvg();
        block.render();
        runViewportEventTest(() => this.workspace.zoomToFit(),
            this.eventsFireStub, this.changeListenerSpy, this.workspace,
            this.clock);
      });
    });
    suite('scroll', function() {
      test('centerOnBlock', function() {
        var block = this.workspace.newBlock('stack_block');
        block.initSvg();
        block.render();
        runViewportEventTest(() => this.workspace.zoomToFit(block.id),
            this.eventsFireStub, this.changeListenerSpy, this.workspace,
            this.clock);
      });
      test('scroll', function() {
        runViewportEventTest(() => this.workspace.scroll(50, 50),
            this.eventsFireStub, this.changeListenerSpy, this.workspace,
            this.clock);
      });
      test('scrollCenter', function() {
        runViewportEventTest(() => this.workspace.scrollCenter(),
            this.eventsFireStub, this.changeListenerSpy, this.workspace,
            this.clock);
      });
      test('translate', function() {
        runViewportEventTest(() => this.workspace.translate(50, 50),
            this.eventsFireStub, this.changeListenerSpy, this.workspace,
            this.clock);
      });
      test('block render that triggers scroll', function() {
        var block = this.workspace.newBlock('stack_block');
        var initAndRenderBlock = () => {
          block.initSvg();
          block.render();
        };
        runViewportEventTest(initAndRenderBlock, this.eventsFireStub,
            this.changeListenerSpy, this.workspace, this.clock);
      });
      test.skip('block render that doesn\'t trigger scroll' , function() {
        // TODO: implement before merging
        var block = this.workspace.newBlock('stack_block');
        var initAndRenderBlock = () => {
          block.initSvg();
          block.render();
        };
        runViewportEventTest(initAndRenderBlock, this.eventsFireStub,
            this.changeListenerSpy, this.workspace, this.clock);
      });
      test.skip('paste that triggers scroll', function() {
        // TODO: implement before merging
      });
      test.skip('paste that doesn\'t triggers scroll', function() {
        // TODO: implement before merging
      });
    });
    suite('resize', function() {
      test.skip('resize', function() {
        // TODO: implement before merging
        runViewportEventTest(() => this.workspace.resize(),
            this.eventsFireStub, this.changeListenerSpy, this.workspace,
            this.clock);
      });
      test.skip('resizeContents', function() {
        // TODO: implement before merging
        runViewportEventTest(() => this.workspace.resizeContents(),
            this.eventsFireStub, this.changeListenerSpy, this.workspace,
            this.clock);
      });
    });
  });

  suite('Workspace Base class', function() {
    testAWorkspace();
  });
});
