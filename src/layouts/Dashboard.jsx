import React, { useEffect, useState } from "react";
import Box from "../components/Box";
import Nav from "../components/Nav";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";

export default function Dashboard() {
  const status = ["Disponible", "Pendiente", "No disponible"];
  const priority = ["Media", "Alta", "Baja"];
  const navigate = useNavigate();

  const [product, setProduct] = useState([]);
  const [containers, setContainers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState("products");
  const [isContainerModalOpen, setIsContainerModalOpen] = useState(false);
  const [newContainerName, setNewContainerName] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [productFilters, setProductFilters] = useState({
    category: "all",
    status: "all",
    priority: "all",
  });
  const [collectionSearch, setCollectionSearch] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    await Promise.all([insertProducts(), getContainers(), getCategories()]);
  };

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

  const getContainers = async () => {
    try {
      const user = await getUser();
      const { data, error } = await supabase
        .from("container")
        .select("*")
        .eq("id_user", user)
        .order("name", { ascending: true });

      if (error) throw error;

      setContainers(data || []);
    } catch (error) {
      console.error("error en solicitud de contenedores", error);
      setContainers([]);
    }
  };

  const getCategories = async () => {
    try {
      const user = await getUser();
      const { data, error } = await supabase
        .from("categorys")
        .select("*")
        .eq("id_user", user)
        .order("name", { ascending: true });

      if (error) throw error;

      setCategories(data || []);
    } catch (error) {
      console.error("error en solicitud de categorías", error);
      setCategories([]);
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

  const handleToggleOwned = async (id, isChecked) => {
    setProduct((current) =>
      current.map((item) => (item.id === id ? { ...item, checked: isChecked } : item)),
    );

    const { error } = await supabase
      .from("products")
      .update({ checked: isChecked })
      .eq("id", id);

    if (error) {
      console.error("Error al actualizar el estado del producto:", error);
      setProduct((current) =>
        current.map((item) => (item.id === id ? { ...item, checked: !isChecked } : item)),
      );
    }
  };

  const handleCreateContainer = async () => {
    const name = newContainerName.trim();

    if (!name) {
      alert("Escribe un nombre para la colección");
      return;
    }

    try {
      const user = await getUser();
      const { error } = await supabase.from("container").insert({
        id_user: user,
        name,
      });

      if (error) throw error;

      setNewContainerName("");
      setIsContainerModalOpen(false);
      getContainers();
    } catch (error) {
      console.error("Error al crear colección:", error);
      alert("No se pudo crear la colección");
    }
  };

  const getProductCountByContainer = (containerId) => {
    return product.filter((item) => item.container === containerId).length;
  };

  const getProductTotalByContainer = (containerId) => {
    return product
      .filter((item) => item.container === containerId)
      .reduce((total, item) => total + (Number(item.price) || 0), 0);
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 2,
    }).format(amount);

  const getCategoryName = (categoryId) => {
    if (categoryId === null || categoryId === undefined || categoryId === "") {
      return "Sin categoría";
    }

    const categoryMatch = categories.find((item) => Number(item.id) === Number(categoryId));
    return categoryMatch ? categoryMatch.name : "Sin categoría";
  };

  const filteredProducts = product.filter((item) => {
    const searchValue = productSearch.trim().toLowerCase();
    const matchesSearch =
      searchValue.length === 0 || item.name?.toLowerCase().includes(searchValue);

    const matchesCategory =
      productFilters.category === "all" ||
      Number(item.category) === Number(productFilters.category);

    const matchesStatus =
      productFilters.status === "all" || Number(item.status) === Number(productFilters.status);

    const matchesPriority =
      productFilters.priority === "all" ||
      Number(item.priority) === Number(productFilters.priority);

    return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  });

  const filteredCollections = containers.filter((container) => {
    const searchValue = collectionSearch.trim().toLowerCase();
    return searchValue.length === 0 || container.name?.toLowerCase().includes(searchValue);
  });

  const resetProductFilters = () => {
    setProductSearch("");
    setProductFilters({ category: "all", status: "all", priority: "all" });
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

        <div className="dashboard-view-switcher">
          <button
            type="button"
            className={`view-tab ${activeView === "products" ? "active" : ""}`}
            onClick={() => setActiveView("products")}
          >
            Productos
          </button>
          <button
            type="button"
            className={`view-tab ${activeView === "containers" ? "active" : ""}`}
            onClick={() => setActiveView("containers")}
          >
            Colecciones
          </button>
        </div>

        <div className="dashboard-layout">
          {activeView === "products" ? (
            <div className="dashboard-main-content dashboard-main-content--full">
              <div className="dashboard-toolbar">
                <input
                  type="text"
                  className="input toolbar-search"
                  value={productSearch}
                  onChange={(event) => setProductSearch(event.target.value)}
                  placeholder="Buscar producto por nombre"
                />

                <div className="filters-row">
                  <select
                    className="input filter-select"
                    value={productFilters.category}
                    onChange={(event) =>
                      setProductFilters((current) => ({
                        ...current,
                        category: event.target.value,
                      }))
                    }
                  >
                    <option value="all">Todas las categorías</option>
                    {categories.map((categoryItem) => (
                      <option key={categoryItem.id} value={categoryItem.id}>
                        {categoryItem.name}
                      </option>
                    ))}
                  </select>

                  <select
                    className="input filter-select"
                    value={productFilters.status}
                    onChange={(event) =>
                      setProductFilters((current) => ({
                        ...current,
                        status: event.target.value,
                      }))
                    }
                  >
                    <option value="all">Todos los estados</option>
                    {status.map((label, index) => (
                      <option key={label} value={index}>
                        {label}
                      </option>
                    ))}
                  </select>

                  <select
                    className="input filter-select"
                    value={productFilters.priority}
                    onChange={(event) =>
                      setProductFilters((current) => ({
                        ...current,
                        priority: event.target.value,
                      }))
                    }
                  >
                    <option value="all">Toda la importancia</option>
                    {priority.map((label, index) => (
                      <option key={label} value={index}>
                        {label}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="btn btn-cancel"
                    onClick={resetProductFilters}
                  >
                    Limpiar
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="dashboard-empty">
                  <div className="loading-state">
                    <span className="loading-spinner" aria-hidden="true" />
                    <span className="loading-message">Cargando tus productos</span>
                  </div>
                </div>
              ) : product.length === 0 ? (
                <div className="dashboard-empty dashboard-empty--featured">
                  <h2>Aún no tienes productos guardados</h2>
                  <p>Empieza a crear tu primera lista con los artículos que más te gusten.</p>
                  <button className="btn btn-primary" onClick={() => navigate("/product/add")}>
                    Añadir mi primer producto
                  </button>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="dashboard-empty dashboard-empty--featured">
                  <h2>No hay productos con esos filtros</h2>
                  <p>
                    Prueba cambiar el nombre o limpiar los filtros para ver más resultados.
                  </p>
                  <button className="btn btn-primary" onClick={resetProductFilters}>
                    Limpiar filtros
                  </button>
                </div>
              ) : (
                <div className="box-list">
                  {filteredProducts.map((productItem) => (
                    <Box key={productItem.id}>
                      <a href={`/product/${productItem.id}`} className="link-products">
                        <h1>{productItem.name}</h1>
                      </a>
                      <div className="box-row">
                        <span className={`status status-${productItem.status}`}>
                          {status[productItem.status]}
                        </span>
                        <label
                          className={`owned-check ${productItem.checked ? "is-checked" : ""}`}
                          title={
                            productItem.checked
                              ? "Marcar como pendiente"
                              : "Marcar como adquirido"
                          }
                          onClick={(event) => event.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={productItem.checked === true}
                            onChange={(event) =>
                              handleToggleOwned(productItem.id, event.target.checked)
                            }
                            aria-label={`${productItem.checked ? "Desmarcar" : "Marcar"} ${productItem.name} como adquirido`}
                          />
                          <span aria-hidden="true">✓</span>
                          <span>{productItem.checked ? "Ya lo tengo" : "Lo quiero"}</span>
                        </label>
                      </div>

                      <div className="box-row">
                        <span>Precio:</span>
                        <strong>${productItem.price}</strong>
                      </div>

                      <div className="box-row">
                        <span>Categoría:</span>
                        <span>{getCategoryName(productItem.category)}</span>
                      </div>

                      <div className="box-row">
                        <span>Importancia:</span>
                        <span>{priority[productItem.priority]}</span>
                      </div>

                      <div className="box-actions">
                        <button
                          className="btn btn-primary"
                          onClick={() => navigate(`/product/${productItem.id}`)}
                        >
                          Ver más
                        </button>
                        <button
                          className="btn btn-cancel"
                          onClick={() => handleDelete(productItem.id, productItem.name)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </Box>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="dashboard-main-content dashboard-main-content--full">
              <div className="collections-panel">
                <div className="collections-header">
                  <div>
                    <h2>Colecciones</h2>
                    <p>Organiza tus deseos por grupo o tema.</p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-small"
                    onClick={() => setIsContainerModalOpen(true)}
                  >
                    + Nueva colección
                  </button>
                </div>

                <div className="dashboard-toolbar dashboard-toolbar--compact">
                  <input
                    type="text"
                    className="input toolbar-search"
                    value={collectionSearch}
                    onChange={(event) => setCollectionSearch(event.target.value)}
                    placeholder="Buscar colección por nombre"
                  />
                </div>

                {containers.length === 0 ? (
                  <div className="dashboard-empty dashboard-empty--featured">
                    <h2>Aún no tienes colecciones</h2>
                    <p>Crea tu primera categoría para ordenar mejor tus ideas.</p>
                    <button
                      className="btn btn-primary"
                      onClick={() => setIsContainerModalOpen(true)}
                    >
                      Crear colección
                    </button>
                  </div>
                ) : filteredCollections.length === 0 ? (
                  <div className="dashboard-empty dashboard-empty--featured">
                    <h2>No se encontraron colecciones</h2>
                    <p>Prueba con otro nombre o limpia la búsqueda.</p>
                    <button
                      className="btn btn-primary"
                      onClick={() => setCollectionSearch("")}
                    >
                      Limpiar búsqueda
                    </button>
                  </div>
                ) : (
                  <div className="collections-grid">
                    {filteredCollections.map((container) => {
                      const productCount = getProductCountByContainer(container.id);
                      const productTotal = getProductTotalByContainer(container.id);

                      return (
                        <div
                          key={container.id}
                          className="collection-card"
                          role="button"
                          tabIndex={0}
                          onClick={() => navigate(`/collection/${container.id}`)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              navigate(`/collection/${container.id}`);
                            }
                          }}
                        >
                          <div className="collection-card__meta">Colección</div>
                          <h3>{container.name}</h3>
                          <p>
                            {productCount} producto{productCount === 1 ? "" : "s"} guardado
                            {productCount === 1 ? "" : "s"}
                          </p>
                          <strong className="collection-card__total">
                            Valor total: {formatCurrency(productTotal)}
                          </strong>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {isContainerModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsContainerModalOpen(false)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <h3>Crear colección</h3>
            <label className="modal-label">
              Nombre de la colección
              <input
                type="text"
                className="input"
                value={newContainerName}
                onChange={(event) => setNewContainerName(event.target.value)}
                placeholder="Ej. Regalos, Casa, Viajes"
              />
            </label>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-cancel"
                onClick={() => setIsContainerModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleCreateContainer}
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
