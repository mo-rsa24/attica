import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Link} from 'react-router-dom';
import {FaCommentDots, FaHeart, FaImage, FaRegHeart, FaRetweet} from 'react-icons/fa';
import {useAuth} from './AuthContext';
import FloatingActionButton from './FloatingActionButton.jsx';
import useAxios from './utils/useAxios';

const PAGE_SIZE = 8;

const normalizeMediaUrl = (url) => {
    if (!url || typeof url !== 'string') return '';
    if (url.startsWith('blob:') || url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    if (url.startsWith('/')) return url;
    return `/media/${url.replace(/^\/+/, '')}`;
};

const formatTimeAgo = (value) => {
    if (!value) return 'just now';
    const seconds = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo`;
    return `${Math.floor(months / 12)}y`;
};

const roleToLabel = (role) => {
    if (!role) return '';
    return role
        .toLowerCase()
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

function HomePage() {
    const {tokens, user} = useAuth();
    const api = useAxios();

    const [posts, setPosts] = useState([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [nextOffset, setNextOffset] = useState(0);
    const [feedError, setFeedError] = useState('');

    const [composerText, setComposerText] = useState('');
    const [composerImage, setComposerImage] = useState(null);
    const [composerPreview, setComposerPreview] = useState('');
    const [isSubmittingPost, setIsSubmittingPost] = useState(false);

    const [expandedComments, setExpandedComments] = useState({});
    const [commentsByPost, setCommentsByPost] = useState({});
    const [commentDrafts, setCommentDrafts] = useState({});
    const [loadingCommentsByPost, setLoadingCommentsByPost] = useState({});
    const [submittingCommentByPost, setSubmittingCommentByPost] = useState({});

    const composerPreviewRef = useRef(null);
    const loadMoreRef = useRef(null);

    const patchPost = useCallback((postId, patch) => {
        setPosts(prev => prev.map(post => (post.id === postId ? {...post, ...patch} : post)));
    }, []);

    const resetComposerImage = () => {
        if (composerPreviewRef.current) {
            URL.revokeObjectURL(composerPreviewRef.current);
            composerPreviewRef.current = null;
        }
        setComposerImage(null);
        setComposerPreview('');
    };

    const loadFeedPage = useCallback(async ({offset, replace}) => {
        if (!tokens?.access) {
            setPosts([]);
            setIsInitialLoading(false);
            setIsLoadingMore(false);
            setHasMore(false);
            return;
        }

        if (replace) {
            setIsInitialLoading(true);
            setFeedError('');
        } else {
            setIsLoadingMore(true);
        }

        try {
            const {data} = await api.get('/api/accounts/social-posts/', {
                params: {offset, limit: PAGE_SIZE},
            });
            const incoming = Array.isArray(data?.results) ? data.results : [];

            setPosts(prev => {
                if (replace) return incoming;
                const existingIds = new Set(prev.map(post => post.id));
                const fresh = incoming.filter(post => !existingIds.has(post.id));
                return [...prev, ...fresh];
            });

            setHasMore(Boolean(data?.has_more));
            if (typeof data?.next_offset === 'number') {
                setNextOffset(data.next_offset);
            } else {
                setNextOffset(offset + incoming.length);
            }
        } catch (error) {
            console.error('Failed to load explore feed', error);
            setFeedError('Could not load explore feed right now.');
            if (replace) {
                setPosts([]);
            }
        } finally {
            if (replace) {
                setIsInitialLoading(false);
            } else {
                setIsLoadingMore(false);
            }
        }
    }, [api, tokens?.access]);

    useEffect(() => {
        loadFeedPage({offset: 0, replace: true});
    }, [loadFeedPage]);

    useEffect(() => {
        const node = loadMoreRef.current;
        if (!node || !hasMore || isInitialLoading || isLoadingMore) return;

        const observer = new IntersectionObserver(
            entries => {
                if (!entries[0]?.isIntersecting || isLoadingMore) return;
                loadFeedPage({offset: nextOffset, replace: false});
            },
            {rootMargin: '220px 0px'}
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [hasMore, isInitialLoading, isLoadingMore, loadFeedPage, nextOffset]);

    useEffect(() => {
        return () => {
            if (composerPreviewRef.current) {
                URL.revokeObjectURL(composerPreviewRef.current);
            }
        };
    }, []);

    const handleComposerImageChange = (event) => {
        const file = event.target.files?.[0] || null;
        resetComposerImage();
        if (!file) return;

        const objectUrl = URL.createObjectURL(file);
        composerPreviewRef.current = objectUrl;
        setComposerImage(file);
        setComposerPreview(objectUrl);
    };

    const handleCreatePost = async (event) => {
        event.preventDefault();
        const trimmedText = composerText.trim();
        if (!trimmedText && !composerImage) return;

        setIsSubmittingPost(true);
        try {
            const formData = new FormData();
            formData.append('text', trimmedText);
            if (composerImage) {
                formData.append('image', composerImage);
            }

            const {data} = await api.post('/api/accounts/social-posts/', formData);
            setPosts(prev => [data, ...prev]);
            setComposerText('');
            resetComposerImage();
        } catch (error) {
            console.error('Failed to create social post', error);
        } finally {
            setIsSubmittingPost(false);
        }
    };

    const handleToggleLike = async (postId) => {
        try {
            const {data} = await api.post(`/api/accounts/social-posts/${postId}/like/`);
            patchPost(postId, {
                is_liked: Boolean(data?.liked),
                like_count: Number(data?.like_count) || 0,
            });
        } catch (error) {
            console.error('Failed to like post', error);
        }
    };

    const handleShare = async (postId) => {
        try {
            const {data} = await api.post(`/api/accounts/social-posts/${postId}/share/`);
            patchPost(postId, {
                shares_count: Number(data?.shares_count) || 0,
            });
        } catch (error) {
            console.error('Failed to share post', error);
        }
    };

    const loadComments = async (postId) => {
        setLoadingCommentsByPost(prev => ({...prev, [postId]: true}));
        try {
            const {data} = await api.get(`/api/accounts/social-posts/${postId}/comments/`);
            setCommentsByPost(prev => ({
                ...prev,
                [postId]: Array.isArray(data) ? data : [],
            }));
        } catch (error) {
            console.error('Failed to load comments', error);
        } finally {
            setLoadingCommentsByPost(prev => ({...prev, [postId]: false}));
        }
    };

    const handleToggleComments = async (postId) => {
        const shouldOpen = !expandedComments[postId];
        setExpandedComments(prev => ({...prev, [postId]: shouldOpen}));

        if (shouldOpen && !commentsByPost[postId]) {
            await loadComments(postId);
        }
    };

    const handleSubmitComment = async (event, postId) => {
        event.preventDefault();
        const content = (commentDrafts[postId] || '').trim();
        if (!content) return;

        setSubmittingCommentByPost(prev => ({...prev, [postId]: true}));
        try {
            const {data} = await api.post(`/api/accounts/social-posts/${postId}/comments/`, {content});
            setCommentsByPost(prev => ({
                ...prev,
                [postId]: [data, ...(prev[postId] || [])],
            }));
            setCommentDrafts(prev => ({...prev, [postId]: ''}));
            setExpandedComments(prev => ({...prev, [postId]: true}));

            setPosts(prev => prev.map(post => {
                if (post.id !== postId) return post;
                return {...post, comment_count: (Number(post.comment_count) || 0) + 1};
            }));
        } catch (error) {
            console.error('Failed to submit comment', error);
        } finally {
            setSubmittingCommentByPost(prev => ({...prev, [postId]: false}));
        }
    };

    const displayName = user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : 'there';

    return (
        <div className="home-atmosphere min-h-screen relative overflow-x-clip">
            <div className="home-bg-layer home-bg-layer--base" aria-hidden="true" />
            <div className="home-bg-layer home-bg-layer--mesh" aria-hidden="true" />
            <div className="home-orb home-orb--one" aria-hidden="true" />
            <div className="home-orb home-orb--two" aria-hidden="true" />
            <div className="home-orb home-orb--three" aria-hidden="true" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-28">
                <div className="mb-8 home-fade-up">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Explore</p>
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900" style={{fontFamily: "'Space Grotesk', sans-serif"}}>
                        Welcome back, {displayName}
                    </h1>
                    <p className="mt-2 text-slate-500 max-w-3xl">
                        Discover work from venues, artists, and service providers across Attica. Share your portfolio updates and engage with the network.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2.1fr)_minmax(260px,1fr)] gap-8 items-start">
                    <section className="space-y-5">
                        <form
                            onSubmit={handleCreatePost}
                            className="bg-white/95 backdrop-blur-md border border-slate-100 rounded-2xl shadow-sm p-5"
                        >
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Create a post</label>
                            <textarea
                                value={composerText}
                                onChange={(event) => setComposerText(event.target.value)}
                                placeholder="Share an update, portfolio highlight, or venue availability..."
                                className="w-full min-h-28 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-y"
                            />

                            {composerPreview && (
                                <div className="mt-3 rounded-xl overflow-hidden border border-slate-100">
                                    <img src={composerPreview} alt="Post preview" className="w-full max-h-80 object-cover" />
                                </div>
                            )}

                            <div className="mt-3 flex items-center justify-between gap-3">
                                <label className="inline-flex items-center gap-2 text-sm text-slate-600 font-medium cursor-pointer hover:text-slate-900 transition-colors">
                                    <FaImage className="text-slate-500" />
                                    Add image
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleComposerImageChange}
                                    />
                                </label>
                                <button
                                    type="submit"
                                    disabled={isSubmittingPost || (!composerText.trim() && !composerImage)}
                                    className="inline-flex items-center px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                                >
                                    {isSubmittingPost ? 'Posting...' : 'Post'}
                                </button>
                            </div>
                        </form>

                        {feedError && (
                            <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm">
                                {feedError}
                            </div>
                        )}

                        {isInitialLoading ? (
                            <div className="space-y-4">
                                {Array.from({length: 3}).map((_, idx) => (
                                    <div key={idx} className="bg-white/95 rounded-2xl border border-slate-100 p-5 animate-pulse">
                                        <div className="h-4 w-40 bg-slate-200 rounded mb-4" />
                                        <div className="h-3 w-full bg-slate-100 rounded mb-2" />
                                        <div className="h-3 w-4/5 bg-slate-100 rounded" />
                                    </div>
                                ))}
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="bg-white/95 rounded-2xl border border-slate-100 p-8 text-center">
                                <h2 className="text-lg font-semibold text-slate-900">No posts in your feed yet</h2>
                                <p className="text-slate-500 mt-2 text-sm">
                                    Be the first to share your latest portfolio update.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {posts.map(post => {
                                    const profileImage = normalizeMediaUrl(post?.user?.profile_picture);
                                    const postImage = normalizeMediaUrl(post?.image);
                                    const comments = commentsByPost[post.id] || [];
                                    const commentsOpen = Boolean(expandedComments[post.id]);
                                    const userRole = roleToLabel(post?.user?.roles?.[0]);

                                    return (
                                        <article key={post.id} className="bg-white/95 backdrop-blur-sm border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                                            <div className="px-5 pt-5 pb-4">
                                                <div className="flex items-start gap-3 mb-3">
                                                    <img
                                                        src={profileImage || 'https://placehold.co/72x72/F1F5F9/64748B?text=U'}
                                                        alt={post?.user?.username || 'User'}
                                                        className="w-12 h-12 rounded-full object-cover ring-1 ring-slate-200"
                                                    />
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-slate-900 leading-tight">
                                                            {post?.user?.username || 'Unknown User'}
                                                        </p>
                                                        <p className="text-xs text-slate-500 mt-0.5">
                                                            {userRole ? `${userRole} · ` : ''}{formatTimeAgo(post.created_at)} ago
                                                        </p>
                                                    </div>
                                                </div>

                                                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-[0.96rem]">{post.text}</p>
                                            </div>

                                            {postImage && (
                                                <div className="border-y border-slate-100 bg-slate-50">
                                                    <img src={postImage} alt="Post" className="w-full max-h-[560px] object-cover" />
                                                </div>
                                            )}

                                            <div className="px-5 py-3 border-t border-slate-100 flex items-center gap-5 text-sm">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleLike(post.id)}
                                                    className={`inline-flex items-center gap-2 font-semibold transition-colors ${
                                                        post.is_liked ? 'text-rose-600' : 'text-slate-600 hover:text-slate-900'
                                                    }`}
                                                >
                                                    {post.is_liked ? <FaHeart className="text-rose-600" /> : <FaRegHeart />}
                                                    <span>{Number(post.like_count) || 0}</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleComments(post.id)}
                                                    className="inline-flex items-center gap-2 font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                                                >
                                                    <FaCommentDots />
                                                    <span>{Number(post.comment_count) || 0}</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleShare(post.id)}
                                                    className="inline-flex items-center gap-2 font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                                                >
                                                    <FaRetweet />
                                                    <span>{Number(post.shares_count) || 0}</span>
                                                </button>
                                            </div>

                                            {commentsOpen && (
                                                <div className="border-t border-slate-100 px-5 py-4 bg-slate-50/70">
                                                    <form onSubmit={(event) => handleSubmitComment(event, post.id)} className="flex items-center gap-2 mb-3">
                                                        <input
                                                            value={commentDrafts[post.id] || ''}
                                                            onChange={(event) => setCommentDrafts(prev => ({...prev, [post.id]: event.target.value}))}
                                                            placeholder="Write a comment"
                                                            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                                        />
                                                        <button
                                                            type="submit"
                                                            disabled={submittingCommentByPost[post.id]}
                                                            className="px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-60"
                                                        >
                                                            {submittingCommentByPost[post.id] ? 'Posting...' : 'Comment'}
                                                        </button>
                                                    </form>

                                                    {loadingCommentsByPost[post.id] ? (
                                                        <p className="text-sm text-slate-500">Loading comments...</p>
                                                    ) : comments.length === 0 ? (
                                                        <p className="text-sm text-slate-500">No comments yet.</p>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {comments.map(comment => {
                                                                const commentAvatar = normalizeMediaUrl(comment?.user?.profile_picture);
                                                                return (
                                                                    <div key={comment.id} className="bg-white rounded-lg border border-slate-100 p-3">
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <img
                                                                                src={commentAvatar || 'https://placehold.co/40x40/E2E8F0/64748B?text=U'}
                                                                                alt={comment?.user?.username || 'User'}
                                                                                className="w-7 h-7 rounded-full object-cover"
                                                                            />
                                                                            <p className="text-xs font-semibold text-slate-800">{comment?.user?.username || 'User'}</p>
                                                                        </div>
                                                                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{comment.content}</p>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </article>
                                    );
                                })}

                                <div ref={loadMoreRef} className="h-8 flex items-center justify-center">
                                    {isLoadingMore && <p className="text-xs text-slate-500">Loading more posts...</p>}
                                    {!hasMore && posts.length > 0 && <p className="text-xs text-slate-400">You reached the end of the feed.</p>}
                                </div>
                            </div>
                        )}
                    </section>

                    <aside className="hidden lg:block sticky top-24 space-y-4">
                        <div className="bg-white/90 border border-slate-100 rounded-2xl p-5">
                            <h2 className="text-sm uppercase tracking-wider text-slate-400 font-semibold">Quick Navigation</h2>
                            <div className="mt-3 space-y-2">
                                <Link to="/offerings" className="block rounded-lg border border-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                                    Browse offerings
                                </Link>
                                <Link to="/services" className="block rounded-lg border border-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                                    Service marketplace
                                </Link>
                                <Link to="/artists" className="block rounded-lg border border-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                                    Artist network
                                </Link>
                                <Link to="/events" className="block rounded-lg border border-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                                    Upcoming events
                                </Link>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-100 rounded-2xl p-5">
                            <h3 className="text-slate-900 font-semibold">Portfolio tip</h3>
                            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                                Post project photos and short context so event organizers can understand your style and availability quickly.
                            </p>
                        </div>
                    </aside>
                </div>
            </div>

            <FloatingActionButton />
        </div>
    );
}

export default HomePage;
