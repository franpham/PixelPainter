
function PixelPainter(width, height) {
  var defColors = ['white', 'silver', 'gray', 'black', 'red', 'maroon', 'yellow', 'olive', 'lime', 'green', 'aqua', 'teal', 'blue', 'navy', 'fuchsia', 'purple'];
  var grid = document.createElement('div');
  var topbar = document.createElement('div');

  var buttons = new Array(width);
  var swatch = new Array(16);
  var erase = document.createElement('button');
  var clear = document.createElement('button');
  var selected = 'white';
  var isPainting = isErasing = false;
  var lastButton = thisButton = null;

  // make the swatch buttons and register event listeners;
  for (var i = 0; i < swatch.length; i++) {
    swatch[i] = document.createElement('button');
    swatch[i].className = 'button';
    swatch[i].style.background = defColors[i];
    swatch[i].addEventListener('click', function() {
      selected = this.style.background;
    });
  }

  // set properties and add listeners for erase & clear buttons
  erase.className = 'swatchButton';
  clear.className = 'swatchButton';
  erase.appendChild(document.createTextNode('Erase'));
  clear.appendChild(document.createTextNode('Clear'));
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
  topbar.appendChild(erase);
  topbar.appendChild(clear);

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
