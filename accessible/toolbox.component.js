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
      <div class="blocklyToolboxColumn">
        <h3 #toolboxTitle id="blockly-toolbox-title">{{'TOOLBOX'|translate}}</h3>
        <ol #tree
            id="blockly-toolbox-tree" role="tree" class="blocklyTree"
            *ngIf="toolboxCategories && toolboxCategories.length > 0" tabindex="0"
            [attr.aria-labelledby]="toolboxTitle.id"
            [attr.aria-activedescendant]="getActiveDescId()"
            (keydown)="treeService.onKeypress($event, tree)">
          <template [ngIf]="xmlHasCategories">
            <li #parent
                [id]="idMap['Parent' + i]" role="treeitem"
                [ngClass]="{blocklyHasChildren: true, blocklyActiveDescendant: tree.getAttribute('aria-activedescendant') == idMap['Parent' + i]}"
                *ngFor="#category of toolboxCategories; #i=index"
                aria-level="0"
                [attr.aria-label]="getCategoryAriaLabel(category)">
              <div *ngIf="category && category.attributes">
                <label [id]="idMap['Label' + i]" #name>
                  {{category.attributes.name.value}}
                </label>
                <ol role="group" *ngIf="getToolboxWorkspace(category).topBlocks_.length > 0">
                  <blockly-toolbox-tree *ngFor="#block of getToolboxWorkspace(category).topBlocks_"
                                        [level]="1" [block]="block"
                                        [displayBlockMenu]="true"
                                        [tree]="tree">
                  </blockly-toolbox-tree>
                </ol>
              </div>
            </li>
          </template>

          <div *ngIf="!xmlHasCategories">
            <blockly-toolbox-tree *ngFor="#block of getToolboxWorkspace(toolboxCategories[0]).topBlocks_; #i=index"
                                  role="treeitem" [level]="0" [block]="block"
                                  [tree]="tree" [displayBlockMenu]="true"
                                  [isFirstToolboxTree]="i === 0">
            </blockly-toolbox-tree>
          </div>
        </ol>
      </div>
    `,
    directives: [blocklyApp.ToolboxTreeComponent],
    pipes: [blocklyApp.TranslatePipe]
  })
  .Class({
    constructor: [
        blocklyApp.TreeService, blocklyApp.UtilsService,
        function(_treeService, _utilsService) {
      this.toolboxCategories = [];
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
        for (var i = 0; i < this.toolboxCategories.length; i++) {
          this.idMap['Parent' + i] = 'blockly-toolbox-tree-node' + i;
        }
      } else {
        // Create a single category with all the top-level blocks.
        this.xmlHasCategories = false;
        this.toolboxCategories = [Array.from(xmlToolboxElt.children)];
      }
    },
    ngAfterViewInit: function() {
      // If this is a top-level tree in the toolbox, set its active
      // descendant after the ids have been computed.
      // Note that a timeout is needed here in order to trigger Angular
      // change detection.
      if (this.xmlHasCategories) {
        var that = this;
        setTimeout(function() {
          that.treeService.setActiveDesc(
              'blockly-toolbox-tree-node0', 'blockly-toolbox-tree');
        });
      }
    },
    getActiveDescId: function() {
      return this.treeService.getActiveDescId('blockly-toolbox-tree');
    },
    getCategoryAriaLabel: function(category) {
      var numBlocks = this.getToolboxWorkspace(category).topBlocks_.length;
      return category.attributes.name.value + ' category. ' +
          'Move right to access ' + numBlocks + ' blocks in this category.';
    },
    getToolboxWorkspace: function(categoryNode) {
      return this.treeService.getToolboxWorkspace(categoryNode);
    }
  });
