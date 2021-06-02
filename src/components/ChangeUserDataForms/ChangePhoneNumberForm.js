import React, {useState} from 'react';
import {View} from 'react-native';
import {Input, Button} from 'react-native-elements';
import * as firebase from 'firebase';
import 'firebase/database';
import {styles} from './StylesChangeForms';
import {setI18nConfig} from 'ProyectoVideoJuegos/src/languages/i18n.js';
var texts = setI18nConfig();

const database = firebase.database();
export default function ChangePhoneNumberForm(props) {
  const {displayPhone, setShowModal, toastRef} = props;
  const [newDisplayPhone, setNewDisplayPhone] = useState(displayPhone);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = () => {
    setError(null);
    if (!newDisplayPhone) {
      setError(texts.t('forggotenForm_err_empty_input'));
    } else {
      setIsLoading(true);
      const update = {
        phoneNumber: newDisplayPhone,
      };
      const updateRealTime = {
        phone: newDisplayPhone,
      };

      const user = firebase.auth().currentUser;
      firebase
        .auth()
        .currentUser.updateProfile(update)
        .then(() => {
          database
            .ref('Usuarios')
            .child(user.uid)
            .update(updateRealTime)
            .then(() => {
              setIsLoading(false);
              setShowModal(false);
            })
            .catch(() => {
              setIsLoading(false);
              setError(texts.t('err_update_phone'));
            });
        });
    }
  };
  return (
    <View style={styles.view}>
      <Input
        placeholder={texts.t('phone_text')}
        containerStyle={styles.input}
        rightIcon={{
          type: 'material-community',
          name: 'phone',
          color: '#ccc',
        }}
        keyboardType="phone-pad"
        maxLength={11}
        defaultValue={displayPhone}
        onChange={e => setNewDisplayPhone(e.nativeEvent.text)}
        errorMessage={error}
      />
      <Button
        title={texts.t('user_option_change_phone')}
        containerStyle={styles.btnContainer}
        buttonStyle={styles.btn}
        onPress={onSubmit}
        loading={isLoading}
      />
    </View>
  );
}
