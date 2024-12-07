import React, { useState } from 'react';
import Home from './components/Home';
import UploadComponent from './components/UploadComponent';
import HorarioUploadComponent from './components/HorarioUploadComponent';
import DataTable from './components/DataTable';

const App = () => {
    const [currentPage, setCurrentPage] = useState('home');

    const renderPage = () => {
        switch (currentPage) {
            case 'home':
                return <Home setCurrentPage={setCurrentPage} />;
            case 'carga-reloj':
                return <UploadComponent />;
            case 'carga-horario':
                return <HorarioUploadComponent />;
            case 'tabla': // Agrega el caso para la nueva página
                return <DataTable />;
            default:
                return <Home setCurrentPage={setCurrentPage} />;
        }
    };

    return (
        <div className="app-container">
            <nav>
                <button onClick={() => setCurrentPage('home')}>Inicio</button>
                <button onClick={() => setCurrentPage('carga-reloj')}>Carga de Reloj</button>
                <button onClick={() => setCurrentPage('carga-horario')}>Carga de Horario</button>
                <button onClick={() => setCurrentPage('tabla')}>Tabla de Datos</button>
            </nav>
            {renderPage()}
        </div>
    );
};

export default App;