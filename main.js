
'use strict';

/*
 * Created with @iobroker/create-adapter v1.31.0
 */

var adapter = null;

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');

// Load your modules here, e.g.:
const xmlrpc = require('xmlrpc');

class PowerDog extends utils.adapter {

    /**
     * @param {Partial<utils.adapterOptions>} [options={}]
     */
    constructor(options) {
        super({
            ...options,
            name: 'powerdog',
        });

        adapter = this;

        // If it has been a force reinit run, set it to false and restart
        if (adapter.config.CreateObjs) {
            adapter.log.info('Restarting now, because we had a forced reinitialization run');
            try {
                adapter.extendForeignObjectAsync(`system.adapter.${adapter.namespace}`, {native: {CreateObjs: false}});
            } catch (e) {
                adapter.log.error(`Could not restart and set forceReinit to false: ${e.message}`);
            }
        }

        // Number of tasks
        this.tasks = 3;
        // XML.RPC client
        this.client = null;

        this.on('ready', this.onReady.bind(this));
        // adapter.on('stateChange', adapter.onStateChange.bind(this));
        // adapter.on('objectChange', adapter.onObjectChange.bind(this));
        // adapter.on('message', adapter.onMessage.bind(this));
        this.on('unload', this.onUnload.bind(this));
        this.on('internal_done', this.onDone.bind(this));
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onDone() {
        if (--this.tasks == 0) {
            this.stop();
            this.log.debug('onDone');
        }
    }


    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {
        // Initialize your adapter here    
        // The adapters config (in the instance object everything under the attribute "native") is accessible via
        this.log.debug('IP-Address of Powerdog: ' + adapter.config.IpAddress);
        this.log.debug('Port of Powerdog: ' + adapter.config.Port);
        this.log.debug('API-Key of Powerdog: ' + adapter.config.ApiKey);

        /**
        *
        *      For every state in the system there has to be also an object of type state
        *      Here a simple powerdog for a boolean variable named "testVariable"
        *      Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
        */
        // Creates an XML-RPC client. Passes the host information on where to
        // make the XML-RPC calls.
        adapter.client = xmlrpc.createClient({ host: adapter.config.IpAddress, port: adapter.config.Port, path: '/' })

        // Query Infos from XML-RPC server
        adapter.client.methodCall('getPowerDogInfo', [this.config.ApiKey], function (error, obj, reply) {
            if (error) {
                adapter.log.error('XML-RPC');
            }
            else {
                for (let key in obj) {
                    // checking if it's nested
                    if (key === 'Reply' && obj.hasOwnProperty(key) && (typeof obj[key] === "object")) {
                        let objInfo = obj[key];
                        for (let keyInfo in objInfo) {
                            adapter.log.debug(keyInfo + ': ' + objInfo[keyInfo]);
                            var name = 'Info.' + keyInfo;
                            adapter.setObjectNotExists(name, {
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
                            adapter.setState(name, { val: objInfo[keyInfo], ack: true });
                        }
                    }
                }

            }
            adapter.emit('internal_done');
        });
        // adapter.log.debug(JSON.stringify(obj));

        // Query Sensors from XML-RPC server
        adapter.client.methodCall('getSensors', [this.config.ApiKey], function (error, obj, reply) {
            if (error) {
                adapter.log.error('XML-RPC');
            }
            else {
                for (let key in obj) {
                    // checking if it's nested
                    if (key === 'Reply' && obj.hasOwnProperty(key) && (typeof obj[key] === "object")) {
                        let objSensor = obj[key];
                        for (let keySensor in objSensor) {
                            adapter.log.debug(keySensor);
                            if (objSensor.hasOwnProperty(keySensor) && (typeof objSensor[keySensor] === "object")) {
                                let objSensorInfo = objSensor[keySensor];
                                adapter.log.debug(objSensorInfo);
                                for (let keyInfo in objSensorInfo) {
                                    adapter.log.debug(keyInfo + ': ' + objSensorInfo[keyInfo]);
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
                                    adapter.setObjectNotExistsAsync(name, {
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
                                    adapter.setState(name, { val: objSensorInfo[keyInfo], ack: true });
                                }
                            }
                        }
                    }
                }
                adapter.emit('internal_done');
            }
        });
        // adapter.log.debug('PowerDog sensor data: ' + JSON.stringify(obj));

        // Query Counters from XML-RPC server
        // Query Sensors from XML-RPC server
        adapter.client.methodCall('getCounters', [this.config.ApiKey], function (error, obj, reply) {
            if (error) {
                adapter.log.error('XML-RPC');
            }
            else {
                for (let key in obj) {
                    // checking if it's nested
                    if (key === 'Reply' && obj.hasOwnProperty(key) && (typeof obj[key] === "object")) {
                        let objCounter = obj[key];
                        for (let keyCounter in objCounter) {
                            adapter.log.debug(keyCounter);
                            if (objCounter.hasOwnProperty(keyCounter) && (typeof objCounter[keyCounter] === "object")) {
                                let objCounterInfo = objCounter[keyCounter];
                                adapter.log.debug(objCounterInfo);
                                for (let keyInfo in objCounterInfo) {
                                    adapter.log.debug(keyInfo + ': ' + objCounterInfo[keyInfo]);
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
                                    adapter.setObjectNotExistsAsync(name, {
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
                                    adapter.setState(name, { val: objCounterInfo[keyInfo], ack: true });
                                }
                            }
                        }
                    }
                }
                adapter.emit('internal_done');
            }
        });
        // adapter.log.debug('PowerDog sensor data: ' + JSON.stringify(obj));
        //    adapter.stop()
        // adapter.killTimeout = setTimeout(adapter.stop.bind(this), 0 );
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     * @param {() => void} callback
     */
    onUnload(callback) {
        adapter.log.debug('cleaned everything up...');
        callback();
    } catch(e) {
        callback();
    }
}

// @ts-ignore parent is a valid property on module
if (module.parent) {
    // Export the constructor in compact mode
    /**
     * @param {Partial<utils.adapterOptions>} [options={}]
     */
    module.exports = (options) => new PowerDog(options);
} else {
    // otherwise start the instance directly
    new PowerDog();
}
