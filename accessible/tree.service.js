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
 * @fileoverview Angular2 Service that handles keyboard navigation on workspace
 * block groups (internally represented as trees). This is a singleton service
 * for the entire application.
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

      // The suffix used for all IDs of block root elements.
      this.BLOCK_ROOT_ID_SUFFIX_ = blocklyApp.BLOCK_ROOT_ID_SUFFIX;
      // Maps tree IDs to the IDs of their active descendants.
      this.activeDescendantIds_ = {};
      // Array containing all the sidebar button elements.
      this.sidebarButtonElements_ = Array.from(
          document.querySelectorAll('button.blocklySidebarButton'));
    }
  ],
  scrollToElement_: function(elementId) {
    var element = document.getElementById(elementId);
    var documentElement = document.body || document.documentElement;
    if (element.offsetTop < documentElement.scrollTop ||
        element.offsetTop > documentElement.scrollTop + window.innerHeight) {
      window.scrollTo(0, element.offsetTop - 10);
    }
  },

  isLi_: function(node) {
    return node.tagName == 'LI';
  },
  getParentLi_: function(element) {
    var nextNode = element.parentNode;
    while (nextNode && !this.isLi_(nextNode)) {
      nextNode = nextNode.parentNode;
    }
    return nextNode;
  },
  getFirstChildLi_: function(element) {
    var childList = element.children;
    for (var i = 0; i < childList.length; i++) {
      if (this.isLi_(childList[i])) {
        return childList[i];
      } else {
        var potentialElement = this.getFirstChildLi_(childList[i]);
        if (potentialElement) {
          return potentialElement;
        }
      }
    }
    return null;
  },
  getLastChildLi_: function(element) {
    var childList = element.children;
    for (var i = childList.length - 1; i >= 0; i--) {
      if (this.isLi_(childList[i])) {
        return childList[i];
      } else {
        var potentialElement = this.getLastChildLi_(childList[i]);
        if (potentialElement) {
          return potentialElement;
        }
      }
    }
    return null;
  },
  getInitialSiblingLi_: function(element) {
    while (true) {
      var previousSibling = this.getPreviousSiblingLi_(element);
      if (previousSibling && previousSibling.id != element.id) {
        element = previousSibling;
      } else {
        return element;
      }
    }
  },
  getPreviousSiblingLi_: function(element) {
    if (element.previousElementSibling) {
      var sibling = element.previousElementSibling;
      return this.isLi_(sibling) ? sibling : this.getLastChildLi_(sibling);
    } else {
      var parent = element.parentNode;
      while (parent && parent.tagName != 'OL') {
        if (parent.previousElementSibling) {
          var node = parent.previousElementSibling;
          return this.isLi_(node) ? node : this.getLastChildLi_(node);
        } else {
          parent = parent.parentNode;
        }
      }
      return null;
    }
  },
  getNextSiblingLi_: function(element) {
    if (element.nextElementSibling) {
      var sibling = element.nextElementSibling;
      return this.isLi_(sibling) ? sibling : this.getFirstChildLi_(sibling);
    } else {
      var parent = element.parentNode;
      while (parent && parent.tagName != 'OL') {
        if (parent.nextElementSibling) {
          var node = parent.nextElementSibling;
          return this.isLi_(node) ? node : this.getFirstChildLi_(node);
        } else {
          parent = parent.parentNode;
        }
      }
      return null;
    }
  },
  getFinalSiblingLi_: function(element) {
    while (true) {
      var nextSibling = this.getNextSiblingLi_(element);
      if (nextSibling && nextSibling.id != element.id) {
        element = nextSibling;
      } else {
        return element;
      }
    }
  },

  // Returns a list of all focus targets in the workspace, including the
  // "Create new group" button that appears when no blocks are present.
  getWorkspaceFocusTargets_: function() {
    return Array.from(
        document.querySelectorAll('.blocklyWorkspaceFocusTarget'));
  },
  getAllFocusTargets_: function() {
    return this.getWorkspaceFocusTargets_().concat(this.sidebarButtonElements_);
  },
  getNextFocusTargetId_: function(treeId) {
    var trees = this.getAllFocusTargets_();
    for (var i = 0; i < trees.length - 1; i++) {
      if (trees[i].id == treeId) {
        return trees[i + 1].id;
      }
    }
    return null;
  },
  getPreviousFocusTargetId_: function(treeId) {
    var trees = this.getAllFocusTargets_();
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
  // Set the active desc for this tree to its first child.
  initActiveDesc: function(treeId) {
    var tree = document.getElementById(treeId);
    this.setActiveDesc(this.getFirstChildLi_(tree).id, treeId);
  },
  // Make a given element the active descendant of a given tree.
  setActiveDesc: function(newActiveDescId, treeId) {
    if (this.getActiveDescId(treeId)) {
      this.clearActiveDesc(treeId);
    }
    document.getElementById(newActiveDescId).classList.add(
        'blocklyActiveDescendant');
    this.activeDescendantIds_[treeId] = newActiveDescId;

    // Scroll the new active desc into view, if needed. This has no effect
    // for blind users, but is helpful for sighted onlookers.
    this.scrollToElement_(newActiveDescId);
  },
  // This clears the active descendant of the given tree. It is used just
  // before the tree is deleted.
  clearActiveDesc: function(treeId) {
    var activeDesc = document.getElementById(this.getActiveDescId(treeId));
    if (activeDesc) {
      activeDesc.classList.remove('blocklyActiveDescendant');
      delete this.activeDescendantIds_[treeId];
    } else {
      throw Error(
          'The active desc element for the tree with ID ' + treeId +
          ' is invalid.');
    }
  },
  clearAllActiveDescs: function() {
    for (var treeId in this.activeDescendantIds_) {
      var activeDesc = document.getElementById(this.getActiveDescId(treeId));
      if (activeDesc) {
        activeDesc.classList.remove('blocklyActiveDescendant');
      }
    }

    this.activeDescendantIds_ = {};
  },

  isTreeRoot_: function(element) {
    return element.classList.contains('blocklyTree');
  },
  getBlockRootId_: function(blockId) {
    return blockId + this.BLOCK_ROOT_ID_SUFFIX_;
  },
  // Return the 'lowest' Blockly block in the DOM tree that contains the given
  // DOM element.
  getContainingBlock_: function(domElement) {
    var potentialBlockRoot = domElement;
    while (potentialBlockRoot.id.indexOf(this.BLOCK_ROOT_ID_SUFFIX_) === -1) {
      potentialBlockRoot = potentialBlockRoot.parentNode;
    }

    var blockRootId = potentialBlockRoot.id;
    var blockId = blockRootId.substring(
        0, blockRootId.length - this.BLOCK_ROOT_ID_SUFFIX_.length);
    return blocklyApp.workspace.getBlockById(blockId);
  },
  isTopLevelBlock_: function(block) {
    return !block.getParent();
  },
  // Returns whether the given block is at the top level, and has no siblings.
  isIsolatedTopLevelBlock_: function(block) {
    var blockHasNoSiblings = (
        (!block.nextConnection ||
         !block.nextConnection.targetConnection) &&
        (!block.previousConnection ||
         !block.previousConnection.targetConnection));
    return this.isTopLevelBlock_(block) && blockHasNoSiblings;
  },
  safelyRemoveBlock_: function(block, deleteBlockFunc, areNextBlocksRemoved) {
    // Runs the given deleteBlockFunc (which should have the effect of deleting
    // the given block, and possibly others after it if `areNextBlocksRemoved`
    // is true) and then does one of two things:
    // - If the deleted block was an isolated top-level block, or it is a top-
    //   level block and the next blocks are going to be removed, this means
    //   the current tree has no more blocks after the deletion. So, pick a new
    //   tree to focus on.
    // - Otherwise, set the correct new active desc for the current tree.
    var treeId = this.getTreeIdForBlock(block.id);

    var treeCeasesToExist = areNextBlocksRemoved ?
        this.isTopLevelBlock_(block) : this.isIsolatedTopLevelBlock_(block);

    if (treeCeasesToExist) {
      // Find the node to focus on after the deletion happens.
      var nextElementToFocusOn = null;
      var focusTargets = this.getWorkspaceFocusTargets_();
      for (var i = 0; i < focusTargets.length; i++) {
        if (focusTargets[i].id == treeId) {
          if (i + 1 < focusTargets.length) {
            nextElementToFocusOn = focusTargets[i + 1];
          } else if (i > 0) {
            nextElementToFocusOn = focusTargets[i - 1];
          }
          break;
        }
      }

      this.clearActiveDesc(treeId);
      deleteBlockFunc();
      // Invoke a digest cycle, so that the DOM settles (and the "Create new
      // group" button in the workspace shows up, if applicable).
      setTimeout(function() {
        if (nextElementToFocusOn) {
          nextElementToFocusOn.focus();
        } else {
          document.getElementById(
              blocklyApp.ID_FOR_EMPTY_WORKSPACE_BTN).focus();
        }
      });
    } else {
      var blockRootId = this.getBlockRootId_(block.id);
      var blockRootElement = document.getElementById(blockRootId);

      // Find the new active desc for the current tree by trying the following
      // possibilities in order: the parent, the next sibling, and the previous
      // sibling. (If `areNextBlocksRemoved` is true, the next sibling would be
      // moved together with the moved block, so we don't check it.)
      if (areNextBlocksRemoved) {
        var newActiveDesc =
            this.getParentLi_(blockRootElement) ||
            this.getPreviousSiblingLi_(blockRootElement);
      } else {
        var newActiveDesc =
            this.getParentLi_(blockRootElement) ||
            this.getNextSiblingLi_(blockRootElement) ||
            this.getPreviousSiblingLi_(blockRootElement);
      }

      this.clearActiveDesc(treeId);
      deleteBlockFunc();
      // Invoke a digest cycle, so that the DOM settles.
      var that = this;
      setTimeout(function() {
        that.setActiveDesc(newActiveDesc.id, treeId);
        document.getElementById(treeId).focus();
      });
    }
  },
  getTreeIdForBlock: function(blockId) {
    // Walk up the DOM until we get to the root element of the tree.
    var potentialRoot = document.getElementById(this.getBlockRootId_(blockId));
    while (!this.isTreeRoot_(potentialRoot)) {
      potentialRoot = potentialRoot.parentNode;
    }
    return potentialRoot.id;
  },
  // Set focus to the tree containing the given block, and set the tree's
  // active desc to the root element of the given block.
  focusOnBlock: function(blockId) {
    // Invoke a digest cycle, in order to allow the ID of the newly-created
    // tree to be set in the DOM.
    var that = this;
    setTimeout(function() {
      var treeId = that.getTreeIdForBlock(blockId);
      document.getElementById(treeId).focus();
      that.setActiveDesc(that.getBlockRootId_(blockId), treeId);
    });
  },
  showBlockOptionsModal: function(block) {
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
          var blockDescription = that.utilsService.getBlockDescription(block);
          var oldDestinationTreeId = that.getTreeIdForBlock(
              that.blockConnectionService.getMarkedConnectionSourceBlock().id);
          that.clearActiveDesc(oldDestinationTreeId);

          var newBlockId = that.blockConnectionService.attachToMarkedConnection(
              block);
          that.safelyRemoveBlock_(block, function() {
            block.dispose(false);
          }, true);

          // Invoke a digest cycle, so that the DOM settles.
          setTimeout(function() {
            that.focusOnBlock(newBlockId);
            var newDestinationTreeId = that.getTreeIdForBlock(newBlockId);

            if (newDestinationTreeId != oldDestinationTreeId) {
              // The tree ID for a moved block does not seem to behave
              // predictably. E.g. start with two separate groups of one block
              // each, add a link before the block in the second group, and
              // move the block in the first group to that link. The tree ID of
              // the resulting group ends up being the tree ID for the group
              // that was originally first, not second as might be expected.
              // Here, we double-check to ensure that all affected trees have
              // an active desc set.
              if (document.getElementById(oldDestinationTreeId)) {
                var activeDescId = that.getActiveDescId(oldDestinationTreeId);
                var activeDescTreeId = null;
                if (activeDescId) {
                  var oldDestinationBlock = that.getContainingBlock_(
                      document.getElementById(activeDescId));
                  activeDescTreeId = that.getTreeIdForBlock(
                      oldDestinationBlock);
                  if (activeDescTreeId != oldDestinationTreeId) {
                    that.clearActiveDesc(oldDestinationTreeId);
                  }
                }
                that.initActiveDesc(oldDestinationTreeId);
              }
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

        that.safelyRemoveBlock_(block, function() {
          block.dispose(true);
          that.audioService.playDeleteSound();
        }, false);

        setTimeout(function() {
          var message = blockDescription + ' deleted. ' + (
              that.utilsService.isWorkspaceEmpty() ?
              'Workspace is empty.' : 'Now on workspace.');
          that.notificationsService.speak(message);
        });
      },
      translationIdForText: 'DELETE'
    });

    this.blockOptionsModalService.showModal(actionButtonsInfo, function() {
      that.focusOnBlock(block.id);
    });
  },

  moveUpOneLevel_: function(treeId) {
    var activeDesc = document.getElementById(this.getActiveDescId(treeId));
    var nextNode = this.getParentLi_(activeDesc);
    if (nextNode) {
      this.setActiveDesc(nextNode.id, treeId);
    } else {
      this.audioService.playOopsSound();
    }
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
      activeDesc = document.getElementById(this.getActiveDescId(treeId));
    }

    if (e.altKey || e.ctrlKey) {
      // Do not intercept combinations such as Alt+Home.
      return;
    }

    if (document.activeElement.tagName == 'INPUT' ||
        document.activeElement.tagName == 'SELECT') {
      // For input fields, Esc, Enter, and Tab keystrokes are handled specially.
      if (e.keyCode == 9 || e.keyCode == 13 || e.keyCode == 27) {
        // Return the focus to the workspace tree containing the input field.
        document.getElementById(treeId).focus();

        // Note that Tab and Enter events stop propagating, this behavior is
        // handled on other listeners.
        if (e.keyCode == 27 || e.keyCode == 13) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    } else {
      // Outside an input field, Enter, Tab, Esc and navigation keys are all
      // recognized.
      if (e.keyCode == 13) {
        // Enter key. The user wants to interact with a button, interact with
        // an input field, or open the block options modal.
        // Algorithm to find the field: do a DFS through the children until
        // we find an INPUT, BUTTON or SELECT element (in which case we use it).
        // Truncate the search at child LI elements.
        e.stopPropagation();

        var found = false;
        var dfsStack = Array.from(activeDesc.children);
        while (dfsStack.length) {
          var currentNode = dfsStack.shift();
          if (currentNode.tagName == 'BUTTON') {
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
          var block = this.getContainingBlock_(activeDesc);
          this.showBlockOptionsModal(block);
        }
      } else if (e.keyCode == 9) {
        // Tab key. The event is allowed to propagate through.
      } else if ([27, 35, 36, 37, 38, 39, 40].indexOf(e.keyCode) !== -1) {
        if (e.keyCode == 27 || e.keyCode == 37) {
          // Esc or left arrow key. Go up a level, if possible.
          this.moveUpOneLevel_(treeId);
        } else if (e.keyCode == 35) {
          // End key. Go to the last sibling in the subtree.
          var potentialFinalSibling = this.getFinalSiblingLi_(activeDesc);
          if (potentialFinalSibling) {
            this.setActiveDesc(potentialFinalSibling.id, treeId);
          }
        } else if (e.keyCode == 36) {
          // Home key. Go to the first sibling in the subtree.
          var potentialInitialSibling = this.getInitialSiblingLi_(activeDesc);
          if (potentialInitialSibling) {
            this.setActiveDesc(potentialInitialSibling.id, treeId);
          }
        } else if (e.keyCode == 38) {
          // Up arrow key. Go to the previous sibling, if possible.
          var potentialPrevSibling = this.getPreviousSiblingLi_(activeDesc);
          if (potentialPrevSibling) {
            this.setActiveDesc(potentialPrevSibling.id, treeId);
          } else {
            var statusMessage = 'Reached top of list.';
            if (this.getParentLi_(activeDesc)) {
              statusMessage += ' Press left to go to parent list.';
            }
            this.audioService.playOopsSound(statusMessage);
          }
        } else if (e.keyCode == 39) {
          // Right arrow key. Go down a level, if possible.
          var potentialFirstChild = this.getFirstChildLi_(activeDesc);
          if (potentialFirstChild) {
            this.setActiveDesc(potentialFirstChild.id, treeId);
          } else {
            this.audioService.playOopsSound();
          }
        } else if (e.keyCode == 40) {
          // Down arrow key. Go to the next sibling, if possible.
          var potentialNextSibling = this.getNextSiblingLi_(activeDesc);
          if (potentialNextSibling) {
            this.setActiveDesc(potentialNextSibling.id, treeId);
          } else {
            this.audioService.playOopsSound('Reached bottom of list.');
          }
        }

        e.preventDefault();
        e.stopPropagation();
      }
    }
  }
});
