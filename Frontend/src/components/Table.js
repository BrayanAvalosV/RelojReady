import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const DataTable = ({ filteredData, columnDefs, onCellValueChanged }) => {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <div className="ag-theme-alpine" style={{ height: '550px', width: '98%' }}>
            <AgGridReact
                rowData={filteredData}
                columnDefs={columnDefs}
                defaultColDef={{
                    sortable: false,
                    suppressMovable: true,
                    editable: true,
                    resizable: false,
                    flex: 1
                }}
                rowClassRules={{
                    'row-red': params => params.data['Error encontrado'] === 'Omisión de Marcaje',
                    'row-yellow': params => params.data['Error encontrado'] === 'Marcaje múltiple',
                    //'row-orange': params => params.data['Error encontrado'] === '3',
                    'row-blue': params => params.data['Día'] === 'NO REGISTRADO',

                }}
                onCellValueChanged={onCellValueChanged}
                pagination={true}
                paginationPageSize={20}
            />
        </div>
        </div>
    );
};

export default DataTable;
