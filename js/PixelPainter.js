
function PixelPainter(width, height) {
  var defColors = ['white', 'silver', 'gray', 'black', 'red', 'maroon', 'yellow', 'olive', 'lime', 'green', 'aqua', 'teal', 'blue', 'navy', 'fuchsia', 'purple'];
  grid = document.createElement('div');
  topbar = document.createElement('div');

  var buttons = new Array(width);
  var swatch = new Array(16);
  var erase = document.createElement('button');
  var clear = document.createElement('button');
  var selColor = 'white';

  // make the swatch buttons
  for (var i = 0; i < swatch.length; i++) {
    swatch[i] = document.createElement('button');
    swatch[i].className = 'button';
    swatch[i].style.background = defColors[i];
    swatch[i].addEventListener('click', function() {
      selColor = this.style.background;
    });
  }

  // set properties and add listeners for erase & clear buttons
  erase.className = 'swatchButton';
  clear.className = 'swatchButton';
  erase.appendChild(document.createTextNode('Erase'));
  clear.appendChild(document.createTextNode('Clear'));
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
  topbar.appendChild(erase);
  topbar.appendChild(clear);

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
  for (var i = 0; i < width; i++) {
    var temp = document.createElement('div');   // make each row

    for (var j = 0; j < height; j++) {
      temp.appendChild(buttons[i][j]);
    }
    grid.appendChild(temp);
  }
  grid.className = 'spacing';

  // add the swatch buttons to a div grid;
  var row1 = document.createElement('div');
  var row2 = document.createElement('div');     // [ [...] [...] ] = 1 column of 2 rows
  row1.className = 'spacing';
  row2.className = 'spacing';
  for (var i = 0; i < swatch.length; i++) {
    if (i < swatch.length / 2)
      row1.appendChild(swatch[i]);
    else
      row2.appendChild(swatch[i]);
  }
  topbar.appendChild(row1);
  topbar.appendChild(row2);
  var hr = document.createElement('hr');
  hr.className = 'spacing';
  topbar.appendChild(hr);
  document.getElementById('pixelPainter').appendChild(grid);
  document.getElementById('topbar').appendChild(topbar);
}

var painter = new PixelPainter(8, 8);
