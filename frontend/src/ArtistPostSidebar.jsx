import React from 'react';
import PostCard from './PostCard';
import NewPostButton from './NewPostButton';

const ArtistPostsSidebar = ({ artist, posts, isMyProfile }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-md sticky top-8">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Posts</h2>

            {isMyProfile && <NewPostButton />}

            <div className="space-y-4 max-h-[80vh] overflow-y-auto">
                {posts.length > 0 ? (
                    posts.map(post => (
                        <PostCard key={post.id} post={post} artist={artist} />
                    ))
                ) : (
                    <p className="text-gray-500 text-center py-8">No posts yet.</p>
                )}
            </div>
        </div>
    );
};

export default ArtistPostsSidebar;