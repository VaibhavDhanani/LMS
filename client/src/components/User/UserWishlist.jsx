import React from "react";

export const UserWishlist = () => {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Wishlist</h2>
            <div className="space-y-4">
                <div className="card card-side bg-base-100 shadow-xl">
                    <figure className="w-48"><img src="https://img.daisyui.com/images/stock/photo-1635805737707-575c4f40470d.jpg" alt="Course"/></figure>
                    <div className="card-body">
                        <h2 className="card-title">Machine Learning A-Z</h2>
                        <p>Complete Machine Learning Course</p>
                        <div className="card-actions justify-end">
                            <button className="btn btn-primary">Add to Cart</button>
                            <button className="btn btn-ghost">Remove</button>
                        </div>
                    </div>
                </div>
                {/* Add more wishlist items */}
            </div>
        </div>
    );
};
