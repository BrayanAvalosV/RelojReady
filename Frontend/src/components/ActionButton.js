import React from 'react';

const ActionButton = ({ title, description, onClick, buttonText }) => {
    return (
        <div 
            style={{
                textAlign: 'center',
                marginBottom: '20px',
                padding: '10px',
                backgroundColor: '#f9f9f9',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
        >
            {/* Descripción */}
            <p 
                style={{
                    marginBottom: '2px',
                    color: '#555',
                }}
            >
                {description}
            </p>

            {/* Botón */}
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
                    fontSize: '16px',
                    marginTop:'5px'
                }}
            >
                {buttonText}
            </button>
        </div>
    );
};

export default ActionButton;
