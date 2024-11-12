import React from 'react';
import '../styles.css';
import { useNavigate } from 'react-router-dom';


const Home = ({ setCurrentPage }) => {
    const navigate = useNavigate();
    const handleCargaReloj = () => {
        navigate('/carga-reloj');
    };

    const handleCargaHorario = () => {
        navigate('/carga-horario');
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