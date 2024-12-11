import React, { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import Modal from 'react-modal';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import '../style-table.css';
import axios from 'axios';
import { io } from 'socket.io-client';
import ConfigModal from '../components/ModalTiempo'
import ActionButton from '../components/ActionButton';
import FilterComponent from '../components/FilterComponent';
import ConfirmationModal from '../components/ConfirmationModal';
import Table from '../components/Table';

Modal.setAppElement('#root');

const DataTable = () => {
    const [rowData, setRowData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rowsToEdit, setRowsToEdit] = useState([]);
    const [activeAction, setActiveAction] = useState('');
    const [varMinutos, setVarMinutos] = useState(5);
    const [varHoras, setVarHoras] = useState(1);
    const [isModalConfOpen, setIsModalConfOpen] = useState(false);
    const initialRowData = [];
    const [filteredData, setFilteredData] = useState(initialRowData);

    const [selectedFilter, setSelectedFilter] = useState('');
    
    const toggleModal = () => setIsModalConfOpen(!isModalConfOpen);
    

    
    useEffect(() => { 
        fetch('http://localhost:5020/get-records')
            .then(response => response.json())
            .then(data => {
            const processedData = processErrors(data);
            setRowData(processedData);
            })
            .catch(error => console.error('Error fetching data:', error));
       
    }, []);

    useEffect(() => {
        setFilteredData(rowData); // Actualiza los datos filtrados cuando cambian los datos principales
    }, [rowData]);
    
    const handleFilter = (searchValue) => {
        if (!searchValue) {
            setFilteredData(rowData); // Mostrar todos los datos si el campo está vacío
        } else {
            const filtered = rowData.filter(row => 
                row['RUT'] && row['RUT'].toLowerCase().includes(searchValue.toLowerCase())
            );
            setFilteredData(filtered);
        }
    };

    const handleFilterChange = (event) => {
        const filter = event.target.value; // Opción seleccionada
        setSelectedFilter(filter);

        if (!filter) {
            setFilteredData(rowData); // Mostrar todos los datos si no hay filtro
        } else {
            const filtered = rowData.filter(row => {
                // Filtrar por las condiciones especificadas
                if (filter === 'NO REGISTRADO') {
                    return row['Día'] === 'NO REGISTRADO';
                } else {
                    return row['Error encontrado'] === filter;
                }
            });
            setFilteredData(filtered);
        }
    };

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
                error = 'Omisión de Marcaje';
            }
    
            // Error 2: Marcaje múltiple
            if (index > 0 && error === '') { // Solo procesar si aún no hay error asignado
                for (let i = 0; i < index; i++) {
                    const prevRow = array[i];
                    const camposAComparar = ['Día', 'RUT', 'entrada/salida', 'fecha_reloj'];
                    
                    const todosCamposIguales = camposAComparar.every(campo => row[campo] === prevRow[campo]);
            
                    if (todosCamposIguales) {
                        const horaRelojActual = row['hora_reloj'];
                        const horaRelojAnterior = prevRow['hora_reloj'];
            
                        const [horaActualHoras, horaActualMinutos] = horaRelojActual.split(':').map(Number);
                        const [horaAnteriorHoras, horaAnteriorMinutos] = horaRelojAnterior.split(':').map(Number);
            
                        const fechaActual = new Date(0, 0, 0, horaActualHoras, horaActualMinutos);
                        const fechaAnterior = new Date(0, 0, 0, horaAnteriorHoras, horaAnteriorMinutos);
    
                        const diferenciaMinutos = Math.abs((fechaActual - fechaAnterior) / 60000);
            
                        if (diferenciaMinutos <= varMinutos) {
                            error = 'Marcaje múltiple';
                            break; // Terminar la búsqueda, ya que se encontró un error
                        }
                    }
                }
            }
    
            // Error 3: Inversión de entrada/salida
            if (index > 0 && error === '') { // Solo procesar si aún no hay error asignado
                const filaActual = array[index];
                const rutActual = filaActual['RUT'];
    
                const filasPrevias = array.slice(0, index).filter(filaAnterior => filaAnterior['RUT'] === rutActual);
    
                if (filasPrevias.length > 0) {
                    const ultimaFilaPrev = filasPrevias[filasPrevias.length - 1];
    
                    const esEntradaActual = filaActual['entrada/salida'] === 1; // Actual es "entrada"
                    const esSalidaActual = filaActual['entrada/salida'] === 3; // Actual es "salida"
    
                    const esEntradaPrev = ultimaFilaPrev['entrada/salida'] === 1; // Última es "entrada"
                    const esSalidaPrev = ultimaFilaPrev['entrada/salida'] === 3; // Última es "salida"
    
                    const horaActual = new Date(`1970-01-01T${filaActual['hora_reloj']}:00`);
                    let horaEsperada;
    
                    if (esEntradaActual) {
                        horaEsperada = new Date(`1970-01-01T${filaActual['Hora Salida']}:00`);
                    } else if (esSalidaActual) {
                        horaEsperada = new Date(`1970-01-01T${filaActual['Hora Entrada']}:00`);
                    }
    
                    const diferenciaHoras = Math.abs((horaActual - horaEsperada) / (1000 * 60 * 60));
    
                    if ((esEntradaActual && esEntradaPrev) || (esSalidaActual && esSalidaPrev)) {
                        error = 'Posible error'; //
                        if (diferenciaHoras <= varHoras) {
                            error = 'Ajustar Entrada/Salida'; // Detectar error de inversión de entrada/salida
                        }
                    }
                }
            }
    
            return { ...row, 'Error encontrado': error };
        });
    };

    const columnDefs = [
        { headerName: 'Día', field: 'Día', flex: 1 },
        {
            headerName: "RUT",
            field: "RUT",
            filter: 'agTextColumnFilter', // Filtro de texto
            filterParams: {
              filterOptions: ['contains'], 
            },
          },
        { headerName: 'Entrada/Salida', field: 'entrada/salida', editable: true, flex: 1 },
        { headerName: 'Fecha reloj', field: 'fecha_reloj', flex: 1},
        { headerName: 'Hora reloj', field: 'hora_reloj', editable: true, flex: 1 },
        { headerName: 'Entrada Horario', field: 'Hora Entrada', flex: 1 },
        { headerName: 'Salida Horario', field: 'Hora Salida', editable: true, flex: 1 },
        { headerName: 'Error encontrado', field: 'Error encontrado', flex: 1 },
    ];

    const onCellValueChanged = (params) => {
        const updatedRowData = processErrors([...rowData]);
        setRowData(updatedRowData);
    };

    const handleOmission = () => {
        const affectedRows = rowData.filter((row) => row['Error encontrado'] === 'Omisión de Marcaje');
        setRowsToEdit(affectedRows);
        setActiveAction('edit');
        setIsModalOpen(true);
    };
    
    const handleMultipleMarks = () => {
        const affectedRows = rowData.filter((row) => row['Error encontrado'] === 'Marcaje múltiple');
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
        <>
            {/* Botón de Configuración de Reglas */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '20px' }}>
                <button
                    onClick={toggleModal}
                    className="button-style"
                    style={{ display: 'flex', alignItems: 'center', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                    <i className="fa fa-cog" style={{ fontSize: '16px', marginRight: '8px' }}></i>
                    Configuración
                </button>
            </div>
    
            {/* Contenedor de Botones Ajuste*/}

            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: '20px', marginBottom: '10px' }}>
                <h2 style={{ textAlign: 'center', marginTop:'40px', color: '#555' }}>
                    Opciones de Corrección y Ajuste
                </h2>
                <ActionButton
                    title="Omisión de Marcaje"
                    description="Permite que en aquellas filas donde la entrada no es marcada se le asigne el horario programado."
                    onClick={handleOmission}
                    buttonText="Omisión de Marcaje"
                    alignment="flex-start"
                />
                <ActionButton
                    title="Marcaje múltiple"
                    description="Encuentra filas en donde se ha marcado más de 1 vez, en un rango de tiempo de 5 minutos."
                    onClick={handleMultipleMarks}
                    buttonText="Marcaje múltiple"
                />
                <ActionButton
                    title="Ajustar entrada/salida Incorrecta"
                    description="Revisa que no existan dos entradas o dos salidas consecutivas para la misma persona."
                    onClick={handleIncorrectEntryExit}
                    buttonText="Ajustar entrada/salida"
                    alignment="Omisión de Marcaje"
                />
            </div>
    
            {/* Modal de confirmación Botones*/}
            <ConfirmationModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                activeAction={activeAction}
                rowsToEdit={rowsToEdit}
                applyChanges={applyChanges}
            />
    
            {/* Modal de configuración (Minutos/Horas)*/}
            <ConfigModal
                isOpen={isModalConfOpen}
                onClose={toggleModal}
                varMinutos={varMinutos}
                setVarMinutos={setVarMinutos}
                varHoras={varHoras}
                setVarHoras={setVarHoras}
            />
    
            {/* Filtro RUT y Tipo de ERROR*/}
            <FilterComponent
                handleFilter={handleFilter}
                handleFilterChange={handleFilterChange}
                selectedFilter={selectedFilter}
            />
    
            {/* Tabla */}
            <Table
                filteredData={filteredData}
                columnDefs={columnDefs}
                onCellValueChanged={onCellValueChanged}
            />
        </>
    );
}
    
export default DataTable;
