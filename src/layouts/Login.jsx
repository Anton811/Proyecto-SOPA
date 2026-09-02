import { useState } from "react";
import "../css/login.css";
import "../css/global.css";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [input, setInput] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInput({ ...input, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) {
      setErrorMessage("Error en los datos del usuario");
      return;
    }

    navigate("/dashboard");
  };

  const handleGoogleLogin = async () => {
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) setErrorMessage("No se pudo iniciar sesión con Google");
  };

  return (
    <main className="login-main">
      <div className="login-card container">
        <header className="login-header">
          <div className="login-brand">
            <img src="/icon512_rounded.png" alt="Logo de la aplicación" />
          </div>
          <h1 className="login-title">Inicio de Sesión</h1>
          <p className="login-sub">Accede a tu panel para gestionar la aplicación</p>
        </header>

        {location.state?.message && (
          <div className="login-alert">{location.state.message}</div>
        )}

        {errorMessage && <div className="login-alert">{errorMessage}</div>}

        <button type="button" className="btn btn-google" onClick={handleGoogleLogin}>
          <span className="google-mark" aria-hidden="true">
            G
          </span>
          Continuar con Google
        </button>

        <div className="login-divider" aria-hidden="true">
          <span>o</span>
        </div>

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
