// components/admin/ReconcileSection.tsx
'use client';

import { useState } from 'react';

export function ReconcileSection() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runReconcile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reconcile');
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error('Reconcile failed:', error);
    }
    setLoading(false);
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-semibold mb-4">数据对账</h3>
      
      <button
        onClick={runReconcile}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? '对账中...' : '执行对账'}
      </button>

      {result && (
        <div className="mt-4">
          <p>检查了 {result.summary?.checked || 0} 个订单</p>
          <p>更新了 {result.summary?.updated || 0} 个订单</p>
          {result.details?.length > 0 && (
            <details className="mt-2">
              <summary>查看详情</summary>
              <pre className="text-xs mt-2 p-2 bg-gray-100 rounded overflow-auto">
                {JSON.stringify(result.details, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}