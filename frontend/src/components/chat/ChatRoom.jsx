import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

export default function ChatRoom({room, tokens, user, vendor, onClose}) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [typingUser, setTypingUser] = useState(null);
    const [socketError, setSocketError] = useState(false);
    const socketRef = useRef(null);
    const listRef = useRef(null);

    const wsUrl = useMemo(() => {
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        return `${protocol}://${window.location.host}/ws/chat/rooms/${room.id}/?token=${tokens?.access || ''}`;
    }, [room.id, tokens]);

    const appendMessages = useCallback((incoming = []) => {
        setMessages((prev) => {
            const existing = new Map(prev.map((m) => [m.id, m]));
            incoming.forEach((msg) => {
                if (msg?.id && !existing.has(msg.id)) {
                    existing.set(msg.id, msg);
                }
            });
            const merged = Array.from(existing.values());
            merged.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            return merged;
        });
    }, []);

    const fetchMessages = useCallback(() => {
        return fetch(`/api/chat/rooms/${room.id}/messages/`, {
            headers: tokens?.access ? {Authorization: `Bearer ${tokens.access}`} : {},
        })
            .then((res) => res.json())
            .then((data) => appendMessages(data || []))
            .catch(() => {
            });
    }, [appendMessages, room.id, tokens]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    useEffect(() => {
        if (!socketError) return undefined;
        const interval = setInterval(() => fetchMessages(), 8000);
        return () => clearInterval(interval);
    }, [fetchMessages, socketError]);

    useEffect(() => {
        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;
        socket.onopen = () => setSocketError(false);
        socket.onmessage = (event) => {
            const payload = JSON.parse(event.data);
            if (payload.type === 'message') {
                appendMessages([payload.message]);
            } else if (payload.type === 'typing') {
                setTypingUser(payload.user);
                setTimeout(() => setTypingUser(null), 1500);
            } else if (payload.type === 'read_receipt') {
                setMessages((prev) =>
                    prev.map((m) => (m.id === payload.message_id ? {...m, read_at: payload.read_at} : m)),
                );
            }
        };
        socket.onclose = () => {
            socketRef.current = null;
            setSocketError(true);
        };
        return () => socket.close();
    }, [appendMessages, wsUrl]);

    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
    fetch(`/api/chat/rooms/${room.id}/messages/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(tokens?.access ? { Authorization: `Bearer ${tokens.access}` } : {}),
      },
      body: JSON.stringify({ text: newMessage.trim() }),
    })
      .then((res) => res.json())
      .then((data) => appendMessages([data]))
      .catch(() => {})
      .finally(() => setNewMessage(''));
    };

    const sendTyping = () => {
        if (socketRef.current) {
            socketRef.current.send(JSON.stringify({type: 'typing'}));
        }
    };

    return (
        <div className="bg-white rounded-lg shadow border overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b">
                <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Chatting with</p>
                    <p className="font-semibold">{vendor?.name || room.vendor_username}</p>
                </div>
                {socketError && <p className="text-xs text-orange-600">Realtime unavailable. Refresh for updates.</p>}
                <button className="text-sm text-blue-600" onClick={onClose}>
                    Close
                </button>
            </div>
            <div ref={listRef} className="max-h-[26rem] overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.map((m) => {
                    const isMe = m.sender === user?.id;
                    return (
                        <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm ${
                                    isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-900 border rounded-bl-none'
                                }`}
                            >
                                <p className="text-sm leading-relaxed">{m.text}</p>
                                <p className={`text-[11px] mt-1 ${isMe ? 'text-blue-100' : 'text-gray-500'}`}>
                                    {new Date(m.created_at).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                    {m.read_at && ' • Read'}
                                </p>
                            </div>
                        </div>
                    );
                })}
                {typingUser && <p className="text-xs text-gray-500">{typingUser} is typing…</p>}
            </div>
            <form onSubmit={sendMessage} className="border-t bg-white p-3">
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={sendTyping}
                        placeholder="Type a message..."
                        className="flex-1 rounded-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                        type="submit"
                        className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-blue-500 transition"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
}