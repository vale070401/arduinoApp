import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [sensorData, setSensorData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)

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
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="sensor-panel">
      <h1>Panel de Sensores</h1>
      
      <div className="status-bar">
        <span className="last-update">
          Última actualización: {lastUpdate || 'Nunca'}
        </span>
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

      {loading && sensorData !== null && (
        <div className="loading">Actualizando...</div>
      )}
    </div>
  )
}

export default App
