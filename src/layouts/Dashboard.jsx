import React, { useEffect, useState } from "react";
import Box from "../components/Box";
import Nav from "../components/Nav";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";

const products = [
  {
    id: 1,
    name: "IPhone 17 Pro Max",
    price: "$15,000",
    status: "Disponible",
    category: "Electrónica",
    priority: "Urgente",
  },
  {
    id: 2,
    name: "Auriculares Inalámbricos X2",
    price: "$2,499",
    status: "Disponible",
    category: "Accesorios",
    priority: "Normal",
  },
  {
    id: 3,
    name: "Smartwatch Pulsar",
    price: "$4,200",
    status: "Agotado",
    category: "Wearables",
    priority: "Alta",
  },
  {
    id: 4,
    name: "Tablet Nova 12",
    price: "$8,300",
    status: "Disponible",
    category: "Electrónica",
    priority: "Normal",
  },
];

export default function Dashboard() {
  const status = ["Disponible", "No disponible", "Agotado"];
  const category = ["Electronica", "Ropa", "Hogar", "Salud"];
  const priority = ["Normal", "Urgente", "Baja"];
  const navigate = useNavigate();

  const [product, setProduct] = useState([]);

  useEffect(() => {
    insertProducts();
  }, []);

  const insertProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id_user", await getUser())
      .order("time_created", { ascending: true });

    if (error) return console.error("error en solicitud de productos", error);

    if (data) setProduct(data);
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
          <h1>Productos disponibles</h1>
          <p>Revisa el estado de los productos y abre la ficha para ver más detalles.</p>
        </section>

        <div className="box-list">
          {product.map((product) => (
            <Box key={product.id}>
              <h1>{product.name}</h1>
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
                <span>Prioridad:</span>
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
      </main>
    </>
  );
}
