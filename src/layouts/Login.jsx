import React, { useState } from "react";
import "../css/login.css";
import "../css/global.css";
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
      <div className="login-card container">
        <header className="login-header">
          <h1 className="login-title">Inicio de Sesión</h1>
          <p className="login-sub">Accede a tu panel para gestionar la aplicación</p>
        </header>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="input-form">
            <label htmlFor="email">Usuario</label>
            <input
              className="input"
              type="email"
              name="email"
              id="email"
              value={input.email || ""}
              onChange={handleChange}
              required
              aria-label="email"
              placeholder="tu@correo.com"
            />
          </div>

          <div className="input-form">
            <label htmlFor="password">Contraseña</label>
            <input
              className="input"
              type="password"
              name="password"
              id="password"
              value={input.password || ""}
              onChange={handleChange}
              required
              aria-label="password"
              placeholder="********"
            />
          </div>

          <div className="form-actions">
            <input type="submit" value="Iniciar Sesión" className="btn btn-primary" />
          </div>
        </form>
      </div>
    </main>
  );
}
