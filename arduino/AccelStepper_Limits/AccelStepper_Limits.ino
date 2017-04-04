#include <AccelStepper.h>
#include <MultiStepper.h>

int feet = 1524;                    //define number of steps per 1' increase in bloom
AccelStepper stepper(1, 9, 13);   //configure AccelStepper library
int setEnablePin = 8;             //set the enable pin
int fullBloom =   7420;        //definie full bloom position
int bloomTarget = 0;        //set initial bloom target position
int topLimitPin = 2;             //set pin for top limit switch
int bottomLimitPin = 3;          //set pin for bottom limit switch
int bloomSpeed = feet;
int maxAcceleration = 1500;
int safetyLimit = -100;
int incomingByte = 0;           //for incoming serial data
int newTarget = 0;              //for incoming serial data
String inputString = "";
boolean inputComplete = false;
boolean sentLocationRequest = false;

void setup() {

  //Testing serial setup
  Serial.begin(115200);
  while(!Serial) {
    ;
  }
  delay(2000);
  // Send ready signal.
  Serial.println(2000);
  
  stepper.setMaxSpeed(maxAcceleration+2500);
  stepper.setAcceleration(maxAcceleration);
       

 // This will be the limit switch in the future
 stepper.setCurrentPosition(0);

/*
  attachInterrupt(digitalPinToInterrupt(topLimitPin), setTopLimit, CHANGE);      //interrupt & recalibrate when the top limit is hit
  attachInterrupt(digitalPinToInterrupt(bottomLimitPin), setBottomLimit, CHANGE);   //interrupt & recalibrate bottom limit is hit

  stepper.runToNewPosition(fullBloom*1.5);    //run the stepper out until you hit the limit
  delay(1000);
  stepper.runToNewPosition(0);    //return the stepper to fully retracted
  delay(1000);
*/
} 

void loop() {
//Run motor
stepper.run();

  //If we've reached our position, read the serial input.
  if(stepper.distanceToGo() == 0) {
    getSerialInput();
    
  }
}


void getSerialInput() {
  if(sentLocationRequest == false) {
    //Write to the pi to request serial
    Serial.println(4000);
    sentLocationRequest = true;
  }
  
  while(Serial.available() > 0) {
    char in = (char) Serial.read();
      if(in == '\n'){
        inputComplete = true;
        parseAndMoveToInputLocation(inputString);
      }
      else{
        inputString += in;
      }
  }
}


void parseAndMoveToInputLocation(String& input){

  //"4000 s 4000 a 0000"
  //Need to extract "position", "speed", or "acceleration" from the message.
  
   int newPosition = input.toFloat();
   if(input.indexOf('s') != -1) {
    String tempPos = input.substring((input.indexOf('s')+1));
    int newSpeed = tempPos.toFloat();
    stepper.setSpeed(newSpeed);
   }
   if(input.indexOf('a') != -1){
    String tempPos = input.substring((input.indexOf('a')+1));
    int newAccel = tempPos.toFloat();
    stepper.setAcceleration(newAccel);
  }

  stepper.moveTo(newPosition);
  Serial.println(2000);
  sentLocationRequest = false;

  //Clear state
  inputString = "";
  inputComplete = false;
}

/*
stepper.run()

if(stepper.distanceToGo() == 0) {
  while(Serial.available()>0)
  input = Serial.parseInt (or some new-line based parse)
  Stepper.moveTo(input)
  consider flushing the serial here serial.Flush()
}
*/


//
//void setTopLimit() {              //define recalibration function for top limit switch
//  stepper.stop();
//  stepper.setCurrentPosition(safetyLimit);
//}
//
//void setBottomLimit() {           //define recalibration function for bottom limit switch
//  stepper.stop();
//  stepper.setCurrentPosition(fullBloom+safetyLimit);
//}
