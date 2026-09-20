const express = require("express");
const cors = require("cors");
const fs = require("fs");
require("dotenv").config();

const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());

// ===============================
// MYSQL CONNECTION
// ===============================

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
};

// Enable SSL when DB_SSL=true
if (process.env.DB_SSL === "true") {
  const caPath = process.env.CA_CERT_PATH || "./ca.pem";

  dbConfig.ssl = {
    ca: fs.readFileSync(caPath),
    rejectUnauthorized: true,
  };
}

const db = mysql.createPool({
  ...dbConfig,
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
    console.error("Database Connection Failed:", error.message);
  }
}

testDatabaseConnection();

// ===============================
// HOME ROUTE
// ===============================

app.get("/", (req, res) => {
  res.send("Project Management Backend is Running!");
});

// ===============================
// HEALTH CHECK
// ===============================

app.get("/health", async (req, res) => {
  try {
    await db.query("SELECT 1");

    res.status(200).json({
      status: "OK",
      database: "Connected",
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      database: "Disconnected",
    });
  }
});

// ===============================
// TEST API
// ===============================

app.get("/api/test", (req, res) => {
  res.json({
    message: "Project Management API is working!",
  });
});

// ===============================
// REGISTER API
// ===============================

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const [existingUser] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name.trim(), email.trim(), hashedPassword]
    );

    res.status(201).json({
      message: "Registration successful",
      userId: result.insertId,
    });
  } catch (error) {
    console.error("Register Error:", error.message);

    res.status(500).json({
      message: "Server error during registration",
    });
  }
});

// ===============================
// JWT AUTHENTICATION MIDDLEWARE
// ===============================

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

  if (!token) {
    return res.status(401).json({
      message: "Access token required",
    });
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error("JWT_SECRET is not configured");

    return res.status(500).json({
      message: "Server authentication configuration error",
    });
  }

  jwt.verify(token, jwtSecret, (error, user) => {
    if (error) {
      return res.status(403).json({
        message: "Invalid or expired token",
      });
    }

    req.user = user;
    next();
  });
}

// ===============================
// LOGIN API
// ===============================

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const [users] = await db.query(
      "SELECT id, name, email, password, role FROM users WHERE email = ?",
      [email.trim()]
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const user = users[0];

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error("JWT_SECRET is not configured");

      return res.status(500).json({
        message: "Server authentication configuration error",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);

    res.status(500).json({
      message: "Server error during login",
    });
  }
});

// ===============================
// PROFILE API
// ===============================

app.get("/api/auth/profile", authenticateToken, async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT id, name, email, role FROM users WHERE id = ?",
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "Profile fetched successfully",
      user: users[0],
    });
  } catch (error) {
    console.error("Profile Error:", error.message);

    res.status(500).json({
      message: "Server error while fetching profile",
    });
  }
});

// ===============================
// PROJECT APIs
// ===============================

// CREATE PROJECT

app.post("/api/projects", authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Project name is required",
      });
    }

    const [result] = await db.query(
      `INSERT INTO projects
       (name, description, created_by)
       VALUES (?, ?, ?)`,
      [
        name.trim(),
        description ? description.trim() : null,
        req.user.id,
      ]
    );

    res.status(201).json({
      message: "Project created successfully",
      projectId: result.insertId,
    });
  } catch (error) {
    console.error("Create Project Error:", error.message);

    res.status(500).json({
      message: "Server error while creating project",
    });
  }
});

// GET ALL PROJECTS

app.get("/api/projects", authenticateToken, async (req, res) => {
  try {
    const [projects] = await db.query(
      `SELECT
        p.id,
        p.name,
        p.description,
        p.created_by,
        p.created_at,
        u.name AS created_by_name
       FROM projects p
       JOIN users u ON p.created_by = u.id
       ORDER BY p.created_at DESC`
    );

    res.json(projects);
  } catch (error) {
    console.error("Get Projects Error:", error.message);

    res.status(500).json({
      message: "Server error while fetching projects",
    });
  }
});

// ===============================
// USER APIs
// ===============================

// GET ALL USERS

app.get("/api/users", authenticateToken, async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT id, name, email, role FROM users ORDER BY name ASC"
    );

    res.json(users);
  } catch (error) {
    console.error("Get Users Error:", error.message);

    res.status(500).json({
      message: "Server error while fetching users",
    });
  }
});

// ===============================
// TASK APIs
// ===============================

// CREATE TASK

app.post("/api/tasks", authenticateToken, async (req, res) => {
  try {
    const {
      project_id,
      title,
      description,
      assigned_to,
      status,
      due_date,
    } = req.body;

    if (!project_id || !title || !title.trim()) {
      return res.status(400).json({
        message: "Project and task title are required",
      });
    }

    const [result] = await db.query(
      `INSERT INTO tasks
       (project_id, title, description, assigned_to, status, due_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        project_id,
        title.trim(),
        description ? description.trim() : null,
        assigned_to || null,
        status || "Pending",
        due_date || null,
      ]
    );

    res.status(201).json({
      message: "Task created successfully",
      taskId: result.insertId,
    });
  } catch (error) {
    console.error("Create Task Error:", error.message);

    res.status(500).json({
      message: "Server error while creating task",
    });
  }
});

// GET ALL TASKS

app.get("/api/tasks", authenticateToken, async (req, res) => {
  try {
    const [tasks] = await db.query(
      `SELECT
        t.id,
        t.project_id,
        t.title,
        t.description,
        t.assigned_to,
        t.status,
        t.due_date,
        t.created_at,
        p.name AS project_name,
        u.name AS assigned_user_name
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       LEFT JOIN users u ON t.assigned_to = u.id
       ORDER BY t.created_at DESC`
    );

    res.json(tasks);
  } catch (error) {
    console.error("Get Tasks Error:", error.message);

    res.status(500).json({
      message: "Server error while fetching tasks",
    });
  }
});

// ===============================
// COMMENT APIs
// ===============================

// CREATE COMMENT

app.post("/api/comments", authenticateToken, async (req, res) => {
  try {
    const { task_id, comment } = req.body;

    if (!task_id || !comment || !comment.trim()) {
      return res.status(400).json({
        message: "Task and comment are required",
      });
    }

    const [result] = await db.query(
      `INSERT INTO comments
       (task_id, user_id, comment)
       VALUES (?, ?, ?)`,
      [
        task_id,
        req.user.id,
        comment.trim(),
      ]
    );

    res.status(201).json({
      message: "Comment added successfully",
      commentId: result.insertId,
    });
  } catch (error) {
    console.error("Create Comment Error:", error.message);

    res.status(500).json({
      message: "Server error while adding comment",
    });
  }
});

// GET COMMENTS FOR A TASK

app.get(
  "/api/tasks/:taskId/comments",
  authenticateToken,
  async (req, res) => {
    try {
      const { taskId } = req.params;

      const [comments] = await db.query(
        `SELECT
          c.id,
          c.task_id,
          c.user_id,
          c.comment,
          c.created_at,
          u.name AS user_name
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.task_id = ?
         ORDER BY c.created_at ASC`,
        [taskId]
      );

      res.json(comments);
    } catch (error) {
      console.error("Get Comments Error:", error.message);

      res.status(500).json({
        message: "Server error while fetching comments",
      });
    }
  }
);

// ===============================
// SERVER
// ===============================

const PORT = Number(process.env.PORT) || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on 0.0.0.0:${PORT}`);
});