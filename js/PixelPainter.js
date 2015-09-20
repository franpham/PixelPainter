
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
  var moveFirst = moveLast = moveNew = -1;
  var lastButton= prevButton = null;
  var thisColor = 'white';   // the selected color;
  var selection = [];       // the selected buttons;

  // make the swatch buttons and register event listeners;
  for (var i = 0; i < swatch.length; i++) {
    swatch[i] = document.createElement('button');
    swatch[i].className = 'button';
    swatch[i].style.background = defColors[i];
    swatch[i].addEventListener('click', function() {
      thisColor = this.style.background;
      isPaint = !isPaint;
    });
  }
  clear.addEventListener('click', function() {
    for (var i = 0; i < width; i++) {
      for (var j = 0; j < height; j++) {
        buttons[i][j].style.background = 'white';
      }
    }
  });

  // set properties and add listeners for controls buttons
  erase.addEventListener('click', function() {
    thisColor = 'white';
    isErase = !isErase;
  });
  move.addEventListener('click', function() {
    isMove = true;    // handler must set to false;
  });
  copy.addEventListener('click', function() {
    isCopy = true;    // handler must set to false;
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
      buttons[i][j].addEventListener('mouseover', function() {    // handler to paint and erase on moveover;
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
        }       // make selection opaque only if 1st button is selected, but 2nd button is not;
        else if ((isMove || isCopy) && moveFirst >= 0 && moveLast < 0) {
          var selectEnd = parseInt(this.dataset.listIndex);
          for (var i = moveFirst; i <= selectEnd; i++) {
            var temp = buttons[parseInt(i / width)][i % width];
            temp.style.opacity = '0.3';
            temp.classList.add('selected');
          }
          this.cleanSelection(selectEnd);
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
          if (moveFirst === -1) {   // start selection;
            moveFirst = parseInt(this.dataset.listIndex);
          }
          else if (moveLast === -1) {   // finish selection;
            moveLast = parseInt(this.dataset.listIndex);
            selection = buttons.slice(moveFirst, moveLast - moveFirst + 1);   // NEED to fix;
            this.cleanSelection(moveLast);
          }
          else {
            moveNew = parseInt(this.dataset.listIndex);
            for (var i = 0; i < selection.length; i++) {
              var total = moveFirst + i + moveNew;
              buttons[parseInt(total / width)][total % width].style.background = selection[i].style.background;
              if (isMove)
                selection[i].style.background = 'white';
            }
            moveFirst = moveLast = moveNew = -1;    // RESET all move variables!
            isMove = isCopy = false;
          }
        }
      });
    }
  }
  this.cleanSelection = function(end) {
    var total = width * height;
    for (var i = total - 1; i > end; i--) {
      var temp = buttons[parseInt(i / width)][i % width];
      if (temp.style.opacity === '0.3') {    // MUST check cuz not all may be selected;
        temp.style.opacity = '1.0';
        temp.classList.remove('selected');
      }
    }
  };

  // add buttons to a grid of div rows;
  grid.className = 'spacing';
  for (var i = 0; i < width; i++) {
    var temp = document.createElement('div');
    for (var j = 0; j < height; j++) {
      temp.appendChild(buttons[i][j]);
    }
    grid.appendChild(temp);
  }
  // add the swatch buttons to 2 div rows;
  var row1 = document.createElement('div');
  var row2 = document.createElement('div');
  for (var i = 0; i < swatch.length; i++) {
    if (i < swatch.length / 2)
      row1.appendChild(swatch[i]);
    else
      row2.appendChild(swatch[i]);
  }
  var info = document.createElement('div');   // DO NOT chain createTextNode, else info will be set to a TextNode;
  info.appendChild(document.createTextNode('Click to start drawing or selecting, then click again to stop.'));
  info.className = 'spacing info';
  topbar.className = 'spacing';
  topbar.appendChild(row1);
  topbar.appendChild(row2);
  topbar.appendChild(info);
  document.getElementById('pixelPainter').appendChild(topbar);
  document.getElementById('pixelPainter').appendChild(grid);
}

var painter = new PixelPainter(10, 10);
