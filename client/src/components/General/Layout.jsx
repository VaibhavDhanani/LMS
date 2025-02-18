// Layout.jsx
import React from "react";
import Navigationbar from "../Navbars/Navigationbar";
import Footer from "../Footer/Footer";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigationbar />
      <div className="flex-1 bg-gray-100">
        {children}
      </div>
      <Footer />
    </div>
  );
};

export default Layout;