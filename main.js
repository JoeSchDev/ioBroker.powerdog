
'use strict';

/*
 * Created with @iobroker/create-adapter v1.31.0
 */


// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');

// Load your modules here, e.g.:
const xmlrpc = require('xmlrpc');

class PowerDog extends utils.Adapter {

    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    constructor(options) {
        super({
            ...options,
            name: 'powerdog',
        });

        this.client = null;

        this.on('ready', this.onReady.bind(this));
        // this.on('stateChange', this.onStateChange.bind(this));
        // this.on('objectChange', this.onObjectChange.bind(this));
        // this.on('message', this.onMessage.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    clientXmlRpcP(tag) {
        return new Promise((resolve, reject) => {
            return this.client.methodCall(tag, [this.config.ApiKey], (error, obj) => {
                if (error) {
                    return reject(error);
                }
                return resolve(obj);
            });
        });
    }

    getObjectP(tag) {
        return new Promise((resolve, reject) => {
            return this.getObject(tag, (error, obj) => {
                if (error) {
                    return reject(error);
                }
                return resolve(obj);
            });
        });
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {
        // Initialize your adapter here    
        // The adapters config (in the instance object everything under the attribute "native") is accessible via
        this.log.debug('IP-Address of Powerdog: ' + this.config.IpAddress);
        this.log.debug('Port of Powerdog: ' + this.config.Port);
        this.log.debug('API-Key of Powerdog: ' + this.config.ApiKey);

        /**
        *
        *      For every state in the system there has to be also an object of type state
        *      Here a simple powerdog for a boolean variable named "testVariable"
        *      Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
        */
        // Creates an XML-RPC client. Passes the host information on where to
        // make the XML-RPC calls.
        this.client = xmlrpc.createClient({ host: this.config.IpAddress, port: this.config.Port, path: '/' })

        // Check if one of the Info Object are present. Query them only one time
        if (await this.getObjectP('Info.FullVersion').catch((err) => { this.log.error('getObjectP: ' + err); }) === null) {
            // Sends a method call to the XML-RPC server
            var obj = await this.clientXmlRpcP('getPowerDogInfo').catch((err) => { this.log.error('XML-RPC-P: ' + err); });
            for (let key in obj) {
                // checking if it's nested
                if (key === 'Reply' && obj.hasOwnProperty(key) && (typeof obj[key] === "object")) {
                    let objInfo = obj[key];
                    for (let keyInfo in objInfo) {
                        this.log.debug(keyInfo + ': ' + objInfo[keyInfo]);
                        var name = 'Info.' + keyInfo;
                        await this.setObjectNotExists(name, {
                            type: 'state',
                            common: {
                                name: keyInfo,
                                type: 'string',
                                role: 'text',
                                read: true,
                                write: false,
                            },
                            native: {}
                        });
                        this.setState(name, { val: objInfo[keyInfo], ack: true });
                    }
                }
            }
        }

        // this.log.debug(JSON.stringify(obj));

        // Sends a method call to the XML-RPC server
        var obj = await this.clientXmlRpcP('getSensors').catch((err) => { this.log.error('XML-RPC: ' + err); });
        for (let key in obj) {
            // checking if it's nested
            if (key === 'Reply' && obj.hasOwnProperty(key) && (typeof obj[key] === "object")) {
                let objSensor = obj[key];
                for (let keySensor in objSensor) {
                    this.log.debug(keySensor);
                    if (objSensor.hasOwnProperty(keySensor) && (typeof objSensor[keySensor] === "object")) {
                        let objSensorInfo = objSensor[keySensor];
                        this.log.debug(objSensorInfo);
                        for (let keyInfo in objSensorInfo) {
                            this.log.debug(keyInfo + ': ' + objSensorInfo[keyInfo]);
                            var name = 'Sensors.' + keySensor + '.' + keyInfo;
                            var type_nan = null;
                            var role_nan = null;
                            if (isNaN(objSensorInfo[keyInfo])) {
                                type_nan = 'string'
                                role_nan = 'text'
                            }
                            else {
                                type_nan = 'number'
                                role_nan = 'value'
                            }
                            await this.setObjectNotExistsAsync(name, {
                                type: 'state',
                                common: {
                                    name: keyInfo,
                                    type: type_nan,
                                    role: role_nan,
                                    read: true,
                                    write: false,
                                },
                                native: {}
                            });
                            this.setState(name, { val: objSensorInfo[keyInfo], ack: true });
                        }
                    }
                }
            }
        }

        // this.log.debug('PowerDog sensor data: ' + JSON.stringify(obj));

        // Sends a method call to the XML-RPC server
        var obj = await this.clientXmlRpcP('getCounters').catch((err) => { this.log.error('XML-RPC: ' + err); });
        for (let key in obj) {
            // checking if it's nested
            if (key === 'Reply' && obj.hasOwnProperty(key) && (typeof obj[key] === "object")) {
                let objCounter = obj[key];
                for (let keyCounter in objCounter) {
                    this.log.debug(keyCounter);
                    if (objCounter.hasOwnProperty(keyCounter) && (typeof objCounter[keyCounter] === "object")) {
                        let objCounterInfo = objCounter[keyCounter];
                        this.log.debug(objCounterInfo);
                        for (let keyInfo in objCounterInfo) {
                            this.log.debug(keyInfo + ': ' + objCounterInfo[keyInfo]);
                            var name = 'Counters.' + keyCounter + '.' + keyInfo;
                            var type_nan = null;
                            var role_nan = null;
                            if (isNaN(objCounterInfo[keyInfo])) {
                                type_nan = 'string'
                                role_nan = 'text'
                            }
                            else {
                                type_nan = 'number'
                                role_nan = 'value'
                            }
                            await this.setObjectNotExistsAsync(name, {
                                type: 'state',
                                common: {
                                    name: keyInfo,
                                    type: type_nan,
                                    role: role_nan,
                                    read: true,
                                    write: false,
                                },
                                native: {}
                            });
                            this.setState(name, { val: objCounterInfo[keyInfo], ack: true });
                        }
                    }
                }
            }
        }

        // this.log.debug('PowerDog sensor data: ' + JSON.stringify(obj));
        this.stop()
        // this.killTimeout = setTimeout(this.stop.bind(this), 0 );
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     * @param {() => void} callback
     */
    onUnload(callback) {
        this.log.debug('cleaned everything up...');
        callback();
    } catch(e) {
        callback();
    }
}

// @ts-ignore parent is a valid property on module
if (module.parent) {
    // Export the constructor in compact mode
    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    module.exports = (options) => new PowerDog(options);
} else {
    // otherwise start the instance directly
    new PowerDog();
}
