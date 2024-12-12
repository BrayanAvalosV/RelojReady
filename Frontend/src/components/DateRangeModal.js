import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DateRangeModal = ({ isOpen, onRequestClose }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minDate, setMinDate] = useState('');
  const [maxDate, setMaxDate] = useState('');

  // Función para obtener las fechas mínimas y máximas
  useEffect(() => {
    if (isOpen) {
      axios.get('http://localhost:5000/get-min-max-dates')
        .then(response => {
          setMinDate(response.data.minDate);
          setMaxDate(response.data.maxDate);
        })
        .catch(error => {
          console.error('Error obteniendo las fechas mínimas y máximas:', error);
          alert('No se pudieron obtener las fechas.');
        });
    }
  }, [isOpen]);

  // Función para aplicar las fechas y exportar el archivo
  const handleApply = async () => {
    if (!startDate || !endDate) {
      alert('Por favor, selecciona ambas fechas.');
      return;
    }

    try {
      // Realizamos la llamada a la API para exportar el archivo con las fechas seleccionadas
      const response = await axios.get('http://localhost:5000/export-log', {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
        responseType: 'blob', // Indicamos que esperamos un archivo binario
      });

      // Crear un enlace para descargar el archivo
      const blob = new Blob([response.data], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'exported_file.log';
      link.click();

      // Cerrar el modal después de la descarga
      onRequestClose();
    } catch (error) {
      console.error('Error al exportar el archivo:', error);
      alert('Hubo un error al exportar el archivo.');
    }
  };

  return (
    <div
      style={{
        display: isOpen ? 'block' : 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
      }}
      onClick={onRequestClose}
    >
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          maxWidth: '500px',
          width: '100%',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ textAlign: 'center' }}>Seleccionar Rango de Fechas</h2>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="startDate">Fecha de Inicio:</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            min={minDate}
            max={maxDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ marginLeft: '10px' }}
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="endDate">Fecha de Fin:</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            min={minDate}
            max={maxDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ marginLeft: '10px' }}
          />
        </div>
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleApply}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              minWidth: '150px',
              cursor: 'pointer',
              marginRight: '10px',
            }}
          >
            Aplicar
          </button>
          <button
            onClick={onRequestClose}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              minWidth: '150px',
              cursor: 'pointer',
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateRangeModal;
