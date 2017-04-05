#include <AccelStepper.h>
#include <MultiStepper.h>

AccelStepper stepper(1, 9, 13); //configure AccelStepper library
int setEnablePin = 8;           //set the enable pin
int topLimitPin = 2;            //set pin for top limit switch
int bottomLimitPin = 3;         //set pin for bottom limit switch

int feet = 1524;                //define number of steps per 1' increase in bloom
int fullBloom =   7420;         //define full bloom position
int bloomTarget = 0;            //set initial bloom target position
int maxAcceleration = 1500;
int maximumSpeed = 4000;
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
  
  stepper.setMaxSpeed(maximumSpeed);
  stepper.setAcceleration(maxAcceleration);
       

 // This will be the limit switch in the future (calibrate by running until it hits)
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
  
  //Read in incoming serial, until you hit newline parse.
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

   //Message is of format "4000s4000a0000"

   //Truncates on first non-numeric, gets position, sets target.
   int newPosition = input.toFloat();
   stepper.moveTo(newPosition);
   
   //If speed included, substrings after s and truncates again.
   if(input.indexOf('s') != -1) {
    String tempPos = input.substring((input.indexOf('s')+1));
    int newSpeed = tempPos.toFloat();
    stepper.setSpeed(newSpeed);
   }
   //If accel included, substrings after a and truncates again.
   if(input.indexOf('a') != -1){
    String tempPos = input.substring((input.indexOf('a')+1));
    int newAccel = tempPos.toFloat();
    stepper.setAcceleration(newAccel);
  }

  //Don't think i need to print out a ready signal again.
  //Serial.println(2000);

  //Enable arduino to request another location once it reaches this one.
  sentLocationRequest = false;

  //Clear state
  inputString = "";
  inputComplete = false;
}


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
