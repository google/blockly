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

blocklyApp.ToolboxComponent = ng.core
  .Component({
    selector: 'blockly-toolbox',
    template: `
      <h3 #toolboxTitle id="blockly-toolbox-title">Toolbox</h3>
      <ol #tree
          id="blockly-toolbox-tree" role="group" class="blocklyTree"
          *ngIf="toolboxCategories && toolboxCategories.length > 0" tabIndex="0"
          [attr.aria-labelledby]="toolboxTitle.id"
          [attr.aria-activedescendant]="tree.getAttribute('aria-activedescendant') || tree.id + '-node0' "
          (keydown)="treeService.onKeypress($event, tree)">
        <template [ngIf]="xmlHasCategories">
          <li #parent
              [id]="idMap['Parent' + i]" role="treeitem"
              [ngClass]="{blocklyHasChildren: true, blocklyActiveDescendant: tree.getAttribute('aria-activedescendant') == idMap['Parent' + i]}"
              *ngFor="#category of toolboxCategories; #i=index"
              aria-level="1" aria-selected=false>
            <div *ngIf="category && category.attributes">
              <label [id]="idMap['Label' + i]" #name>
                {{category.attributes.name.value}}
              </label>
              {{labelCategory(name, i, tree)}}
              <ol role="group" *ngIf="getToolboxWorkspace(category).topBlocks_.length > 0">
                <blockly-toolbox-tree *ngFor="#block of getToolboxWorkspace(category).topBlocks_"
                                      [level]=2 [block]="block"
                                      [displayBlockMenu]="true"
                                      [clipboardService]="clipboardService">
                </blockly-toolbox-tree>
              </ol>
            </div>
          </li>
        </template>
        <div *ngIf="!xmlHasCategories">
          <blockly-toolbox-tree *ngFor="#block of getToolboxWorkspace(toolboxCategories[0]).topBlocks_; #i=index"
                                [level]=1 [block]="block"
                                [displayBlockMenu]="true"
                                [clipboardService]="clipboardService"
                                [index]="i" [tree]="tree"
                                [noCategories]="true">
          </blockly-toolbox-tree>
        </div>
      </ol>
    `,
    directives: [blocklyApp.ToolboxTreeComponent],
    providers: [blocklyApp.TreeService],
  })
  .Class({
    constructor: [
        blocklyApp.TreeService, blocklyApp.UtilsService,
        function(_treeService, _utilsService) {
      this.toolboxCategories = [];
      this.toolboxWorkspaces = Object.create(null);
      this.treeService = _treeService;
      this.utilsService = _utilsService;

      this.xmlHasCategories = false;
    }],
    ngOnInit: function() {
      // Note that sometimes the toolbox may not have categories; it may
      // display individual blocks directly (which is often the case in,
      // e.g., Blockly Games).
      var xmlToolboxElt = document.getElementById('blockly-toolbox-xml');
      var xmlCategoryElts = xmlToolboxElt.getElementsByTagName('category');
      if (xmlCategoryElts.length) {
        this.xmlHasCategories = true;
        this.toolboxCategories = Array.from(xmlCategoryElts);

        var elementsNeedingIds = [];
        for (var i = 0; i < this.toolboxCategories.length; i++) {
          elementsNeedingIds.push('Parent' + i, 'Label' + i);
        }
        this.idMap = this.utilsService.generateIds(elementsNeedingIds);
        this.idMap['Parent0'] = 'blockly-toolbox-tree-node0';
      } else {
        // Create a single category is created with all the top-level blocks.
        this.xmlHasCategories = false;
        this.toolboxCategories = [Array.from(xmlToolboxElt.children)];
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
        this.treeService.setActiveDesc(parent, tree);
      }
    },
    getToolboxWorkspace: function(categoryNode) {
      if (categoryNode.attributes && categoryNode.attributes.name) {
        var categoryName = categoryNode.attributes.name.value;
      } else {
        var categoryName = 'no-category';
      }
      if (this.toolboxWorkspaces[categoryName]) {
        return this.toolboxWorkspaces[categoryName];
      } else {
        var categoryWorkspace = new Blockly.Workspace();
        if (categoryName == 'no-category') {
          for (var i = 0; i < categoryNode.length; i++) {
            Blockly.Xml.domToBlock(categoryWorkspace, categoryNode[i]);
          }
        } else {
          Blockly.Xml.domToWorkspace(categoryNode, categoryWorkspace);
        }
        this.toolboxWorkspaces[categoryName] = categoryWorkspace;
        return this.toolboxWorkspaces[categoryName];
      }
    }
  });
