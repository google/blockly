/**
 * @license
 * Copyright 2019 Google LLC
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
 * @fileoverview Download screenshot.
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

/**
 * Convert an SVG datauri into a PNG datauri.
 * @param {string} data SVG datauri.
 * @param {number} width Image width.
 * @param {number} height Image height.
 * @param {!Function} callback Callback.
 */
function svgToPng_(data, width, height, callback) {
  var canvas = document.createElement("canvas");
  var context = canvas.getContext("2d");
  var img = new Image();

  var pixelDensity = 10;
  canvas.width = width * pixelDensity;
  canvas.height = height * pixelDensity;
  img.onload = function() {
    context.drawImage(
        img, 0, 0, width, height, 0, 0, canvas.width, canvas.height);
    try {
      var dataUri = canvas.toDataURL('image/png');
      callback(dataUri);
    } catch (err) {
      console.warn('Error converting the workspace svg to a png');
      callback('');
    }
  };
  img.src = data;
}

/**
 * Create an SVG of the blocks on the workspace.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace.
 * @param {!Function} callback Callback.
 */
function workspaceToSvg_(workspace, callback) {

  // Go through all text areas and set their value.
  var textAreas = document.getElementsByTagName("textarea");
  for (var i = 0; i < textAreas.length; i++) {
    textAreas[i].innerHTML = textAreas[i].value;
  }

  var bBox = workspace.getBlocksBoundingBox();
  var x = bBox.left;
  var y = bBox.top;
  var width = bBox.right - x;
  var height = bBox.bottom - y;

  var blockCanvas = workspace.getCanvas();
  var clone = blockCanvas.cloneNode(true);
  clone.removeAttribute('transform');
  
  var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.appendChild(clone);
  svg.setAttribute('viewBox',
      x + ' ' + y + ' ' + width + ' ' + height);

  svg.setAttribute('class', 'blocklySvg');
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);
  svg.setAttribute("style", 'background-color: transparent');

  var css = [].slice.call(document.head.querySelectorAll('style'))
      .filter(function(el) { return /\.blocklySvg/.test(el.innerText); })[0];
  var style = document.createElement('style');
  style.innerHTML = css.innerText;
  svg.insertBefore(style, svg.firstChild);

  var svgAsXML = (new XMLSerializer).serializeToString(svg);
  svgAsXML = svgAsXML.replace(/&nbsp/g, '&#160');
  var data = 'data:image/svg+xml,' + encodeURIComponent(svgAsXML);

  svgToPng_(data, width, height, callback);
}

/**
 * Download a screenshot of the blocks on a Blockly workspace.
 * @param {!Blockly.WorkspaceSvg} workspace The Blockly workspace.
 */
Blockly.downloadScreenshot = function(workspace) {
  workspaceToSvg_(workspace, function(datauri) {
    var a = document.createElement('a');
    a.download = 'screenshot.png';
    a.target = '_self';
    a.href = datauri;
    document.body.appendChild(a);
    a.click();
    a.parentNode.removeChild(a);
  });
};
