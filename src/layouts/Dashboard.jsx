import React, { useEffect, useState } from "react";
import Box from "../components/box";
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
  const status = ["Disponible", "agotado", "No disponible"];
  const category = ["Electronica", "Ropa", "Hogar", "Salud"];
  const priority = ["Normal", "Urgente", "Baja"];
  const navigate = useNavigate();

  const [product, setProduct] = useState([]);

  useEffect(() => {
    insertProducts();
    console.log(product);
  }, []);

  const insertProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id_user", await getUser());

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
              <div className="card-header">
                <h1>{product.name}</h1>
                <span
                  className={`badge badge-${status[product.status].toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {status[product.status]}
                </span>
              </div>

              <div className="flex-container card-row">
                <h5>Precio:</h5>
                <strong>${product.price}</strong>
              </div>

              <div className="flex-container card-row">
                <span>Categoria:</span>
                <span>{category[product.category]}</span>
              </div>

              <div className="flex-container card-row">
                <span>Prioridad:</span>
                <span>{priority[product.priority]}</span>
              </div>

              <button
                className="btn btn-principal btn-block"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                Ver más
              </button>
            </Box>
          ))}
        </div>
      </main>
    </>
  );
}
