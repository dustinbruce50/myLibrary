import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  Pressable,
  StatusBar,
} from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp } from '@react-navigation/core';
import { colors } from '../utils/colors';
import {
  saveAuthRecord,
  getAuthRecord,
  clearAuthRecord,
  hasAuthRecord,
} from '../utils/auth';
import { LocalAuthRecord } from '../utils/auth';

const Login = ({ navigation }: { navigation: NavigationProp<any> }) => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [authenticated, setAuthenticated] = React.useState(false);
  const [isRegister, setIsRegister] = React.useState<Boolean>(true);
  const [errorMessage, setErrorMessage] = React.useState<String | null>(
    'TESTING',
  );

  const onSubmit = async () => {
    let auth = await getAuthRecord();
    console.log('global auth record: ', auth);
    if (username === auth?.username) {
      setIsRegister(false);
    }
    if (username === auth?.username && password === auth?.password) {
      setAuthenticated(true);
      navigation.navigate('Tabnav');
    }

    if (username === '' || password === '') {
      setErrorMessage('Please enter a username and password');
      return;
    }
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
        <View
          style={{
            backgroundColor: 'rgba(70,50,30,0.3)',
            width: '100%',
            height: '100%',
          }}
        >
          <View
            style={{
              alignSelf: 'center',
              alignContent: 'center',
              backgroundColor: colors.accent,
              width: '80%',

              //height: '48%',
              borderRadius: 40,
              top: '30%',
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
            />
            <TextInput
              placeholder="Password"
              secureTextEntry
              style={styles.textInput}
              value={password}
              onChangeText={setPassword}
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
              <Pressable
                onPress={() => {
                  let authRecord: LocalAuthRecord = {
                    username: username,
                    password: password,
                    salt: '',
                    version: 0,
                  };
                  console.log('auth record: ', authRecord);
                  saveAuthRecord(authRecord);
                  setPassword('');
                  setUsername('');
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

              {errorMessage && (
                <Text style={{ color: 'red', textAlign: 'center' }}>
                  {errorMessage}
                </Text>
              )}
            </View>
          </View>
        </View>
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
