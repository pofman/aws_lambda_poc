'use strict';

let ShadowDevice = require('./ShadowDevice');
let five = require('johnny-five');

const VIRTUAL = true;
const PHYSICAL = false;

module.exports = class LedLightShadow extends ShadowDevice {
    constructor(deviceName, topics, keyPath, certPath, caPath, clientId, host, initialState) {
        super(deviceName, topics, keyPath, certPath, caPath, clientId, host, initialState);
    }

    get led() { return this._led; }
    set led(led) { this._led = led; }
    get options() { return this._options; }
    set options(options) { this._options = options; }
    get ledStatus() { return this._ledStatus; }
    set ledStatus(ledStatus) { this._ledStatus = ledStatus; }

    initialize() {
        super.initialize();

        this.subscribeToEvent('delta', (thingName, stateObject) => {
            if (thingName == this.deviceName) {
                console.log('there is a delta: ', stateObject);
                if (stateObject.state.status == 1) {
                    this.turnOnTheLights(PHYSICAL);
                } else if (stateObject.state.status == 0) {
                    this.turnOffTheLights(PHYSICAL);
                }
            }
        });
    }

    initializePhysical(options) {
        this.options = options;
        this.ledStatus = 0;
        this.led = new five.Led(this.options.pin);
    }

    turnLedOn () {
        this.update(false, {
            light: this.deviceName,
            status: '1'
        });
    }

    turnLedOff () {
        this.update(false, {
            light: this.deviceName,
            status: '0'
        });
    }

    reportLedOn () {
        this.update(true, {
            light: this.deviceName,
            status: '1'
        });
    }

    reportLedOff () {
        this.update(true, {
            light: this.deviceName,
            status: '0'
        });
    }

    turnOnTheLights (isVirtual) {
        if (isVirtual) {
            this.turnLedOn();
        } else {
            this.led.on();
            this.ledStatus = 1;
            this.reportLedOn();
        }
    }

    turnOffTheLights (isVirtual) {
        if (isVirtual) {
            this.turnLedOff();
        }
        else {
            this.led.off();
            this.ledStatus = 0;
            this.reportLedOff();
        }
    }

    changeLedStatus() {
        if (this.ledStatus == 0) {
            this.turnOnTheLights(PHYSICAL);
        }
        else if (this.ledStatus == 1) {
            this.turnOffTheLights(PHYSICAL);
        }
        else {
            this.turnOffTheLights(PHYSICAL);
        }
    }

    dispose() {
        this.led.off();
    }
}