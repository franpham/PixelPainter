
function PixelPainter(width, height) {
  var defColors = ['white', 'silver', 'gray', 'black', 'red', 'maroon', 'yellow', 'olive', 'lime', 'green', 'aqua', 'teal', 'blue', 'navy', 'fuchsia', 'purple'];
  var buttons = new Array(width);
  var swatch = new Array(16);
  var erase = document.createElement('button');
  var clear = document.createElement('button');
  var selColor = 'white';

  // make the swatch buttons
  for (var i = 0; i < swatch.length; i++) {
    swatch[i] = document.createElement('button');
    swatch[i].style.background = defColors[i];
    swatch[i].addEventListener('click', function() {
      selColor = this.style.background;
    });
  }

  // set properties and add listeners for erase & clear buttons
  erase.className = 'button';
  clear.className = 'button';
  erase.setAttribute('value', 'Erase');
  clear.setAttribute('value', 'Clear');
  erase.addEventListener('click', function() {
    selColor = 'white';
  });
  clear.addEventListener('click', function() {
    for (var i = 0; i < width; i++) {
      for (var j = 0; j < height; j++) {
        buttons[i][j].style.background = 'white';
      }
    }
  });

  // make the grid buttons & register event listeners;
  for (var i = 0; i < width; i++) {
    buttons[i] = new Array(height);     // make each column;

    for (var j = 0; j < height; j++) {
      buttons[i][j] = document.createElement('button');
      buttons[i][j].className = 'button';
      buttons[i][j].addEventListener('click', function() {
        this.style.background = selColor;
      });
    }
  }

  // add buttons to a div grid;
  var grid = document.createElement('div');
  for (var i = 0; i < width; i++) {
    grid[i] = document.createElement('div');   // make each row

    for (var j = 0; j < height; j++) {
      grid[i].appendChild(buttons[i][j]);
    }
  }
  document.getElementById('PixelPainter').appendChild(grid);

  // make the swatch buttons to a div grid;
  var topbar = document.createElement('div');   // [ ] = 1 column
  var row1 = document.createElement('div');     // [ [...] ]
  var row2 = document.createElement('div');     // [ [...] [...] ] has 2 rows
  for (var i = 0; i < swatch.length; i++) {
    if (i < swatch.length)
      row1.appendChild(swatch[i]);
    else
      row2.appendChild(swatch[i]);
  }
  topbar.appendChild(row1);
  topbar.appendChild(row2);
  document.getElementById('topbar').appendChild(topbar);
}