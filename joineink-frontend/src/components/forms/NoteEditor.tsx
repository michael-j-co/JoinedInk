import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import SignatureCanvas from 'react-signature-canvas';
import { 
  PhotoIcon, 
  GifIcon, 
  FaceSmileIcon,
  PaintBrushIcon,
  PencilSquareIcon,
  EyeIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import { NoteContent, MediaItem, DrawingData, SignatureData, BackgroundTheme, FontOption } from '../../types';
import { GifPicker } from './GifPicker';
import { StickerPicker } from './StickerPicker';
import { DrawingCanvas } from './DrawingCanvas';
import { BackgroundSelector } from './BackgroundSelector';
import { NotePreview } from './NotePreview';

interface NoteEditorProps {
  recipientName: string;
  eventTitle: string;
  initialContent?: Partial<NoteContent>;
  onSave: (content: NoteContent) => void;
  onPreview: (content: NoteContent) => void;
  isSubmitting?: boolean;
}

const FONT_OPTIONS: FontOption[] = [
  { name: 'Inter', family: 'Inter, sans-serif', category: 'sans-serif', preview: 'Aa' },
  { name: 'Playfair Display', family: 'Playfair Display, serif', category: 'serif', preview: 'Aa' },
  { name: 'Dancing Script', family: 'Dancing Script, cursive', category: 'script', preview: 'Aa' },
  { name: 'Merriweather', family: 'Merriweather, serif', category: 'serif', preview: 'Aa' },
  { name: 'Open Sans', family: 'Open Sans, sans-serif', category: 'sans-serif', preview: 'Aa' },
  { name: 'Pacifico', family: 'Pacifico, cursive', category: 'script', preview: 'Aa' },
];

const BACKGROUND_THEMES: BackgroundTheme[] = [
  { id: 'clean', name: 'Clean White', preview: '#ffffff', cssClass: 'bg-white', gradient: '' },
  { id: 'warm', name: 'Warm Cream', preview: '#fef7ed', cssClass: 'bg-orange-50', gradient: '' },
  { id: 'soft', name: 'Soft Rose', preview: '#fdf2f8', cssClass: 'bg-pink-50', gradient: '' },
  { id: 'gentle', name: 'Gentle Blue', preview: '#eff6ff', cssClass: 'bg-blue-50', gradient: '' },
  { id: 'nature', name: 'Nature Green', preview: '#f0fdf4', cssClass: 'bg-green-50', gradient: '' },
  { id: 'sunset', name: 'Sunset Gradient', preview: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', cssClass: '', gradient: 'bg-gradient-to-br from-orange-100 to-orange-200' },
];

export const NoteEditor: React.FC<NoteEditorProps> = ({
  recipientName,
  eventTitle,
  initialContent,
  onSave,
  onPreview,
  isSubmitting = false
}) => {
  const [content, setContent] = useState<NoteContent>({
    recipientName,
    contributorName: initialContent?.contributorName || '',
    text: initialContent?.text || '',
    formatting: {
      fontFamily: 'Inter, sans-serif',
      fontSize: '16px',
      bold: false,
      italic: false,
      ...initialContent?.formatting
    },
    media: initialContent?.media || [],
    drawings: initialContent?.drawings || [],
    signature: initialContent?.signature,
    backgroundColor: initialContent?.backgroundColor || 'clean',
    theme: initialContent?.theme || 'clean',
    wordCount: 0,
    characterCount: 0
  });

  const [activeTab, setActiveTab] = useState<'write' | 'media' | 'signature' | 'theme' | 'preview'>('write');
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showDrawingCanvas, setShowDrawingCanvas] = useState(false);
  const [signatureMode, setSignatureMode] = useState<'draw' | 'type'>('draw');
  const [typedSignature, setTypedSignature] = useState('');
  const [signatureFont, setSignatureFont] = useState('Dancing Script, cursive');

  const signatureCanvasRef = useRef<SignatureCanvas>(null);
  const richTextEditorRef = useRef<HTMLDivElement>(null);

  // Initialize rich text editor content
  useEffect(() => {
    if (richTextEditorRef.current && initialContent?.text) {
      richTextEditorRef.current.innerHTML = initialContent.text;
    }
  }, [initialContent]);

  // Calculate word and character counts from HTML content
  useEffect(() => {
    // Strip HTML tags to get plain text for counting
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content.text || '';
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);
    const charCount = textContent.length;
    
    setContent(prev => ({
      ...prev,
      wordCount: words.length,
      characterCount: charCount
    }));
  }, [content.text]);

  // Handle text change for rich text editor
  const handleTextChange = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    const htmlContent = e.currentTarget.innerHTML;
    
    setContent(prev => ({
      ...prev,
      text: htmlContent
    }));
  }, []);

  // Handle contributor name change
  const handleContributorNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(prev => ({
      ...prev,
      contributorName: e.target.value
    }));
  }, []);

  // Handle rich text formatting
  const applyFormatting = useCallback((command: string, value?: string) => {
    if (richTextEditorRef.current) {
      richTextEditorRef.current.focus();
      document.execCommand(command, false, value);
      
      // Update the content state with the HTML content
      setContent(prev => ({
        ...prev,
        text: richTextEditorRef.current?.innerHTML || ''
      }));
    }
  }, []);

  const toggleBold = useCallback(() => {
    applyFormatting('bold');
  }, [applyFormatting]);

  const toggleItalic = useCallback(() => {
    applyFormatting('italic');
  }, [applyFormatting]);

  const toggleUnderline = useCallback(() => {
    applyFormatting('underline');
  }, [applyFormatting]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          toggleBold();
          break;
        case 'i':
          e.preventDefault();
          toggleItalic();
          break;
        case 'u':
          e.preventDefault();
          toggleUnderline();
          break;
        default:
          break;
      }
    }
  }, [toggleBold, toggleItalic, toggleUnderline]);

  const handleFontChange = useCallback((fontFamily: string) => {
    setContent(prev => ({
      ...prev,
      formatting: { ...prev.formatting, fontFamily }
    }));
  }, []);

  // Handle media uploads
  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const mediaItem: MediaItem = {
          id: Date.now().toString(),
          type: 'image',
          url: reader.result as string,
          alt: file.name
        };
        setContent(prev => ({
          ...prev,
          media: [...prev.media, mediaItem]
        }));
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: 5 * 1024 * 1024 // 5MB limit
  });

  // Handle GIF selection
  const handleGifSelect = useCallback((gif: any) => {
    const mediaItem: MediaItem = {
      id: gif.id,
      type: 'gif',
      url: gif.images.fixed_height.url,
      alt: gif.title
    };
    setContent(prev => ({
      ...prev,
      media: [...prev.media, mediaItem]
    }));
    setShowGifPicker(false);
  }, []);

  // Handle sticker selection
  const handleStickerSelect = useCallback((sticker: any) => {
    const mediaItem: MediaItem = {
      id: sticker.id,
      type: 'sticker',
      url: sticker.url,
      alt: sticker.alt
    };
    setContent(prev => ({
      ...prev,
      media: [...prev.media, mediaItem]
    }));
    setShowStickerPicker(false);
  }, []);

  // Handle drawing save
  const handleDrawingSave = useCallback((drawingData: DrawingData) => {
    setContent(prev => ({
      ...prev,
      drawings: [...prev.drawings, drawingData]
    }));
    setShowDrawingCanvas(false);
  }, []);

  // Handle signature save
  const handleSignatureSave = useCallback(() => {
    if (signatureMode === 'draw' && signatureCanvasRef.current) {
      const dataUrl = signatureCanvasRef.current.toDataURL();
      if (!signatureCanvasRef.current.isEmpty()) {
        const signatureData: SignatureData = {
          type: 'drawn',
          data: dataUrl
        };
        setContent(prev => ({ ...prev, signature: signatureData }));
      }
    } else if (signatureMode === 'type' && typedSignature.trim()) {
      const signatureData: SignatureData = {
        type: 'typed',
        data: typedSignature,
        font: signatureFont
      };
      setContent(prev => ({ ...prev, signature: signatureData }));
    }
  }, [signatureMode, typedSignature, signatureFont]);

  // Handle background theme change
  const handleThemeChange = useCallback((themeId: string) => {
    setContent(prev => ({
      ...prev,
      backgroundColor: themeId,
      theme: themeId
    }));
  }, []);

  // Remove media item
  const removeMediaItem = useCallback((id: string) => {
    setContent(prev => ({
      ...prev,
      media: prev.media.filter(item => item.id !== id)
    }));
  }, []);

  // Remove drawing
  const removeDrawing = useCallback((id: string) => {
    setContent(prev => ({
      ...prev,
      drawings: prev.drawings.filter(drawing => drawing.id !== id)
    }));
  }, []);

  // Clear signature
  const clearSignature = useCallback(() => {
    setContent(prev => ({
      ...prev,
      signature: undefined
    }));
    if (signatureCanvasRef.current) {
      signatureCanvasRef.current.clear();
    }
    setTypedSignature('');
  }, []);

  const handleSave = () => {
    onSave(content);
  };

  const handlePreview = () => {
    onPreview(content);
    setActiveTab('preview');
  };

  const currentTheme = BACKGROUND_THEMES.find(theme => theme.id === content.backgroundColor) || BACKGROUND_THEMES[0];

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Write a Message for {recipientName}
        </h1>
        <p className="text-gray-600">{eventTitle}</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {[
            { id: 'write', name: 'Write', icon: PencilSquareIcon },
            { id: 'media', name: 'Media', icon: PhotoIcon },
            { id: 'signature', name: 'Signature', icon: PaintBrushIcon },
            { id: 'theme', name: 'Theme', icon: FaceSmileIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`${
                activeTab === tab.id
                  ? 'border-rose-500 text-rose-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Editor Panel */}
        <div className="space-y-6">
          {activeTab === 'write' && (
            <div className="space-y-4">
              {/* Contributor Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name (Optional - leave blank for anonymous)
                </label>
                <input
                  type="text"
                  value={content.contributorName}
                  onChange={handleContributorNameChange}
                  placeholder="Enter your name or leave blank"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                />
              </div>

              {/* Font Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Font</label>
                <div className="grid grid-cols-3 gap-2">
                  {FONT_OPTIONS.map((font) => (
                    <button
                      key={font.name}
                      onClick={() => handleFontChange(font.family)}
                      className={`p-2 text-center border rounded-md hover:bg-gray-50 ${
                        content.formatting.fontFamily === font.family
                          ? 'border-rose-500 bg-rose-50'
                          : 'border-gray-300'
                      }`}
                      style={{ fontFamily: font.family }}
                    >
                      <div className="text-lg">{font.preview}</div>
                      <div className="text-xs text-gray-600">{font.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Formatting Controls */}
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={toggleBold}
                  className="px-3 py-1 border rounded-md bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  title="Bold (Ctrl+B)"
                >
                  <strong>B</strong>
                </button>
                <button
                  type="button"
                  onClick={toggleItalic}
                  className="px-3 py-1 border rounded-md bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  title="Italic (Ctrl+I)"
                >
                  <em>I</em>
                </button>
                <button
                  type="button"
                  onClick={toggleUnderline}
                  className="px-3 py-1 border rounded-md bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  title="Underline (Ctrl+U)"
                >
                  <span className="underline">U</span>
                </button>
              </div>

              {/* Rich Text Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Message
                </label>
                <div
                  ref={richTextEditorRef}
                  contentEditable
                  onInput={handleTextChange}
                  onKeyDown={handleKeyDown}
                  className="w-full min-h-[300px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none"
                  style={{
                    fontFamily: content.formatting.fontFamily,
                  }}
                  data-placeholder="Write your heartfelt message here..."
                  suppressContentEditableWarning={true}
                />
                <style>{`
                  [contenteditable]:empty:before {
                    content: attr(data-placeholder);
                    color: #9CA3AF;
                    pointer-events: none;
                  }
                  [contenteditable]:focus:before {
                    display: none;
                  }
                `}</style>
                <div className="mt-2 text-sm text-gray-500 flex justify-between">
                  <span>{content.wordCount} words</span>
                  <span>{content.characterCount} characters</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Add Images</label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-rose-500 bg-rose-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    {isDragActive
                      ? 'Drop the images here...'
                      : 'Drag & drop images here, or click to select'}
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                </div>
              </div>

              {/* Media Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setShowGifPicker(true)}
                  className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <GifIcon className="h-6 w-6 text-gray-600" />
                  <span>Add GIF</span>
                </button>
                <button
                  onClick={() => setShowStickerPicker(true)}
                  className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <FaceSmileIcon className="h-6 w-6 text-gray-600" />
                  <span>Add Sticker</span>
                </button>
              </div>

              {/* Drawing Canvas Button */}
              <button
                onClick={() => setShowDrawingCanvas(true)}
                className="w-full flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <PaintBrushIcon className="h-6 w-6 text-gray-600" />
                <span>Create Drawing</span>
              </button>

              {/* Media Preview */}
              {(content.media.length > 0 || content.drawings.length > 0) && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Added Media</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {content.media.map((item) => (
                      <div key={item.id} className="relative group">
                        <img
                          src={item.url}
                          alt={item.alt}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeMediaItem(item.id)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {content.drawings.map((drawing) => (
                      <div key={drawing.id} className="relative group">
                        <img
                          src={drawing.dataUrl}
                          alt="Drawing"
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeDrawing(drawing.id)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'signature' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Add Your Signature</label>
                
                {/* Signature Mode Toggle */}
                <div className="flex space-x-4 mb-4">
                  <button
                    onClick={() => setSignatureMode('draw')}
                    className={`px-4 py-2 rounded-md ${
                      signatureMode === 'draw'
                        ? 'bg-rose-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Draw Signature
                  </button>
                  <button
                    onClick={() => setSignatureMode('type')}
                    className={`px-4 py-2 rounded-md ${
                      signatureMode === 'type'
                        ? 'bg-rose-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Type Signature
                  </button>
                </div>

                {signatureMode === 'draw' ? (
                  <div className="space-y-4">
                    <div className="border border-gray-300 rounded-lg">
                      <SignatureCanvas
                        ref={signatureCanvasRef}
                        canvasProps={{
                          width: 400,
                          height: 150,
                          className: 'rounded-lg'
                        }}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => signatureCanvasRef.current?.clear()}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Clear
                      </button>
                      <button
                        onClick={handleSignatureSave}
                        className="px-4 py-2 text-sm bg-rose-500 text-white rounded-md hover:bg-rose-600"
                      >
                        Save Signature
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Signature Font
                      </label>
                      <select
                        value={signatureFont}
                        onChange={(e) => setSignatureFont(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                      >
                        <option value="Dancing Script, cursive">Dancing Script</option>
                        <option value="Pacifico, cursive">Pacifico</option>
                        <option value="Great Vibes, cursive">Great Vibes</option>
                        <option value="Sacramento, cursive">Sacramento</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      value={typedSignature}
                      onChange={(e) => setTypedSignature(e.target.value)}
                      placeholder="Type your signature"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                      style={{ fontFamily: signatureFont, fontSize: '24px' }}
                    />
                    <button
                      onClick={handleSignatureSave}
                      className="px-4 py-2 text-sm bg-rose-500 text-white rounded-md hover:bg-rose-600"
                    >
                      Save Signature
                    </button>
                  </div>
                )}

                {/* Current Signature Preview */}
                {content.signature && (
                  <div className="mt-6 p-4 border border-gray-200 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Current Signature:</h4>
                    {content.signature.type === 'drawn' ? (
                      <img src={content.signature.data} alt="Signature" className="max-h-20" />
                    ) : (
                      <div
                        style={{ 
                          fontFamily: content.signature.font || signatureFont,
                          fontSize: '24px'
                        }}
                        className="text-gray-800"
                      >
                        {content.signature.data}
                      </div>
                    )}
                    <button
                      onClick={clearSignature}
                      className="mt-2 text-sm text-red-600 hover:text-red-800"
                    >
                      Remove Signature
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'theme' && (
            <BackgroundSelector
              themes={BACKGROUND_THEMES}
              selectedTheme={content.backgroundColor}
              onThemeChange={handleThemeChange}
            />
          )}
        </div>

        {/* Preview Panel */}
        <div className="lg:sticky lg:top-6">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">Live Preview</h3>
            </div>
            <div className="h-96 overflow-y-auto">
              <NotePreview content={content} theme={currentTheme} />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-between items-center">
        <button
          onClick={handlePreview}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
        >
          <EyeIcon className="h-5 w-5" />
          <span>Full Preview</span>
        </button>
        
        <button
          onClick={handleSave}
          disabled={isSubmitting || !content.text.trim()}
          className="px-8 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <CloudArrowUpIcon className="h-5 w-5" />
              <span>Submit Message</span>
            </>
          )}
        </button>
      </div>

      {/* Modals */}
      {showGifPicker && (
        <GifPicker
          onSelect={handleGifSelect}
          onClose={() => setShowGifPicker(false)}
        />
      )}
      
      {showStickerPicker && (
        <StickerPicker
          onSelect={handleStickerSelect}
          onClose={() => setShowStickerPicker(false)}
        />
      )}
      
      {showDrawingCanvas && (
        <DrawingCanvas
          onSave={handleDrawingSave}
          onClose={() => setShowDrawingCanvas(false)}
        />
      )}
    </div>
  );
}; 