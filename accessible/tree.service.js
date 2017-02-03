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

blocklyApp.TreeService = ng.core.Class({
  constructor: [
    blocklyApp.AudioService,
    blocklyApp.BlockConnectionService,
    blocklyApp.BlockOptionsModalService,
    blocklyApp.NotificationsService,
    blocklyApp.UtilsService,
    function(
        audioService, blockConnectionService, blockOptionsModalService,
        notificationsService, utilsService) {
      this.audioService = audioService;
      this.blockConnectionService = blockConnectionService;
      this.blockOptionsModalService = blockOptionsModalService;
      this.notificationsService = notificationsService;
      this.utilsService = utilsService;

      // Stores active descendant ids for each tree in the page.
      this.activeDescendantIds_ = {};
    }
  ],
  // Returns a list of all top-level workspace tree nodes on the page.
  getWorkspaceFocusTargets_: function() {
    return Array.from(
        document.querySelectorAll('.blocklyWorkspaceFocusTarget'));
  },
  getSidebarButtonNodes_: function() {
    return Array.from(document.querySelectorAll('button.blocklySidebarButton'));
  },
  // Returns a list of all top-level tree nodes on the page.
  getAllTreeNodes_: function() {
    return this.getWorkspaceFocusTargets_().concat(
        this.getSidebarButtonNodes_());
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
    var workspaceFocusTargets = this.getWorkspaceFocusTargets_();
    for (var i = 0; i < workspaceFocusTargets.length; i++) {
      if (workspaceFocusTargets[i].tagName == 'OL' &&
          workspaceFocusTargets[i].id == treeId) {
        this.notificationsService.speak(
            'Now in workspace group ' + (i + 1) + ' of ' +
            workspaceFocusTargets.length);
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
      // Find the node to focus on after the deletion happens.
      var nextNodeToFocusOn = null;
      var focusTargets = this.getWorkspaceFocusTargets_();
      for (var i = 0; i < focusTargets.length; i++) {
        if (focusTargets[i].id == treeId) {
          if (i + 1 < focusTargets.length) {
            nextNodeToFocusOn = focusTargets[i + 1];
          } else if (i > 0) {
            nextNodeToFocusOn = focusTargets[i - 1];
          }
          break;
        }
      }

      this.clearActiveDesc(treeId);
      deleteBlockFunc();
      // Invoke a digest cycle, so that the DOM settles.
      setTimeout(function() {
        nextNodeToFocusOn = nextNodeToFocusOn || document.getElementById(
            'blocklyEmptyWorkspaceButton');
        nextNodeToFocusOn.focus();
      });
    } else {
      var nextActiveDesc = this.getNextActiveDescWhenBlockIsDeleted(
          blockRootNode);
      this.runWhilePreservingFocus(
          deleteBlockFunc, treeId, nextActiveDesc.id);
    }
  },
  showBlockOptionsModal: function(block, blockRootNode) {
    var that = this;
    var actionButtonsInfo = [];

    if (block.previousConnection) {
      actionButtonsInfo.push({
        action: function() {
          that.blockConnectionService.markConnection(block.previousConnection);
          that.focusOnBlock(block.id);
        },
        translationIdForText: 'MARK_SPOT_BEFORE'
      });
    }

    if (block.nextConnection) {
      actionButtonsInfo.push({
        action: function() {
          that.blockConnectionService.markConnection(block.nextConnection);
          that.focusOnBlock(block.id);
        },
        translationIdForText: 'MARK_SPOT_AFTER'
      });
    }

    if (this.blockConnectionService.canBeMovedToMarkedConnection(block)) {
      actionButtonsInfo.push({
        action: function() {
          var blockDescription = that.utilsService.getBlockDescription(
            block);
          var oldDestinationTreeId = that.getTreeIdForBlock(
              that.blockConnectionService.getMarkedConnectionSourceBlock().id);
          that.clearActiveDesc(oldDestinationTreeId);

          var newBlockId = that.blockConnectionService.attachToMarkedConnection(
              block);

          that.removeBlockAndSetFocus(block, blockRootNode, function() {
            block.dispose(true);
          });

          // Invoke a digest cycle, so that the DOM settles.
          setTimeout(function() {
            that.focusOnBlock(newBlockId);

            var newDestinationTreeId = that.getTreeIdForBlock(newBlockId);
            if (newDestinationTreeId != oldDestinationTreeId) {
              // It is possible for the tree ID for the pasted block to
              // change after the paste operation, e.g. when inserting a
              // block between two existing blocks that are joined
              // together. In this case, we need to also reset the active
              // desc for the old destination tree.
              that.initActiveDesc(oldDestinationTreeId);
            }

            that.notificationsService.speak(
                blockDescription + ' ' +
                Blockly.Msg.ATTACHED_BLOCK_TO_LINK_MSG +
                '. Now on attached block in workspace.');
          });
        },
        translationIdForText: 'MOVE_TO_MARKED_SPOT'
      });
    }

    actionButtonsInfo.push({
      action: function() {
        var blockDescription = that.utilsService.getBlockDescription(block);

        that.removeBlockAndSetFocus(block, blockRootNode, function() {
          block.dispose(true);
          that.audioService.playDeleteSound();
        });

        setTimeout(function() {
          if (that.utilsService.isWorkspaceEmpty()) {
            that.notificationsService.speak(
                blockDescription + ' deleted. Workspace is empty.');
          } else {
            that.notificationsService.speak(
                blockDescription + ' deleted. Now on workspace.');
          }
        });
      },
      translationIdForText: 'DELETE'
    });

    this.blockOptionsModalService.showModal(actionButtonsInfo, function() {
      that.focusOnBlock(block.id);
    });
  },
  getBlockRootSuffix_: function() {
    return 'blockRoot';
  },
  getCurrentBlockRootNode_: function(activeDesc) {
    // Starting from the activeDesc, walk up the tree until we find the
    // root of the current block.
    var blockRootSuffix = this.getBlockRootSuffix_();
    var putativeBlockRootNode = activeDesc;
    while (putativeBlockRootNode.id.indexOf(blockRootSuffix) === -1) {
      putativeBlockRootNode = putativeBlockRootNode.parentNode;
    }
    return putativeBlockRootNode;
  },
  getBlockFromRootNode_: function(blockRootNode) {
    var blockRootSuffix = this.getBlockRootSuffix_();
    var blockId = blockRootNode.id.substring(
        0, blockRootNode.id.length - blockRootSuffix.length);
    return blocklyApp.workspace.getBlockById(blockId);
  },
  onKeypress: function(e, tree) {
    // TODO(sll): Instead of this, have a common ActiveContextService which
    // returns true if at least one modal is shown, and false otherwise.
    if (this.blockOptionsModalService.isModalShown()) {
      return;
    }

    var treeId = tree.id;
    var activeDesc = document.getElementById(this.getActiveDescId(treeId));
    if (!activeDesc) {
      console.error('ERROR: no active descendant for current tree.');
      this.initActiveDesc(treeId);
      return;
    }

    if (e.altKey || e.ctrlKey) {
      // Do not intercept combinations such as Alt+Home.
      return;
    }

    if (document.activeElement.tagName == 'INPUT') {
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
        // an input field, or open the block options modal.
        // Algorithm to find the field: do a DFS through the children until
        // we find an INPUT, BUTTON or SELECT element (in which case we use it).
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
            this.notificationsService.speak(
              'Type a value, then press Escape to exit');
            found = true;
            break;
          } else if (currentNode.tagName == 'SELECT') {
            currentNode.focus();
            found = true;
            return;
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

        // If we cannot find a field to interact with, we open the modal for
        // the current block instead.
        if (!found) {
          var blockRootNode = this.getCurrentBlockRootNode_(activeDesc);
          var block = this.getBlockFromRootNode_(blockRootNode);

          e.stopPropagation();
          this.showBlockOptionsModal(block, blockRootNode);
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
            this.audioService.playOopsSound(statusMessage);
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
            this.audioService.playOopsSound('Reached bottom of list.');
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
    } else {
      this.audioService.playOopsSound();
    }
  },
  moveUpOneLevel_: function(treeId) {
    var activeDesc = document.getElementById(this.getActiveDescId(treeId));
    var nextNode = this.getParentListElement_(activeDesc);
    if (nextNode) {
      this.setActiveDesc(nextNode.id, treeId);
    } else {
      this.audioService.playOopsSound();
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
