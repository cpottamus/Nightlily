// Set up OSC
var osc = require('osc-min'),
    dgram = require('dgram'),
    remote;

// Set up lights
var ws281x = require('rpi-ws281x-native');

// Set up Serial
var SerialPort = require("serialport");

//GLOBAL VARS
//Light vars
var NUM_LEDS = 11;
ws281x.init(NUM_LEDS, 18);
var pixelData = new Uint32Array(NUM_LEDS);

//Motor vars
var oscMsg = {};
var motorPositionValue = 0;
var motorSpeedValue = 0;
var motorAccelValue = 0;
var temp = "";

//Arduino command state vars
var arduinoBooted = false;
var readyForLocation = false;

/*
//////////////////////////////////////////////////////
                  Serial & Motor
//////////////////////////////////////////////////////
*/


// Instantiate Serial Port
var motorPort = new SerialPort("/dev/ttyACM0", {
  baudrate: 115200,
  parser: SerialPort.parsers.readline('\n')

});

motorPort.on("open", function () {
  console.log('Motor port open');
});

//Print out data received from motor-arduino. 
//Check if a signal received is '2000', enable writing when true.
//If 4000, send over most recent Vezer command.
motorPort.on("data", function(data) {
  console.log('Motor-Arduino sent to Pi:' + data);
  var dataTemp = data
  if ( data == 2000) {
    console.log('Pi received ready signal, Motor Arduino Ready');
    arduinoBooted = true;
  }else if (data == 4000 && arduinoBooted == true) {
    console.log('Pi received request for location');
    readyForLocation = true;
  }
});

//Builds a string for position, as well as speed and acceleration if available.
function moveMotor() {
    temp = motorPositionValue;
    temp += ((motorSpeedValue != 0) ? "s" + motorSpeedValue : "");
    temp += ((motorAccelValue != 0) ? "a" + motorAccelValue : "";
    temp += " \n";
    console.log('Sending to motor arduino ::: ' + temp);
    motorPort.write(temp, function(err, results) {
      console.log('err ' + err);
      console.log('results ' + results);
    });
    //resets state of speed & acceleration, so that they aren't passed in again unless set by Vezer.
    motorSpeedValue = 0;
    motorAccelValue = 0;
}

/*
//////////////////////////////////////////////////////
                    Light Control
//////////////////////////////////////////////////////
*/

//DO WE NEED THIS???
// ---- trap the SIGINT and reset before exit
process.on('SIGINT', function () {
  ws281x.reset();
  process.nextTick(function () { process.exit(0); });
}

//Bit shifts RGB values to create byte-representation of Color.
function rgb2Int(r, g, b) {
  return ((r & 0xff) << 16) + ((g & 0xff) << 8) + (b & 0xff);
}

/*
//////////////////////////////////////////////////////
                    Mist Control
//////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////
                  Projector Control
//////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////
                    OSC Messaging
//////////////////////////////////////////////////////
*/

//Takes in OSC input and triggers appropriate action.
function handleOSCMessage(msg) {
    //Interpret Message
    switch (msg.address) {
       /////////////////////////
      //      Motor Cases    //
     /////////////////////////
     // Continually updates the speed and acceleration whenever passed.
     // If position is passed, trigger a serial motor command only once, if arduino is ready.
      case '/bloom/position':
        motorPositionValue = msg.args[0].value;
        console.log("The motorPositionValue from vezer is :: " + motorPositionValue);
        if (readyForLocation == true) {
          moveMotor();
          readyForLocation = false;
        }
        break;
      case '/bloom/speed':        
        motorSpeedValue = msg.args[0].value;
        console.log("The motorSpeedValue from vezer is :: " + motorSpeedValue);
        break;
      case '/bloom/accel':
        motorAccelValue = msg.args[0].value;
        console.log("The motorAccelValue from vezer is :: " + motorAccelValue);
        break;
       /////////////////////////
      //      Color Cases    //
     /////////////////////////
     //Update relevant pixelData indices. Log Value. Render.
      case '/light/petal/color/all':
        pixelData.fill(rgb2int(msg.args[0].value, msg.args[1].value, msg.args[2].value), 0, 8);
        console.log("The all-petal-color from vezer is :: " + pixelData[0] + ". In RGB :: " + msg.args[0].value + ", " + msg.args[1].value + ", " + msg.args[2].value );
        ws281x.render(pixelData);
        break;
      case '/light/petal/color/1':
        pixelData[0] = rgb2int(msg.args[0].value, msg.args[1].value, msg.args[2].value);
        console.log("The petal-1-color from vezer is :: " + pixelData[0] + ". In RGB :: " + msg.args[0].value + ", " + msg.args[1].value + ", " + msg.args[2].value );
        ws281x.render(pixelData);
        break;
      case '/light/petal/color/2':
        pixelData[1] = rgb2int(msg.args[0].value, msg.args[1].value, msg.args[2].value);
        console.log("The petal-2-color from vezer is :: " + pixelData[1] + ". In RGB :: " + msg.args[0].value + ", " + msg.args[1].value + ", " + msg.args[2].value );
        ws281x.render(pixelData);
        break;
      case '/light/petal/color/3':
        pixelData[2] = rgb2int(msg.args[0].value, msg.args[1].value, msg.args[2].value);
        console.log("The petal-3-color from vezer is :: " + pixelData[2] + ". In RGB :: " + msg.args[0].value + ", " + msg.args[1].value + ", " + msg.args[2].value );
        ws281x.render(pixelData);
        break;
      case '/light/petal/color/4':
        pixelData[3] = rgb2int(msg.args[0].value, msg.args[1].value, msg.args[2].value);
        console.log("The petal-4-color from vezer is :: " + pixelData[3] + ". In RGB :: " + msg.args[0].value + ", " + msg.args[1].value + ", " + msg.args[2].value );
        ws281x.render(pixelData);
        break;
      case '/light/petal/color/5':
        pixelData[4] = rgb2int(msg.args[0].value, msg.args[1].value, msg.args[2].value);
        console.log("The petal-5-color from vezer is :: " + pixelData[4] + ". In RGB :: " + msg.args[0].value + ", " + msg.args[1].value + ", " + msg.args[2].value );
        ws281x.render(pixelData);
        break;
      case '/light/petal/color/6':
        pixelData[5] = rgb2int(msg.args[0].value, msg.args[1].value, msg.args[2].value);
        console.log("The petal-6-color from vezer is :: " + pixelData[5] + ". In RGB :: " + msg.args[0].value + ", " + msg.args[1].value + ", " + msg.args[2].value );
        ws281x.render(pixelData);
        break;
      case '/light/petal/color/7':
        pixelData[6] = rgb2int(msg.args[0].value, msg.args[1].value, msg.args[2].value);
        console.log("The petal-7-color from vezer is :: " + pixelData[6] + ". In RGB :: " + msg.args[0].value + ", " + msg.args[1].value + ", " + msg.args[2].value );
        ws281x.render(pixelData);
        break;
      case '/light/petal/color/8':
        pixelData[7] = rgb2int(msg.args[0].value, msg.args[1].value, msg.args[2].value);
        console.log("The petal-8-color from vezer is :: " + pixelData[7] + ". In RGB :: " + msg.args[0].value + ", " + msg.args[1].value + ", " + msg.args[2].value );
        ws281x.render(pixelData);
        break;
      case '/light/pistil/color/all':
        pixelData.fill(rgb2int(msg.args[0].value, msg.args[1].value, msg.args[2].value), 8, 11);
        console.log("The all-pistil-color from vezer is :: " + pixelData[0] + ". In RGB :: " + msg.args[0].value + ", " + msg.args[1].value + ", " + msg.args[2].value );
        ws281x.render(pixelData);
        break;
      case '/light/pistil/color/1':
        pixelData[8] = rgb2int(msg.args[0].value, msg.args[1].value, msg.args[2].value);
        console.log("The pistil-1-color from vezer is :: " + pixelData[8] + ". In RGB :: " + msg.args[0].value + ", " + msg.args[1].value + ", " + msg.args[2].value );
        ws281x.render(pixelData);
        break;
      case '/light/pistil/color/2':
        pixelData[9] = rgb2int(msg.args[0].value, msg.args[1].value, msg.args[2].value);
        console.log("The pistil-2-color from vezer is :: " + pixelData[9] + ". In RGB :: " + msg.args[0].value + ", " + msg.args[1].value + ", " + msg.args[2].value );
        ws281x.render(pixelData);
        break;
      case '/light/pistil/color/3':
        pixelData[10] = rgb2int(msg.args[0].value, msg.args[1].value, msg.args[2].value);
        console.log("The pistil-3-color from vezer is :: " + pixelData[10] + ". In RGB :: " + msg.args[0].value + ", " + msg.args[1].value + ", " + msg.args[2].value );
        ws281x.render(pixelData);
        break;
      case '/light/flower/color/all':
        pixelData.fill(rgb2int(msg.args[0].value, msg.args[1].value, msg.args[2].value));
        console.log("The all-flower-color from vezer is :: " + pixelData[0] + ". In RGB :: " + msg.args[0].value + ", " + msg.args[1].value + ", " + msg.args[2].value );
        ws281x.render(pixelData);
        break;
    }
}


// listen for OSC messages
var udp = dgram.createSocket('udp4', function(msg, rinfo) {
  // save the remote address
  remote = rinfo.address;
  try {
    oscMsg = osc.fromBuffer(msg);
    handleOSCMessage(oscMsg);
  } catch (err) {
    console.log('Could not decode OSC message');
  }
});

udp.bind(9998);
console.log('Listening for OSC messages on port 9998');