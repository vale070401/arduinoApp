import { useState, useEffect } from 'react'
import mqtt from 'mqtt'
import './App.css'

function App() {
  const [sensorData, setSensorData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [mqttStatus, setMqttStatus] = useState('disconnected')

  const fetchSensorData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api')
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }
      const data = await response.json()
      setSensorData(data)
      setError(null)
      setLastUpdate(new Date().toLocaleTimeString())
    } catch (err) {
      setError(err.message)
      console.error('Error al obtener datos del sensor:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSensorData()
    const interval = setInterval(fetchSensorData, 60000)

    //Conectar a MQTT para alertas en tiempo real
    const mqttBroker = import.meta.env.VITE_MQTT_BROKER || 'ws://localhost:9001/mqtt'
    const client = mqtt.connect(mqttBroker, {
      clientId: 'web-client-' + Math.random().toString(16).substr(2, 8),
      clean: true,
      reconnectPeriod: 1000,
    })

    // En App.jsx, reemplazar la parte de connect (líneas 44-51)
    client.on('connect', ()=>{
    console.log('Conectado al MQTT')
    setMqttStatus('connected')
  
    // Agregar un pequeño delay antes de suscribirse
    setTimeout(() => {
      client.subscribe('alerts/all', (err) => {
        if (err) console.error('Error suscribiendo a alerts/all:', err)
      })
      client.subscribe('alert/+/+', (err) => {
        if (err) console.error('Error suscribiendo a alert/+/+:', err)
      })
      client.subscribe('emergency/critical', (err) => {
        if (err) console.error('Error suscribiendo a emergency/critical:', err)
      })
    }, 100)
  })

    client.on('message',(topic, message) => {
      try{
        const alertData = JSON.parse(message.toString())
        console.log(`Mensaje MQTT: ${topic}`, alertData)

        setAlerts(prev => [{
          ...alertData,
          topic,
          timestamp: new Date().toISOString()
        }, ...prev].slice(0, 10))//solo mantiene las ultimas 10 alertas
      }catch(error){
        console.error('Error parsing MQTT message:', error)
      }
    })

    client.on('error', (err) =>{
      console.error('Error MQTT:', err)
      setMqttStatus('error')
    })

    client.on('disconnect', () => {
      console.log('Desconectado del MQTT')
      setMqttStatus('error')
    })

    
    return () => {
      clearInterval(interval)
      client.end()
    }
  }, [])

  return (
    <div className="sensor-panel">
      <h1>Panel de Sensores</h1>
      
      <div className="status-bar">
        <div className="status-info">
          <span className="last-update">
            Última actualización: {lastUpdate || 'Nunca'}
          </span>
          <span className={`mqtt-status ${mqttStatus}`}>
            MQTT: {mqttStatus === 'connected' ? '🟢 Conectado' : '🔴 Desconectado'}
          </span>
        </div>
        <button onClick={fetchSensorData} className="refresh-btn">
          Actualizar ahora
        </button>
      </div>

      {loading && sensorData === null && (
        <div className="loading">Cargando datos del sensor...</div>
      )}

      {error && (
        <div className="error">
          Error: {error}
        </div>
      )}

      {sensorData && (
        <div className="sensor-data">
          <h2>Datos del Sensor</h2>
          
          <div className="data-grid">
            {/* Device Information */}
            <div className="data-card device-info">
              <div className="card-header">
                <h3>Información del Dispositivo</h3>
                <span className="icon">📱</span>
              </div>
              <div className="card-content">
                <div className="data-row">
                  <span className="label">ID:</span>
                  <span className="value">{sensorData.dispositivo.id}</span>
                </div>
                <div className="data-row">
                  <span className="label">Nombre:</span>
                  <span className="value">{sensorData.dispositivo.nombre}</span>
                </div>
                <div className="data-row">
                  <span className="label">Torre:</span>
                  <span className="value">{sensorData.dispositivo.ubicacion.torre}</span>
                </div>
                <div className="data-row">
                  <span className="label">Piso:</span>
                  <span className="value">{sensorData.dispositivo.ubicacion.piso}</span>
                </div>
                <div className="data-row">
                  <span className="label">Área:</span>
                  <span className="value">{sensorData.dispositivo.ubicacion.area}</span>
                </div>
              </div>
            </div>

            {/* Sensor Information */}
            <div className="data-card sensor-info">
              <div className="card-header">
                <h3>Información del Sensor</h3>
                <span className="icon">🔬</span>
              </div>
              <div className="card-content">
                <div className="data-row">
                  <span className="label">Tipo:</span>
                  <span className="value">{sensorData.sensor.tipo}</span>
                </div>
                <div className="data-row">
                  <span className="label">Pin:</span>
                  <span className="value">{sensorData.sensor.pin}</span>
                </div>
                <div className="data-row">
                  <span className="label">Valor:</span>
                  <span className="value highlight">{sensorData.sensor.valor}</span>
                </div>
                <div className="data-row">
                  <span className="label">Unidad:</span>
                  <span className="value">{sensorData.sensor.unidad}</span>
                </div>
              </div>
            </div>

            {/* Status Information */}
            <div className="data-card status-info">
              <div className="card-header">
                <h3>Estado del Sistema</h3>
                <span className="icon">📊</span>
              </div>
              <div className="card-content">
                <div className="data-row">
                  <span className="label">Umbral de Fuga:</span>
                  <span className="value">{sensorData.umbralFuga}</span>
                </div>
                <div className="data-row">
                  <span className="label">Estado:</span>
                  <span className={`value status-badge ${sensorData.estado.codigo.toLowerCase()}`}>
                    {sensorData.estado.codigo}
                  </span>
                </div>
                <div className="data-row">
                  <span className="label">Rango Normal:</span>
                  <span className="value">{sensorData.sensor.rango.normal}</span>
                </div>
                <div className="data-row">
                  <span className="label">Rango Humedad:</span>
                  <span className="value">{sensorData.sensor.rango.humedad}</span>
                </div>
                <div className="data-row">
                  <span className="label">Rango Fuga:</span>
                  <span className="value">{sensorData.sensor.rango.fuga}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {alerts.length > 0 && (
        <div className="alerts-section">
          <h3> Alertas Recientes</h3>
        <div className="alerts-list">
          {alerts.map((alert, index) => (
          <div key={index} className={`alert-item ${alert.severity}`}>
            <div className="alert-header">
              <span className="alert-type">{alert.alert_type}</span>
                <span className="alert-time">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="alert-message">{alert.message}</div>
              {alert.value && (
                <div className="alert-details">
                  Valor: {alert.value} | Umbral: {alert.threshold}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )}
    


      {loading && sensorData !== null && (
        <div className="loading">Actualizando...</div>
      )}
    </div>
  )
}

export default App
