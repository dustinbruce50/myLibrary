import * as Keychain from 'react-native-keychain';
import QuickCrypto from 'react-native-quick-crypto';
import pbkdf2Sync from 'react-native-quick-crypto';



const AUTH_SERVICE = 'myLibrary.localAuth';




export type LocalAuthRecord = {
    username: string;
    passwordHash: string;//base64
    salt: string;
    kdf: 'pbkdf2-sha256';
    interations: number;
    keyLength: number;
    version: number;

}
const KDF_ITERATIONS = 210_000
const KDF_KEY_LEN = 32

function randomSalt(bytes=16 as number): string {
    return QuickCrypto.randomBytes(bytes).toString('base64');
}

function derivePasswordHash(password: string, salt: string, iterations: number, keyLen: number): string {
    return QuickCrypto.pbkdf2Sync(password, salt, iterations, keyLen, 'sha256').toString('hex');
}
    
export async function registerLocalAuth(username: string, password: string): Promise<LocalAuthRecord> {
    const salt = randomSalt();
    const passwordHash = derivePasswordHash(password, salt, KDF_ITERATIONS, KDF_KEY_LEN);
    const authRecord: LocalAuthRecord = {
        username,
        passwordHash,
        salt,
        kdf: 'pbkdf2-sha256',
        interations: KDF_ITERATIONS,
        keyLength: KDF_KEY_LEN,
        version: 0,
    };
    await Keychain.setGenericPassword(username, JSON.stringify(authRecord), {
        service: AUTH_SERVICE,
    });
    return authRecord;
}
export async function saveAuthRecord(record: LocalAuthRecord) {
    await Keychain.setGenericPassword(record.username, JSON.stringify(record), {
        service: AUTH_SERVICE,
    })}
export async function verifyLocalAuth(username: string, password: string) {
  const record = await getAuthRecord();

  if (!record) {
    return false;
  }

  if (record.username !== username) {
    return false;
  }

  const candidateHash = derivePasswordHash(
    password,
    record.salt,
    record.interations ?? KDF_ITERATIONS,
    record.keyLength ?? KDF_KEY_LEN,
  );

  return candidateHash === record.passwordHash;
}
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