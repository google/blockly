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
 * @fileoverview Angular2 Service that handles all tree keyboard navigation.
 * @author madeeha@google.com (Madeeha Ghori)
 */

blocklyApp.TreeService = ng.core
  .Class({
    constructor: function() {
      blocklyApp.debug && console.log('making a new tree service');
      // Keeping track of the active descendants in each tree.
      this.activeDesc_ = Object.create(null);
      this.trees = document.getElementsByClassName('blocklyTree');
      // Keeping track of the last key pressed. If the user presses
      // enter (to edit a text input or press a button), the keyboard
      // focus shifts to that element. In the next keystroke, if the user
      // navigates away from the element using the arrow keys, we want
      // to shift focus back to the tree as a whole.
      this.previousKey_ = null;
    },
    createId: function(obj) {
      if (obj && obj.id) {
        return obj.id;
      }
      return 'blockly-' + Blockly.genUid();
    },
    setActiveDesc: function(node, id) {
      blocklyApp.debug && console.log('setting active descendant for tree ' + id);
      this.activeDesc_[id] = node;
    },
    getActiveDesc: function(id) {
      return this.activeDesc_[id] ||
          document.getElementById((document.getElementById(id)).getAttribute('aria-activedescendant'));
    },
    // Makes a given node the active descendant of a given tree.
    updateSelectedNode: function(node, tree, keepFocus) {
      blocklyApp.debug && console.log('updating node: ' + node.id);
      var treeId = tree.id;
      var activeDesc = this.getActiveDesc(treeId);
      if (activeDesc) {
        activeDesc.classList.remove('blocklyActiveDescendant');
        activeDesc.setAttribute('aria-selected', 'false');
      } else {
        blocklyApp.debug && console.log('updateSelectedNode: there is no active descendant');
      }
      node.classList.add('blocklyActiveDescendant');
      tree.setAttribute('aria-activedescendant', node.id);
      this.setActiveDesc(node, treeId);
      node.setAttribute('aria-selected', 'true');

      // Make sure keyboard focus is on tree as a whole
      // in case focus was previously on a button or input
      // element.
      if (keepFocus) {
        tree.focus();
      }
    },
    onWorkspaceToolbarKeypress: function(e, treeId) {
      blocklyApp.debug && console.log(e.keyCode + 'inside TreeService onWorkspaceToolbarKeypress');
      switch (e.keyCode) {
        case 9:
          // 16,9: shift, tab
          if (e.shiftKey) {
            blocklyApp.debug && console.log('shifttabbing');
            // If the previous key is shift, we're shift-tabbing mode.
            this.goToPreviousTree(treeId);
          } else {
            // If previous key isn't shift, we're tabbing.
            this.goToNextTree(treeId);
          }
          e.preventDefault();
          e.stopPropagation();
          break;
      }
    },
    goToNextTree: function(treeId, e) {
      for (var i = 0; i < this.trees.length; i++) {
        if (this.trees[i].id == treeId) {
          if (i + 1 < this.trees.length) {
            this.trees[i + 1].focus();
          }
          break;
        }
      }
    },
    goToPreviousTree: function(treeId, e) {
      if (treeId == this.trees[0].id) {
        return;
      }
      for (var i = (this.trees.length - 1); i >= 0; i--) {
        if (this.trees[i].id == treeId) {
          if (i - 1 < this.trees.length) {
            this.trees[i - 1].focus();
          }
          break;
        }
      }
    },
    onKeypress: function(e, tree) {
      var treeId = tree.id;
      var node = this.getActiveDesc(treeId);
      var keepFocus = this.previousKey_ == 13;
      if (!node) {
        blocklyApp.debug && console.log('KeyHandler: no active descendant');
      }
      blocklyApp.debug && console.log(e.keyCode + ': inside TreeService');
      switch (e.keyCode) {
        case 9:
          // 16,9: shift, tab
          if (e.shiftKey) {
            blocklyApp.debug && console.log('shifttabbing');
            // If the previous key is shift, we're shift-tabbing.
            this.goToPreviousTree(treeId);
          } else {
            // If previous key isn't shift, we're tabbing
            // we want to go to the run code button.
            this.goToNextTree(treeId);
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
          blocklyApp.debug && console.log('in left arrow section');
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
          this.updateSelectedNode(nextNode, tree, keepFocus);
          this.previousKey_ = e.keyCode;
          e.preventDefault();
          e.stopPropagation();
          break;
        case 38:
          // Up-facing arrow: go up a level, if possible. If not, do nothing.
          blocklyApp.debug && console.log('node passed in: ' + node.id);
          var prevSibling = this.getPreviousSibling(node);
          if (prevSibling && prevSibling.tagName != 'H1') {
            this.updateSelectedNode(prevSibling, tree, keepFocus);
          } else {
            blocklyApp.debug && console.log('no previous sibling');
          }
          this.previousKey_ = e.keyCode;
          e.preventDefault();
          e.stopPropagation();
          break;
        case 39:
          blocklyApp.debug && console.log('in right arrow section');
          var firstChild = this.getFirstChild(node);
          if (firstChild) {
            this.updateSelectedNode(firstChild, tree, keepFocus);
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
          blocklyApp.debug && console.log('preventing propogation');
          var nextSibling = this.getNextSibling(node);
          if (nextSibling) {
            this.updateSelectedNode(nextSibling, tree, keepFocus);
          } else {
            blocklyApp.debug && console.log('no next sibling');
          }
          this.previousKey_ = e.keyCode;
          e.preventDefault();
          e.stopPropagation();
          break;
        case 13:
          // If I've pressed enter, I want to interact with a child.
          blocklyApp.debug && console.log('enter is pressed');
          var activeDesc = this.getActiveDesc(treeId);
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
          blocklyApp.debug && console.log('looping');
          if (parent.tagName == 'OL') {
            break;
          }
          if (parent.previousElementSibling) {
            blocklyApp.debug && console.log('parent has a sibling!');
            var node = parent.previousElementSibling;
            if (node.tagName == 'LI') {
              blocklyApp.debug && console.log('return the sibling of the parent!');
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
        blocklyApp.debug && console.log('no element');
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
