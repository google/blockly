/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.module('Blockly.test.workspaceSvg');

const {assertEventFired, assertEventNotFired, createFireChangeListenerSpy} = goog.require('Blockly.test.helpers.events');
const {assertVariableValues} = goog.require('Blockly.test.helpers.variables');
const {defineStackBlock} = goog.require('Blockly.test.helpers.blockDefinitions');
const eventUtils = goog.require('Blockly.Events.utils');
const {sharedTestSetup, sharedTestTeardown, workspaceTeardown} = goog.require('Blockly.test.helpers.setupTeardown');
const {testAWorkspace} = goog.require('Blockly.test.helpers.workspace');


suite('WorkspaceSvg', function() {
  setup(function() {
    sharedTestSetup.call(this);
    const toolbox = document.getElementById('toolbox-categories');
    this.workspace = Blockly.inject('blocklyDiv', {toolbox: toolbox});
    Blockly.defineBlocksWithJsonArray([{
      'type': 'simple_test_block',
      'message0': 'simple test block',
      'output': null,
    },
    {
      'type': 'test_val_in',
      'message0': 'test in %1',
      'args0': [
        {
          'type': 'input_value',
          'name': 'NAME',
        },
      ],
    }]);
  });

  teardown(function() {
    sharedTestTeardown.call(this);
  });

  test('dispose of WorkspaceSvg without dom throws no error', function() {
    const ws = new Blockly.WorkspaceSvg(new Blockly.Options({}));
    ws.dispose();
  });

  test('appendDomToWorkspace alignment', function() {
    const dom = Blockly.Xml.textToDom(
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
    const blocks = this.workspace.getAllBlocks(false);
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
    const dom = Blockly.Xml.textToDom(
        '<xml xmlns="https://developers.google.com/blockly/xml">' +
        '<block type="test_val_in">' +
        '<value name="NAME">' +
        '<shadow type="simple_test_block"></shadow>' +
        '</value>' +
        '</block>' +
        '</xml>');

    Blockly.Xml.appendDomToWorkspace(dom, this.workspace);
    const blocks = this.workspace.getAllBlocks(false);
    chai.assert.equal(blocks.length, 2, 'Block count');
    const shadowBlock = blocks[1];
    chai.assert.exists(shadowBlock.getSvgRoot());

    const block = this.workspace.newBlock('simple_test_block');
    block.initSvg();

    const inputConnection =
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
        this.workspace.updateToolbox({'contents': []});
      }.bind(this), 'Existing toolbox is null.  Can\'t create new toolbox.');
    });
    test('Existing toolbox has no categories', function() {
      sinon.stub(Blockly.utils.toolbox, 'hasCategories').returns(true);
      this.workspace.toolbox_ = null;
      chai.assert.throws(function() {
        this.workspace.updateToolbox({'contents': []});
      }.bind(this), 'Existing toolbox has no categories.  Can\'t change mode.');
    });
    test('Existing toolbox has categories', function() {
      sinon.stub(Blockly.utils.toolbox, 'hasCategories').returns(false);
      this.workspace.flyout_ = null;
      chai.assert.throws(function() {
        this.workspace.updateToolbox({'contents': []});
      }.bind(this), 'Existing toolbox has categories.  Can\'t change mode.');
    });
  });

  suite('addTopBlock', function() {
    setup(function() {
      this.targetWorkspace = new Blockly.Workspace();
      this.workspace.isFlyout = true;
      this.workspace.targetWorkspace = this.targetWorkspace;
      Blockly.defineBlocksWithJsonArray([{
        "type": "get_var_block",
        "message0": "%1",
        "args0": [
          {
            "type": "field_variable",
            "name": "VAR",
            "variableTypes": ["", "type1", "type2"],
          },
        ],
      }]);
    });

    teardown(function() {
      // Have to dispose of the main workspace after the flyout workspace
      // because it holds the variable map.
      // Normally the main workspace disposes of the flyout workspace.
      workspaceTeardown.call(this, this.targetWorkspace);
    });

    test('Trivial Flyout is True', function() {
      this.targetWorkspace.createVariable('name1', '', '1');

      // Flyout.init usually does this binding.
      this.workspace.variableMap_ = this.targetWorkspace.getVariableMap();

      Blockly.Events.disable();
      const block = new Blockly.Block(this.workspace, 'get_var_block');
      block.inputList[0].fieldRow[0].setValue('1');
      Blockly.Events.enable();

      this.workspace.removeTopBlock(block);
      this.workspace.addTopBlock(block);
      assertVariableValues(this.workspace, 'name1', '', '1');
    });
  });

  suite('Viewport change events', function() {
    function resetEventHistory(eventsFireStub, changeListenerSpy) {
      eventsFireStub.resetHistory();
      changeListenerSpy.resetHistory();
    }
    function assertSpyFiredViewportEvent(spy, workspace, expectedProperties) {
      assertEventFired(
          spy, Blockly.Events.ViewportChange, expectedProperties,
          workspace.id);
      assertEventFired(spy, Blockly.Events.ViewportChange, expectedProperties,
          workspace.id);
    }
    function assertViewportEventFired(eventsFireStub, changeListenerSpy,
        workspace, expectedEventCount = 1) {
      const metrics = workspace.getMetrics();
      const expectedProperties = {
        scale: workspace.scale,
        oldScale: 1,
        viewTop: metrics.viewTop,
        viewLeft: metrics.viewLeft,
        type: eventUtils.VIEWPORT_CHANGE,
      };
      assertSpyFiredViewportEvent(
          eventsFireStub, workspace, expectedProperties);
      assertSpyFiredViewportEvent(
          changeListenerSpy, workspace, expectedProperties);
      sinon.assert.callCount(changeListenerSpy, expectedEventCount);
      sinon.assert.callCount(eventsFireStub, expectedEventCount);
    }
    function runViewportEventTest(eventTriggerFunc, eventsFireStub,
        changeListenerSpy, workspace, clock, expectedEventCount = 1) {
      clock.runAll();
      resetEventHistory(eventsFireStub, changeListenerSpy);
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
        const block = this.workspace.newBlock('stack_block');
        block.initSvg();
        block.render();
        runViewportEventTest(() => this.workspace.zoomToFit(),
            this.eventsFireStub, this.changeListenerSpy, this.workspace,
            this.clock);
      });
    });
    suite('scroll', function() {
      test('centerOnBlock', function() {
        const block = this.workspace.newBlock('stack_block');
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
    });
    suite('Blocks triggering viewport changes', function() {
      test('block move that triggers scroll', function() {
        const block = this.workspace.newBlock('stack_block');
        block.initSvg();
        block.render();
        this.clock.runAll();
        resetEventHistory(this.eventsFireStub, this.changeListenerSpy);
        // Expect 2 events, 1 move, 1 viewport
        runViewportEventTest(() => {
          block.moveBy(1000, 1000);
        }, this.eventsFireStub, this.changeListenerSpy, this.workspace,
        this.clock, 2);
      });
      test('domToWorkspace that doesn\'t trigger scroll', function() {
        // 4 blocks with space in center.
        Blockly.Xml.domToWorkspace(
            Blockly.Xml.textToDom(
                '<xml xmlns="https://developers.google.com/blockly/xml">' +
                '<block type="controls_if" x="88" y="88"></block>' +
                '<block type="controls_if" x="288" y="88"></block>' +
                '<block type="controls_if" x="88" y="238"></block>' +
                '<block type="controls_if" x="288" y="238"></block>' +
                '</xml>'),
            this.workspace);
        const xmlDom = Blockly.Xml.textToDom(
            '<block type="controls_if" x="188" y="163"></block>');
        this.clock.runAll();
        resetEventHistory(this.eventsFireStub, this.changeListenerSpy);
        // Add block in center of other blocks, not triggering scroll.
        Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(
            '<block type="controls_if" x="188" y="163"></block>'), this.workspace);
        this.clock.runAll();
        assertEventNotFired(
            this.eventsFireStub, Blockly.Events.ViewportChange, {type: eventUtils.VIEWPORT_CHANGE});
        assertEventNotFired(
            this.changeListenerSpy, Blockly.Events.ViewportChange,
            {type: eventUtils.VIEWPORT_CHANGE});
      });
      test('domToWorkspace at 0,0 that doesn\'t trigger scroll', function() {
        // 4 blocks with space in center.
        Blockly.Xml.domToWorkspace(
            Blockly.Xml.textToDom(
                '<xml xmlns="https://developers.google.com/blockly/xml">' +
                '<block type="controls_if" x="-75" y="-72"></block>' +
                '<block type="controls_if" x="75" y="-72"></block>' +
                '<block type="controls_if" x="-75" y="75"></block>' +
                '<block type="controls_if" x="75" y="75"></block>' +
                '</xml>'),
            this.workspace);
        const xmlDom = Blockly.Xml.textToDom(
            '<block type="controls_if" x="0" y="0"></block>');
        this.clock.runAll();
        resetEventHistory(this.eventsFireStub, this.changeListenerSpy);
        // Add block in center of other blocks, not triggering scroll.
        Blockly.Xml.domToWorkspace(xmlDom, this.workspace);
        this.clock.runAll();
        assertEventNotFired(
            this.eventsFireStub, Blockly.Events.ViewportChange,
            {type: eventUtils.VIEWPORT_CHANGE});
        assertEventNotFired(
            this.changeListenerSpy, Blockly.Events.ViewportChange,
            {type: eventUtils.VIEWPORT_CHANGE});
      });
      test.skip('domToWorkspace multiple blocks triggers one viewport event', function() {
        // TODO: Un-skip after adding filtering for consecutive viewport events.
        const addingMultipleBlocks = () => {
          Blockly.Xml.domToWorkspace(
              Blockly.Xml.textToDom(
                  '<xml xmlns="https://developers.google.com/blockly/xml">' +
                  '<block type="controls_if" x="88" y="88"></block>' +
                  '<block type="controls_if" x="288" y="88"></block>' +
                  '<block type="controls_if" x="88" y="238"></block>' +
                  '<block type="controls_if" x="288" y="238"></block>' +
                  '</xml>'),
              this.workspace);
        };
        // Expect 10 events, 4 create, 4 move, 1 viewport, 1 finished loading
        runViewportEventTest(addingMultipleBlocks, this.eventsFireStub,
            this.changeListenerSpy, this.workspace, this.clock, 10);
      });
    });
  });
  suite('Workspace Base class', function() {
    testAWorkspace();
  });
});
