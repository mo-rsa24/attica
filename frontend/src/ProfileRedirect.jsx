import {useEffect, useState} from 'react';
import {Navigate} from 'react-router-dom';
import {useAuth} from './AuthContext';
import useAxios from './utils/useAxios';

const toArtistList = (payload) => {
    if (Array.isArray(payload?.results)) return payload.results;
    if (Array.isArray(payload)) return payload;
    return [];
};

const toPositiveNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const ProfileRedirect = () => {
    const {user} = useAuth();
    const api = useAxios();
    const [targetPath, setTargetPath] = useState('');
    const [isResolving, setIsResolving] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const resolveTargetPath = async () => {
            const directArtistId = toPositiveNumber(user?.artist_profile_id);
            if (directArtistId) {
                if (isMounted) {
                    setTargetPath(`/artists/${directArtistId}`);
                    setIsResolving(false);
                }
                return;
            }

            if (!user?.id) {
                if (isMounted) {
                    setTargetPath('/profile/edit');
                    setIsResolving(false);
                }
                return;
            }

            try {
                const {data} = await api.get('/api/artists/artists/', {
                    params: {user: user.id},
                });
                const matchedArtist = toArtistList(data)[0];
                const matchedArtistId = toPositiveNumber(matchedArtist?.id);

                if (isMounted) {
                    setTargetPath(matchedArtistId ? `/artists/${matchedArtistId}` : '/profile/edit');
                }
            } catch (error) {
                console.error('Failed to resolve current user artist profile', error);
                if (isMounted) {
                    setTargetPath('/profile/edit');
                }
            } finally {
                if (isMounted) {
                    setIsResolving(false);
                }
            }
        };

        resolveTargetPath();

        return () => {
            isMounted = false;
        };
    }, [api, user?.artist_profile_id, user?.id]);

    if (isResolving) {
        return <div className="min-h-screen bg-stone-100 p-8 text-center text-gray-600">Loading profile...</div>;
    }

    return <Navigate to={targetPath || '/profile/edit'} replace />;
};

export default ProfileRedirect;
