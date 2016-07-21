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
  this.categoryList = [];
};

// String name of current selected category, null if no categories
FactoryModel.prototype.selected = null;

/**
 * Given a name, determines if it is the name of a category already present.
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
 * Given a ID, determines if it is the ID of a category already present.
 *
 * @param {string} id String ID to be compared against.
 * @return {boolean} True if string is a used category ID, false otherwise.
 */
FactoryModel.prototype.hasCategoryById = function(id) {
  for (var i = 0; i < this.categoryList.length; i++) {
    if (this.categoryList[i].id == id) {
        return true;
    }
  }
  return false;
};

/**
 * Determines if the user has any categories using selected.
 *
 * @return {boolean} True if categories exist, false otherwise.
 */
FactoryModel.prototype.hasCategories = function() {
  return this.categoryList.length > 0;
};

/**
 * Decides which category to switch to when deleting a category. Returns null if
 * no categories left to switch to. The next category is chosen as follows:
 * if there is a category before the deleted category, that category is chosen,
 * if there is no category before the deleted category, then the category
 * directly after is chosen, and if there is no category before or after,
 * then there must be no other categories, and so it returns null to signal
 * that there is no current category.
 *
 * @param {!string} name The name of category being deleted.
 * @return {string} ID of next category to switch to.
 */
FactoryModel.prototype.getNextCategoryOnDelete = function(name) {
  var index = this.getIndexByCategoryName(name);
  // If not first category, get next category.
  if (index > 0) {
    return this.getCategoryByIndex(index - 1).id;
  // Otherwise if not last category, get category before.
  } else if (index < this.categoryList.length - 1 && index >= 0) {
    return this.getCategoryByIndex(index + 1).id;
  // Otherwise no categories remaining.
  } else {
    return null;
  }
};

/**
 * Adds an empty category entry, updating state variables accordingly. Generates
 * the unique ID for the category and adds the category at the end of the list.
 *
 * @param {string} name The name of category to be added
 */
FactoryModel.prototype.addNewCategoryEntry = function(name) {
  this.categoryList.push(new Category(name));
};

/**
 * Deletes a category entry and all associated data given a category name.
 *
 * @param {string} name Name of the category to delete.
 */
FactoryModel.prototype.deleteCategoryEntry = function(name) {
  var index = this.getIndexByCategoryName(name);
  if (index == -1) {  // No entry to delete.
    return;
  }
  this.categoryList.splice(index, 1);
};

/**
 * Saves the current category, updating its entry in xmlMap.
 *
 * @param {Category} category The Category object to capture state for.
 * @param {Blockly.workspace} workspace The workspace to save category entry.
 * in
 */
FactoryModel.prototype.saveCategoryEntry = function(category, workspace) {
  // Only save category entries for valid IDs.
  if (!category) {
    return;
  }
  category.xml = Blockly.Xml.workspaceToDom(workspace);
};

/**
 * Changes the name of a category given its new name and ID. Updates it in
 * the category list, creates a new entry in the ID map, and deletes the old
 * entry in the ID map.
 *
 * @param {string} newName New name of category.
 * @param {Category} category The category to be updated.
 */
FactoryModel.prototype.changeCategoryName = function (newName, category) {
  category.name = newName;
};

/**
 * Swaps the IDs of two categories while keeping the XML and names associated
 * with a category the same. Used when swapping categories so that same tab
 * can now refer to a different category.
 *
 * @param {Category} category1 First category to be swapped.
 * @param {Category} category2 Second category to be swapped.
 */
FactoryModel.prototype.swapCategoryIds = function (category1, category2) {
  // Swap category IDs
  var temp = category1.id;
  category1.id = category2.id;
  category2.id = temp;
};

/**
 * Swaps the order of two categories in the category list.
 *
 * @param {Category} category1 First category to be swapped.
 * @param {Category} category2 Second category to be swapped.
 */
FactoryModel.prototype.swapCategoryOrder = function(category1, category2) {
  var index1 = this.getIndexByCategoryName(category1.name);
  var index2 = this.getIndexByCategoryName(category2.name);
  var temp = this.categoryList[index1];
  this.categoryList[index1] = this.categoryList[index2];
  this.categoryList[index2] = temp;
};

/**
 * Returns the ID of the currently selected category.
 *
 * @return {string} The ID of category currently selected.
 */
FactoryModel.prototype.getSelectedId = function() {
  if (!this.selected) {
    return null;
  }
  return this.selected.id;
};

/**
 * Returns the name of the currently selected category.
 *
 * @return {string} The name of category currently selected.
 */
FactoryModel.prototype.getSelectedName = function() {
  if (!this.selected) {
    return null;
  }
  return this.selected.name;
};

/**
 * Returns the currently selected category object.
 *
 * @return {Category} The currently selected category.
 */
FactoryModel.prototype.getSelected = function() {
  return this.selected;
}

/**
 * Sets category currently selected by id.
 *
 * @param {string} id ID of category that should now be selected.
 */
FactoryModel.prototype.setSelectedById = function(id) {
  this.selected = this.getCategoryById(id);
};

/**
 * Sets category currently selected by name.
 *
 * @param {string} name The name of category that should now be selected.
 */
FactoryModel.prototype.setSelectedByName = function(name) {
  this.selected = this.getCategoryByName(name);
};

/**
 * Sets category currently selected.
 *
 * @param {Category} category The category that should now be selected.
 */
FactoryModel.prototype.setSelected = function(category) {
  this.selected = category;
};

/**
 * Given the name of a category, returns the index of that category in
 * categoryList.
 *
 * @param {!string} name The name of category to search for.
 * @return {int} index of category in categoryList.
 */

FactoryModel.prototype.getIndexByCategoryName = function(name) {
  for (var i = 0; i < this.categoryList.length; i++) {
    if (this.categoryList[i].name == name) {
      return i;
    }
  }
  return -1;  // Name not present in categoryList.
}

/**
 * Given an ID of a category, returns the index of that category in
 * categoryList.
 *
 * @param {!string} id The ID of category to search for.
 * @return {int} The index of category in categoryList.
 */

FactoryModel.prototype.getIndexByCategoryId = function(id) {
  for (var i = 0; i < this.categoryList.length; i++) {
    if (this.categoryList[i].id == id) {
      return i;
    }
  }
  return -1;  // ID not present in categoryList.
}

/**
 * Given the name of a category, returns that Category object.
 *
 * @param {!string} name The name of category to search for.
 * @return {Category} Corresponding category object in categoryList.
 */

FactoryModel.prototype.getCategoryByName = function(name) {
  for (var i = 0; i < this.categoryList.length; i++) {
    if (this.categoryList[i].name == name) {
      return this.categoryList[i];
    }
  }
  return -1;  // ID not present in categoryList.
};

/**
 * Given the ID of a category, returns that Category object.
 *
 * @param {!string} id The ID of category to search for.
 * @return {Category} Corresponding category object in categoryList.
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
 * @return {Category} Corresponding category object in categoryList.
 */
FactoryModel.prototype.getCategoryByIndex = function(index) {
  if (index < 0 || index >= this.categoryList.length) {
    return null;
  }
  return this.categoryList[index];
};

/**
 * Returns the xml to load a given category by name
 *
 * @param {string} name name of category to fetch xml for
 * @return {!Element} xml element to be loaded to workspace
 */
FactoryModel.prototype.getXmlByName = function(name) {
  var category = this.getCategoryByName(name);
  if (!category) {
    return null;
  }
  return category.xml;
};

/**
 * Returns the xml to load a given category by id
 *
 * @param {int} id ID of category to fetch xml for
 * @return {!Element} xml element to be loaded to workspace
 */
FactoryModel.prototype.getXmlById = function(id) {
    var category = this.getCategoryById(id);
  if (!category) {
    return null;
  }
  return category.xml;
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
FactoryModel.prototype.getId = function(name) {
  return this.getCategoryByName(name).id;
}

/**
 * Class for a Category
 * @constructor
 */
Category = function(name) {
  this.xml = Blockly.Xml.textToDom('<xml></xml>');
  this.name = name;
  this.id = Blockly.genUid();
};
