
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f5f7fb",
      }}
    >
      {/* ===============================
          SIDEBAR
      =============================== */}

      <div
        style={{
          width: "260px",
          minHeight: "100vh",
          backgroundColor: "#1f2937",
          color: "white",
          padding: "30px 22px",
          boxSizing: "border-box",
          flexShrink: 0,
        }}
      >
        {/* PROJECT MANAGER HEADER */}

        <div
          style={{
            padding: "0 8px 30px",
            borderBottom: "1px solid #374151",
            marginBottom: "30px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "21px",
              lineHeight: "1.4",
              color: "white",
              whiteSpace: "normal",
            }}
          >
            Project
            <br />
            Manager
          </h2>

          <p
            style={{
              margin: "10px 0 0",
              fontSize: "13px",
              lineHeight: "1.5",
              color: "#9ca3af",
            }}
          >
            Manage your work
          </p>
        </div>

        {/* NAVIGATION */}

        <button
          onClick={() => navigate("/dashboard")}
          style={sidebarButtonStyle}
        >
          <span>🏠</span>
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => navigate("/projects")}
          style={sidebarButtonStyle}
        >
          <span>📁</span>
          <span>Projects</span>
        </button>

        <button
          onClick={() => navigate("/tasks")}
          style={sidebarButtonStyle}
        >
          <span>✅</span>
          <span>Tasks</span>
        </button>

        {/* LOGOUT */}

        <button
          onClick={handleLogout}
          style={{
            ...sidebarButtonStyle,
            marginTop: "45px",
            backgroundColor: "#dc2626",
          }}
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>

      {/* ===============================
          MAIN CONTENT
      =============================== */}

      <div
        style={{
          flex: 1,
          padding: "40px 45px",
          boxSizing: "border-box",
          minWidth: 0,
        }}
      >
        {/* HEADER */}

        <div style={{ marginBottom: "35px" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "32px",
              color: "#111827",
            }}
          >
            Dashboard
          </h1>

          <p
            style={{
              marginTop: "10px",
              color: "#6b7280",
              fontSize: "16px",
            }}
          >
            Welcome back, {user?.name || "User"} 👋
          </p>
        </div>

        {/* SUMMARY CARDS */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "22px",
          }}
        >
          {/* PROJECTS */}

          <div style={cardStyle}>
            <div style={iconStyle}>📁</div>

            <h3 style={cardTitleStyle}>
              Projects
            </h3>

            <p style={cardTextStyle}>
              Create and manage your projects.
            </p>

            <button
              onClick={() => navigate("/projects")}
              style={actionButtonStyle}
            >
              View Projects
            </button>
          </div>

          {/* TASKS */}

          <div style={cardStyle}>
            <div style={iconStyle}>✅</div>

            <h3 style={cardTitleStyle}>
              Tasks
            </h3>

            <p style={cardTextStyle}>
              Assign and track project tasks.
            </p>

            <button
              onClick={() => navigate("/tasks")}
              style={actionButtonStyle}
            >
              View Tasks
            </button>
          </div>

          {/* ACCOUNT */}

          <div style={cardStyle}>
            <div style={iconStyle}>👤</div>

            <h3 style={cardTitleStyle}>
              Account
            </h3>

            <p
              style={{
                margin: "8px 0",
                fontWeight: "bold",
                color: "#111827",
              }}
            >
              {user?.name || "User"}
            </p>

            <p
              style={{
                margin: 0,
                color: "#6b7280",
                fontSize: "14px",
                wordBreak: "break-word",
              }}
            >
              {user?.email || ""}
            </p>
          </div>
        </div>

        {/* QUICK ACTIONS */}

        <div
          style={{
            marginTop: "35px",
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              color: "#111827",
            }}
          >
            Quick Actions
          </h2>

          <p
            style={{
              color: "#6b7280",
              marginBottom: "22px",
            }}
          >
            Quickly access your projects and tasks.
          </p>

          <button
            onClick={() => navigate("/projects")}
            style={actionButtonStyle}
          >
            + Create / View Projects
          </button>

          <button
            onClick={() => navigate("/tasks")}
            style={{
              ...actionButtonStyle,
              marginLeft: "12px",
            }}
          >
            + Create / View Tasks
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===============================
   STYLES
================================ */

const sidebarButtonStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  width: "100%",
  padding: "13px 14px",
  marginBottom: "12px",
  border: "none",
  borderRadius: "8px",
  backgroundColor: "#374151",
  color: "white",
  textAlign: "left",
  cursor: "pointer",
  fontSize: "15px",
};

const cardStyle = {
  backgroundColor: "white",
  padding: "25px",
  borderRadius: "12px",
  minHeight: "210px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
  boxSizing: "border-box",
};

const iconStyle = {
  fontSize: "28px",
  marginBottom: "10px",
};

const cardTitleStyle = {
  margin: "5px 0 10px",
  color: "#111827",
};

const cardTextStyle = {
  color: "#6b7280",
  lineHeight: "1.5",
  minHeight: "45px",
};

const actionButtonStyle = {
  padding: "10px 16px",
  border: "none",
  borderRadius: "7px",
  backgroundColor: "#2563eb",
  color: "white",
  cursor: "pointer",
  fontSize: "14px",
};

export default Dashboard;

