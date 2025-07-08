// src/components/property/PropertyDebug.jsx
import React, { useEffect, useState } from 'react';

const PropertyDebug = ({ propertyId }) => {
  const [debugInfo, setDebugInfo] = useState({});
  
  useEffect(() => {
    // Collect debug information
    const lastCreatedId = localStorage.getItem('lastCreatedPropertyId');
    const sessionLastCreatedId = sessionStorage.getItem('lastCreatedPropertyId');
    const storedProperty = sessionStorage.getItem('lastCreatedProperty');
    const newlyCreatedProperty = sessionStorage.getItem('newlyCreatedProperty');
    
    setDebugInfo({
      currentId: propertyId,
      lastCreatedId,
      sessionLastCreatedId,
      hasStoredProperty: !!storedProperty,
      hasNewlyCreatedProperty: !!newlyCreatedProperty,
      timestamp: new Date().toISOString()
    });
  }, [propertyId]);
  
  const clearStorage = () => {
    localStorage.removeItem('lastCreatedPropertyId');
    sessionStorage.removeItem('lastCreatedPropertyId');
    sessionStorage.removeItem('lastCreatedProperty');
    sessionStorage.removeItem('newlyCreatedProperty');
    
    // Update debug info after clearing
    setDebugInfo({
      ...debugInfo,
      lastCreatedId: null,
      sessionLastCreatedId: null,
      hasStoredProperty: false,
      hasNewlyCreatedProperty: false,
      cleared: true,
      timestamp: new Date().toISOString()
    });
  };
  
  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Property Debug Tool</h3>
        <button 
          onClick={clearStorage}
          className="px-3 py-1 bg-red-500 text-white rounded-md text-xs"
        >
          Clear Storage
        </button>
      </div>
      <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-40">{JSON.stringify(debugInfo, null, 2)}</pre>
    </div>
  );
};

export default PropertyDebug;