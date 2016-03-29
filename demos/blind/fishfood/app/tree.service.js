var app = app || {};

app.TreeService = ng.core
  .Class({
  	constructor: function(){
      this.activeDesc_;
      this.tree_;
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
      if (!this.tree_){
        this.tree_ = tree;
      }
      if (!tree.getAttribute('aria-activedescendant')){
        console.log("setting tree active descendant");
        tree.setAttribute('aria-activedescendant', 'tree-node0');
      }
    },
    setActiveDesc: function(node) {
      this.activeDesc_ = node;
    },
    getActiveDesc: function() {
      return this.activeDesc_;
    },
    updateSelectedNode: function(node){
      console.log("updating node: " + node.id);
      if (this.activeDesc_) {
        this.activeDesc_.classList.remove("activedescendant");
        node.classList.add("activedescendant");
        tree.setAttribute("aria-activedescendant",node.id);
        this.activeDesc_ = node;
        node.setAttribute("aria-selected","true");
        //make sure keyboard focus is on tree as a whole
        //in case before the user was editing a block and keyboard focus got shifted.
        this.tree_.focus();
      } else {
        console.log("there is no active descendant");
      }
    },
    keyHandler: function(e){
        //console.log(document.activeElement);
        var node = this.activeDesc_;
        if (!node){
          console.log("no active descendant");
        }
        console.log(e.keyCode);
        console.log("inside TreeService");
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
            console.log("in left arrow section");
            var nextNode = node.parentNode;
            while (nextNode.className != "treeview" && nextNode.tagName != 'LI') {
              nextNode = nextNode.parentNode;
            }
            if (nextNode.className == "treeview" || nextNode == null){
              return;
            }
            this.updateSelectedNode(nextNode);
            break;
          case 38:
            //up-facing arrow: go up a level, if possible. If not, do nothing
            e.preventDefault();
            e.stopPropagation();
            console.log("node passed in: " + node.id);
            var prevSibling = this.getPreviousSibling(node);
            if (prevSibling && prevSibling.tagName != 'H1'){
              this.updateSelectedNode(prevSibling);
            } else {
              console.log("no previous sibling");
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
            console.log("in right arrow section");
            var firstChild = this.getFirstChild(node);
            if (firstChild){
              this.updateSelectedNode(firstChild);
            } else {
              console.log("no valid child");
            }
            break;
          case 40:
            //down-facing arrow: if the previous key was an Alt key, we want to do an Alt+Down to open a dropdown
            if (this.previousKey_ == 18 || this.inDropdown){
              this.inDropdown = true;
              break;
            }

            //down-facing arrow: go down a level, if possible. If not, do nothing
            //TODO(madeeha): should stop when done with all items at that level. Currently continues
            e.preventDefault();
            e.stopPropagation();
            var nextSibling = this.getNextSibling(node);
            if (nextSibling){
              this.updateSelectedNode(nextSibling);
            } else {
              console.log("no next sibling");
            }
            break;
          case 13:
            //if we've pressed enter or escape and I'm in dropdown mode, I no longer want to be in dropdown mode
            if (this.inDropdown) {
              this.inDropdown = false;
              break;
            }
            //if I've pressed enter, I want to interact with a child
            console.log("enter is pressed");
            if (this.activeDesc_){
              var children = this.activeDesc_.children;
              var child = children[0];
              if (children.length == 1 && child.tagName == 'INPUT' || child.tagName == 'SELECT'){
                child.focus();
                //if it's a dropdown, we want the dropdown to open
                //test this in all browsers, it may break in some places.
                //also see if it's better for screen readers if you put the focus on it after it opens.
                if(child.tagName == 'SELECT') {
                  var event;
                  event = document.createEvent('MouseEvents');
                  event.initMouseEvent('mousedown', true, true, window);
                  child.dispatchEvent(event);
                }
              }
            } else {
              console.log("no activeDesc_");
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
            console.log("looping");
            if (parent.tagName == 'OL') {
              break;
            }
            if (parent.previousElementSibling){
              console.log("parent has a sibling!");
              var node = parent.previousElementSibling;
              if (node.tagName == 'LI'){
                console.log("return the sibling of the parent!");
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
          console.log("no element");
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
          console.log("no last child");
          return null;
        }
      },
  });
