import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../utils/supabase";

export default function SharedCollection() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadCollection = async () => {
      const { data: collectionData, error: collectionError } = await supabase
        .from("container")
        .select("id, name")
        .eq("id", id)
        .single();

      if (collectionError) {
        setMessage("No se pudo encontrar esta colección");
        setIsLoading(false);
        return;
      }

      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("name, price, status, category, priority, url, description, checked")
        .eq("container", Number(id))
        .order("time_created", { ascending: true });

      if (productsError) {
        setMessage("No se pudieron cargar los productos");
      } else {
        setCollection(collectionData);
        setProducts(productsData || []);
      }

      setIsLoading(false);
    };

    loadCollection();
  }, [id]);

  const copyToMyList = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/", { state: { message: "Inicia sesión para copiar esta colección." } });
      return;
    }

    const { data: newCollection, error: collectionError } = await supabase
      .from("container")
      .insert({ id_user: user.id, name: `${collection.name} (copia)` })
      .select("id")
      .single();

    if (collectionError) {
      setMessage("No se pudo copiar la colección");
      return;
    }

    if (products.length > 0) {
      const productsToCopy = products.map((product) => ({
        id_user: user.id,
        container: newCollection.id,
        name: product.name,
        price: product.price,
        status: product.status,
        category: product.category,
        priority: product.priority,
        url: product.url,
        description: product.description,
        checked: product.checked,
      }));
      const { error: productsError } = await supabase.from("products").insert(productsToCopy);

      if (productsError) {
        setMessage("La colección se creó, pero no se copiaron los productos");
        return;
      }
    }

    navigate(`/collection/${newCollection.id}`);
  };

  if (isLoading) {
    return (
      <main className="collection-page">
        <div className="loading-state">Cargando colección</div>
      </main>
    );
  }

  if (!collection) {
    return (
      <main className="collection-page">
        <div className="dashboard-empty dashboard-empty--featured">
          <h2>{message || "Colección no disponible"}</h2>
          <button className="btn btn-primary" onClick={() => navigate("/")}>
            Ir al inicio
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="collection-page">
      <div className="collection-header">
        <div>
          <h1>{collection.name}</h1>
          <p>Colección compartida con {products.length} productos.</p>
        </div>
        <button className="btn btn-primary" onClick={copyToMyList}>
          Copiar a mi lista
        </button>
      </div>
      {message && <div className="login-alert">{message}</div>}
      <div className="box-list">
        {products.map((product, index) => (
          <article className="box" key={`${product.name}-${index}`}>
            <h2>{product.name}</h2>
            <div className="box-row">
              <span>Precio:</span>
              <strong>${product.price ?? 0}</strong>
            </div>
            {product.description && <p>{product.description}</p>}
          </article>
        ))}
      </div>
    </main>
  );
}
