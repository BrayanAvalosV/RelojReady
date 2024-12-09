    import React from 'react';
    import { Link, useNavigate } from 'react-router-dom';
    import { useUser } from '../contexts/UserContext';
    import api from '../services/api';
    import '../styles/styles.css'; // Importa el archivo CSS

    const Navbar = () => {
        const { user, logout } = useUser();
        const isAuthenticated = localStorage.getItem('isAuthenticated');
        const userRole = localStorage.getItem('userRole');
        const navigate = useNavigate();

        const handleLogout = async () => {
            const isAuthenticated = localStorage.getItem('isAuthenticated');
            if (isAuthenticated) {
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

        const handleInicio = async () => {
            const isAuthenticated = localStorage.getItem('isAuthenticated');
            const userRole = localStorage.getItem('userRole');
            if (isAuthenticated) {
                if (userRole === 'administrador') {
                    navigate("/admin-panel");
                } else {
                    if (userRole === 'usuario')
                    navigate("/home");
                } 
            } else {
                navigate("/");
            }
        };

        return (
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="container">
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav me-auto">
                            <li className="nav-item">
                                <Link className="nav-link" to={"/home"}>Inicio</Link>  {/* arreglar esto despues */}
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to={"/carga-reloj"}>Carga reloj</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to={"/carga-horario"}>Carga horario</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to={"/datatable"}>Visualizar datos</Link>
                            </li>
                        </ul>
                        <ul className="navbar-nav ms-auto">
                            
                            
                            {isAuthenticated ? (
                                <li className="nav-item dropdown">
                                    <span className="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        Bienvenido, {user?.userName || localStorage.getItem('userName')}
                                    </span>
                                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                                    {userRole === 'administrador' && (
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