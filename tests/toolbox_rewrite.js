Blockly.Toolbox = function() {
  this.categories = [];

};

Blockly.Toolbox.prototype.init = function() {
  //Create the flyout.
  // The flyout should have a reference to the toolbox
};


Blockly.Toolbox.prototype.render = function() {
  // using the categories that are set above render the toolbox
  // Should be broken into smaller pieces that can be easily overriden
  // We should also make sure that we have the ability to
};

Blockly.Toolbox.prototype.getCategories = function() {

};

Blockly.Toolbox.prototype.setCategories = function(categories) {

};

Blockly.Toolbox.prototype.addCategory = function(category) {

};

Blockly.Toolbox.prototype.removeCategory = function(category) {

};

Blockly.Toolbox.prototype.getCategoryByName = function(category) {

};

/**
 *
 * @param category
 */
Blockly.Toolbox.prototype.getAllCategories = function(category) {

};

/**
 * Get all the blocks in all the categories of the flyout.
 */
Blockly.Toolbox.prototype.getAllBlocks = function() {

};

Blockly.Category = function(categoryDef) {
  this.name = categoryDef['name'];
  this.className = categoryDef['className'];
  // if the category has more categories
  this.subCategories = categoryDef['contents'];
  // Then add to the sub categories list
  // If the category only has flyout info add to the flyout part
  this.flyoutContents = categoryDef['contents'];
};

Blockly.Category.prototype.show = function() {
};

Blockly.Category.prototype.hide = function() {
};

Blockly.Category.prototype.render = function() {
  // There is going to be a lot of pain around getting the nesting to be
  // correct
  // return the div that it wants to add to the toolbox.
  // This will have to be some kind of recursive call so that it appends any
  // sub categories to itself.
};

Blockly.ToolboxSeparator = function() {

};

Blockly.ToolboxSeparator.prototype.render() {
  // returns the div for a toolbox spearator
  // Might more accurately be called createDom
}

// TODO: Figure out how nested categories are going to work.
// <div class="blocklyToolboxDiv">
//   <div class="blocklyToolboxCategories">
//     <div class="category">
//       <div class="blocklyTreeRow">
//         <span class="blocklyTreeIcon"></span>
//         <span class="blocklyTreeLabel"></span>
//       </div>
//     </div>
//     <div class='separator'>
//       <div class='blocklyTreeSeparator'>
//         <span></span>
//       </div>
//     </div>
//   </div>
// </div>
