import React, { useState } from 'react';
import api from '../services/api';  // Importar la instancia de Axios
import { useNavigate } from 'react-router-dom';  // Para redirigir al usuario después del registro

const Register = () => {
    const [formData, setFormData] = useState({
        rut_persona: '',
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        contrasena: '',

    });

    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Datos del formulario',formData);
    
        try {
            const response = await api.post('/create_user', formData);
            console.log('Respuesta del servidor:', response.data); // Imprimir respuesta del servidor
            setSuccessMessage(response.data.message);
            setErrorMessage(''); // Limpiar el mensaje de error si el registro es exitoso
            setTimeout(() => navigate('/login'), 2000); // Redirigir al usuario después de 2 segundos
        } catch (error) {
            console.error('Error en el registro:', error); // Imprimir el error
            setErrorMessage(error.response?.data?.message || 'Error en el registro.');
            setSuccessMessage(''); // Limpiar el mensaje de éxito si hay un error
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">Registrar Usuario</h2>
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
            {successMessage && <div className="alert alert-success">{successMessage}</div>}
            <div className="row justify-content-center">
                <div className="col-md-10">
                    <div className="card shadow">
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">RUT</label>
                                        <input 
                                        type="text"
                                        name="rut_persona"
                                        value={formData.rut_persona}
                                        onChange={handleChange}
                                        className='form-control'
                                        required
                                        />
                                    
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Nombre</label>
                                        <input 
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        className='form-control'
                                        required
                                        />
                                    </div>
                                    
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Apellido paterno</label>
                                        <input
                                        type="text"
                                        name="apellido_paterno"
                                        value={formData.apellido_paterno}
                                        onChange={handleChange}
                                        className='form-control'
                                        required
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Apellido materno</label>
                                        <input 
                                            type="text"
                                            name="apellido_materno"
                                            value={formData.apellido_materno}
                                            onChange={handleChange}
                                            className='form-control'
                                            required
                                        />     
                                    </div>    
                                </div>

                                <div className="mb-3">
                                <label className="form-label">Contraseña</label>
                                <input
                                    type="password"
                                    name="contrasena"
                                    value={formData.contrasena}
                                    onChange={handleChange}
                                    className='form-control'
                                    required
                                />
                                </div>

                                <button type="submit" className="btn btn-primary mt-3">Registrar</button>    
                            </form>
                        </div>
                    </div>
                </div>
        </div>
    </div>    
    );
};
    
export default Register;