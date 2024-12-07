import React, { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import Modal from 'react-modal';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import '../style-table.css';
import axios from 'axios';
import { io } from 'socket.io-client';

Modal.setAppElement('#root');

const DataTable = () => {
    const [rowData, setRowData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rowsToEdit, setRowsToEdit] = useState([]);
    const [activeAction, setActiveAction] = useState('');
    

    
    useEffect(() => { 
        fetch('http://localhost:5020/get-records')
            .then(response => response.json())
            .then(data => {
            const processedData = processErrors(data);
            setRowData(processedData);
            })
            .catch(error => console.error('Error fetching data:', error));
       
    }, []);
    // CRITERIOS CASOS DE ERROR
    const processErrors = (data) => {
        return data.map((row, index, array) => {
            let error = '';

            // Error 1: Omisión de marcaje
            if (
                row['entrada/salida'] === 3 &&
                row['hora_reloj'] === '00:00' &&
                row['Hora Salida'] !== '00:00'
            ) {
                error = '1';
            }

            if (index > 0) {
                // Recorremos todas las filas previas (antes de la fila actual)
                for (let i = 0; i < index; i++) {
                    const prevRow = array[i];
                    const camposAComparar = ['Día', 'RUT', 'entrada/salida', 'fecha_reloj'];
                    
                    // Comparamos los campos entre la fila actual (row) y la fila anterior (prevRow)
                    const todosCamposIguales = camposAComparar.every(campo => row[campo] === prevRow[campo]);
            
                    if (todosCamposIguales) {
                        const horaRelojActual = row['hora_reloj'];
                        const horaRelojAnterior = prevRow['hora_reloj'];
            
                        const [horaActualHoras, horaActualMinutos] = horaRelojActual.split(':').map(Number);
                        const [horaAnteriorHoras, horaAnteriorMinutos] = horaRelojAnterior.split(':').map(Number);
            
                        // Crear objetos de fecha solo para comparar tiempos
                        const fechaActual = new Date(0, 0, 0, horaActualHoras, horaActualMinutos);
                        const fechaAnterior = new Date(0, 0, 0, horaAnteriorHoras, horaAnteriorMinutos);

                        const diferenciaMinutos = Math.abs((fechaActual - fechaAnterior) / 60000);
            
                        if (diferenciaMinutos <= 5) {
                            error = '2';
                        }
                    }
                }
            }
            // Error 3: Inversión de entrada/salida
            if (index > 0) {
                const filaActual = array[index];
                const rutActual = filaActual['RUT'];

                // Obtener todas las filas anteriores con el mismo RUT
                const filasPrevias = [];
                for (let i = 0; i < index; i++) {
                    const filaAnterior = array[i];

                    // Si la fila anterior tiene el mismo RUT, añadirla a filasPrevias
                    if (filaAnterior['RUT'] === rutActual) {
                        filasPrevias.push(filaAnterior);
                    }
                }

                // Si hay filas previas con el mismo RUT, comparar la última fila con la actual
                if (filasPrevias.length > 0) {
                    const ultimaFilaPrev = filasPrevias[filasPrevias.length - 1];

                    const esEntradaActual = filaActual['entrada/salida'] === 1; // Actual es "entrada"
                    const esSalidaActual = filaActual['entrada/salida'] === 3; // Actual es "salida"

                    const esEntradaPrev = ultimaFilaPrev['entrada/salida'] === 1; // Última es "entrada"
                    const esSalidaPrev = ultimaFilaPrev['entrada/salida'] === 3; // Última es "salida"

                    // Detectar error de inversión de entrada/salida: dos entradas o dos salidas seguidas
                    if ((esEntradaActual && esEntradaPrev) || (esSalidaActual && esSalidaPrev)) {
                       // error = '3';
                    }
                }
            }
                    

           

            return { ...row, 'Error encontrado': error };
        });
    };

    const columnDefs = [
        { headerName: 'Día', field: 'Día', flex: 1 },
        { headerName: 'RUT', field: 'RUT', editable: true, flex: 1 },
        { headerName: 'entrada/salida', field: 'entrada/salida', editable: true, flex: 1 },
        { headerName: 'fecha_reloj', field: 'fecha_reloj', flex: 1 },
        { headerName: 'hora_reloj', field: 'hora_reloj', editable: true, flex: 1 },
        { headerName: 'Entrada Horario', field: 'Hora Entrada', flex: 1 },
        { headerName: 'Salida Horario', field: 'Hora Salida', editable: true, flex: 1 },
        { headerName: 'Error encontrado', field: 'Error encontrado', flex: 1 },
    ];

    const onCellValueChanged = (params) => {
        const updatedRowData = processErrors([...rowData]);
        setRowData(updatedRowData);
    };

    const handleOmission = () => {
        const affectedRows = rowData.filter((row) => row['Error encontrado'] === '1');
        setRowsToEdit(affectedRows);
        setActiveAction('edit');
        setIsModalOpen(true);
    };
    
    const handleMultipleMarks = () => {
        const affectedRows = rowData.filter((row) => row['Error encontrado'] === '2');
        setRowsToEdit(affectedRows);
        setActiveAction('delete');
        setIsModalOpen(true);
    };
    
    const handleIncorrectEntryExit = () => {
        const affectedRows = rowData.filter((row) => row['Error encontrado'] === '3');
        setRowsToEdit(affectedRows);
        setActiveAction('ajuste');
        setIsModalOpen(true);
    };
    
    /*const applyChanges = () => {
        let updatedRowData;
        
        if (activeAction === 'edit') {
            updatedRowData = rowData.map(row => {
                // Si la fila está en rowsToEdit, actualiza la columna 'Error Encontrado'
                if (rowsToEdit.some(editRow => editRow === row)) {
                    // Actualizar la columna 'Error Encontrado' con el nuevo valor
                    const updatedRow = { ...row, 
                        hora_reloj: row['Hora Salida'], 
                        'Error encontrado': ''  // Cambiar el texto de la columna 'Error Encontrado'
                    };
                    return updatedRow;
                }
                return row;
            });
        } else if (activeAction === 'delete') {
            updatedRowData = rowData.filter(row => !rowsToEdit.some(editRow => editRow === row));
        }
    
        setRowData(updatedRowData);
        setIsModalOpen(false);
    };*/
    const applyChanges = () => {
        if (activeAction === 'edit') {
            fetch('http://localhost:5020/adjust-time', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rowsToEdit.map(row => ({
                    RUT: row['RUT'],
                    newDay: row.newDay || row['Día'],
                })))
            })
            .then(response => response.json())
            .then(data => {
                console.log('Edición confirmada:', data);
                setIsModalOpen(false);
                //fetch();
            })
            .catch(error => {
                console.error('Error al editar:', error);
            });
        } else if (activeAction === 'delete') {
            
            fetch('http://localhost:5020/delete-duplicates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rowsToEdit.map(row => ({
                    RUT: row['RUT'],
                    fecha_reloj: row['fecha_reloj'],
                    hora_reloj: row['hora_reloj']
                })))
            })
            .then(response => response.json())
            .then(data => {
                console.log('Eliminación confirmada:', data);
                setIsModalOpen(false);
                //fetch();
            })
            .catch(error => {
                console.error('Error al eliminar:', error);
            });
        }
    };
    

    return (
        <><div style={{ display: 'flex', alignItems: 'center', width: '65%' }}>
            {/* Caso 1: Omisión de Marcaje */}
            <div style={{ flex: 1 }}>
                <h3>Omisión de Marcaje</h3>
                <p>
                    Permite que en aquellas filas donde la entrada no es marcada se le asigne el horario programado.
                </p>
            </div>
            <div style={{ marginLeft: '5px', display: 'flex', justifyContent: 'center', flex: 0 }}>
                <button
                    onClick={handleOmission}
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
                    Modificar
                </button>
            </div>
        </div><div style={{ display: 'flex', alignItems: 'center', width: '65%' }}>
                {/* Caso 2: Marcaje Múltiple */}
                <div style={{ flex: 1 }}>
                    <h3>Marcaje múltiple</h3>
                    <p>
                        Encuentra filas en donde se ha marcado más de 1 vez, en un rango de tiempo de 5 minutos.
                    </p>
                </div>
                <div style={{ marginLeft: '5px', display: 'flex', justifyContent: 'center', flex: 0 }}>
                    <button
                        onClick={handleMultipleMarks}
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
                        Modificar
                    </button>
                </div>
            </div><div style={{ display: 'flex', alignItems: 'center', width: '65%' }}>
                {/* Caso 3: entrada/salida Incorrecta */}
                <div style={{ flex: 1 }}>
                    <h3>Ajustar entrada/salida Incorrecta</h3>
                    <p>
                        Revisa que no existan dos entradas o dos salidas consecutivas para la misma persona.
                    </p>
                </div>
                <div style={{ marginLeft: '5px', display: 'flex', justifyContent: 'center', flex: 0 }}>
                    <button
                        onClick={handleIncorrectEntryExit}
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
                        Modificar
                    </button>
                </div>
            </div>
                            <><Modal
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
                    <h2 style={{ textAlign: 'center' }}>
                        {activeAction === 'edit' ? 'Confirmar Edición' : activeAction === 'delete' ? 'Confirmar Eliminación' : 'Acción'}
                    </h2>
                    <p>
                        {activeAction === 'edit'
                            ? 'Las siguientes filas serán editadas:'
                            : activeAction === 'delete'
                            ? 'Las siguientes filas serán eliminadas:'
                            : 'Detalles de la acción:'}
                    </p>
                    <ul style={{ paddingLeft: '20px' }}>
                        {rowsToEdit.map((row, index) => (
                            <li key={index}>
                                Día: {row['Día']}, RUT: {row['RUT']}, hora_reloj: {row['hora_reloj']}
                                {activeAction === 'edit' && (
                                    <>
                                        <br />
                                        <strong>Nuevos valores:</strong> 
                                        <span style={{ color: '#28a745' }}>
                                            Día: {row.newDay || row['Día']}, Nueva hora_reloj: {row.newHour || row['Hora Salida']}
                                        </span>
                                    </>
                                )}
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
                </Modal><>

                    <div className="ag-theme-alpine" style={{ height: '600px', width: '100%' }}>
                        <AgGridReact
                            rowData={rowData}
                            columnDefs={columnDefs}
                            rowClassRules={{
                                'row-red': params => params.data['Error encontrado'] === '1',
                                'row-yellow': params => params.data['Error encontrado'] === '2',
                                //'row-orange': params => params.data['Error encontrado'] === '3',
                            }}
                            defaultColDef={{ editable: true, flex: 1 }}
                            onCellValueChanged={onCellValueChanged} />
                    </div>
                </></></>
    );
};

export default DataTable;
