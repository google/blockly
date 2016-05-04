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
 * @fileoverview Angular2 Component that details how a toolbox is rendered
 * in AccessibleBlockly. Also handles any interactions with the toolbox.
 * @author madeeha@google.com (Madeeha Ghori)
 */
blocklyApp.ToolboxView = ng.core
.Component({
  selector: 'toolbox-view',
  template: `
    <h3 #toolboxTitle id="blockly-toolbox-title">Toolbox</h3>
    <ol #tree id="blockly-toolbox-tree" *ngIf="makeArray(sightedToolbox) && makeArray(sightedToolbox).length > 0" tabIndex="0" role="group" class="blocklyTree" [attr.aria-labelledby]="toolboxTitle.id" (keydown)="treeService.keyHandler($event, tree)">
    {{treeService.setActiveAttribute(tree)}}
    <li #parent *ngIf="toolboxHasCategories" role="treeitem" aria-level="1" aria-selected=false *ngFor="#category of makeArray(sightedToolbox); #i=index">
      <label #name>{{category.attributes.name.value}}</label>
      {{labelCategory(name, i, tree)}}
      <ol  role="group" *ngIf="getToolboxWorkspace(category).topBlocks_.length > 0">
        <toolbox-tree-view *ngFor="#block of getToolboxWorkspace(category).topBlocks_" [level]=2 [block]="block" [displayBlockMenu]="true" [clipboardService]="sharedClipboardService"></toolbox-tree-view>
        {{addClass(parent, "blocklyHasChildren")}}
      </ol>
    </li>
    <div *ngIf="!toolboxHasCategories">
      <toolbox-tree-view *ngFor="#block of getToolboxWorkspace(toolboxCategories[0]).topBlocks_; #i=index" [level]=1 [block]="block" [displayBlockMenu]="true" [clipboardService]="sharedClipboardService" [index]="i" [tree]="tree"></toolbox-tree-view>
    </div>
    </ol>
  `,
  directives: [blocklyApp.ToolboxTreeView],
})
.Class({
  constructor: [blocklyApp.TreeService, function(_service) {
    var _this = this;
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (xhttp.readyState == 4 && xhttp.status == 200) {
        _this.sightedToolbox = xhttp.responseXML;
      }
    };
    xhttp.open('GET', blocklyApp.gameManager
      .levelToolboxes[blocklyApp.gameManager.level], true);
    xhttp.send();

    this.toolboxCategories = [];
    this.toolboxWorkspaces = {};
    this.treeService = _service;

    this.toolboxHasCategories = false;
  }],
  labelCategory: function(h2, i, tree) {
    var parent = h2.parentNode;
    while (parent != null && parent.tagName != 'LI') {
      parent = parent.parentNode;
    }
    parent.setAttribute('aria-label', h2.innerText);
    parent.id = 'toolbox-tree-node' + i;
    if (i == 0 && tree.getAttribute('aria-activedescendant') ==
      'toolbox-tree-node0') {
      this.addClass(parent, 'blocklyActiveDescendant');
      this.treeService.setActiveDesc(parent, tree.id);
      parent.setAttribute('aria-selected', 'true');
    }
  },
  addClass: function(node, classText) {
    // ensure that node doesn't have class already in it
    var classList = node.className;
    if (classList) {
      classList = classList.split(' ');
    } else {
      classList = [];
    }
    var canAdd = true;
    for (var i = 0; i < classList.length; i++) {
      if (classList[i] == classText) {
        canAdd = false;
      }
    }
    // add class if it doesn't
    if (canAdd) {
      if (classList.length) {
        node.className += (' ' + classText);
      } else {
        node.className += classText;
      }
    }
  },
  makeArray: function(val) {
    if (val) {
      if (this.toolboxCategories.length) {
        return this.toolboxCategories;
      } else {
        var categories = val.documentElement.getElementsByTagName('category');
        if (categories.length) {
          this.toolboxHasCategories = true;
          this.toolboxCategories = Array.from(categories);
          return this.toolboxCategories;
        }
        this.toolboxHasCategories = false;
        this.toolboxCategories = Array.from(val.getElementsByTagName('xml'));
        return this.toolboxCategories;
      }
    }
  },
  getToolboxWorkspace: function(categoryNode) {
    if (categoryNode.attributes.name) {
      var catName = categoryNode.attributes.name.value;
    } else {
      var catName = 'no-category';
    }
    if (this.toolboxWorkspaces[catName]) {
      return this.toolboxWorkspaces[catName];
    } else {
      var categoryWorkspace = new Blockly.Workspace();
      Blockly.Xml.domToWorkspace(categoryWorkspace, categoryNode);
      this.toolboxWorkspaces[catName] = categoryWorkspace;
      return this.toolboxWorkspaces[catName];
    }
  }
});

