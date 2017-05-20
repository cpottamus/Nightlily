#include <AccelStepper.h>
#include <MultiStepper.h>

AccelStepper stepper(1, 9, 13); //configure AccelStepper library
int setEnablePin = 8;           //set the enable pin
int topLimitPin = 2;            //set pin for top limit switch
int bottomLimitPin = 3;         //set pin for bottom limit switch

int feet = 1524;                //define number of steps per 1' increase in bloom
int fullBloom =   7420;         //define full bloom position
int limitSwitchSafetyInterval = 200;
int bloomTarget = 0;            //set initial bloom target position
int maxAcceleration = 1500;
int maximumSpeed = 4000;
int limitSwitchPin = 4;
String inputString = "";
boolean inputComplete = false;
boolean sentLocationRequest = false;

void setup() {

  //Set our limit switch
  pinMode(limitSwitchPin, INPUT_PULLUP);

  //Testing serial setup
  Serial.begin(115200);
  while(!Serial) {
    ;
  }
  delay(2000);
  // Send ready signal.
  Serial.println(2000);     

 // Calibrate by hitting limit switch. 
 calibratePosition();
 
 stepper.setMaxSpeed(maximumSpeed);
 stepper.setAcceleration(maxAcceleration);
 //stepper.setCurrentPosition(0);
} 

void loop() {

//If the switch is triggered at any point in the loop, establish current position as bloom + safety interval, and move back to bloom.
if( digitalRead(limitSwitchPin) == LOW ) {
  stepper.setCurrentPosition(fullBloom + limitSwitchSafetyInterval);
  stepper.runToPosition(fullBloom);
} else {
 
  //Run motor
  stepper.run();

  //If we've reached our position, read the serial input.
  if(stepper.distanceToGo() == 0) {
    getSerialInput();
  } 
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
   if (newPosition > fullBloom) { newPosition = fullBloom; }
   if (newPosition < 0) { newPosition = 0; }
   stepper.moveTo(newPosition);
   
   //If speed included, substrings after s and truncates again.
   if(input.indexOf('s') != -1) {
    String tempPos = input.substring((input.indexOf('s')+1));
    int newSpeed = tempPos.toFloat();
    stepper.setMaxSpeed(newSpeed);
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

void calibratePosition() {
  stepper.setMaxSpeed(500);
  stepper.moveTo(fullBloom + 500); //TEST WITH VALUE CLOSE TO FULL SIZE
  while( digitalRead(limitSwitchPin) != LOW ) {
    stepper.run();
  }
  stepper.setCurrentPosition(fullBloom + limitSwitchSafetyInterval);
  stepper.runToPosition(0);
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
