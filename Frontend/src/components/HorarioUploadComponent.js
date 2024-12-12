import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Navigate } from 'react-router-dom';

const HorarioUploadComponent = () => {
    const [horario1, setHorario1] = React.useState(null);
    const [horario2, setHorario2] = React.useState(null);
    const [message, setMessage] = React.useState('');

    const onDropHorario1 = (acceptedFiles) => {
        const selectedFile = acceptedFiles[0];
        setHorario1(selectedFile);
        setMessage('');
    };

    const onDropHorario2 = (acceptedFiles) => {
        const selectedFile = acceptedFiles[0];
        setHorario2(selectedFile);
        setMessage('');
    };

    const confirmUpload = () => {
        const confirmation = window.confirm(`¿Está seguro que desea subir los archivos: ${horario1.name} y ${horario2.name}?`);
        if (confirmation) {
            uploadFiles();
        }
    };

    const uploadFiles = () => {
        const formData = new FormData();
        formData.append('horario1', horario1);
        formData.append('horario2', horario2);

        fetch('http://localhost:5000/upload-horario', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                setMessage(`Error: ${data.error}`);
            } else {
                setMessage(`Archivos subidos exitosamente!`);
                setHorario1(null);
                setHorario2(null);
            }
        })
        .catch(error => {
            console.error('Error al subir el archivo:', error);
            setMessage('Error al subir el archivo. Inténtalo de nuevo.');
        });
    };

    const { getRootProps: getRootPropsHorario1, getInputProps: getInputPropsHorario1 } = useDropzone({ onDrop: onDropHorario1 });
    const { getRootProps: getRootPropsHorario2, getInputProps: getInputPropsHorario2 } = useDropzone({ onDrop: onDropHorario2 });

    return (
        <div style={{ textAlign: 'center' }}>
            <h2>Carga Horarios</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0 auto', maxWidth: '800px' }}>
                <div className="upload-area" {...getRootPropsHorario1()} style={{ width: '45%' }}>
                    <input {...getInputPropsHorario1()} />
                    <img src={`${process.env.PUBLIC_URL}/file-icon.png`} alt="File icon" />
                    {horario1 ? <p>Archivo horario 1 seleccionado: {horario1.name}</p> : <p>Arrastra y suelta el archivo horarios Creados aquí, o haz clic para seleccionar uno</p>}
                </div>
                <div className="upload-area" {...getRootPropsHorario2()} style={{ width: '45%' }}>
                    <input {...getInputPropsHorario2()} />
                    <img src={`${process.env.PUBLIC_URL}/file-icon.png`} alt="File icon" />
                    {horario2 ? <p>Archivo horario 2 seleccionado: {horario2.name}</p> : <p>Arrastra y suelta el archivo horarios Asignados aquí, o haz clic para seleccionar uno</p>}
                </div>
            </div>
            {message && <p>{message}</p>}
            <button onClick={confirmUpload} disabled={!horario1 || !horario2} style={{ marginTop: '20px', display: 'block', margin: '20px auto' }}>
                Confirmar subida
            </button>
            <button onClick={() => window.location.href = '/home'} style={{ marginTop: '20px', display: 'block', margin: '20px auto' }}>
                Regresar al Home
            </button>
        </div>
    );
};

export default HorarioUploadComponent;