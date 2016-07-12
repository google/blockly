var selected = 'default';
var categoryXmlMap = new Map();
var categoryTabMap = new Map();
var categoryTopBlocksMap = new Map();


var addCategory = function() {
    do {
        var name = prompt("Enter the name of your new category: ");
    } while (!validNameCheck(name))
    if (name == null) return; //cancelled
    //categories[numCategories] = name;
    //numCategories++;
    addCategoryRow(name);
};
var removeCategory = function() {
    var name = prompt("Enter the name of your category to remove: ");
    removeCategoryByName(name);
};
var addCategoryRow = function(name) {
    if (selected == 'default') {
      toolboxWorkspace.clear();
    }
    var table = document.getElementById("categoryTable");
    var count = table.rows.length;
    var row = table.insertRow(count);
    var nextEntry = row.insertCell(0);
    categoryXmlMap.set(name,Blockly.Xml.textToDom('<xml></xml>'));  //initialize to empty category to load
    categoryTabMap.set(name,table.rows[count].cells[0]);
    toggleTabs(name);
    nextEntry.id = "tab_" + name;
    nextEntry.textContent = name;
    bindClick(nextEntry, function(name) {return function () {toggleTabs(name)};}(name));    //adapted from stuff in code.js
};

var getNextEmptyCategory = function(){
    for (var key of categoryTabMap.keys()) {
      return key;
    }
    return 'default';
};

var removeCategoryByName = function(name) { //update remove accordingly
    var table = document.getElementById("categoryTable");
    var count = table.rows.length;
    categoryXmlMap.delete(name);
    categoryTabMap.delete(name);
    categoryTopBlocksMap.delete(name);
    if (name == selected) {
      var newTabOpen = getNextEmptyCategory();
      toggleTabs(newTabOpen);
    }
    for (var i=0; i<count; i++) {
        var row = table.rows[i];
        if (row.cells[0].childNodes[0].textContent == name) {
            table.deleteRow(i);
            return;
        }
    }
    alert("No such category to delete");
};

//taken directly from code.js
var bindClick = function(el, func) {
  if (typeof el == 'string') {
    el = document.getElementById(el);
  }
  el.addEventListener('click', func, true);
  el.addEventListener('touchend', func, true);
};

var toggleTabs = function(name) {
    var table = document.getElementById("categoryTable");
    categoryXmlMap.set(selected,Blockly.Xml.workspaceToDom(toolboxWorkspace)); //store old xml
    selected = name;
    window.console.log("Switching to " + name);
    if (name != 'default') {
        categoryTabMap.get(name).className = "tabon";
    }
    for(var catName of categoryTabMap.keys()) {
      if (catName != name) {
          window.console.log(catName);
          categoryTabMap.get(catName).className = "taboff";
      }
    }
    toolboxWorkspace.clear();
    toolboxWorkspace.clearUndo();
    window.console.log(name + " " + categoryXmlMap.get(name));
    Blockly.Xml.domToWorkspace(categoryXmlMap.get(name),toolboxWorkspace);
    categoryTopBlocksMap.set(name,toolboxWorkspace.getTopBlocks());

};


//could do this better with a set
var validNameCheck = function(name) {
    var table = document.getElementById("categoryTable");
    for(var i=0; i<table.rows.length; i++) {
        if (table.rows[i].cells[0].textContent == name) {
            alert("Oops! You've used " + name + " before.");
            return false;
        }
    }
    return true;
};

var exportConfig = function(name) {
    window.console.log(workspaceToDomToolbox(toolboxWorkspace));
};

//blockToDom from xml.js but without setting id attribute
Blockly.Xml.blockToDomSimple = function(block) {
  var element = goog.dom.createDom(block.isShadow() ? 'shadow' : 'block');
  element.setAttribute('type', block.type);
  if (block.mutationToDom) {
    // Custom data for an advanced block.
    var mutation = block.mutationToDom();
    if (mutation && (mutation.hasChildNodes() || mutation.hasAttributes())) {
      element.appendChild(mutation);
    }
  }
  function fieldToDom(field) {
    if (field.name && field.EDITABLE) {
      var container = goog.dom.createDom('field', null, field.getValue());
      container.setAttribute('name', field.name);
      element.appendChild(container);
    }
  }
  for (var i = 0, input; input = block.inputList[i]; i++) {
    for (var j = 0, field; field = input.fieldRow[j]; j++) {
      fieldToDom(field);
    }
  }

  var commentText = block.getCommentText();
  if (commentText) {
    var commentElement = goog.dom.createDom('comment', null, commentText);
    if (typeof block.comment == 'object') {
      commentElement.setAttribute('pinned', block.comment.isVisible());
      var hw = block.comment.getBubbleSize();
      commentElement.setAttribute('h', hw.height);
      commentElement.setAttribute('w', hw.width);
    }
    element.appendChild(commentElement);
  }

  if (block.data) {
    var dataElement = goog.dom.createDom('data', null, block.data);
    element.appendChild(dataElement);
  }

  for (var i = 0, input; input = block.inputList[i]; i++) {
    var container;
    var empty = true;
    if (input.type == Blockly.DUMMY_INPUT) {
      continue;
    } else {
      var childBlock = input.connection.targetBlock();
      if (input.type == Blockly.INPUT_VALUE) {
        container = goog.dom.createDom('value');
      } else if (input.type == Blockly.NEXT_STATEMENT) {
        container = goog.dom.createDom('statement');
      }
      var shadow = input.connection.getShadowDom();
      if (shadow && (!childBlock || !childBlock.isShadow())) {
        container.appendChild(Blockly.Xml.cloneShadow_(shadow));
      }
      if (childBlock) {
        container.appendChild(Blockly.Xml.blockToDom(childBlock));
        empty = false;
      }
    }
    container.setAttribute('name', input.name);
    if (!empty) {
      element.appendChild(container);
    }
  }
  if (block.inputsInlineDefault != block.inputsInline) {
    element.setAttribute('inline', block.inputsInline);
  }
  if (block.isCollapsed()) {
    element.setAttribute('collapsed', true);
  }
  if (block.disabled) {
    element.setAttribute('disabled', true);
  }
  if (!block.isDeletable() && !block.isShadow()) {
    element.setAttribute('deletable', false);
  }
  if (!block.isMovable() && !block.isShadow()) {
    element.setAttribute('movable', false);
  }
  if (!block.isEditable()) {
    element.setAttribute('editable', false);
  }

  var nextBlock = block.getNextBlock();
  if (nextBlock) {
    var container = goog.dom.createDom('next', null,
        Blockly.Xml.blockToDom(nextBlock));
    element.appendChild(container);
  }
  var shadow = block.nextConnection && block.nextConnection.getShadowDom();
  if (shadow && (!nextBlock || !nextBlock.isShadow())) {
    container.appendChild(Blockly.Xml.cloneShadow_(shadow));
  }

  return element;
};

//adapted from workspaceToDom but calling blockToDom instead of blockToDo WithXY
//eventually add to xml.js
var categoryToDom = function(xmlDom, categoryName) {
    var blocks = categoryTopBlocksMap.get(categoryName);
    for (var i=0, block; block=blocks[i]; i++) {
        xmlDom.appendChild(Blockly.Xml.blockToDomSimple(block)); //make blockToDomSimple that generates xml w/out ids
    }
};


//almost directly copied from Katelyn's pull request for block factory
var createAndDownloadFile = function(contents, filename, fileType) {
   var data = new Blob([contents], {type: 'text/' + fileType});
   var clickEvent = new MouseEvent("click", {
     "view": window,
     "bubbles": true,
     "cancelable": false
   });
   var a = document.createElement('a');
   a.href = window.URL.createObjectURL(data);
   a.download = filename;
   a.textContent = 'Download file!';
   a.dispatchEvent(clickEvent);
 };


 //have better way to save the toolbox xml -- have two versions, when you toggle tabs it save both to reload, have a save function that updates selected in both
 var generateConfigXml = function() {
  var xmlDom = goog.dom.createDom('xml',
        {
            'id' : 'toolbox',
            'style' : 'display:none'
        });
  categoryXmlMap.set(selected, Blockly.Xml.workspaceToDom(toolboxWorkspace));
  categoryTopBlocksMap.set(selected, toolboxWorkspace.getTopBlocks());

  for (var category of categoryTopBlocksMap.keys()) {
    if (category != 'default') {
      var categoryElement = goog.dom.createDom('category');
      categoryElement.setAttribute('name',category);
      categoryToDom(categoryElement,category);
      xmlDom.appendChild(categoryElement);
    } else {
      window.console.log("default");
      categoryToDom(xmlDom, category);   //workspaceToDomToolbox(toolboxWorkspace)
    }
    /*
    if (category!='default') {
      generatedXml += '<category name="' + category + '">' + xmlElement + '</category>';
    } */
   }

   return xmlDom;
 }

var exportConfig = function() {
   var configXml = Blockly.Xml.domToPrettyText(generateConfigXml());
   var fileName = prompt("File Name: ");
   createAndDownloadFile(configXml, fileName, 'xml');
 };

var printConfig = function() {
  window.console.log(Blockly.Xml.domToPrettyText(generateConfigXml()));
}

//TODO(edauterman): modify blockly inject call to reflect selected options
//FLYOUT NOT WORKING
var updatePreview = function() {
  var response = prompt ("Toolbox or flyout? ");
  if (response == 'flyout') {
    previewWorkspace.flyout_.show((generateConfigXml()).childNodes);
  } else {
    previewWorkspace.toolbox_.populate_(generateConfigXml());
  }


    //previewWorkspace.toolbox.populate_(previewXml);
    /*previewWorkspace.dispose();
    previewWorkspace = Blockly.inject('preview_blocks',
        {grid:
            {spacing: 25,
             length: 3,
             colour: '#ccc',
             snap: true},
         media: '../../media/',
         toolbox: previewToolbox,
         zoom:
             {controls: true,
              wheel: true}
        });*/
};

