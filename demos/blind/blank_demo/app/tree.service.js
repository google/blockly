var app = app || {};

app.TreeService = ng.core
  .Class({
  	constructor: function(){
      console.log("making a new tree service");
      this.activeDesc_={};
      this.previousKey_;
      this.inDropdown = false;
  	},
    createId: function(obj){
      if (obj && obj.id){
        return obj.id;
      }
      return Blockly.genUid();
    },
    setActiveAttribute: function(tree){
      if (!tree.getAttribute('aria-activedescendant')){
        tree.setAttribute('aria-activedescendant', tree.id+'-node0');
      }
    },
    setActiveDesc: function(node, id) {
      this.activeDesc_[id] = node;
    },
    getActiveDesc: function(id){
      return this.activeDesc_[id];
    },
    updateSelectedNode: function(node, tree, keepFocus){
      var treeId = tree.id;
      var activeDesc = this.getActiveDesc(treeId);
      if (activeDesc) {
        activeDesc.classList.remove("activedescendant");
      } else {
        console.log("updateSelectedNode: there is no active descendant");
      }
      node.classList.add("activedescendant");
      tree.setAttribute("aria-activedescendant",node.id);
      this.setActiveDesc(node, treeId);
      node.setAttribute("aria-selected","true");
      //make sure keyboard focus is on tree as a whole
      //in case before the user was editing a block and keyboard focus got shifted.

      if(keepFocus){
        tree.focus();
      }
    },
    keyHandler: function(e, tree){
        //console.log(document.activeElement);
        var treeId = tree.id;
        var node = this.getActiveDesc(treeId);
        if (!node){
          console.log("KeyHandler: no active descendant");
        }
        switch(e.keyCode){
          case 27:
            //escape key: no longer in dropdown mode
            this.inDropdown = false;
            break;
          case 37:
            if (this.inDropdown) {
              this.inDropdown = false;
              break;
            }
            //left-facing arrow: go out a level, if possible. If not, do nothing
            e.preventDefault();
            e.stopPropagation();
            var nextNode = node.parentNode;
            while (nextNode.className != "treeview" && nextNode.tagName != 'LI') {
              nextNode = nextNode.parentNode;
            }
            if (nextNode.className == "treeview" || nextNode == null){
              return;
            }
            this.updateSelectedNode(nextNode, tree);
            break;
          case 38:
            //up-facing arrow: go up a level, if possible. If not, do nothing
            e.preventDefault();
            e.stopPropagation();
            var prevSibling = this.getPreviousSibling(node);
            if (prevSibling && prevSibling.tagName != 'H1'){
              this.updateSelectedNode(prevSibling, tree);
            }
            break;
          case 39:
            //right-facing arrow: go in a level, if possible. If not, do nothing
            if (this.inDropdown) {
              this.inDropdown = false;
              break;
            }

            e.preventDefault();
            e.stopPropagation();
            var firstChild = this.getFirstChild(node);
            if (firstChild){
              this.updateSelectedNode(firstChild, tree);
            }
            break;
          case 40:
            //down-facing arrow: if the previous key was an Alt key, we want to do an Alt+Down to open a dropdown
            if (this.previousKey_ == 18 || this.inDropdown){
              this.inDropdown = true;
              break;
            }
            //down-facing arrow: go down a level, if possible. If not, do nothing
            e.preventDefault();
            e.stopPropagation();
            var nextSibling = this.getNextSibling(node);
            if (nextSibling){
              this.updateSelectedNode(nextSibling, tree);
            }
            break;
          case 13:
            //if we've pressed enter or escape and I'm in dropdown mode, I no longer want to be in dropdown mode
            if (this.inDropdown) {
              this.inDropdown = false;
              break;
            }
            //if I've pressed enter, I want to interact with a child
            var activeDesc = this.getActiveDesc(treeId);
            if (activeDesc){
              var children = activeDesc.children;
              var child = children[0];
              if (children.length == 1 && child.tagName == 'INPUT' || child.tagName == 'SELECT'){
                child.focus();
                //if it's a dropdown, we want the dropdown to open
                //only works in screenreader/browser combinations as specified in TestMatrix
                if(child.tagName == 'SELECT') {
                  var event;
                  event = document.createEvent('MouseEvents');
                  event.initMouseEvent('mousedown', true, true, window);
                  child.dispatchEvent(event);
                }
              }
            } else {
              console.log("no activeDesc");
            }
        }
        this.previousKey_=e.keyCode;
      },
      getFirstChild:  function(element){
        if (element == null){
          return element;
        } else {
          var childList = element.children;
          for (var i=0; i<childList.length; i++){
            if (childList[i].tagName == 'LI'){
              return childList[i];
            } else {
              var potentialElement = this.getFirstChild(childList[i]);
              if (potentialElement) {
                return potentialElement;
              }
            }
          }
          return null;
        }
      },
      getNextSibling: function(element){
        if (element.nextElementSibling){
          //if there is a sibling, find the list element child of the sibling
          var node = element.nextElementSibling;
          if (node.tagName != 'LI'){
            var listElems = node.getElementsByTagName('li');
            //getElementsByTagName returns in DFS order
            //therefore the first element is the first relevant list child
            return listElems[0];
          } else {
            return element.nextElementSibling;
          }
        } else {
          var parent = element.parentNode;
          while (parent != null && parent.tagName != 'OL'){
            if (parent.nextElementSibling){
              var node = parent.nextElementSibling;
              if (node.tabIndex == 0){
                return node;
              } else {
                return this.getFirstChild(node);
              }
            } else {
              parent = parent.parentNode;
            }
          }
          return null;
        }
      },
      getPreviousSibling: function(element){
        if (element.previousElementSibling){
          var sibling = element.previousElementSibling;
          if (sibling.tagName == 'LI') {
            return sibling;
          } else {
            return this.getLastChild(sibling);
          }
        } else {
          var parent = element.parentNode;
          while (parent != null){
            if (parent.tagName == 'OL') {
              break;
            }
            if (parent.previousElementSibling){
              var node = parent.previousElementSibling;
              if (node.tagName == 'LI'){
                return node;
              } else {
                return this.getLastChild(node);
              }
            } else {
              parent = parent.parentNode;
            }
          }
          return null;
        }
      },
      getLastChild: function(element){
        if (element == null){
          return element;
        } else {
          var childList = element.children;
          for (var i=childList.length-1; i>=0; i--){
            if (childList[i].tabIndex == 0){
              return childList[i];
            } else {
              var potentialElement = this.getLastChild(childList[i]);
              if (potentialElement) {
                return potentialElement;
              }
            }
          }
          //no last child
          return null;
        }
      },
  });
