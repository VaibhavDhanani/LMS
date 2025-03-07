import React, {useEffect, useState} from "react";
import {  getStudentEnrolledCourses } from "@/services/course.service.jsx";
import {Link} from "react-router-dom";

export const UserLearning = ({user}) => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const authToken = localStorage.getItem("authToken");

    useEffect(() => {

        const fetchEnrolledCourses = async () => {
            try {
                setLoading(true);
                const res = await getStudentEnrolledCourses(user._id,authToken);
                if(res.success){
                    setCourses(res.data);
                }
            } catch (error) {
                console.error("Error fetching enrolled courses:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user && authToken) {
            fetchEnrolledCourses();
        }
    }, [user, authToken]);

    if (!user) {
        return <div className="text-center mt-10">Please log in to view your courses.</div>;
    }
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">My Learnings</h2>
            <div className="space-y-4">
                {courses.map((course) => (
                    <div key={course._id} className="card card-side bg-base-100 shadow-xl">
                        <figure className="w-48">
                            <img src={course.thumbnail} alt={course.title}/></figure>
                        <div className="card-body">
                            <h2 className="card-title">{course.title}</h2>
                            <p>{course.description}</p>
                            <div className="card-actions justify-end">
                                <Link to={`/my-courses/${course._id}`}>
                                    <button className="btn btn-primary">Goto Course</button>
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}

            </div>
        </div>
    );
};
