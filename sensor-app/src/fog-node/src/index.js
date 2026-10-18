const express = require('express');
const mqtt = require('./mqttClient');
const RuleEngine = require('./ruleEngine');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(require('cors')());
app.use(require('body-parser').json());

// Datos en memoria (sin persistencia)
let currentSensorData = null;
let recentAlerts = [];

const ruleEngine = new RuleEngine();

mqtt.on('connect', () => {
  console.log(' MQTT conectado');
  mqtt.subscribe('sensor/+/data');
});

mqtt.on('message', (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    console.log(` Datos recibidos:`, data);
    
    currentSensorData = data;
    const alert = ruleEngine.processSensorData(data);
    
    if (alert) {
      recentAlerts.unshift(alert);
      if (recentAlerts.length > 10) recentAlerts.pop();
      mqtt.publish('alerts/all', JSON.stringify(alert));
    }
  } catch (error) {
    console.error('Error:', error);
  }
});

// API endpoints
app.get('/api', (req, res) => {
  res.json(currentSensorData);
});
app.get('/api/sensor/:id', (req, res) => {
  res.json(currentSensorData);
});

app.get('/api/alerts', (req, res) => {
  res.json(recentAlerts);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', mqtt: mqtt.connected ? 'connected' : 'disconnected' });
});

app.listen(PORT, () => {
  console.log(` Fog Node en puerto ${PORT}`);
});