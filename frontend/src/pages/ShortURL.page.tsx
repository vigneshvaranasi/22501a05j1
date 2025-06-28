import React, { useState } from 'react';

interface URLEntry {
  id: string;
  originalUrl: string;
  validityPeriod: string;
  preferredShortcode: string;
  errors: {
    originalUrl?: string;
    validityPeriod?: string;
    preferredShortcode?: string;
  };
}

interface ShortenedResult {
  id: string;
  originalUrl: string;
  shortenedUrl: string;
  expiryDate: string;
}

function ShortURL() {
  const [urlEntries, setUrlEntries] = useState<URLEntry[]>([
    {
      id: '1',
      originalUrl: '',
      validityPeriod: '',
      preferredShortcode: '',
      errors: {}
    }
  ]);
  
  const [results, setResults] = useState<ShortenedResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const validateUrl = (url: string): string | undefined => {
    if (!url.trim()) {
      return 'URL is required';
    }
    
    try {
      new URL(url);
      return undefined;
    } catch {
      return 'enter a valid URL';
    }
  };

  const validateValidityPeriod = (period: string): string | undefined => {
    if (period && period.trim()) {
      const num = parseInt(period);
      if (isNaN(num) || num <= 0) {
        return 'Validity period must be a positive integer';
      }
      if (num > 525600) {
        return 'Validity period cannot exceed 1 year (525600 minutes)';
      }
    }
    return undefined;
  };

  const validateShortcode = (shortcode: string): string | undefined => {
    if (shortcode && shortcode.trim()) {
      if (shortcode.length < 4 || shortcode.length > 10) {
        return 'Shortcode must be between 4-10 characters';
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(shortcode)) {
        return 'Shortcode can only contain letters, numbers, hyphens, and underscores';
      }
    }
    return undefined;
  };

  const addUrlEntry = () => {
    if (urlEntries.length < 5) {
      setUrlEntries([
        ...urlEntries,
        {
          id: Date.now().toString(),
          originalUrl: '',
          validityPeriod: '',
          preferredShortcode: '',
          errors: {}
        }
      ]);
    }
  };

  const removeUrlEntry = (id: string) => {
    if (urlEntries.length > 1) {
      setUrlEntries(urlEntries.filter(entry => entry.id !== id));
    }
  };

  const updateUrlEntry = (id: string, field: keyof URLEntry, value: string) => {
    setUrlEntries(urlEntries.map(entry => {
      if (entry.id === id) {
        const updatedEntry = { ...entry, [field]: value };
        if (field in updatedEntry.errors) {
          updatedEntry.errors = { ...updatedEntry.errors, [field]: undefined };
        }
        
        return updatedEntry;
      }
      return entry;
    }));
  };

  const validateAllEntries = (): boolean => {
    let isValid = true;
    
    setUrlEntries(urlEntries.map(entry => {
      const errors = {
        originalUrl: validateUrl(entry.originalUrl),
        validityPeriod: validateValidityPeriod(entry.validityPeriod),
        preferredShortcode: validateShortcode(entry.preferredShortcode)
      };
      
      if (errors.originalUrl || errors.validityPeriod || errors.preferredShortcode) {
        isValid = false;
      }
      
      return { ...entry, errors };
    }));
    
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAllEntries()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const promises = urlEntries.map(async (entry) => {
        const payload = {
          url: entry.originalUrl,
          validity: entry.validityPeriod ? parseInt(entry.validityPeriod) : undefined,
          shortcode: entry.preferredShortcode || undefined
        };
        
        const response = await fetch('http://localhost:5000/shorturls', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error);
        }
        
        const data = await response.json();
        
        return {
          id: entry.id,
          originalUrl: entry.originalUrl,
          shortenedUrl: data.shortLink,
          expiryDate: data.expiry
        };
      });
      
      const results = await Promise.all(promises);
      setResults(results);
      
    } catch (error) {
      console.error('Error shortening URLs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearAll = () => {
    setUrlEntries([{
      id: '1',
      originalUrl: '',
      validityPeriod: '',
      preferredShortcode: '',
      errors: {}
    }]);
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">URL Shortener</h1>
          <p className="text-gray-600 mb-8">Shorten up to 5 URLs concurrently with custom options</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {urlEntries.map((entry, index) => (
              <div key={entry.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">URL #{index + 1}</h3>
                  {urlEntries.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeUrlEntry(entry.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Original URL */}
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Original URL *
                    </label>
                    <input
                      type="text"
                      value={entry.originalUrl}
                      onChange={(e) => updateUrlEntry(entry.id, 'originalUrl', e.target.value)}
                      placeholder="https://example.com/very-long-url"
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        entry.errors.originalUrl ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {entry.errors.originalUrl && (
                      <p className="mt-1 text-sm text-red-600">{entry.errors.originalUrl}</p>
                    )}
                  </div>
                  
                  {/* Validity Period */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Validity Period (minutes)
                    </label>
                    <input
                      type="number"
                      value={entry.validityPeriod}
                      onChange={(e) => updateUrlEntry(entry.id, 'validityPeriod', e.target.value)}
                      placeholder="60"
                      min="1"
                      max="525600"
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        entry.errors.validityPeriod ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {entry.errors.validityPeriod && (
                      <p className="mt-1 text-sm text-red-600">{entry.errors.validityPeriod}</p>
                    )}
                  </div>
                  
                  {/* Preferred Shortcode */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Shortcode
                    </label>
                    <input
                      type="text"
                      value={entry.preferredShortcode}
                      onChange={(e) => updateUrlEntry(entry.id, 'preferredShortcode', e.target.value)}
                      placeholder="my-custom-code"
                      minLength={4}
                      maxLength={10}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        entry.errors.preferredShortcode ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {entry.errors.preferredShortcode && (
                      <p className="mt-1 text-sm text-red-600">{entry.errors.preferredShortcode}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {urlEntries.length < 5 && (
                <button
                  type="button"
                  onClick={addUrlEntry}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Add Another URL
                </button>
              )}
              
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Shortening...' : 'Shorten URLs'}
              </button>
              
              <button
                type="button"
                onClick={clearAll}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Clear All
              </button>
            </div>
          </form>
          
          {/* Results Section */}
          {results.length > 0 && (
            <div className="mt-8 border-t pt-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Shortened URLs</h2>
              <div className="space-y-4">
                {results.map((result) => (
                  <div key={result.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="grid gap-2">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Original URL:</label>
                        <p className="text-gray-600 break-all">{result.originalUrl}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700">Shortened URL:</label>
                        <div className="flex items-center gap-2">
                          <p className="text-blue-600 font-medium break-all">{result.shortenedUrl}</p>
                          <button
                            onClick={() => copyToClipboard(result.shortenedUrl)}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700">Expires:</label>
                        <p className="text-gray-600">{new Date(result.expiryDate).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShortURL;