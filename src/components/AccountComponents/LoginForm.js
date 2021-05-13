import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Input, Icon, Button} from 'react-native-elements';
import * as firebase from 'firebase';
import 'firebase/database';
import {isEmpty} from 'lodash';
import {useNavigation} from '@react-navigation/native';
import {LoadingComponent} from 'ProyectoVideoJuegos/src/components';
import {
  validateEmail,
  validatePassword,
} from 'ProyectoVideoJuegos/src/utils/validations';
import {setI18nConfig} from 'ProyectoVideoJuegos/src/languages/i18n.js';
var texts = setI18nConfig();

export default function LoginForm(props) {
  const {toastRef} = props;
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState(defaultValue);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const onSubmit = () => {
    if (isEmpty(formData.email) || isEmpty(formData.password)) {
      toastRef.current.show(texts.t('input_fail_mesagge'), 2000);
    } else if (!validateEmail(formData.email)) {
      toastRef.current.show(texts.t('email_fail_mesagge'), 2000);
    } else if (!validatePassword(formData.password)) {
      toastRef.current.show(texts.t('password_fail_mesagge'), 2000);
    } else {
      setLoading(true);
      firebase
        .auth()
        .signInWithEmailAndPassword(formData.email, formData.password)
        .then(response => {
          setLoading(false);
          const photoURL =
            response.user.photoURL !== '' || response.user.photoURL
              ? response.user.photoURL
              : '';
          const uid = response.user.uid;

          firebase
            .database()
            .ref('Usuarios')
            .child(uid)
            .update({photoURL: photoURL})
            .then(() => {
              navigation.navigate('accountstack');
            });
        })
        .catch(() => {
          setLoading(false);
          toastRef.current.show(texts.t('error_login'), 2000);
        });
    }
  };

  //Añade los datos de los inputs al objeto formData.
  const onChange = (e, type) => {
    setFormData({...formData, [type]: e.nativeEvent.text});
  };
  return (
    <View style={styles.formContainer}>
      <Input
        placeholder="Correo Electronico"
        keyboardType="email-address"
        containerStyle={styles.inputForm}
        onChange={e => onChange(e, 'email')}
        rightIcon={
          <Icon
            type="material-community"
            name="email"
            iconStyle={styles.iconRight}
          />
        }
      />
      <Input
        placeholder="Contraseña"
        containerStyle={styles.inputForm}
        password={true}
        secureTextEntry={showPassword ? false : true}
        onChange={e => onChange(e, 'password')}
        rightIcon={
          <Icon
            type="material-community"
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            iconStyle={styles.iconRight}
            onPress={() => setShowPassword(!showPassword)}
          />
        }
      />
      <Button
        title="Iniciar Sesión"
        buttonStyle={styles.btnStyle}
        containerStyle={styles.btnContainer}
        onPress={onSubmit}
      />
      <LoadingComponent isVisible={loading} text={'Iniciando Sesión'} />
    </View>
  );
}

function defaultValue() {
  return {
    email: '',
    password: '',
  };
}
const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  inputForm: {
    width: '100%',
    marginTop: 20,
  },
  btnStyle: {
    backgroundColor: '#1251E1',
  },
  btnContainer: {
    marginTop: 20,
    marginBottom: 20,
    width: '95%',
  },
  iconRight: {
    color: '#c1c1c1',
  },
});
