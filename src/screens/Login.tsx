import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  StatusBar,
  KeyboardAvoidingView,
  Button,
} from 'react-native';
import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp } from '@react-navigation/core';
import { colors } from '../utils/colors';
import {
  registerLocalAuth,
  verifyLocalAuth,
  getAuthRecord,
  clearAuthRecord,
} from '../utils/auth';

const Login = ({ navigation }: { navigation: NavigationProp<any> }) => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isRegistered, setIsRegistered] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<String | null>(
    'TESTING',
  );
  const passwordRef = React.useRef<TextInput>(null);
  useEffect(() => {
    let auth = getAuthRecord();
    setIsRegistered(auth !== null);
  }, []);

  const onSubmit = async () => {
    const auth = await getAuthRecord();
    if (username === '' || password === '') {
      setErrorMessage('Please enter a username and password');
      return;
    }

    if (!auth) {
      setErrorMessage('No account exists yet');
      return;
    }
    const ok = await verifyLocalAuth(username, password);
    if (!ok) {
      setErrorMessage('Invalid username or password');
      return;
    }

    navigation.navigate('Tabnav');
  };

  return (
    <SafeAreaView>
      <StatusBar barStyle={'dark-content'} />
      <ImageBackground
        source={require('../../assets/inaki-del-olmo-NIJuEQw0RKg-unsplash.png')}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: ' rgba(0,0,0,0.1)',
        }}
      >
        <KeyboardAvoidingView
          style={{
            backgroundColor: 'rgba(70,50,30,0.3)',
            width: '100%',
            height: '100%',
            justifyContent: 'center',
          }}
        >
          <Button
            title="Reset Local Auth"
            onPress={() => {
              clearAuthRecord();
              setIsRegistered(false);
            }}
          />
          <View
            style={{
              alignSelf: 'center',
              alignContent: 'center',
              backgroundColor: colors.accent,
              width: '80%',
              borderRadius: 40,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: 'CormorantGaramond-BoldItalic',
                //fontFamily: 'monospace',
                fontSize: 48,
                //fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: 40,
              }}
            >
              Welcome to your library
            </Text>
            <TextInput
              placeholder="Username"
              style={styles.textInput}
              value={username}
              onChangeText={setUsername}
              returnKeyType="next"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
              textContentType="username"
              enterKeyHint="next"
              submitBehavior="submit"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
            <TextInput
              ref={passwordRef}
              placeholder="Password"
              secureTextEntry
              style={styles.textInput}
              value={password}
              onChangeText={setPassword}
              returnKeyType="go"
              autoCorrect={false}
              autoComplete="password"
              textContentType="password"
              submitBehavior="submit"
              enterKeyHint="done"
            />
            <View
              style={{
                //flex: 1,
                width: '50%',
                alignSelf: 'center',
              }}
            >
              <Pressable
                onPress={onSubmit}
                //disabled={isRegister as boolean}
                style={({ pressed }) => ({
                  margin: 5,
                  backgroundColor: colors.button,
                  padding: 10,
                  borderRadius: 10,
                  shadowColor: '#000',
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 3,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                })}
              >
                <Text style={{ color: '#fff', textAlign: 'center' }}>
                  Login
                </Text>
              </Pressable>
              {!isRegistered && (
                <Pressable
                  onPress={async () => {
                    if (!username || !password) {
                      setErrorMessage('Please enter a username and password');
                      return;
                    }
                    await registerLocalAuth(username, password);
                    setPassword('');
                    setUsername('');
                    setErrorMessage('User Account Created');
                    setIsRegistered(true);
                  }}
                  style={({ pressed }) => ({
                    margin: 5,
                    disabled: true,
                    backgroundColor: colors.button,
                    padding: 10,
                    borderRadius: 10,
                    shadowColor: '#000',
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 3,
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                  })}
                >
                  <Text style={{ color: '#fff', textAlign: 'center' }}>
                    Register
                  </Text>
                </Pressable>
              )}

              {errorMessage && (
                <Text style={{ color: 'red', textAlign: 'center' }}>
                  {errorMessage}
                </Text>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  textInput: {
    height: 40,
    borderWidth: 2,
    width: '80%',
    alignSelf: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
});
