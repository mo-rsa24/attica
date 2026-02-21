export const ROLE_WORKSPACE_CONFIG = {
    EVENT_ORGANIZER: {
        myLabel: 'My Events',
        createLabel: 'Add Event',
        createRoute: '/createEvent',
    },
    ARTIST: {
        myLabel: 'My Bookings',
        createLabel: 'Create Gig Guide',
        createRoute: '/create/artist',
    },
    SERVICE_PROVIDER: {
        myLabel: 'My Offering',
        createLabel: 'Add Offering',
        createRoute: '/create/service',
    },
    VENUE_MANAGER: {
        myLabel: 'My Venues',
        createLabel: 'Add Venue',
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
        createLabel: 'Add Offering',
        createRoute: '/create/service',
    },
    VENUE: {
        myLabel: 'My Venues',
        createLabel: 'Add Venue',
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
