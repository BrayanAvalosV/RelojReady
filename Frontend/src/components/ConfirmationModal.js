import React from 'react';
import Modal from 'react-modal';

const ConfirmationModal = ({ isModalOpen, setIsModalOpen, activeAction, rowsToEdit, applyChanges }) => {
    return (
        <Modal
            isOpen={isModalOpen}
            onRequestClose={() => setIsModalOpen(false)}
            contentLabel="Confirmación de Cambios"
            style={{
                content: {
                    maxWidth: '500px',
                    margin: 'auto',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid #ccc',
                }
            }}
        >
            <h2 style={{ textAlign: 'center' }}>
                {activeAction === 'edit' ? 'Confirmar Edición' : activeAction === 'delete' ? 'Confirmar Eliminación' : 'Acción'}
            </h2>
            {activeAction === 'ajuste' && (
                <p style={{ textAlign: 'center', color: '#dc3545', fontWeight: 'bold', marginBottom: '20px' }}>
                    ⚠️ Asegúrese que los registros múltiples han sido tratados
                </p>
            )}
            <p>
                {activeAction === 'edit'
                    ? 'Las siguientes filas serán editadas:'
                    : activeAction === 'delete'
                    ? 'Las siguientes filas serán eliminadas:'
                    : 'Detalles de la acción:'}
            </p>
            <ul style={{ paddingLeft: '20px' }}>
                {rowsToEdit.map((row, index) => (
                    <li key={index}>
                        Día: {row['Día']}, RUT: {row['RUT']}, hora_reloj: {row['hora_reloj']}
                        {activeAction === 'edit' && (
                            <>
                                <br />
                                <strong>Nuevos valores:</strong>
                                <span style={{ color: '#28a745' }}>
                                    Día: {row.newDay || row['Día']}, Nueva hora_reloj: {row.newHour || row['Hora Salida']}
                                </span>
                            </>
                        )}
                    </li>
                ))}
            </ul>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <button
                    onClick={applyChanges}
                    style={{
                        padding: '10px 20px',
                        marginRight: '10px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    Confirmar
                </button>
                <button
                    onClick={() => setIsModalOpen(false)}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    Cancelar
                </button>
            </div>
        </Modal>
    );
};

export default ConfirmationModal;
