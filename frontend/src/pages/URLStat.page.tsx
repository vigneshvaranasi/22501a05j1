import { useState, useEffect } from 'react';

interface ClickData {
  timestamp: number;
  source: string;
  location: string;
}

interface URLData {
  shortcode: string;
  originalUrl: string;
  shortLink: string;
  createdAt: string;
  expiryDate: string;
  totalClicks: number;
  clickData: ClickData[];
  isExpired: boolean;
  timeRemaining: number;
}

interface AllURLsResponse {
  urls: URLData[];
  totalUrls: number;
  activeUrls: number;
  expiredUrls: number;
}

function URLStat() {
  const [urlsData, setUrlsData] = useState<AllURLsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedUrl, setExpandedUrl] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');

  useEffect(() => {
    fetchAllUrls();
  }, []);

  const fetchAllUrls = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/shorturls/allurls');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: AllURLsResponse = await response.json();
      setUrlsData(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching URLs:', error);
      setError('Failed to fetch URL statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return 'Expired';
    
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const filteredUrls = urlsData?.urls.filter(url => {
    if (filter === 'active') return !url.isExpired;
    if (filter === 'expired') return url.isExpired;
    return true;
  }) || [];

  const toggleExpandUrl = (shortcode: string) => {
    setExpandedUrl(expandedUrl === shortcode ? null : shortcode);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading URL statistics...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg p-6">
            <div className="text-center">
              <div className="text-red-500 text-xl mb-4">Error</div>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchAllUrls}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">URL Statistics</h1>
            <button
              onClick={fetchAllUrls}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              Refresh
            </button>
          </div>

          {urlsData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800">Total URLs</h3>
                <p className="text-2xl font-bold text-blue-600">{urlsData.totalUrls}</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800">Active URLs</h3>
                <p className="text-2xl font-bold text-green-600">{urlsData.activeUrls}</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-800">Expired URLs</h3>
                <p className="text-2xl font-bold text-red-600">{urlsData.expiredUrls}</p>
              </div>
            </div>
          )}

          <div className="flex gap-2 mb-6">
            {(['all', 'active', 'expired'] as const).map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-4 py-2 rounded-md capitalize ${
                  filter === filterOption
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {filterOption}
              </button>
            ))}
          </div>

          {filteredUrls.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No URLs Found</h3>
              <p className="text-gray-500">
                {filter === 'all' 
                  ? "No shortened URLs have been created yet."
                  : `No ${filter} URLs found.`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUrls.map((url) => (
                <div key={url.shortcode} className={`border rounded-lg p-4 ${
                  url.isExpired ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {url.shortLink}
                        </h3>
                        <button
                          onClick={() => copyToClipboard(url.shortLink)}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          Copy
                        </button>
                        {url.isExpired && (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                            Expired
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 break-all mb-2">{url.originalUrl}</p>
                    </div>
                    <button
                      onClick={() => toggleExpandUrl(url.shortcode)}
                      className="ml-4 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      {expandedUrl === url.shortcode ? 'Hide Details' : 'Show Details'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Created:</span>
                      <p className="text-gray-600">{new Date(url.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Expires:</span>
                      <p className="text-gray-600">{new Date(url.expiryDate).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Total Clicks:</span>
                      <p className="text-gray-600 font-semibold">{url.totalClicks}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Time Remaining:</span>
                      <p className={`font-semibold ${url.isExpired ? 'text-red-600' : 'text-green-600'}`}>
                        {formatTimeRemaining(url.timeRemaining)}
                      </p>
                    </div>
                  </div>

                  {expandedUrl === url.shortcode && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-md font-semibold text-gray-800 mb-3">Click Details</h4>
                      {url.clickData.length === 0 ? (
                        <p className="text-gray-500 italic">No clicks recorded yet</p>
                      ) : (
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {url.clickData.map((click, index) => (
                            <div key={index} className="bg-gray-50 rounded p-3 text-sm">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                <div>
                                  <span className="font-medium text-gray-700">Time:</span>
                                  <p className="text-gray-600">
                                    {new Date(click.timestamp * 1000).toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">Source:</span>
                                  <p className="text-gray-600">{click.source || 'Unknown'}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">Location:</span>
                                  <p className="text-gray-600">{click.location || 'Unknown'}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default URLStat;