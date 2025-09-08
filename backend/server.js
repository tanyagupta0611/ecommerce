const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

// ✅ Replace generic cors() with specific options
const corsOptions = {
  origin: "https://ecommerce-1-hehu.onrender.com", // your frontend Render URL
  methods: "GET,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization"
};

app.use(cors(corsOptions));
app.use(bodyParser.json());


const SECRET = "secret123";

// Dummy DB
let users = [];
let items = [
  { id: 1, name: "Shirt", category: "clothes", price: 500 },
  { id: 2, name: "Shoes", category: "clothes", price: 1200 },
  { id: 3, name: "Watch", category: "accessories", price: 2000 }
];
let carts = {};

// Middleware
function authenticate(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ message: "No token" });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

// Signup
app.post("/signup", (req, res) => {
  const { username, password } = req.body;
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: "User exists" });
  }
  users.push({ username, password });
  res.json({ message: "Signup successful" });
});

// Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ username }, SECRET);
  res.json({ token });
});

// CRUD for items
app.get("/items", (req, res) => {
  const { category, maxPrice } = req.query;
  let filtered = items;
  if (category) filtered = filtered.filter(i => i.category === category);
  if (maxPrice) filtered = filtered.filter(i => i.price <= parseInt(maxPrice));
  res.json(filtered);
});

// Cart APIs
app.get("/cart", authenticate, (req, res) => {
  const username = req.user.username;
  res.json(carts[username] || []);
});

app.post("/cart", authenticate, (req, res) => {
  const username = req.user.username;
  const { itemId } = req.body;
  if (!carts[username]) carts[username] = [];
  const item = items.find(i => i.id === itemId);
  if (!item) return res.status(404).json({ message: "Item not found" });
  carts[username].push(item);
  res.json(carts[username]);
});

app.delete("/cart/:id", authenticate, (req, res) => {
  const username = req.user.username;
  if (!carts[username]) return res.json([]);
  carts[username] = carts[username].filter(i => i.id != req.params.id);
  res.json(carts[username]);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
