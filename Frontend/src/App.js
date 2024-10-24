import React, { useState } from 'react';
import Home from './components/Home';
import UploadComponent from './components/UploadComponent';
import HorarioUploadComponent from './components/HorarioUploadComponent';

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
            default:
                return <Home setCurrentPage={setCurrentPage} />;
        }
    };

    return (
        <div className="app-container">
            {renderPage()}
        </div>
    );
};

export default App;