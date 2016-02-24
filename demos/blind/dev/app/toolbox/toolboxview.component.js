/**
 * Blockly Demos: BlindBlockly
 *
 * Copyright 2012 Google Inc.
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
 * @fileoverview Angular2 Component that details how a toolbox is rendered in BlindBlockly. Also handles any interactions with the toolbox.
 * @author madeeha@google.com (Madeeha Ghori)
 */
var app = app || {};

app.ToolboxView = ng.core
.Component({
  selector: 'toolbox-view',
  template: `
<h1>Toolbox</h1>
<ul *ngFor='#category of makeArray(sightedToolbox)'>
  <h2 #name>{{category.attributes.name.value}}</h2>
  <toolbox-tree-view *ngFor='#block of getToolboxWorkspace(category).topBlocks_' [block]='block' [displayBlockMenu]='true'></toolbox-tree-view>
</ul>
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
    this.markedInputBlock = app.markedInputBlock;
    console.log(this.sightedToolbox);
  },
  makeArray: function(val) {
    if (val){
      var children = val.documentElement.children;
      if (this.toolboxCategories.length > 0) {
        return this.toolboxCategories;
      } else {
        this.toolboxCategories.length = 0;
        var temp = Array.from(children);
        for (var i = 0; i < temp.length; i++) {
          tempNode = temp[i];
          if (tempNode.nodeName == 'category') {
            this.toolboxCategories.push(tempNode);
          }
        }
        return this.toolboxCategories;
      }
    }
  },
  getToolboxWorkspace: function(categoryNode) {
    var catName = categoryNode.attributes.name.value;
    if (this.toolboxWorkspaces[catName]) {
      return this.toolboxWorkspaces[catName];
    } else {
      var tempWorkspace = new Blockly.Workspace();
      Blockly.Xml.domToWorkspace(tempWorkspace, categoryNode);
      this.toolboxWorkspaces[catName] = tempWorkspace;
      return this.toolboxWorkspaces[catName];
    }
  },
  log: function(obj) {
    console.log(obj);
  }
});
