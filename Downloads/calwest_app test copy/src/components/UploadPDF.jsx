import React, { useRef } from 'react';
import WidgetPanel from './WidgetPanel';

const UploadPDF = () => {
  const fileInputRef = useRef(null);

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Handle the selected file here
      console.log('Selected file:', file.name);
      // You can add your file upload logic here
    }
  };

  return (
    <div className="flex flex-col w-full h-screen bg-white relative">
      {/* Header */}
      <header className="bg-blue-900 text-white">
        {/* Top bar */}
        <div className="flex justify-between items-center px-4 py-2">
          <div className="flex items-center">
            <button className="mr-4 text-2xl">&larr;</button>
            <h1 className="text-xl font-semibold">Work Package CG125 - E1</h1>
          </div>
          <div className="flex items-center">
            <span className="mr-2">Jordan Hazelaar</span>
            <span className="text-sm mr-2">Quality Control Manager</span>
            <img src="/path-to-avatar-image.jpg" alt="Avatar" className="w-8 h-8 rounded-full" />
            <button className="ml-2">▼</button>
          </div>
        </div>
        {/* Bottom bar */}
        <div className="flex justify-between items-center px-4 py-2 bg-gray-200 text-black">
          <div className="flex items-center space-x-4">
            <span className="font-bold">D-12328</span>
            <span className="text-gray-600">Drawing Type:</span>
            <span className="text-gray-600">Line Class:</span>
          </div>
          <span className="text-blue-600 cursor-pointer">View All Activity</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="absolute left-1/4 top-1/2 transform -translate-y-1/2 -translate-x-full">
          <WidgetPanel />
        </div>
        <div className="w-[806px] h-[806px] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-center p-16 bg-gray-50 shadow-md">
          {/* Folder Icon SVG */}
          <svg className="w-48 h-48 mb-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <p className="text-gray-700 mb-6 text-3xl">
            Drag and drop or{' '}
            <span 
              className="text-blue-500 cursor-pointer hover:underline" 
              onClick={handleBrowseClick}
            >
              Browse
            </span>
          </p>
          <p className="text-gray-500 text-xl">PDF, (Alt file type) Max 5MB</p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf"
          />
        </div>
      </main>
    </div>
  );
};

export default UploadPDF;