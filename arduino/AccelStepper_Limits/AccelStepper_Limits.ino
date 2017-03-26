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
int maxAcceleration = 8000;
int safetyLimit = -100;
int incomingByte = 0;           //for incoming serial data
int newTarget = 0;              //for incoming serial data


void setup() {

  //Testing serial setup
  Serial.begin(115200);
  while(!Serial) {
    ;
  }
  delay(2000);
  // Send ready signal.
  Serial.println(2000);
  
  stepper.setMaxSpeed(maxAcceleration);
  stepper.setAcceleration(maxAcceleration);
//  stepper.setMinPulseWidth(25);

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

   
  
  //If data received
  if(Serial.available()>0){
      // read the incoming byte:
      newTarget = Serial.parseInt();
      Serial.println(newTarget);


 
      if(stepper.currentPosition() == bloomTarget) {
        bloomTarget = newTarget;
        Serial.println(bloomTarget);
      }
      
  }
  
  if (stepper.currentPosition() != bloomTarget){
    //osc listener goes here
    //bloomSpeed = OSC/blooom/speed
    //bloomTarget = OSC/bloom/position
    
    //stepper.setMaxSpeed(bloomSpeed);
    //stepper.setAcceleration(bloomSpeed*2);
    stepper.runToNewPosition(bloomTarget);
  }

  //stepper.disableOutputs();
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
