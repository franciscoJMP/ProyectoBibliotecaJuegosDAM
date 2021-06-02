import React, {useState} from 'react';
import {Text, View} from 'react-native';
import {Input, Button} from 'react-native-elements';
import * as firebase from 'firebase';

import {isEmpty} from 'lodash';
import {styles} from './StylesChangeForms';
import {validatePassword} from 'ProyectoVideoJuegos/src/utils/validations';
import {reauthenticate} from 'ProyectoVideoJuegos/src/utils/api';
import {setI18nConfig} from 'ProyectoVideoJuegos/src/languages/i18n.js';
var texts = setI18nConfig();

export default function ChangePasswordForm(props) {
  const {setShowModal, toastRef} = props;
  const [formData, setFormData] = useState(defaultFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const onChange = (e, type) => {
    setFormData({...formData, [type]: e.nativeEvent.text});
  };
  const onSubmit = async () => {
    let isSetError = true;
    let errorsTemp = {};
    setErrors({});
    if (
      !formData.password ||
      !formData.newPassword ||
      !formData.repeatNewPassword
    ) {
      errorsTemp = {
        password: !formData.password ? texts.t('err_form_empty_password') : '',
        newPassword: !formData.newPassword
          ? texts.t('err_form_empty_password')
          : '',
        repeatNewPassword: !formData.repeatNewPassword
          ? texts.t('err_form_empty_password')
          : '',
      };
    } else if (formData.newPassword !== formData.repeatNewPassword) {
      errorsTemp = {
        newPassword: texts.t('err_form_equals_password'),
        repeatNewPassword: texts.t('err_form_equals_password'),
      };
    } else if (!validatePassword(formData.newPassword)) {
      errorsTemp = {
        newPassword: texts.t('err_form_equals_password'),
        repeatNewPassword: texts.t('err_form_equals_password'),
      };
    } else {
      await reauthenticate(formData.password)
        .then(async () => {
          setIsLoading(true);
          await firebase
            .auth()
            .currentUser.updatePassword(formData.newPassword)
            .then(() => {
              isSetError = false;
              setIsLoading(false);
              setShowModal(false);
              firebase.auth().signOut();
            })
            .catch(() => {
              errorsTemp = {
                other: texts.t('err_update_password'),
              };
              setIsLoading(false);
            });
        })
        .catch(error => {
          console.log(error);
          setIsLoading(false);
          errorsTemp = {
            password: texts.t('err_no_correct_password'),
          };
        });
    }
    isSetError && setErrors(errorsTemp);
  };
  return (
    <View style={styles.view}>
      <Input
        placeholder={texts.t('password_form_placeholder')}
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
      <Input
        placeholder={texts.t('new_password_placeholder')}
        containerStyle={styles.input}
        password={true}
        secureTextEntry={showPassword ? false : true}
        rightIcon={{
          type: 'material-community',
          name: showPassword ? 'eye-off-outline' : 'eye-outline',
          color: '#ccc',
          onPress: () => setShowPassword(!showPassword),
        }}
        onChange={e => onChange(e, 'newPassword')}
        errorMessage={errors.newPassword}
      />
      <Input
        placeholder={texts.t('repeat_password_placeholder')}
        containerStyle={styles.input}
        password={true}
        secureTextEntry={showPassword ? false : true}
        rightIcon={{
          type: 'material-community',
          name: showPassword ? 'eye-off-outline' : 'eye-outline',
          color: '#ccc',
          onPress: () => setShowPassword(!showPassword),
        }}
        errorMessage={errors.repeatNewPassword}
        onChange={e => onChange(e, 'repeatNewPassword')}
      />
      <Button
        title={texts.t('btn_change_password')}
        containerStyle={styles.btnContainer}
        buttonStyle={styles.btn}
        onPress={onSubmit}
        loading={isLoading}
      />
      <Text>{errors.other}</Text>
    </View>
  );
}
const defaultFormData = () => {
  let data = {
    password: '',
    newPassword: '',
    repeatNewPassword: '',
  };
  return data;
};
