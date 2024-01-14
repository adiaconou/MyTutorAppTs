import React, { createContext, useState, useEffect, useContext } from 'react';
import { UserSettings } from '../models/UserSettings';
import { UserSettingsService } from '../services/UserSettingsService';
import { useAuth0 } from '@auth0/auth0-react';

interface UserSettingsContextType {
    userSettings: UserSettings | null;
    isSettingsLoading: boolean;
}

export const UserSettingsContext = createContext<UserSettingsContextType | undefined>(undefined);

export const UserSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
    const { user, isLoading, getAccessTokenSilently } = useAuth0();

    useEffect(() => {
        const fetchUserSettings = async () => {
            if (!user || !user.email) {
                return;
            }

            const userId: string = user?.email;
            const token: string = await getAccessTokenSilently();

            try {
                const settings = await new UserSettingsService().getUserSettings(userId, token);
                setUserSettings(settings);
            } catch (error) {
                console.error('Failed to fetch user settings:', error);
            } finally { }
        };

        fetchUserSettings();
    }, [isLoading]);

    return (
        <UserSettingsContext.Provider value={{ userSettings, isSettingsLoading: isLoading }}>
            {children}
        </UserSettingsContext.Provider>
    );
};

export const useUserSettings = (): UserSettingsContextType => {
    const context = useContext(UserSettingsContext);
    if (!context) {
        throw new Error('useUserSettings must be used within a UserSettingsProvider');
    }
    return context;
};
