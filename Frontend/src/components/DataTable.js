import React, { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css'; // O cualquier otro tema
import '../style-table.css';

const DataTable = () => {
    const [rowData, setRowData] = useState([]);

    useEffect(() => {
        fetch('http://localhost:5000/api/data')
            .then(response => response.json())
            .then(data => setRowData(data))
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    const columnDefs = [
        { 
            headerName: 'Día',
             field: 'Día',
             filter:true,
         },
        { headerName: 'RUT', field: 'RUT' },
        { 
            headerName: 'Entrada/Salida', 
            field: 'entrada/salida',
            editable: true,
         },
           
        { headerName: 'Fecha reloj', field: 'fecha_reloj' },
        { 
            headerName: 'Hora reloj',
             field: 'hora_reloj',
             editable: true,
             cellStyle: params => {
                if (params.value && params.value < '12:00') {
                    return { backgroundColor: 'lightgreen' }; // Antes de mediodía
                }
            },
        },
        { headerName: 'Hora Entrada Horario', field: 'Hora Entrada' },
        { headerName: 'Hora Salida Horario', field: 'Hora Salida' },
        
    ];

    const rowClassRules = {
        'row-red': params => params.data['Hora Salida'] && params.data['Hora Salida'] < '12:00', // Si Hora Salida es antes de las 12
        'row-green': params => params.data['Hora Salida'] && params.data['Hora Salida'] >= '12:00', // Si Hora Salida es a partir de las 12
    };

    return (
        <div className="ag-theme-alpine" style={{ height: '400px', width: '95%' }}>
            <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                rowClassRules={rowClassRules}
                pagination={true}
                sorting={true}
                paginationPageSize={10} // Número de filas por página
            />
        </div>
    );
};

export default DataTable;
