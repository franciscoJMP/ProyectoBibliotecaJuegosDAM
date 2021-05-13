import React, {useState, useRef, Fragment} from 'react';
import {StyleSheet, Text, View, Image} from 'react-native';
import * as firebase from 'firebase';
import {Divider, Input, Button} from 'react-native-elements';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Toast from 'react-native-easy-toast';
import {useNavigation} from '@react-navigation/native';
import {LoginForm} from 'ProyectoVideoJuegos/src/components/AccountComponents';
import {colors} from 'ProyectoVideoJuegos/src/styles/withColors';
import {
  SocialLoginComponent,
  ModalComponent,
  LoadingComponent,
} from 'ProyectoVideoJuegos/src/components';
import {validateEmail} from 'ProyectoVideoJuegos/src/utils/validations';

export default function LoginScreen() {
  const [showModal, setShowModal] = useState(false);
  const [renderComponent, setRenderComponent] = useState(null);
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
        <CreateAccount
          setRenderComponent={setRenderComponent}
          setShowModal={setShowModal}
          toastRef={toastRef}
        />
        {renderComponent && (
          <ModalComponent isVisible={showModal} setIsVisible={setShowModal}>
            {renderComponent}
          </ModalComponent>
        )}
      </View>
      <Toast ref={toastRef} position="center" opacity={0.9} />
      <Divider style={styles.divider} />
      <SocialLoginComponent />
    </KeyboardAwareScrollView>
  );
}

function CreateAccount(props) {
  const {setRenderComponent, setShowModal, toastRef} = props;
  const navigation = useNavigation();
  return (
    <Fragment>
      <Text style={styles.textRegister}>
        ¿Aún no tienes una cuenta?{' '}
        <Text
          style={styles.btnRegister}
          onPress={() => navigation.navigate('registerstack')}>
          Regístrate
        </Text>
      </Text>

      <Text style={[styles.textRegister, {textAlign: 'center'}]}>
        <Text
          style={styles.btnRegister}
          onPress={() => {
            setShowModal(true);
            setRenderComponent(
              <ForggotenForm toastRef={toastRef} setShowModal={setShowModal} />,
            );
          }}>
          ¿Ha olvidado su contraseña?
        </Text>
      </Text>
    </Fragment>
  );
}
const ForggotenForm = props => {
  const {toastRef, setShowModal} = props;
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const onSubmit = () => {
    setErrors({});
    if (email === '') {
      setErrors({
        email: 'El campo no puede estar vacio',
      });
    } else if (!validateEmail(email)) {
      setErrors({
        email: 'Formato de correo incorrecto',
      });
    } else {
      setIsLoading(true);
      firebase
        .auth()
        .sendPasswordResetEmail(email)
        .then(() => {
          setIsLoading(false);
          setShowModal(false);
          toastRef.current.show('Correo de recuperacion enviado');
        })
        .catch(e => console.log(e));
    }
  };
  return (
    <View style={styles.view}>
      <Input
        placeholder="Correo Electronico"
        containerStyle={styles.input}
        defaultValue={email}
        keyboardType="email-address"
        rightIcon={{
          type: 'material-community',
          name: 'at',
          color: '#ccc',
        }}
        onChange={e => setEmail(e.nativeEvent.text)}
        errorMessage={errors.email}
      />

      <Button
        title="Enviar enlace de acceso"
        containerStyle={styles.btnContainer}
        buttonStyle={styles.btn}
        onPress={onSubmit}
        loading={isLoading}
      />
    </View>
  );
};
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
  view: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  input: {
    marginBottom: 10,
  },
  btnContainer: {
    marginTop: 20,
    width: '95%',
  },
  btn: {
    backgroundColor: colors.primary,
  },
});
