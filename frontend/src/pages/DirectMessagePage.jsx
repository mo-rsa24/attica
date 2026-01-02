import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate, useParams, useSearchParams} from 'react-router-dom';
import {FaArrowLeft, FaImage, FaPaperPlane, FaPaperclip} from 'react-icons/fa';
import {useAuth} from '../AuthContext';
import BidModal from '../components/chat/BidModal';

const MessageBubble = ({message, isMe, canActOnBid, onBidAction}) => {
    const attachments = message.attachments || [];
    const bid = message.bid_details;
    const bidTextClass = isMe ? 'text-gray-100' : 'text-gray-700';

    return (
        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm ${
                    isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-900 border rounded-bl-none'
                } space-y-2`}
            >
                {bid && (
                    <div
                        className={`rounded-lg border p-3 space-y-2 ${isMe ? 'bg-blue-700/60 border-blue-100' : 'bg-gray-50'}`}>
                        <p className="text-sm font-semibold">Bid: {bid.currency} {bid.amount}</p>
                        {bid.tier && <p className={`text-xs ${bidTextClass}`}>{bid.tier}</p>}
                        {bid.notes && <p className={`text-xs mt-1 ${bidTextClass}`}>{bid.notes}</p>}
                        <p className={`text-xs mt-2 ${bidTextClass}`}>Status: {bid.status}</p>
                        {bid.counter_amount &&
                            <p className={`text-xs ${bidTextClass}`}>Counter: {bid.counter_amount}</p>}
                        {canActOnBid && (
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    className="px-3 py-1 rounded bg-green-600 text-white text-xs"
                                    onClick={() => onBidAction?.(bid.id, 'accept')}
                                >
                                    Accept
                                </button>
                                <button
                                    type="button"
                                    className="px-3 py-1 rounded bg-red-600 text-white text-xs"
                                    onClick={() => onBidAction?.(bid.id, 'decline')}
                                >
                                    Decline
                                </button>
                            </div>
                        )}
                    </div>
                )}
                {message.text && <p className="text-sm leading-relaxed">{message.text}</p>}
                {attachments.length > 0 && (
                    <div className="space-y-2">
                        {attachments.map((att) => (
                            <AttachmentPreview key={att.id} attachment={att}/>
                        ))}
                    </div>
                )}
                <p className={`text-[11px] ${isMe ? 'text-blue-100' : 'text-gray-500'}`}>
                    {new Date(message.created_at).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                    {message.read_at && ' • Read'}
                </p>
            </div>
        </div>
    );
};

const AttachmentPreview = ({attachment}) => {
    const isImage = attachment.file?.match(/\.(png|jpe?g|gif|webp)$/i);
    return (
        <div className="text-sm">
            {isImage ? (
                <img src={attachment.file} alt={attachment.original_name || 'Attachment'}
                     className="max-h-52 rounded-lg"/>
            ) : (
                <a href={attachment.file} target="_blank" rel="noreferrer"
                   className="text-xs underline flex items-center gap-2">
                    <FaPaperclip/>
                    {attachment.original_name || 'Download file'}
                </a>
            )}
        </div>
    );
};

export default function DirectMessagePage() {
    const {roomId} = useParams();
    const [searchParams] = useSearchParams();
    const {user, tokens} = useAuth();
    const navigate = useNavigate();

    const [room, setRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [composerText, setComposerText] = useState('');
    const [uploading, setUploading] = useState(false);
    const [pendingFiles, setPendingFiles] = useState([]);
    const [showBidModal, setShowBidModal] = useState(false);
    const [socketError, setSocketError] = useState(false);

    const socketRef = useRef(null);
    const listRef = useRef(null);
    const reconnectRef = useRef(null);

    const counterpart = useMemo(() => {
        if (!room || !user) return null;
        const isOrganizer = room.organizer === user.id;
        const otherName = isOrganizer ? room.vendor_username : room.organizer_username;
        const otherId = isOrganizer ? room.vendor : room.organizer;
        return {id: otherId, name: otherName};
    }, [room, user]);

    const wsUrl = useMemo(() => {
        if (!roomId) return null;
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        return `${protocol}://${window.location.host}/ws/chat/rooms/${roomId}/?token=${tokens?.access || ''}`;
    }, [roomId, tokens]);

    const appendMessages = useCallback((incoming = []) => {
        setMessages((prev) => {
            const byId = new Map(prev.map((m) => [m.id, m]));
            incoming.forEach((msg) => {
                if (msg?.id) {
                    byId.set(msg.id, {...(byId.get(msg.id) || {}), ...msg});
                }
            });
            const merged = Array.from(byId.values());
            merged.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            return merged;
        });
    }, []);

    const fetchMessages = useCallback(async () => {
        if (!tokens?.access) return;
        const res = await fetch(`/api/chat/rooms/${roomId}/messages/`, {
            headers: {Authorization: `Bearer ${tokens.access}`},
        });
        if (res.ok) {
            const msgs = await res.json();
            appendMessages(msgs || []);
        }
    }, [appendMessages, roomId, tokens]);


    useEffect(() => {
        if (!tokens?.access) {
            setError('Please sign in to view your messages.');
            setLoading(false);
            return;
        }
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            try {
                const roomRes = await fetch(`/api/chat/rooms/${roomId}/`, {
                    headers: {Authorization: `Bearer ${tokens.access}`},
                });
                const messagesRes = await fetch(`/api/chat/rooms/${roomId}/messages/`, {
                    headers: {Authorization: `Bearer ${tokens.access}`},
                });
                if (!roomRes.ok) throw new Error('Unable to load room.');
                if (!messagesRes.ok) throw new Error('Unable to load messages.');
                const roomData = await roomRes.json();
                const msgs = await messagesRes.json();
                if (!cancelled) {
                    setRoom(roomData);
                    appendMessages(msgs || []);
                }
            } catch (err) {
                if (!cancelled) setError(err.message || 'Failed to load chat.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, [appendMessages, roomId, tokens]);

    useEffect(() => {
        if (!wsUrl) return;
        const connect = () => {
            const socket = new WebSocket(wsUrl);
            socketRef.current = socket;
            socket.onopen = () => setSocketError(false);
            socket.onmessage = (event) => {
                const payload = JSON.parse(event.data);
                if (payload.type === 'message' && payload.message) {
                    appendMessages([payload.message]);
                } else if (payload.type === 'bid' && payload.message) {
                    appendMessages([payload.message]);
                } else if (payload.type === 'typing') {
                    // typing indicator placeholder
                } else if (payload.type === 'read_receipt') {
                    setMessages((prev) => prev.map((m) => (m.id === payload.message_id ? {
                        ...m,
                        read_at: payload.read_at
                    } : m)));
                } else if (payload.type === 'warning' && payload.detail) {
                    setSocketError(true);
                }
            };
            socket.onerror = () => setSocketError(true);
            socket.onclose = () => {
                socketRef.current = null;
                setSocketError(true);
                reconnectRef.current = setTimeout(connect, 4000);
            };
        };
        connect();

        return () => {
            if (reconnectRef.current) clearTimeout(reconnectRef.current);
            socketRef.current?.close();
        };
    }, [appendMessages, wsUrl]);

    useEffect(() => {
        if (!socketError) return undefined;
        const interval = setInterval(() => {
            fetchMessages();
        }, 8000);
        return () => clearInterval(interval);
    }, [fetchMessages, socketError]);

    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (searchParams.get('bid') === '1') {
            setShowBidModal(true);
        }
    }, [searchParams]);

    const handleFileChange = (e) => {
        setPendingFiles(Array.from(e.target.files || []));
    };

    const uploadAttachments = async () => {
        if (!pendingFiles.length) return [];
        const uploadedIds = [];
        setUploading(true);
        try {
            for (const file of pendingFiles) {
                const formData = new FormData();
                formData.append('file', file);
                const res = await fetch(`/api/chat/rooms/${roomId}/attachments/`, {
                    method: 'POST',
                    headers: {
                        ...(tokens?.access ? {Authorization: `Bearer ${tokens.access}`} : {}),
                    },
                    body: formData,
                });
                if (res.ok) {
                    const data = await res.json();
                    uploadedIds.push(data.id);
                }
            }
        } finally {
            setUploading(false);
            setPendingFiles([]);
        }
        return uploadedIds;
    };

    const sendMessage = async (e) => {
        e?.preventDefault();
        const trimmed = composerText.trim();
        const attachments = await uploadAttachments();
        if (!trimmed && attachments.length === 0) return;
        try {
            const res = await fetch(`/api/chat/rooms/${roomId}/messages/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(tokens?.access ? {Authorization: `Bearer ${tokens.access}`} : {}),
                },
                body: JSON.stringify({
                    text: trimmed,
                    attachment_ids: attachments,
                }),
            });
            if (!res.ok) throw new Error('Failed to send message.');
            const data = await res.json();
            appendMessages([data]);
            setComposerText('');
        } catch (err) {
            setError(err.message || 'Failed to send message.');
        }
    };

    const handleBidSubmit = () => {
        setShowBidModal(false);
    };

    const handleBidAction = async (bidId, action) => {
        if (!bidId || !action) return;
        const body = {};
        if (action === 'accept') body.accept = true;
        if (action === 'decline') body.decline = true;
        const res = await fetch(`/api/chat/rooms/${roomId}/bids/${bidId}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...(tokens?.access ? {Authorization: `Bearer ${tokens.access}`} : {}),
            },
            body: JSON.stringify(body),
        });
        if (res.ok) {
            const updated = await res.json();
            setMessages((prev) =>
                prev.map((m) =>
                    m.bid === bidId
                        ? {...m, bid_details: {...(m.bid_details || {}), ...updated}, text: `Bid ${updated.status}`}
                        : m,
                ),
            );
        }
    };

    const renderMessage = (message) => {
        const isMe = message.sender === user?.id;
        const canActOnBid = message.bid_details?.status === 'pending' && user?.id === room?.vendor;
        return <MessageBubble key={message.id} message={message} isMe={isMe} canActOnBid={canActOnBid}
                              onBidAction={handleBidAction}/>;
    };

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto p-4">
                <p className="text-gray-600">Loading chat…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-5xl mx-auto p-4">
                <button onClick={() => navigate(-1)} className="text-blue-600 text-sm mb-2 flex items-center gap-2">
                    <FaArrowLeft/> Back
                </button>
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-5xl mx-auto py-4 px-4 space-y-4">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="text-blue-600 text-sm flex items-center gap-2">
                        <FaArrowLeft/> Back
                    </button>
                    <div>
                        <p className="text-xs text-gray-500 uppercase">Direct Message</p>
                        <h1 className="text-xl font-semibold">{counterpart?.name || 'Chat'}</h1>
                    </div>
                </div>
                {socketError && (
                    <div className="p-3 rounded-lg bg-orange-50 text-orange-800 border border-orange-200 text-sm">
                        Realtime updates are temporarily unavailable. Your messages are still delivered, and we will
                        refresh
                        periodically—manually refresh to see the latest if needed.
                    </div>
                )}
                <div className="bg-white rounded-xl shadow border flex flex-col h-[75vh]">
                    <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                        {messages.map(renderMessage)}
                    </div>

                    <form onSubmit={sendMessage} className="border-t bg-white p-3">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                className="px-3 py-2 rounded-lg border text-sm font-semibold hover:bg-gray-50"
                                onClick={() => setShowBidModal(true)}
                            >
                                Request to Book / Bid
                            </button>
                            <label
                                className="flex items-center gap-1 px-3 py-2 rounded-lg border cursor-pointer hover:bg-gray-50">
                                <FaImage/>
                                <span className="text-sm">Attach</span>
                                <input type="file" className="hidden" multiple onChange={handleFileChange}/>
                            </label>
                            <input
                                type="text"
                                value={composerText}
                                onChange={(e) => setComposerText(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 rounded-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button
                                type="submit"
                                disabled={uploading}
                                className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-blue-500 transition disabled:opacity-50"
                            >
                                <FaPaperPlane/>
                                Send
                            </button>
                        </div>
                        {pendingFiles.length > 0 && (
                            <p className="text-xs text-gray-600 mt-2">{pendingFiles.length} file(s) ready to upload</p>
                        )}
                    </form>
                </div>
            </div>

            {room && (
                <BidModal
                    room={room}
                    open={showBidModal}
                    onClose={() => setShowBidModal(false)}
                    tokens={tokens}
                    onSubmit={handleBidSubmit}
                />
            )}
        </div>
    );
}