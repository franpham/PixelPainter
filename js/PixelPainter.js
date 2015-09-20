
function PixelPainter(width, height) {
  var defColors = ['white', 'silver', 'gray', 'black', 'red', 'maroon', 'yellow', 'olive', 'lime', 'green', 'aqua', 'teal', 'blue', 'navy', 'fuchsia', 'purple'];
  var grid = document.createElement('div');
  var topbar = document.createElement('div');

  var buttons = new Array(width);
  var swatch = new Array(16);
  var erase = document.createElement('button');
  var clear = document.createElement('button');
  var moved = document.createElement('button');
  var lastButton = thisButton = null;
  var isPainting = isErasing = isMoving = false;
  var moveFirst = moveLast = moveNew = -1;
  var selected = 'white';
  var moving = [];

  // make the swatch buttons and register event listeners;
  for (var i = 0; i < swatch.length; i++) {
    swatch[i] = document.createElement('button');
    swatch[i].className = 'button';
    swatch[i].style.background = defColors[i];
    swatch[i].addEventListener('click', function() {
      selected = this.style.background;
    });
  }

  // set properties and add listeners for controls buttons
  erase.className = 'swatchButton';
  clear.className = 'swatchButton';
  moved.className = 'swatchButton';
  erase.appendChild(document.createTextNode('Erase'));
  clear.appendChild(document.createTextNode('Clear'));
  moved.appendChild(document.createTextNode('Select & Move'));
  moved.addEventListener('click', function() {
    isMoving = true;
  });
  erase.addEventListener('click', function() {
    selected = 'white';
  });
  clear.addEventListener('click', function() {
    for (var i = 0; i < width; i++) {
      for (var j = 0; j < height; j++) {
        buttons[i][j].style.background = 'white';
      }
    }
  });
  topbar.appendChild(clear);
  topbar.appendChild(erase);
  topbar.appendChild(moved);

  // make the grid buttons and register event listeners;
  for (var i = 0; i < width; i++) {
    buttons[i] = new Array(height);     // make each column;
    for (var j = 0; j < height; j++) {
      buttons[i][j] = document.createElement('button');
      buttons[i][j].className = 'button';
      // buttons[i][j].name = 'button' + i + '/' + j;   // FOR DEBUGGING;

      buttons[i][j].addEventListener('click', function() {
        isPainting = !isPainting;
        if (isPainting)
          this.style.background = selected;
      });
      buttons[i][j].dataset.lastColor = 'white';
      buttons[i][j].addEventListener('mouseover', function() {
        // IMPLEMENTATION NOTE: erasing does not start until cursor moves back to the previous button!
        if (isPainting) {
          if (this.style.background === selected && (lastButton === this || isErasing)) {
            lastButton.style.background = this.style.background = 'white';
            isErasing = true;
          }
          else {
            this.style.background = this.dataset.lastColor = selected;
            isErasing = false;
          }
          lastButton = thisButton;    // must set AFTER checking condition above!
          thisButton = this;
        }
      });
      buttons[i][j].dataset.listIndex = (i * j) + i;
      buttons[i][j].addEventListener('click', function() {
        if (!isMoving)    // DO NOT combine conditions: must check moveFirst, moveLast, moveNew in sequence!
          return;
        else if (moveFirst === -1) {  // start move selection;
          moveFirst = this.dataset.listIndex;
        }
        else if (moveLast === -1) {    // finish move selection;
          moveLast = this.dataset.listIndex;
          moving = buttons.slice(moveFirst, moveLast - moveFirst + 1);
        }
        else if (moveNew === -1) {
          moveNew = this.dataset.listIndex;
        }
        else if (moveNew > -1) {
          for (var i = 0; i < moving.length; i++) {
            buttons[moveFirst + i + moveNew].style.background = moving[i].style.background;
            moving[i].style.background = 'white';
            moveFirst = moveLast = moveNew = -1;    // RESET all move variables after moving!
            isMoving = false;
          }
        }
      });
    }
  }

  // add buttons to a grid of div rows;
  for (var i = 0; i < width; i++) {
    var temp = document.createElement('div');

    for (var j = 0; j < height; j++) {
      temp.appendChild(buttons[i][j]);
    }
    grid.appendChild(temp);
  }
  grid.className = 'spacing';

  // add the swatch buttons to a div grid;
  var row1 = document.createElement('div');
  var row2 = document.createElement('div');
  row1.className = 'spacing';
  row2.className = 'spacing';
  for (var i = 0; i < swatch.length; i++) {
    if (i < swatch.length / 2)
      row1.appendChild(swatch[i]);
    else
      row2.appendChild(swatch[i]);
  }
  var hr = document.createElement('hr');
  hr.className = 'spacing';
  topbar.appendChild(row1);
  topbar.appendChild(row2);
  topbar.appendChild(hr);
  document.getElementById('pixelPainter').appendChild(topbar);
  document.getElementById('pixelPainter').appendChild(grid);
}

var painter = new PixelPainter(8, 8);
