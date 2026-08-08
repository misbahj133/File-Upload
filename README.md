# 📁 Full-Stack File Upload Application

A responsive, full-stack web application for uploading and managing files with real-time feedback. Built with **React (Vite)** on the frontend and **Node.js (Express & Multer)** on the backend.

---
![App Demo](https://github.com/user-attachments/assets/852034a9-b5cf-47b3-a934-23de60a3a0cd)
## 🚀 Features

* **Drag and Drop Interface:** Intuitive drag-and-drop file dropzone with visual feedback.
* **Client-Side Validation:** 
  * Restricts uploads to specified file types (`.png`, `.jpg`, `.webp`, `.pdf`).
  * Enforces a maximum file size limit of **5 MB**.
* **File Preview:** Generates instant local thumbnail previews for image files before uploading.
* **Upload Progress Tracker:** Real-time progress bar powered by Axios upload events.
* **Server-Side File Storage:** Multer middleware stores files securely in an auto-created `uploads/` directory on the backend.
* **macOS Port Compatibility:** Configured on port `5001` to prevent system AirPlay port conflicts (`5000`).

---

## 🛠️ Tech Stack

### **Frontend**
* **Framework:** React.js (Vite)
* **HTTP Client:** Axios
* **Icons:** Lucide React
* **Styling:** Inline CSS with responsive layout components

### **Backend**
* **Runtime:** Node.js
* **Framework:** Express.js
* **Middleware:** Multer (File Handling), CORS (Cross-Origin Resource Sharing)

---

## 📁 Project Structure

```text
File-Upload/
├── backend/
│   ├── uploads/          # Auto-generated storage folder for uploaded files
│   ├── server.js         # Express server & Multer configuration
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── FileUpload.jsx # Main upload UI component
    │   ├── App.jsx            # App root container
    │   └── main.jsx           # React DOM renderer
    ├── package.json
    └── vite.config.js
