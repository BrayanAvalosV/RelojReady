import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LogsPage = () => {
  const [logs, setLogs] = useState([]);

  // Obtener los datos desde el backend
  useEffect(() => {
    axios.get('http://localhost:5000/logs') // Cambia esto si el backend está en otra dirección
      .then(response => {
        setLogs(response.data);
      })
      .catch(error => {
        console.error('Error al obtener los logs:', error);
      });
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center' }}>Registro de Cambios</h2>
      
      {logs.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f4f4f4' }}>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Usuario</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Descripción del Cambio</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Fecha del Cambio</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{log.Usuario}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {`Se realizó la modificación de ${log.Modificacion} en ` +
                   `"RUT: ${log.RUT}, Entrada/Salida: ${log['entrada/salida']}, ` +
                   `Hora Entrada: ${log['Hora Entrada']}, Hora Salida: ${log['Hora Salida']}, ` +
                   `Hora Reloj: ${log.hora_reloj}, Fecha Reloj: ${log.fecha_reloj}" `}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{log['Fecha Cambio']}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ textAlign: 'center', marginTop: '20px' }}>No hay registros disponibles.</p>
      )}
    </div>
  );
};

export default LogsPage;