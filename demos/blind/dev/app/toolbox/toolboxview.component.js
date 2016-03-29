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
<div class='treeview'>
<h1 id='toolbox-title'>Toolbox</h1>
<ol #tree *ngIf='makeArray(sightedToolbox) && makeArray(sightedToolbox).length > 0' role='group' class='tree' #tree aria-labelledby='toolbox-title' role='tree' tabIndex='0' id='tree' (keydown)="keyHandler($event)">
{{setActiveAttribute(tree)}}
<li #parent role='treeitem' aria-level='1' aria-selected=false *ngFor='#category of makeArray(sightedToolbox); #i=index'>
  <label #name>{{category.attributes.name.value}}</label>
  {{labelCategory(name, i, tree)}}
  <ol class='children' role='group' *ngIf='getToolboxWorkspace(category).topBlocks_.length > 0'>
    <toolbox-tree-view *ngFor='#block of getToolboxWorkspace(category).topBlocks_' [level]=2 [block]='block' [displayBlockMenu]='true' [clipboardService]='sharedClipboardService'></toolbox-tree-view>
    {{addClass(parent, 'hasChildren')}}
  </ol>
</li>
</ol>
</div>
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
    xhttp.open('GET', 'oneblock_ToolboxXml.xml', true);
    xhttp.send();

    this.toolboxCategories = [];
    this.toolboxWorkspaces = {};
    this.activeDesc;
    this.toolboxTree;
  },
  setActiveAttribute: function(tree){
    if (!this.toolboxTree){
      this.toolboxTree = tree;
    }
    if (!tree.getAttribute('aria-activedescendant')){
      console.log("setting tree active descendant");
      tree.setAttribute('aria-activedescendant', 'tree-node0');
    }
  },
  labelCategory: function(h2, i, tree){
      var parent = h2.parentNode;
      while (parent != null && parent.tagName != 'LI') {
	  parent = parent.parentNode;
      }
      parent.setAttribute("aria-label", h2.innerText);
      parent.id = 'tree-node'+i;
      if (i == 0 && tree.getAttribute('aria-activedescendant') == 'tree-node0') {
        this.addClass(parent, 'activedescendant');
        this.activeDesc = parent;
        parent.setAttribute("aria-selected", "true");
      }
  },
  addClass: function(node, classText) {
    //ensure that node doesn't have class already in it
    var classList = node.className;
    if (classList) {
      classList = classList.split(" ");
    } else {
      classList = [];
    }
    var canAdd = true;
    for (var i=0; i<classList.length; i++){
      if (classList[i] == classText) {
        canAdd = false;
      }
    }
    //add class if it doesn't
    if (canAdd) {
      if (classList.length == 0) {
        node.className += classText;
      } else {
        node.className += (' ' + classText);
      }
    }
  },
  updateSelectedNode: function(node){
    console.log("updating node: " + node.id);
    if (this.activeDesc) {
      this.activeDesc.classList.remove("activedescendant");
      node.classList.add("activedescendant");
      tree.setAttribute("aria-activedescendant",node.id);
      this.activeDesc = node;
      node.setAttribute("aria-selected","true");
      //make sure keyboard focus is on tree as a whole
      //in case before the user was editing a block and keyboard focus got shifted.
      this.toolboxTree.focus();
    } else {
      console.log("there is no active descendant");
    }
  },
  keyHandler: function(e){
      //console.log(document.activeElement);
      var node = this.activeDesc;
      if (!node){
        console.log("no active descendant");
      }
      console.log(e.keyCode);
      switch(e.keyCode){
        case 32:
          //space key:
        case 37:
          //left-facing arrow: go out a level, if possible. If not, do nothing
          e.preventDefault();
          e.stopPropagation();
          console.log("in left arrow section");
          var nextNode = node.parentNode;
          while (nextNode.className != "treeview" && nextNode.tagName != 'LI') {
            nextNode = nextNode.parentNode;
          }
          if (nextNode.className == "treeview" || nextNode == null){
            return;
          }
          this.updateSelectedNode(nextNode);
          break;
        case 38:
          //up-facing arrow: go up a level, if possible. If not, do nothing
          e.preventDefault();
          e.stopPropagation();
          console.log("node passed in: " + node.id);
          var prevSibling = this.getPreviousSibling(node);
          if (prevSibling && prevSibling.tagName != 'H1'){
            this.updateSelectedNode(prevSibling);
          } else {
            console.log("no previous sibling");
          }
          break;
        case 39:
          //right-facing arrow: go in a level, if possible. If not, do nothing
          e.preventDefault();
          e.stopPropagation();
          console.log("in right arrow section");
          var firstChild = this.getFirstChild(node);
          if (firstChild){
            this.updateSelectedNode(firstChild);
          } else {
            console.log("no valid child");
          }
          break;
        case 40:
          //down-facing arrow: go down a level, if possible. If not, do nothing
          //TODO(madeeha): should stop when done with all items at that level. Currently continues
          e.preventDefault();
          e.stopPropagation();
          var nextSibling = this.getNextSibling(node);
          if (nextSibling){
            this.updateSelectedNode(nextSibling);
          } else {
            console.log("no next sibling");
          }
          break;
        case 13:
          //if I've pressed enter, I want to interact with a child
          if (this.activeDesc){
            var children = this.activeDesc.children;
            var child = children[0];
            if (children.length == 1 && child.tagName == 'INPUT' || child.tagName == 'SELECT'){
              child.focus();
              //if it's a dropdown, we want the dropdown to open
              //test this in all browsers, it may break in some places.
              //also see if it's better for screen readers if you put the focus on it after it opens.
              if(child.tagName == 'SELECT') {
                var event;
                event = document.createEvent('MouseEvents');
                event.initMouseEvent('mousedown', true, true, window);
                child.dispatchEvent(event);
              }
            }
          }
      }

    },
  getFirstChild:  function(element){
    //get the children of the element
    //are any of them tabIndex=0?
    //go to the children of the first child
    if (element == null){
      return element;
    } else {
      var childList = element.children;
      for (var i=0; i<childList.length; i++){
        if (childList[i].tagName == 'LI'){
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
      //if there is a sibling, find the list element child of the sibling
      var node = element.nextElementSibling;
      if (node.tagName != 'LI'){
        var listElems = node.getElementsByTagName('li');
        //getElementsByTagName returns in DFS order
        //therefore the first element is the first relevant list child
        return listElems[0];
      } else {
        return element.nextElementSibling;
      }
    } else {
      var parent = element.parentNode;
      while (parent != null && parent.tagName != 'OL'){
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
      var sibling = element.previousElementSibling;
      if (sibling.tagName == 'LI') {
        return sibling;
      } else {
        return this.getLastChild(sibling);
      }
    } else {
      var parent = element.parentNode;
      while (parent != null){
        console.log("looping");
        if (parent.tagName == 'OL') {
          break;
        }
        if (parent.previousElementSibling){
          console.log("parent has a sibling!");
          var node = parent.previousElementSibling;
          if (node.tagName == 'LI'){
            console.log("return the sibling of the parent!");
            return node;
          } else {
            return this.getLastChild(node);
          }
        } else {
          parent = parent.parentNode;
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
      for (var i = childList.length - 1; i >= 0; i--) {
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
