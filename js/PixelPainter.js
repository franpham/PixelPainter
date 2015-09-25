PixelPainter.defColors = ['white',    'silver',    'gray',    'black',    'red',    'maroon',    'yellow',    'olive',    'lime',    'green',
  'aqua',     'teal',       'blue',      'navy',      'fuchsia',      'purple',     '#F08080',    '#F0E68C', '#D2691E', '#00FF7F', '#87CEEB',
  '#6A5ACD',    '#FF1493',     '#DC143C',     '#FF7F50',     '#FFE4B5',     '#DEB887',    '#7FFF00',    '#40E0D0', '#00BFFF', '#9400D3', '#778899'];
PixelPainter.numColors = {'white': 0, 'silver': 1, 'gray': 2, 'black': 3, 'red': 4, 'maroon': 5, 'yellow': 6, 'olive': 7, 'lime': 8, 'green': 9,
  'aqua': 'A', 'teal': 'B', 'blue': 'C', 'navy': 'D', 'fuchsia': 'E', 'purple': 'F', '#F08080': 'G', '#F0E68C': 'H', '#D2691E': 'I', '#00FF7F': 'J', '#87CEEB': 'K',
  '#6A5ACD': 'L', '#FF1493': 'M', '#DC143C': 'N', '#FF7F50': 'O', '#FFE4B5': 'P', '#DEB887': 'Q', '#7FFF00': 'R', '#40E0D0': 'S', '#00BFFF': 'T', '#9400D3': 'U', '#778899': 'V'};

function PixelPainter(rows, cols) {
  var swatch = new Array(32);
  var buttons = new Array(rows);
  var grid = document.getElementById('grid');
  var topbar = document.getElementById('topbar');
  var erase = document.createElement('button');
  var clear = document.createElement('button');
  var move = document.createElement('button');
  var copy = document.createElement('button');
  var hash = document.createElement('button');
  var isPaint = isErase = isSelect = isMove = isCopy = false;
  var lastButton= prevButton = null;
  var thisColor = 'white';    // the selected color;
  var selection = {};         // the selected buttons;
  var painted = {};           // contains painted elements;
  var self = this;            // "this" in event listeners refer to html elements;
  this.moveFirst = -1;        // no getter methods for these properties, so keep public;
  this.moveLast = -1;
  this.cols = cols;

  this.getButtons = function() {
    return buttons;
  };
  this.getSelection = function() {
    return selection;
  };
  this.getPainted = function() {
    return painted;
  };
    // make the swatch buttons and register event listeners;
  for (var i = 0; i < swatch.length; i++) {
    swatch[i] = document.createElement('div');
    swatch[i].className = 'swatchButton';
    swatch[i].style.backgroundColor = PixelPainter.defColors[i];
    swatch[i].addEventListener('click', function() {
      self.clearSelection();
      thisColor = this.style.backgroundColor;
      isPaint = true;     // NOT isPaint = !isPaint;
    });
  }

  this.clearSelection = function() {    // IMPORTANT: call this first since it clears all state;
    this.resetSelection(0);
    isPaint = isErase = isSelect = isMove = isCopy = false;
    this.moveFirst = this.moveLast = -1;
    lastButton = prevButton = null;
    selection = {};
    var keys = Object.keys(painted);
    for (var i = 0; i < keys.length; i++) {
      var element = painted[keys[i]];
      element.dataset.prevColor = '';   // reset last stroke color;
      if (element.style.backgroundColor === 'white')
        delete painted[element.dataset.gridIndex];
    }
  };
  clear.addEventListener('click', function() {
    self.clearSelection();
    var keys = Object.keys(painted);
    for (var i = 0; i < keys.length; i++) {
      var element = painted[keys[i]];
      element.dataset.prevColor = '';             // reset last stroke color;
      element.style.backgroundColor = 'white';    // reset current stroke color;
    }
    painted = {};
  });

  // set properties and add listeners for control buttons
  erase.addEventListener('click', function() {
    self.clearSelection();
    thisColor = 'white';
    isErase = !isErase;
  });
  move.addEventListener('click', function() {
    self.clearSelection();
    isMove = true;    // NOT isMove = !isMove;
  });
  copy.addEventListener('click', function() {
    self.clearSelection();
    isCopy = true;    // NOT isCopy = !isCopy;
  });
  hash.addEventListener('click', function() {
    alert('Link to this URL to share your artwork:\n' + window.location + '#' + self.encode());
  });
  erase.className = clear.className = 'control';
  move.className = copy.className = hash.className = 'control';
  erase.appendChild(document.createTextNode('Erase'));
  clear.appendChild(document.createTextNode('Clear'));
  move.appendChild(document.createTextNode('Move'));
  copy.appendChild(document.createTextNode('Copy'));
  hash.appendChild(document.createTextNode('Encode'));
  topbar.appendChild(erase);
  topbar.appendChild(clear);
  topbar.appendChild(move);
  topbar.appendChild(copy);
  topbar.appendChild(hash);

  // make the grid buttons and register event listeners;
  for (var i = 0; i < rows; i++) {
    buttons[i] = new Array(cols);     // make each row;
    for (var j = 0; j < cols; j++) {
      buttons[i][j] = document.createElement('div');
      buttons[i][j].className = 'button';
      // buttons[i][j].name = i + '/' + j;   // FOR DEBUGGING;
      // IMPLEMENTATION: undo/ redo color when any button is revisited during the same mouseover session;
      buttons[i][j].addEventListener('mouseover', function() {    // handler to paint and erase on mouseover;
        if (isSelect) {
          if (isErase) {
            this.dataset.prevColor = '';      // set dataset.prevColor to '' so that erase doesn't act like white paint;
            this.style.backgroundColor = 'white';
            delete painted[this.dataset.gridIndex];
          }
          else if (isPaint) {       // if color is white (NOT ''), then painting has been undone, so allow redo;
            if ((painted[this.dataset.gridIndex] || this.style.backgroundColor === 'white') && this.dataset.prevColor !== '') {
            // if (this.style.backgroundColor === thisColor || this.dataset.prevColor === thisColor) {
            //   // IMPORTANT: the 1st condition checks for undo && the 2nd condition checks for redo;

              if (lastButton === this && prevButton.dataset.prevColor !== '') {     // MUST reset the last button also;
                var prevTemp = prevButton.dataset.prevColor;
                prevButton.dataset.prevColor = prevButton.style.backgroundColor;
                prevButton.style.backgroundColor = prevTemp;
              }
              var tempColor = this.dataset.prevColor;
              this.dataset.prevColor = this.style.backgroundColor;
              this.style.backgroundColor = tempColor;
            }
            else {
              this.dataset.prevColor = this.style.backgroundColor;
              this.style.backgroundColor = thisColor;
              painted[this.dataset.gridIndex] = this;
            }
            lastButton = prevButton;    // must set AFTER checking condition above!
            prevButton = this;
          }
        }       // make selection opaque only if still dragging (1st button is selected, but 2nd button is not);
        else if ((isMove || isCopy) && self.moveFirst >= 0 && self.moveLast < 0) {
          var selectEnd = parseInt(this.dataset.gridIndex);
          self.setSelection(selectEnd);       // add pixels' indices larger than last selection;
          self.resetSelection(selectEnd);     // remove pixels' indices smaller than last selection;
        }
      });
      buttons[i][j].dataset.prevColor = '';             // prevColor enables painting redo; set to '' if not in previous paint stroke;
      buttons[i][j].style.backgroundColor = 'white';    // MUST set color here; colors set in CSS are NOT set in JS variables!
      buttons[i][j].dataset.gridIndex = (i * cols) + j;       // custom data to save button's overall index position;
      buttons[i][j].addEventListener('click', function() {    // handler to paint, select, copy, and move;
        if (isErase || isPaint) {
          isSelect = !isSelect;   // NOTE: isSelect is used for erasing && painting only;
          if (isErase) {          // set dataset.prevColor to '' so that erase doesn't act like white paint;
            this.dataset.prevColor = '';
            this.style.backgroundColor = 'white';
            delete painted[this];
          }
          else if (isPaint) {
            if (this !== prevButton) {
              this.dataset.prevColor = this.style.backgroundColor;
              this.style.backgroundColor = thisColor;
              painted[this.dataset.gridIndex] = this;
            }
          }
        }
        else if (isMove || isCopy) {
          if (self.moveFirst === -1) {   // start selection;
            self.moveFirst = parseInt(this.dataset.gridIndex);
          }
          else if (self.moveLast === -1) {   // finish selection;
            self.moveLast = parseInt(this.dataset.gridIndex);
          }
          else {      // IMPORTANT: dataset values are always returned as strings;
            var movePos = parseInt(this.dataset.gridIndex);
            if (!self.isValidSpot(movePos)) {
              alert('Choose a position that is outside the selected area.');
            }
            else {
              var keys = Object.keys(selection);
              var maxMove = self.findMoveDiff(movePos);
              // console.log("maxMove = " + maxMove);   // FOR DEBUGGING;
              for (var i = 0; i < keys.length; i++) {
                var total = parseInt(selection[keys[i]].dataset.gridIndex) + maxMove;
                var element = buttons[parseInt(total / cols)][total % cols];
                element.dataset.prevColor = element.style.backgroundColor;
                element.style.backgroundColor = selection[keys[i]].style.backgroundColor;
                painted[element.dataset.gridIndex] = element;

                if (isMove && !selection[total]) {    // DO NOT change the element if its new position matches selection's position;
                  selection[keys[i]].style.backgroundColor = 'white';
                  delete painted[selection[keys[i]].dataset.gridIndex];
                }
              }
              if (isMove)
                self.clearSelection();
              else   // DO NOT clear variables, just the selection if isCopy;
                self.resetSelection(0);
            }
          }
        }
      });
    }
  }
  // add buttons to a grid of div row;
  for (var i = 0; i < rows; i++) {
    var temp = document.createElement('div');
    for (var j = 0; j < cols; j++) {
      temp.appendChild(buttons[i][j]);
    }
    grid.appendChild(temp);
  }
  // add the swatch buttons to 2 div row;
  var row1 = document.createElement('div');
  var row2 = document.createElement('div');
  for (var i = 0; i < swatch.length; i++) {
    if (i < swatch.length / 2)
      row1.appendChild(swatch[i]);
    else
      row2.appendChild(swatch[i]);
  }
  topbar.appendChild(row1);
  topbar.appendChild(row2);
  if (window.location.hash)
    this.decode(window.location.hash.substring(1));
}

PixelPainter.prototype.setSelection = function(lastIndex) {
  var firsty = parseInt(this.moveFirst / this.cols);
  var firstx = this.moveFirst % this.cols;
  var lasty = parseInt(lastIndex / this.cols);
  var lastx = lastIndex % this.cols;
  var selected = this.getSelection();
  var elements = this.getButtons();
  for (var i = this.moveFirst; i <= lastIndex; i++) {
    var active = elements[parseInt(i / this.cols)][i % this.cols];
    var index = parseInt(active.dataset.gridIndex);
    if ((parseInt(index / this.cols) <= lasty && (index % this.cols) <= lastx) &&
        (parseInt(index / this.cols) >= firsty && (index % this.cols) >= firstx)) {
      selected[index] = active;       // only set buttons within selected rectangle;
      selected[index].classList.add('selected');
    }
  }
};
// do not need to check selection < moveFirst position since selection before moveFirst is not allowed;
PixelPainter.prototype.resetSelection = function(lastIndex) {
  var lasty = parseInt(lastIndex / this.cols);
  var lastx = lastIndex % this.cols;
  var selected = this.getSelection();
  var keys = Object.keys(selected);
  for (var i = 0; i < keys.length; i++) {
    var index = parseInt(selected[keys[i]].dataset.gridIndex);
    if (parseInt(index / this.cols) > lasty || (index % this.cols) > lastx)
      selected[keys[i]].classList.remove('selected');    // check if button is in current selected;
  }
};
// calculate the difference in position between that movePos and it nearest corner;
// movePos is the selected position, which is required to be outside the selected area;
PixelPainter.prototype.findMoveDiff = function(movePos) {
  var picky = parseInt(movePos / this.cols);
  var pickx = movePos % this.cols;
  var topLeft = this.moveFirst;
  var bottomRight = this.moveLast;
  var movey = picky < parseInt(topLeft / this.cols) ? picky - parseInt(topLeft / this.cols) :
    (picky > parseInt(bottomRight / this.cols) ? picky - parseInt(bottomRight / this.cols) : 0);
  var movex = pickx < topLeft % this.cols ? pickx - (topLeft % this.cols) :
    (pickx > bottomRight % this.cols ? pickx - (bottomRight % this.cols) : 0);
  return (movey * this.cols) + movex;
};
PixelPainter.prototype.isValidSpot = function(movePos) {
  var picky = parseInt(movePos / this.cols);
  var pickx = movePos % this.cols;
  var topLeft = this.moveFirst;
  var bottomRight = this.moveLast;
  return !((pickx >= topLeft % this.cols) && (pickx <= bottomRight % this.cols) &&
    picky >= parseInt(topLeft / this.cols) && picky <= parseInt(bottomRight / this.cols));
};

PixelPainter.prototype.encode = function() {
  var str = '';
  var colored = this.getPainted();
  var keys = Object.keys(colored);
  for (var i = 0; i < keys.length; i++) {
    var color = colored[keys[i]].style.backgroundColor;
    if (color === 'white')      // color is white if painting was undone;
      continue;
    var index = Number(colored[keys[i]].dataset.gridIndex).toString(36);
    index = index.length === 1 ? '0' + index : index;   // dataset always returns a STRING;
    if (color.indexOf('rgb') === 0) {
      var nums = color.substring(4, color.length - 1).split(',');
      color = RGBtoHex(nums[0], nums[1], nums[2]);
    }
    color = PixelPainter.numColors[color];
    str += index + color;
  }
  return str;
};
PixelPainter.prototype.decode = function(str) {
  var keys = [];
  var start = 0;
  var items = this.getButtons();
  var colored = this.getPainted();
  while (start < str.length) {
    keys.push(str.substring(start, start + 3));
    start += 3;
  }
  for (var i = 0; i < keys.length; i++) {
    var index = parseInt(keys[i].substring(0, keys[i].length - 1), 36);
    var color = parseInt(keys[i].charAt(keys[i].length - 1), 36);
    color = PixelPainter.defColors[color];
    var clickx = index % this.cols;
    var clicky = parseInt(index / this.cols);
    var element = items[clicky][clickx];
    element.style.backgroundColor = color;
    colored[element.dataset.gridIndex] = element;
  }
};

RGBtoHex = function(r,g,b) {
  var bin = r << 16 | g << 8 | b;
  return (function(h){
      return '#' + new Array(7-h.length).join("0")+h;
  })(bin.toString(16).toUpperCase());
};
var painter = new PixelPainter(24, 48);