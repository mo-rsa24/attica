export const ROLE_WORKSPACE_CONFIG = {
    EVENT_ORGANIZER: {
        myLabel: 'My Events',
        createLabel: 'Add Event',
        createRoute: '/createEvent',
    },
    ARTIST: {
        myLabel: 'My Bookings',
        createLabel: 'Create tour guide',
        createRoute: '/create/artist',
    },
    SERVICE_PROVIDER: {
        myLabel: 'My Offering',
        createLabel: 'Create offering',
        createRoute: '/create/service',
    },
    VENUE_MANAGER: {
        myLabel: 'My Venues',
        createLabel: 'Provide new venue',
        createRoute: '/create/venue',
    },
    // Legacy aliases (for older seeded role names)
    ORGANIZER: {
        myLabel: 'My Events',
        createLabel: 'Add Event',
        createRoute: '/createEvent',
    },
    VENDOR: {
        myLabel: 'My Offering',
        createLabel: 'Create offering',
        createRoute: '/create/service',
    },
    VENUE: {
        myLabel: 'My Venues',
        createLabel: 'Provide new venue',
        createRoute: '/create/venue',
    },
};

export function getActiveRole(user, currentRole) {
    if (!user?.roles?.length) return '';
    if (currentRole && user.roles.includes(currentRole)) return currentRole;
    return user.roles[0] || '';
}

export function getRoleWorkspace(role) {
    return ROLE_WORKSPACE_CONFIG[role] || ROLE_WORKSPACE_CONFIG.EVENT_ORGANIZER;
}
