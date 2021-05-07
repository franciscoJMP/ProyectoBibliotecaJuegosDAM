import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Input, Button} from 'react-native-elements';
import * as firebase from 'firebase';
import {styles} from './StylesChangeForms';

const bibliotecasDB = firebase.database().ref('Bibliotecas');
export default function ChangePlusExtra(props) {
  const {libraryId, setShowModal, plusExtra} = props;
  const [newPlusExtra, setNewPlusExtra] = useState(plusExtra);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const onSubmit = () => {
    let isSetError = true;
    let errorsTemp = {};

    if (newPlusExtra === '') {
      errorsTemp = {
        mainHours: !newPlusExtra ? 'Este campo no puede estar vacio' : '',
      };
    } else {
      setIsLoading(true);
      const user = firebase.auth().currentUser.uid;
      bibliotecasDB
        .child(user)
        .child(libraryId)
        .update({plusExtra: newPlusExtra})
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
        placeholder="Actualizar Horas"
        containerStyle={styles.input}
        onChange={e => setNewPlusExtra(e.nativeEvent.text)}
        errorMessage={errors.mainHours}
        value={newPlusExtra}
      />
      <Button
        title="Actualizar"
        containerStyle={styles.btnContainer}
        buttonStyle={styles.btn}
        onPress={onSubmit}
        loading={isLoading}
      />
    </View>
  );
}
