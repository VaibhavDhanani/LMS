import React from "react";

export const UserLearning = () => {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">My Learning</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card bg-base-100 shadow-xl">
                    <figure><img src="https://img.daisyui.com/images/stock/photo-1635805737707-575c4f40470d.jpg" alt="Course"/></figure>
                    <div className="card-body">
                        <h2 className="card-title">Python Programming</h2>
                        <progress className="progress progress-primary w-full" value="60" max="100"></progress>
                        <p>60% Completed</p>
                    </div>
                </div>
                {/* Add more learning progress cards */}
            </div>
        </div>
    );
};
