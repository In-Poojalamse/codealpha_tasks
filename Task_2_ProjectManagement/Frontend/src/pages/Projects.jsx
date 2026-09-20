
import { useEffect, useState } from "react";
import axios from "axios";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  // ===============================
  // GET PROJECTS
  // ===============================

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "https://codealpha-projectmanagement-uk62.onrender.com/api/projects",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);

      setMessage(
        error.response?.data?.message || "Failed to load projects"
      );
    }
  };

  // ===============================
  // LOAD PROJECTS
  // ===============================

  useEffect(() => {
    const loadProjects = async () => {
      await fetchProjects();
    };

    loadProjects();
  }, []);

  // ===============================
  // CREATE PROJECT
  // ===============================

  const handleCreateProject = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setMessage("Project name is required");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "https://codealpha-projectmanagement-uk62.onrender.com/api/projects",
        {
          name: name,
          description: description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(response.data.message);

      setName("");
      setDescription("");
      setShowForm(false);

      await fetchProjects();
    } catch (error) {
      console.error("Error creating project:", error);

      setMessage(
        error.response?.data?.message || "Failed to create project"
      );
    }
  };

  // ===============================
  // UI
  // ===============================

  return (
    <div>
      <h2>Projects</h2>

      <p>Manage your projects here.</p>

      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? "Cancel" : "Create New Project"}
      </button>

      <br />
      <br />

      {showForm && (
        <form onSubmit={handleCreateProject}>
          <input
            type="text"
            placeholder="Enter Project Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <br />
          <br />

          <textarea
            placeholder="Enter Project Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <br />
          <br />

          <button type="submit">
            Create Project
          </button>
        </form>
      )}

      {message && <p>{message}</p>}

      <hr />

      <h3>All Projects</h3>

      {projects.length === 0 ? (
        <p>No projects available.</p>
      ) : (
        projects.map((project) => (
          <div key={project.id}>
            <h4>{project.name}</h4>

            <p>
              {project.description || "No description"}
            </p>

            <p>
              Created by: {project.created_by_name}
            </p>

            <hr />
          </div>
        ))
      )}
    </div>
  );
}

export default Projects;

