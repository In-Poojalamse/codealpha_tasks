\# CodeAlpha Project Management Tool



A full-stack project management web application developed as part of the \*\*CodeAlpha Full Stack Development Internship\*\*.



The application allows users to create projects, assign tasks, manage task status, and communicate through task comments.



\## Features



\* User Registration and Login

\* JWT-based Authentication

\* Protected Routes

\* Create and View Projects

\* Create and Assign Tasks

\* Task Status Management

\* Due Date Management

\* Task Comments

\* User Management

\* MySQL Database Integration

\* REST API

\* Responsive and Modern Dashboard



\## Tech Stack



\### Frontend



\* React.js

\* Vite

\* JavaScript

\* Axios

\* React Router

\* CSS



\### Backend



\* Node.js

\* Express.js

\* REST API

\* JWT Authentication

\* bcryptjs



\### Database



\* MySQL



\### Tools



\* Visual Studio Code

\* MySQL Workbench

\* Git

\* GitHub



\## Project Structure



```text

CodeAlpha\_ProjectManagement

│

├── Backend

│   ├── server.js

│   ├── package.json

│   └── .env

│

├── Frontend

│   ├── src

│   │   ├── pages

│   │   ├── components

│   │   ├── App.jsx

│   │   └── main.jsx

│   ├── package.json

│   └── vite.config.js

│

├── .gitignore

└── README.md

```



\## Main Modules



\### Authentication



Users can register and log in securely using JWT authentication. Protected routes prevent unauthorized access to project and task data.



\### Project Management



Users can create projects with project names and descriptions and view their available projects.



\### Task Management



Tasks can be created for projects with:



\* Task title

\* Description

\* Assigned user

\* Status

\* Due date



\### Task Comments



Users can add comments to tasks for project-related communication and collaboration.



\## How to Run the Project



\### 1. Clone the Repository



```bash

git clone https://github.com/In-Poojalamse/CodeAlpha\_ProjectManagement.git

```



\### 2. Start the Backend



```bash

cd Backend

npm install

node server.js

```



Backend runs on:



```text

http://localhost:5001

```



\### 3. Configure MySQL



Create a MySQL database named:



```text

project\_management

```



Create the required tables for:



\* users

\* projects

\* tasks

\* comments



Add your local database credentials to the `.env` file.



\### 4. Start the Frontend



Open another terminal:



```bash

cd Frontend

npm install

npm run dev

```



Frontend runs on:



```text

http://localhost:5173

```



\## API Endpoints



\### Authentication



```text

POST /api/auth/register

POST /api/auth/login

GET  /api/auth/profile

```



\### Projects



```text

POST /api/projects

GET  /api/projects

```



\### Users



```text

GET /api/users

```



\### Tasks



```text

POST /api/tasks

GET  /api/tasks

```



\### Comments



```text

POST /api/comments

GET  /api/tasks/:taskId/comments

```



\## Future Improvements



\* Project team members

\* Task priority

\* Drag-and-drop project board

\* Notifications

\* Real-time communication using WebSockets

\* File attachments

\* Deployment to cloud platforms



\## Internship



Developed as part of the \*\*CodeAlpha Full Stack Development Internship\*\*.



\## Author



\*\*Pooja Ashok Lamse\*\*



GitHub: https://github.com/In-Poojalamse



