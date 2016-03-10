/**
 * Blockly Demos: BlindBlockly
 *
 * Copyright 2016 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Angular2 Component that details how a toolbox is rendered
 * in BlindBlockly. Also handles any interactions with the toolbox.
 * @author madeeha@google.com (Madeeha Ghori)
 */
var app = app || {};

app.ToolboxView = ng.core
.Component({
  selector: 'toolbox-view',
  template: `
<h1>Toolbox</h1>
<ol tabIndex='0' *ngFor='#category of makeArray(sightedToolbox)' (keydown)="keyHandler($event)">
  <h2 #name>{{category.attributes.name.value}}</h2>
  <toolbox-tree-view *ngFor='#block of getToolboxWorkspace(category).topBlocks_' [block]='block' [displayBlockMenu]='true' [clipboardService]='sharedClipboardService'></toolbox-tree-view>
</ol>
  `,
  directives: [app.ToolboxTreeView],
})
.Class({
  constructor: function() {
    console.log('toolbox constructor');
    var _this = this;
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (xhttp.readyState == 4 && xhttp.status == 200) {
        _this.sightedToolbox = xhttp.responseXML;
      }
    };
    xhttp.open('GET', 'ToolboxXml.xml', true);
    xhttp.send();

    this.toolboxCategories = [];
    this.toolboxWorkspaces = {};
  },
  keyHandler: function(e){
      //console.log(document.activeElement);
      var currentElement = document.activeElement;
      console.log(e.keyCode);
      switch (e.keyCode){
        case 37:
          //left-facing arrow: go out a level, if possible. If not, go to the previous top-level block
          var tempElement = currentElement.parentNode;
          while (tempElement != null && tempElement.tabIndex != 0) {
            tempElement = tempElement.parentNode;
          }
          if (tempElement == null){
            return;
            e.preventDefault();
          }
          tempElement.focus();
          console.log("focus on parent");
          e.preventDefault();
          break;
        case 38:
          //up-facing arrow: go up a level, if possible. If not, make done sound
          var prevSibling = this.getPreviousSibling(currentElement);
          if (prevSibling){
            prevSibling.focus();
          } else {
            console.log("no previous sibling");
          }
          e.preventDefault();
          break;
        case 39:
          //right-facing arrow: go in a level, if possible. If not, go to next top-level block
          var firstChild = this.getFirstChild(currentElement);
          if (firstChild){
            firstChild.focus();
          } else {
            console.log("no valid child");
          }
          e.preventDefault();
          break;
        case 40:
          //down-facing arrow: go down a level, if possible. If not, make done sound
          var nextSibling = this.getNextSibling(currentElement);
          if (nextSibling){
            nextSibling.focus();
          } else {
            console.log("no next sibling");
          }
          e.preventDefault();
          break;
      }
    },
    getFirstChild: function(element){
      //get the children of the element
      //are any of them tabIndex=0?
      //go to the children of the first child
      if (element == null){
        return element;
      } else {
        var childList = element.children;
        for (var i=0; i<childList.length; i++){
          if (childList[i].tabIndex == 0){
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
    getNextSibling: function(element){
      if (element.nextElementSibling){
        return element.nextElementSibling;
      } else {
        var parent = element.parentNode;
        while (parent != null){
          if (parent.nextElementSibling){
            var node = parent.nextElementSibling;
            if (node.tabIndex == 0){
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
    getPreviousSibling: function(element){
      if (element.previousElementSibling){
        console.log("found a previous sibling!");
        var sibling = element.previousElementSibling;
        if (sibling.tabIndex == '0') {
          return sibling;
        } else {
          return this.getLastChild(sibling);
        }
      } else {
        var parent = element.parentNode;
        console.log(parent);
        while (parent != null){
          console.log("looping");
          if (parent.tagName == 'OL') {
            break;
          }
          if (parent.previousElementSibling){
            console.log("parent has a sibling!");
            var node = parent.previousElementSibling;
            if (node.tabIndex == 0){
              console.log("return the sibling of the parent!");
              return node;
            } else {
              return this.getLastChild(node);
            }
          } else {
            parent = parent.parentNode;
            console.log(parent);
          }
        }
        return null;
      }
    },
    getLastChild: function(element){
      if (element == null){
        console.log("no element");
        return element;
      } else {
        var childList = element.children;
        for (var i=childList.length-1; i>=0; i--){
          if (childList[i].tabIndex == 0){
            return childList[i];
          } else {
            var potentialElement = this.getLastChild(childList[i]);
            if (potentialElement) {
              return potentialElement;
            }
          }
        }
        console.log("no last child");
        return null;
      }
    },
  makeArray: function(val) {
    if (val) {
      if (this.toolboxCategories.length > 0) {
        return this.toolboxCategories;
      } else {
        this.toolboxCategories = Array.from(
            val.documentElement.getElementsByTagName('category'));
        return this.toolboxCategories;
      }
    }
  },
  getToolboxWorkspace: function(categoryNode) {
    var catName = categoryNode.attributes.name.value;
    if (this.toolboxWorkspaces[catName]) {
      return this.toolboxWorkspaces[catName];
    } else {
      var categoryWorkspace = new Blockly.Workspace();
      Blockly.Xml.domToWorkspace(categoryWorkspace, categoryNode);
      this.toolboxWorkspaces[catName] = categoryWorkspace;
      return this.toolboxWorkspaces[catName];
    }
  },
  log: function(obj) {
    console.log(obj);
  }
});
