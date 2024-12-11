import React from 'react';
import Modal from 'react-modal';

const ConfigModal = ({ 
    isOpen, 
    onClose, 
    varMinutos, 
    setVarMinutos, 
    varHoras, 
    setVarHoras,
    maxHoras = 12,
    maxMinutos = 59 
}) => {
    const handleInputChange = (setter,maxValue) => (e) => {
        const value = Math.min(maxValue, Math.max(0, Number(e.target.value))); // Entre 0 y maxValue
        setter(value);
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Configurar Minutos y Horas"
            style={{
                content: {
                    maxWidth: '400px',
                    margin: 'auto',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid #ccc',
                    height: '400px',
                }
            }}
        >
            {/* Botón de cierre (X) */}
            <button
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'red',
                    border: 'none',
                    fontSize: '10px',
                    cursor: 'pointer',
                }}
            >
                ✖
            </button>

            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Configurar Valores</h2>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    onClose();
                }}
            >
                <label style={{ display: 'block', marginBottom: '10px' }}>
                    Minutos en Marcaje múltiple:
                    <input
                        type="number"
                        value={varMinutos}
                        onChange={handleInputChange(setVarMinutos, 59)}
                        style={{ width: '100%', padding: '5px' }}
                    />
                </label>
                <label style={{ display: 'block', marginBottom: '10px' }}>
                    Horas en Ajustar entrada/salida Incorrecta:
                    <input
                        type="number"
                        value={varHoras}
                        onChange={handleInputChange(setVarHoras, 12)}
                        style={{ width: '100%', padding: '5px' }}
                    />
                </label>
                <button
                    type="submit"
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        width: '100%',
                    }}
                >
                    Guardar
                </button>
            </form>
        </Modal>
    );
};

export default ConfigModal;
