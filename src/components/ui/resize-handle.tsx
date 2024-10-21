import React from 'react';
import { PanelResizeHandle } from "react-resizable-panels";

function ResizeHandle({ className = "", ...props }: { className?: string }) {
  return (
    <PanelResizeHandle
      className={`flex items-center justify-center ${className}`}
      {...props}
    >
      <div className="h-[50%] w-1 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors cursor-col-resize">
        <div className="w-4 h-20 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors">
          <div className="w-0.5 h-10 bg-gray-400"></div>
        </div>
      </div>
    </PanelResizeHandle>
  );
}

export default ResizeHandle;