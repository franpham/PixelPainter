PixelPainter.defColors = ['white',    'black',    'silver',    'red',    '#9400D3',    'maroon',    'yellow',    'olive',    'lime',    'green',
  'aqua',     'teal',       'blue',      'navy',      'fuchsia',      'purple',     '#F08080',    '#F0E68C', '#D2691E', '#00FF7F', '#87CEEB',
  '#6A5ACD',    '#FF1493',     '#DC143C',     '#FF7F50',     '#FFE4B5',     '#DEB887',    '#7FFF00',    '#40E0D0', '#00BFFF', 'gray', '#778899'];
PixelPainter.numColors = {'white': 0, 'black': 1, 'silver': 2, 'red': 3, '#9400D3': 4, 'maroon': 5, 'yellow': 6, 'olive': 7, 'lime': 8, 'green': 9,
  'aqua': 'A', 'teal': 'B', 'blue': 'C', 'navy': 'D', 'fuchsia': 'E', 'purple': 'F', '#F08080': 'G', '#F0E68C': 'H', '#D2691E': 'I', '#00FF7F': 'J', '#87CEEB': 'K',
  '#6A5ACD': 'L', '#FF1493': 'M', '#DC143C': 'N', '#FF7F50': 'O', '#FFE4B5': 'P', '#DEB887': 'Q', '#7FFF00': 'R', '#40E0D0': 'S', '#00BFFF': 'T', 'gray': 'U', '#778899': 'V'};
// remove #778899 and gray colors in swatch for sidebar layout;

function PixelPainter(rows, cols) {
  var swatch = new Array(30);
  var buttons = new Array(rows);
  var grid = document.getElementById('grid');
  var erase = document.createElement('button');
  var clear = document.createElement('button');
  var move = document.createElement('button');
  var copy = document.createElement('button');
  var hash = document.createElement('button');
  var isPaint = isErase = isSelect = isMove = isCopy = false;
  var lastButton= prevButton = null;
  var lastColor = 'white';    // default white, NOT '';
  var thisColor = 'white';    // the selected color;
  var selection = {};         // the selected buttons;
  var lastFill  = {};         // contains last colored elements;
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
  this.getPainted = function(color) {
    var cells = {};
    for (var i = 0; i < rows; i++) {
      for (var j = 0; j < cols; j++) {     // get all painted cells if color is undefined;
        var cellColor = buttons[i][j].style.backgroundColor;
        if ((!color && cellColor !== '' && cellColor !== 'white') || cellColor === color)
          cells[buttons[i][j].dataset.gridIndex] = buttons[i][j];
      }
    }
    return cells;
  };
    // make the swatch buttons and register event listeners;
  for (var i = 0; i < swatch.length; i++) {
    swatch[i] = document.createElement('div');
    swatch[i].className = 'swatchButton';
    swatch[i].style.backgroundColor = PixelPainter.defColors[i];
    swatch[i].addEventListener('click', function() {
      self.clearSelection();
      lastColor = thisColor;
      thisColor = this.style.backgroundColor;
      isPaint = true;       // NOT isPaint = !isPaint;
      lastFill = self.getPainted(lastColor);
    });
  }

  this.clearSelection = function() {    // IMPORTANT: call this first since it clears all state;
    this.resetSelection(0);
    isPaint = isErase = isSelect = isMove = isCopy = false;
    this.moveFirst = this.moveLast = -1;
    lastButton = prevButton = null;
    selection = {};
  };
  clear.addEventListener('click', function() {
    self.clearSelection();
    lastFill = {};
    for (var i = 0; i < rows; i++) {
      for (var j = 0; j < cols; j++) {     // get all painted cells if color is undefined;
        buttons[i][j].style.backgroundColor = 'white';
      }
    }
  });

  // set properties and add listeners for action buttons
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
  erase.id = 'erase';
  clear.id = 'clear';
  erase.className = clear.className = 'imageButton';
  move.className = copy.className = hash.className = 'controlButton';
  erase.appendChild(document.createTextNode('Erase'));
  clear.appendChild(document.createTextNode('Clear'));
  move.appendChild(document.createTextNode('Move'));
  copy.appendChild(document.createTextNode('Copy'));
  hash.appendChild(document.createTextNode('Encode'));
  var tempDiv1 = document.createElement('div');
  var tempDiv2 = document.createElement('div');
  var controls = document.getElementById('controls');
  tempDiv1.appendChild(erase);
  tempDiv2.appendChild(clear);
  controls.appendChild(tempDiv1);
  controls.appendChild(tempDiv2);
  controls.appendChild(move);
  controls.appendChild(copy);
  controls.appendChild(hash);
  tempDiv1.className = 'buttonContainer';
  tempDiv2.className = 'buttonContainer';

  // make the grid buttons and register event listeners;
  for (var i = 0; i < rows; i++) {
    buttons[i] = new Array(cols);     // make each row;
    for (var j = 0; j < cols; j++) {
      buttons[i][j] = document.createElement('div');
      buttons[i][j].className = 'button';
      // buttons[i][j].name = i + '/' + j;   // FOR DEBUGGING;
      // IMPLEMENTATION: undo/ redo color when any button is revisited during a mouseover session;
      buttons[i][j].addEventListener('mouseover', function() {    // handler to paint and erase on mouseover;
        if (isSelect) {
          if (isErase) {
            this.dataset.prevColor = '';      // set dataset.prevColor to '' to prevent redos;
            this.style.backgroundColor = 'white';
          }
          else if (isPaint) {
            if (this.dataset.prevColor === '') {
              if (this.style.backgroundColor === lastColor)
                this.dataset.prevColor = lastColor;     // enable undo/ redo;
              this.style.backgroundColor = thisColor;
            }
            else if ((lastFill[this.dataset.gridIndex] || this.dataset.prevColor === lastColor) && this.style.backgroundColor === lastColor) {
              if (lastButton === this && (prevButton.dataset.prevColor === lastColor || prevButton.style.backgroundColor === lastColor)) {
                var prevTemp = prevButton.dataset.prevColor;          // MUST reset the last button also;
                prevButton.dataset.prevColor = prevButton.style.backgroundColor;
                prevButton.style.backgroundColor = prevTemp;
              }
              var tempColor = this.dataset.prevColor;
              this.dataset.prevColor = this.style.backgroundColor;
              this.style.backgroundColor = tempColor;
            }
            // IMPORTANT: the 2nd condition checks for undo && the 1st condition checks for redo;
            else if (this.dataset.prevColor === thisColor || this.style.backgroundColor === thisColor) {
              if (lastButton === this && (prevButton.dataset.prevColor === thisColor || prevButton.style.backgroundColor === thisColor)) {
                var prevTemp = prevButton.dataset.prevColor;          // MUST reset the last button also;
                prevButton.dataset.prevColor = prevButton.style.backgroundColor;
                prevButton.style.backgroundColor = prevTemp;
              }
              var tempColor = this.dataset.prevColor;
              this.dataset.prevColor = this.style.backgroundColor;
              this.style.backgroundColor = tempColor;
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
      });         // IMPORTANT: set prevColor to '' to disable redos, and to 'white' to enable redos;
      buttons[i][j].dataset.prevColor = '';          // prevColor enables painting redos;
      buttons[i][j].style.backgroundColor = '';      // colors set in CSS are NOT set in JS variables!
      buttons[i][j].dataset.gridIndex = (i * cols) + j;       // data to save button's overall index position;
      buttons[i][j].addEventListener('click', function() {    // handler to paint, select, copy, and move;
        if (isErase || isPaint) {
          isSelect = !isSelect;   // NOTE: isSelect is used for erasing && painting only;
          if (isErase) {          // set dataset.prevColor to '' to prevent redos;
            this.dataset.prevColor = '';
            this.style.backgroundColor = 'white';
          }
          else if (isPaint && this !== prevButton) {    // check so that clicking to stop mouseover do not cause a redo;
            this.dataset.prevColor = this.style.backgroundColor;
            this.style.backgroundColor = thisColor;
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
              for (var i = 0; i < keys.length; i++) {
                var total = parseInt(selection[keys[i]].dataset.gridIndex) + maxMove;
                var element = buttons[parseInt(total / cols)][total % cols];
                element.dataset.prevColor = element.style.backgroundColor;
                element.style.backgroundColor = selection[keys[i]].style.backgroundColor;

                if (isMove && !selection[total])    // DO NOT change the element if its new position matches selection's position;
                  selection[keys[i]].style.backgroundColor = 'white';
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
      grid.appendChild(buttons[i][j]);
    }
    grid.appendChild(temp);
  }
  var swatches = document.getElementById('swatch');
  for (var i = 0; i < swatch.length; i++) {
    swatches.appendChild(swatch[i]);
  }
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
  }
};

RGBtoHex = function(r,g,b) {
  var bin = r << 16 | g << 8 | b;
  return (function(h){
      return '#' + new Array(7-h.length).join("0")+h;
  })(bin.toString(16).toUpperCase());
};
var painter = new PixelPainter(24, 48);