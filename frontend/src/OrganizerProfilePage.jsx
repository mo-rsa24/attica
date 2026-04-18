import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useAxios from './utils/useAxios';
import { useAuth } from './AuthContext';

const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

export default function OrganizerProfilePage() {
    const { id } = useParams();
    const { user } = useAuth();
    const api = useAxios();

    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const isOwnProfile = user?.id && profile && Number(user.id) === Number(profile.id);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            setError('');
            try {
                const [profileRes, postsRes] = await Promise.all([
                    api.get(`/api/accounts/users/${id}/`),
                    api.get('/api/accounts/social-posts/', { params: { user_id: id, limit: 20 } }),
                ]);
                setProfile(profileRes.data);
                const postsData = postsRes.data;
                setPosts(Array.isArray(postsData?.results) ? postsData.results : Array.isArray(postsData) ? postsData : []);
            } catch {
                setError('Could not load this profile.');
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [id, api]);

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading profile…</div>;
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-slate-500 mb-4">{error || 'Profile not found.'}</p>
                    <Link to="/" className="text-blue-600 hover:underline">Back to home</Link>
                </div>
            </div>
        );
    }

    const displayName = profile.first_name
        ? `${profile.first_name}${profile.last_name ? ` ${profile.last_name}` : ''}`
        : profile.username;

    const roleLabels = (profile.roles || []).map(r =>
        r.toLowerCase().split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    );

    const normalizeImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http') || url.startsWith('/')) return url;
        return `/media/${url}`;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto px-4 py-10">
                {/* Profile header */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6 shadow-sm">
                    <div className="flex items-center gap-5">
                        <img
                            src={normalizeImageUrl(profile.profile_picture) || `https://placehold.co/100x100/e2e8f0/64748b?text=${profile.username?.charAt(0)?.toUpperCase() || 'U'}`}
                            alt={displayName}
                            className="w-20 h-20 rounded-full object-cover ring-2 ring-slate-200 flex-shrink-0"
                        />
                        <div className="min-w-0">
                            <h1 className="text-xl font-bold text-slate-900">{displayName}</h1>
                            <p className="text-sm text-slate-500">@{profile.username}</p>
                            {roleLabels.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {roleLabels.map(r => (
                                        <span key={r} className="text-xs bg-slate-100 text-slate-600 rounded-full px-2.5 py-1 font-medium">
                                            {r}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        {isOwnProfile && (
                            <Link
                                to="/profile/edit"
                                className="ml-auto flex-shrink-0 px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                Edit profile
                            </Link>
                        )}
                    </div>
                </div>

                {/* Posts */}
                <h2 className="text-base font-bold text-slate-700 mb-4">Posts</h2>
                {posts.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-500">
                        No posts yet.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {posts.map(post => (
                            <article key={post.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <img
                                        src={normalizeImageUrl(profile.profile_picture) || `https://placehold.co/48x48/e2e8f0/64748b?text=U`}
                                        alt={displayName}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{displayName}</p>
                                        <p className="text-xs text-slate-400">{formatTimeAgo(post.created_at)}</p>
                                    </div>
                                </div>
                                <p className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">{post.text}</p>
                                {post.image && (
                                    <div className="mt-3 rounded-xl overflow-hidden border border-slate-100">
                                        <img src={post.image} alt="Post" className="w-full max-h-80 object-cover" />
                                    </div>
                                )}
                                <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                                    <span>{post.like_count || 0} likes</span>
                                    <span>{post.comment_count || 0} comments</span>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
