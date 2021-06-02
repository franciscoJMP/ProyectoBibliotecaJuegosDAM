import React, {useState} from 'react';
import {View} from 'react-native';
import {Input, Button} from 'react-native-elements';
import * as firebase from 'firebase';
import 'firebase/database';
import {styles} from '../ChangeUserDataForms/StylesChangeForms';
import {setI18nConfig} from 'ProyectoVideoJuegos/src/languages/i18n.js';
var texts = setI18nConfig();

const database = firebase.database().ref('Propiedades').child('Plataformas');

export default function AddGamePlatform(props) {
  const {setShowModal, toastRef, gamePlatform} = props;
  const [newPlatform, setNewPlatform] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const onSubmit = () => {
    setError(null);
    if (!newPlatform) {
      setError(texts.t('err_gamePlatform'));
    } else {
      setIsLoading(true);
      const auxPlatform = gamePlatform;
      auxPlatform.push(newPlatform);
      database.set(auxPlatform).then(() => {
        setIsLoading(false);
        setNewPlatform(null);
      });
    }
  };
  return (
    <View style={styles.view}>
      <Input
        placeholder={texts.t('placeholder_platform')}
        defaultValue={newPlatform && newPlatform}
        containerStyle={styles.input}
        onChange={e => setNewPlatform(e.nativeEvent.text)}
        errorMessage={error}
      />
      <Button
        title={texts.t('add_sgText')}
        containerStyle={styles.btnContainer}
        buttonStyle={styles.btn}
        onPress={onSubmit}
        loading={isLoading}
      />
    </View>
  );
}
