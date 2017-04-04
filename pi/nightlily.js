// Set up OSC
var osc = require('osc-min'),
    dgram = require('dgram'),
    remote;

//instantiate msg object & parameters
var oscMsg = {};
var motorPositionValue = 0;
var oldMotorPositionValue = 0;
var motorPositionDifference = 400;
var temp = "";

// Set up serial for motor.
var SerialPort = require("serialport");
var motorPort = new SerialPort("/dev/ttyACM0", {
  baudrate: 115200,
  parser: SerialPort.parsers.readline('\n')

});

//Arduino "ready" state
var readySignal = false;
var requestingLocation = false;
var sendingLocation = false;

motorPort.on("open", function () {
  console.log('Motor port open');
});

//Print out data received from motor-arduino. Check if a signal received is '2', and enable writing to Arduino when it is.
motorPort.on("data", function(data) {
  console.log('Motor-Arduino sent to Pi:' + data);
  var dataTemp = data
  if ( data == 2000) {
    console.log('Pi received ready signal, Motor Arduino Ready');
    readySignal = true;
  }else if (data == 4000 && readySignal == true) {
    console.log('Pi received request for location');
    sendingLocation = true;
  }
});

function moveMotor() {
  //bottleneck commands, only send when step difference is exceeded. 
    temp = motorPositionValue + "       \n";
    console.log('Sending to motor arduino ::: ' + temp);
    motorPort.write(temp, function(err, results) {
      console.log('err ' + err);
      console.log('results ' + results);
    });
    oldMotorPositionValue = motorPositionValue;
}

// listen for OSC messages and print them to the console
var udp = dgram.createSocket('udp4', function(msg, rinfo) {

  // save the remote address
  remote = rinfo.address;

  try {
    //console.log(osc.fromBuffer(msg));

    oscMsg = osc.fromBuffer(msg);

    //Interpret Message

    if (oscMsg.address == '/bloom/position') {
      motorPositionValue = oscMsg.args[0].value;
      console.log("The motorPositionValue from vezer is :: " + motorPositionValue);
      if (sendingLocation == true) {
        moveMotor();
        sendingLocation = false;
      }
    }

  } catch (err) {
    console.log('Could not decode OSC message');
  }

});

// setinterval callback
// function send() {

//   // we don't have the remote address yet
//   if(! remote)
//     return;

//   // build message with a few different OSC args
//   var many = osc.toBuffer({
//     oscType: 'message',
//     address: '/print/many',
//     args: [{
//       type: 'string',
//       value: 'testing'
//     },
//     {
//       type: 'float',
//       value: 3.14
//     },
//     {
//       type: 'integer',
//       value: 200
//     }]
//   });

//   // build x message with single arg
//   var x = osc.toBuffer({
//     oscType: 'message',
//     address: '/print/x',
//     args: [{
//       type: 'integer',
//       value: 50
//     }]
//   });

//   // build y message with single arg
//   var y = osc.toBuffer({
//     oscType: 'message',
//     address: '/print/y',
//     args: [{
//       type: 'integer',
//       value: 20
//     }]
//   });

//   // send a bunch of args to the address that sent the last message to us
//   //udp.send(many, 0, many.length, 9999, remote);

//   // send x and y messages
//   //udp.send(x, 0, x.length, 9999, remote);
//   udp.send(y, 0, y.length, 9999, remote);

//   console.log('Sent OSC message to %s:%d', remote, 9999);

// }

// send message every second
//setInterval(send, 1000);

udp.bind(9998);
console.log('Listening for OSC messages on port 9998');