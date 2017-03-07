/**
* Blockly Demos: Code
*
* Copyright 2017 Google Inc.
* https://developers.google.com/blockly/
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/**
* @fileoverview JavaScript for Blockly's Minimap demo.
* @author karnpurohit@gmail.com (Karan Purohit)
*/
'use strict';

/**
* Creating a seperate namespace for minimap.
*/
var Minimap = {};

/**
* initilize the workspace and minimap.
* @param {Workspace} workspace The main workspace of the user
* @param {Workspace} minimap The workspace that will be used as a minimap
*/
Minimap.init = function(workspace,minimap){
  this.workspace= workspace;
  this.minimap= minimap;

  //Adding scroll callback functionlity to vScroll just for this demo.
  //IMPORTANT: This should be changed when there is proper UI event handling
  //           api available and should be handled by workspace's event listeners
  this.workspace.scrollbar.vScroll.onScroll_ = function(){
    var ratio = this.handlePosition_ / this.scrollViewSize_;
    if (isNaN(ratio)) {
      ratio = 0;
    }
    var xyRatio = {};
    if (this.horizontal_) {
      xyRatio.x = ratio;
    } else {
      xyRatio.y = ratio;
    }
    this.workspace_.setMetrics(xyRatio);

    // get the absolutePosition
    var absolutePosition = (this.handlePosition_/this.ratio_);

    // firing the scroll change listener
    Minimap.onScrollChange(absolutePosition,this.horizontal_);
  };

  // used as left padding in the minimap
  this.PADDING = 5;

  // required to stop a positive feedback loop when user clicks minimap
  // and the scroll changes, which inturn may change minimap.
  this.disableScrollChange=false;

  // Listen to events on the main workspace.
  this.workspace.addChangeListener(Minimap.mirrorEvent);

  //Get rectangle bounding the minimap div.
  this.rect = document.getElementById('mapDiv').getBoundingClientRect();
  // Create a svg overlay on the top of mapDiv for the minimap
  this.svg = Blockly.utils.createSvgElement('svg', {
    'xmlns': 'http://www.w3.org/2000/svg',
    'xmlns:html': 'http://www.w3.org/1999/xhtml',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'version': '1.1',
    'height': this.rect.bottom-this.rect.top,
    'width': this.rect.right-this.rect.left,
    'class': 'minimap',
  }, document.getElementById('mapDiv'));
  this.svg.style.top=this.rect.top;
  this.svg.style.left=this.rect.left;

  // Creating a rectangle in the minimap that represents current view.
  Blockly.utils.createSvgElement('rect', {
    'width':100,
    'height':100,
    'class':'mapDragger'
  },this.svg);

  // Rectangle in the minimap that represents current view.
  this.mapDragger = this.svg.childNodes[0];

  // Adding mouse events to the rectangle, to make it Draggable
  this.mapDragger.addEventListener("mousedown",Minimap.mousedown,false);
  this.mapDragger.addEventListener("mouseup",Minimap.mouseup);
  this.mapDragger.addEventListener("mousemove",Minimap.mouseover);
  this.mapDragger.addEventListener("mouseout",Minimap.mouseout);

  //When the window change, we need to resize the minimap window.
  window.addEventListener('resize', Minimap.repositionMinimap);

  // click event for the minimap
  // TODO: Drag event
  this.svg.addEventListener('mouseup',Minimap.updateMapDragger);

  //boolen to check whether I am dragging the surface or not
  this.isDragging= false;
};

Minimap.mousedown = function(e){
  Minimap.isDragging=true;
  e.stopPropagation();
};

Minimap.mouseup = function(e){
  Minimap.isDragging = false;
  Minimap.updateMapDragger(e);
  e.stopPropagation();
};

Minimap.mouseout = function(){
  Minimap.isDragging = false;
};

Minimap.mouseover = function(e){
  if(Minimap.isDragging){
    Minimap.updateMapDragger(e);
  }
  e.stopPropagation();
};

/**
* initilize the workspace and minimap.
* @param {Event} event Event that triggered in the main workspace.
*/
Minimap.mirrorEvent = function(event){
  if (event.type == Blockly.Events.UI) {
    return;  // Don't mirror UI events.
  }
  // Convert event to JSON.  This could then be transmitted across the net.
  var json = event.toJson();
  // Convert JSON back into an event, then execute it.
  var minimapEvent = Blockly.Events.fromJson(json, Minimap.minimap);
  minimapEvent.run(true);
  Minimap.scaleMinimap();
  Minimap.setDraggerHeight();
};

/**
* Called when window is resized. Repositions the minimap overlay.
*/
Minimap.repositionMinimap = function(){
  Minimap.rect = document.getElementById('mapDiv').getBoundingClientRect();
  Minimap.svg.style.top=Minimap.rect.top;
  Minimap.svg.style.left=Minimap.rect.left;
};

/**
* updates the rectangle's height and position.
*/
Minimap.setDraggerHeight = function(){
  var workspaceMetrics = Minimap.workspace.getMetrics();
  var draggerHeight=(workspaceMetrics.viewHeight/Minimap.workspace.scale)*Minimap.minimap.scale;
  // its zero when first block is placed
  if(draggerHeight==0){
    return;
  }
  Minimap.mapDragger.setAttribute("height",draggerHeight);
};

/**
* Updates the overall position of the viewport of the minimap by appropriately
* using translate functions.
*/
Minimap.scaleMinimap = function(){
  var minimapBoundingBox = Minimap.minimap.getBlocksBoundingBox();
  var workspaceBoundingBox = Minimap.workspace.getBlocksBoundingBox();
  var workspaceMetrics = Minimap.workspace.getMetrics();
  var minimapMetrics = Minimap.minimap.getMetrics();

  //scaling the mimimap such that all the blocks can be seen in the viewport
  //this padding is default because this is how to scrollbar(in main workspace) is implemented
  var topPadding = (workspaceMetrics.viewHeight)*Minimap.minimap.scale/(2*Minimap.workspace.scale);

  // if actual padding is more than half view ports height, change it to actual padding/
  if((workspaceBoundingBox.y*Minimap.workspace.scale-workspaceMetrics.contentTop)
      *Minimap.minimap.scale/Minimap.workspace.scale>topPadding){
    topPadding=(workspaceBoundingBox.y*Minimap.workspace.scale-workspaceMetrics.contentTop)
    *Minimap.minimap.scale/Minimap.workspace.scale;
  }
  var scalex = (minimapMetrics.viewWidth-Minimap.PADDING)/minimapBoundingBox.width;
  var scaley = (minimapMetrics.viewHeight-2*topPadding)/minimapBoundingBox.height;
  Minimap.minimap.setScale(Math.min(scalex,scaley));

  // translating the minimap
  Minimap.minimap.translate(-minimapBoundingBox.x*Minimap.minimap.scale+Minimap.PADDING,
                          -minimapMetrics.contentTop*Minimap.minimap.scale + topPadding);
};

/**
* Handles the onclick event on the minimapBoundingBox. Changes mapDraggers position.
* @param {Event} e Event from the mouse click
*/
Minimap.updateMapDragger = function(e){
  var y=e.clientY;
  var draggerHeight = Minimap.mapDragger.getAttribute("height");
  var finalY = y-Minimap.rect.top-draggerHeight/2;
  var maxValidY = (Minimap.workspace.getMetrics().contentHeight-Minimap.workspace.getMetrics().viewHeight)
                  *Minimap.minimap.scale;
  if(y+draggerHeight/2>Minimap.rect.bottom){
    finalY = Minimap.rect.bottom-Minimap.rect.top-draggerHeight;
  }else if(y<Minimap.rect.top+draggerHeight/2){
    finalY = 0;
  }
  // do not go below loew bound of scrollbar
  if(finalY>maxValidY){
    finalY=maxValidY;
  }
  Minimap.mapDragger.setAttribute("y", finalY);

  // required, otherwise creates a feedback loop
  Minimap.disableScrollChange=true;
  Minimap.workspace.scrollbar.vScroll.set((finalY*Minimap.workspace.scale)/Minimap.minimap.scale);
  Minimap.disableScrollChange=false;
};

/**
* Handles the onclick event on the minimapBoundingBox, paramaters are passed by
* the event handler
* @param {Float} position This is the absolute postion of the scrollbar.
* @param {boolean} horizontal Informs if the change event if for horizontal(true)
*     scrollbar or vertical(false) scrollbar.
*/
Minimap.onScrollChange = function(position,horizontal){
  if(horizontal){
    return;
  }
  var newDraggerPosition = (position*Minimap.minimap.scale/Minimap.workspace.scale);
  if(!Minimap.disableScrollChange){
    Minimap.mapDragger.setAttribute("y",newDraggerPosition);
  }
};
