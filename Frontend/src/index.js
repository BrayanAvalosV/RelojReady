import React from 'react';
import ReactDOM from 'react-dom/client'; // Cambiar esta línea
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';

import { UserProvider } from './contexts/UserContext'; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <UserProvider>
        <App />
        </UserProvider>
    </React.StrictMode>
);