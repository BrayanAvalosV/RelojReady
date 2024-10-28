// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './components/Register';
import AdminPanel from './pages/AdminPanel'; // Importamos el nuevo componente
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function App() {
    return (
        <Router>
            <div className="d-flex flex-column min-vh-100">
                <div className="flex-fill"> {/* Este div permite que el contenido crezca */}
                    <Routes>
                        <Route path="/" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/admin-panel" element={<AdminPanel />} />
                        
                        
                        {/* Agrega más rutas aquí */}
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;