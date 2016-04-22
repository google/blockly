var app = app || {};

app.TreeService = ng.core
  .Class({
  	constructor: function(){
      console.log("making a new tree service");
      this.activeDesc_={};
      this.previousKey_;
      this.trees = document.getElementsByClassName('tree');
  	},
    createId: function(obj){
      if (obj && obj.id){
        return obj.id;
      }
      return Blockly.genUid();
    },
    setActiveAttribute: function(tree){
      if (!tree.getAttribute('aria-activedescendant')){
        console.log("setting tree active descendant");
        tree.setAttribute('aria-activedescendant', tree.id+'-node0');
      }
    },
    setActiveDesc: function(node, id) {
      console.log("setting active descendant for tree " + id);
      this.activeDesc_[id] = node;
    },
    getActiveDesc: function(id){
      return this.activeDesc_[id];
    },
    updateSelectedNode: function(node, tree, keepFocus){
      console.log("updating node: " + node.id);
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
    workspaceButtonKeyHandler: function(e, treeId){
      console.log(e.keyCode);
      console.log("inside TreeService");
      switch(e.keyCode){
        case 9:
          //16,9: shift, tab
          if (e.shiftKey){
            console.log("shifttabbing");
            //if the previous key is shift, we're shift-tabbing mode
            this.goToPreviousTree(treeId,e);
          } else {
            //if previous key isn't shift, we're tabbing
            //we want to go to the run code button
            this.goToNextTree(treeId,e);
          }
          break;
      }
      this.previousKey_=e.keyCode;
    },
    findParentOfNode: function(node){
      var parent = node;
      while (node && node.className != 'class'){
        parent = node.parentNode;
      }
      return parent;
    },
    goToNextTree: function(treeId,e){
      //if we're at the last tree, we want tab to go to the default
      // if (treeId == this.trees[this.trees.length-1].id){
      //   return;
      // }
      var next = false;
      for (var i=0; i<this.trees.length; i++){
        if (next){
          this.trees[i].focus();
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        if (this.trees[i].id == treeId){
          next = true;
        }
      }
      e.preventDefault();
      e.stopPropagation();
    },
    goToPreviousTree: function(treeId, e){
      //if we're at the first tree, we want shift+tab to go to the default
      if (treeId == this.trees[0].id){
        return;
      }
      //otherwise, go to the previous tree class
      var next = false;
      for (var i=(this.trees.length - 1); i>=0; i--){
        if (next){
          this.trees[i].focus();
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        if (this.trees[i].id == treeId){
          next = true;
        }
      }
      e.preventDefault();
      e.stopPropagation();
    },
    keyHandler: function(e, tree){
        //console.log(document.activeElement);
        var treeId = tree.id;
        var node = this.getActiveDesc(treeId);
        if (!node){
          console.log("KeyHandler: no active descendant");
        }
        console.log(e.keyCode);
        console.log("inside TreeService");
        switch(e.keyCode){
          case 9:
            //16,9: shift, tab
            if (e.shiftKey){
              console.log("shifttabbing");
              //if the previous key is shift, we're shift-tabbing mode
              this.goToPreviousTree(treeId,e);
            } else {
              //if previous key isn't shift, we're tabbing
              //we want to go to the run code button
              this.goToNextTree(treeId,e);
            }
            break;
          case 37:
            //left-facing arrow: go out a level, if possible. If not, do nothing
            e.preventDefault();
            e.stopPropagation();
            console.log("in left arrow section");
            var nextNode = node.parentNode;
            while (nextNode && nextNode.className != "treeview" && nextNode.tagName != 'LI') {
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
            console.log("node passed in: " + node.id);
            var prevSibling = this.getPreviousSibling(node);
            if (prevSibling && prevSibling.tagName != 'H1'){
              this.updateSelectedNode(prevSibling, tree);
            } else {
              console.log("no previous sibling");
            }
            break;
          case 39:
            e.preventDefault();
            e.stopPropagation();
            console.log("in right arrow section");
            var firstChild = this.getFirstChild(node);
            if (firstChild){
              this.updateSelectedNode(firstChild, tree);
            } else {
              console.log("no valid child");
            }
            break;
          case 40:
            //down-facing arrow: go down a level, if possible. If not, do nothing
            //TODO(madeeha): should stop when done with all items at that level. Currently continues
            console.log("preventing propogation");
            e.preventDefault();
            e.stopPropagation();
            var nextSibling = this.getNextSibling(node);
            if (nextSibling){
              this.updateSelectedNode(nextSibling, tree);
            } else {
              console.log("no next sibling");
            }
            break;
          case 13:
            //if I've pressed enter, I want to interact with a child
            console.log("enter is pressed");
            var activeDesc = this.getActiveDesc(treeId);
            if (activeDesc){
              var children = activeDesc.children;
              var child = children[0];
              if (children.length == 1 && (child.tagName == 'INPUT' || child.tagName == 'BUTTON')){
                if (child.tagName == 'BUTTON'){
                  child.click();
                }
                if (child.tagName == 'INPUT'){
                  child.focus();
                }
                // child.focus();
                // //if it's a dropdown, we want the dropdown to open
                // //test this in all browsers, it may break in some places.
                // //also see if it's better for screen readers if you put the focus on it after it opens.
                // if(child.tagName == 'BUTTON') {
                //   child.click();
                // }
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
              if (node.tagName == 'LI'){
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
            console.log("looping");
            if (parent.tagName == 'OL') {
              break;
            }
            if (parent.previousElementSibling){
              console.log("parent has a sibling!");
              var node = parent.previousElementSibling;
              if (node.tagName == 'LI'){
                //the parent has a list sibling!
                console.log("return the sibling of the parent!");
                return node;
              } else {
                //find the last list element child of the sibling of the parent
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
          console.log("no element");
          return element;
        } else {
          var childList = element.children;
          for (var i=childList.length-1; i>=0; i--){
            //find the last child that is a list element
            if (childList[i].tagName == 'LI'){
              return childList[i];
            } else {
              var potentialElement = this.getLastChild(childList[i]);
              if (potentialElement) {
                return potentialElement;
              }
            }
          }
          console.log("no last child");
          return null;
        }
      },
  });
