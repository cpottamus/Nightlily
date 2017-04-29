//var ws281x = require('../lib/ws281x-native');

var NUM_LEDS = 11;
var pixelData = new Uint32Array(NUM_LEDS);

//ws281x.init(NUM_LEDS);

// // ---- trap the SIGINT and reset before exit
// process.on('SIGINT', function () {
//   ws281x.reset();
//   process.nextTick(function () { process.exit(0); });
// });

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "0x" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    //console.log(componentToHex(r) + componentToHex(g) + componentToHex(b));
}


for(var i = 0; i < NUM_LEDS; i++) {
    pixelData[i] = rgbToHex(255, 255, 255);
}

function rgb2Int(r, g, b) {
  return ((r & 0xff) << 16) + ((g & 0xff) << 8) + (b & 0xff);
}
console.log("Hex Call");
console.log(pixelData);
//ws281x.render(pixelData);

for(var i = 0; i < NUM_LEDS; i++) {
    pixelData[i] = rgb2Int(255, 255, 255);
}
console.log("int Call");
console.log(pixelData);

// ---- animation-loop
//var t0 = Date.now();
//setInterval(function () {
//    var dt = Date.now() - t0;

    //ws281x.setBrightness(
      //  Math.floor(Math.sin(dt/1000) * 128 + 128));
//}, 1000 / 30);

console.log('Press <ctrl>+C to exit.');