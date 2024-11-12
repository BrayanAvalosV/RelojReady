import React, { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import Modal from 'react-modal';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import '../style-table.css';

Modal.setAppElement('#root'); // Necesario para accesibilidad

const DataTable = () => {
    const [rowData, setRowData] = useState([]);
    const [rowsToEdit, setRowsToEdit] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetch('http://localhost:5000/api/data')
            .then(response => response.json())
            .then(data => setRowData(data))
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    const columnDefs = [
        { headerName: 'Día', field: 'Día' },
        { headerName: 'RUT', field: 'RUT', editable:true },
        { headerName: 'Entrada/Salida', field: 'entrada/salida', editable: true },
        { headerName: 'Fecha reloj', field: 'fecha_reloj' },
        { headerName: 'Hora reloj', field: 'hora_reloj', editable: true },
        { headerName: 'Hora Entrada Horario', field: 'Hora Entrada' },
        { headerName: 'Hora Salida Horario', field: 'Hora Salida', editable: true },
    ];

    const rowClassRules = {
        'row-red': params =>
            params.data['entrada/salida'] === 3 &&
            params.data['hora_reloj'] === "00:00" &&
            params.data['Hora Salida'] !== "00:00"
    };

    // Preparar las filas a modificar y abrir el modal
    const prepareChanges = () => {
        const filteredRows = rowData.filter(row =>
            row['entrada/salida'] === 3 &&
            row['hora_reloj'] === "00:00" &&
            row['Hora Salida'] !== "00:00"
        );
        setRowsToEdit(filteredRows);
        setIsModalOpen(true);
    };

    // Aplicar cambios a las filas y cerrar el modal
    const applyChanges = () => {
        const updatedRowData = rowData.map(row => {
            if (rowsToEdit.includes(row)) {
                return { ...row, hora_reloj: row['Hora Salida'] };
            }
            return row;
        });
        setRowData(updatedRowData);
        setIsModalOpen(false);
    };
        return (
            <>
                <div style={{ display: 'flex', alignItems: 'center', width: '65%' }}>
                    <div style={{ flex: 1 }}>
                        <h3>Omisión de Marcaje</h3>
                        <p>
                            Permite que en aquellas filas donde la entrada no es marcada se le asigne el horario programado.
                        </p>
                    </div>
                    <div style={{ marginLeft: '5px', display: 'flex', justifyContent: 'center', flex: 0 }}>
                        <button
                            onClick={prepareChanges}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                minWidth: '200px',
                                cursor: 'pointer',
                            }}
                        >
                            Modiicar
                        </button>
                    </div>
                </div>
    
                <Modal
                    isOpen={isModalOpen}
                    onRequestClose={() => setIsModalOpen(false)}
                    contentLabel="Confirmación de Cambios"
                    style={{
                        content: {
                            maxWidth: '500px',
                            margin: 'auto',
                            padding: '20px',
                            borderRadius: '8px',
                            border: '1px solid #ccc',
                        }
                    }}
                >
                    <h2 style={{ textAlign: 'center' }}>Confirmación de Cambios</h2>
                    <p>Las siguientes filas serán editadas:</p>
                    <ul style={{ paddingLeft: '20px' }}>
                        {rowsToEdit.map((row, index) => (
                            <li key={index}>
                                Día: {row['Día']}, RUT: {row['RUT']}, Hora Reloj: {row['hora_reloj']}, Hora Salida Horario: {row['Hora Salida']}
                            </li>
                        ))}
                    </ul>
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                        <button
                            onClick={applyChanges}
                            style={{
                                padding: '10px 20px',
                                marginRight: '10px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                            }}
                        >
                            Confirmar
                        </button>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                            }}
                        >
                            Cancelar
                        </button>
                    </div>
                </Modal>
    
                <div className="ag-theme-alpine" style={{ height: '400px', width: '100%' }}>
                    <AgGridReact
                        rowData={rowData}
                        columnDefs={columnDefs}
                        rowClassRules={rowClassRules}
                        pagination={true}
                        sorting={true}
                        paginationPageSize={10} // Número de filas por página
                    />
                </div>
            </>
        );
    };
    
    export default DataTable;
    

