import React, { useState } from 'react';

function Login() {
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const response = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rut, password })
    });
    const data = await response.json();
    console.log(data);
  };

  return (
    <form onSubmit={handleLogin}>
      <input type="text" placeholder="RUT" value={rut} onChange={(e) => setRut(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;
