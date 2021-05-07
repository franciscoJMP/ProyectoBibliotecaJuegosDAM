import React, {useRef} from 'react';
import {StyleSheet, Text, View, Image} from 'react-native';
import {Divider} from 'react-native-elements';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Toast from 'react-native-easy-toast';
import {useNavigation} from '@react-navigation/native';
import {LoginForm} from 'ProyectoVideoJuegos/src/components/AccountComponents';
import {SocialLoginComponent} from 'ProyectoVideoJuegos/src/components';

export default function LoginScreen() {
  const toastRef = useRef();
  return (
    <KeyboardAwareScrollView>
      <Image
        source={require('ProyectoVideoJuegos/src/assets/img/logo.png')}
        resizeMode="contain"
        style={styles.logo}
      />
      <View style={styles.viewContainer}>
        <LoginForm toastRef={toastRef} />
        <CreateAccount />
      </View>
      <Toast ref={toastRef} position="center" opacity={0.9} />
      <Divider style={styles.divider} />
      <SocialLoginComponent />
    </KeyboardAwareScrollView>
  );
}

function CreateAccount(props) {
  const navigation = useNavigation();
  return (
    <Text style={styles.textRegister}>
      ¿Aún no tienes una cuenta?{' '}
      <Text
        style={styles.btnRegister}
        onPress={() => navigation.navigate('registerstack')}>
        Regístrate
      </Text>
    </Text>
  );
}
const styles = StyleSheet.create({
  logo: {
    width: '100%',
    height: 150,
    marginTop: 20,
  },
  viewContainer: {
    marginRight: 40,
    marginLeft: 40,
  },

  textRegister: {
    marginTop: 15,
    marginLeft: 10,
    marginRight: 10,
  },
  btnRegister: {
    color: '#1251E1',
    fontWeight: 'bold',
  },
  divider: {
    backgroundColor: '#1251E1',
    marginTop: 20,
    marginRight: 40,
    marginLeft: 40,
    marginBottom: 20,
  },
});
