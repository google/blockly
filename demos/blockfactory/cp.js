/**
 * Colour Picker v1.1
 *
 * Copyright 2006 Neil Fraser
 * https://neil.fraser.name/software/colourpicker/
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

// Include at the top of your page:
//   <script src="cp.js"></script>
// Call with:
//   <input name="mycolour" id="mycolour" value="ff00ff">
//   <script>
//     cp_init('mycolour')
//   </script>

var cp_grid = [
  ['ffffff', 'ffcccc', 'ffcc99', 'ffff99', 'ffffcc', '99ff99', '99ffff', 'ccffff', 'ccccff', 'ffccff'],
  ['cccccc', 'ff6666', 'ff9966', 'ffff66', 'ffff33', '66ff99', '33ffff', '66ffff', '9999ff', 'ff99ff'],
  ['c0c0c0', 'ff0000', 'ff9900', 'ffcc66', 'ffff00', '33ff33', '66cccc', '33ccff', '6666cc', 'cc66cc'],
  ['999999', 'cc0000', 'ff6600', 'ffcc33', 'ffcc00', '33cc00', '00cccc', '3366ff', '6633ff', 'cc33cc'],
  ['666666', '990000', 'cc6600', 'cc9933', '999900', '009900', '339999', '3333ff', '6600cc', '993399'],
  ['333333', '660000', '993300', '996633', '666600', '006600', '336666', '000099', '333399', '663366'],
  ['000000', '330000', '663300', '663333', '333300', '003300', '003333', '000066', '330099', '330033']];

var cp_dom = null;
var cp_caller = null;
var cp_defaultcolour = 'ffffff';
var cp_closePID = null;

function cp_init(id) {
  // Hide the form element, and replace it with a colour box.
  var obj = document.getElementById(id);
  if (!obj) {
    alert('Colour picker can\'t find "' + id + '"');
    return;
  }
  if (!cp_hex2rgb(obj.value)) {
    alert('Colour picker can\'t parse colour code in "' + id + '"');
    return;
  }
  if (!obj.cp_box) {
    obj.type = 'hidden';
    // <img style="background-color: #ff0000; border: outset 3px #888;"
    // src="1x1.gif" height=20 width=30>
    var box = document.createElement('img');
    box.style.border = 'outset 3px #888';
    box.src = '1x1.gif';
    box.height = 20;
    box.width = 30;
    box.label = id;
    box.onclick = new Function('cp_open(this)');
    box.onmouseover = cp_cancelclose;
    box.onmouseout = cp_closesoon;
    obj.parentNode.insertBefore(box, obj);
    obj.cp_box = box;
  }
  obj.cp_box.style.backgroundColor = '#' + obj.value;
}

function cp_open(caller) {
  // Create a table of colours.
  if (cp_dom) {
    cp_close();
    return;
  }
  cp_caller = caller;
  // alert(document.getElementById(caller.label));
  cp_defaultcolour = document.getElementById(caller.label).value;
  var posX = 0;
  var posY = caller.offsetHeight;
  while (caller) {
    posX += caller.offsetLeft;
    posY += caller.offsetTop;
    caller = caller.offsetParent;
  }
  cp_dom = document.createElement('div');
  cp_dom.id = 'colourpicker';
  var table = document.createElement('table');
  table.setAttribute('border', '1');
  table.style.backgroundColor = '#808080';
  table.onmouseover = cp_cancelclose;
  table.onmouseout = cp_closesoon;
  var tbody = document.createElement('tbody');  // IE 6 needs this.
  var row, cell;
  for (var y = 0; y < cp_grid.length; y++) {
    row = document.createElement('tr');
    tbody.appendChild(row);
    for (var x = 0; x < cp_grid[y].length; x++) {
      cell = document.createElement('td');
      row.appendChild(cell);
      cell.style.backgroundColor = '#' + cp_grid[y][x];
      cell.label = cp_grid[y][x];
      cell.style.border = 'solid 2px #' + cell.label;
      cell.onmouseover = cp_onmouseover;
      cell.onmouseout = cp_onmouseout;
      cell.onclick = cp_onclick;
      cell.innerHTML = '<img src="1x1.gif" height=16 width=16>';
      if (cp_defaultcolour.toLowerCase() == cp_grid[y][x].toLowerCase()) {
        cell.onmouseover();
        cell.onmouseout();
      }
    }
  }
  table.appendChild(tbody);
  cp_dom.appendChild(table);

  cp_dom.style.position = 'absolute';
  cp_dom.style.left = '0';
  cp_dom.style.top = '0';
  cp_dom.style.visibility = 'hidden';
  document.body.appendChild(cp_dom);
  // Don't widen the screen.
  if (posX + cp_dom.offsetWidth > document.body.offsetWidth) {
    posX = document.body.offsetWidth - cp_dom.offsetWidth;
  }
  cp_dom.style.left = posX + 'px';
  cp_dom.style.top = posY + 'px';
  cp_dom.style.visibility = 'visible';
}

function cp_close() {
  // Close the table now.
  cp_cancelclose();
  if (cp_dom)
    document.body.removeChild(cp_dom)
  cp_dom = null;
  cp_caller = null;
}

function cp_closesoon() {
  // Close the table a split-second from now.
  cp_closePID = window.setTimeout('cp_close()', 250);
}

function cp_cancelclose() {
  // Don't close the colour table after all.
  if (cp_closePID)
    window.clearTimeout(cp_closePID);
}

function cp_onclick() {
  // Clicked on a colour.
  // Close the table, set the colour, fire an onchange event.
  cp_caller.style.backgroundColor = '#' + this.label;
  var input = document.getElementById(cp_caller.label)
  input.value = this.label;
  cp_close();
  if (input.onchange) {
    input.onchange();
  }
}

function cp_onmouseover() {
  // Place a black border on the cell if the contents are light,
  // a white border if the contents are dark.
  this.style.borderStyle = 'dotted';
  var rgb = cp_hex2rgb(this.label);
  if (rgb[0] + rgb[1] + rgb[2] > 255 * 3 / 2)
    this.style.borderColor = 'black';
  else
    this.style.borderColor = 'white';
}

function cp_onmouseout() {
  // Remove the border.
  if (this.label == cp_defaultcolour) {
    this.style.borderStyle = 'outset';
  } else {
    this.style.border = 'solid 2px #' + this.label;
  }
}

function cp_hex2rgb(hexcode) {
  // Parse '0088ff' and return the [r, g, b] ints.
  var m =
      hexcode.match(/^([a-f0-9][a-f0-9])([a-f0-9][a-f0-9])([a-f0-9][a-f0-9])$/);
  if (m) {
    var r = parseInt(m[1], 16);
    var g = parseInt(m[2], 16);
    var b = parseInt(m[3], 16);
    return [r, g, b];
  } else {
    return null;
  }
}
