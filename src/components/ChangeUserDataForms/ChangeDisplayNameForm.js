import React, {useState, useEffect} from 'react';
import {View} from 'react-native';
import {Input, Button} from 'react-native-elements';
import * as firebase from 'firebase';
import 'firebase/database';
import {styles} from './StylesChangeForms';
import {setI18nConfig} from 'ProyectoVideoJuegos/src/languages/i18n.js';
var texts = setI18nConfig();

const database = firebase.database();
export default function ChangeDisplayNameForm(props) {
  const {displayName, setShowModal, toastRef} = props;
  const [newDisplayName, setNewDisplayName] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const onSubmit = () => {
    setError(null);
    if (!newDisplayName) {
      setError(texts.t('err_new_display_name'));
    } else if (displayName === newDisplayName) {
      setError(texts.t('err_same_display_name'));
    } else {
      setIsLoading(true);
      const update = {
        displayName: newDisplayName,
      };
      const updateRealTime = {
        name: newDisplayName,
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
              setError(texts.t('err_update_name'));
            });
        });
    }
  };
  return (
    <View style={styles.view}>
      <Input
        placeholder={texts.t('placeholder_gameName')}
        containerStyle={styles.input}
        rightIcon={{
          type: 'material-community',
          name: 'account-circle-outline',
          color: '#ccc',
        }}
        defaultValue={displayName}
        onChange={e => setNewDisplayName(e.nativeEvent.text)}
        errorMessage={error}
      />
      <Button
        title={texts.t('user_option_change_name')}
        containerStyle={styles.btnContainer}
        buttonStyle={styles.btn}
        onPress={onSubmit}
        loading={isLoading}
      />
    </View>
  );
}
