
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "https://codealpha-projectmanagement-uk62.onrender.com";

function Tasks() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [projectId, setProjectId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [status, setStatus] = useState("Pending");
  const [dueDate, setDueDate] = useState("");

  const [commentText, setCommentText] = useState({});
  const [comments, setComments] = useState({});
  const [message, setMessage] = useState("");

  const getConfig = () => {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      try {
        const config = getConfig();

        const [tasksResponse, projectsResponse, usersResponse] =
          await Promise.all([
            axios.get(`${API_URL}/api/tasks`, config),
            axios.get(`${API_URL}/api/projects`, config),
            axios.get(`${API_URL}/api/users`, config),
          ]);

        const taskData = tasksResponse.data;
        const projectData = projectsResponse.data;
        const userData = usersResponse.data;

        const loadedComments = {};

        await Promise.all(
          taskData.map(async (task) => {
            try {
              const commentsResponse = await axios.get(
                `${API_URL}/api/tasks/${task.id}/comments`,
                config
              );

              loadedComments[task.id] = commentsResponse.data;
            } catch (error) {
              console.error(
                `Error loading comments for task ${task.id}:`,
                error
              );

              loadedComments[task.id] = [];
            }
          })
        );

        if (!isMounted) {
          return;
        }

        setTasks(taskData);
        setProjects(projectData);
        setUsers(userData);
        setComments(loadedComments);
      } catch (error) {
        console.error("Error loading task data:", error);

        if (isMounted) {
          setMessage(
            error.response?.data?.message ||
              "Failed to load task data"
          );
        }
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshTaskData = async () => {
    try {
      const config = getConfig();

      const [tasksResponse, projectsResponse, usersResponse] =
        await Promise.all([
          axios.get(`${API_URL}/api/tasks`, config),
          axios.get(`${API_URL}/api/projects`, config),
          axios.get(`${API_URL}/api/users`, config),
        ]);

      const taskData = tasksResponse.data;
      const loadedComments = {};

      await Promise.all(
        taskData.map(async (task) => {
          try {
            const commentsResponse = await axios.get(
              `${API_URL}/api/tasks/${task.id}/comments`,
              config
            );

            loadedComments[task.id] = commentsResponse.data;
          } catch (error) {
            console.error(
              `Error loading comments for task ${task.id}:`,
              error
            );

            loadedComments[task.id] = [];
          }
        })
      );

      setTasks(taskData);
      setProjects(projectsResponse.data);
      setUsers(usersResponse.data);
      setComments(loadedComments);
    } catch (error) {
      console.error("Error refreshing task data:", error);

      setMessage(
        error.response?.data?.message ||
          "Failed to refresh task data"
      );
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();

    if (!projectId || !title.trim()) {
      setMessage("Project and task title are required");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/tasks`,
        {
          project_id: projectId,
          title: title.trim(),
          description: description.trim(),
          assigned_to: assignedTo || null,
          status: status,
          due_date: dueDate || null,
        },
        getConfig()
      );

      setMessage(response.data.message);

      setProjectId("");
      setTitle("");
      setDescription("");
      setAssignedTo("");
      setStatus("Pending");
      setDueDate("");

      setShowForm(false);

      await refreshTaskData();
    } catch (error) {
      console.error("Error creating task:", error);

      setMessage(
        error.response?.data?.message ||
          "Failed to create task"
      );
    }
  };

  const handleAddComment = async (taskId) => {
    const text = commentText[taskId];

    if (!text || !text.trim()) {
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/comments`,
        {
          task_id: taskId,
          comment: text.trim(),
        },
        getConfig()
      );

      setCommentText((previous) => ({
        ...previous,
        [taskId]: "",
      }));

      const response = await axios.get(
        `${API_URL}/api/tasks/${taskId}/comments`,
        getConfig()
      );

      setComments((previous) => ({
        ...previous,
        [taskId]: response.data,
      }));
    } catch (error) {
      console.error("Error adding comment:", error);

      setMessage(
        error.response?.data?.message ||
          "Failed to add comment"
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  const getStatusStyle = (taskStatus) => {
    if (taskStatus === "Completed") {
      return {
        backgroundColor: "#dcfce7",
        color: "#166534",
      };
    }

    if (taskStatus === "In Progress") {
      return {
        backgroundColor: "#dbeafe",
        color: "#1d4ed8",
      };
    }

    return {
      backgroundColor: "#fef3c7",
      color: "#92400e",
    };
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
              color: "#9ca3af",
            }}
          >
            Manage your work
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          style={sidebarButtonStyle}
        >
          🏠 <span>Dashboard</span>
        </button>

        <button
          onClick={() => navigate("/projects")}
          style={sidebarButtonStyle}
        >
          📁 <span>Projects</span>
        </button>

        <button
          onClick={() => navigate("/tasks")}
          style={sidebarButtonStyle}
        >
          ✅ <span>Tasks</span>
        </button>

        <button
          onClick={handleLogout}
          style={{
            ...sidebarButtonStyle,
            marginTop: "45px",
            backgroundColor: "#dc2626",
          }}
        >
          🚪 <span>Logout</span>
        </button>
      </div>

      <div
        style={{
          flex: 1,
          padding: "40px 45px",
          boxSizing: "border-box",
          minWidth: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
            gap: "20px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "32px",
                color: "#111827",
              }}
            >
              Tasks
            </h1>

            <p
              style={{
                color: "#6b7280",
                marginTop: "8px",
              }}
            >
              Manage and track your project tasks.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            style={createButtonStyle}
          >
            {showForm ? "✕ Cancel" : "+ Create Task"}
          </button>
        </div>

        {message && (
          <div
            style={{
              backgroundColor: "#e0f2fe",
              color: "#075985",
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            {message}
          </div>
        )}

        {showForm && (
          <div style={formCardStyle}>
            <h2
              style={{
                marginTop: 0,
                color: "#111827",
              }}
            >
              Create New Task
            </h2>

            <form onSubmit={handleCreateTask}>
              <label style={labelStyle}>Project</label>

              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                style={inputStyle}
              >
                <option value="">Select Project</option>

                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>

              <label style={labelStyle}>Task Title</label>

              <input
                type="text"
                placeholder="Enter task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={inputStyle}
              />

              <label style={labelStyle}>Description</label>

              <textarea
                placeholder="Enter task description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  ...inputStyle,
                  minHeight: "90px",
                  resize: "vertical",
                }}
              />

              <label style={labelStyle}>Assign User</label>

              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                style={inputStyle}
              >
                <option value="">Select User</option>

                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>

              <label style={labelStyle}>Status</label>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={inputStyle}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>

              <label style={labelStyle}>Due Date</label>

              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={inputStyle}
              />

              <button type="submit" style={createButtonStyle}>
                Create Task
              </button>
            </form>
          </div>
        )}

        <h2
          style={{
            color: "#111827",
            marginTop: "35px",
          }}
        >
          All Tasks
        </h2>

        {tasks.length === 0 ? (
          <div style={emptyStyle}>
            <h3>No tasks available</h3>

            <p>Create your first task to get started.</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "22px",
            }}
          >
            {tasks.map((task) => (
              <div key={task.id} style={taskCardStyle}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "15px",
                    alignItems: "flex-start",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      color: "#111827",
                    }}
                  >
                    {task.title}
                  </h3>

                  <span
                    style={{
                      ...getStatusStyle(task.status),
                      padding: "5px 10px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {task.status}
                  </span>
                </div>

                <p
                  style={{
                    color: "#6b7280",
                    marginTop: "15px",
                  }}
                >
                  {task.description || "No description provided."}
                </p>

                <div
                  style={{
                    borderTop: "1px solid #e5e7eb",
                    marginTop: "18px",
                    paddingTop: "15px",
                  }}
                >
                  <p style={infoStyle}>
                    📁 <strong>Project:</strong>{" "}
                    {task.project_name}
                  </p>

                  <p style={infoStyle}>
                    👤 <strong>Assigned To:</strong>{" "}
                    {task.assigned_user_name || "Not assigned"}
                  </p>

                  <p style={infoStyle}>
                    📅 <strong>Due Date:</strong>{" "}
                    {task.due_date || "No due date"}
                  </p>
                </div>

                <div
                  style={{
                    marginTop: "20px",
                    paddingTop: "15px",
                    borderTop: "1px solid #e5e7eb",
                  }}
                >
                  <h4
                    style={{
                      marginTop: 0,
                      color: "#111827",
                    }}
                  >
                    💬 Comments
                  </h4>

                  {comments[task.id]?.length > 0 ? (
                    comments[task.id].map((comment) => (
                      <div
                        key={comment.id}
                        style={{
                          backgroundColor: "#f9fafb",
                          padding: "10px",
                          borderRadius: "7px",
                          marginBottom: "8px",
                        }}
                      >
                        <strong>{comment.user_name}</strong>

                        <p
                          style={{
                            margin: "5px 0 0",
                            color: "#4b5563",
                          }}
                        >
                          {comment.comment}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p
                      style={{
                        color: "#9ca3af",
                        fontSize: "14px",
                      }}
                    >
                      No comments yet.
                    </p>
                  )}

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      marginTop: "12px",
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={commentText[task.id] || ""}
                      onChange={(e) =>
                        setCommentText((previous) => ({
                          ...previous,
                          [task.id]: e.target.value,
                        }))
                      }
                      style={{
                        ...inputStyle,
                        marginBottom: 0,
                        flex: 1,
                      }}
                    />

                    <button
                      onClick={() => handleAddComment(task.id)}
                      style={commentButtonStyle}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

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

const createButtonStyle = {
  padding: "12px 18px",
  border: "none",
  borderRadius: "8px",
  backgroundColor: "#2563eb",
  color: "white",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "bold",
};

const formCardStyle = {
  backgroundColor: "white",
  padding: "30px",
  borderRadius: "12px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
  marginBottom: "30px",
  maxWidth: "700px",
};

const labelStyle = {
  display: "block",
  marginBottom: "7px",
  marginTop: "18px",
  color: "#374151",
  fontWeight: "bold",
  fontSize: "14px",
};

const inputStyle = {
  width: "100%",
  padding: "11px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "7px",
  boxSizing: "border-box",
  fontSize: "14px",
  marginBottom: "5px",
};

const taskCardStyle = {
  backgroundColor: "white",
  padding: "24px",
  borderRadius: "12px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
};

const infoStyle = {
  color: "#4b5563",
  fontSize: "14px",
  margin: "9px 0",
};

const commentButtonStyle = {
  padding: "10px 14px",
  border: "none",
  borderRadius: "7px",
  backgroundColor: "#2563eb",
  color: "white",
  cursor: "pointer",
};

const emptyStyle = {
  backgroundColor: "white",
  padding: "40px",
  borderRadius: "12px",
  textAlign: "center",
  color: "#6b7280",
  boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
};

export default Tasks;

