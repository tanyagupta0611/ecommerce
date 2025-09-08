import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "https://ecommerce-87im.onrender.com";

function App() {
  const [page, setPage] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      loadItems();
      loadCart();
      setPage("items");
    }
  }, [token]);

  async function signup() {
    await axios.post(`${API}/signup`, { username, password });
    alert("Signup done! Now login");
    setPage("login");
  }

  async function login() {
    const res = await axios.post(`${API}/login`, { username, password });
    setToken(res.data.token);
  }

  async function loadItems() {
    const res = await axios.get(`${API}/items`);
    setItems(res.data);
  }

  async function loadCart() {
    const res = await axios.get(`${API}/cart`, {
      headers: { Authorization: token }
    });
    setCart(res.data);
  }

  async function addToCart(id) {
    await axios.post(`${API}/cart`, { itemId: id }, { headers: { Authorization: token } });
    loadCart();
  }

  async function removeFromCart(id) {
    await axios.delete(`${API}/cart/${id}`, { headers: { Authorization: token } });
    loadCart();
  }

  if (page === "login") {
    return (
      <div>
        <h1>Login</h1>
        <input placeholder="Username" onChange={e => setUsername(e.target.value)} />
        <input placeholder="Password" type="password" onChange={e => setPassword(e.target.value)} />
        <button onClick={login}>Login</button>
        <p>Don’t have an account? <button onClick={() => setPage("signup")}>Signup</button></p>
      </div>
    );
  }

  if (page === "signup") {
    return (
      <div>
        <h1>Signup</h1>
        <input placeholder="Username" onChange={e => setUsername(e.target.value)} />
        <input placeholder="Password" type="password" onChange={e => setPassword(e.target.value)} />
        <button onClick={signup}>Signup</button>
      </div>
    );
  }

  if (page === "items") {
    return (
      <div>
        <h1>Items</h1>
        {items.map(i => (
          <div key={i.id}>
            {i.name} - ₹{i.price}
            <button onClick={() => addToCart(i.id)}>Add to Cart</button>
          </div>
        ))}
        <button onClick={() => setPage("cart")}>Go to Cart</button>
      </div>
    );
  }

  if (page === "cart") {
    return (
      <div>
        <h1>Cart</h1>
        {cart.map(i => (
          <div key={i.id}>
            {i.name} - ₹{i.price}
            <button onClick={() => removeFromCart(i.id)}>Remove</button>
          </div>
        ))}
        <button onClick={() => setPage("items")}>Back to Items</button>
      </div>
    );
  }
}

export default App;

