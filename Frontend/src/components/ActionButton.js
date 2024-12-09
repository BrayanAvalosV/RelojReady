import React from 'react';

const ActionButton = ({ title, description, onClick, buttonText }) => {
    return (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h3>{title}</h3>
            <p>{description}</p>
            <button
                onClick={onClick}
                title={description}
                style={{
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    minWidth: '200px',
                    cursor: 'pointer',
                    marginTop: '1px', // Espacio entre el texto y el botón
                }}
            >
                {buttonText}
            </button>
        </div>
    );
};

export default ActionButton;
