import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import api from '../services/api';
import '../styles/styles.css'; // Importa el archivo CSS

const Navbar = () => {
    const { user, logout } = useUser();
    const navigate = useNavigate();

    const handleLogout = async () => {
        if (localStorage.getItem('isAuthenticated')) {
            try {
                const response = await api.post('/logout');
                if (response.status === 200) {
                    localStorage.removeItem('isAuthenticated');
                    localStorage.removeItem('userName');
                    localStorage.removeItem('userRole');
                    logout();
                    navigate('/');
                } else {
                    console.error('Error al cerrar sesión:', response.status);
                }
            } catch (error) {
                console.error('Error al cerrar sesión:', error);
            }
        }
    };

    const renderNavLinks = () => {
        const userRole = localStorage.getItem('userRole');

        if (!localStorage.getItem('isAuthenticated')) {
            return null; // No mostrar nada si no está autenticado
        }

        const commonLinks = (
            <>
                <li className="nav-item">
                    <Link className="nav-link" to="/home">Inicio</Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" to="/carga-reloj">Carga reloj</Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" to="/carga-horario">Carga horario</Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" to="/datatable">Visualizar datos</Link>
                </li>
            </>
        );

        if (userRole === 'administrador') {
            return (
                <>
                    {commonLinks}
                    <li className="nav-item">
                        <Link className="nav-link" to="/logs">Historial de cambios</Link>
                    </li>
                </>
            );
        }

        return commonLinks; // Mostrar solo los enlaces comunes para usuarios
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container">
            <Link className="navbar-brand" to="/">
                    <img 
                        src="https://www.sscoquimbo.cl/gob-cl/images/logo_digital.png" 
                        alt="Logotipo" 
                        style={{ height: '40px' }} // Ajusta el tamaño del logotipo
                    />
            </Link>        
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        {renderNavLinks()}
                    </ul>
                    <ul className="navbar-nav ms-auto">
                        {localStorage.getItem('isAuthenticated') ? (
                            <li className="nav-item dropdown">
                                <span className="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    Bienvenido, {user?.userName || localStorage.getItem('userName')}
                                </span>
                                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                                    {localStorage.getItem('userRole') === 'administrador' && (
                                        <>
                                            <li><Link className="dropdown-item" to="/admin-panel">Panel de control</Link></li>
                                            <li><Link className="dropdown-item" to="/registro">Registro de cambios</Link></li>
                                        </>
                                    )}
                                    <li><button className="dropdown-item" onClick={handleLogout}>Cerrar sesión</button></li>
                                </ul>
                            </li>
                        ) : (
                            <li className="nav-item dropdown">
                                <span className="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    Mi Cuenta
                                </span>
                                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                                    <li>
                                        <Link className="dropdown-item" to="/">Iniciar Sesión</Link>
                                    </li>
                                </ul>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
