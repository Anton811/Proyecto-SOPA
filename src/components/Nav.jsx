import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/nav.css";
import { supabase } from "../utils/supabase";

export default function Nav() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();

    navigate("/");
  };
  return (
    <nav className="app-nav">
      <div className="nav-brand">
        <h1>Hola, Eduardo!</h1>
        <p>Bienvenido al panel de SOPA.</p>
      </div>

      <div className="nav-actions">
        <Link to="/dashboard" className="nav-link">
          Dashboard
        </Link>
        <div className="nav-buttons">
          <button onClick={() => navigate("/product/add")} className="btn btn-primary">
            Añadir Producto
          </button>
          <button onClick={handleSignOut} className="btn btn-secondary">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
}
