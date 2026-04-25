import { randomBytes } from 'react-native-quick-crypto';
import {
  registerLocalAuth,
  verifyLocalAuth,
  getAuthRecord,
  clearAuthRecord,
  saveAuthRecord,
  hasAuthRecord,

} from '../../src/utils/auth';
import { get } from 'react-native/Libraries/NativeComponent/NativeComponentRegistry';

let mockStoredPassword: string | null = null;

jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(async (_username, password)=>{
  
    mockStoredPassword = password;
    return true;
  }),
  getGenericPassword: jest.fn(async () => {
    if(!mockStoredPassword){
      return false;
    }
    return {
      username: 'saved-user',
      password: mockStoredPassword,
    }; 

  }
  ),
  resetGenericPassword: jest.fn(async () =>{
    mockStoredPassword = null;
    return true
  }),



}))
jest.mock('react-native-quick-crypto', () => ({
  randomBytes: jest.fn(() => ({
    toString: jest.fn(() => 'fake-salt')
  })),
  pbkdf2Sync: jest.fn((password, salt, iterations, keyLen, digest)=> ({
    toString: jest.fn(() => `hashed-${password}-${salt}-${iterations}-${keyLen}-${digest}`)
  }))
  
}))
describe('auth utils', () => {
  beforeEach(() => {
    mockStoredPassword = null;
  })

  test('saveAuthRecord saves provided auth record', async () =>{
      const mockRecord = {
      username: 'david',
      passwordHash: 'hashed-password',
      salt: 'fake-salt',
      kdf: 'pbkdf2-sha256' as const,
      interations: 1000,
      keyLength: 32,
      version: 0
    };

    await saveAuthRecord(mockRecord);
    expect(await getAuthRecord()).toEqual(mockRecord);
  })
  test('verifyLocalAuth returns false for no record', () => {
    expect(verifyLocalAuth('david', 'secret')).resolves.toBe(false);
  })
  test('verifyLocalAuth returns false for wrong password', async() => {
    await registerLocalAuth('david', 'secret');
    expect(verifyLocalAuth('david', 'wrong')).resolves.toBe(false);
  })
  test ('verifyLocalAuth returns false for wrong username', async () => {
    await registerLocalAuth('david', 'secret');
    expect(verifyLocalAuth('wrong', 'secret')).resolves.toBe(false);
  })
  test('verifyLocalAuth returns true for correct password', async () => {
    await registerLocalAuth('david', 'secret');
    expect(verifyLocalAuth('david', 'secret')).resolves.toBe(true);
  })
  test('hasAuthRecord returns false when no record exists', async () => {
    expect(await hasAuthRecord()).toBe(false);
  })
  test('registerLocalAuth saves and returns an auth record',
    async () => {
      const record = await registerLocalAuth('david', 'secret');

      expect(record.username).toBe('david');
      expect(record.salt).toBe('fake-salt');
      expect(record.passwordHash).toBe('hashed-secret-fake-salt-1000-32-sha256');
    }
  )
  test('getAuthRecord returns null when no record exists',
    async () => {
      expect(await getAuthRecord()).toBe(null);
    }


  )
  test('verifyLocalAuth returns true for correct password',
    async () => {
      await registerLocalAuth('david', 'secret');
      await expect(verifyLocalAuth('david', 'secret')).resolves.toBe(true);
    }
  )
  test('verifyLocalAuth returns false for wrong password',
    async () => {
      await registerLocalAuth('david', 'secret');
      await expect(verifyLocalAuth('david', 'wrong')).resolves.toBe(false);
    }
  )
  test('clearAuthRecord removes saved record',
    async () => {
      await registerLocalAuth('david', 'secret');
      await clearAuthRecord();
      expect(await getAuthRecord()).toBe(null);
    }
  )

  test('verifyLocalAuth runs fallback values for iterations and key length', async () => {
    await registerLocalAuth('david', 'secret');
    let local = await getAuthRecord();
    const legacyRecord = {
      ...local!,
      interations: undefined,
      keyLength: undefined,
    };
    await saveAuthRecord(legacyRecord as any);
    expect(await verifyLocalAuth('david', 'secret')).toBe(true);

    })

})