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
      // Keeping track of the last key pressed. If the user presses
      // enter (to edit a text input or press a button), the keyboard
      // focus shifts to that element. In the next keystroke, if the user
      // navigates away from the element using the arrow keys, we want
      // to shift focus back to the tree as a whole.
      this.previousKey_ = null;
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
    runWhilePreservingFocus: function(func, treeId) {
      var activeDescId = this.getActiveDescId(treeId);
      this.unmarkActiveDesc_(activeDescId);
      func();

      // The timeout is needed in order to give the DOM time to stabilize
      // before setting the new active descendant, especially in cases like
      // pasteAbove().
      var that = this;
      setTimeout(function() {
        that.markActiveDesc_(activeDescId);
        that.activeDescendantIds_[treeId] = activeDescId;
        document.getElementById(treeId).focus();
      }, 0);
    },
    // Make a given node the active descendant of a given tree.
    setActiveDesc: function(newActiveDesc, tree) {
      this.unmarkActiveDesc_(this.getActiveDescId(tree.id));
      this.markActiveDesc_(newActiveDesc.id);
      this.activeDescendantIds_[tree.id] = newActiveDesc.id;
    },
    onWorkspaceToolbarKeypress: function(e, treeId) {
      switch (e.keyCode) {
        case 9:
          // 16,9: shift, tab
          if (e.shiftKey) {
            // If the previous key is shift, we're shift-tabbing mode.
            this.focusOnPreviousTree_(treeId);
          } else {
            // If previous key isn't shift, we're tabbing.
            this.focusOnNextTree_(treeId);
          }
          e.preventDefault();
          e.stopPropagation();
          break;
      }
    },
    onKeypress: function(e, tree) {
      var treeId = tree.id;
      var node = document.getElementById(this.getActiveDescId(treeId));
      var keepFocus = this.previousKey_ == 13;
      if (!node) {
        blocklyApp.debug && console.log('KeyHandler: no active descendant');
      }
      switch (e.keyCode) {
        case 9:
          // 16,9: shift, tab
          if (e.shiftKey) {
            // If the previous key is shift, we're shift-tabbing.
            this.focusOnPreviousTree_(treeId);
          } else {
            // If previous key isn't shift, we're tabbing
            // we want to go to the run code button.
            this.focusOnNextTree_(treeId);
          }
          // Setting the previous key variable in each case because
          // we only want to save the previous navigation keystroke,
          // not any typing.
          this.previousKey_ = e.keyCode;
          e.preventDefault();
          e.stopPropagation();
          break;
        case 37:
          // Left-facing arrow: go out a level, if possible. If not, do nothing.
          var nextNode = node.parentNode;
          if (node.tagName == 'BUTTON' || node.tagName == 'INPUT') {
            nextNode = nextNode.parentNode;
          }
          while (nextNode && nextNode.className != 'treeview' &&
            nextNode.tagName != 'LI') {
            nextNode = nextNode.parentNode;
          }
          if (!nextNode || nextNode.className == 'treeview') {
            return;
          }
          this.setActiveDesc(nextNode, tree);
          this.previousKey_ = e.keyCode;
          e.preventDefault();
          e.stopPropagation();
          break;
        case 38:
          // Up-facing arrow: go up a level, if possible. If not, do nothing.
          var prevSibling = this.getPreviousSibling(node);
          if (prevSibling && prevSibling.tagName != 'H1') {
            this.setActiveDesc(prevSibling, tree);
          } else {
            blocklyApp.debug && console.log('no previous sibling');
          }
          this.previousKey_ = e.keyCode;
          e.preventDefault();
          e.stopPropagation();
          break;
        case 39:
          var firstChild = this.getFirstChild(node);
          if (firstChild) {
            this.setActiveDesc(firstChild, tree);
          } else {
            blocklyApp.debug && console.log('no valid child');
          }
          this.previousKey_ = e.keyCode;
          e.preventDefault();
          e.stopPropagation();
          break;
        case 40:
          // Down-facing arrow: go down a level, if possible.
          // If not, do nothing.
          var nextSibling = this.getNextSibling(node);
          if (nextSibling) {
            this.setActiveDesc(nextSibling, tree);
          } else {
            blocklyApp.debug && console.log('no next sibling');
          }
          this.previousKey_ = e.keyCode;
          e.preventDefault();
          e.stopPropagation();
          break;
        case 13:
          // If I've pressed enter, I want to interact with a child.
          var activeDesc = node;
          if (activeDesc) {
            var children = activeDesc.children;
            var child = children[0];
            if (children.length == 1 && (child.tagName == 'INPUT' ||
                child.tagName == 'BUTTON')) {
              if (child.tagName == 'BUTTON') {
                child.click();
              }
              else if (child.tagName == 'INPUT') {
                child.focus();
              }
            }
          } else {
            blocklyApp.debug && console.log('no activeDesc');
          }
          this.previousKey_ = e.keyCode;
          break;
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
    getNextSibling: function(element) {
      if (element.nextElementSibling) {
        // If there is a sibling, find the list element child of the sibling.
        var node = element.nextElementSibling;
        if (node.tagName != 'LI') {
          var listElems = node.getElementsByTagName('li');
          // getElementsByTagName returns in DFS order
          // therefore the first element is the first relevant list child.
          return listElems[0];
        } else {
          return element.nextElementSibling;
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
        blocklyApp.debug && console.log('no last child');
        return null;
      }
    }
});
