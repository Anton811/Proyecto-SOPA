import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Nav from "../components/Nav";
import { supabase } from "../utils/supabase";
import "../css/product.css";

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    searchData();
    setIsLoading(false);
  }, []);

  const getUser = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) console.error(error);

    if (user) return user.id;
  };
  const searchData = async () => {
    if (id === "add")
      return setProduct({
        id_user: await getUser(),
        name: "",
        price: "",
        status: 1,
        category: 1,
        priority: 1,
        description: "",
      });

    const { data, error } = await supabase.from("products").select("*").eq("id", id);

    if (error) return console.error("Error:", error);

    setProduct(data[0]);
  };
  const handleChange = (event) => {
    const { name, value } = event.target;
    setProduct((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    let result;

    if (id == "add") {
      result = await supabase.from("products").insert(product).select();
    } else {
      result = await supabase.from("products").update(product).eq("id", id).select();
    }

    const { data, error } = result;

    if (error) console.error("Error: ", error);

    if (data) navigate("/dashboard");
  };

  return (
    <>
      <Nav />
      <main className="product-main">
        <div className="form-box">
          {isLoading === false ? (
            <>
              <h1>Crear nuevo producto</h1>
              <form className="product-form" onSubmit={handleSubmit}>
                <label>
                  Nombre del producto
                  <input
                    type="text"
                    name="name"
                    value={product.name}
                    onChange={handleChange}
                    placeholder="Ej. IPhone 17 Pro Max"
                    autoComplete="off"
                    className="input"
                    required
                  />
                </label>

                <div className="row">
                  <label>
                    Precio
                    <input
                      type="number"
                      name="price"
                      value={product.price}
                      onChange={handleChange}
                      placeholder="15000"
                      className="input"
                    />
                  </label>
                  <label>
                    Estatus
                    <select
                      name="status"
                      value={product.status}
                      onChange={handleChange}
                      className="input"
                    >
                      <option value={0}>Disponible</option>
                      <option value={1}>No disponible</option>
                      <option value={2}>Agotado</option>
                    </select>
                  </label>
                </div>

                <div className="row">
                  <label>
                    Categoría
                    <select
                      name="category"
                      value={product.category}
                      onChange={handleChange}
                      className="input"
                    >
                      <option value={0}>Electrónica</option>
                      <option value={1}>Ropa</option>
                      <option value={2}>Hogar</option>
                      <option value={3}>Salud</option>
                    </select>
                  </label>
                  <label>
                    Prioridad
                    <select
                      name="priority"
                      value={product.priority}
                      onChange={handleChange}
                      className="input"
                    >
                      <option value={0}>Normal</option>
                      <option value={1}>Urgente</option>
                      <option value={2}>Baja</option>
                    </select>
                  </label>
                </div>

                <label>
                  Descripción
                  <textarea
                    name="description"
                    value={product.description}
                    onChange={handleChange}
                    placeholder="Describe las características del producto"
                    className="textarea input"
                  />
                </label>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    Guardar producto
                  </button>
                  <button
                    type="button"
                    className="btn btn-cancel"
                    onClick={() => navigate("/dashboard")}
                  >
                    Cancelar
                  </button>
                </div>

                {successMessage && <p>{successMessage}</p>}
              </form>
            </>
          ) : (
            <>
              <h1>Cargando informacion</h1>
            </>
          )}
        </div>
      </main>
    </>
  );
}
