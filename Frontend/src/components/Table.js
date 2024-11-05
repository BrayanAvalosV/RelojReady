// App.js
import React, { useEffect, useMemo, useState } from 'react';
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';

const App = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/data');
                if (!response.ok) throw new Error('Network response was not ok');
                const jsonData = await response.json();
                setData(jsonData);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const columns = useMemo(
        () => [
            {
                accessorKey: 'Hora Entrada', // Ajusta a la clave real en tu data
                header: 'Hora Entrada',
            },
            {
                accessorKey: 'Hora Salida', // Ajusta a la clave real en tu data
                header: 'Hora Salida',
            },
            {
                accessorKey: 'RUT', // Ajusta a la clave real en tu data
                header: 'RUT',
            },
        ],
        []
    );

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="App">
            <h1>Tabla de Datos</h1>
            {loading ? (
                <p>Cargando datos...</p>
            ) : (
                <table>
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id}>
                                        {header.column.columnDef.header}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map(row => (
                            <tr key={row.id}>
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id}>{cell.getValue()}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default App;
