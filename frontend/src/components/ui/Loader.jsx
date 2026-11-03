import React from 'react';

const Loader = ({ text = 'Loading data...', fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div className="relative w-10 h-10">
        <div className="w-10 h-10 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-ping"></div>
        </div>
      </div>
      {text && <p className="text-xs text-slate-400 font-medium tracking-wide animate-pulse">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        {content}
      </div>
    );
  }

  return content;
};

export default Loader;

