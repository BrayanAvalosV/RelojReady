
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';  // Asegúrate de que esto esté correctamente configurado
import { Modal } from 'react-bootstrap';

const AdminPanel = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUser, setCurrentUser] = useState({
        rut_persona: '',
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        contrasena: '',
        rol: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        const role = localStorage.getItem('userRole');
        const isAuthenticated = localStorage.getItem('isAuthenticated');

        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (role !== 'administrador') {
            alert('No tienes permiso para acceder a esta página.');
            navigate('/');
            return;
        }

        const fetchUsuarios = async () => {
            try {
                const response = await api.get('/admin');
                setUsuarios(response.data);
            } catch (error) {
                setError('Error al cargar los usuarios');
            }
        };

        fetchUsuarios();
    }, [navigate]);

    const eliminarUsuario = async (rut_persona) => {
        try {
            await api.delete(`/delete_client/${rut_persona}`);
            setSuccessMessage('Usuario eliminado correctamente');
            setUsuarios(usuarios.filter(user => user.rut_persona !== rut_persona));
        } catch (error) {
            setError('Error al eliminar el usuario');
        }
    };

    const handleShowModal = (usuario = null) => {
        if (usuario) {
            setIsEditing(true);
            setCurrentUser(usuario);
        } else {
            setIsEditing(false);
            setCurrentUser({
                rut_persona: '',
                nombre: '',
                apellido_paterno: '',
                apellido_materno: '',
                contrasena: '',
                rol: ''
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentUser(null);
    };

    const handleEditUser = async () => {
        try {
            // Actualiza el usuario, utilizando el correo actual
            await api.put(`/edit_client/${currentUser.rut_persona}`, currentUser);
            setSuccessMessage('Usuario actualizado correctamente');
            setUsuarios(usuarios.map(user => user.rut_persona === currentUser.rut_persona ? currentUser : user));
            handleCloseModal();
        } catch (error) {
            setError('Error al actualizar el usuario');
        }
    };

    const handleCreateUser = async () => {
        try {
            await api.post('/create_client', currentUser);
            setSuccessMessage('Usuario creado correctamente');
            setUsuarios([...usuarios, currentUser]);
            handleCloseModal();
        } catch (error) {
            setError('Error al crear el usuario');
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center mt-4">Panel de Control del Administrador</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            {successMessage && <div className="alert alert-success">{successMessage}</div>}



            <table className="table table-striped table-hover">
                <thead className="thead-dark">
                    <tr>
                        <th>RUT</th>
                        <th>Nombre</th>
                        <th>Apellido paterno</th>
                        <th>Apellido materno</th>
                        <th>Rol</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.map(usuario => (
                        <tr className="mb-1" key={usuario.email}>
                            <td>{usuario.rut_persona}</td>
                            <td>{usuario.nombre}</td>
                            <td>{usuario.apellido_paterno}</td>
                            <td>{usuario.apellido_materno}</td>
                            <td>{usuario.rol}</td>
                            <td>
                                <button className="btn btn-info btn-sm me-2 mb-1" onClick={() => handleShowModal(usuario)}>Editar</button>
                                <button className="btn btn-danger btn-sm mb-md-1" onClick={() => eliminarUsuario(usuario.email)}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {/* Botón para crear un nuevo usuario */}
            <button className="btn btn-primary mb-3" onClick={() => handleShowModal()}>Crear Nuevo Usuario</button>
            {/* Modal para crear/editar usuario */}
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {currentUser && (
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label htmlFor="rut_persona" className="form-label">RUT</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="rut_persona"
                                    value={currentUser.rut_persona}
                                    onChange={(e) => setCurrentUser({ ...currentUser, rut_persona: e.target.value })}
                                    disabled={isEditing}  // Aquí estamos bloqueando el campo si se está editando
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label htmlFor="nombre" className="form-label">Nombre</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="nombre"
                                    value={currentUser.nombre}
                                    onChange={(e) => setCurrentUser({ ...currentUser, nombre: e.target.value })}
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label htmlFor="apellido paterno" className="form-label">Apellido paterno</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="apellido paterno"
                                    value={currentUser.apellido_paterno}
                                    onChange={(e) => setCurrentUser({ ...currentUser, apellido_paterno: e.target.value })}
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label htmlFor="apellido materno" className="form-label">Apellido materno</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="apellido materno"
                                    value={currentUser.apellido_materno}
                                    onChange={(e) => setCurrentUser({ ...currentUser, apellido_materno: e.target.value })}
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label htmlFor="contrasena" className="form-label">Contraseña</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    id="contrasena"
                                    value={currentUser.contrasena}
                                    onChange={(e) => setCurrentUser({ ...currentUser, contrasena: e.target.value })}
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label htmlFor="rol" className="form-label">Rol</label>
                                <select
                                    className="form-select"
                                    id="rol"
                                    value={currentUser.rol}
                                    onChange={(e) => setCurrentUser({ ...currentUser, rol: e.target.value })}
                                >
                                    <option value="">Selecciona un rol</option>
                                    <option value="usuario">Usuario</option>
                                    <option value="administrador">Administrador</option>
                                </select>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn btn-secondary" onClick={handleCloseModal}>Cancelar</button>
                    <button className="btn btn-primary" onClick={isEditing ? handleEditUser : handleCreateUser}>
                        {isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminPanel;