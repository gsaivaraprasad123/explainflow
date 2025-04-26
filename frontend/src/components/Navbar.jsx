import React from "react";

const Navbar = () => {
  return (
    <nav className="w-full bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Left Section */}
        <div>
          <h1 className="text-2xl font-bold">ExplainFlow</h1>
          <p className="text-sm font-light">Make your thinking visible</p>
        </div>
        {/* Right Section */}
        <div>
          <a
            href="https://prepforge-nu.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium bg-white text-blue-600 px-4 py-2 rounded-lg shadow hover:bg-gray-100 transition"
          >
            Test your interview skills with PrepForge
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;