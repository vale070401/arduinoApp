class RuleEngine {
  constructor() {
    this.rules = [
      { type: 'normal', threshold: 10000, action: 'log' },
      { type: 'humidity', threshold: 16000, action: 'alert' },
      { type: 'leak', threshold: 20000, action: 'critical' }
    ];
  }

  processSensorData(data) {
    const value = data.sensor.valor;
    
    for (const rule of this.rules) {
      if (this.evaluateRule(rule, value)) {
        return this.createAlert(rule, value, data);
      }
    }
    return null;
  }

  evaluateRule(rule, value) {
    switch (rule.type) {
      case 'normal': return value <= rule.threshold;
      case 'humidity': return value > 10000 && value <= rule.threshold;
      case 'leak': return value > rule.threshold;
      default: return false;
    }
  }

  createAlert(rule, value, data) {
    return {
      sensor_id: data.dispositivo.id,
      alert_type: rule.type,
      message: `${rule.type.toUpperCase()}: ${value}`,
      severity: rule.type === 'leak' ? 'critical' : 'warning',
      value: value,
      threshold: rule.threshold,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = RuleEngine;