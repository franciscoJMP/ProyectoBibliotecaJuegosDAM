import React, {useState} from 'react';
import {Text, View} from 'react-native';
import {Input, Button} from 'react-native-elements';
import * as firebase from 'firebase';
import 'firebase/database';
import {isEmpty} from 'lodash';
import {styles} from './StylesChangeForms';
import {
  validateEmail,
  validatePassword,
} from 'ProyectoVideoJuegos/src/utils/validations';
import {reauthenticate} from 'ProyectoVideoJuegos/src/utils/api';
import {setI18nConfig} from 'ProyectoVideoJuegos/src/languages/i18n.js';
var texts = setI18nConfig();
const database = firebase.database();
export default function ChangeEmailForm(props) {
  const {email, setShowModal, toastRef} = props;
  const [formData, setFormData] = useState(defaultFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const onChange = (e, type) => {
    setFormData({...formData, [type]: e.nativeEvent.text});
  };
  const onSubmit = () => {
    setErrors({});
    if (!formData.email || email === formData.email) {
      setErrors({
        email: texts.t('err_samevoid_mail'),
      });
    } else if (!validateEmail(formData.email)) {
      setErrors({
        email: texts.t('err_mail_format'),
      });
    } else if (!formData.password) {
      setErrors({
        password: texts.t('err_form_empty_password'),
      });
    } else if (!validatePassword(formData.password)) {
      setErrors({
        password: texts.t('password_fail_mesagge'),
      });
    } else {
      reauthenticate(formData.password)
        .then(response => {
          setIsLoading(true);
          const user = firebase.auth().currentUser;
          firebase
            .auth()
            .currentUser.updateEmail(formData.email)
            .then(
              database
                .ref('Usuarios')
                .child(user.uid)
                .update({email: formData.email})
                .then(() => {
                  setIsLoading(false);
                  setShowModal(false);
                })
                .catch(() => {
                  setErrors({
                    email: texts.t('err_to_update_email'),
                  });
                  setIsLoading(false);
                }),
            )
            .catch(() => {
              setErrors({
                email: texts.t('err_to_update_email'),
              });
              setIsLoading(false);
            });
        })
        .catch(() => {
          setErrors({
            password: texts.t('err_no_correct_password'),
          });
          setIsLoading(false);
        });
    }
  };
  return (
    <View style={styles.view}>
      <Input
        placeholder={texts.t('mail_form_placeholder')}
        containerStyle={styles.input}
        defaultValue={email}
        keyboardType="email-address"
        rightIcon={{
          type: 'material-community',
          name: 'at',
          color: '#ccc',
        }}
        onChange={e => onChange(e, 'email')}
        errorMessage={errors.email}
      />
      <Input
        placeholder={texts.t('pass_placeholder')}
        containerStyle={styles.input}
        password={true}
        secureTextEntry={showPassword ? false : true}
        rightIcon={{
          type: 'material-community',
          name: showPassword ? 'eye-off-outline' : 'eye-outline',
          color: '#ccc',
          onPress: () => setShowPassword(!showPassword),
        }}
        onChange={e => onChange(e, 'password')}
        errorMessage={errors.password}
      />
      <Button
        title={texts.t('btn_change_mail')}
        containerStyle={styles.btnContainer}
        buttonStyle={styles.btn}
        onPress={onSubmit}
        loading={isLoading}
      />
    </View>
  );
}

const defaultFormData = () => {
  let data = {
    email: '',
    password: '',
  };
  return data;
};
