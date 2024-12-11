// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './components/Register';
import AdminPanel from './pages/AdminPanel';
import UploadComponent from './components/UploadComponent';
import HorarioUploadComponent from './components/HorarioUploadComponent';
import Home from './pages/Home';
import LogsPage from './components/LogsPage';
import Navbar from './components/Navbar';
import DataTable from './components/DataTable';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
    const [currentPage, setCurrentPage] = useState('home');

    return (
        <Router>
            <div className="d-flex flex-column min-vh-100">
                <Navbar />
                <div className="flex-fill">
                    <Routes>
                        <Route path="/" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/admin-panel" element={<AdminPanel />} />
                        {/* Integración de componentes de carga */}
                        <Route
                            path="home"
                            element={<Home />}
                        />
                        <Route
                            path="/carga-reloj"
                            element={<UploadComponent />}
                        />
                        <Route
                            path="/carga-horario"
                            element={<HorarioUploadComponent />}
                        />
                        <Route
                            path='/datatable'
                            element={<DataTable />}
                        /> 
                        <Route
                            path='/logs'
                            element={<LogsPage />}
                        />    
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;