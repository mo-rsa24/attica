import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ProfilePage = () => {
    const { tokens } = useAuth()
    const [profileData, setProfileData] = useState({
        user: {
            first_name: '',
            last_name: '',
            email: ''
        },
        bio: '',
        profile_picture: null,
    });
    const [newProfilePicture, setNewProfilePicture] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Fetch profile data when the component mounts
    useEffect(() => {
        const fetchProfile = async () => {
            if (!tokens?.access) {
                setError('You are not logged in.');
                setLoading(false);
                return;
            }
            try {
                const response = await fetch('/api/accounts/profile/', {
                    headers: {
                        // 4. Use the correct access token
                        'Authorization': `Bearer ${tokens.access}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch profile.');
                }

                const data = await response.json();
                setProfileData(data);
                setPreviewImage(data.profile_picture);
            } catch (err) {
                setError('Failed to fetch profile. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [tokens]);


    // Handle changes to form inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        // Handle nested user object
        if (name in profileData.user) {
            setProfileData(prevState => ({
                ...prevState,
                user: {
                    ...prevState.user,
                    [name]: value,
                },
            }));
        } else {
            setProfileData(prevState => ({
                ...prevState,
                [name]: value,
            }));
        }
    };

    // Handle file input change for profile picture
    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setNewProfilePicture(file);
            setPreviewImage(URL.createObjectURL(file)); // Show a preview of the new image
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage('');
        setError('');

         if (!tokens?.access) {
            setError('Authentication token is missing.');
            return;
        }

        const formData = new FormData();
        const profilePayload = {
            user: {
                first_name: profileData.first_name,
                last_name: profileData.last_name,
                email: profileData.email,
            },
            bio: profileData.bio,
        };
        formData.append('user', JSON.stringify(profilePayload.user));
        formData.append('bio', profilePayload.bio);

        if (newProfilePicture) {
            formData.append('profile_picture', newProfilePicture);
        }
        try {
            const response = await fetch('/api/accounts/profile/', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${tokens.access}`,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to update profile.');
            }

            const data = await response.json();
            setProfileData(data);
            setNewProfilePicture(null);
            setSuccessMessage('Profile updated successfully!');
        } catch (err) {
            setError(err.message);
            console.error(err);
        }
    };

    if (loading) return <div className="text-center p-8">Loading profile...</div>;
    if (error && !profileData.email) return <div className="text-center p-8 text-red-500">{error}</div>;

    return (
        <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Profile</h1>
                {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
                {successMessage && <p className="text-green-500 bg-green-100 p-3 rounded-md mb-4">{successMessage}</p>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-center space-x-6">
                        <img
                            src={previewImage || 'https://placehold.co/100x100/EFEFEF/3A3A3A?text=No+Image'}
                            alt="Profile"
                            className="w-24 h-24 rounded-full object-cover"
                        />
                        <div>
                            <label htmlFor="profile_picture" className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
                                Change Picture
                            </label>
                            <input
                                type="file"
                                id="profile_picture"
                                name="profile_picture"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">First Name</label>
                            <input type="text" name="first_name" id="first_name" value={profileData.first_name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                        </div>
                        <div>
                            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Last Name</label>
                            <input type="text" name="last_name" id="last_name" value={profileData.last_name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input type="email" name="email" id="email" value={profileData.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                    </div>

                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
                        <textarea name="bio" id="bio" rows="4" value={profileData.bio || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                    </div>

                    <div className="flex justify-end">
                        <button type="submit" className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors duration-300">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
