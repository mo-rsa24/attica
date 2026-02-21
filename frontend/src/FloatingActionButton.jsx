import { FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { getActiveRole, getRoleWorkspace } from './utils/roleWorkspace';

export default function FloatingActionButton() {
    const navigate = useNavigate();
    const { currentRole, user } = useAuth();
    const activeRole = getActiveRole(user, currentRole);
    const workspaceConfig = getRoleWorkspace(activeRole);
    if (!workspaceConfig?.createRoute) return null;

    return (
        <button
            onClick={() => navigate(workspaceConfig.createRoute)}
            className="fixed bottom-6 right-6 flex items-center gap-2.5 bg-gray-900 text-white pl-5 pr-6 py-3.5 rounded-full shadow-lg hover:bg-gray-800 hover:shadow-xl transition-all duration-200 z-50 group"
            aria-label={workspaceConfig.createLabel}
            title={workspaceConfig.createLabel}
        >
            <FaPlus className="text-sm group-hover:rotate-90 transition-transform duration-200" />
            <span className="text-sm font-semibold">{workspaceConfig.createLabel}</span>
        </button>
    );
}
