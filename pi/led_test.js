var ws281x = require('rpi-ws281x-native');

ws281x.init(12, 18);
pixelData = new Uint32Array(12);

// ---- trap the SIGINT and reset before exit
process.on('SIGINT', function () {
  ws281x.reset();
  process.nextTick(function () { process.exit(0); });
});


// ---- animation-loop

// ---- animation-loop
var offset = 0;
setInterval(function () {
  var i=12;
  while(i--) {
      pixelData[i] = 0;
  }
  pixelData[offset] = 0xffffff;

  offset = (offset + 1) % 12;
  console.log(pixelData);
  ws281x.render(pixelData);
}, 100);

console.log('Press <ctrl>+C to exit.');
