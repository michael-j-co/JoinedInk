import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { 
  BookOpenIcon, 
  ArrowDownTrayIcon, 
  ShareIcon,
  HeartIcon,
  CalendarIcon,
  UsersIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';
import { KeepsakeBook, KeepsakeContribution, KeepsakeBookResponse } from '../../types';

export const KeepsakeBookPage: React.FC = () => {
  const { accessToken } = useParams<{ accessToken: string }>();
  const [searchParams] = useSearchParams();
  const isShared = searchParams.get('shared') === 'true';
  
  const [keepsakeData, setKeepsakeData] = useState<KeepsakeBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [copiedShare, setCopiedShare] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [downloadingRaw, setDownloadingRaw] = useState(false);

  useEffect(() => {
    fetchKeepsakeBook();
  }, [accessToken]);

  // Add print styles
  useEffect(() => {
    const printStyles = `
      @media print {
        .no-print { display: none !important; }
        .print-break { page-break-before: always; }
        body { background: white !important; }
        .contribution-page { 
          page-break-inside: avoid; 
          margin-bottom: 2rem !important;
          box-shadow: none !important;
          border: 1px solid #ccc !important;
        }
      }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerText = printStyles;
    document.head.appendChild(styleSheet);
    
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const fetchKeepsakeBook = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/recipients/keepsake/${accessToken}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load keepsake book');
      }

      setKeepsakeData(data.keepsakeBook);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load keepsake book');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloadingPDF(true);
      const response = await fetch(`/api/recipients/keepsake/${accessToken}/pdf`);
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `keepsake-book-${keepsakeData?.recipient.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download PDF error:', err);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handleDownloadRaw = async () => {
    try {
      setDownloadingRaw(true);
      const response = await fetch(`/api/recipients/keepsake/${accessToken}/download`);
      
      if (!response.ok) {
        throw new Error('Failed to generate raw content download');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `keepsake-content-${keepsakeData?.recipient.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download raw content error:', err);
      alert('Failed to download raw content. Please try again.');
    } finally {
      setDownloadingRaw(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    try {
      const response = await fetch(`/api/recipients/keepsake/${accessToken}/share`, {
        method: 'POST'
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate share link');
      }

      await navigator.clipboard.writeText(data.shareableLink);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    } catch (err) {
      console.error('Share error:', err);
      alert('Failed to generate share link. Please try again.');
    }
  };

  const renderContribution = (contribution: KeepsakeContribution, index: number) => {
    const backgroundColor = contribution.backgroundColor || '#ffffff';
    const fontFamily = contribution.fontFamily || 'Inter, sans-serif';

    return (
      <div
        key={contribution.id}
        className={`contribution-page mb-8 sm:mb-12 p-6 sm:p-8 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl ${index > 0 ? 'print-break' : ''}`}
        style={{ 
          backgroundColor, 
          fontFamily,
          minHeight: '300px',
          border: '1px solid rgba(0,0,0,0.1)'
        }}
      >
        {/* Content */}
        {contribution.content && (
          <div 
            className="contribution-content text-gray-800 mb-6 leading-relaxed"
            style={{ fontSize: '16px', lineHeight: '1.7' }}
            dangerouslySetInnerHTML={{ 
              __html: contribution.content.replace(/\n/g, '<br />') 
            }}
          />
        )}

        {/* Media (Images, GIFs, Stickers) */}
        {((contribution.images && contribution.images.length > 0) || (contribution.media && contribution.media.length > 0)) && (
          <div className="contribution-media mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Legacy images support */}
              {contribution.images && contribution.images.map((imageUrl: string, imgIndex: number) => (
                <img
                  key={`legacy-${imgIndex}`}
                  src={imageUrl}
                  alt={`Contribution image ${imgIndex + 1}`}
                  className="w-full h-auto rounded-lg shadow-md max-h-64 object-cover"
                />
              ))}
              
              {/* New media support */}
              {contribution.media && contribution.media.map((mediaItem, mediaIndex) => (
                <div key={`media-${mediaIndex}`} className="relative">
                  {mediaItem.type === 'sticker' ? (
                    <img
                      src={mediaItem.url}
                      alt={mediaItem.alt || 'Sticker'}
                      className="max-w-24 h-auto"
                      style={{
                        position: mediaItem.position ? 'absolute' : 'relative',
                        left: mediaItem.position?.x,
                        top: mediaItem.position?.y,
                        zIndex: mediaItem.position?.zIndex || 1
                      }}
                    />
                  ) : (
                    <img
                      src={mediaItem.url}
                      alt={mediaItem.alt || `${mediaItem.type} ${mediaIndex + 1}`}
                      className="w-full h-auto rounded-lg shadow-md max-h-64 object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Drawings */}
        {contribution.drawings && (
          <div className="contribution-drawings mb-6">
            {typeof contribution.drawings === 'string' ? (
              <img
                src={contribution.drawings}
                alt="Hand-drawn artwork"
                className="max-w-full h-auto rounded-lg shadow-md"
              />
            ) : (
              contribution.drawings.map && contribution.drawings.map((drawing: any, drawIndex: number) => (
                <img
                  key={`drawing-${drawIndex}`}
                  src={drawing.dataUrl || drawing}
                  alt="Hand-drawn artwork"
                  className="max-w-full h-auto rounded-lg shadow-md mb-4"
                />
              ))
            )}
          </div>
        )}

        {/* Signature */}
        {contribution.signature && (
          <div className="contribution-signature flex justify-end mb-4">
            {typeof contribution.signature === 'string' ? (
              <img
                src={contribution.signature}
                alt="Signature"
                className="max-w-48 h-auto"
                style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
              />
            ) : contribution.signature.type === 'drawn' ? (
              <img
                src={contribution.signature.data}
                alt="Signature"
                className="max-w-48 h-auto"
                style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
              />
            ) : contribution.signature.type === 'typed' ? (
              <div 
                className="text-2xl italic text-gray-700"
                style={{ 
                  fontFamily: contribution.signature.font || 'cursive',
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                }}
              >
                {contribution.signature.data}
              </div>
            ) : null}
          </div>
        )}

        {/* Contributor name */}
        {contribution.contributorName && (
          <div className="contributor-name text-right">
            <span className="text-gray-600 italic font-medium">
              — {contribution.contributorName}
            </span>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your keepsake book...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-indigo-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 p-8 rounded-xl border border-red-200">
            <h1 className="text-2xl font-bold text-red-800 mb-4">Unable to Load Keepsake Book</h1>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!keepsakeData) {
    return null;
  }

  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-indigo-50">
        {/* Introduction Page */}
        <div className="flex items-center justify-center min-h-screen p-6">
          <div className="max-w-2xl mx-auto text-center">
            {/* Header */}
            <div className="mb-12">
              <BookOpenIcon className="h-20 w-20 text-rose-500 mx-auto mb-6" />
              <h1 className="text-5xl font-bold text-gray-900 mb-4">
                {keepsakeData.event.title}
              </h1>
              <p className="text-xl text-gray-600 mb-2">A Special Keepsake Book</p>
              <p className="text-3xl font-semibold text-rose-600 mb-8">
                For {keepsakeData.recipient.name}
              </p>
              
              {keepsakeData.event.description && (
                <p className="text-gray-700 text-lg leading-relaxed mb-8 max-w-xl mx-auto">
                  {keepsakeData.event.description}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg">
                <HeartIcon className="h-8 w-8 text-rose-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {keepsakeData.totalContributions}
                </p>
                <p className="text-gray-600">
                  {keepsakeData.totalContributions === 1 ? 'Message' : 'Messages'}
                </p>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg">
                <UsersIcon className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {keepsakeData.event.eventType === 'INDIVIDUAL_TRIBUTE' ? 'Tribute' : 'Circle Notes'}
                </p>
                <p className="text-gray-600">Event Type</p>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg">
                <CheckCircleIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">Complete</p>
                <p className="text-gray-600">Status</p>
              </div>
            </div>

            {/* Enter Button */}
            <button
              onClick={() => setShowIntro(false)}
              className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-12 py-4 rounded-full text-xl font-semibold hover:from-rose-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Open Your Keepsake Book
            </button>

            {/* Shared indicator */}
            {isShared && (
              <p className="mt-6 text-sm text-gray-500">
                This keepsake book was shared with you
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-indigo-50">
      {/* Header with controls */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm no-print">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {keepsakeData.event.title}
              </h1>
              <p className="text-gray-600">For {keepsakeData.recipient.name}</p>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto">
              <button
                onClick={() => setShowIntro(true)}
                className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                title="Back to intro"
              >
                <BookOpenIcon className="h-5 w-5" />
              </button>
              
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 bg-gray-50 text-gray-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 flex-shrink-0"
                title="Print keepsake book"
              >
                <PrinterIcon className="h-4 w-4" />
                <span className="text-sm font-medium hidden sm:inline">Print</span>
              </button>
              
              <button
                onClick={handleShare}
                className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-colors flex-shrink-0 ${
                  copiedShare 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
                title="Share keepsake book"
              >
                <ShareIcon className="h-4 w-4" />
                <span className="text-sm font-medium hidden sm:inline">
                  {copiedShare ? 'Copied!' : 'Share'}
                </span>
              </button>
              
              <button
                onClick={handleDownloadRaw}
                disabled={downloadingRaw}
                className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200 disabled:opacity-50 flex-shrink-0"
                title="Download raw content"
              >
                <DocumentTextIcon className="h-4 w-4" />
                <span className="text-sm font-medium hidden sm:inline">
                  {downloadingRaw ? 'Preparing...' : 'Raw Content'}
                </span>
              </button>
              
              <button
                onClick={handleDownloadPDF}
                disabled={downloadingPDF}
                className="flex items-center space-x-2 bg-rose-50 text-rose-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-rose-100 transition-colors border border-rose-200 disabled:opacity-50 flex-shrink-0"
                title="Download as PDF"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                <span className="text-sm font-medium hidden sm:inline">
                  {downloadingPDF ? 'Generating...' : 'Download PDF'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Keepsake Book Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {keepsakeData.contributions.length === 0 ? (
          <div className="text-center py-20">
            <HeartIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">No Messages Yet</h2>
            <p className="text-gray-500">This keepsake book doesn't have any contributions yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {keepsakeData.contributions.map((contribution, index) => 
              renderContribution(contribution, index)
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-20 pt-12 border-t border-gray-200 text-center">
          <div className="flex items-center justify-center space-x-2 text-gray-500 mb-4">
            <HeartIcon className="h-5 w-5" />
            <span>Created with JoinedInk</span>
          </div>
          <p className="text-sm text-gray-400">
            Generated on {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}; 