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
      <ol #tree id="blockly-toolbox-tree" role="group" class="blocklyTree"
          *ngIf="makeArray(sightedToolbox) && makeArray(sightedToolbox).length > 0" 
          tabIndex="0" [attr.aria-labelledby]="toolboxTitle.id" 
          [attr.aria-activedescendant]="tree.getAttribute('aria-activedescendant') || tree.id + '-node0' " 
          (keydown)="treeService.onKeypress($event, tree)">
        {{storeTree(tree)}}
        <li #parent [id]="idMap['Parent' + i]" role="treeitem" 
            [ngClass]="{blocklyHasChildren: true,
                blocklyActiveDescendant: tree.getAttribute('aria-activedescendant') == idMap['Parent' + i]}" 
            *ngIf="toolboxHasCategories" *ngFor="#category of makeArray(sightedToolbox); #i=index" 
            aria-level="1" aria-selected=false>
          <!-- TODO(sll@): This div is required. There seems to be some bug in Angular that makes it 
          access index=undefined. Talk to fraser@.-->
          <div *ngIf="category && category.attributes">
            <label [id]="idMap['Label' + i]" #name>{{category.attributes.name.value}}</label>
            {{labelCategory(name, i, tree)}}
            <ol role="group" *ngIf="getToolboxWorkspace(category).topBlocks_.length > 0">
              <toolbox-tree-view *ngFor="#block of getToolboxWorkspace(category).topBlocks_" [level]=2 [block]="block" [displayBlockMenu]="true" [clipboardService]="clipboardService"></toolbox-tree-view>
            </ol>
          </div>
        </li>
        <div *ngIf="!toolboxHasCategories">
          <toolbox-tree-view *ngFor="#block of getToolboxWorkspace(toolboxCategories[0]).topBlocks_; #i=index" [level]=1 [block]="block" [displayBlockMenu]="true" [clipboardService]="clipboardService" [index]="i" [tree]="tree" [noCategories]="true"></toolbox-tree-view>
        </div>
      </ol>
    `,
    directives: [blocklyApp.ToolboxTreeView],
  })
  .Class({
    constructor: [blocklyApp.TreeService, blocklyApp.UtilsService, function(_treeService, _utilsService) {
      this.sightedToolbox = document.getElementById('blockly-toolbox-xml');

      this.toolboxCategories = [];
      this.toolboxWorkspaces = Object.create(null);
      this.treeService = _treeService;
      this.utilsService = _utilsService;

      this.toolboxHasCategories = false;
    }],
    ngOnInit: function() {
      var elementsNeedingIds = [];
      var categories = this.makeArray(this.sightedToolbox);
      if (this.toolboxHasCategories) {
        for (var i = 0; i < categories.length; i++){
          elementsNeedingIds.push('Parent' + i);
          elementsNeedingIds.push('Label' + i);
        }
        this.idMap = this.utilsService.generateIds(elementsNeedingIds);
        this.idMap['Parent0'] = 'blockly-toolbox-tree-node0';
      }
    },
    labelCategory: function(label, i, tree) {
      var parent = label.parentNode;
      while (parent && parent.tagName != 'LI') {
        parent = parent.parentNode;
      }
      parent.setAttribute('aria-label', label.innerText);
      parent.id = 'blockly-toolbox-tree-node' + i;
      if (i == 0 && tree.getAttribute('aria-activedescendant') ==
        'blockly-toolbox-tree-node0') {
        this.treeService.setActiveDesc(parent, tree.id);
        parent.setAttribute('aria-selected', 'true');
      }
    },
    makeArray: function(val) {
      if (val) {
        if (this.toolboxCategories.length) {
          return this.toolboxCategories;
        } else {
          var categories = val.getElementsByTagName('category');
          if (categories.length) {
            this.toolboxHasCategories = true;
            this.toolboxCategories = Array.from(categories);
            return this.toolboxCategories;
          }
          this.toolboxHasCategories = false;
          this.toolboxCategories = [Array.from(val.children)];
          return this.toolboxCategories;
        }
      }
    },
    getToolboxWorkspace: function(categoryNode) {
      if (categoryNode.attributes && categoryNode.attributes.name) {
        var catName = categoryNode.attributes.name.value;
      } else {
        var catName = 'no-category';
      }
      if (this.toolboxWorkspaces[catName]) {
        return this.toolboxWorkspaces[catName];
      } else {
        var categoryWorkspace = new Blockly.Workspace();
        if (catName == 'no-category'){
          for (var i=0; i < categoryNode.length; i++){
            Blockly.Xml.domToBlock(categoryWorkspace, categoryNode[i]);
          }
        } else {
          Blockly.Xml.domToWorkspace(categoryWorkspace, categoryNode);
        }
        this.toolboxWorkspaces[catName] = categoryWorkspace;
        return this.toolboxWorkspaces[catName];
      }
    },
    storeTree: function(_tree) {
      if (!this.tree){
        this.tree = _tree;
      }
    }
  });

