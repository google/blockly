/**
 * @fileoverview Stores and updates information about state and categories
 * in workspace factory. Keeps a map that for each category, stores
 * the xml to load that category and all the blocks in that category. Also
 * stores the selected category and a boolean for if there are any categories
 * or if it's in "simple" mode (1 flyout).
 *
 * @author Emma Dauterman (edauterman)
 */

/**
 * Class for a FactoryModel
 * @constructor
 */
FactoryModel = function() {
  this.categoryMap = Object.create(null);
};

// String name of current selected category, null if no categories.
FactoryModel.prototype.selected = null;

/**
 * Given a name, determines if it is the name of a category already present.
 *
 * @param {string} name string to be compared against
 * @return {boolean} true if string is a used category name, false otherwise
 */
FactoryModel.prototype.hasCategory = function(name) {
  for (var category in this.categoryMap) {
    if (category == name) {
        return true;
    }
  }
  return false;
};

/**
 * Determines if the user has any categories using categoryMap.
 *
 * @return {boolean} true if categories exist, false otherwise
 */
FactoryModel.prototype.hasCategories = function() {
  return this.categoryMap.size > 0;
}

/**
 * Finds the next open category to switch to. Returns null if
 * no categories left to switch to, and updates hasCategories to be false.
 * TODO(edauterman): Find a better tab than just the first tab in the map (done
 * in next CL).
 *
 * @param {!string} name name of category currently open, cannot be switched to
 * @return {string} name of next category to switch to
 */
FactoryModel.prototype.getNextOpenCategory = function(name) {
  for (var key in this.categoryMap) {
    return key;
  }
  return null;
};

/**
 * Saves the current category, updating its entry in categoryMap.
 *
 * @param {!string} name Name of category to save
 * @param {!Blockly.workspace} workspace Workspace to save from
 */
FactoryModel.prototype.saveCategoryEntry = function(name, workspace) {
  if (!name) {  // Never want to save null.
    return;
  }
  this.categoryMap[name] = {
    'xml': Blockly.Xml.workspaceToDom(workspace),
    'blocks': workspace.getTopBlocks()
  }
};

/**
 * Deletes a category entry and all associated data.
 *
 * @param {string} name of category to be deleted
 */
FactoryModel.prototype.deleteCategoryEntry = function(name) {
  delete this.categoryMap[name];
};

/**
 * Returns category currently selected.
 *
 * @return {string} name of category currently selected
 */
FactoryModel.prototype.getSelected = function() {
  return this.selected;
};

/**
 * Sets category currently selected.
 *
 * @param {string} name name of category that should now be selected
 */
FactoryModel.prototype.setSelected = function(name) {
  this.selected = name;
}

/**
 * Returns the xml to load a given category
 *
 * @param {string} name name of category to fetch xml for
 * @return {!Element} xml element to be loaded to workspace
 */
FactoryModel.prototype.getXml = function(name) {
  return this.categoryMap[name].xml;
};

/**
 * Returns xml for the blocks of a given category.
 *
 * @param {string} name name of category to fetch blocks for
 * @return {!Array.<!Blockly.Block>} top level block objects
 */
FactoryModel.prototype.getBlocks = function(name) {
  return this.categoryMap[name].blocks;
};

/**
 * Return map of categories that can be iterated over in a for-in loop.
 * Used when it is necessary to look through all categories.
 *
 * @return {!Map<string,<!Element,!Array.<!Blockly.Block>>>} Map of category
 * name to object with XML dom element and array of top level block objects.
 */
FactoryModel.prototype.getIterableCategories = function() {
  return this.categoryMap;
};
