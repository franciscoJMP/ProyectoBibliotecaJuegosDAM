import React, {useState} from 'react';
import {View} from 'react-native';
import {Input, Button} from 'react-native-elements';
import * as firebase from 'firebase';
import {styles} from './StylesChangeForms';
import {setI18nConfig} from 'ProyectoVideoJuegos/src/languages/i18n.js';
var texts = setI18nConfig();

const bibliotecasDB = firebase.database().ref('Bibliotecas');
export default function ChangeFull(props) {
  const {libraryId, setShowModal, fullHours} = props;
  const [newFullHours, setNewFullHours] = useState(fullHours);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const onSubmit = () => {
    let isSetError = true;
    let errorsTemp = {};

    if (newFullHours === '') {
      errorsTemp = {
        mainHours: !newFullHours ? texts.t('void_input_msg') : '',
      };
    } else {
      setIsLoading(true);
      const user = firebase.auth().currentUser.uid;
      bibliotecasDB
        .child(user)
        .child(libraryId)
        .update({fullHours: newFullHours})
        .then(() => {
          setIsLoading(false);
          setShowModal(false);
        });
    }
    isSetError && setErrors(errorsTemp);
  };
  return (
    <View style={styles.view}>
      <Input
        placeholder={texts.t('update_hours')}
        containerStyle={styles.input}
        onChange={e => setNewFullHours(e.nativeEvent.text)}
        errorMessage={errors.mainHours}
        value={newFullHours}
      />
      <Button
        title={texts.t('btn_update')}
        containerStyle={styles.btnContainer}
        buttonStyle={styles.btn}
        onPress={onSubmit}
        loading={isLoading}
      />
    </View>
  );
}
