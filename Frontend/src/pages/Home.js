import React from 'react';
import '../styles.css';
import { useNavigate } from 'react-router-dom';


const Home = ({ setCurrentPage }) => {
    const navigate = useNavigate();

    return (
        <div className="home-container">
            <h1>Bienvenido a la aplicación RelojReady</h1> 
           <p>RelojReady es una herramienta intuitiva que te permitirá:</p> 
        <ul>
            <li>Cargar archivos de asistencia y horarios de forma rápida y sencilla.</li>
            <li>Visualizar los registos de asistencia de manera legible.</li>
            <li>Realizar modificaciones basadas en reglas sobre el archivo original.</li>
            <li>Generar un archivo limpio y listo para subir al ERP SIRH.</li>
        </ul>
        </div>
    );
};

export default Home;