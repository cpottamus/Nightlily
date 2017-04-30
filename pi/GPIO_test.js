var rpio = require("rpio");

/*
 * Set the initial state to low.  The state is set prior to the pin becoming
 * active, so is safe for devices which require a stable setup.
 */
rpio.open(23, rpio.OUTPUT, rpio.LOW);

/*
 * The sleep functions block, but rarely in these simple programs does one care
 * about that.  Use a setInterval()/setTimeout() loop instead if it matters.
 */
for (var i = 0; i < 5; i++) {
        /* On for 1 second */
        rpio.write(12, rpio.HIGH);
        console.log("sending high");
        rpio.sleep(5);

        /* Off for half a second (500ms) */
        rpio.write(12, rpio.LOW);
        console.log("sending low");
        rpio.msleep(500);
}