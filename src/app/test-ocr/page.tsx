'use client';

import { useState } from 'react';

export default function TestOCR() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ original: { text: string }[], translated: string } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process file');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 text-foreground">
      <h1 className="text-2xl mb-4">Test OCR</h1>
      <input 
        type="file" 
        accept="application/pdf,image/*" 
        onChange={handleFileUpload}
        className="mb-4"
      />
      
      {loading && <div className="text-blue-500">Processing file...</div>}
      {error && <div className="text-red-500">{error}</div>}
      
      {result && (
        <div className="mt-4">
          <h2 className="text-xl mb-2">Results:</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="border p-4 rounded">
              <h3 className="font-bold mb-2">Original Text:</h3>
              <pre className="whitespace-pre-wrap bg-muted p-2 rounded text-foreground">
                {result.original.map(seg => seg.text).join(' ')}
              </pre>
            </div>
            <div className="border p-4 rounded">
              <h3 className="font-bold mb-2">Translated Text:</h3>
              <pre className="whitespace-pre-wrap bg-muted p-2 rounded text-foreground">
                {result.translated}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
