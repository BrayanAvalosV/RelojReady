import React from 'react';
import { useDropzone } from 'react-dropzone';


const UploadComponent = () => {
    const [reloj, setReloj] = React.useState(null);
    const [message, setMessage] = React.useState('');
    const [isProcessing, setIsProcessing] = React.useState(false); // Control del estado de procesamiento

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

        setIsProcessing(true); // Inicia el proceso y deshabilita interacciones

        // Subir el archivo al servidor Flask
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
                    setIsProcessing(false); // Habilitar acciones en caso de error
                } else {
                    setMessage(`Archivo subido exitosamente!`);
                    // Llamar a la primera API para obtener datos
                    return fetch('http://localhost:5000/data', { method: 'GET' });
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al llamar la API /api/data');
                }
                return response.json();
            })
            .then(data => {
                setMessage('Datos cargados a MongoDB. Procesando ajustes...');
                // Llamar a la segunda API para procesar datos
                return fetch('http://localhost:5000/process_data', { method: 'GET' });
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al llamar la API /process_data');
                }
                setMessage('Datos procesados correctamente.');
            })
            .catch(error => {
                console.error('Error en el flujo de procesamiento:', error);
                setMessage('Hubo un error en el proceso. Inténtalo de nuevo.');
            })
            .finally(() => {
                setIsProcessing(false); // Finalizar el proceso, habilitando botones
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
            <button
                onClick={confirmUpload}
                disabled={!reloj || isProcessing} // Deshabilitar si el archivo no está seleccionado o el proceso está en marcha
                style={{ marginTop: '20px', display: 'block', margin: '20px auto' }}
            >
                {isProcessing ? 'Procesando...' : 'Confirmar subida'}
            </button>
            <button
                onClick={() => window.location.href = '/'}
                style={{ marginTop: '20px', display: 'block', margin: '20px auto' }}
            >
                Regresar al Home
            </button>
        </div>
    );
};

export default UploadComponent;