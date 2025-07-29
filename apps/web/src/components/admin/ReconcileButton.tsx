// components/admin/ReconcileButton.tsx
'use client';

import { useState } from 'react';

export function ReconcileButton() {
    const [isReconciling, setIsReconciling] = useState(false);
    const [results, setResults] = useState(null);
  
    const handleReconcile = async () => {
      setIsReconciling(true);
      try {
        const response = await fetch('/api/admin/reconcile');
        const data = await response.json();
        setResults(data.results);
      } catch (error) {
        console.error('Reconcile failed:', error);
      } finally {
        setIsReconciling(false);
      }
    };
  
    return (
      <div>
        <button 
          onClick={handleReconcile}
          disabled={isReconciling}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {isReconciling ? '对账中...' : '执行数据对账'}
        </button>
        
        {results && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h3 className="font-bold">对账结果：</h3>
            <pre>{JSON.stringify(results, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  }