import React, { useState } from "react";
import app from "./firebase/firebase.config.js"
import {getStorage,ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export default function App() {
  const [courseInfo, setCourseInfo] = useState({
    title: "",
    description: "",
    videos: []
  });
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseInfo({ ...courseInfo, [name]: value });
  };

  const handleFileChange = (e) => {
    setCourseInfo({ ...courseInfo, videos: [...e.target.files] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const storage = getStorage(app); // Initialize Firebase Storage
    const videoUrls = [];

    setUploading(true);

    for (let video of courseInfo.videos) {
      const storageRef = ref(storage, `courses/${courseInfo.title}/${video.name}`);
      const uploadTask = uploadBytesResumable(storageRef, video);

      try {
        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            null,
            reject,
            async () => {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              videoUrls.push(url);
              resolve();
            }
          );
        });
      } catch (error) {
        console.error("Error uploading video:", error);
      }
    }

    setUploading(false);
    console.log("Uploaded Video URLs:", videoUrls);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-4">Create a New Course</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Course Title</label>
            <input
              type="text"
              name="title"
              value={courseInfo.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Course Description</label>
            <textarea
              name="description"
              value={courseInfo.description}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Upload Videos</label>
            <input
              type="file"
              multiple
              accept="video/*"
              onChange={handleFileChange}
              className="block w-full text-gray-500 border rounded-lg cursor-pointer focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none disabled:opacity-50"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
