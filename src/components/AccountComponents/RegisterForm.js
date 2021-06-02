import React, {useState} from 'react';
import {View, StyleSheet, LogBox} from 'react-native';
import {Input, Icon, Button} from 'react-native-elements';
import {isEmpty} from 'lodash';
import * as firebase from 'firebase';
import 'firebase/database';
import {useNavigation} from '@react-navigation/native';
import {LoadingComponent} from 'ProyectoVideoJuegos/src/components';
import {setI18nConfig} from 'ProyectoVideoJuegos/src/languages/i18n.js';
var texts = setI18nConfig();
LogBox.ignoreAllLogs();

import {
  validateEmail,
  validatePassword,
} from 'ProyectoVideoJuegos/src/utils/validations';

export default function RegisterForm(props) {
  const {toastRef} = props;
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setshowRepeatPassword] = useState(false);
  const [formData, setFormData] = useState(defaultValue);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const onSubmit = () => {
    if (
      isEmpty(formData.email) ||
      isEmpty(formData.name) ||
      isEmpty(formData.phone) ||
      isEmpty(formData.password) ||
      isEmpty(formData.repeatPassword)
    ) {
      toastRef.current.show(texts.t('input_fail_mesagge'), 2000);
    } else if (!validateEmail(formData.email)) {
      toastRef.current.show(texts.t('email_fail_mesagge'), 2000);
    } else if (!validatePassword(formData.password)) {
      toastRef.current.show(texts.t('password_fail_mesagge'), 2000);
    } else if (formData.password !== formData.repeatPassword) {
      toastRef.current.show(texts.t('repeat_password_fail'), 2000);
    } else {
      setLoading(true);
      firebase
        .auth()
        .createUserWithEmailAndPassword(formData.email, formData.password)
        .then(() => {
          const user = firebase.auth().currentUser;

          firebase.database().ref('Usuarios').child(user.uid).set({
            uid: user.uid,
            email: formData.email,
            name: formData.name,
            phone: formData.phone,
            provider: 'authfirebase',
            userType: 'normal',
            photoURL: '',
            sendSolicitude: false,
            keySolicitude: '',
          });
          setLoading(false);
          navigation.navigate('accountstack');
        })
        .catch(() => {
          setLoading(false);
          toastRef.current.show(texts.t('email_exits'), 2000);
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
        placeholder={texts.t('mail_form_placeholder')}
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
        placeholder={texts.t('user_name_placeholder')}
        containerStyle={styles.inputForm}
        keyboardType="default"
        onChange={e => onChange(e, 'name')}
        rightIcon={
          <Icon
            type="material-community"
            name="account"
            iconStyle={styles.iconRight}
          />
        }
      />
      <Input
        placeholder={texts.t('phone_placeholder')}
        keyboardType="phone-pad"
        maxLength={11}
        containerStyle={styles.inputForm}
        onChange={e => onChange(e, 'phone')}
        rightIcon={
          <Icon
            type="material-community"
            name="phone"
            iconStyle={styles.iconRight}
          />
        }
      />
      <Input
        placeholder={texts.t('pass_placeholder')}
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
      <Input
        placeholder={texts.t('repeat_password_placeholder')}
        containerStyle={styles.inputForm}
        password={true}
        secureTextEntry={showRepeatPassword ? false : true}
        onChange={e => onChange(e, 'repeatPassword')}
        rightIcon={
          <Icon
            type="material-community"
            name={showRepeatPassword ? 'eye-off-outline' : 'eye-outline'}
            iconStyle={styles.iconRight}
            onPress={() => setshowRepeatPassword(!showRepeatPassword)}
          />
        }
      />
      <Button
        title={texts.t('register_text')}
        buttonStyle={styles.btnStyle}
        containerStyle={styles.btnContainer}
        onPress={onSubmit}
      />

      <LoadingComponent isVisible={loading} text={texts.t('creating_account')+"..."} />
    </View>
  );
}
function defaultValue() {
  return {
    email: '',
    name: '',
    phone: '',
    password: '',
    repeatPassword: '',
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
    height: 50,
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
