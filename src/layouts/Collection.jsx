import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Nav from "../components/Nav";
import Box from "../components/Box";
import { supabase } from "../utils/supabase";

export default function Collection() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const status = ["Disponible", "Pendiente", "No disponible"];
  const category = ["Electronica", "Ropa", "Hogar", "Salud"];
  const priority = ["Media", "Alta", "Baja"];

  useEffect(() => {
    fetchCollectionData();
  }, [id]);

  const getUser = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) console.error(error);
    if (user) return user.id;
  };

  const fetchCollectionData = async () => {
    try {
      const user = await getUser();

      const { data: collectionData, error: collectionError } = await supabase
        .from("container")
        .select("*")
        .eq("id", id)
        .eq("id_user", user)
        .single();

      if (collectionError) throw collectionError;

      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("id_user", user)
        .eq("container", Number(id))
        .order("time_created", { ascending: true });

      if (productsError) throw productsError;

      setCollection(collectionData);
      setProducts(productsData || []);
    } catch (error) {
      console.error("Error cargando colección:", error);
      setCollection(null);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (productId, productName) => {
    if (window.confirm(`Desea eliminar de manera permanente el ${productName}?`)) {
      const { error } = await supabase.from("products").delete().eq("id", productId);

      if (error) {
        console.error("Error al borrar producto:", error);
        return;
      }

      fetchCollectionData();
    }
  };

  return (
    <>
      <Nav />
      <main className="collection-page">
        {isLoading ? (
          <div className="dashboard-empty">
            <p>Cargando colección...</p>
          </div>
        ) : !collection ? (
          <div className="dashboard-empty dashboard-empty--featured">
            <h2>No se encontró esta colección</h2>
            <p>La colección que buscas no existe o no tienes permisos para verla.</p>
            <button className="btn btn-primary" onClick={() => navigate("/dashboard")}>
              Volver al dashboard
            </button>
          </div>
        ) : (
          <>
            <div className="collection-header">
              <div>
                <h1>{collection.name}</h1>
                <p>Productos guardados en esta colección.</p>
              </div>
              <button className="btn btn-primary" onClick={() => navigate("/dashboard")}>
                Volver a colecciones
              </button>
            </div>

            {products.length === 0 ? (
              <div className="dashboard-empty dashboard-empty--featured">
                <h2>No hay productos aquí todavía</h2>
                <p>Agrega un producto y asócialo a esta colección para verlo aquí.</p>
                <button className="btn btn-primary" onClick={() => navigate("/product/add")}>
                  Agregar producto
                </button>
              </div>
            ) : (
              <div className="box-list">
                {products.map((product) => (
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
                      <span>Categoría:</span>
                      <span>{category[product.category] || "Sin categoría"}</span>
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
          </>
        )}
      </main>
    </>
  );
}
