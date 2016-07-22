/**
 * @fileoverview Stores and updates information about state and categories
 * in workspace factory. Each category has a name, XML to load that category,
 * and a unique ID making it possible to change category names and move
 * categories easily. Also keeps track of the currently selected category.
 *
 * @author Emma Dauterman (evd2014)
 */

/**
 * Class for a FactoryModel
 * @constructor
 */
FactoryModel = function() {
  // Ordered list of Category objects.
  this.categoryList = [];
};

// String name of current selected category, null if no categories
FactoryModel.prototype.selected = null;

/**
 * Given a name, determines if it is the name of a category already present.
 * Used when getting a valid category name from the user.
 *
 * @param {string} name String name to be compared against.
 * @return {boolean} True if string is a used category name, false otherwise.
 */
FactoryModel.prototype.hasCategoryByName = function(name) {
  for (var i = 0; i < this.categoryList.length; i++) {
    if (this.categoryList[i].name == name) {
        return true;
    }
  }
  return false;
};

/**
 * Determines if the user has any categories. Uses the length of categoryList.
 *
 * @return {boolean} True if categories exist, false otherwise.
 */
FactoryModel.prototype.hasCategories = function() {
  return this.categoryList.length > 0;
};

/**
 * Adds an empty category entry, updating state variables accordingly. Generates
 * the unique ID for the category and adds the category at the end of the list.
 *
 * @param {string} name The name of category to be added.
 */
FactoryModel.prototype.addNewCategoryEntry = function(name) {
  this.categoryList.push(new Category(name));
};

/**
 * Deletes a category entry and all associated data given a category name.
 *
 * @param {int} index The index of the category to delete.
 */
FactoryModel.prototype.deleteCategoryEntry = function(index) {
  if (index < 0 || index > this.categoryList.length) {
    return; // No entry to delete.
  }
  this.categoryList.splice(index, 1);
};

/**
 * Saves the current category by updating its XML.
 *
 * @param {Category} category The Category object to save.
 * @param {Blockly.workspace} workspace The workspace to save category entry
 * from.
 */
FactoryModel.prototype.saveCategoryEntry = function(category, workspace) {
  // Only save category entries for valid IDs.
  if (!category) {
    return;
  }
  category.xml = Blockly.Xml.workspaceToDom(workspace);
};

/**
 * Changes the name of a category object given a new name.
 *
 * @param {string} newName New name of category.
 * @param {Category} category The category to be updated.
 */
FactoryModel.prototype.changeCategoryName = function (newName, category) {
  category.name = newName;
};

/**
 * Swaps the order of two categories in the category list.
 *
 * @param {Category} category1 First category to be swapped.
 * @param {Category} category2 Second category to be swapped.
 */
FactoryModel.prototype.swapCategoryOrder = function(category1, category2) {
  var index1 = this.getIndexByCategoryId(category1.id);
  var index2 = this.getIndexByCategoryId(category2.id);
  var temp = this.categoryList[index1];
  this.categoryList[index1] = this.categoryList[index2];
  this.categoryList[index2] = temp;
};

/**
 * Returns the ID of the currently selected category. Returns null if there are
 * no categories (if selected == null).
 *
 * @return {string} The ID of the category currently selected.
 */
FactoryModel.prototype.getSelectedId = function() {
  return this.selected ? this.selected.id : null;
};

/**
 * Returns the name of the currently selected category. Returns null if there
 * are no categories (if selected == null).
 *
 * @return {string} The name of the category currently selected.
 */
FactoryModel.prototype.getSelectedName = function() {
  return this.selected ? this.selected.name : null;
};

/**
 * Returns the currently selected category object.
 *
 * @return {Category} The currently selected category.
 */
FactoryModel.prototype.getSelected = function() {
  return this.selected;
};

/**
 * Sets category currently selected by id.
 *
 * @param {string} id ID of category that should now be selected.
 */
FactoryModel.prototype.setSelectedById = function(id) {
  this.selected = this.getCategoryById(id);
};

/**
 * Given an ID of a category, returns the index of that category in
 * categoryList. Returns -1 if ID is not present.
 *
 * @param {!string} id The ID of category to search for.
 * @return {int} The index of category in categoryList, or -1 if it doesn't
 * exist.
 */

FactoryModel.prototype.getIndexByCategoryId = function(id) {
  for (var i = 0; i < this.categoryList.length; i++) {
    if (this.categoryList[i].id == id) {
      return i;
    }
  }
  return -1;  // ID not present in categoryList.
};

/**
 * Given the ID of a category, returns that Category object.
 *
 * @param {!string} id The ID of category to search for.
 * @return {Category} Corresponding category object in categoryList, or null
 * if that category does not exist.
 */

FactoryModel.prototype.getCategoryById = function(id) {
  for (var i = 0; i < this.categoryList.length; i++) {
    if (this.categoryList[i].id == id) {
      return this.categoryList[i];
    }
  }
  return null;  // ID not present in categoryList.
};

/**
 * Given the index of a category in categoryList, returns that Category object.
 *
 * @param {int} index The index of the category to return.
 * @return {Category} The corresponding category object in categoryList.
 */
FactoryModel.prototype.getCategoryByIndex = function(index) {
  if (index < 0 || index >= this.categoryList.length) {
    return null;
  }
  return this.categoryList[index];
};

/**
 * Returns the xml to load the selected category.
 *
 * @return {!Element} The XML of the selected category, or null if there is
 * no selected category.
 */
FactoryModel.prototype.getSelectedXml = function() {
  return this.selected ? this.selected.xml : null;
};

/**
 * Return ordered list Category objects.
 *
 * @return {!Array<!Category>} ordered list of Category objects
 */
FactoryModel.prototype.getCategoryList = function() {
  return this.categoryList;
};

/**
 * Gets the ID of a category given its name.
 *
 * @param {string} name Name of category.
 * @return {int} ID of category
 */
FactoryModel.prototype.getCategoryIdByName = function(name) {
  for (var i = 0; i < this.categoryList.length; i++) {
    if (this.categoryList[i].name == name) {
      return this.categoryList[i].id;
    }
  }
  return null;  // Name not present in categoryList.
};

/**
 * Class for a Category
 * @constructor
 */
Category = function(name) {
  // XML DOM element to load the category.
  this.xml = Blockly.Xml.textToDom('<xml></xml>');
  // Name of category. Can be changed by user.
  this.name = name;
  // Unique ID of category. Does not change.
  this.id = Blockly.genUid();
};
