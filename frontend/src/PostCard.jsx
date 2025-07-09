import React from 'react';

const PostCard = ({ post, artist }) => {
    // Format the timestamp to be more user-friendly (e.g., "2h ago")
    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m";
        return Math.floor(seconds) + "s";
    }

    return (
        <div className="p-4 border rounded-lg shadow-sm bg-white hover:shadow-lg transition-shadow duration-300 animate-fade-in">
            <div className="flex items-center space-x-3 mb-3">
                <img
                    src={artist.profile_image}
                    alt={artist.name}
                    className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                    <p className="font-semibold text-gray-900">{artist.name}</p>
                    <p className="text-xs text-gray-500">{timeAgo(post.created_at)} ago</p>
                </div>
            </div>
            <p className="text-gray-800 mb-3 whitespace-pre-wrap">{post.content}</p>
            {post.image && (
                <img
                    src={post.image}
                    alt="Post media"
                    className="rounded-lg object-cover w-full aspect-square"
                />
            )}
        </div>
    );
};

export default PostCard;