//var ws281x = require('../index.js');

var NUM_LEDS = 11;
var pixelData = new Uint32Array(NUM_LEDS);

// ws281x.init(NUM_LEDS);

// // ---- trap the SIGINT and reset before exit
// process.on('SIGINT', function () {
//   ws281x.reset();
//   process.nextTick(function () { process.exit(0); });
// });

// ---- animation-loop
var offset = 0;
setInterval(function () {
  var i=NUM_LEDS;
  while(i--) {
      pixelData[i] = 0;
  }
  var p = ffffff
  pixelData[offset] = 0xffffff;

  offset = (offset + 1) % NUM_LEDS;
  //ws281x.render(pixelData);
  console.log(pixelData);
}, 100);
