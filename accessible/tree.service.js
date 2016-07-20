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
    constructor: function() {
      // Stores active descendant ids for each tree in the page.
      this.activeDescendantIds_ = {};
    },
    getToolboxTreeNode_: function() {
      return document.getElementById('blockly-toolbox-tree');
    },
    getWorkspaceToolbarButtonNodes_: function() {
      return Array.from(document.querySelectorAll(
          'button.blocklyWorkspaceToolbarButton'));
    },
    // Returns a list of all top-level workspace tree nodes on the page.
    getWorkspaceTreeNodes_: function() {
      return Array.from(document.querySelectorAll('ol.blocklyWorkspaceTree'));
    },
    // Returns a list of all top-level tree nodes on the page.
    getAllTreeNodes_: function() {
      var treeNodes = [this.getToolboxTreeNode_()];
      treeNodes = treeNodes.concat(this.getWorkspaceToolbarButtonNodes_());
      treeNodes = treeNodes.concat(this.getWorkspaceTreeNodes_());
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
          return true;
        }
      }
      return false;
    },
    focusOnNextTree_: function(treeId) {
      var trees = this.getAllTreeNodes_();
      for (var i = 0; i < trees.length - 1; i++) {
        if (trees[i].id == treeId) {
          trees[i + 1].focus();
          return true;
        }
      }
      return false;
    },
    focusOnPreviousTree_: function(treeId) {
      var trees = this.getAllTreeNodes_();
      for (var i = trees.length - 1; i > 0; i--) {
        if (trees[i].id == treeId) {
          trees[i - 1].focus();
          return true;
        }
      }
      return false;
    },
    getActiveDescId: function(treeId) {
      return this.activeDescendantIds_[treeId] || '';
    },
    unmarkActiveDesc_: function(activeDescId) {
      var activeDesc = document.getElementById(activeDescId);
      if (activeDesc) {
        activeDesc.classList.remove('blocklyActiveDescendant');
        activeDesc.setAttribute('aria-selected', 'false');
      }
    },
    markActiveDesc_: function(activeDescId) {
      var newActiveDesc = document.getElementById(activeDescId);
      newActiveDesc.classList.add('blocklyActiveDescendant');
      newActiveDesc.setAttribute('aria-selected', 'true');
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
    // Make a given node the active descendant of a given tree.
    setActiveDesc: function(newActiveDescId, treeId) {
      this.unmarkActiveDesc_(this.getActiveDescId(treeId));
      this.markActiveDesc_(newActiveDescId);
      this.activeDescendantIds_[treeId] = newActiveDescId;
    },
    onWorkspaceToolbarKeypress: function(e, treeId) {
      if (e.keyCode == 9) {
        // Tab key.
        if (e.shiftKey) {
          this.focusOnPreviousTree_(treeId);
        } else {
          this.focusOnNextTree_(treeId);
        }
        e.preventDefault();
        e.stopPropagation();
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
    onKeypress: function(e, tree) {
      var treeId = tree.id;
      var activeDesc = document.getElementById(this.getActiveDescId(treeId));
      if (!activeDesc) {
        console.error('ERROR: no active descendant for current tree.');

        // TODO(sll): Generalize this to other trees (outside the workspace).
        var workspaceTreeNodes = this.getWorkspaceTreeNodes_();
        for (var i = 0; i < workspaceTreeNodes.length; i++) {
          if (workspaceTreeNodes[i].id == treeId) {
            // Set the active desc to the first child in this tree.
            this.setActiveDesc(
                this.getFirstChild(workspaceTreeNodes[i]).id, treeId);
            break;
          }
        }
        return;
      }

      if (document.activeElement.tagName == 'INPUT') {
        // For input fields, only Esc and Tab keystrokes are handled specially.
        if (e.keyCode == 27 || e.keyCode == 9) {
          // For Esc and Tab keys, the focus is removed from the input field.
          this.focusOnCurrentTree_(treeId);

          // In addition, for Tab keys, the user tabs to the previous/next tree.
          if (e.keyCode == 9) {
            if (e.shiftKey) {
              this.focusOnPreviousTree_(treeId);
            } else {
              this.focusOnNextTree_(treeId);
            }
          }

          e.preventDefault();
          e.stopPropagation();
        }
      } else {
        // Outside an input field, Enter, Tab and navigation keys are all
        // recognized.
        if (e.keyCode == 13) {
          // Enter key. The user wants to interact with a button or an input
          // field.
          if (activeDesc.children.length == 1) {
            var child = activeDesc.children[0];
            if (child.tagName == 'BUTTON') {
              child.click();
            } else if (child.tagName == 'INPUT') {
              child.focus();
            }
          }
        } else if (e.keyCode == 9) {
          // Tab key.
          if (e.shiftKey) {
            this.focusOnPreviousTree_(treeId);
          } else {
            this.focusOnNextTree_(treeId);
          }
          e.preventDefault();
          e.stopPropagation();
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
            var nextNode = activeDesc.parentNode;
            if (this.isButtonOrFieldNode_(activeDesc)) {
              nextNode = nextNode.parentNode;
            }
            while (nextNode && nextNode.tagName != 'LI') {
              nextNode = nextNode.parentNode;
            }
            if (nextNode) {
              this.setActiveDesc(nextNode.id, treeId);
            }
          } else if (e.keyCode == 38) {
            // Up arrow key. Go to the previous sibling, if possible.
            var prevSibling = this.getPreviousSibling(activeDesc);
            if (prevSibling) {
              this.setActiveDesc(prevSibling.id, treeId);
            }
          } else if (e.keyCode == 39) {
            // Right arrow key. Go down a level, if possible.
            var firstChild = this.getFirstChild(activeDesc);
            if (firstChild) {
              this.setActiveDesc(firstChild.id, treeId);
            }
          } else if (e.keyCode == 40) {
            // Down arrow key. Go to the next sibling, if possible.
            var nextSibling = this.getNextSibling(activeDesc);
            if (nextSibling) {
              this.setActiveDesc(nextSibling.id, treeId);
            }
          }

          e.preventDefault();
          e.stopPropagation();
        }
      }
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
