import * as Keychain from 'react-native-keychain';

const AUTH_SERVICE = 'myLibrary.localAuth';

export type LocalAuthRecord = {
    username: string;
    password: string;
    salt: string;
    version: number;

}

export async function saveAuthRecord(record: LocalAuthRecord) {
    await Keychain.setGenericPassword(record.username, JSON.stringify(record), {
        service: AUTH_SERVICE,
    })}

export async function getAuthRecord(): Promise<LocalAuthRecord | null> {
    const credentials = await Keychain.getGenericPassword ({
        service: AUTH_SERVICE,
    });
    if (!credentials) {
        return null;
    }
    return JSON.parse(credentials.password) as LocalAuthRecord;
}

export async function clearAuthRecord() {
    await Keychain.resetGenericPassword({
        service: AUTH_SERVICE,
    });
}

export async function hasAuthRecord(){
    const record = await getAuthRecord();
    return record !== null;
}