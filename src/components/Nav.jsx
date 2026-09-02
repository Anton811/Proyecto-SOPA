import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/nav.css";
import { supabase } from "../utils/supabase";
import { useTheme } from "../App";

export default function Nav() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const loadDisplayName = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const metadata = user?.user_metadata;
      const name = metadata?.display_name || metadata?.full_name || metadata?.name;

      if (name) setDisplayName(name);
    };

    loadDisplayName();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();

    navigate("/");
  };
  return (
    <nav className="app-nav">
      <div className="nav-top-row">
        <div className="nav-brand">
          <h1>{displayName ? `Bienvenido, ${displayName}` : "Tu lista"}</h1>
        </div>

        <label
          className="theme-control"
          title={theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
        >
          <span aria-hidden="true">☀</span>
          <input
            type="checkbox"
            checked={theme === "dark"}
            onChange={(event) => setTheme(event.target.checked ? "dark" : "light")}
            aria-label={theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
          />
          <span className="theme-switch" aria-hidden="true">
            <span />
          </span>
          <span aria-hidden="true">☾</span>
        </label>
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
