import React from 'react';
import { useDropzone } from 'react-dropzone';

const UploadComponent = () => {
    const [reloj, setReloj] = React.useState(null);
    const [message, setMessage] = React.useState('');

    const onDropReloj = (acceptedFiles) => {
        const selectedFile = acceptedFiles[0];
        setReloj(selectedFile);
        setMessage('');
    };

    const confirmUpload = () => {
        const confirmation = window.confirm(`¿Está seguro que desea subir el archivo: ${reloj.name}?`);
        if (confirmation) {
            uploadFile(reloj);
        }
    };

    const uploadFile = (file) => {
        const formData = new FormData();
        formData.append('file', file);
    
        fetch('http://localhost:5000/upload-reloj', {
            method: 'POST',
            body: formData,
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                setMessage(`Error: ${data.error}`);
            } else {
                setMessage(`Archivo subido exitosamente!`);
            }
        })
        .catch(error => {
            console.error('Error al subir el archivo:', error);
            setMessage('Error al subir el archivo. Inténtalo de nuevo.');
        });
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop: onDropReloj });

    return (
        <div style={{ textAlign: 'center' }}>
            <h2>Carga Reloj</h2>
            <div className="upload-area" {...getRootProps()} style={{ border: '2px dashed #007BFF', padding: '20px', borderRadius: '10px' }}>
                <input {...getInputProps()} />
                <img src={`${process.env.PUBLIC_URL}/file-icon.png`} alt="File icon" style={{ width: '50px', marginBottom: '10px' }} />
                {reloj ? <p>Archivo reloj seleccionado: {reloj.name}</p> : <p>Arrastra y suelta el archivo aquí, o haz clic para seleccionar uno</p>}
            </div>
            {message && <p>{message}</p>}
            <button onClick={confirmUpload} disabled={!reloj} style={{ marginTop: '20px', display: 'block', margin: '20px auto' }}>
                Confirmar subida
            </button>
            <button onClick={() => window.location.href = '/'} style={{ marginTop: '20px', display: 'block', margin: '20px auto' }}>
                Regresar al Home
            </button>
        </div>
    );
};

export default UploadComponent;