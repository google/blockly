/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Download screenshot.
 * @author samelh@google.com (Sam El-Husseini)
 */
import * as Blockly from 'blockly/core';

/**
 * Convert an SVG datauri into a PNG datauri.
 * @param {string} data SVG datauri.
 * @param {number} width Image width.
 * @param {number} height Image height.
 * @param {!Function} callback Callback.
 */
function svgToPng_(data, width, height, callback) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const img = new Image();

  const pixelDensity = 10;
  canvas.width = width * pixelDensity;
  canvas.height = height * pixelDensity;
  img.onload = function () {
    context.drawImage(
      img,
      0,
      0,
      width,
      height,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    try {
      const dataUri = canvas.toDataURL('image/png');
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
 * @param {string=} customCss Custom CSS to append to the SVG.
 */
function workspaceToSvg_(workspace, callback, customCss) {
  // Go through all text areas and set their value.
  const textAreas = document.getElementsByTagName('textarea');
  for (let i = 0; i < textAreas.length; i++) {
    textAreas[i].innerText = textAreas[i].value;
  }

  const bBox = workspace.getBlocksBoundingBox();
  const x = bBox.x || bBox.left;
  const y = bBox.y || bBox.top;
  const width = bBox.width || bBox.right - x;
  const height = bBox.height || bBox.bottom - y;

  const blockCanvas = workspace.getCanvas();
  const blockCanvasClone = blockCanvas.cloneNode(true);
  blockCanvasClone.removeAttribute('transform');

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('viewBox', x + ' ' + y + ' ' + width + ' ' + height);

  svg.setAttribute(
    'class',
    'blocklySvg ' +
      (workspace.options.renderer || 'geras') +
      '-renderer ' +
      (workspace.getTheme ? workspace.getTheme().name + '-theme' : ''),
  );
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);
  svg.setAttribute('style', 'background-color: transparent');

  const css = [].slice
    .call(document.head.querySelectorAll('style'))
    .filter(function (el) {
      return (
        /\.blocklySvg/.test(el.innerText) || el.id.indexOf('blockly-') === 0
      );
    })
    .map(function (el) {
      return el.innerText;
    })
    .join('\n');
  const style = document.createElement('style');
  style.textContent = css + '\n' + customCss;

  svg.appendChild(style);
  for (const defs of workspace.getSvgGroup().getElementsByTagName('defs')) {
    svg.appendChild(defs.cloneNode(true));
  }
  svg.appendChild(blockCanvasClone);

  let svgAsXML = new XMLSerializer().serializeToString(svg);
  svgAsXML = svgAsXML.replace(/&nbsp/g, '&#160');
  const data = 'data:image/svg+xml,' + encodeURIComponent(svgAsXML);

  svgToPng_(data, width, height, callback);
}

/**
 * Download a screenshot of the blocks on a Blockly workspace.
 * @param {!Blockly.WorkspaceSvg} workspace The Blockly workspace.
 */
export function downloadWorkspaceScreenshot(workspace) {
  workspaceToSvg_(workspace, function (datauri) {
    const a = document.createElement('a');
    a.download = 'screenshot.png';
    a.target = '_self';
    a.href = datauri;
    document.body.appendChild(a);
    a.click();
    a.parentNode.removeChild(a);
  });
}
