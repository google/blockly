/**
 * AccessibleBlockly
 *
 * Copyright 2016 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Angular2 Service that handles tree keyboard navigation.
 * This is a singleton service for the entire application.
 *
 * @author madeeha@google.com (Madeeha Ghori)
 */

blocklyApp.TreeService = ng.core
  .Class({
    constructor: [
        blocklyApp.NotificationsService, blocklyApp.UtilsService,
        blocklyApp.ClipboardService,
        function(_notificationsService, _utilsService, _clipboardService) {
      // Stores active descendant ids for each tree in the page.
      this.activeDescendantIds_ = {};
      this.notificationsService = _notificationsService;
      this.utilsService = _utilsService;
      this.clipboardService = _clipboardService;
      this.toolboxWorkspaces = {};
    }],
    getToolboxTreeNode_: function() {
      return document.getElementById('blockly-toolbox-tree');
    },
    // Returns a list of all top-level workspace tree nodes on the page.
    getWorkspaceTreeNodes_: function() {
      return Array.from(document.querySelectorAll('ol.blocklyWorkspaceTree'));
    },
    getWorkspaceToolbarButtonNodes_: function() {
      return Array.from(document.querySelectorAll(
          'button.blocklyWorkspaceToolbarButton'));
    },
    getToolboxWorkspace: function(categoryNode) {
      if (categoryNode.attributes && categoryNode.attributes.name) {
        var categoryName = categoryNode.attributes.name.value;
      } else {
        var categoryName = 'no-category';
      }

      if (this.toolboxWorkspaces.hasOwnProperty(categoryName)) {
        return this.toolboxWorkspaces[categoryName];
      } else {
        var categoryWorkspace = new Blockly.Workspace();
        if (categoryName == 'no-category') {
          for (var i = 0; i < categoryNode.length; i++) {
            Blockly.Xml.domToBlock(categoryWorkspace, categoryNode[i]);
          }
        } else {
          Blockly.Xml.domToWorkspace(categoryNode, categoryWorkspace);
        }

        this.toolboxWorkspaces[categoryName] = categoryWorkspace;
        return this.toolboxWorkspaces[categoryName];
      }
    },
    getToolboxBlockById: function(blockId) {
      for (var categoryName in this.toolboxWorkspaces) {
        var putativeBlock = this.utilsService.getBlockByIdFromWorkspace(
            blockId, this.toolboxWorkspaces[categoryName]);
        if (putativeBlock) {
          return putativeBlock;
        }
      }
      return null;
    },
    // Returns a list of all top-level tree nodes on the page.
    getAllTreeNodes_: function() {
      var treeNodes = [this.getToolboxTreeNode_()];
      treeNodes = treeNodes.concat(this.getWorkspaceTreeNodes_());
      treeNodes = treeNodes.concat(this.getWorkspaceToolbarButtonNodes_());
      return treeNodes;
    },
    isTopLevelWorkspaceTree: function(treeId) {
      return this.getWorkspaceTreeNodes_().some(function(tree) {
        return tree.id == treeId;
      });
    },
    getNodeToFocusOnWhenTreeIsDeleted: function(deletedTreeId) {
      // This returns the node to focus on after the deletion happens.
      // We shift focus to the next tree (if it exists), otherwise we shift
      // focus to the previous tree.
      var trees = this.getAllTreeNodes_();
      for (var i = 0; i < trees.length; i++) {
        if (trees[i].id == deletedTreeId) {
          if (i + 1 < trees.length) {
            return trees[i + 1];
          } else if (i > 0) {
            return trees[i - 1];
          }
        }
      }

      return this.getToolboxTreeNode_();
    },
    focusOnCurrentTree_: function(treeId) {
      var trees = this.getAllTreeNodes_();
      for (var i = 0; i < trees.length; i++) {
        if (trees[i].id == treeId) {
          trees[i].focus();
          return trees[i].id;
        }
      }
      return null;
    },
    getIdOfNextTree_: function(treeId) {
      var trees = this.getAllTreeNodes_();
      for (var i = 0; i < trees.length - 1; i++) {
        if (trees[i].id == treeId) {
          return trees[i + 1].id;
        }
      }
      return null;
    },
    getIdOfPreviousTree_: function(treeId) {
      var trees = this.getAllTreeNodes_();
      for (var i = trees.length - 1; i > 0; i--) {
        if (trees[i].id == treeId) {
          return trees[i - 1].id;
        }
      }
      return null;
    },
    getActiveDescId: function(treeId) {
      return this.activeDescendantIds_[treeId] || '';
    },
    unmarkActiveDesc_: function(activeDescId) {
      var activeDesc = document.getElementById(activeDescId);
      if (activeDesc) {
        activeDesc.classList.remove('blocklyActiveDescendant');
      }
    },
    markActiveDesc_: function(activeDescId) {
      var newActiveDesc = document.getElementById(activeDescId);
      newActiveDesc.classList.add('blocklyActiveDescendant');
    },
    // Runs the given function while preserving the focus and active descendant
    // for the given tree.
    runWhilePreservingFocus: function(func, treeId, optionalNewActiveDescId) {
      var oldDescId = this.getActiveDescId(treeId);
      var newDescId = optionalNewActiveDescId || oldDescId;
      this.unmarkActiveDesc_(oldDescId);
      func();

      // The timeout is needed in order to give the DOM time to stabilize
      // before setting the new active descendant, especially in cases like
      // pasteAbove().
      var that = this;
      setTimeout(function() {
        that.markActiveDesc_(newDescId);
        that.activeDescendantIds_[treeId] = newDescId;
        document.getElementById(treeId).focus();
      }, 0);
    },
    // This clears the active descendant of the given tree. It is used just
    // before the tree is deleted.
    clearActiveDesc: function(treeId) {
      this.unmarkActiveDesc_(this.getActiveDescId(treeId));
      delete this.activeDescendantIds_[treeId];
    },
    // Make a given node the active descendant of a given tree.
    setActiveDesc: function(newActiveDescId, treeId) {
      this.unmarkActiveDesc_(this.getActiveDescId(treeId));
      this.markActiveDesc_(newActiveDescId);
      this.activeDescendantIds_[treeId] = newActiveDescId;

      // Scroll the new active desc into view, if needed. This has no effect
      // for blind users, but is helpful for sighted onlookers.
      var activeDescNode = document.getElementById(newActiveDescId);
      var documentNode = document.body || document.documentElement;
      if (activeDescNode.offsetTop < documentNode.scrollTop ||
          activeDescNode.offsetTop >
              documentNode.scrollTop + window.innerHeight) {
        window.scrollTo(0, activeDescNode.offsetTop);
      }
    },
    initActiveDesc: function(treeId) {
      // Set the active desc to the first child in this tree.
      var tree = document.getElementById(treeId);
      this.setActiveDesc(this.getFirstChild(tree).id, treeId);
    },
    getTreeIdForBlock: function(blockId) {
      // Walk up the DOM until we get to the root node of the tree.
      var domNode = document.getElementById(blockId + 'blockRoot');
      while (!domNode.classList.contains('blocklyTree')) {
        domNode = domNode.parentNode;
      }
      return domNode.id;
    },
    focusOnBlock: function(blockId) {
      // Set focus to the tree containing the given block, and set the active
      // desc for this tree to the given block.
      var domNode = document.getElementById(blockId + 'blockRoot');
      // Walk up the DOM until we get to the root node of the tree.
      while (!domNode.classList.contains('blocklyTree')) {
        domNode = domNode.parentNode;
      }
      domNode.focus();

      // We need to wait a while to set the active desc, because domNode takes
      // a while to be given an ID if a new tree has just been created.
      // TODO(sll): Make this more deterministic.
      var that = this;
      setTimeout(function() {
        that.setActiveDesc(blockId + 'blockRoot', domNode.id);
      }, 100);
    },
    onWorkspaceToolbarKeypress: function(e, treeId) {
      if (e.keyCode == 9) {
        // Tab key.
        var destinationTreeId =
            e.shiftKey ? this.getIdOfPreviousTree_(treeId) :
            this.getIdOfNextTree_(treeId);
        if (destinationTreeId) {
          this.notifyUserAboutCurrentTree_(destinationTreeId);
        }
      }
    },
    isButtonOrFieldNode_: function(node) {
      return ['BUTTON', 'INPUT'].indexOf(node.tagName) != -1;
    },
    getNextActiveDescWhenBlockIsDeleted: function(blockRootNode) {
      // Go up a level, if possible.
      var nextNode = blockRootNode.parentNode;
      while (nextNode && nextNode.tagName != 'LI') {
        nextNode = nextNode.parentNode;
      }
      if (nextNode) {
        return nextNode;
      }

      // Otherwise, go to the next sibling.
      var nextSibling = this.getNextSibling(blockRootNode);
      if (nextSibling) {
        return nextSibling;
      }

      // Otherwise, go to the previous sibling.
      var previousSibling = this.getPreviousSibling(blockRootNode);
      if (previousSibling) {
        return previousSibling;
      }

      // Otherwise, this is a top-level isolated block, which means that
      // something's gone wrong and this function should not have been called
      // in the first place.
      console.error('Could not handle deletion of block.' + blockRootNode);
    },
    notifyUserAboutCurrentTree_: function(treeId) {
      if (this.getToolboxTreeNode_().id == treeId) {
        this.notificationsService.setStatusMessage('Now in toolbox.');
      } else {
        var workspaceTreeNodes = this.getWorkspaceTreeNodes_();
        for (var i = 0; i < workspaceTreeNodes.length; i++) {
          if (workspaceTreeNodes[i].id == treeId) {
            this.notificationsService.setStatusMessage(
                'Now in workspace group ' + (i + 1) + ' of ' +
                workspaceTreeNodes.length);
          }
        }
      }
    },
    isIsolatedTopLevelBlock_: function(block) {
      // Returns whether the given block is at the top level, and has no
      // siblings.
      var blockIsAtTopLevel = !block.getParent();
      var blockHasNoSiblings = (
          (!block.nextConnection ||
           !block.nextConnection.targetConnection) &&
          (!block.previousConnection ||
           !block.previousConnection.targetConnection));
      return blockIsAtTopLevel && blockHasNoSiblings;
    },
    removeBlockAndSetFocus: function(block, blockRootNode, deleteBlockFunc) {
      // This method runs the given deletion function and then does one of two
      // things:
      // - If the block is an isolated top-level block, it shifts the tree
      //   focus.
      // - Otherwise, it sets the correct new active desc for the current tree.
      var treeId = this.getTreeIdForBlock(block.id);
      if (this.isIsolatedTopLevelBlock_(block)) {
        var nextNodeToFocusOn = this.getNodeToFocusOnWhenTreeIsDeleted(treeId);

        this.clearActiveDesc(treeId);
        deleteBlockFunc();
        // Invoke a digest cycle, so that the DOM settles.
        setTimeout(function() {
          nextNodeToFocusOn.focus();
        });
      } else {
        var nextActiveDesc = this.getNextActiveDescWhenBlockIsDeleted(
            blockRootNode);
        this.runWhilePreservingFocus(
            deleteBlockFunc, treeId, nextActiveDesc.id);
      }
    },
    cutBlock_: function(block, blockRootNode) {
      var blockDescription = this.utilsService.getBlockDescription(block);

      var that = this;
      this.removeBlockAndSetFocus(block, blockRootNode, function() {
        that.clipboardService.cut(block);
      });

      setTimeout(function() {
        if (that.utilsService.isWorkspaceEmpty()) {
          that.notificationsService.setStatusMessage(
              blockDescription + ' cut. Workspace is empty.');
        } else {
          that.notificationsService.setStatusMessage(
              blockDescription + ' cut. Now on workspace.');
        }
      });
    },
    copyBlock_: function(block) {
      var blockDescription = this.utilsService.getBlockDescription(block);
      this.clipboardService.copy(block);
      this.notificationsService.setStatusMessage(
          blockDescription + ' ' + Blockly.Msg.COPIED_BLOCK_MSG);
    },
    pasteToConnection: function(block, connection) {
      if (this.clipboardService.isClipboardEmpty()) {
        return;
      }

      var destinationTreeId = this.getTreeIdForBlock(
          connection.getSourceBlock().id);
      this.clearActiveDesc(destinationTreeId);

      var newBlockId = this.clipboardService.pasteFromClipboard(connection);
      // Invoke a digest cycle, so that the DOM settles.
      var that = this;
      setTimeout(function() {
        that.focusOnBlock(newBlockId);
      });
    },
    onKeypress: function(e, tree) {
      var treeId = tree.id;
      var activeDesc = document.getElementById(this.getActiveDescId(treeId));
      if (!activeDesc) {
        console.error('ERROR: no active descendant for current tree.');
        this.initActiveDesc(treeId);
        return;
      }

      if (e.altKey) {
        // Do not intercept combinations such as Alt+Home.
        return;
      }

      if (e.ctrlKey) {
        var activeDesc = document.getElementById(this.getActiveDescId(treeId));

        // Scout up the tree to see whether we're in the toolbox or workspace.
        var scoutNode = activeDesc;
        var TARGET_TAG_NAMES = ['BLOCKLY-TOOLBOX', 'BLOCKLY-WORKSPACE'];
        while (TARGET_TAG_NAMES.indexOf(scoutNode.tagName) === -1) {
          scoutNode = scoutNode.parentNode;
        }
        var inToolbox = (scoutNode.tagName == 'BLOCKLY-TOOLBOX');

        // Disallow cutting and pasting in the toolbox.
        if (inToolbox && e.keyCode != 67) {
          if (e.keyCode == 86) {
            this.notificationsService.setStatusMessage(
                'Cannot paste block in toolbox.');
          } else if (e.keyCode == 88) {
            this.notificationsService.setStatusMessage(
                'Cannot cut block in toolbox. Try copying instead.');
          }
        }

        // Starting from the activeDesc, walk up the tree until we find the
        // root of the current block.
        var blockRootSuffix = inToolbox ? 'toolboxBlockRoot' : 'blockRoot';
        var putativeBlockRootNode = activeDesc;
        while (putativeBlockRootNode.id.indexOf(blockRootSuffix) === -1) {
          putativeBlockRootNode = putativeBlockRootNode.parentNode;
        }
        var blockRootNode = putativeBlockRootNode;

        var blockId = blockRootNode.id.substring(
            0, blockRootNode.id.length - blockRootSuffix.length);
        var block = inToolbox ?
            this.getToolboxBlockById(blockId) :
            this.utilsService.getBlockById(blockId);

        if (e.keyCode == 88) {
          // Cut block.
          this.cutBlock_(block, blockRootNode);
        } else if (e.keyCode == 67) {
          // Copy block. Note that, in this case, we might be in the workspace
          // or toolbox.
          this.copyBlock_(block);
        } else if (e.keyCode == 86) {
          // Paste block, if possible.
          var targetConnection =
              e.shiftKey ? block.previousConnection : block.nextConnection;
          this.pasteToConnection(block, targetConnection);
        }
      } else if (document.activeElement.tagName == 'INPUT') {
        // For input fields, only Esc and Tab keystrokes are handled specially.
        if (e.keyCode == 27 || e.keyCode == 9) {
          // For Esc and Tab keys, the focus is removed from the input field.
          this.focusOnCurrentTree_(treeId);

          if (e.keyCode == 9) {
            var destinationTreeId =
                e.shiftKey ? this.getIdOfPreviousTree_(treeId) :
                this.getIdOfNextTree_(treeId);
            if (destinationTreeId) {
              this.notifyUserAboutCurrentTree_(destinationTreeId);
            }
          }

          // Allow Tab keypresses to go through.
          if (e.keyCode == 27) {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      } else {
        // Outside an input field, Enter, Tab and navigation keys are all
        // recognized.
        if (e.keyCode == 13) {
          // Enter key. The user wants to interact with a button, interact with
          // an input field, or move down one level.
          // Algorithm to find the field: do a DFS through the children until
          // we find an INPUT or BUTTON element (in which case we use it).
          // Truncate the search at child LI elements.
          var found = false;
          var dfsStack = Array.from(activeDesc.children);
          while (dfsStack.length) {
            var currentNode = dfsStack.shift();
            if (currentNode.tagName == 'BUTTON') {
              this.moveUpOneLevel_(treeId);
              currentNode.click();
              found = true;
              break;
            } else if (currentNode.tagName == 'INPUT') {
              currentNode.focus();
              currentNode.select();
              this.notificationsService.setStatusMessage(
                'Type a value, then press Escape to exit');
              found = true;
              break;
            } else if (currentNode.tagName == 'LI') {
              continue;
            }

            if (currentNode.children) {
              var reversedChildren = Array.from(currentNode.children).reverse();
              reversedChildren.forEach(function(childNode) {
                dfsStack.unshift(childNode);
              });
            }
          }

          // If we cannot find a field to interact with, we try moving down a
          // level instead.
          if (!found) {
            this.moveDownOneLevel_(treeId);
          }
        } else if (e.keyCode == 9) {
          // Tab key. Note that allowing the event to propagate through is
          // intentional.
          var destinationTreeId =
              e.shiftKey ? this.getIdOfPreviousTree_(treeId) :
              this.getIdOfNextTree_(treeId);
          if (destinationTreeId) {
            this.notifyUserAboutCurrentTree_(destinationTreeId);
          }
        } else if (e.keyCode == 27) {
          this.moveUpOneLevel_(treeId);
        } else if (e.keyCode >= 35 && e.keyCode <= 40) {
          // End, home, and arrow keys.
          if (e.keyCode == 35) {
            // End key. Go to the last sibling in the subtree.
            var finalSibling = this.getFinalSibling(activeDesc);
            if (finalSibling) {
              this.setActiveDesc(finalSibling.id, treeId);
            }
          } else if (e.keyCode == 36) {
            // Home key. Go to the first sibling in the subtree.
            var initialSibling = this.getInitialSibling(activeDesc);
            if (initialSibling) {
              this.setActiveDesc(initialSibling.id, treeId);
            }
          } else if (e.keyCode == 37) {
            // Left arrow key. Go up a level, if possible.
            this.moveUpOneLevel_(treeId);
          } else if (e.keyCode == 38) {
            // Up arrow key. Go to the previous sibling, if possible.
            var prevSibling = this.getPreviousSibling(activeDesc);
            if (prevSibling) {
              this.setActiveDesc(prevSibling.id, treeId);
            } else {
              var statusMessage = 'Reached top of list.';
              if (this.getParentListElement_(activeDesc)) {
                statusMessage += ' Press left to go to parent list.';
              }
              this.notificationsService.setStatusMessage(statusMessage);
            }
          } else if (e.keyCode == 39) {
            // Right arrow key. Go down a level, if possible.
            this.moveDownOneLevel_(treeId);
          } else if (e.keyCode == 40) {
            // Down arrow key. Go to the next sibling, if possible.
            var nextSibling = this.getNextSibling(activeDesc);
            if (nextSibling) {
              this.setActiveDesc(nextSibling.id, treeId);
            } else {
              this.notificationsService.setStatusMessage(
                  'Reached bottom of list.');
            }
          }

          e.preventDefault();
          e.stopPropagation();
        }
      }
    },
    moveDownOneLevel_: function(treeId) {
      var activeDesc = document.getElementById(this.getActiveDescId(treeId));
      var firstChild = this.getFirstChild(activeDesc);
      if (firstChild) {
        this.setActiveDesc(firstChild.id, treeId);
      }
    },
    moveUpOneLevel_: function(treeId) {
      var activeDesc = document.getElementById(this.getActiveDescId(treeId));
      var nextNode = this.getParentListElement_(activeDesc);
      if (nextNode) {
        this.setActiveDesc(nextNode.id, treeId);
      }
    },
    getParentListElement_: function(element) {
      var nextNode = element.parentNode;
      while (nextNode && nextNode.tagName != 'LI') {
        nextNode = nextNode.parentNode;
      }
      return nextNode;
    },
    getFirstChild: function(element) {
      if (!element) {
        return element;
      } else {
        var childList = element.children;
        for (var i = 0; i < childList.length; i++) {
          if (childList[i].tagName == 'LI') {
            return childList[i];
          } else {
            var potentialElement = this.getFirstChild(childList[i]);
            if (potentialElement) {
              return potentialElement;
            }
          }
        }
        return null;
      }
    },
    getFinalSibling: function(element) {
      while (true) {
        var nextSibling = this.getNextSibling(element);
        if (nextSibling && nextSibling.id != element.id) {
          element = nextSibling;
        } else {
          return element;
        }
      }
    },
    getInitialSibling: function(element) {
      while (true) {
        var previousSibling = this.getPreviousSibling(element);
        if (previousSibling && previousSibling.id != element.id) {
          element = previousSibling;
        } else {
          return element;
        }
      }
    },
    getNextSibling: function(element) {
      if (element.nextElementSibling) {
        // If there is a sibling, find the list element child of the sibling.
        var node = element.nextElementSibling;
        if (node.tagName == 'LI') {
          return node;
        } else {
          // getElementsByTagName returns in DFS order, therefore the first
          // element is the first relevant list child.
          return node.getElementsByTagName('li')[0];
        }
      } else {
        var parent = element.parentNode;
        while (parent && parent.tagName != 'OL') {
          if (parent.nextElementSibling) {
            var node = parent.nextElementSibling;
            if (node.tagName == 'LI') {
              return node;
            } else {
              return this.getFirstChild(node);
            }
          } else {
            parent = parent.parentNode;
          }
        }
        return null;
      }
    },
    getPreviousSibling: function(element) {
      if (element.previousElementSibling) {
        var sibling = element.previousElementSibling;
        if (sibling.tagName == 'LI') {
          return sibling;
        } else {
          return this.getLastChild(sibling);
        }
      } else {
        var parent = element.parentNode;
        while (parent) {
          if (parent.tagName == 'OL') {
            break;
          }
          if (parent.previousElementSibling) {
            var node = parent.previousElementSibling;
            if (node.tagName == 'LI') {
              return node;
            } else {
              // Find the last list element child of the sibling of the parent.
              return this.getLastChild(node);
            }
          } else {
            parent = parent.parentNode;
          }
        }
        return null;
      }
    },
    getLastChild: function(element) {
      if (!element) {
        return element;
      } else {
        var childList = element.children;
        for (var i = childList.length - 1; i >= 0; i--) {
          // Find the last child that is a list element.
          if (childList[i].tagName == 'LI') {
            return childList[i];
          } else {
            var potentialElement = this.getLastChild(childList[i]);
            if (potentialElement) {
              return potentialElement;
            }
          }
        }
        return null;
      }
    }
});
