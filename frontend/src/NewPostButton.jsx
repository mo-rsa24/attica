import React from 'react';
import { FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { getActiveRole, getRoleWorkspace } from './utils/roleWorkspace';

const OFFERINGS_LABEL_BY_ROLE = {
    ARTIST: 'Create tour guide',
    SERVICE_PROVIDER: 'Create offering',
    VENDOR: 'Create offering',
    VENUE_MANAGER: 'Provide new venue',
    VENUE: 'Provide new venue',
};

const NewPostButton = () => {
    const navigate = useNavigate();
    const { user, currentRole } = useAuth() || {};
    const activeRole = getActiveRole(user, currentRole);
    const workspace = getRoleWorkspace(activeRole);
    const ctaLabel = OFFERINGS_LABEL_BY_ROLE[activeRole] || workspace?.createLabel || 'Create offering';

    const handleNewPost = () => {
        if (workspace?.createRoute) {
            navigate(workspace.createRoute);
            return;
        }

        // Keep a fallback for legacy routes/configs without a create route.
        alert(`Open "${ctaLabel}" modal here!`);
    };

    return (
        <button
            onClick={handleNewPost}
            className="w-full mb-4 bg-rose-500 text-white flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold hover:bg-rose-600 transition-colors"
        >
            <FaPlus />
            {ctaLabel}
        </button>
    );
};

export default NewPostButton;
