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
    const [rowsToDelete, setRowsToDelete] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetch('http://127.0.0.1:5000/api/data')
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

    /*const rowClassRules = {
        'row-red': params =>
            params.data['entrada/salida'] === 3 &&
            params.data['hora_reloj'] === "00:00" &&
            params.data['Hora Salida'] !== "00:00"
    };*/
    const rowClassRules = {
        'row-red': params =>
            params.data['entrada/salida'] === 3 &&
            params.data['hora_reloj'] === "00:00" &&
            params.data['Hora Salida'] !== "00:00",

        'row-yellow': params => {
            const filaActual = params.data;
    
            // Si esta es la primera fila, no hay fila anterior
            if (params.node.rowIndex === 0) return false;
    
            // Acceder a la fila anterior usando el índice de la fila
            const filaAnterior = params.api.getDisplayedRowAtIndex(params.node.rowIndex - 1);
            
            if (!filaAnterior || !filaAnterior.data) return false;
    
            // Comparar cada campo especificado entre la fila actual y la fila anterior
            const camposAComparar = ['Día','RUT', 'entrada/salida', 'fecha_reloj'];
            const todosCamposIguales = camposAComparar.every(campo => filaActual[campo] === filaAnterior.data[campo]);
    
            if (!todosCamposIguales) return false;
    
            // Si todos los campos coinciden, comparar la diferencia de horas
            const horaRelojActual = filaActual['hora_reloj'];
            const horaRelojAnterior = filaAnterior.data['hora_reloj'];
    
            const [horaActualHoras, horaActualMinutos] = horaRelojActual.split(':').map(Number);
            const [horaAnteriorHoras, horaAnteriorMinutos] = horaRelojAnterior.split(':').map(Number);
    
            const fechaActual = new Date(0, 0, 0, horaActualHoras, horaActualMinutos);
            const fechaAnterior = new Date(0, 0, 0, horaAnteriorHoras, horaAnteriorMinutos);
    
            const diferenciaMinutos = Math.abs((fechaActual - fechaAnterior) / 60000);
    
            // Retornar true si la diferencia es menor o igual a 5 minutos y todos los campos coinciden
            return diferenciaMinutos <= 5;
        }
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
    // Preparar las filas a eliminar y abrir el modal de confirmación (si deseas)
    const prepareDeletions = () => {
        // Filtrar las filas que cumplen con la lógica de row-yellow
        const filteredRows = rowData.filter((row, index, array) => {
            // Saltar la primera fila, ya que no tiene fila anterior
            if (index === 0) return false;

            const filaAnterior = array[index - 1];

            // Comparar los campos especificados
            const camposAComparar = ['Día', 'RUT', 'fecha_reloj'];
            const todosCamposIguales = camposAComparar.every(campo => row[campo] === filaAnterior[campo]);

            if (!todosCamposIguales) return false;

            // Comparar la diferencia de horas
            const horaRelojActual = row['hora_reloj'];
            const horaRelojAnterior = filaAnterior['hora_reloj'];

            const [horaActualHoras, horaActualMinutos] = horaRelojActual.split(':').map(Number);
            const [horaAnteriorHoras, horaAnteriorMinutos] = horaRelojAnterior.split(':').map(Number);

            const fechaActual = new Date(0, 0, 0, horaActualHoras, horaActualMinutos);
            const fechaAnterior = new Date(0, 0, 0, horaAnteriorHoras, horaAnteriorMinutos);

            const diferenciaMinutos = Math.abs((fechaActual - fechaAnterior) / 60000);

            // Devolver true si la diferencia es menor o igual a 5 minutos y los campos coinciden
            return diferenciaMinutos <= 5;
        });

        setRowsToEdit(filteredRows);
        setIsModalOpen(true); // Abrir el modal de confirmación (opcional)
    };


    // Aplicar cambios a las filas y cerrar el modal
    /*const applyChanges = () => {
        const updatedRowData = rowData.map(row => {
            if (rowsToEdit.includes(row)) {
                return { ...row, hora_reloj: row['Hora Salida'] };
            }
            return row;
        });
        setRowData(updatedRowData);
        setIsModalOpen(false);
    };*/
    const applyChanges = () => {
        const updatedRowData = rowData.filter(row => !rowsToEdit.includes(row)); // Filtra las filas que no están en rowsToDelete
        setRowData(updatedRowData); // Actualiza los datos de la tabla con las filas restantes
        setIsModalOpen(false); // Cierra el modal
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
                            Modificar
                        </button>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', width: '65%' }}>
                    <div style={{ flex: 1 }}>
                        <h3>Marcaje múltiple</h3>
                        <p>
                            Encuentra filas en donde se ha marcado mas de 1 vez, en un rango de tiempo de 5 minutos
                        </p>
                    </div>
                    <div style={{ marginLeft: '5px', display: 'flex', justifyContent: 'center', flex: 0 }}>
                        <button
                            onClick={prepareDeletions}
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
    

