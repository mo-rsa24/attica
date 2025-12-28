import React, { useEffect, useRef, useState } from 'react';
import { Image, UploadCloud, Video, X } from 'lucide-react';
import { useEventCreation } from './context/reactContext.jsx';
import { useNavigate, useParams } from 'react-router-dom';

export default function ListingStep8_Event() {
    const navigate = useNavigate();
    const { setCurrentStep, saveAndExit, event } = useEventCreation();
    const { eventId } = useParams();
    const listingBase = eventId ? `/listing/${eventId}` : '/createEvent';
    const inputRef = useRef(null);
    const [uploads, setUploads] = useState([]);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        setCurrentStep('step8');
    }, [setCurrentStep]);

    const handleFiles = (fileList) => {
        const next = Array.from(fileList)
            .filter(file => file.type.startsWith('image/') || file.type.startsWith('video/'))
            .map((file) => ({
                id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
                file,
                preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
                isImage: file.type.startsWith('image/'),
                isVideo: file.type.startsWith('video/'),
                size: file.size,
                name: file.name,
            }));

        if (next.length) {
            setUploads((prev) => [...prev, ...next]);
        }
    };

    const onDrop = (event) => {
        event.preventDefault();
        setIsDragging(false);
        if (event.dataTransfer?.files?.length) {
            handleFiles(event.dataTransfer.files);
        }
    };

    const onRemove = (id) => {
        setUploads((prev) => {
            const target = prev.find((item) => item.id === id);
            if (target?.preview) {
                URL.revokeObjectURL(target.preview);
            }
            return prev.filter((item) => item.id !== id);
        });
    };

    useEffect(() => () => {
        uploads.forEach((item) => {
            if (item.preview) URL.revokeObjectURL(item.preview);
        });
    }, [uploads]);

    const humanSize = (bytes) => {
        if (!bytes && bytes !== 0) return '';
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let idx = 0;
        while (size >= 1024 && idx < units.length - 1) {
            size /= 1024;
            idx += 1;
        }
        return `${size.toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`;
    };
    return (
        <div className="bg-white min-h-screen font-sans flex flex-col">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 bg-white z-20">
                 <div className="flex items-center justify-between p-6">
                    <a href="/"><svg viewBox="0 0 1000 1000" role="presentation" aria-hidden="true" focusable="false" className="h-8 w-8 text-pink-600" style={{ display: 'block', fill: 'currentColor' }}><path d="m499.3 736.7c-51-64-81-120.1-91-168.1-10-39-6-70 11-93 18-21 41-32 72-32 31 0 54 11 72 32 17 23 21 54 11 93-11 49-41 105-91 168.1zm362.2 43.2c-11-12.9-25-23.9-40-31.9-50-23.9-92-42.9-123-58.9-32-16-56-28.9-73-38.9-17-9-29-15-37-19-21-10.9-35-18.9-44-24.9-7-5-13-9-20-13-102.1-59-183.1-131-242.1-215-30-42-52-84-65-127.1-14-44-19-87-19-129.1 0-78.1 21-148.1 63-210.1 42-62 101-111 176-147 24-12 50-21 77-28 10-2 19-5 28-7 8-2 17-4 25-6 2-1 3-1 4-2 11-4 22-7 33-9 12-2 24-4 36-4s24 2 36 4c11 2 22 5 33 9 1 1 2 1 4 2 8 2 17 4 25 6 10 2 19 5 28 7 27 7 53 16 77 28 75 36 134 85 176 147 42 62 63 132 63 210.1 0 42-5 85-19 129.1-13 43-35 85-65 127.1-59 84-140 156-242.1 215-7 4-13 8-20 13-9 6-23 14-44 25-8 4-20 10-37 19-17 10-41 23-73 39-31 16-73 35-123 59-15 8-29 19-40 32z"></path></svg></a>
                    <div className="flex items-center space-x-4">
                        <button className="px-4 py-2 text-sm font-semibold text-gray-800 bg-gray-100 rounded-full hover:bg-gray-200">Questions?</button>
                        <button
                            className="px-4 py-2 text-sm font-semibold text-gray-800 bg-gray-100 rounded-full hover:bg-gray-200"
                            onClick={() => saveAndExit(event?.id)}
                        >
                            Save & exit
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex flex-col items-center justify-center pt-24 pb-28 text-center">
                <div className="w-full max-w-2xl mx-auto px-4">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Add photos & video for your event</h1>
                    <p className="text-gray-600 mb-8">Start with a high-quality event poster or photos from past events. Videos are a great way to generate excitement.</p>

                    {/* Media Upload Area */}
                    <div
                        className={`w-full h-96 rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200 flex flex-col items-center justify-center ${isDragging ? 'border-black bg-gray-100' : 'border-gray-300 bg-gray-50'}`}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={onDrop}
                    >
                        <div className="flex flex-col items-center space-y-4">
                            <UploadCloud className="h-16 w-16 text-gray-400" strokeWidth={1.5} />
                            <div className="space-y-1">
                                <p className="text-lg font-semibold text-gray-700">Drag your media here to upload</p>
                                <p className="text-gray-500">High-quality posters, photos, and short videos work best.</p>
                            </div>
                            <div className="flex flex-col items-center space-y-2">
                                <button
                                    type="button"
                                    onClick={() => inputRef.current?.click()}
                                    className="inline-flex items-center justify-center rounded-full bg-black px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:scale-[1.01] hover:bg-gray-800"
                                >
                                    Browse files
                                </button>
                                <p className="text-xs text-gray-500">Images (JPG, PNG) or videos (MP4, MOV). Max 100MB each.</p>
                                <input
                                    ref={inputRef}
                                    type="file"
                                    accept="image/*,video/*"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files?.length) {
                                            handleFiles(e.target.files);
                                            e.target.value = '';
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    {/* Upload Preview */}
                    {uploads.length > 0 && (
                        <div className="mt-8 text-left space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-gray-700">Uploads ({uploads.length})</p>
                                <p className="text-xs text-gray-500">Temporarily stored — will save to your listing.</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {uploads.map((item) => (
                                    <div key={item.id} className="relative rounded-xl border border-gray-200 bg-white shadow-sm p-3 flex items-center space-x-3">
                                        <div className="h-16 w-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                            {item.isImage && item.preview ? (
                                                <img src={item.preview} alt={item.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-gray-500">
                                                    {item.isVideo ? <Video className="h-6 w-6" /> : <Image className="h-6 w-6" />}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="truncate text-sm font-semibold text-gray-800">{item.name}</p>
                                            <p className="text-xs text-gray-500">{item.isVideo ? 'Video' : 'Image'} • {humanSize(item.size)}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => onRemove(item.id)}
                                            aria-label="Remove file"
                                            className="absolute top-2 right-2 rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer with Progress Bar */}
            <footer className="fixed bottom-0 left-0 right-0 bg-white z-20">
                <div className="w-full bg-gray-200 h-1.5"><div className="bg-black h-1.5" style={{ width: '80%' }}></div></div>
                <div className="flex items-center justify-between p-4">
                    <button onClick={() => navigate(`${listingBase}/step7`)}
                            className="font-semibold text-gray-800 underline hover:text-black">Back
                    </button>
                    <button onClick={() => navigate(`${listingBase}/review`)} /* Navigate to a final review step */
                            className="px-8 py-3 text-white bg-gray-800 rounded-lg font-semibold hover:bg-black">Next
                    </button>
                </div>
            </footer>
        </div>
    );
}