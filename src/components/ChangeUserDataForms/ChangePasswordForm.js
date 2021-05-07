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
        password: !formData.password
          ? 'La contraseña no puede estar vacia.'
          : '',
        newPassword: !formData.newPassword
          ? 'La contraseña no puede estar vacia.'
          : '',
        repeatNewPassword: !formData.repeatNewPassword
          ? 'La contraseña no puede estar vacia.'
          : '',
      };
    } else if (formData.newPassword !== formData.repeatNewPassword) {
      errorsTemp = {
        newPassword: 'Las contraseñas no son iguales.',
        repeatNewPassword: 'Las contraseñas no son iguales.',
      };
    } else if (!validatePassword(formData.newPassword)) {
      errorsTemp = {
        newPassword:
          'La contraseña tiene que ser mayor a 6 caracteres y contener mayusculas y minusculas',
        repeatNewPassword:
          'La contraseña tiene que ser mayor a 6 caracteres y contener mayusculas y minusculas',
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
                other: 'Error al actualizar la contraseña',
              };
              setIsLoading(false);
            });
        })
        .catch(error => {
          console.log(error);
          setIsLoading(false);
          errorsTemp = {
            password: 'La contraseña no es correcta',
          };
        });
    }
    isSetError && setErrors(errorsTemp);
  };
  return (
    <View style={styles.view}>
      <Input
        placeholder="Contraseña Actual"
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
        placeholder="Nueva Contraseña"
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
        placeholder="Repetir "
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
        title="Cambiar Contraseña"
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
