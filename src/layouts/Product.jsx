import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Nav from "../components/Nav";
import { supabase } from "../utils/supabase";
import "../css/product.css";

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState({});
  const [initialProduct, setInitialProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modify, setModify] = useState(false);
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
    if (id === "add") {
      const newProduct = {
        id_user: await getUser(),
        name: "",
        price: "",
        status: 1,
        category: 1,
        priority: 1,
        url: "",
        description: "",
      };

      setProduct(newProduct);
      setInitialProduct(newProduct);
      setModify(true);
      return;
    }

    const { data, error } = await supabase.from("products").select("*").eq("id", id);

    if (error) return console.error("Error:", error);

    setProduct(data[0]);
    setInitialProduct(data[0]);
    setModify(false);
  };
  const handleChange = (event) => {
    const { name, value } = event.target;
    const numericFields = ["price", "status", "category", "priority"];

    setProduct((current) => ({
      ...current,
      [name]: numericFields.includes(name) ? Number(value) : value,
    }));
  };

  const handleCancel = () => {
    if (initialProduct) {
      setProduct(initialProduct);
    }
    setModify(false);
  };

  const handleModify = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setModify(true);
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
                    disabled={!modify}
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
                      disabled={!modify}
                    />
                  </label>
                  <label>
                    Estado
                    <div className="status-list">
                      <label
                        className={`status-option status-option--available ${
                          product.status === 0 ? "is-selected" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="status"
                          value={0}
                          checked={product.status === 0}
                          onChange={handleChange}
                          disabled={!modify}
                        />
                        <span>Disponible</span>
                      </label>
                      <label
                        className={`status-option status-option--unavailable ${
                          product.status === 1 ? "is-selected" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="status"
                          value={1}
                          checked={product.status === 1}
                          onChange={handleChange}
                          disabled={!modify}
                        />
                        <span>Pendiente</span>
                      </label>
                      <label
                        className={`status-option status-option--out ${
                          product.status === 2 ? "is-selected" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="status"
                          value={2}
                          checked={product.status === 2}
                          onChange={handleChange}
                          disabled={!modify}
                        />
                        <span>No disponible</span>
                      </label>
                    </div>
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
                      disabled={!modify}
                    >
                      <option value={0}>Electrónica</option>
                      <option value={1}>Ropa</option>
                      <option value={2}>Hogar</option>
                      <option value={3}>Salud</option>
                    </select>
                  </label>
                  <label>
                    Importancia
                    <div className="status-list">
                      <label
                        className={`status-option status-option--available ${
                          product.priority === 0 ? "is-selected" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="priority"
                          value={0}
                          checked={product.priority === 0}
                          onChange={handleChange}
                          disabled={!modify}
                        />
                        <span>Media</span>
                      </label>
                      <label
                        className={`status-option status-option--unavailable ${
                          product.priority === 1 ? "is-selected" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="priority"
                          value={1}
                          checked={product.priority === 1}
                          onChange={handleChange}
                          disabled={!modify}
                        />
                        <span>Alta</span>
                      </label>
                      <label
                        className={`status-option status-option--out ${
                          product.priority === 2 ? "is-selected" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="priority"
                          value={2}
                          checked={product.priority === 2}
                          onChange={handleChange}
                          disabled={!modify}
                        />
                        <span>Baja</span>
                      </label>
                    </div>
                  </label>
                </div>

                <label>
                  URL
                  {!modify ? (
                    product.url ? (
                      <a
                        href={
                          product.url.startsWith("http")
                            ? product.url
                            : `https://${product.url}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="product-url-link"
                      >
                        {product.url}
                      </a>
                    ) : (
                      <span className="product-url-placeholder">Sin enlace</span>
                    )
                  ) : (
                    <input
                      type="url"
                      name="url"
                      value={product.url || ""}
                      onChange={handleChange}
                      placeholder="https://ejemplo.com"
                      className="input"
                    />
                  )}
                </label>

                <label>
                  Nota personal
                  <textarea
                    name="description"
                    value={product.description}
                    onChange={handleChange}
                    placeholder="Escribe una nota o detalle personal sobre este producto"
                    className="textarea input"
                    disabled={!modify}
                  />
                </label>

                <div className="form-actions">
                  {modify ? (
                    <>
                      <button type="button" className="btn btn-cancel" onClick={handleCancel}>
                        Cancelar
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Guardar producto
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="btn btn-cancel"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          navigate(-1);
                        }}
                      >
                        Regresar
                      </button>
                      <button type="button" className="btn btn-primary" onClick={handleModify}>
                        Modificar producto
                      </button>
                    </>
                  )}
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
