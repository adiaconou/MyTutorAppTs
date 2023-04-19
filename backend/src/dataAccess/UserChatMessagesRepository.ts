import { UserChatMessage } from '../models/UserChatMessage';
import { GoogleCloudDatastore } from './GoogleCloudDatastore';

const kind = "UserChatMessage";

export class UserSettingsRepository {
    private cloudDatastore;

    constructor(projectId: string) {
        this.cloudDatastore = new GoogleCloudDatastore<UserChatMessage>(projectId, kind);
    }

    async get(userId: string): Promise<UserChatMessage | null> {
        return this.cloudDatastore.get(userId);

    }

    async add({ userId, userSettings }: { userId: string; userSettings: UserChatMessage; }): Promise<void> {
        this.cloudDatastore.put(userId, userSettings);
    }
}