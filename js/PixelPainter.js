
function PixelPainter(rows, cols) {
  var defColors = ['white', 'silver', 'gray', 'black', 'red', 'maroon', 'yellow', 'olive', 'lime', 'green', 'aqua', 'teal', 'blue', 'navy', 'fuchsia', 'purple'];

  var swatch = new Array(16);
  var buttons = new Array(rows);
  var grid = document.createElement('div');
  var topbar = document.createElement('div');
  var erase = document.createElement('button');
  var clear = document.createElement('button');
  var move = document.createElement('button');
  var copy = document.createElement('button');
  var isPaint = isErase = isSelect = isMove = isCopy = false;
  var lastButton= prevButton = null;
  var thisColor = 'white';    // the selected color;
  var selection = {};         // the selected buttons;
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
  this.clearSelection = function() {    // IMPORTANT: call this first since it clears all state;
    this.resetSelection(0);
    isPaint = isErase = isSelect = isMove = isCopy = false;
    this.moveFirst = this.moveLast = -1;
    selection = {};
  };

    // make the swatch buttons and register event listeners;
  for (var i = 0; i < swatch.length; i++) {
    swatch[i] = document.createElement('div');
    swatch[i].className = 'swatchButton';
    swatch[i].style.background = defColors[i];
    swatch[i].addEventListener('click', function() {
      self.clearSelection();
      thisColor = this.style.background;
      isPaint = true;     // NOT isPaint = !isPaint;
    });
  }
  clear.addEventListener('click', function() {
    self.clearSelection();
    for (var i = 0; i < rows; i++) {
      for (var j = 0; j < cols; j++) {
        buttons[i][j].style.background = 'white';
      }
    }
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

  erase.className = clear.className = 'control';
  move.className = copy.className = 'control';
  erase.appendChild(document.createTextNode('Erase'));
  clear.appendChild(document.createTextNode('Clear'));
  move.appendChild(document.createTextNode('Move'));
  copy.appendChild(document.createTextNode('Copy'));
  topbar.appendChild(erase);
  topbar.appendChild(clear);
  topbar.appendChild(move);
  topbar.appendChild(copy);

  // make the grid buttons and register event listeners;
  for (var i = 0; i < rows; i++) {
    buttons[i] = new Array(cols);     // make each column;
    for (var j = 0; j < cols; j++) {
      buttons[i][j] = document.createElement('div');
      buttons[i][j].className = 'button';
      // buttons[i][j].name = i + '/' + j;   // FOR DEBUGGING;

      buttons[i][j].dataset.prevColor = 'white';       // custom data to record previous color;
      buttons[i][j].addEventListener('mouseover', function() {    // handler to paint and erase on mouseover;
        // IMPLEMENTATION: undo/ redo color when any button is revisited during the same mouseover session;
        if (isSelect) {
          if (isErase) {
            this.dataset.prevColor = this.style.background = 'white';
          }
          else if (isPaint) {
            if (this.style.background === thisColor || this.dataset.prevColor === thisColor) {
              // IMPORTANT: the 1st condition checks for undo && the 2nd condition checks for redo;
              if (lastButton === this) {        // MUST reset the last button also;
                var prevTemp = prevButton.dataset.prevColor;
                prevButton.dataset.prevColor = prevButton.style.background;
                prevButton.style.background = prevTemp;
              }
              var thisTemp = this.dataset.prevColor;      // MUST set previous color in order to redo color!
              this.dataset.prevColor = this.style.background;
              this.style.background = thisTemp;
            }
            else {
              this.dataset.prevColor = this.style.background;
              this.style.background = thisColor;
            }
            lastButton = prevButton;    // must set AFTER checking condition above!
            prevButton = this;
          }
        }       // make selection opaque only if still dragging (1st button is selected, but 2nd button is not);
        else if ((isMove || isCopy) && self.moveFirst >= 0 && self.moveLast < 0) {
          var selectEnd = parseInt(this.dataset.listIndex);
          self.setSelection(selectEnd);       // add pixels' indices larger than last selection;
          self.resetSelection(selectEnd);     // remove pixels' indices smaller than last selection;
        }
      });
      buttons[i][j].dataset.listIndex = ((i * cols) + j);    // custom data to save button's overall index position;
      buttons[i][j].addEventListener('click', function() {    // handler to paint, select, copy, and "move" buttons;
        if (isErase || isPaint) {
          isSelect = !isSelect;   // NOTE: isSelect is used for erasing && painting only;
          if (isErase) {
            this.dataset.prevColor = this.style.background = 'white';
          }
          else if (isPaint) {
            this.dataset.prevColor = this.style.background;
            this.style.background = thisColor;
          }
        }
        else if (isMove || isCopy) {
          if (self.moveFirst === -1) {   // start selection;
            self.moveFirst = parseInt(this.dataset.listIndex);
          }
          else if (self.moveLast === -1) {   // finish selection;
            self.moveLast = parseInt(this.dataset.listIndex);
          }
          else {
            var movePos = parseInt(this.dataset.listIndex);
            if (!self.isValidSpot(movePos)) {
              alert('Choose a position that is outside the selected area.');
            }
            else {
              var keys = Object.keys(selection);
              var maxMove = self.findMoveDiff(movePos);
              // console.log("maxMove = " + maxMove);   // FOR DEBUGGING;
              for (var i = 0; i < keys.length; i++) {
                var total = parseInt(selection[keys[i]].dataset.listIndex) + maxMove;
                buttons[parseInt(total / cols)][total % cols].style.background = selection[keys[i]].style.background;
                if (isMove && !selection[total])
                  selection[keys[i]].style.background = 'white';
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
  grid.className = 'spacing';
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
  topbar.className = 'spacing';
  topbar.appendChild(row1);
  topbar.appendChild(row2);
  document.getElementById('pixelPainter').appendChild(topbar);
  document.getElementById('pixelPainter').appendChild(grid);
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
    var index = parseInt(active.dataset.listIndex);
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
    var index = parseInt(selected[keys[i]].dataset.listIndex);
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

var painter = new PixelPainter(24, 48);
