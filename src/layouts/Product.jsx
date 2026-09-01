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
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [modify, setModify] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");

  useEffect(() => {
    searchData();
  }, [id]);

  const getUser = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) console.error(error);

    if (user) return user.id;
  };

  const loadLookups = async () => {
    const user = await getUser();

    if (!user) return { nextCategories: [], nextCollections: [] };

    const [categoriesResult, collectionsResult] = await Promise.all([
      supabase
        .from("categorys")
        .select("*")
        .eq("id_user", user)
        .order("name", { ascending: true }),
      supabase
        .from("container")
        .select("*")
        .eq("id_user", user)
        .order("name", { ascending: true }),
    ]);

    if (categoriesResult.error) {
      console.error("Error al cargar categorías:", categoriesResult.error);
    }

    if (collectionsResult.error) {
      console.error("Error al cargar colecciones:", collectionsResult.error);
    }

    const nextCategories = categoriesResult.data || [];
    const nextCollections = collectionsResult.data || [];

    setCategories(nextCategories);
    setCollections(nextCollections);

    return { nextCategories, nextCollections };
  };

  const searchData = async () => {
    const isCreateMode = id === "add";
    setIsLoading(true);
    setModify(isCreateMode);
    setSelectedCollection("");

    const { nextCategories, nextCollections } = await loadLookups();

    if (isCreateMode) {
      const newProduct = {
        id_user: await getUser(),
        name: "",
        price: "",
        status: 1,
        category: nextCategories[0]?.id ?? "",
        priority: 1,
        url: "",
        description: "",
        container: null,
      };

      setProduct(newProduct);
      setInitialProduct(newProduct);
      setModify(true);
      setSelectedCollection("");
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase.from("products").select("*").eq("id", id);

    if (error) return console.error("Error:", error);

    const productData = data?.[0];
    setProduct(productData || {});
    setInitialProduct(productData || null);
    setSelectedCollection(productData?.container ? String(productData.container) : "");
    setModify(false);
    setIsLoading(false);
  };
  const handleChange = (event) => {
    const { name, value } = event.target;
    const numericFields = ["price", "status", "priority"];
    const optionalNumericFields = ["category", "container"];

    setProduct((current) => ({
      ...current,
      [name]: numericFields.includes(name)
        ? value === ""
          ? null
          : Number(value)
        : optionalNumericFields.includes(name)
          ? value === ""
            ? null
            : Number(value)
          : value,
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

    const payload = { ...product };

    if (
      payload.category === null ||
      payload.category === undefined ||
      payload.category === ""
    ) {
      payload.category = null;
    } else if (categories.length > 0 && !payload.category) {
      payload.category = categories[0].id;
    }

    if (selectedCollection && selectedCollection !== "") {
      payload.container = Number(selectedCollection);
    } else {
      payload.container = null;
    }

    let result;

    if (id == "add") {
      result = await supabase.from("products").insert(payload).select();
    } else {
      result = await supabase.from("products").update(payload).eq("id", id).select();
    }

    const { data, error } = result;

    if (error) console.error("Error: ", error);

    if (data) navigate("/dashboard");
  };

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim();

    if (!name) {
      alert("Escribe un nombre para la categoría");
      return;
    }

    try {
      const user = await getUser();
      const { data, error } = await supabase
        .from("categorys")
        .insert({ id_user: user, name })
        .select();

      if (error) throw error;

      const createdCategory = data?.[0];
      setCategories((current) =>
        [...current, createdCategory].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setProduct((current) => ({ ...current, category: createdCategory.id }));
      setNewCategoryName("");
      setIsCategoryModalOpen(false);
    } catch (error) {
      console.error("Error al crear categoría:", error);
      alert("No se pudo crear la categoría");
    }
  };

  const handleCreateCollection = async () => {
    const name = newCollectionName.trim();

    if (!name) {
      alert("Escribe un nombre para la colección");
      return;
    }

    try {
      const user = await getUser();
      const { data, error } = await supabase
        .from("container")
        .insert({ id_user: user, name })
        .select();

      if (error) throw error;

      const createdCollection = data?.[0];
      setCollections((current) =>
        [...current, createdCollection].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setSelectedCollection(String(createdCollection.id));
      setNewCollectionName("");
      setIsCollectionModalOpen(false);
    } catch (error) {
      console.error("Error al crear colección:", error);
      alert("No se pudo crear la colección");
    }
  };

  const pageTitle = id === "add" ? "Agregar nuevo producto" : "Información del producto";

  return (
    <>
      <Nav />
      <main className="product-main">
        <div className="form-box">
          {isLoading === false ? (
            <>
              <h1>{pageTitle}</h1>
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
                  <label className="field-with-action">
                    Categoría
                    <div className="input-with-button">
                      <select
                        name="category"
                        value={product.category ?? ""}
                        onChange={handleChange}
                        className="input"
                        disabled={!modify || categories.length === 0}
                      >
                        {categories.length === 0 ? (
                          <option value="">Sin categorías</option>
                        ) : (
                          categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))
                        )}
                      </select>
                      <button
                        type="button"
                        className="btn btn-primary input-action-btn"
                        onClick={() => setIsCategoryModalOpen(true)}
                        disabled={!modify}
                      >
                        +
                      </button>
                    </div>
                  </label>
                  <label className="field-with-action">
                    Colección
                    <div className="input-with-button">
                      <select
                        name="container"
                        value={selectedCollection}
                        onChange={(event) => setSelectedCollection(event.target.value)}
                        className="input"
                        disabled={!modify || collections.length === 0}
                      >
                        <option value="">Sin colección</option>
                        {collections.map((collection) => (
                          <option key={collection.id} value={collection.id}>
                            {collection.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="btn btn-primary input-action-btn"
                        onClick={() => setIsCollectionModalOpen(true)}
                        disabled={!modify}
                      >
                        +
                      </button>
                    </div>
                  </label>
                </div>

                <div className="row">
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

      {isCategoryModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsCategoryModalOpen(false)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <h3>Crear categoría</h3>
            <label className="modal-label">
              Nombre de la categoría
              <input
                type="text"
                className="input"
                value={newCategoryName}
                onChange={(event) => setNewCategoryName(event.target.value)}
                placeholder="Ej. Tecnología, Libros, Regalos"
              />
            </label>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-cancel"
                onClick={() => setIsCategoryModalOpen(false)}
              >
                Cancelar
              </button>
              <button type="button" className="btn btn-primary" onClick={handleCreateCategory}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {isCollectionModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsCollectionModalOpen(false)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <h3>Crear colección</h3>
            <label className="modal-label">
              Nombre de la colección
              <input
                type="text"
                className="input"
                value={newCollectionName}
                onChange={(event) => setNewCollectionName(event.target.value)}
                placeholder="Ej. Casa, Viajes, Regalos"
              />
            </label>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-cancel"
                onClick={() => setIsCollectionModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleCreateCollection}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
