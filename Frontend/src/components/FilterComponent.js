import React from 'react';

const FilterComponent = ({ handleFilter, handleFilterChange, selectedFilter }) => {
    const containerStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        marginBottom: '20px',
    };

    const inputStyle = {
        padding: '10px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        width: '40%',
    };

    const labelStyle = {
        marginRight: '10px',
        fontWeight: 'bold',
    };

    const selectStyle = {
        padding: '10px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        width: '35%',
    };

    return (
        <div style={containerStyle}>
            {/* Search Input */}
            <input
                type="text"
                placeholder="Buscar por RUT"
                style={inputStyle}
                onChange={(e) => handleFilter(e.target.value)}
            />

            {/* Filter Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '40%' }}>
                <label htmlFor="filter" style={labelStyle}>Filtrar por:</label>
                <select
                    id="filter"
                    value={selectedFilter}
                    onChange={handleFilterChange}
                    style={selectStyle}
                >
                    <option value="">Todos</option>
                    <option value="Omisión de Marcaje">Omisión de Marcaje</option>
                    <option value="Marcaje múltiple">Marcaje múltiple</option>
                    <option value="Posible error">Posible error</option>
                    <option value="Ajustar Entrada/Salida">Ajustar Entrada/Salida</option>
                    <option value="NO REGISTRADO">No registrado</option>
                </select>
            </div>
            <button
        style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            minWidth: '100px',
            cursor: 'pointer',
        }}
    >
        Exportar
    </button>
    <button
        style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            minWidth: '100px',
            cursor: 'pointer',
        }}
    >
        No registrados
    </button>
        </div>
    );
};

export default FilterComponent;