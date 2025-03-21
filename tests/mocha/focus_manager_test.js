/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {FocusManager} from '../../build/src/core/focus_manager.js';
import {FocusableTreeTraverser} from '../../build/src/core/utils/focusable_tree_traverser.js';
import {assert} from '../../node_modules/chai/chai.js';
import {
  sharedTestSetup,
  sharedTestTeardown,
} from './test_helpers/setup_teardown.js';

suite('FocusManager', function () {
  setup(function () {
    sharedTestSetup.call(this);

    const testState = this;
    const addDocumentEventListener = function (type, listener) {
      testState.globalDocumentEventListenerType = type;
      testState.globalDocumentEventListener = listener;
      document.addEventListener(type, listener);
    };
    this.focusManager = new FocusManager(addDocumentEventListener);

    const FocusableNodeImpl = function (element, tree) {
      this.getFocusableElement = function () {
        return element;
      };

      this.getFocusableTree = function () {
        return tree;
      };
    };
    const FocusableTreeImpl = function (rootElement) {
      this.idToNodeMap = {};

      this.addNode = function (element) {
        const node = new FocusableNodeImpl(element, this);
        this.idToNodeMap[element.id] = node;
        return node;
      };

      this.getFocusedNode = function () {
        return FocusableTreeTraverser.findFocusedNode(this);
      };

      this.getRootFocusableNode = function () {
        return this.rootNode;
      };

      this.findFocusableNodeFor = function (element) {
        return FocusableTreeTraverser.findFocusableNodeFor(
          element,
          this,
          (id) => this.idToNodeMap[id],
        );
      };

      this.rootNode = this.addNode(rootElement);
    };

    const createFocusableTree = function (rootElementId) {
      return new FocusableTreeImpl(document.getElementById(rootElementId));
    };
    const createFocusableNode = function (tree, elementId) {
      return tree.addNode(document.getElementById(elementId));
    };

    this.testFocusableTree1 = createFocusableTree('testFocusableTree1');
    this.testFocusableTree1Node1 = createFocusableNode(
      this.testFocusableTree1,
      'testFocusableTree1.node1',
    );
    this.testFocusableTree1Node1Child1 = createFocusableNode(
      this.testFocusableTree1,
      'testFocusableTree1.node1.child1',
    );
    this.testFocusableTree1Node2 = createFocusableNode(
      this.testFocusableTree1,
      'testFocusableTree1.node2',
    );
    this.testFocusableTree2 = createFocusableTree('testFocusableTree2');
    this.testFocusableTree2Node1 = createFocusableNode(
      this.testFocusableTree2,
      'testFocusableTree2.node1',
    );
    this.testFocusableGroup1 = createFocusableTree('testFocusableGroup1');
    this.testFocusableGroup1Node1 = createFocusableNode(
      this.testFocusableGroup1,
      'testFocusableGroup1.node1',
    );
    this.testFocusableGroup1Node1Child1 = createFocusableNode(
      this.testFocusableGroup1,
      'testFocusableGroup1.node1.child1',
    );
    this.testFocusableGroup1Node2 = createFocusableNode(
      this.testFocusableGroup1,
      'testFocusableGroup1.node2',
    );
    this.testFocusableGroup2 = createFocusableTree('testFocusableGroup2');
    this.testFocusableGroup2Node1 = createFocusableNode(
      this.testFocusableGroup2,
      'testFocusableGroup2.node1',
    );
  });

  teardown(function () {
    sharedTestTeardown.call(this);

    // Remove the globally registered listener from FocusManager to avoid state being shared across
    // test boundaries.
    const eventType = this.globalDocumentEventListenerType;
    const eventListener = this.globalDocumentEventListener;
    document.removeEventListener(eventType, eventListener);

    const removeFocusIndicators = function (element) {
      element.classList.remove('blocklyActiveFocus', 'blocklyPassiveFocus');
    };

    // Ensure all node CSS styles are reset so that state isn't leaked between tests.
    removeFocusIndicators(document.getElementById('testFocusableTree1'));
    removeFocusIndicators(document.getElementById('testFocusableTree1.node1'));
    removeFocusIndicators(
      document.getElementById('testFocusableTree1.node1.child1'),
    );
    removeFocusIndicators(document.getElementById('testFocusableTree1.node2'));
    removeFocusIndicators(document.getElementById('testFocusableTree2'));
    removeFocusIndicators(document.getElementById('testFocusableTree2.node1'));
    removeFocusIndicators(document.getElementById('testFocusableGroup1'));
    removeFocusIndicators(document.getElementById('testFocusableGroup1.node1'));
    removeFocusIndicators(
      document.getElementById('testFocusableGroup1.node1.child1'),
    );
    removeFocusIndicators(document.getElementById('testFocusableGroup1.node2'));
    removeFocusIndicators(document.getElementById('testFocusableGroup2'));
    removeFocusIndicators(document.getElementById('testFocusableGroup2.node1'));
  });

  /* Basic lifecycle tests. */

  suite('registerTree()', function () {
    test('once does not throw', function () {
      this.focusManager.registerTree(this.testFocusableTree1);

      // The test should pass due to no exception being thrown.
    });

    test('twice for same tree throws error', function () {
      this.focusManager.registerTree(this.testFocusableTree1);

      const errorMsgRegex =
        /Attempted to re-register already registered tree.+?/;
      assert.throws(
        () => this.focusManager.registerTree(this.testFocusableTree1),
        errorMsgRegex,
      );
    });

    test('twice with different trees does not throw', function () {
      this.focusManager.registerTree(this.testFocusableTree1);
      this.focusManager.registerTree(this.testFocusableGroup1);

      // The test shouldn't throw since two different trees were registered.
    });

    test('register after an unregister does not throw', function () {
      this.focusManager.registerTree(this.testFocusableTree1);
      this.focusManager.unregisterTree(this.testFocusableTree1);

      this.focusManager.registerTree(this.testFocusableTree1);

      // The second register should not fail since the tree was previously unregistered.
    });
  });

  suite('unregisterTree()', function () {
    test('for not yet registered tree throws', function () {
      const errorMsgRegex = /Attempted to unregister not registered tree.+?/;
      assert.throws(
        () => this.focusManager.unregisterTree(this.testFocusableTree1),
        errorMsgRegex,
      );
    });

    test('for registered tree does not throw', function () {
      this.focusManager.registerTree(this.testFocusableTree1);

      this.focusManager.unregisterTree(this.testFocusableTree1);

      // Unregistering a registered tree should not fail.
    });

    test('twice for registered tree throws', function () {
      this.focusManager.registerTree(this.testFocusableTree1);
      this.focusManager.unregisterTree(this.testFocusableTree1);

      const errorMsgRegex = /Attempted to unregister not registered tree.+?/;
      assert.throws(
        () => this.focusManager.unregisterTree(this.testFocusableTree1),
        errorMsgRegex,
      );
    });
  });

  suite('isRegistered()', function () {
    test('for not registered tree returns false', function () {
      const isRegistered = this.focusManager.isRegistered(
        this.testFocusableTree1,
      );

      assert.isFalse(isRegistered);
    });

    test('for registered tree returns true', function () {
      this.focusManager.registerTree(this.testFocusableTree1);

      const isRegistered = this.focusManager.isRegistered(
        this.testFocusableTree1,
      );

      assert.isTrue(isRegistered);
    });

    test('for unregistered tree returns false', function () {
      this.focusManager.registerTree(this.testFocusableTree1);
      this.focusManager.unregisterTree(this.testFocusableTree1);

      const isRegistered = this.focusManager.isRegistered(
        this.testFocusableTree1,
      );

      assert.isFalse(isRegistered);
    });

    test('for re-registered tree returns true', function () {
      this.focusManager.registerTree(this.testFocusableTree1);
      this.focusManager.unregisterTree(this.testFocusableTree1);
      this.focusManager.registerTree(this.testFocusableTree1);

      const isRegistered = this.focusManager.isRegistered(
        this.testFocusableTree1,
      );

      assert.isTrue(isRegistered);
    });
  });

  suite('getFocusedTree()', function () {
    test('by default returns null', function () {
      const focusedTree = this.focusManager.getFocusedTree();

      assert.isNull(focusedTree);
    });
  });

  suite('getFocusedNode()', function () {
    test('by default returns null', function () {
      const focusedNode = this.focusManager.getFocusedNode();

      assert.isNull(focusedNode);
    });
  });

  suite('focusTree()', function () {
    test('for not registered tree throws', function () {
      const errorMsgRegex = /Attempted to focus unregistered tree.+?/;
      assert.throws(
        () => this.focusManager.focusTree(this.testFocusableTree1),
        errorMsgRegex,
      );
    });

    test('for unregistered tree throws', function () {
      this.focusManager.registerTree(this.testFocusableTree1);
      this.focusManager.unregisterTree(this.testFocusableTree1);

      const errorMsgRegex = /Attempted to focus unregistered tree.+?/;
      assert.throws(
        () => this.focusManager.focusTree(this.testFocusableTree1),
        errorMsgRegex,
      );
    });
  });

  suite('focusNode()', function () {
    test('for not registered node throws', function () {
      const errorMsgRegex = /Attempted to focus unregistered node.+?/;
      assert.throws(
        () => this.focusManager.focusNode(this.testFocusableTree1Node1),
        errorMsgRegex,
      );
    });

    test('for unregistered node throws', function () {
      this.focusManager.registerTree(this.testFocusableTree1);
      this.focusManager.unregisterTree(this.testFocusableTree1);

      const errorMsgRegex = /Attempted to focus unregistered node.+?/;
      assert.throws(
        () => this.focusManager.focusNode(this.testFocusableTree1Node1),
        errorMsgRegex,
      );
    });
  });

  /* Focus tests for HTML trees. */

  suite('focus*() switching in HTML tree', function () {
    suite('getFocusedTree()', function () {
      test('registered tree focusTree()ed no prev focus returns tree', function () {
        this.focusManager.registerTree(this.testFocusableTree1);

        this.focusManager.focusTree(this.testFocusableTree1);

        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableTree1,
        );
      });

      test('registered tree focusTree()ed prev node focused returns tree', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.focusNode(this.testFocusableTree1Node1);

        this.focusManager.focusTree(this.testFocusableTree1);

        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableTree1,
        );
      });

      test('registered tree focusTree()ed diff tree prev focused returns new tree', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.registerTree(this.testFocusableTree2);
        this.focusManager.focusTree(this.testFocusableTree1);

        this.focusManager.focusTree(this.testFocusableTree2);

        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableTree2,
        );
      });

      test('registered tree focusTree()ed diff tree node prev focused returns new tree', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.registerTree(this.testFocusableTree2);
        this.focusManager.focusNode(this.testFocusableTree1Node1);

        this.focusManager.focusTree(this.testFocusableTree2);

        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableTree2,
        );
      });

      test('registered root focusNode()ed no prev focus returns tree', function () {
        this.focusManager.registerTree(this.testFocusableTree1);

        this.focusManager.focusNode(
          this.testFocusableTree1.getRootFocusableNode(),
        );

        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableTree1,
        );
      });

      test("registered node focusNode()ed no prev focus returns node's tree", function () {
        this.focusManager.registerTree(this.testFocusableTree1);

        this.focusManager.focusNode(this.testFocusableTree1Node1);

        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableTree1,
        );
      });

      test("registered subnode focusNode()ed no prev focus returns node's tree", function () {
        this.focusManager.registerTree(this.testFocusableTree1);

        this.focusManager.focusNode(this.testFocusableTree1Node1Child1);

        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableTree1,
        );
      });

      test('registered node focusNode()ed after prev node focus returns same tree', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.focusNode(this.testFocusableTree1Node1);

        this.focusManager.focusNode(this.testFocusableTree1Node2);

        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableTree1,
        );
      });

      test("registered node focusNode()ed after prev node focus diff tree returns new node's tree", function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.registerTree(this.testFocusableTree2);
        this.focusManager.focusNode(this.testFocusableTree1Node1);

        this.focusManager.focusNode(this.testFocusableTree2Node1);

        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableTree2,
        );
      });

      test("registered tree root focusNode()ed after prev node focus diff tree returns new node's tree", function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.registerTree(this.testFocusableTree2);
        this.focusManager.focusNode(this.testFocusableTree1Node1);

        this.focusManager.focusNode(
          this.testFocusableTree2.getRootFocusableNode(),
        );

        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableTree2,
        );
      });

      test('unregistered tree focusTree()ed with no prev focus returns null', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.focusTree(this.testFocusableTree1);

        this.focusManager.unregisterTree(this.testFocusableTree1);

        assert.isNull(this.focusManager.getFocusedTree());
      });

      test('unregistered tree focusNode()ed with no prev focus returns null', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.focusNode(this.testFocusableTree1Node1);

        this.focusManager.unregisterTree(this.testFocusableTree1);

        assert.isNull(this.focusManager.getFocusedTree());
      });

      test('unregistered tree focusNode()ed with prev node prior focused returns null', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.registerTree(this.testFocusableTree2);
        this.focusManager.focusNode(this.testFocusableTree2Node1);
        this.focusManager.focusNode(this.testFocusableTree1Node1);

        this.focusManager.unregisterTree(this.testFocusableTree1);

        // Since the more recent tree was removed, there's no tree currently focused.
        assert.isNull(this.focusManager.getFocusedTree());
      });

      test('unregistered tree focusNode()ed with prev node recently focused returns new tree', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.registerTree(this.testFocusableTree2);
        this.focusManager.focusNode(this.testFocusableTree1Node1);
        this.focusManager.focusNode(this.testFocusableTree2Node1);

        this.focusManager.unregisterTree(this.testFocusableTree1);

        // Since the most recent tree still exists, it still has focus.
        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableTree2,
        );
      });
    });
    suite('getFocusedNode()', function () {
      test('registered tree focusTree()ed no prev focus returns root node', function () {
        this.focusManager.registerTree(this.testFocusableTree1);

        this.focusManager.focusTree(this.testFocusableTree1);

        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableTree1.getRootFocusableNode(),
        );
      });

      test('registered tree focusTree()ed prev node focused returns original node', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.focusNode(this.testFocusableTree1Node1);

        this.focusManager.focusTree(this.testFocusableTree1);

        // The original node retains focus since the tree already holds focus (per focusTree's
        // contract).
        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableTree1Node1,
        );
      });

      test('registered tree focusTree()ed diff tree prev focused returns new root node', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.registerTree(this.testFocusableTree2);
        this.focusManager.focusTree(this.testFocusableTree1);

        this.focusManager.focusTree(this.testFocusableTree2);

        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableTree2.getRootFocusableNode(),
        );
      });

      test('registered tree focusTree()ed diff tree node prev focused returns new root node', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.registerTree(this.testFocusableTree2);
        this.focusManager.focusNode(this.testFocusableTree1Node1);

        this.focusManager.focusTree(this.testFocusableTree2);

        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableTree2.getRootFocusableNode(),
        );
      });

      test('registered root focusNode()ed no prev focus returns root node', function () {
        this.focusManager.registerTree(this.testFocusableTree1);

        this.focusManager.focusNode(
          this.testFocusableTree1.getRootFocusableNode(),
        );

        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableTree1.getRootFocusableNode(),
        );
      });

      test('registered node focusNode()ed no prev focus returns node', function () {
        this.focusManager.registerTree(this.testFocusableTree1);

        this.focusManager.focusNode(this.testFocusableTree1Node1);

        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableTree1Node1,
        );
      });

      test('registered subnode focusNode()ed no prev focus returns subnode', function () {
        this.focusManager.registerTree(this.testFocusableTree1);

        this.focusManager.focusNode(this.testFocusableTree1Node1Child1);

        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableTree1Node1Child1,
        );
      });

      test('registered node focusNode()ed after prev node focus returns new node', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.focusNode(this.testFocusableTree1Node1);

        this.focusManager.focusNode(this.testFocusableTree1Node2);

        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableTree1Node2,
        );
      });

      test('registered node focusNode()ed after prev node focus diff tree returns new node', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.registerTree(this.testFocusableTree2);
        this.focusManager.focusNode(this.testFocusableTree1Node1);

        this.focusManager.focusNode(this.testFocusableTree2Node1);

        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableTree2Node1,
        );
      });

      test('registered tree root focusNode()ed after prev node focus diff tree returns new root', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.registerTree(this.testFocusableTree2);
        this.focusManager.focusNode(this.testFocusableTree1Node1);

        this.focusManager.focusNode(
          this.testFocusableTree2.getRootFocusableNode(),
        );

        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableTree2.getRootFocusableNode(),
        );
      });

      test('unregistered tree focusTree()ed with no prev focus returns null', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.focusTree(this.testFocusableTree1);

        this.focusManager.unregisterTree(this.testFocusableTree1);

        assert.isNull(this.focusManager.getFocusedNode());
      });

      test('unregistered tree focusNode()ed with no prev focus returns null', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.focusNode(this.testFocusableTree1Node1);

        this.focusManager.unregisterTree(this.testFocusableTree1);

        assert.isNull(this.focusManager.getFocusedNode());
      });

      test('unregistered tree focusNode()ed with prev node prior focused returns null', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.registerTree(this.testFocusableTree2);
        this.focusManager.focusNode(this.testFocusableTree2Node1);
        this.focusManager.focusNode(this.testFocusableTree1Node1);

        this.focusManager.unregisterTree(this.testFocusableTree1);

        // Since the more recent tree was removed, there's no tree currently focused.
        assert.isNull(this.focusManager.getFocusedNode());
      });

      test('unregistered tree focusNode()ed with prev node recently focused returns new node', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.registerTree(this.testFocusableTree2);
        this.focusManager.focusNode(this.testFocusableTree1Node1);
        this.focusManager.focusNode(this.testFocusableTree2Node1);

        this.focusManager.unregisterTree(this.testFocusableTree1);

        // Since the most recent tree still exists, it still has focus.
        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableTree2Node1,
        );
      });
    });
    suite('CSS classes', function () {
      test('registered tree focusTree()ed no prev focus root elem has active property', function () {
        this.focusManager.registerTree(this.testFocusableTree1);

        this.focusManager.focusTree(this.testFocusableTree1);

        const rootElem = this.testFocusableTree1
          .getRootFocusableNode()
          .getFocusableElement();
        assert.include(Array.from(rootElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(rootElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('registered tree focusTree()ed prev node focused original elem has active property', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.focusNode(this.testFocusableTree1Node1);

        this.focusManager.focusTree(this.testFocusableTree1);

        // The original node retains active focus since the tree already holds focus (per
        // focusTree's contract).
        const nodeElem = this.testFocusableTree1Node1.getFocusableElement();
        assert.include(Array.from(nodeElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(nodeElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('registered tree focusTree()ed diff tree prev focused new root elem has active property', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.registerTree(this.testFocusableTree2);
        this.focusManager.focusTree(this.testFocusableTree1);

        this.focusManager.focusTree(this.testFocusableTree2);

        const rootElem = this.testFocusableTree2
          .getRootFocusableNode()
          .getFocusableElement();
        assert.include(Array.from(rootElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(rootElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('registered tree focusTree()ed diff tree node prev focused new root elem has active property', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.registerTree(this.testFocusableTree2);
        this.focusManager.focusNode(this.testFocusableTree1Node1);

        this.focusManager.focusTree(this.testFocusableTree2);

        const rootElem = this.testFocusableTree2
          .getRootFocusableNode()
          .getFocusableElement();
        assert.include(Array.from(rootElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(rootElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('registered root focusNode()ed no prev focus returns root elem has active property', function () {
        this.focusManager.registerTree(this.testFocusableTree1);

        this.focusManager.focusNode(
          this.testFocusableTree1.getRootFocusableNode(),
        );

        const rootElem = this.testFocusableTree1
          .getRootFocusableNode()
          .getFocusableElement();
        assert.include(Array.from(rootElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(rootElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('registered node focusNode()ed no prev focus node elem has active property', function () {
        this.focusManager.registerTree(this.testFocusableTree1);

        this.focusManager.focusNode(this.testFocusableTree1Node1);

        const nodeElem = this.testFocusableTree1Node1.getFocusableElement();
        assert.include(Array.from(nodeElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(nodeElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('registered node focusNode()ed after prev node focus same tree old node elem has no focus property', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.focusNode(this.testFocusableTree1Node1);

        this.focusManager.focusNode(this.testFocusableTree1Node2);

        const prevNodeElem = this.testFocusableTree1Node1.getFocusableElement();
        assert.notInclude(
          Array.from(prevNodeElem.classList),
          'blocklyActiveFocus',
        );
        assert.notInclude(
          Array.from(prevNodeElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('registered node focusNode()ed after prev node focus same tree new node elem has active property', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.focusNode(this.testFocusableTree1Node1);

        this.focusManager.focusNode(this.testFocusableTree1Node2);

        const newNodeElem = this.testFocusableTree1Node2.getFocusableElement();
        assert.include(Array.from(newNodeElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(newNodeElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('registered node focusNode()ed after prev node focus diff tree old node elem has passive property', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.registerTree(this.testFocusableTree2);
        this.focusManager.focusNode(this.testFocusableTree1Node1);

        this.focusManager.focusNode(this.testFocusableTree2Node1);

        const prevNodeElem = this.testFocusableTree1Node1.getFocusableElement();
        assert.notInclude(
          Array.from(prevNodeElem.classList),
          'blocklyActiveFocus',
        );
        assert.include(
          Array.from(prevNodeElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('registered node focusNode()ed after prev node focus diff tree new node elem has active property', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.registerTree(this.testFocusableTree2);
        this.focusManager.focusNode(this.testFocusableTree1Node1);

        this.focusManager.focusNode(this.testFocusableTree2Node1);

        const newNodeElem = this.testFocusableTree2Node1.getFocusableElement();
        assert.include(Array.from(newNodeElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(newNodeElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('registered tree root focusNode()ed after prev node focus diff tree new root has active property', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.registerTree(this.testFocusableTree2);
        this.focusManager.focusNode(this.testFocusableTree1Node1);

        this.focusManager.focusNode(
          this.testFocusableTree2.getRootFocusableNode(),
        );

        const rootElem = this.testFocusableTree2
          .getRootFocusableNode()
          .getFocusableElement();
        assert.include(Array.from(rootElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(rootElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('unregistered tree focusTree()ed with no prev focus removes focus', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.focusTree(this.testFocusableTree1);

        this.focusManager.unregisterTree(this.testFocusableTree1);

        // Since the tree was unregistered it no longer has focus indicators.
        const rootElem = this.testFocusableTree1
          .getRootFocusableNode()
          .getFocusableElement();
        assert.notInclude(Array.from(rootElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(rootElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('unregistered tree focusNode()ed with no prev focus removes focus', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.focusNode(this.testFocusableTree1Node1);

        this.focusManager.unregisterTree(this.testFocusableTree1);

        // Since the tree was unregistered it no longer has focus indicators.
        const nodeElem = this.testFocusableTree1Node1.getFocusableElement();
        assert.notInclude(Array.from(nodeElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(nodeElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('unregistered tree focusNode()ed with prev node prior removes focus from removed tree', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.registerTree(this.testFocusableTree2);
        this.focusManager.focusNode(this.testFocusableTree2Node1);
        this.focusManager.focusNode(this.testFocusableTree1Node1);

        this.focusManager.unregisterTree(this.testFocusableTree1);

        // Since the tree was unregistered it no longer has focus indicators. However, the old node
        // should still have passive indication.
        const otherNodeElem =
          this.testFocusableTree2Node1.getFocusableElement();
        const removedNodeElem =
          this.testFocusableTree1Node1.getFocusableElement();
        assert.include(
          Array.from(otherNodeElem.classList),
          'blocklyPassiveFocus',
        );
        assert.notInclude(
          Array.from(otherNodeElem.classList),
          'blocklyActiveFocus',
        );
        assert.notInclude(
          Array.from(removedNodeElem.classList),
          'blocklyActiveFocus',
        );
        assert.notInclude(
          Array.from(removedNodeElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('unregistered tree focusNode()ed with prev node recently removes focus from removed tree', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.registerTree(this.testFocusableTree2);
        this.focusManager.focusNode(this.testFocusableTree1Node1);
        this.focusManager.focusNode(this.testFocusableTree2Node1);

        this.focusManager.unregisterTree(this.testFocusableTree1);

        // Since the tree was unregistered it no longer has focus indicators. However, the new node
        // should still have active indication.
        const otherNodeElem =
          this.testFocusableTree2Node1.getFocusableElement();
        const removedNodeElem =
          this.testFocusableTree1Node1.getFocusableElement();
        assert.include(
          Array.from(otherNodeElem.classList),
          'blocklyActiveFocus',
        );
        assert.notInclude(
          Array.from(otherNodeElem.classList),
          'blocklyPassiveFocus',
        );
        assert.notInclude(
          Array.from(removedNodeElem.classList),
          'blocklyActiveFocus',
        );
        assert.notInclude(
          Array.from(removedNodeElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('focusNode() multiple nodes in same tree with switches ensure passive focus has gone', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.registerTree(this.testFocusableTree2);
        this.focusManager.focusNode(this.testFocusableTree1Node1);
        this.focusManager.focusNode(this.testFocusableTree2Node1);

        this.focusManager.focusNode(this.testFocusableTree1Node2);

        // When switching back to the first tree, ensure the original passive node is no longer
        // passive now that the new node is active.
        const node1 = this.testFocusableTree1Node1.getFocusableElement();
        const node2 = this.testFocusableTree1Node2.getFocusableElement();
        assert.notInclude(Array.from(node1.classList), 'blocklyPassiveFocus');
        assert.notInclude(Array.from(node2.classList), 'blocklyPassiveFocus');
      });

      test('registered tree focusTree()ed other tree node passively focused tree node now has active property', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.registerTree(this.testFocusableTree2);
        this.focusManager.focusNode(this.testFocusableTree1Node1);
        this.focusManager.focusNode(this.testFocusableTree2Node1);

        this.focusManager.focusTree(this.testFocusableTree1);

        // The original node in the tree should be moved from passive to active focus per the
        // contract of focusTree). Also, the root of the tree should have no focus indication.
        const nodeElem = this.testFocusableTree1Node1.getFocusableElement();
        const rootElem = this.testFocusableTree1
          .getRootFocusableNode()
          .getFocusableElement();
        assert.include(Array.from(nodeElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(nodeElem.classList),
          'blocklyPassiveFocus',
        );
        assert.notInclude(Array.from(rootElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(rootElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('focus on root, node in diff tree, then node in first tree; root should have focus gone', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.registerTree(this.testFocusableTree2);
        this.focusManager.focusTree(this.testFocusableTree1);
        this.focusManager.focusNode(this.testFocusableTree2Node1);

        this.focusManager.focusNode(this.testFocusableTree1Node1);

        const nodeElem = this.testFocusableTree1Node1.getFocusableElement();
        const rootElem = this.testFocusableTree1
          .getRootFocusableNode()
          .getFocusableElement();
        assert.include(Array.from(nodeElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(nodeElem.classList),
          'blocklyPassiveFocus',
        );
        assert.notInclude(Array.from(rootElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(rootElem.classList),
          'blocklyPassiveFocus',
        );
      });
    });
  });

  suite('DOM focus() switching in HTML tree', function () {
    suite('getFocusedTree()', function () {
      test('registered root focus()ed no prev focus returns tree', function () {
        this.focusManager.registerTree(this.testFocusableTree1);

        document.getElementById('testFocusableTree1').focus();

        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableTree1,
        );
      });

      test("registered node focus()ed no prev focus returns node's tree", function () {
        this.focusManager.registerTree(this.testFocusableTree1);

        document.getElementById('testFocusableTree1.node1').focus();

        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableTree1,
        );
      });

      test("registered subnode focus()ed no prev focus returns node's tree", function () {
        this.focusManager.registerTree(this.testFocusableTree1);

        document.getElementById('testFocusableTree1.node1.child1').focus();

        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableTree1,
        );
      });

      test('registered node focus()ed after prev node focus returns same tree', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        document.getElementById('testFocusableTree1.node1').focus();

        document.getElementById('testFocusableTree1.node2').focus();

        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableTree1,
        );
      });

      test("registered node focus()ed after prev node focus diff tree returns new node's tree", function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.registerTree(this.testFocusableTree2);
        document.getElementById('testFocusableTree1.node1').focus();

        document.getElementById('testFocusableTree2.node1').focus();

        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableTree2,
        );
      });

      test("registered tree root focus()ed after prev node focus diff tree returns new node's tree", function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.registerTree(this.testFocusableTree2);
        document.getElementById('testFocusableTree1.node1').focus();

        document.getElementById('testFocusableTree2').focus();

        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableTree2,
        );
      });

      test("non-registered node subelement focus()ed returns node's tree", function () {
        this.focusManager.registerTree(this.testFocusableTree1);

        document
          .getElementById('testFocusableTree1.node2.unregisteredChild1')
          .focus();

        // The tree of the unregistered child element should take focus.
        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableTree1,
        );
      });

      test('non-registered tree focus()ed returns null', function () {
        document.getElementById('testUnregisteredFocusableTree3').focus();

        assert.isNull(this.focusManager.getFocusedTree());
      });

      test('non-registered tree node focus()ed returns null', function () {
        document.getElementById('testUnregisteredFocusableTree3.node1').focus();

        assert.isNull(this.focusManager.getFocusedTree());
      });

      test('non-registered tree node focus()ed after registered node focused returns original tree', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        document.getElementById('testFocusableTree1.node1').focus();

        document.getElementById('testUnregisteredFocusableTree3.node1').focus();

        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableTree1,
        );
      });

      test('unregistered tree focus()ed with no prev focus returns null', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        document.getElementById('testFocusableTree1').focus();

        this.focusManager.unregisterTree(this.testFocusableTree1);

        assert.isNull(this.focusManager.getFocusedTree());
      });

      test('unregistered tree focus()ed with no prev focus returns null', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        document.getElementById('testFocusableTree1.node1').focus();

        this.focusManager.unregisterTree(this.testFocusableTree1);

        assert.isNull(this.focusManager.getFocusedTree());
      });

      test('unregistered tree focus()ed with prev node prior focused returns null', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.registerTree(this.testFocusableTree2);
        document.getElementById('testFocusableTree2.node1').focus();
        document.getElementById('testFocusableTree1.node1').focus();

        this.focusManager.unregisterTree(this.testFocusableTree1);

        // Since the more recent tree was removed, there's no tree currently focused.
        assert.isNull(this.focusManager.getFocusedTree());
      });

      test('unregistered tree focus()ed with prev node recently focused returns new tree', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.registerTree(this.testFocusableTree2);
        document.getElementById('testFocusableTree1.node1').focus();
        document.getElementById('testFocusableTree2.node1').focus();

        this.focusManager.unregisterTree(this.testFocusableTree1);

        // Since the most recent tree still exists, it still has focus.
        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableTree2,
        );
      });

      test('unregistered tree focus()ed with prev node after unregistering still returns old tree', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.registerTree(this.testFocusableTree2);
        document.getElementById('testFocusableTree1.node1').focus();
        document.getElementById('testFocusableTree2.node1').focus();
        this.focusManager.unregisterTree(this.testFocusableTree1);

        document.getElementById('testFocusableTree1.node1').focus();

        // Attempting to focus a now removed tree should have no effect.
        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableTree2,
        );
      });
    });
    suite('getFocusedNode()', function () {
      test('registered root focus()ed no prev focus returns root node', function () {
        this.focusManager.registerTree(this.testFocusableTree1);

        document.getElementById('testFocusableTree1').focus();

        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableTree1.getRootFocusableNode(),
        );
      });

      test('registered node focus()ed no prev focus returns node', function () {
        this.focusManager.registerTree(this.testFocusableTree1);

        document.getElementById('testFocusableTree1.node1').focus();

        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableTree1Node1,
        );
      });

      test('registered subnode focus()ed no prev focus returns subnode', function () {
        this.focusManager.registerTree(this.testFocusableTree1);

        document.getElementById('testFocusableTree1.node1.child1').focus();

        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableTree1Node1Child1,
        );
      });

      test('registered node focus()ed after prev node focus returns new node', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        document.getElementById('testFocusableTree1.node1').focus();

        document.getElementById('testFocusableTree1.node2').focus();

        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableTree1Node2,
        );
      });

      test('registered node focus()ed after prev node focus diff tree returns new node', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.registerTree(this.testFocusableTree2);
        document.getElementById('testFocusableTree1.node1').focus();

        document.getElementById('testFocusableTree2.node1').focus();

        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableTree2Node1,
        );
      });

      test('registered tree root focus()ed after prev node focus diff tree returns new root', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.registerTree(this.testFocusableTree2);
        document.getElementById('testFocusableTree1.node1').focus();

        document.getElementById('testFocusableTree2').focus();

        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableTree2.getRootFocusableNode(),
        );
      });

      test('non-registered node subelement focus()ed returns nearest node', function () {
        this.focusManager.registerTree(this.testFocusableTree1);

        document
          .getElementById('testFocusableTree1.node2.unregisteredChild1')
          .focus();

        // The nearest node of the unregistered child element should take focus.
        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableTree1Node2,
        );
      });

      test('non-registered tree focus()ed returns null', function () {
        document.getElementById('testUnregisteredFocusableTree3').focus();

        assert.isNull(this.focusManager.getFocusedNode());
      });

      test('non-registered tree node focus()ed returns null', function () {
        document.getElementById('testUnregisteredFocusableTree3.node1').focus();

        assert.isNull(this.focusManager.getFocusedNode());
      });

      test('non-registered tree node focus()ed after registered node focused returns original node', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        document.getElementById('testFocusableTree1.node1').focus();

        document.getElementById('testUnregisteredFocusableTree3.node1').focus();

        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableTree1Node1,
        );
      });

      test('unregistered tree focus()ed with no prev focus returns null', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        document.getElementById('testFocusableTree1').focus();

        this.focusManager.unregisterTree(this.testFocusableTree1);

        assert.isNull(this.focusManager.getFocusedNode());
      });

      test('unregistered tree focus()ed with no prev focus returns null', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        document.getElementById('testFocusableTree1.node1').focus();

        this.focusManager.unregisterTree(this.testFocusableTree1);

        assert.isNull(this.focusManager.getFocusedNode());
      });

      test('unregistered tree focus()ed with prev node prior focused returns null', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.registerTree(this.testFocusableTree2);
        document.getElementById('testFocusableTree2.node1').focus();
        document.getElementById('testFocusableTree1.node1').focus();

        this.focusManager.unregisterTree(this.testFocusableTree1);

        // Since the more recent tree was removed, there's no tree currently focused.
        assert.isNull(this.focusManager.getFocusedNode());
      });

      test('unregistered tree focus()ed with prev node recently focused returns new node', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.registerTree(this.testFocusableTree2);
        document.getElementById('testFocusableTree1.node1').focus();
        document.getElementById('testFocusableTree2.node1').focus();

        this.focusManager.unregisterTree(this.testFocusableTree1);

        // Since the most recent tree still exists, it still has focus.
        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableTree2Node1,
        );
      });

      test('unregistered tree focus()ed with prev node after unregistering still returns old node', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.registerTree(this.testFocusableTree2);
        document.getElementById('testFocusableTree1.node1').focus();
        document.getElementById('testFocusableTree2.node1').focus();
        this.focusManager.unregisterTree(this.testFocusableTree1);

        document.getElementById('testFocusableTree1.node1').focus();

        // Attempting to focus a now removed tree should have no effect.
        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableTree2Node1,
        );
      });
    });
    suite('CSS classes', function () {
      test('registered root focus()ed no prev focus returns root elem has active property', function () {
        this.focusManager.registerTree(this.testFocusableTree1);

        document.getElementById('testFocusableTree1').focus();

        const rootElem = this.testFocusableTree1
          .getRootFocusableNode()
          .getFocusableElement();
        assert.include(Array.from(rootElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(rootElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('registered node focus()ed no prev focus node elem has active property', function () {
        this.focusManager.registerTree(this.testFocusableTree1);

        document.getElementById('testFocusableTree1.node1').focus();

        const nodeElem = this.testFocusableTree1Node1.getFocusableElement();
        assert.include(Array.from(nodeElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(nodeElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('registered node focus()ed after prev node focus same tree old node elem has no focus property', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        document.getElementById('testFocusableTree1.node1').focus();

        document.getElementById('testFocusableTree1.node2').focus();

        const prevNodeElem = this.testFocusableTree1Node1.getFocusableElement();
        assert.notInclude(
          Array.from(prevNodeElem.classList),
          'blocklyActiveFocus',
        );
        assert.notInclude(
          Array.from(prevNodeElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('registered node focus()ed after prev node focus same tree new node elem has active property', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        document.getElementById('testFocusableTree1.node1').focus();

        document.getElementById('testFocusableTree1.node2').focus();

        const newNodeElem = this.testFocusableTree1Node2.getFocusableElement();
        assert.include(Array.from(newNodeElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(newNodeElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('registered node focus()ed after prev node focus diff tree old node elem has passive property', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.registerTree(this.testFocusableTree2);
        document.getElementById('testFocusableTree1.node1').focus();

        document.getElementById('testFocusableTree2.node1').focus();

        const prevNodeElem = this.testFocusableTree1Node1.getFocusableElement();
        assert.notInclude(
          Array.from(prevNodeElem.classList),
          'blocklyActiveFocus',
        );
        assert.include(
          Array.from(prevNodeElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('registered node focus()ed after prev node focus diff tree new node elem has active property', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.registerTree(this.testFocusableTree2);
        document.getElementById('testFocusableTree1.node1').focus();

        document.getElementById('testFocusableTree2.node1').focus();

        const newNodeElem = this.testFocusableTree2Node1.getFocusableElement();
        assert.include(Array.from(newNodeElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(newNodeElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('registered tree root focus()ed after prev node focus diff tree new root has active property', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.registerTree(this.testFocusableTree2);
        document.getElementById('testFocusableTree1.node1').focus();

        document.getElementById('testFocusableTree2').focus();

        const rootElem = this.testFocusableTree2
          .getRootFocusableNode()
          .getFocusableElement();
        assert.include(Array.from(rootElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(rootElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('non-registered node subelement focus()ed nearest node has active property', function () {
        this.focusManager.registerTree(this.testFocusableTree1);

        document
          .getElementById('testFocusableTree1.node2.unregisteredChild1')
          .focus();

        // The nearest node of the unregistered child element should be actively focused.
        const nodeElem = this.testFocusableTree1Node2.getFocusableElement();
        assert.include(Array.from(nodeElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(nodeElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('non-registered tree focus()ed has no focus', function () {
        document.getElementById('testUnregisteredFocusableTree3').focus();

        assert.isNull(this.focusManager.getFocusedNode());

        const rootElem = document.getElementById(
          'testUnregisteredFocusableTree3',
        );
        assert.notInclude(Array.from(rootElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(rootElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('non-registered tree node focus()ed has no focus', function () {
        document.getElementById('testUnregisteredFocusableTree3.node1').focus();

        assert.isNull(this.focusManager.getFocusedNode());

        const nodeElem = document.getElementById(
          'testUnregisteredFocusableTree3.node1',
        );
        assert.notInclude(Array.from(nodeElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(nodeElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('non-registered tree node focus()ed after registered node focused original node has active focus', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        document.getElementById('testFocusableTree1.node1').focus();

        document.getElementById('testUnregisteredFocusableTree3.node1').focus();

        // The original node should be unchanged, and the unregistered node should not have any
        // focus indicators.
        const nodeElem = document.getElementById('testFocusableTree1.node1');
        const attemptedNewNodeElem = document.getElementById(
          'testUnregisteredFocusableTree3.node1',
        );
        assert.include(Array.from(nodeElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(nodeElem.classList),
          'blocklyPassiveFocus',
        );
        assert.notInclude(
          Array.from(attemptedNewNodeElem.classList),
          'blocklyActiveFocus',
        );
        assert.notInclude(
          Array.from(attemptedNewNodeElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('unregistered tree focus()ed with no prev focus removes focus', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        document.getElementById('testFocusableTree1').focus();

        this.focusManager.unregisterTree(this.testFocusableTree1);

        // Since the tree was unregistered it no longer has focus indicators.
        const rootElem = this.testFocusableTree1
          .getRootFocusableNode()
          .getFocusableElement();
        assert.notInclude(Array.from(rootElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(rootElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('unregistered tree focus()ed with no prev focus removes focus', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        document.getElementById('testFocusableTree1.node1').focus();

        this.focusManager.unregisterTree(this.testFocusableTree1);

        // Since the tree was unregistered it no longer has focus indicators.
        const nodeElem = this.testFocusableTree1Node1.getFocusableElement();
        assert.notInclude(Array.from(nodeElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(nodeElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('unregistered tree focus()ed with prev node prior removes focus from removed tree', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.registerTree(this.testFocusableTree2);
        document.getElementById('testFocusableTree2.node1').focus();
        document.getElementById('testFocusableTree1.node1').focus();

        this.focusManager.unregisterTree(this.testFocusableTree1);

        // Since the tree was unregistered it no longer has focus indicators. However, the old node
        // should still have passive indication.
        const otherNodeElem =
          this.testFocusableTree2Node1.getFocusableElement();
        const removedNodeElem =
          this.testFocusableTree1Node1.getFocusableElement();
        assert.include(
          Array.from(otherNodeElem.classList),
          'blocklyPassiveFocus',
        );
        assert.notInclude(
          Array.from(otherNodeElem.classList),
          'blocklyActiveFocus',
        );
        assert.notInclude(
          Array.from(removedNodeElem.classList),
          'blocklyActiveFocus',
        );
        assert.notInclude(
          Array.from(removedNodeElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('unregistered tree focus()ed with prev node recently removes focus from removed tree', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.registerTree(this.testFocusableTree2);
        document.getElementById('testFocusableTree1.node1').focus();
        document.getElementById('testFocusableTree2.node1').focus();

        this.focusManager.unregisterTree(this.testFocusableTree1);

        // Since the tree was unregistered it no longer has focus indicators. However, the new node
        // should still have active indication.
        const otherNodeElem =
          this.testFocusableTree2Node1.getFocusableElement();
        const removedNodeElem =
          this.testFocusableTree1Node1.getFocusableElement();
        assert.include(
          Array.from(otherNodeElem.classList),
          'blocklyActiveFocus',
        );
        assert.notInclude(
          Array.from(otherNodeElem.classList),
          'blocklyPassiveFocus',
        );
        assert.notInclude(
          Array.from(removedNodeElem.classList),
          'blocklyActiveFocus',
        );
        assert.notInclude(
          Array.from(removedNodeElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('unregistered tree focus()ed with prev node after unregistering does not change indicators', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.registerTree(this.testFocusableTree2);
        document.getElementById('testFocusableTree1.node1').focus();
        document.getElementById('testFocusableTree2.node1').focus();
        this.focusManager.unregisterTree(this.testFocusableTree1);

        document.getElementById('testFocusableTree1.node1').focus();

        // Attempting to focus a now removed tree should have no effect.
        const otherNodeElem =
          this.testFocusableTree2Node1.getFocusableElement();
        const removedNodeElem =
          this.testFocusableTree1Node1.getFocusableElement();
        assert.include(
          Array.from(otherNodeElem.classList),
          'blocklyActiveFocus',
        );
        assert.notInclude(
          Array.from(otherNodeElem.classList),
          'blocklyPassiveFocus',
        );
        assert.notInclude(
          Array.from(removedNodeElem.classList),
          'blocklyActiveFocus',
        );
        assert.notInclude(
          Array.from(removedNodeElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('focus() multiple nodes in same tree with switches ensure passive focus has gone', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.registerTree(this.testFocusableTree2);
        document.getElementById('testFocusableTree1.node1').focus();
        document.getElementById('testFocusableTree2.node1').focus();

        document.getElementById('testFocusableTree1.node2').focus();

        // When switching back to the first tree, ensure the original passive node is no longer
        // passive now that the new node is active.
        const node1 = this.testFocusableTree1Node1.getFocusableElement();
        const node2 = this.testFocusableTree1Node2.getFocusableElement();
        assert.notInclude(Array.from(node1.classList), 'blocklyPassiveFocus');
        assert.notInclude(Array.from(node2.classList), 'blocklyPassiveFocus');
      });

      test('registered tree focus()ed other tree node passively focused tree root now has active property', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.registerTree(this.testFocusableTree2);
        document.getElementById('testFocusableTree1.node1').focus();
        document.getElementById('testFocusableTree2.node1').focus();

        document.getElementById('testFocusableTree1').focus();

        // This differs from the behavior of focusTree() since directly focusing a tree's root will
        // coerce it to now have focus.
        const rootElem = this.testFocusableTree1
          .getRootFocusableNode()
          .getFocusableElement();
        const nodeElem = this.testFocusableTree1Node1.getFocusableElement();
        assert.include(Array.from(rootElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(rootElem.classList),
          'blocklyPassiveFocus',
        );
        assert.notInclude(Array.from(nodeElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(nodeElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('focus on root, node in diff tree, then node in first tree; root should have focus gone', function () {
        this.focusManager.registerTree(this.testFocusableTree1);
        this.focusManager.registerTree(this.testFocusableTree2);
        document.getElementById('testFocusableTree1').focus();
        document.getElementById('testFocusableTree2.node1').focus();

        document.getElementById('testFocusableTree1.node1').focus();

        const nodeElem = this.testFocusableTree1Node1.getFocusableElement();
        const rootElem = this.testFocusableTree1
          .getRootFocusableNode()
          .getFocusableElement();
        assert.include(Array.from(nodeElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(nodeElem.classList),
          'blocklyPassiveFocus',
        );
        assert.notInclude(Array.from(rootElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(rootElem.classList),
          'blocklyPassiveFocus',
        );
      });
    });
  });

  /* Focus tests for SVG trees. */

  suite('focus*() switching in SVG tree', function () {
    suite('getFocusedTree()', function () {
      test('registered tree focusTree()ed no prev focus returns tree', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);

        this.focusManager.focusTree(this.testFocusableGroup1);

        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableGroup1,
        );
      });

      test('registered tree focusTree()ed prev node focused returns tree', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.focusNode(this.testFocusableGroup1Node1);

        this.focusManager.focusTree(this.testFocusableGroup1);

        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableGroup1,
        );
      });

      test('registered tree focusTree()ed diff tree prev focused returns new tree', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.registerTree(this.testFocusableGroup2);
        this.focusManager.focusTree(this.testFocusableGroup1);

        this.focusManager.focusTree(this.testFocusableGroup2);

        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableGroup2,
        );
      });

      test('registered tree focusTree()ed diff tree node prev focused returns new tree', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.registerTree(this.testFocusableGroup2);
        this.focusManager.focusNode(this.testFocusableGroup1Node1);

        this.focusManager.focusTree(this.testFocusableGroup2);

        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableGroup2,
        );
      });

      test('registered root focusNode()ed no prev focus returns tree', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);

        this.focusManager.focusNode(
          this.testFocusableGroup1.getRootFocusableNode(),
        );

        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableGroup1,
        );
      });

      test("registered node focusNode()ed no prev focus returns node's tree", function () {
        this.focusManager.registerTree(this.testFocusableGroup1);

        this.focusManager.focusNode(this.testFocusableGroup1Node1);

        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableGroup1,
        );
      });

      test("registered subnode focusNode()ed no prev focus returns node's tree", function () {
        this.focusManager.registerTree(this.testFocusableGroup1);

        this.focusManager.focusNode(this.testFocusableGroup1Node1Child1);

        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableGroup1,
        );
      });

      test('registered node focusNode()ed after prev node focus returns same tree', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.focusNode(this.testFocusableGroup1Node1);

        this.focusManager.focusNode(this.testFocusableGroup1Node2);

        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableGroup1,
        );
      });

      test("registered node focusNode()ed after prev node focus diff tree returns new node's tree", function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.registerTree(this.testFocusableGroup2);
        this.focusManager.focusNode(this.testFocusableGroup1Node1);

        this.focusManager.focusNode(this.testFocusableGroup2Node1);

        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableGroup2,
        );
      });

      test("registered tree root focusNode()ed after prev node focus diff tree returns new node's tree", function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.registerTree(this.testFocusableGroup2);
        this.focusManager.focusNode(this.testFocusableGroup1Node1);

        this.focusManager.focusNode(
          this.testFocusableGroup2.getRootFocusableNode(),
        );

        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableGroup2,
        );
      });

      test('unregistered tree focusTree()ed with no prev focus returns null', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.focusTree(this.testFocusableGroup1);

        this.focusManager.unregisterTree(this.testFocusableGroup1);

        assert.isNull(this.focusManager.getFocusedTree());
      });

      test('unregistered tree focusNode()ed with no prev focus returns null', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.focusNode(this.testFocusableGroup1Node1);

        this.focusManager.unregisterTree(this.testFocusableGroup1);

        assert.isNull(this.focusManager.getFocusedTree());
      });

      test('unregistered tree focusNode()ed with prev node prior focused returns null', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.registerTree(this.testFocusableGroup2);
        this.focusManager.focusNode(this.testFocusableGroup2Node1);
        this.focusManager.focusNode(this.testFocusableGroup1Node1);

        this.focusManager.unregisterTree(this.testFocusableGroup1);

        // Since the more recent tree was removed, there's no tree currently focused.
        assert.isNull(this.focusManager.getFocusedTree());
      });

      test('unregistered tree focusNode()ed with prev node recently focused returns new tree', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.registerTree(this.testFocusableGroup2);
        this.focusManager.focusNode(this.testFocusableGroup1Node1);
        this.focusManager.focusNode(this.testFocusableGroup2Node1);

        this.focusManager.unregisterTree(this.testFocusableGroup1);

        // Since the most recent tree still exists, it still has focus.
        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableGroup2,
        );
      });
    });
    suite('getFocusedNode()', function () {
      test('registered tree focusTree()ed no prev focus returns root node', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);

        this.focusManager.focusTree(this.testFocusableGroup1);

        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableGroup1.getRootFocusableNode(),
        );
      });

      test('registered tree focusTree()ed prev node focused returns original node', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.focusNode(this.testFocusableGroup1Node1);

        this.focusManager.focusTree(this.testFocusableGroup1);

        // The original node retains focus since the tree already holds focus (per focusTree's
        // contract).
        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableGroup1Node1,
        );
      });

      test('registered tree focusTree()ed diff tree prev focused returns new root node', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.registerTree(this.testFocusableGroup2);
        this.focusManager.focusTree(this.testFocusableGroup1);

        this.focusManager.focusTree(this.testFocusableGroup2);

        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableGroup2.getRootFocusableNode(),
        );
      });

      test('registered tree focusTree()ed diff tree node prev focused returns new root node', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.registerTree(this.testFocusableGroup2);
        this.focusManager.focusNode(this.testFocusableGroup1Node1);

        this.focusManager.focusTree(this.testFocusableGroup2);

        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableGroup2.getRootFocusableNode(),
        );
      });

      test('registered root focusNode()ed no prev focus returns root node', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);

        this.focusManager.focusNode(
          this.testFocusableGroup1.getRootFocusableNode(),
        );

        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableGroup1.getRootFocusableNode(),
        );
      });

      test('registered node focusNode()ed no prev focus returns node', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);

        this.focusManager.focusNode(this.testFocusableGroup1Node1);

        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableGroup1Node1,
        );
      });

      test('registered subnode focusNode()ed no prev focus returns subnode', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);

        this.focusManager.focusNode(this.testFocusableGroup1Node1Child1);

        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableGroup1Node1Child1,
        );
      });

      test('registered node focusNode()ed after prev node focus returns new node', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.focusNode(this.testFocusableGroup1Node1);

        this.focusManager.focusNode(this.testFocusableGroup1Node2);

        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableGroup1Node2,
        );
      });

      test('registered node focusNode()ed after prev node focus diff tree returns new node', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.registerTree(this.testFocusableGroup2);
        this.focusManager.focusNode(this.testFocusableGroup1Node1);

        this.focusManager.focusNode(this.testFocusableGroup2Node1);

        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableGroup2Node1,
        );
      });

      test('registered tree root focusNode()ed after prev node focus diff tree returns new root', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.registerTree(this.testFocusableGroup2);
        this.focusManager.focusNode(this.testFocusableGroup1Node1);

        this.focusManager.focusNode(
          this.testFocusableGroup2.getRootFocusableNode(),
        );

        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableGroup2.getRootFocusableNode(),
        );
      });

      test('unregistered tree focusTree()ed with no prev focus returns null', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.focusTree(this.testFocusableGroup1);

        this.focusManager.unregisterTree(this.testFocusableGroup1);

        assert.isNull(this.focusManager.getFocusedNode());
      });

      test('unregistered tree focusNode()ed with no prev focus returns null', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.focusNode(this.testFocusableGroup1Node1);

        this.focusManager.unregisterTree(this.testFocusableGroup1);

        assert.isNull(this.focusManager.getFocusedNode());
      });

      test('unregistered tree focusNode()ed with prev node prior focused returns null', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.registerTree(this.testFocusableGroup2);
        this.focusManager.focusNode(this.testFocusableGroup2Node1);
        this.focusManager.focusNode(this.testFocusableGroup1Node1);

        this.focusManager.unregisterTree(this.testFocusableGroup1);

        // Since the more recent tree was removed, there's no tree currently focused.
        assert.isNull(this.focusManager.getFocusedNode());
      });

      test('unregistered tree focusNode()ed with prev node recently focused returns new node', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.registerTree(this.testFocusableGroup2);
        this.focusManager.focusNode(this.testFocusableGroup1Node1);
        this.focusManager.focusNode(this.testFocusableGroup2Node1);

        this.focusManager.unregisterTree(this.testFocusableGroup1);

        // Since the most recent tree still exists, it still has focus.
        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableGroup2Node1,
        );
      });
    });
    suite('CSS classes', function () {
      test('registered tree focusTree()ed no prev focus root elem has active property', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);

        this.focusManager.focusTree(this.testFocusableGroup1);

        const rootElem = this.testFocusableGroup1
          .getRootFocusableNode()
          .getFocusableElement();
        assert.include(Array.from(rootElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(rootElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('registered tree focusTree()ed prev node focused original elem has active property', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.focusNode(this.testFocusableGroup1Node1);

        this.focusManager.focusTree(this.testFocusableGroup1);

        // The original node retains active focus since the tree already holds focus (per
        // focusTree's contract).
        const nodeElem = this.testFocusableGroup1Node1.getFocusableElement();
        assert.include(Array.from(nodeElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(nodeElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('registered tree focusTree()ed diff tree prev focused new root elem has active property', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.registerTree(this.testFocusableGroup2);
        this.focusManager.focusTree(this.testFocusableGroup1);

        this.focusManager.focusTree(this.testFocusableGroup2);

        const rootElem = this.testFocusableGroup2
          .getRootFocusableNode()
          .getFocusableElement();
        assert.include(Array.from(rootElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(rootElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('registered tree focusTree()ed diff tree node prev focused new root elem has active property', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.registerTree(this.testFocusableGroup2);
        this.focusManager.focusNode(this.testFocusableGroup1Node1);

        this.focusManager.focusTree(this.testFocusableGroup2);

        const rootElem = this.testFocusableGroup2
          .getRootFocusableNode()
          .getFocusableElement();
        assert.include(Array.from(rootElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(rootElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('registered root focusNode()ed no prev focus returns root elem has active property', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);

        this.focusManager.focusNode(
          this.testFocusableGroup1.getRootFocusableNode(),
        );

        const rootElem = this.testFocusableGroup1
          .getRootFocusableNode()
          .getFocusableElement();
        assert.include(Array.from(rootElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(rootElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('registered node focusNode()ed no prev focus node elem has active property', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);

        this.focusManager.focusNode(this.testFocusableGroup1Node1);

        const nodeElem = this.testFocusableGroup1Node1.getFocusableElement();
        assert.include(Array.from(nodeElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(nodeElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('registered node focusNode()ed after prev node focus same tree old node elem has no focus property', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.focusNode(this.testFocusableGroup1Node1);

        this.focusManager.focusNode(this.testFocusableGroup1Node2);

        const prevNodeElem =
          this.testFocusableGroup1Node1.getFocusableElement();
        assert.notInclude(
          Array.from(prevNodeElem.classList),
          'blocklyActiveFocus',
        );
        assert.notInclude(
          Array.from(prevNodeElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('registered node focusNode()ed after prev node focus same tree new node elem has active property', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.focusNode(this.testFocusableGroup1Node1);

        this.focusManager.focusNode(this.testFocusableGroup1Node2);

        const newNodeElem = this.testFocusableGroup1Node2.getFocusableElement();
        assert.include(Array.from(newNodeElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(newNodeElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('registered node focusNode()ed after prev node focus diff tree old node elem has passive property', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.registerTree(this.testFocusableGroup2);
        this.focusManager.focusNode(this.testFocusableGroup1Node1);

        this.focusManager.focusNode(this.testFocusableGroup2Node1);

        const prevNodeElem =
          this.testFocusableGroup1Node1.getFocusableElement();
        assert.notInclude(
          Array.from(prevNodeElem.classList),
          'blocklyActiveFocus',
        );
        assert.include(
          Array.from(prevNodeElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('registered node focusNode()ed after prev node focus diff tree new node elem has active property', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.registerTree(this.testFocusableGroup2);
        this.focusManager.focusNode(this.testFocusableGroup1Node1);

        this.focusManager.focusNode(this.testFocusableGroup2Node1);

        const newNodeElem = this.testFocusableGroup2Node1.getFocusableElement();
        assert.include(Array.from(newNodeElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(newNodeElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('registered tree root focusNode()ed after prev node focus diff tree new root has active property', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.registerTree(this.testFocusableGroup2);
        this.focusManager.focusNode(this.testFocusableGroup1Node1);

        this.focusManager.focusNode(
          this.testFocusableGroup2.getRootFocusableNode(),
        );

        const rootElem = this.testFocusableGroup2
          .getRootFocusableNode()
          .getFocusableElement();
        assert.include(Array.from(rootElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(rootElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('unregistered tree focusTree()ed with no prev focus removes focus', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.focusTree(this.testFocusableGroup1);

        this.focusManager.unregisterTree(this.testFocusableGroup1);

        // Since the tree was unregistered it no longer has focus indicators.
        const rootElem = this.testFocusableGroup1
          .getRootFocusableNode()
          .getFocusableElement();
        assert.notInclude(Array.from(rootElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(rootElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('unregistered tree focusNode()ed with no prev focus removes focus', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.focusNode(this.testFocusableGroup1Node1);

        this.focusManager.unregisterTree(this.testFocusableGroup1);

        // Since the tree was unregistered it no longer has focus indicators.
        const nodeElem = this.testFocusableGroup1Node1.getFocusableElement();
        assert.notInclude(Array.from(nodeElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(nodeElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('unregistered tree focusNode()ed with prev node prior removes focus from removed tree', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.registerTree(this.testFocusableGroup2);
        this.focusManager.focusNode(this.testFocusableGroup2Node1);
        this.focusManager.focusNode(this.testFocusableGroup1Node1);

        this.focusManager.unregisterTree(this.testFocusableGroup1);

        // Since the tree was unregistered it no longer has focus indicators. However, the old node
        // should still have passive indication.
        const otherNodeElem =
          this.testFocusableGroup2Node1.getFocusableElement();
        const removedNodeElem =
          this.testFocusableGroup1Node1.getFocusableElement();
        assert.include(
          Array.from(otherNodeElem.classList),
          'blocklyPassiveFocus',
        );
        assert.notInclude(
          Array.from(otherNodeElem.classList),
          'blocklyActiveFocus',
        );
        assert.notInclude(
          Array.from(removedNodeElem.classList),
          'blocklyActiveFocus',
        );
        assert.notInclude(
          Array.from(removedNodeElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('unregistered tree focusNode()ed with prev node recently removes focus from removed tree', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.registerTree(this.testFocusableGroup2);
        this.focusManager.focusNode(this.testFocusableGroup1Node1);
        this.focusManager.focusNode(this.testFocusableGroup2Node1);

        this.focusManager.unregisterTree(this.testFocusableGroup1);

        // Since the tree was unregistered it no longer has focus indicators. However, the new node
        // should still have active indication.
        const otherNodeElem =
          this.testFocusableGroup2Node1.getFocusableElement();
        const removedNodeElem =
          this.testFocusableGroup1Node1.getFocusableElement();
        assert.include(
          Array.from(otherNodeElem.classList),
          'blocklyActiveFocus',
        );
        assert.notInclude(
          Array.from(otherNodeElem.classList),
          'blocklyPassiveFocus',
        );
        assert.notInclude(
          Array.from(removedNodeElem.classList),
          'blocklyActiveFocus',
        );
        assert.notInclude(
          Array.from(removedNodeElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('focusNode() multiple nodes in same tree with switches ensure passive focus has gone', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.registerTree(this.testFocusableGroup2);
        this.focusManager.focusNode(this.testFocusableGroup1Node1);
        this.focusManager.focusNode(this.testFocusableGroup2Node1);

        this.focusManager.focusNode(this.testFocusableGroup1Node2);

        // When switching back to the first tree, ensure the original passive node is no longer
        // passive now that the new node is active.
        const node1 = this.testFocusableGroup1Node1.getFocusableElement();
        const node2 = this.testFocusableGroup1Node2.getFocusableElement();
        assert.notInclude(Array.from(node1.classList), 'blocklyPassiveFocus');
        assert.notInclude(Array.from(node2.classList), 'blocklyPassiveFocus');
      });

      test('registered tree focusTree()ed other tree node passively focused tree node now has active property', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.registerTree(this.testFocusableGroup2);
        this.focusManager.focusNode(this.testFocusableGroup1Node1);
        this.focusManager.focusNode(this.testFocusableGroup2Node1);

        this.focusManager.focusTree(this.testFocusableGroup1);

        // The original node in the tree should be moved from passive to active focus per the
        // contract of focusTree). Also, the root of the tree should have no focus indication.
        const nodeElem = this.testFocusableGroup1Node1.getFocusableElement();
        const rootElem = this.testFocusableGroup1
          .getRootFocusableNode()
          .getFocusableElement();
        assert.include(Array.from(nodeElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(nodeElem.classList),
          'blocklyPassiveFocus',
        );
        assert.notInclude(Array.from(rootElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(rootElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('focus on root, node in diff tree, then node in first tree; root should have focus gone', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.registerTree(this.testFocusableGroup2);
        this.focusManager.focusTree(this.testFocusableGroup1);
        this.focusManager.focusNode(this.testFocusableGroup2Node1);

        this.focusManager.focusNode(this.testFocusableGroup1Node1);

        const nodeElem = this.testFocusableGroup1Node1.getFocusableElement();
        const rootElem = this.testFocusableGroup1
          .getRootFocusableNode()
          .getFocusableElement();
        assert.include(Array.from(nodeElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(nodeElem.classList),
          'blocklyPassiveFocus',
        );
        assert.notInclude(Array.from(rootElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(rootElem.classList),
          'blocklyPassiveFocus',
        );
      });
    });
  });

  suite('DOM focus() switching in SVG tree', function () {
    suite('getFocusedTree()', function () {
      test('registered root focus()ed no prev focus returns tree', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);

        document.getElementById('testFocusableGroup1').focus();

        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableGroup1,
        );
      });

      test("registered node focus()ed no prev focus returns node's tree", function () {
        this.focusManager.registerTree(this.testFocusableGroup1);

        document.getElementById('testFocusableGroup1.node1').focus();

        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableGroup1,
        );
      });

      test("registered subnode focus()ed no prev focus returns node's tree", function () {
        this.focusManager.registerTree(this.testFocusableGroup1);

        document.getElementById('testFocusableGroup1.node1.child1').focus();

        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableGroup1,
        );
      });

      test('registered node focus()ed after prev node focus returns same tree', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        document.getElementById('testFocusableGroup1.node1').focus();

        document.getElementById('testFocusableGroup1.node2').focus();

        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableGroup1,
        );
      });

      test("registered node focus()ed after prev node focus diff tree returns new node's tree", function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.registerTree(this.testFocusableGroup2);
        document.getElementById('testFocusableGroup1.node1').focus();

        document.getElementById('testFocusableGroup2.node1').focus();

        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableGroup2,
        );
      });

      test("registered tree root focus()ed after prev node focus diff tree returns new node's tree", function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.registerTree(this.testFocusableGroup2);
        document.getElementById('testFocusableGroup1.node1').focus();

        document.getElementById('testFocusableGroup2').focus();

        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableGroup2,
        );
      });

      test("non-registered node subelement focus()ed returns node's tree", function () {
        this.focusManager.registerTree(this.testFocusableGroup1);

        document
          .getElementById('testFocusableGroup1.node2.unregisteredChild1')
          .focus();

        // The tree of the unregistered child element should take focus.
        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableGroup1,
        );
      });

      test('non-registered tree focus()ed returns null', function () {
        document.getElementById('testUnregisteredFocusableGroup3').focus();

        assert.isNull(this.focusManager.getFocusedTree());
      });

      test('non-registered tree node focus()ed returns null', function () {
        document
          .getElementById('testUnregisteredFocusableGroup3.node1')
          .focus();

        assert.isNull(this.focusManager.getFocusedTree());
      });

      test('non-registered tree node focus()ed after registered node focused returns original tree', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        document.getElementById('testFocusableGroup1.node1').focus();

        document
          .getElementById('testUnregisteredFocusableGroup3.node1')
          .focus();

        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableGroup1,
        );
      });

      test('unregistered tree focus()ed with no prev focus returns null', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        document.getElementById('testFocusableGroup1').focus();

        this.focusManager.unregisterTree(this.testFocusableGroup1);

        assert.isNull(this.focusManager.getFocusedTree());
      });

      test('unregistered tree focus()ed with no prev focus returns null', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        document.getElementById('testFocusableGroup1.node1').focus();

        this.focusManager.unregisterTree(this.testFocusableGroup1);

        assert.isNull(this.focusManager.getFocusedTree());
      });

      test('unregistered tree focus()ed with prev node prior focused returns null', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.registerTree(this.testFocusableGroup2);
        document.getElementById('testFocusableGroup2.node1').focus();
        document.getElementById('testFocusableGroup1.node1').focus();

        this.focusManager.unregisterTree(this.testFocusableGroup1);

        // Since the more recent tree was removed, there's no tree currently focused.
        assert.isNull(this.focusManager.getFocusedTree());
      });

      test('unregistered tree focus()ed with prev node recently focused returns new tree', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.registerTree(this.testFocusableGroup2);
        document.getElementById('testFocusableGroup1.node1').focus();
        document.getElementById('testFocusableGroup2.node1').focus();

        this.focusManager.unregisterTree(this.testFocusableGroup1);

        // Since the most recent tree still exists, it still has focus.
        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableGroup2,
        );
      });

      test('unregistered tree focus()ed with prev node after unregistering still returns old tree', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.registerTree(this.testFocusableGroup2);
        document.getElementById('testFocusableGroup1.node1').focus();
        document.getElementById('testFocusableGroup2.node1').focus();
        this.focusManager.unregisterTree(this.testFocusableGroup1);

        document.getElementById('testFocusableGroup1.node1').focus();

        // Attempting to focus a now removed tree should have no effect.
        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableGroup2,
        );
      });
    });
    suite('getFocusedNode()', function () {
      test('registered root focus()ed no prev focus returns root node', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);

        document.getElementById('testFocusableGroup1').focus();

        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableGroup1.getRootFocusableNode(),
        );
      });

      test('registered node focus()ed no prev focus returns node', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);

        document.getElementById('testFocusableGroup1.node1').focus();

        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableGroup1Node1,
        );
      });

      test('registered subnode focus()ed no prev focus returns subnode', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);

        document.getElementById('testFocusableGroup1.node1.child1').focus();

        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableGroup1Node1Child1,
        );
      });

      test('registered node focus()ed after prev node focus returns new node', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        document.getElementById('testFocusableGroup1.node1').focus();

        document.getElementById('testFocusableGroup1.node2').focus();

        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableGroup1Node2,
        );
      });

      test('registered node focus()ed after prev node focus diff tree returns new node', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.registerTree(this.testFocusableGroup2);
        document.getElementById('testFocusableGroup1.node1').focus();

        document.getElementById('testFocusableGroup2.node1').focus();

        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableGroup2Node1,
        );
      });

      test('registered tree root focus()ed after prev node focus diff tree returns new root', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.registerTree(this.testFocusableGroup2);
        document.getElementById('testFocusableGroup1.node1').focus();

        document.getElementById('testFocusableGroup2').focus();

        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableGroup2.getRootFocusableNode(),
        );
      });

      test('non-registered node subelement focus()ed returns nearest node', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);

        document
          .getElementById('testFocusableGroup1.node2.unregisteredChild1')
          .focus();

        // The nearest node of the unregistered child element should take focus.
        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableGroup1Node2,
        );
      });

      test('non-registered tree focus()ed returns null', function () {
        document.getElementById('testUnregisteredFocusableGroup3').focus();

        assert.isNull(this.focusManager.getFocusedNode());
      });

      test('non-registered tree node focus()ed returns null', function () {
        document
          .getElementById('testUnregisteredFocusableGroup3.node1')
          .focus();

        assert.isNull(this.focusManager.getFocusedNode());
      });

      test('non-registered tree node focus()ed after registered node focused returns original node', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        document.getElementById('testFocusableGroup1.node1').focus();

        document
          .getElementById('testUnregisteredFocusableGroup3.node1')
          .focus();

        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableGroup1Node1,
        );
      });

      test('unregistered tree focus()ed with no prev focus returns null', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        document.getElementById('testFocusableGroup1').focus();

        this.focusManager.unregisterTree(this.testFocusableGroup1);

        assert.isNull(this.focusManager.getFocusedNode());
      });

      test('unregistered tree focus()ed with no prev focus returns null', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        document.getElementById('testFocusableGroup1.node1').focus();

        this.focusManager.unregisterTree(this.testFocusableGroup1);

        assert.isNull(this.focusManager.getFocusedNode());
      });

      test('unregistered tree focus()ed with prev node prior focused returns null', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.registerTree(this.testFocusableGroup2);
        document.getElementById('testFocusableGroup2.node1').focus();
        document.getElementById('testFocusableGroup1.node1').focus();

        this.focusManager.unregisterTree(this.testFocusableGroup1);

        // Since the more recent tree was removed, there's no tree currently focused.
        assert.isNull(this.focusManager.getFocusedNode());
      });

      test('unregistered tree focus()ed with prev node recently focused returns new node', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.registerTree(this.testFocusableGroup2);
        document.getElementById('testFocusableGroup1.node1').focus();
        document.getElementById('testFocusableGroup2.node1').focus();

        this.focusManager.unregisterTree(this.testFocusableGroup1);

        // Since the most recent tree still exists, it still has focus.
        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableGroup2Node1,
        );
      });

      test('unregistered tree focus()ed with prev node after unregistering still returns old node', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.registerTree(this.testFocusableGroup2);
        document.getElementById('testFocusableGroup1.node1').focus();
        document.getElementById('testFocusableGroup2.node1').focus();
        this.focusManager.unregisterTree(this.testFocusableGroup1);

        document.getElementById('testFocusableGroup1.node1').focus();

        // Attempting to focus a now removed tree should have no effect.
        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableGroup2Node1,
        );
      });
    });
    suite('CSS classes', function () {
      test('registered root focus()ed no prev focus returns root elem has active property', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);

        document.getElementById('testFocusableGroup1').focus();

        const rootElem = this.testFocusableGroup1
          .getRootFocusableNode()
          .getFocusableElement();
        assert.include(Array.from(rootElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(rootElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('registered node focus()ed no prev focus node elem has active property', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);

        document.getElementById('testFocusableGroup1.node1').focus();

        const nodeElem = this.testFocusableGroup1Node1.getFocusableElement();
        assert.include(Array.from(nodeElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(nodeElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('registered node focus()ed after prev node focus same tree old node elem has no focus property', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        document.getElementById('testFocusableGroup1.node1').focus();

        document.getElementById('testFocusableGroup1.node2').focus();

        const prevNodeElem =
          this.testFocusableGroup1Node1.getFocusableElement();
        assert.notInclude(
          Array.from(prevNodeElem.classList),
          'blocklyActiveFocus',
        );
        assert.notInclude(
          Array.from(prevNodeElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('registered node focus()ed after prev node focus same tree new node elem has active property', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        document.getElementById('testFocusableGroup1.node1').focus();

        document.getElementById('testFocusableGroup1.node2').focus();

        const newNodeElem = this.testFocusableGroup1Node2.getFocusableElement();
        assert.include(Array.from(newNodeElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(newNodeElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('registered node focus()ed after prev node focus diff tree old node elem has passive property', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.registerTree(this.testFocusableGroup2);
        document.getElementById('testFocusableGroup1.node1').focus();

        document.getElementById('testFocusableGroup2.node1').focus();

        const prevNodeElem =
          this.testFocusableGroup1Node1.getFocusableElement();
        assert.notInclude(
          Array.from(prevNodeElem.classList),
          'blocklyActiveFocus',
        );
        assert.include(
          Array.from(prevNodeElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('registered node focus()ed after prev node focus diff tree new node elem has active property', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.registerTree(this.testFocusableGroup2);
        document.getElementById('testFocusableGroup1.node1').focus();

        document.getElementById('testFocusableGroup2.node1').focus();

        const newNodeElem = this.testFocusableGroup2Node1.getFocusableElement();
        assert.include(Array.from(newNodeElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(newNodeElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('registered tree root focus()ed after prev node focus diff tree new root has active property', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.registerTree(this.testFocusableGroup2);
        document.getElementById('testFocusableGroup1.node1').focus();

        document.getElementById('testFocusableGroup2').focus();

        const rootElem = this.testFocusableGroup2
          .getRootFocusableNode()
          .getFocusableElement();
        assert.include(Array.from(rootElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(rootElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('non-registered node subelement focus()ed nearest node has active property', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);

        document
          .getElementById('testFocusableGroup1.node2.unregisteredChild1')
          .focus();

        // The nearest node of the unregistered child element should be actively focused.
        const nodeElem = this.testFocusableGroup1Node2.getFocusableElement();
        assert.include(Array.from(nodeElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(nodeElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('non-registered tree focus()ed has no focus', function () {
        document.getElementById('testUnregisteredFocusableGroup3').focus();

        assert.isNull(this.focusManager.getFocusedNode());

        const rootElem = document.getElementById(
          'testUnregisteredFocusableGroup3',
        );
        assert.notInclude(Array.from(rootElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(rootElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('non-registered tree node focus()ed has no focus', function () {
        document
          .getElementById('testUnregisteredFocusableGroup3.node1')
          .focus();

        assert.isNull(this.focusManager.getFocusedNode());

        const nodeElem = document.getElementById(
          'testUnregisteredFocusableGroup3.node1',
        );
        assert.notInclude(Array.from(nodeElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(nodeElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('non-registered tree node focus()ed after registered node focused original node has active focus', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        document.getElementById('testFocusableGroup1.node1').focus();

        document
          .getElementById('testUnregisteredFocusableGroup3.node1')
          .focus();

        // The original node should be unchanged, and the unregistered node should not have any
        // focus indicators.
        const nodeElem = document.getElementById('testFocusableGroup1.node1');
        const attemptedNewNodeElem = document.getElementById(
          'testUnregisteredFocusableGroup3.node1',
        );
        assert.include(Array.from(nodeElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(nodeElem.classList),
          'blocklyPassiveFocus',
        );
        assert.notInclude(
          Array.from(attemptedNewNodeElem.classList),
          'blocklyActiveFocus',
        );
        assert.notInclude(
          Array.from(attemptedNewNodeElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('unregistered tree focus()ed with no prev focus removes focus', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        document.getElementById('testFocusableGroup1').focus();

        this.focusManager.unregisterTree(this.testFocusableGroup1);

        // Since the tree was unregistered it no longer has focus indicators.
        const rootElem = this.testFocusableGroup1
          .getRootFocusableNode()
          .getFocusableElement();
        assert.notInclude(Array.from(rootElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(rootElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('unregistered tree focus()ed with no prev focus removes focus', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        document.getElementById('testFocusableGroup1.node1').focus();

        this.focusManager.unregisterTree(this.testFocusableGroup1);

        // Since the tree was unregistered it no longer has focus indicators.
        const nodeElem = this.testFocusableGroup1Node1.getFocusableElement();
        assert.notInclude(Array.from(nodeElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(nodeElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('unregistered tree focus()ed with prev node prior removes focus from removed tree', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.registerTree(this.testFocusableGroup2);
        document.getElementById('testFocusableGroup2.node1').focus();
        document.getElementById('testFocusableGroup1.node1').focus();

        this.focusManager.unregisterTree(this.testFocusableGroup1);

        // Since the tree was unregistered it no longer has focus indicators. However, the old node
        // should still have passive indication.
        const otherNodeElem =
          this.testFocusableGroup2Node1.getFocusableElement();
        const removedNodeElem =
          this.testFocusableGroup1Node1.getFocusableElement();
        assert.include(
          Array.from(otherNodeElem.classList),
          'blocklyPassiveFocus',
        );
        assert.notInclude(
          Array.from(otherNodeElem.classList),
          'blocklyActiveFocus',
        );
        assert.notInclude(
          Array.from(removedNodeElem.classList),
          'blocklyActiveFocus',
        );
        assert.notInclude(
          Array.from(removedNodeElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('unregistered tree focus()ed with prev node recently removes focus from removed tree', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.registerTree(this.testFocusableGroup2);
        document.getElementById('testFocusableGroup1.node1').focus();
        document.getElementById('testFocusableGroup2.node1').focus();

        this.focusManager.unregisterTree(this.testFocusableGroup1);

        // Since the tree was unregistered it no longer has focus indicators. However, the new node
        // should still have active indication.
        const otherNodeElem =
          this.testFocusableGroup2Node1.getFocusableElement();
        const removedNodeElem =
          this.testFocusableGroup1Node1.getFocusableElement();
        assert.include(
          Array.from(otherNodeElem.classList),
          'blocklyActiveFocus',
        );
        assert.notInclude(
          Array.from(otherNodeElem.classList),
          'blocklyPassiveFocus',
        );
        assert.notInclude(
          Array.from(removedNodeElem.classList),
          'blocklyActiveFocus',
        );
        assert.notInclude(
          Array.from(removedNodeElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('unregistered tree focus()ed with prev node after unregistering does not change indicators', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.registerTree(this.testFocusableGroup2);
        document.getElementById('testFocusableGroup1.node1').focus();
        document.getElementById('testFocusableGroup2.node1').focus();
        this.focusManager.unregisterTree(this.testFocusableGroup1);

        document.getElementById('testFocusableGroup1.node1').focus();

        // Attempting to focus a now removed tree should have no effect.
        const otherNodeElem =
          this.testFocusableGroup2Node1.getFocusableElement();
        const removedNodeElem =
          this.testFocusableGroup1Node1.getFocusableElement();
        assert.include(
          Array.from(otherNodeElem.classList),
          'blocklyActiveFocus',
        );
        assert.notInclude(
          Array.from(otherNodeElem.classList),
          'blocklyPassiveFocus',
        );
        assert.notInclude(
          Array.from(removedNodeElem.classList),
          'blocklyActiveFocus',
        );
        assert.notInclude(
          Array.from(removedNodeElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('focus() multiple nodes in same tree with switches ensure passive focus has gone', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.registerTree(this.testFocusableGroup2);
        document.getElementById('testFocusableGroup1.node1').focus();
        document.getElementById('testFocusableGroup2.node1').focus();

        document.getElementById('testFocusableGroup1.node2').focus();

        // When switching back to the first tree, ensure the original passive node is no longer
        // passive now that the new node is active.
        const node1 = this.testFocusableGroup1Node1.getFocusableElement();
        const node2 = this.testFocusableGroup1Node2.getFocusableElement();
        assert.notInclude(Array.from(node1.classList), 'blocklyPassiveFocus');
        assert.notInclude(Array.from(node2.classList), 'blocklyPassiveFocus');
      });

      test('registered tree focus()ed other tree node passively focused tree root now has active property', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.registerTree(this.testFocusableGroup2);
        document.getElementById('testFocusableGroup1.node1').focus();
        document.getElementById('testFocusableGroup2.node1').focus();

        document.getElementById('testFocusableGroup1').focus();

        // This differs from the behavior of focusTree() since directly focusing a tree's root will
        // coerce it to now have focus.
        const rootElem = this.testFocusableGroup1
          .getRootFocusableNode()
          .getFocusableElement();
        const nodeElem = this.testFocusableGroup1Node1.getFocusableElement();
        assert.include(Array.from(rootElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(rootElem.classList),
          'blocklyPassiveFocus',
        );
        assert.notInclude(Array.from(nodeElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(nodeElem.classList),
          'blocklyPassiveFocus',
        );
      });

      test('focus on root, node in diff tree, then node in first tree; root should have focus gone', function () {
        this.focusManager.registerTree(this.testFocusableGroup1);
        this.focusManager.registerTree(this.testFocusableGroup2);
        document.getElementById('testFocusableGroup1').focus();
        document.getElementById('testFocusableGroup2.node1').focus();

        document.getElementById('testFocusableGroup1.node1').focus();

        const nodeElem = this.testFocusableGroup1Node1.getFocusableElement();
        const rootElem = this.testFocusableGroup1
          .getRootFocusableNode()
          .getFocusableElement();
        assert.include(Array.from(nodeElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(nodeElem.classList),
          'blocklyPassiveFocus',
        );
        assert.notInclude(Array.from(rootElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(rootElem.classList),
          'blocklyPassiveFocus',
        );
      });
    });
  });

  /* Combined HTML/SVG tree focus tests. */

  suite('HTML/SVG focus tree switching', function () {
    suite('Focus HTML tree then SVG tree', function () {
      test('HTML focusTree()ed then SVG focusTree()ed correctly updates getFocusedTree() and indicators', function () {
        this.focusManager.registerTree(this.testFocusableTree2);
        this.focusManager.registerTree(this.testFocusableGroup2);
        this.focusManager.focusTree(this.testFocusableTree2);

        this.focusManager.focusTree(this.testFocusableGroup2);

        const prevElem = this.testFocusableTree2
          .getRootFocusableNode()
          .getFocusableElement();
        const currElem = this.testFocusableGroup2
          .getRootFocusableNode()
          .getFocusableElement();
        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableGroup2,
        );
        assert.strictEqual(document.activeElement, currElem);
        assert.include(Array.from(currElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(currElem.classList),
          'blocklyPassiveFocus',
        );
        assert.notInclude(Array.from(prevElem.classList), 'blocklyActiveFocus');
        assert.include(Array.from(prevElem.classList), 'blocklyPassiveFocus');
      });

      test('HTML focusTree()ed then SVG focusNode()ed correctly updates getFocusedNode() and indicators', function () {
        this.focusManager.registerTree(this.testFocusableTree2);
        this.focusManager.registerTree(this.testFocusableGroup2);
        this.focusManager.focusTree(this.testFocusableTree2);

        this.focusManager.focusNode(this.testFocusableGroup2Node1);

        const prevElem = this.testFocusableTree2
          .getRootFocusableNode()
          .getFocusableElement();
        const currElem = this.testFocusableGroup2Node1.getFocusableElement();
        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableGroup2Node1,
        );
        assert.strictEqual(document.activeElement, currElem);
        assert.include(Array.from(currElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(currElem.classList),
          'blocklyPassiveFocus',
        );
        assert.notInclude(Array.from(prevElem.classList), 'blocklyActiveFocus');
        assert.include(Array.from(prevElem.classList), 'blocklyPassiveFocus');
      });

      test('HTML focusTree()ed then SVG DOM focus()ed correctly updates getFocusedNode() and indicators', function () {
        this.focusManager.registerTree(this.testFocusableTree2);
        this.focusManager.registerTree(this.testFocusableGroup2);
        this.focusManager.focusTree(this.testFocusableTree2);

        document.getElementById('testFocusableGroup2.node1').focus();

        const prevElem = this.testFocusableTree2
          .getRootFocusableNode()
          .getFocusableElement();
        const currElem = this.testFocusableGroup2Node1.getFocusableElement();
        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableGroup2Node1,
        );
        assert.strictEqual(document.activeElement, currElem);
        assert.include(Array.from(currElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(currElem.classList),
          'blocklyPassiveFocus',
        );
        assert.notInclude(Array.from(prevElem.classList), 'blocklyActiveFocus');
        assert.include(Array.from(prevElem.classList), 'blocklyPassiveFocus');
      });

      test('HTML focusNode()ed then SVG focusTree()ed correctly updates getFocusedTree() and indicators', function () {
        this.focusManager.registerTree(this.testFocusableTree2);
        this.focusManager.registerTree(this.testFocusableGroup2);
        this.focusManager.focusNode(this.testFocusableTree2Node1);

        this.focusManager.focusTree(this.testFocusableGroup2);

        const prevElem = this.testFocusableTree2Node1.getFocusableElement();
        const currElem = this.testFocusableGroup2
          .getRootFocusableNode()
          .getFocusableElement();
        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableGroup2,
        );
        assert.strictEqual(document.activeElement, currElem);
        assert.include(Array.from(currElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(currElem.classList),
          'blocklyPassiveFocus',
        );
        assert.notInclude(Array.from(prevElem.classList), 'blocklyActiveFocus');
        assert.include(Array.from(prevElem.classList), 'blocklyPassiveFocus');
      });

      test('HTML focusNode()ed then SVG focusNode()ed correctly updates getFocusedNode() and indicators', function () {
        this.focusManager.registerTree(this.testFocusableTree2);
        this.focusManager.registerTree(this.testFocusableGroup2);
        this.focusManager.focusNode(this.testFocusableTree2Node1);

        this.focusManager.focusNode(this.testFocusableGroup2Node1);

        const prevElem = this.testFocusableTree2Node1.getFocusableElement();
        const currElem = this.testFocusableGroup2Node1.getFocusableElement();
        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableGroup2Node1,
        );
        assert.strictEqual(document.activeElement, currElem);
        assert.include(Array.from(currElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(currElem.classList),
          'blocklyPassiveFocus',
        );
        assert.notInclude(Array.from(prevElem.classList), 'blocklyActiveFocus');
        assert.include(Array.from(prevElem.classList), 'blocklyPassiveFocus');
      });

      test('HTML focusNode()ed then SVG DOM focus()ed correctly updates getFocusedNode() and indicators', function () {
        this.focusManager.registerTree(this.testFocusableTree2);
        this.focusManager.registerTree(this.testFocusableGroup2);
        this.focusManager.focusNode(this.testFocusableTree2Node1);

        document.getElementById('testFocusableGroup2.node1').focus();

        const prevElem = this.testFocusableTree2Node1.getFocusableElement();
        const currElem = this.testFocusableGroup2Node1.getFocusableElement();
        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableGroup2Node1,
        );
        assert.strictEqual(document.activeElement, currElem);
        assert.include(Array.from(currElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(currElem.classList),
          'blocklyPassiveFocus',
        );
        assert.notInclude(Array.from(prevElem.classList), 'blocklyActiveFocus');
        assert.include(Array.from(prevElem.classList), 'blocklyPassiveFocus');
      });

      test('HTML DOM focus()ed then SVG focusTree()ed correctly updates getFocusedTree() and indicators', function () {
        this.focusManager.registerTree(this.testFocusableTree2);
        this.focusManager.registerTree(this.testFocusableGroup2);
        document.getElementById('testFocusableTree2.node1').focus();

        this.focusManager.focusTree(this.testFocusableGroup2);

        const prevElem = this.testFocusableTree2Node1.getFocusableElement();
        const currElem = this.testFocusableGroup2
          .getRootFocusableNode()
          .getFocusableElement();
        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableGroup2,
        );
        assert.strictEqual(document.activeElement, currElem);
        assert.include(Array.from(currElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(currElem.classList),
          'blocklyPassiveFocus',
        );
        assert.notInclude(Array.from(prevElem.classList), 'blocklyActiveFocus');
        assert.include(Array.from(prevElem.classList), 'blocklyPassiveFocus');
      });

      test('HTML DOM focus()ed then SVG focusNode()ed correctly updates getFocusedNode() and indicators', function () {
        this.focusManager.registerTree(this.testFocusableTree2);
        this.focusManager.registerTree(this.testFocusableGroup2);
        document.getElementById('testFocusableTree2.node1').focus();

        this.focusManager.focusNode(this.testFocusableGroup2Node1);

        const prevElem = this.testFocusableTree2Node1.getFocusableElement();
        const currElem = this.testFocusableGroup2Node1.getFocusableElement();
        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableGroup2Node1,
        );
        assert.strictEqual(document.activeElement, currElem);
        assert.include(Array.from(currElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(currElem.classList),
          'blocklyPassiveFocus',
        );
        assert.notInclude(Array.from(prevElem.classList), 'blocklyActiveFocus');
        assert.include(Array.from(prevElem.classList), 'blocklyPassiveFocus');
      });

      test('HTML DOM focus()ed then SVG DOM focus()ed correctly updates getFocusedNode() and indicators', function () {
        this.focusManager.registerTree(this.testFocusableTree2);
        this.focusManager.registerTree(this.testFocusableGroup2);
        document.getElementById('testFocusableTree2.node1').focus();

        document.getElementById('testFocusableGroup2.node1').focus();

        const prevElem = this.testFocusableTree2Node1.getFocusableElement();
        const currElem = this.testFocusableGroup2Node1.getFocusableElement();
        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableGroup2Node1,
        );
        assert.strictEqual(document.activeElement, currElem);
        assert.include(Array.from(currElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(currElem.classList),
          'blocklyPassiveFocus',
        );
        assert.notInclude(Array.from(prevElem.classList), 'blocklyActiveFocus');
        assert.include(Array.from(prevElem.classList), 'blocklyPassiveFocus');
      });
    });
    suite('Focus SVG tree then HTML tree', function () {
      test('SVG focusTree()ed then HTML focusTree()ed correctly updates getFocusedTree() and indicators', function () {
        this.focusManager.registerTree(this.testFocusableTree2);
        this.focusManager.registerTree(this.testFocusableGroup2);
        this.focusManager.focusTree(this.testFocusableGroup2);

        this.focusManager.focusTree(this.testFocusableTree2);

        const prevElem = this.testFocusableGroup2
          .getRootFocusableNode()
          .getFocusableElement();
        const currElem = this.testFocusableTree2
          .getRootFocusableNode()
          .getFocusableElement();
        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableTree2,
        );
        assert.strictEqual(document.activeElement, currElem);
        assert.include(Array.from(currElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(currElem.classList),
          'blocklyPassiveFocus',
        );
        assert.notInclude(Array.from(prevElem.classList), 'blocklyActiveFocus');
        assert.include(Array.from(prevElem.classList), 'blocklyPassiveFocus');
      });

      test('SVG focusTree()ed then HTML focusNode()ed correctly updates getFocusedNode() and indicators', function () {
        this.focusManager.registerTree(this.testFocusableTree2);
        this.focusManager.registerTree(this.testFocusableGroup2);
        this.focusManager.focusTree(this.testFocusableGroup2);

        this.focusManager.focusNode(this.testFocusableTree2Node1);

        const prevElem = this.testFocusableGroup2
          .getRootFocusableNode()
          .getFocusableElement();
        const currElem = this.testFocusableTree2Node1.getFocusableElement();
        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableTree2Node1,
        );
        assert.strictEqual(document.activeElement, currElem);
        assert.include(Array.from(currElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(currElem.classList),
          'blocklyPassiveFocus',
        );
        assert.notInclude(Array.from(prevElem.classList), 'blocklyActiveFocus');
        assert.include(Array.from(prevElem.classList), 'blocklyPassiveFocus');
      });

      test('SVG focusTree()ed then HTML DOM focus()ed correctly updates getFocusedNode() and indicators', function () {
        this.focusManager.registerTree(this.testFocusableTree2);
        this.focusManager.registerTree(this.testFocusableGroup2);
        this.focusManager.focusTree(this.testFocusableGroup2);

        document.getElementById('testFocusableTree2.node1').focus();

        const prevElem = this.testFocusableGroup2
          .getRootFocusableNode()
          .getFocusableElement();
        const currElem = this.testFocusableTree2Node1.getFocusableElement();
        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableTree2Node1,
        );
        assert.strictEqual(document.activeElement, currElem);
        assert.include(Array.from(currElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(currElem.classList),
          'blocklyPassiveFocus',
        );
        assert.notInclude(Array.from(prevElem.classList), 'blocklyActiveFocus');
        assert.include(Array.from(prevElem.classList), 'blocklyPassiveFocus');
      });

      test('SVG focusNode()ed then HTML focusTree()ed correctly updates getFocusedTree() and indicators', function () {
        this.focusManager.registerTree(this.testFocusableTree2);
        this.focusManager.registerTree(this.testFocusableGroup2);
        this.focusManager.focusNode(this.testFocusableGroup2Node1);

        this.focusManager.focusTree(this.testFocusableTree2);

        const prevElem = this.testFocusableGroup2Node1.getFocusableElement();
        const currElem = this.testFocusableTree2
          .getRootFocusableNode()
          .getFocusableElement();
        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableTree2,
        );
        assert.strictEqual(document.activeElement, currElem);
        assert.include(Array.from(currElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(currElem.classList),
          'blocklyPassiveFocus',
        );
        assert.notInclude(Array.from(prevElem.classList), 'blocklyActiveFocus');
        assert.include(Array.from(prevElem.classList), 'blocklyPassiveFocus');
      });

      test('SVG focusNode()ed then HTML focusNode()ed correctly updates getFocusedNode() and indicators', function () {
        this.focusManager.registerTree(this.testFocusableTree2);
        this.focusManager.registerTree(this.testFocusableGroup2);
        this.focusManager.focusNode(this.testFocusableGroup2Node1);

        this.focusManager.focusNode(this.testFocusableTree2Node1);

        const prevElem = this.testFocusableGroup2Node1.getFocusableElement();
        const currElem = this.testFocusableTree2Node1.getFocusableElement();
        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableTree2Node1,
        );
        assert.strictEqual(document.activeElement, currElem);
        assert.include(Array.from(currElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(currElem.classList),
          'blocklyPassiveFocus',
        );
        assert.notInclude(Array.from(prevElem.classList), 'blocklyActiveFocus');
        assert.include(Array.from(prevElem.classList), 'blocklyPassiveFocus');
      });

      test('SVG focusNode()ed then HTML DOM focus()ed correctly updates getFocusedNode() and indicators', function () {
        this.focusManager.registerTree(this.testFocusableTree2);
        this.focusManager.registerTree(this.testFocusableGroup2);
        this.focusManager.focusNode(this.testFocusableGroup2Node1);

        document.getElementById('testFocusableTree2.node1').focus();

        const prevElem = this.testFocusableGroup2Node1.getFocusableElement();
        const currElem = this.testFocusableTree2Node1.getFocusableElement();
        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableTree2Node1,
        );
        assert.strictEqual(document.activeElement, currElem);
        assert.include(Array.from(currElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(currElem.classList),
          'blocklyPassiveFocus',
        );
        assert.notInclude(Array.from(prevElem.classList), 'blocklyActiveFocus');
        assert.include(Array.from(prevElem.classList), 'blocklyPassiveFocus');
      });

      test('SVG DOM focus()ed then HTML focusTree()ed correctly updates getFocusedTree() and indicators', function () {
        this.focusManager.registerTree(this.testFocusableTree2);
        this.focusManager.registerTree(this.testFocusableGroup2);
        document.getElementById('testFocusableGroup2.node1').focus();

        this.focusManager.focusTree(this.testFocusableTree2);

        const prevElem = this.testFocusableGroup2Node1.getFocusableElement();
        const currElem = this.testFocusableTree2
          .getRootFocusableNode()
          .getFocusableElement();
        assert.equal(
          this.focusManager.getFocusedTree(),
          this.testFocusableTree2,
        );
        assert.strictEqual(document.activeElement, currElem);
        assert.include(Array.from(currElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(currElem.classList),
          'blocklyPassiveFocus',
        );
        assert.notInclude(Array.from(prevElem.classList), 'blocklyActiveFocus');
        assert.include(Array.from(prevElem.classList), 'blocklyPassiveFocus');
      });

      test('SVG DOM focus()ed then HTML focusNode()ed correctly updates getFocusedNode() and indicators', function () {
        this.focusManager.registerTree(this.testFocusableTree2);
        this.focusManager.registerTree(this.testFocusableGroup2);
        document.getElementById('testFocusableGroup2.node1').focus();

        this.focusManager.focusNode(this.testFocusableTree2Node1);

        const prevElem = this.testFocusableGroup2Node1.getFocusableElement();
        const currElem = this.testFocusableTree2Node1.getFocusableElement();
        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableTree2Node1,
        );
        assert.strictEqual(document.activeElement, currElem);
        assert.include(Array.from(currElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(currElem.classList),
          'blocklyPassiveFocus',
        );
        assert.notInclude(Array.from(prevElem.classList), 'blocklyActiveFocus');
        assert.include(Array.from(prevElem.classList), 'blocklyPassiveFocus');
      });

      test('SVG DOM focus()ed then HTML DOM focus()ed correctly updates getFocusedNode() and indicators', function () {
        this.focusManager.registerTree(this.testFocusableTree2);
        this.focusManager.registerTree(this.testFocusableGroup2);
        document.getElementById('testFocusableGroup2.node1').focus();

        document.getElementById('testFocusableTree2.node1').focus();

        const prevElem = this.testFocusableGroup2Node1.getFocusableElement();
        const currElem = this.testFocusableTree2Node1.getFocusableElement();
        assert.equal(
          this.focusManager.getFocusedNode(),
          this.testFocusableTree2Node1,
        );
        assert.strictEqual(document.activeElement, currElem);
        assert.include(Array.from(currElem.classList), 'blocklyActiveFocus');
        assert.notInclude(
          Array.from(currElem.classList),
          'blocklyPassiveFocus',
        );
        assert.notInclude(Array.from(prevElem.classList), 'blocklyActiveFocus');
        assert.include(Array.from(prevElem.classList), 'blocklyPassiveFocus');
      });
    });
  });

  /* Ephemeral focus tests. */

  suite('takeEphemeralFocus()', function () {
    function classListOf(node) {
      return Array.from(node.getFocusableElement().classList);
    }

    test('with no focused node does not change states', function () {
      this.focusManager.registerTree(this.testFocusableTree2);
      this.focusManager.registerTree(this.testFocusableGroup2);

      const ephemeralElement = document.getElementById(
        'nonTreeElementForEphemeralFocus',
      );
      this.focusManager.takeEphemeralFocus(ephemeralElement);

      // Taking focus without an existing node having focus should change no focus indicators.
      const activeElems = Array.from(
        document.querySelectorAll('.blocklyActiveFocus'),
      );
      const passiveElems = Array.from(
        document.querySelectorAll('.blocklyPassiveFocus'),
      );
      assert.isEmpty(activeElems);
      assert.isEmpty(passiveElems);
    });

    test('with focused node changes focused node to passive', function () {
      this.focusManager.registerTree(this.testFocusableTree2);
      this.focusManager.registerTree(this.testFocusableGroup2);
      this.focusManager.focusNode(this.testFocusableTree2Node1);

      const ephemeralElement = document.getElementById(
        'nonTreeElementForEphemeralFocus',
      );
      this.focusManager.takeEphemeralFocus(ephemeralElement);

      // Taking focus without an existing node having focus should change no focus indicators.
      const activeElems = Array.from(
        document.querySelectorAll('.blocklyActiveFocus'),
      );
      const passiveElems = Array.from(
        document.querySelectorAll('.blocklyPassiveFocus'),
      );
      assert.isEmpty(activeElems);
      assert.equal(passiveElems.length, 1);
      assert.include(
        classListOf(this.testFocusableTree2Node1),
        'blocklyPassiveFocus',
      );
    });

    test('focuses provided HTML element', function () {
      this.focusManager.registerTree(this.testFocusableTree2);
      this.focusManager.registerTree(this.testFocusableGroup2);

      const ephemeralElement = document.getElementById(
        'nonTreeElementForEphemeralFocus',
      );
      this.focusManager.takeEphemeralFocus(ephemeralElement);

      assert.strictEqual(document.activeElement, ephemeralElement);
    });

    test('focuses provided SVG element', function () {
      this.focusManager.registerTree(this.testFocusableTree2);
      this.focusManager.registerTree(this.testFocusableGroup2);

      const ephemeralElement = document.getElementById(
        'nonTreeGroupForEphemeralFocus',
      );
      this.focusManager.takeEphemeralFocus(ephemeralElement);

      assert.strictEqual(document.activeElement, ephemeralElement);
    });

    test('twice for without finishing previous throws error', function () {
      this.focusManager.registerTree(this.testFocusableTree2);
      this.focusManager.registerTree(this.testFocusableGroup2);
      const ephemeralGroupElement = document.getElementById(
        'nonTreeGroupForEphemeralFocus',
      );
      const ephemeralDivElement = document.getElementById(
        'nonTreeElementForEphemeralFocus',
      );
      this.focusManager.takeEphemeralFocus(ephemeralGroupElement);

      const errorMsgRegex =
        /Attempted to take ephemeral focus when it's already held+?/;
      assert.throws(
        () => this.focusManager.takeEphemeralFocus(ephemeralDivElement),
        errorMsgRegex,
      );
    });

    test('then focusTree() changes getFocusedTree() but not active state', function () {
      this.focusManager.registerTree(this.testFocusableTree2);
      this.focusManager.registerTree(this.testFocusableGroup2);
      this.focusManager.focusTree(this.testFocusableTree2);
      const ephemeralElement = document.getElementById(
        'nonTreeGroupForEphemeralFocus',
      );
      this.focusManager.takeEphemeralFocus(ephemeralElement);

      this.focusManager.focusTree(this.testFocusableGroup2);

      assert.equal(
        this.focusManager.getFocusedTree(),
        this.testFocusableGroup2,
      );
      const activeElems = Array.from(
        document.querySelectorAll('.blocklyActiveFocus'),
      );
      assert.isEmpty(activeElems);
    });

    test('then focusNode() changes getFocusedNode() but not active state', function () {
      this.focusManager.registerTree(this.testFocusableTree2);
      this.focusManager.registerTree(this.testFocusableGroup2);
      this.focusManager.focusNode(this.testFocusableTree2Node1);
      const ephemeralElement = document.getElementById(
        'nonTreeGroupForEphemeralFocus',
      );
      this.focusManager.takeEphemeralFocus(ephemeralElement);

      this.focusManager.focusNode(this.testFocusableGroup2Node1);

      assert.equal(
        this.focusManager.getFocusedNode(),
        this.testFocusableGroup2Node1,
      );
      const activeElems = Array.from(
        document.querySelectorAll('.blocklyActiveFocus'),
      );
      assert.isEmpty(activeElems);
    });

    test('then DOM refocus changes getFocusedNode() but not active state', function () {
      this.focusManager.registerTree(this.testFocusableTree2);
      this.focusManager.registerTree(this.testFocusableGroup2);
      this.focusManager.focusNode(this.testFocusableTree2Node1);
      const ephemeralElement = document.getElementById(
        'nonTreeGroupForEphemeralFocus',
      );
      this.focusManager.takeEphemeralFocus(ephemeralElement);

      // Force focus to change via the DOM.
      document.getElementById('testFocusableGroup2.node1').focus();

      // The focus() state change will affect getFocusedNode() but it will not cause the node to now
      // be active.
      assert.equal(
        this.focusManager.getFocusedNode(),
        this.testFocusableGroup2Node1,
      );
      const activeElems = Array.from(
        document.querySelectorAll('.blocklyActiveFocus'),
      );
      assert.isEmpty(activeElems);
    });

    test('then finish ephemeral callback with no node does not change indicators', function () {
      this.focusManager.registerTree(this.testFocusableTree2);
      this.focusManager.registerTree(this.testFocusableGroup2);
      const ephemeralElement = document.getElementById(
        'nonTreeElementForEphemeralFocus',
      );
      const finishFocusCallback =
        this.focusManager.takeEphemeralFocus(ephemeralElement);

      finishFocusCallback();

      // Finishing ephemeral focus without a previously focused node should not change indicators.
      const activeElems = Array.from(
        document.querySelectorAll('.blocklyActiveFocus'),
      );
      const passiveElems = Array.from(
        document.querySelectorAll('.blocklyPassiveFocus'),
      );
      assert.isEmpty(activeElems);
      assert.isEmpty(passiveElems);
    });

    test('again after finishing previous empheral focus should focus new element', function () {
      this.focusManager.registerTree(this.testFocusableTree2);
      this.focusManager.registerTree(this.testFocusableGroup2);
      const ephemeralGroupElement = document.getElementById(
        'nonTreeGroupForEphemeralFocus',
      );
      const ephemeralDivElement = document.getElementById(
        'nonTreeElementForEphemeralFocus',
      );
      const finishFocusCallback = this.focusManager.takeEphemeralFocus(
        ephemeralGroupElement,
      );

      finishFocusCallback();
      this.focusManager.takeEphemeralFocus(ephemeralDivElement);

      // An exception should not be thrown and the new element should receive focus.
      assert.strictEqual(document.activeElement, ephemeralDivElement);
    });

    test('calling ephemeral callback twice throws error', function () {
      this.focusManager.registerTree(this.testFocusableTree2);
      this.focusManager.registerTree(this.testFocusableGroup2);
      const ephemeralElement = document.getElementById(
        'nonTreeElementForEphemeralFocus',
      );
      const finishFocusCallback =
        this.focusManager.takeEphemeralFocus(ephemeralElement);
      finishFocusCallback();

      const errorMsgRegex =
        /Attempted to finish ephemeral focus twice for element+?/;
      assert.throws(() => finishFocusCallback(), errorMsgRegex);
    });

    test('then finish ephemeral callback should restore focused node', function () {
      this.focusManager.registerTree(this.testFocusableTree2);
      this.focusManager.registerTree(this.testFocusableGroup2);
      this.focusManager.focusNode(this.testFocusableTree2Node1);
      const ephemeralElement = document.getElementById(
        'nonTreeGroupForEphemeralFocus',
      );
      const finishFocusCallback =
        this.focusManager.takeEphemeralFocus(ephemeralElement);

      finishFocusCallback();

      // The original focused node should be restored.
      const nodeElem = this.testFocusableTree2Node1.getFocusableElement();
      const activeElems = Array.from(
        document.querySelectorAll('.blocklyActiveFocus'),
      );
      assert.equal(
        this.focusManager.getFocusedNode(),
        this.testFocusableTree2Node1,
      );
      assert.equal(activeElems.length, 1);
      assert.include(Array.from(nodeElem.classList), 'blocklyActiveFocus');
      assert.strictEqual(document.activeElement, nodeElem);
    });

    test('then focusTree() and finish ephemeral callback correctly sets new active state', function () {
      this.focusManager.registerTree(this.testFocusableTree2);
      this.focusManager.registerTree(this.testFocusableGroup2);
      this.focusManager.focusTree(this.testFocusableTree2);
      const ephemeralElement = document.getElementById(
        'nonTreeGroupForEphemeralFocus',
      );
      const finishFocusCallback =
        this.focusManager.takeEphemeralFocus(ephemeralElement);

      this.focusManager.focusTree(this.testFocusableGroup2);
      finishFocusCallback();

      // The tree's root should now be the active element since focus changed between the start and
      // end of the ephemeral flow.
      const rootElem = this.testFocusableGroup2
        .getRootFocusableNode()
        .getFocusableElement();
      const activeElems = Array.from(
        document.querySelectorAll('.blocklyActiveFocus'),
      );
      assert.equal(
        this.focusManager.getFocusedTree(),
        this.testFocusableGroup2,
      );
      assert.equal(activeElems.length, 1);
      assert.include(Array.from(rootElem.classList), 'blocklyActiveFocus');
      assert.strictEqual(document.activeElement, rootElem);
    });

    test('then focusNode() and finish ephemeral callback correctly sets new active state', function () {
      this.focusManager.registerTree(this.testFocusableTree2);
      this.focusManager.registerTree(this.testFocusableGroup2);
      this.focusManager.focusNode(this.testFocusableTree2Node1);
      const ephemeralElement = document.getElementById(
        'nonTreeGroupForEphemeralFocus',
      );
      const finishFocusCallback =
        this.focusManager.takeEphemeralFocus(ephemeralElement);

      this.focusManager.focusNode(this.testFocusableGroup2Node1);
      finishFocusCallback();

      // The tree's root should now be the active element since focus changed between the start and
      // end of the ephemeral flow.
      const nodeElem = this.testFocusableGroup2Node1.getFocusableElement();
      const activeElems = Array.from(
        document.querySelectorAll('.blocklyActiveFocus'),
      );
      assert.equal(
        this.focusManager.getFocusedNode(),
        this.testFocusableGroup2Node1,
      );
      assert.equal(activeElems.length, 1);
      assert.include(Array.from(nodeElem.classList), 'blocklyActiveFocus');
      assert.strictEqual(document.activeElement, nodeElem);
    });

    test('then DOM focus change and finish ephemeral callback correctly sets new active state', function () {
      this.focusManager.registerTree(this.testFocusableTree2);
      this.focusManager.registerTree(this.testFocusableGroup2);
      this.focusManager.focusNode(this.testFocusableTree2Node1);
      const ephemeralElement = document.getElementById(
        'nonTreeGroupForEphemeralFocus',
      );
      const finishFocusCallback =
        this.focusManager.takeEphemeralFocus(ephemeralElement);

      document.getElementById('testFocusableGroup2.node1').focus();
      finishFocusCallback();

      // The tree's root should now be the active element since focus changed between the start and
      // end of the ephemeral flow.
      const nodeElem = this.testFocusableGroup2Node1.getFocusableElement();
      const activeElems = Array.from(
        document.querySelectorAll('.blocklyActiveFocus'),
      );
      assert.equal(
        this.focusManager.getFocusedNode(),
        this.testFocusableGroup2Node1,
      );
      assert.equal(activeElems.length, 1);
      assert.include(Array.from(nodeElem.classList), 'blocklyActiveFocus');
      assert.strictEqual(document.activeElement, nodeElem);
    });
  });
});
