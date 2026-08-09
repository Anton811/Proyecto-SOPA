import React, { useState } from "react";
import "../css/login.css";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";

export default function Login() {
  const navigate = useNavigate();
  const [input, setInput] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInput({ ...input, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) return alert("Error en los datos del usuario");

    navigate("/dashboard");
  };

  return (
    <main className="login-main">
      <div className="container">
        <h1>Inicio de Sesion</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-form">
            <label htmlFor="">Usuario</label>
            <input
              type="email"
              name="email"
              id="email"
              value={input.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-form">
            <label htmlFor="">Contraseña</label>
            <input
              type="password"
              name="password"
              id="password"
              value={input.password}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <input type="submit" value="Iniciar Sesion" className="btn" />
          </div>
        </form>
      </div>
    </main>
  );
}
