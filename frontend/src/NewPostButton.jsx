import React from 'react';
import { FaPlus } from 'react-icons/fa';

const NewPostButton = () => {
    const handleNewPost = () => {
        // This would open a modal for creating a new post
        alert('Open "New Post" modal here!');
    };

    return (
        <button
            onClick={handleNewPost}
            className="w-full mb-4 bg-rose-500 text-white flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold hover:bg-rose-600 transition-colors"
        >
            <FaPlus />
            Create New Post
        </button>
    );
};

export default NewPostButton;