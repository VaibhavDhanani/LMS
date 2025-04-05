# 📚 Learning Management System (LMS) — LearnSpace

A full-featured Learning Management System (LMS) that enables users to register, browse courses, access learning material, interact via live video, and chat in real-time. Admins can manage users, courses, and content efficiently. Built with a modern tech stack and deployed on AWS EC2.

---

## 🚀 Live Demo

🌐 [http://LearnSpace.com](http://ec2-52-66-81-29.ap-south-1.compute.amazonaws.com)

---

## 🛠 Tech Stack

### Frontend (Client/)
- React (Vite)
- React Router
- Tailwind CSS
- Axios
- OAuth2 + JWT Auth
- Server-Sent Events (SSE) for notifications
- WebRTC (via mediasoup) for live classes
- Socket.IO for real-time chat

### Backend (ApplicationServer/)
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Firebase (for file uploads or notifications)
- SSE for real-time alerts

### Live Communication Server (LiveServer/)
- mediasoup (for SFU-based group video calling)
- WebRTC
- Socket.IO (for signaling and chat)

### DevOps
- AWS EC2 for deployment
- Nginx (reverse proxy)
- PM2 (process manager for Node.js)
- Git & GitHub

---

## 📁 Project Structure

```
LMS/
├── Client/               # React Frontend
├── ApplicationServer/    # Backend API (User, Course, Auth, Notifications)
├── LiveServer/           # Live Call + Chat server (WebRTC, mediasoup, socket.io)
├── README.md
```

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/VaibhavDhanani/LMS.git
cd LMS
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
cd Client
npm install

# Install backend dependencies
cd ../ApplicationServer
npm install

# Install LiveServer dependencies
cd ../LiveServer
npm install
```

### 3. Configure Environment Variables

Create appropriate `.env` files in each directory:

#### Client/.env
```
VITE_APIKEY=your_firebase_api_key
VITE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_PROJECTID=your_project_id
VITE_STORAGEBUCKET=your_project.appspot.com
VITE_MESSAGINGSENDERID=your_sender_id
VITE_APPID=your_app_id
VITE_MEASUREMENTID=your_measurement_id
VITE_PUBLIC_IP=your_public_ip
VITE_SOCKET_URL=http://localhost:3000
VITE_SERVER_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHKEY=your_stripe_publishable_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

#### ApplicationServer/.env
```
PORT=5000
FRONTEND_URI=http://localhost:5173
ALLOWED_ORIGINS=http://yourdomain.com,http://localhost:5173
CONNECTION=your_mongodb_connection_string
STRIPE_SECRETKEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
JWT_SECRET_KEY=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_CLIENT_ID=your_google_client_id
```

#### LiveServer/.env
```
PORT=3000
PUBLIC_IP=your_public_ip
ALLOWED_ORIGINS=http://localhost:5173
```

### 4. Start the Servers
```bash
# Start the backend server
cd ApplicationServer
npm start

# Start the frontend development server
cd ../Client
npm run dev

# Start the LiveServer
cd ../LiveServer
npm start
```

---

## 🎥 Enabling Camera Permissions for Live Sessions

To use live video features in the application:

1. Open Chrome browser
2. Navigate to `chrome://flags/`
3. Search for "insecure origins"
4. Enable the "Insecure origins treated as secure" flag
5. Add your frontend URL to the list of trusted sites
6. Restart your browser

**Note:** This step is necessary to allow camera/microphone access from non-HTTPS origins during development. In production, always use HTTPS for secure media access.

---

## ✨ Features

- ✅ User Registration & Login (OAuth + JWT)
- ✅ Role-based Access (Admin, Instructor, Student)
- ✅ Course Creation & Enrollment
- ✅ Upload & Stream Learning Content
- ✅ Server-Sent Events (SSE) for Real-Time Notifications
- ✅ Live Video Calls for Classes (WebRTC + mediasoup)
- ✅ Real-Time Chat during Live Classes (Socket.IO)
- ✅ Mobile-Responsive UI
- ✅ Secure Authentication
- ✅ Admin Dashboard

---

## 🔒 Security & Optimization

- HTTPS via Nginx reverse proxy
- Secure JWT-based Auth
- MongoDB Indexing & Query Optimization
- PM2 for process monitoring
