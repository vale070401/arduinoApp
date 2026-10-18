const mqtt = require('mqtt');

//Configuracion del MQTT
const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
const MQTT_OPTIONS = {
    clientId: 'fog-node-' + Math.random().toString(16).substr(2,8),
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
};

const mqttClient = mqtt.connect(MQTT_BROKER_URL, MQTT_OPTIONS);

mqttClient.on('connect', () => {
    console.log('Conectado al broker MQTT:', MQTT_BROKER_URL);

//Suscribirse a topics relevantes
mqttClient.subscribe('sensor/+/data', (err) => {
    if(!err){
        console.log('Suscrito a topic: sensor/+/data');
    }
});

mqttClient.subscribe('sensor/+/status', (err) => {
    if(!err){
        console.log('Suscrito a topic: sensor/+/status');
    }
 });
});

mqttClient.on('error', (err) => {
    console.error('Error en MQTT:', err);
});

mqttClient.on('reconnect', () => {
    console.log('Reconectando a MQTT...');
});

mqttClient.on('offline', () => {
    console.log('MQTT offline');
});

module.exports = mqttClient;