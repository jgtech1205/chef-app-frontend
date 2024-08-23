import React from 'react';

const WidgetPanel = () => {
  return (
    <div className="w-20 bg-gray-100 h-full flex flex-col items-center py-4 space-y-6">
      <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300"></div>
      <div className="flex flex-col items-center">
        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="text-xs text-gray-400 mt-1">Note</span>
      </div>
      <div className="text-xs text-gray-400">*Label</div>
      <div className="text-gray-400">···&gt;</div>
      <div className="text-gray-400">&rarr;</div>
    </div>
  );
};

export default WidgetPanel