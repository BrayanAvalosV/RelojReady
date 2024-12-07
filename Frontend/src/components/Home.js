import React from 'react';
import '../styles.css';

const Home = ({ setCurrentPage }) => {
    const handleCargaReloj = () => {
        setCurrentPage('carga-reloj');
    };

    const handleCargaHorario = () => {
        setCurrentPage('carga-horario');
    };

    return (
        <div className="home-container">
            <h1>Bienvenido a la Aplicación</h1>
            <div className="button-container">
                <button className="button" onClick={handleCargaReloj}>Carga Reloj</button>
                <button className="button" onClick={handleCargaHorario}>Carga Horario</button>
                <button className="button" onClick={() => {/* botón no funcional */}}>Menú</button>
                <button className="button" onClick={() => {/* botón no funcional */}}>Otro</button>
            </div>
        </div>
    );
};

export default Home;