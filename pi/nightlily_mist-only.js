// Set up OSC
var osc = require('osc-min'),
    dgram = require('dgram'),
    remote;

/*  REMOVE UNNECESSARY COMPONENTS FOR MIST
// Set up lights
var ws281x = require('rpi-ws281x-native');

// Set up Serial
var SerialPort = require("serialport");

//GLOBAL VARS
//Light vars

var NUM_LEDS = 11;
ws281x.init(NUM_LEDS, 18);
var pixelData = new Uint32Array(NUM_LEDS);
for(var i = 0; i < NUM_LEDS; i++) {
    pixelData[i] = rgbToHex(0, 0, 0);
}

//Motor vars
var oscMsg = {};
var motorPositionValue = 0;
var motorSpeedValue = 0;
var motorAccelValue = 0;

//Arduino command state vars
var arduinoBooted = false;
var locationRequested = false;

//Projector Globals
var projectorsOn = false;
var onBuffer = new Buffer(10);
//Factory specified hex codes for on/off :: http://www.projectorcentral.com/pdf/projector_manual_9230.pdf
onBuffer[0] = 0x06; onBuffer[1] = 0x14; onBuffer[2] = 0x00; onBuffer[3] = 0x04; onBuffer[4] = 0x00; onBuffer[5] = 0x34; onBuffer[6] = 0x11; onBuffer[7] = 0x00; onBuffer[8] = 0x00; onBuffer[9] =0x5D;
var offBuffer = new Buffer(10);
  offBuffer[0] = 0x06; offBuffer[1] = 0x14; offBuffer[2] = 0x00; offBuffer[3] = 0x04; offBuffer[4] = 0x00; offBuffer[5] = 0x34; offBuffer[6] = 0x11; offBuffer[7] = 0x01; offBuffer[8] = 0x00; offBuffer[9] =0x5E;
*/

// Set up GPIO
var rpio = require("rpio");
var gpioPin = 29;
rpio.open(gpioPin, rpio.OUTPUT, rpio.LOW);


//Mist Globals
var mistOn = false;
var mistState = false;

//Startup Log
console.log('Running nightlily_mist-only...');


/*
//////////////////////////////////////////////////////
                  Motor Serial Port
//////////////////////////////////////////////////////
*/

/*
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
  //console.log('Motor-Arduino sent to Pi:' + data);
  var dataTemp = data
  if ( data == 2000) {
    console.log(getDateTime() + ' Pi received ready signal, Motor Arduino Ready');
    arduinoBooted = true;
  }else if (data == 4000 && arduinoBooted == true) {
    console.log(getDateTime() + ' Pi received request for location');
    locationRequested = true;
  }else if (data == 7000) {
    console.log(getDateTime() + ' Motor Arduino calibrating position');
  }else if (data == 7002) {
    console.log(getDateTime() + ' Motor Arduino calibration complete');
  }
  else if (data == 7100) {
    console.log(getDateTime() + ' Motor Arduino limit switch triggered');
  }
});

//Builds a string for position, as well as speed and acceleration if available.
function moveMotor() {
    var temp = "";
    temp = motorPositionValue;
    temp += ((motorSpeedValue != 0) ? "s" + motorSpeedValue : "");
    temp += ((motorAccelValue != 0) ? "a" + motorAccelValue : "");
    temp += " \n";
    //console.log('Sending to motor arduino ::: ' + temp);
    motorPort.write(temp, function(err, results) {
      if (err) {
          console.log('Error while sending message : ' + err);
      }
      if (results) {
          console.log('Response received after sending message : ' + result);
      }
    });
    //resets state of speed & acceleration, so that they aren't passed in again unless set by Vezer.
    motorSpeedValue = 0;
    motorAccelValue = 0;
}
*/

/*
//////////////////////////////////////////////////////
                    Light Control
//////////////////////////////////////////////////////
*/

/*
// Catches SIGINT (ctrl+c) and resets our ws281x LEDs before exit.
// Do we need this? And if so, do we need this for additional interrupts.
process.on('SIGINT', function () {
  ws281x.reset();
  process.nextTick(function () { process.exit(0); });
});

//Bit shifts RGB values to create byte-representation of Color.
//Line 37: https://github.com/beyondscreen/node-rpi-ws281x-native/blob/master/examples/rainbow.js
//function rgb2Int(r, g, b) {
//  return ((r & 0xff) << 16) + ((g & 0xff) << 8) + (b & 0xff);
//}

//Converts RGB values to hex.
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "0x" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
*/

/*
//////////////////////////////////////////////////////
                    Mist Control
//////////////////////////////////////////////////////
*/

//Checks the OSC value for Mist and sends a high/low GPIO accordingly.
function toggleMist() {
    if(mistOn == true){
      console.log(getDateTime() + " Turning on mist machine");
      mistState = true;
      rpio.write(gpioPin, rpio.HIGH);
      mistOn = false;
    }else if(mistOn == false){
      console.log(getDateTime() + " Turning off mist machine");
      rpio.write(gpioPin, rpio.LOW);
      mistState = false;  
      mistOn = true;
    }

}

/*
//////////////////////////////////////////////////////
                  Projector Serial Ports
//////////////////////////////////////////////////////
*/

/*
// Instantiate Serial Ports
var projectorPort1 = new SerialPort("/dev/ttyUSB0", {
  baudrate: 115200
});

projectorPort1.on("open", function () {
  console.log(getDateTime() + ' Projector 1 port open');
});

var projectorPort2 = new SerialPort("/dev/ttyUSB1", {
  baudrate: 115200
});

projectorPort2.on("open", function () {
  console.log(getDateTime() + ' Projector 2 port open');
});



//Print out data received from projectors. 
projectorPort1.on("data", function(data) {
  //console.log('Pi received projector 1 serial :: ');
  //console.log(data);
});

projectorPort2.on("data", function(data) {
  //console.log('Pi received projector 2 serial :: ');
  //console.log(data);
});

//Assigns the proper hex buffer to powerSignal and then writes to both projectors.
function toggleProjectorPower() {
    if(projectorsOn == true){
      console.log(getDateTime() + " Turning on projectors");
      var powerSignal = onBuffer;
      projectorsOn = false;
    }else if(projectorsOn == false){
      console.log(getDateTime() + " Turning off projectors");
      var powerSignal = offBuffer;     
      projectorsOn = true;
    }

    projectorPort1.write(powerSignal, function (err, results) {
            if (err) {
                console.log('Error while sending message : ' + err);
            }
            if (results) {
                console.log('Response received after sending message : ' + results);
            }
    });
    projectorPort2.write(powerSignal);
}
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
      /*
       /////////////////////////
      //      Motor Cases    //
     /////////////////////////
     // Continually updates the speed and acceleration whenever passed.
     // If position is passed, trigger a serial motor command only once, if arduino is ready.
      case '/bloom/position':
        motorPositionValue = msg.args[0].value;
        if (locationRequested == true) {
          moveMotor();
          locationRequested = false;
        }
        break;
      case '/bloom/speed':        
        motorSpeedValue = msg.args[0].value;
        break;
      case '/bloom/accel':
        motorAccelValue = msg.args[0].value;
        break;
       /////////////////////////
      //      Color Cases    //
     /////////////////////////
     //Update relevant pixelData indices. Log Value. Render.
      case '/light/petal/color/all':
       // pixelData.prototype.fill(rgb2Int(msg.args[0].value, msg.args[1].value, msg.args[2].value), 0, 8);
        var tempHexColor = rgbToHex(msg.args[0].value, msg.args[1].value, msg.args[2].value);
        for(var i = 0; i < 8; i++) {
          pixelData[i] = tempHexColor;
        }
        console.log("The all-petal-color from vezer is :: " + pixelData[0] + ". In RGB :: " + msg.args[0].value + ", " + msg.args[1].value + ", " + msg.args[2].value );
        ws281x.render(pixelData);
        break;
      case '/light/petal/color/1':
        pixelData[0] = rgbToHex(msg.args[0].value, msg.args[1].value, msg.args[2].value);
        console.log("The petal-1-color from vezer is :: " + pixelData[0] + ". In RGB :: " + msg.args[0].value + ", " + msg.args[1].value + ", " + msg.args[2].value );
        console.log(pixelData);
        ws281x.render(pixelData);
        break;
      //TEST ON THIS ONE HERE.
      case '/light/petal/color/2':
        pixelData[1] = rgbToHex(msg.args[0].value, msg.args[1].value, msg.args[2].value);
        console.log("The petal-2-color from vezer is :: " + pixelData[1] + ". In RGB :: " + msg.args[0].value + ", " + msg.args[1].value + ", " + msg.args[2].value );
        console.log(pixelData);
        ws281x.render(pixelData);
        break;
      case '/light/petal/color/3':
        pixelData[2] = rgbToHex(msg.args[0].value, msg.args[1].value, msg.args[2].value);
        console.log("The petal-3-color from vezer is :: " + pixelData[2] + ". In RGB :: " + msg.args[0].value + ", " + msg.args[1].value + ", " + msg.args[2].value );
        ws281x.render(pixelData);
        break;
      case '/light/petal/color/4':
        pixelData[3] = rgbToHex(msg.args[0].value, msg.args[1].value, msg.args[2].value);
        console.log("The petal-4-color from vezer is :: " + pixelData[3] + ". In RGB :: " + msg.args[0].value + ", " + msg.args[1].value + ", " + msg.args[2].value );
        ws281x.render(pixelData);
        break;
      case '/light/petal/color/5':
        pixelData[4] = rgbToHex(msg.args[0].value, msg.args[1].value, msg.args[2].value);
        console.log("The petal-5-color from vezer is :: " + pixelData[4] + ". In RGB :: " + msg.args[0].value + ", " + msg.args[1].value + ", " + msg.args[2].value );
        ws281x.render(pixelData);
        break;
      case '/light/petal/color/6':
        pixelData[5] = rgbToHex(msg.args[0].value, msg.args[1].value, msg.args[2].value);
        console.log("The petal-6-color from vezer is :: " + pixelData[5] + ". In RGB :: " + msg.args[0].value + ", " + msg.args[1].value + ", " + msg.args[2].value );
        ws281x.render(pixelData);
        break;
      case '/light/petal/color/7':
        pixelData[6] = rgbToHex(msg.args[0].value, msg.args[1].value, msg.args[2].value);
        console.log("The petal-7-color from vezer is :: " + pixelData[6] + ". In RGB :: " + msg.args[0].value + ", " + msg.args[1].value + ", " + msg.args[2].value );
        ws281x.render(pixelData);
        break;
      case '/light/petal/color/8':
        pixelData[7] = rgbToHex(msg.args[0].value, msg.args[1].value, msg.args[2].value);
        console.log("The petal-8-color from vezer is :: " + pixelData[7] + ". In RGB :: " + msg.args[0].value + ", " + msg.args[1].value + ", " + msg.args[2].value );
        ws281x.render(pixelData);
        break;
      case '/light/pistil/color/all':
        //pixelData.prototype.fill(rgb2Int(msg.args[0].value, msg.args[1].value, msg.args[2].value), 8, 11);
        var tempHexColor = rgbToHex(msg.args[0].value, msg.args[1].value, msg.args[2].value);
        for(var i = 8; i < 11; i++) {
          pixelData[i] = tempHexColor;
        }
        console.log("The all-pistil-color from vezer is :: " + pixelData[0] + ". In RGB :: " + msg.args[0].value + ", " + msg.args[1].value + ", " + msg.args[2].value );
        ws281x.render(pixelData);
        break;
      case '/light/pistil/color/1':
        pixelData[8] = rgbToHex(msg.args[0].value, msg.args[1].value, msg.args[2].value);
        console.log("The pistil-1-color from vezer is :: " + pixelData[8] + ". In RGB :: " + msg.args[0].value + ", " + msg.args[1].value + ", " + msg.args[2].value );
        ws281x.render(pixelData);
        break;
      case '/light/pistil/color/2':
        pixelData[9] = rgbToHex(msg.args[0].value, msg.args[1].value, msg.args[2].value);
        console.log("The pistil-2-color from vezer is :: " + pixelData[9] + ". In RGB :: " + msg.args[0].value + ", " + msg.args[1].value + ", " + msg.args[2].value );
        ws281x.render(pixelData);
        break;
      case '/light/pistil/color/3':
        pixelData[10] = rgbToHex(msg.args[0].value, msg.args[1].value, msg.args[2].value);
        console.log("The pistil-3-color from vezer is :: " + pixelData[10] + ". In RGB :: " + msg.args[0].value + ", " + msg.args[1].value + ", " + msg.args[2].value );
        ws281x.render(pixelData);
        break;
      case '/light/flower/color/all':
       // pixelData.prototype.fill(rgb2Int(msg.args[0].value, msg.args[1].value, msg.args[2].value));
        var tempHexColor = rgbToHex(msg.args[0].value, msg.args[1].value, msg.args[2].value);
        for(var i = 0; i < NUM_LEDS; i++) {
          pixelData[i] = tempHexColor;
        }
        console.log("The all-flower-color from vezer is :: " + pixelData[0] + ". In RGB :: " + msg.args[0].value + ", " + msg.args[1].value + ", " + msg.args[2].value );
        ws281x.render(pixelData);
        break;
       /////////////////////////
      //   Projector Case    //
     /////////////////////////
      case '/projector/power':
        projectorsOn = msg.args[0].value;
        toggleProjectorPower();
        break;

        */
       /////////////////////////
      //       Mist Case     //
     /////////////////////////
      case '/mist/power':
        mistOn = msg.args[0].value;
        console.log(getDateTime() + " Misting value from OSC:: " + mistOn);
        toggleMist();
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
    console.log(err);
  }
});

udp.bind(9998);
console.log('Listening for OSC messages on port 9998');


// UTIL FUNCTIONS

function getDateTime() {

    let date_ob = new Date();
    
    var date = ("0" + date_ob.getDate()).slice(-2);

    // current month
    var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

    // current year
    var year = date_ob.getFullYear();

    // current hours
    var hour = date_ob.getHours();

    // current minutes
    var min = date_ob.getMinutes();

    // current seconds
    var sec = date_ob.getSeconds();

    return year + ":" + month + ":" + date + " | " + hour + ":" + min + ":" + sec;

}