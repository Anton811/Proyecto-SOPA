import React, { useEffect, useState } from "react";
import Box from "../components/Box";
import Nav from "../components/Nav";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";

export default function Dashboard() {
  const status = ["Disponible", "Pendiente", "No disponible"];
  const category = ["Electronica", "Ropa", "Hogar", "Salud"];
  const priority = ["Media", "Alta", "Baja"];
  const navigate = useNavigate();

  const [product, setProduct] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    insertProducts();
  }, []);

  const insertProducts = async () => {
    try {
      const user = await getUser();
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id_user", user)
        .order("time_created", { ascending: true });

      if (error) throw error;

      setProduct(data || []);
    } catch (error) {
      console.error("error en solicitud de productos", error);
      setProduct([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getUser = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) console.error("error:", error);

    if (user) return user.id;
  };

  const handleDelete = async (id, name) => {
    if (confirm(`Desea eliminar de manea permanete el ${name}?`)) {
      const { data, error } = await supabase.from("products").delete().eq("id", id);
      if (error) return console.error("Error al borrar producto:", error);

      alert(`${name} eliminado correctamente`);
      insertProducts();
      return;
    }
  };

  return (
    <>
      <Nav />
      <main>
        <section className="dashboard-intro">
          <div>
            <h1>Mi lista</h1>
            <p>Guarda los productos que te gustaría tener, comparar o recordar más tarde.</p>
          </div>
          <button
            className="btn btn-primary dashboard-add-btn"
            onClick={() => navigate("/product/add")}
          >
            Agregar producto
          </button>
        </section>

        {isLoading ? (
          <div className="dashboard-empty">
            <p>Cargando tus productos...</p>
          </div>
        ) : product.length === 0 ? (
          <div className="dashboard-empty dashboard-empty--featured">
            <h2>Aún no tienes productos guardados</h2>
            <p>Empieza a crear tu primera lista con los artículos que más te gusten.</p>
            <button className="btn btn-primary" onClick={() => navigate("/product/add")}>
              Añadir mi primer producto
            </button>
          </div>
        ) : (
          <div className="box-list">
            {product.map((product) => (
              <Box key={product.id}>
                <a href={`/product/${product.id}`} className="link-products">
                  <h1>{product.name}</h1>
                </a>
                <div className="box-row">
                  <span className={`status status-${product.status}`}>
                    {status[product.status]}
                  </span>
                </div>

                <div className="box-row">
                  <span>Precio:</span>
                  <strong>${product.price}</strong>
                </div>

                <div className="box-row">
                  <span>Categoria:</span>
                  <span>{category[product.category]}</span>
                </div>

                <div className="box-row">
                  <span>Importancia:</span>
                  <span>{priority[product.priority]}</span>
                </div>

                <div className="box-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    Ver más
                  </button>
                  <button
                    className="btn btn-cancel"
                    onClick={() => handleDelete(product.id, product.name)}
                  >
                    Eliminar
                  </button>
                </div>
              </Box>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
