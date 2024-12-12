// login.js
import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Login = () => {
    const [rut_persona, setRut_persona] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setSuccessMessage('');
        setError(''); // Limpiar mensaje de error al intentar nuevamente
        try {
            // Agrega { withCredentials: true } para enviar cookies
            const response = await api.post('/login', { rut_persona, contrasena }, { withCredentials: true });
            console.log(response.data); // Verificar la respuesta en la consola

            // Verificar si el inicio de sesión fue exitoso
            if (response.status === 200 && response.data.role) {
                // Almacena información del usuario en localStorage
                localStorage.setItem('userRole', response.data.role);
                localStorage.setItem('userName', response.data.nombre);
                localStorage.setItem('userApPat', response.data.apellido1);
                localStorage.setItem('userApMat', response.data.apellido2);
                localStorage.setItem('isAuthenticated', true);

               // console.log('Inicio de sesión exitoso');
                setSuccessMessage('Has iniciado sesión exitosamente.');

                // Redirigir después de 2 segundos
                setTimeout(() => {
                    if (response.data.role === 'administrador') {
                    navigate('/admin-panel');
                    } else
                    if (response.data.role === 'usuario') {
                        navigate('/home');
                    }
                }, 2000);
            } else {
                setError('Algo salió mal. Por favor, inténtalo de nuevo.');
            }
        } catch (error) {
            console.error(error);
            if (error.response && error.response.status === 401) {
                setError('Credenciales inválidas. Por favor, inténtalo de nuevo.');
            } else {
                setError('Error en el inicio de sesión.');
            }
        }
    };

    return (
        <div className="container mt-5 ">
            <h2 className="text-center">Iniciar Sesión</h2>
            <div className="row justify-content-center mt-4">



                <div className="col-md-6">

                    {/* Mostrar mensaje de éxito */}
                    {successMessage && (
                        <div className="alert alert-success" role="alert">
                            {successMessage}
                        </div>
                    )}

                    {/* Mostrar mensaje de error */}
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="border p-4 rounded shadow">
                        <div className="mb-3">
                            <label htmlFor="text" className="form-label">RUT</label>
                            <input
                                type="text"
                                id="rut_persona"
                                className="form-control"
                                value={rut_persona}
                                onChange={(e) => setRut_persona(e.target.value)}
                                placeholder="Ingresa tu RUT"
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">Contraseña</label>
                            <input
                                type="password"
                                id="contrasena"
                                className="form-control"
                                value={contrasena}
                                onChange={(e) => setContrasena(e.target.value)}
                                placeholder="Ingresa tu contraseña"
                                required
                            />
                        </div>



                        <button type="submit" className="btn btn-primary w-100">Iniciar Sesión</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;