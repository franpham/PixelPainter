
function PixelPainter(width, height) {
  var defColors = ['white', 'silver', 'gray', 'black', 'red', 'maroon', 'yellow', 'olive', 'lime', 'green', 'aqua', 'teal', 'blue', 'navy', 'fuchsia', 'purple'];
  var grid = document.createElement('div');
  var topbar = document.createElement('div');
  var buttons = new Array(width);

  var swatch = new Array(16);
  var erase = document.createElement('button');
  var clear = document.createElement('button');
  var move = document.createElement('button');
  var copy = document.createElement('button');
  var isPaint = isErase = isSelect = isMove = isCopy = false;
  var lastButton= prevButton = null;
  var thisColor = 'white';    // the selected color;
  var selection = {};         // the selected buttons;
  var self = this;            // "this" in event listeners refer to html elements;
  this.moveFirst = -1;        // no getter methods, so keep public;
  this.moveLast = -1;
  this.width = width;

  this.getButtons = function() {
    return buttons;
  };
  this.getSelection = function() {
    return selection;
  };
  this.clearSelection = function() {
    isPaint = isErase = isSelect = isMove = isCopy = false;
    this.moveFirst = this.moveLast = -1;
    selection = {};   // don't need to call resetSelection since it's re-initialized;
  };

    // make the swatch buttons and register event listeners;
  for (var i = 0; i < swatch.length; i++) {
    swatch[i] = document.createElement('button');
    swatch[i].className = 'button';
    swatch[i].style.background = defColors[i];
    swatch[i].addEventListener('click', function() {
      if (isMove || isCopy)
        this.clearSelection();
      isPaint = true;     // NOT isPaint = !isPaint; call AFTER clearSelection();
      thisColor = this.style.background;
    });
  }
  clear.addEventListener('click', function() {
    for (var i = 0; i < cols; i++) {
      for (var j = 0; j < rows; j++) {
        buttons[i][j].style.background = 'white';
      }
    }
    if (isMove || isCopy)
      this.clearSelection();
  });

  // set properties and add listeners for controls buttons
  erase.addEventListener('click', function() {
    thisColor = 'white';
    isErase = !isErase;
    if (isMove || isCopy)
      this.clearSelection();
  });
  move.addEventListener('click', function() {
    if (isMove || isCopy)
      this.clearSelection();
    else
      isMove = true;    // NOT isMove = !isMove;
  });
  copy.addEventListener('click', function() {
    if (isMove || isCopy)
      this.clearSelection();
    else
      isCopy = true;    // NOT isCopy = !isCopy;
  });

  erase.className = clear.className = 'swatchButton';
  move.className = copy.className = 'swatchButton';
  erase.appendChild(document.createTextNode('Erase'));
  clear.appendChild(document.createTextNode('Clear'));
  move.appendChild(document.createTextNode('Move'));
  copy.appendChild(document.createTextNode('Copy'));
  topbar.appendChild(erase);
  topbar.appendChild(clear);
  topbar.appendChild(move);
  topbar.appendChild(copy);

  // make the grid buttons and register event listeners;
  for (var i = 0; i < width; i++) {
    buttons[i] = new Array(height);     // make each column;
    for (var j = 0; j < height; j++) {
      buttons[i][j] = document.createElement('button');
      buttons[i][j].className = 'button';
      // buttons[i][j].name = 'button' + i + '/' + j;   // FOR DEBUGGING;

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
      buttons[i][j].dataset.listIndex = ((i * width) + j);    // custom data to save button's overall index position;
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
              var maxMove = self.findMaxMove(movePos);
              for (var i = 0; i < keys.length; i++) {
                var total = self.moveFirst + i + maxMove;
                buttons[total % width][parseInt(total / width)].style.background = selection[keys[i]].style.background;
                if (isMove)
                  selection[keys[i]].style.background = 'white';
              }
              if (!isCopy)    // DO NOT clearSelection() to allow multiple copies;
                self.clearSelection();
            }
          }
        }
      });
    }
  }

  // add buttons to a grid of div row;
  grid.className = 'spacing';
  for (var i = 0; i < width; i++) {
    var temp = document.createElement('div');
    for (var j = 0; j < height; j++) {
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
  var firsty = parseInt(this.moveFirst / this.width);
  var firstx = this.moveFirst % this.width;
  var lasty = parseInt(lastIndex / this.width);
  var lastx = lastIndex % this.width;
  var selected = this.getSelection();
  var elements = this.getButtons();
  for (var i = this.moveFirst; i <= lastIndex + this.width; i++) {
    var active = elements[i % this.width][parseInt(i / this.width)];
    var index = parseInt(active.dataset.listIndex);
    if ((parseInt(index / this.width) <= lasty && (index % this.width) <= lastx) &&
        (parseInt(index / this.width) >= firsty && (index % this.width) >= firstx)) {
      selected[index] = active;       // only set buttons within selected rectangle;
      selected[index].classList.add('selected');
    }
  }
};
// do not need to check selection < moveFirst position since selection before moveFirst is not allowed;
PixelPainter.prototype.resetSelection = function(lastIndex) {
  var lasty = parseInt(lastIndex / this.width);
  var lastx = lastIndex % this.width;
  var selected = this.getSelection();
  var keys = Object.keys(selected);
  for (var i = 0; i < keys.length; i++) {
    var index = parseInt(selected[keys[i]].dataset.listIndex);
    if (parseInt(index / this.width) > lasty || (index % this.width) > lastx) // && parseInt(index / this.width) < lasty))
      selected[keys[i]].classList.remove('selected');    // check if button is in current selected;
  }
};
// compare with the center of the selected to determine moving direction;
// find the nearest corner to movePos, then find the difference between that corner and movePos;
PixelPainter.prototype.findMaxMove = function(movePos) {    // movePos is the selected position, which is required to be outside the selected area;
  var movey = parseInt(movePos / this.width);
  var movex = movePos % this.width;
  var topLeft = this.moveFirst;
  var topRight = this.moveFirst + (this.moveLast % this.width);
  var bottomRight = this.moveLast;
  var bottomLeft = this.moveLast - (this.moveLast % this.width);
  var center = (this.moveLast - this.moveFirst) / 2;
  var nearest = Math.min(Math.abs(movePos - topLeft), Math.abs(movePos - topRight), Math.abs(movePos - bottomLeft), Math.abs(movePos - bottomRight));
  nearest = nearest === Math.abs(movePos - topLeft) ? topLeft : (nearest === Math.abs(movePos - topRight) ? topRight :
    (nearest === Math.abs(movePos - bottomLeft) ? bottomLeft : bottomRight));
  // var moveRight = movex > (center % this.width);
  // var moveDown = movey > parseInt(center / this.width);
  return movePos - nearest;       // return the difference in position in buttons array between movePos and its nearest corner;
};
PixelPainter.prototype.isValidSpot = function(movePos) {
  var movey = parseInt(movePos / this.width);
  var movex = movePos % this.width;
  var topLeft = this.moveFirst;
  var topRight = this.moveFirst + (this.moveLast % this.width);
  var bottomRight = this.moveLast;
  var bottomLeft = this.moveLast - (this.moveLast % this.width);
  // MUST check each corner since x & y comparisons must include equality because x OR y can be equal, but NOT BOTH;
  if (movePos === topLeft || movePos === topRight || movePos === bottomLeft || movePos === bottomRight)
    return false;
  return (movex <= (topLeft % this.width) || movex >= (bottomRight % this.width)) &&
    (movey <= parseInt(topLeft / this.width) || movey >= parseInt(bottomRight / this.width));
};
var painter = new PixelPainter(10, 10);
