const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

dotenv.config();

const app = express();

// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());

// ===============================
// ENVIRONMENT VARIABLES
// ===============================

const PORT = process.env.PORT || 5000;

// ===============================
// MYSQL DATABASE CONNECTION
// ===============================

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,

  ssl: {
    ca: fs.readFileSync(path.join(__dirname, "ca.pem")),
    rejectUnauthorized: true,
  },

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ===============================
// TEST DATABASE CONNECTION
// ===============================

async function testDatabaseConnection() {
  try {
    const connection = await db.getConnection();

    console.log("MySQL Database Connected Successfully");

    connection.release();
  } catch (error) {
    console.error("MySQL Database Connection Failed:");
    console.error(error.message);
  }
}

// ===============================
// HOME ROUTE
// ===============================

app.get("/", (req, res) => {
  res.send("E-commerce Backend is Running!");
});

// ===============================
// HEALTH CHECK
// ===============================

app.get("/health", async (req, res) => {
  try {
    const connection = await db.getConnection();

    connection.release();

    res.json({
      status: "OK",
      database: "Connected",
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      database: "Disconnected",
      message: error.message,
    });
  }
});

// =====================================================
// USER APIs
// =====================================================

// ===============================
// REGISTER USER
// ===============================

app.post("/api/users/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const [existingUser] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    await db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, password]
    );

    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
});

// ===============================
// LOGIN USER
// ===============================

app.post("/api/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ? AND password = ?",
      [email, password]
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    res.json({
      message: "Login successful",
      user: users[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
});

// =====================================================
// PRODUCT APIs
// =====================================================

// ===============================
// GET ALL PRODUCTS
// ===============================

app.get("/api/products", async (req, res) => {
  try {
    const [products] = await db.query(
      "SELECT * FROM products ORDER BY id DESC"
    );

    res.json(products);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
});

// ===============================
// GET SINGLE PRODUCT
// ===============================

app.get("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [products] = await db.query(
      "SELECT * FROM products WHERE id = ?",
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(products[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch product",
      error: error.message,
    });
  }
});

// ===============================
// ADD PRODUCT
// ===============================

app.post("/api/products", async (req, res) => {
  try {
    const { name, description, price, stock, image } = req.body;

    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({
        message: "Name, price and stock are required",
      });
    }

    const [result] = await db.query(
      `INSERT INTO products
       (name, description, price, stock, image)
       VALUES (?, ?, ?, ?, ?)`,
      [name, description || null, price, stock, image || null]
    );

    res.status(201).json({
      message: "Product added successfully",
      productId: result.insertId,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to add product",
      error: error.message,
    });
  }
});

// ===============================
// UPDATE PRODUCT
// ===============================

app.put("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, image } = req.body;

    const [result] = await db.query(
      `UPDATE products
       SET name = ?,
           description = ?,
           price = ?,
           stock = ?,
           image = ?
       WHERE id = ?`,
      [
        name,
        description || null,
        price,
        stock,
        image || null,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
});

// ===============================
// DELETE PRODUCT
// ===============================

app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "DELETE FROM products WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
});

// =====================================================
// ORDER APIs
// =====================================================

// ===============================
// CREATE ORDER
// ===============================

app.post("/api/orders", async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { user_id, total_amount, status } = req.body;

    if (!user_id || total_amount === undefined) {
      connection.release();

      return res.status(400).json({
        message: "user_id and total_amount are required",
      });
    }

    const [result] = await connection.query(
      `INSERT INTO orders
       (user_id, total_amount, status)
       VALUES (?, ?, ?)`,
      [user_id, total_amount, status || "Pending"]
    );

    await connection.commit();

    connection.release();

    res.status(201).json({
      message: "Order created successfully",
      orderId: result.insertId,
    });
  } catch (error) {
    await connection.rollback();

    connection.release();

    console.error(error);

    res.status(500).json({
      message: "Failed to create order",
      error: error.message,
    });
  }
});

// ===============================
// GET ALL ORDERS
// ===============================

app.get("/api/orders", async (req, res) => {
  try {
    const [orders] = await db.query(
      "SELECT * FROM orders ORDER BY id DESC"
    );

    res.json(orders);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
});

// ===============================
// GET SINGLE ORDER
// ===============================

app.get("/api/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [orders] = await db.query(
      "SELECT * FROM orders WHERE id = ?",
      [id]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json(orders[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch order",
      error: error.message,
    });
  }
});

// ===============================
// UPDATE ORDER STATUS
// ===============================

app.put("/api/orders/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "Status is required",
      });
    }

    const [result] = await db.query(
      "UPDATE orders SET status = ? WHERE id = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json({
      message: "Order status updated successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update order status",
      error: error.message,
    });
  }
});

// =====================================================
// ORDER ITEM APIs
// =====================================================

// ===============================
// ADD ORDER ITEM
// ===============================

app.post("/api/order-items", async (req, res) => {
  try {
    const { order_id, product_id, quantity, price } = req.body;

    if (!order_id || !product_id || !quantity || price === undefined) {
      return res.status(400).json({
        message:
          "order_id, product_id, quantity and price are required",
      });
    }

    const [result] = await db.query(
      `INSERT INTO order_item
       (order_id, product_id, quantity, price)
       VALUES (?, ?, ?, ?)`,
      [order_id, product_id, quantity, price]
    );

    res.status(201).json({
      message: "Order item added successfully",
      orderItemId: result.insertId,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to add order item",
      error: error.message,
    });
  }
});

// ===============================
// GET ORDER ITEMS
// ===============================

app.get("/api/order-items/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    const [items] = await db.query(
      `SELECT *
       FROM order_item
       WHERE order_id = ?
       ORDER BY id DESC`,
      [orderId]
    );

    res.json(items);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch order items",
      error: error.message,
    });
  }
});

// ===============================
// DELETE ORDER ITEM
// ===============================

app.delete("/api/order-items/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "DELETE FROM order_item WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Order item not found",
      });
    }

    res.json({
      message: "Order item deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete order item",
      error: error.message,
    });
  }
});

// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, "0.0.0.0", async () => {
  console.log(`Server running on port ${PORT}`);

  await testDatabaseConnection();
});