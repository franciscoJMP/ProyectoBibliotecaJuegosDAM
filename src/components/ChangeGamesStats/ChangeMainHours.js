import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Input, Button} from 'react-native-elements';
import * as firebase from 'firebase';
import {styles} from './StylesChangeForms';

const bibliotecasDB = firebase.database().ref('Bibliotecas');
export default function ChangeMainHours(props) {
  const {libraryId, setShowModal, mainHours} = props;
  const [newMainHours, setNewMainHours] = useState(mainHours);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const onSubmit = () => {
    let isSetError = true;
    let errorsTemp = {};
   
    if (newMainHours === '') {
      errorsTemp = {
        mainHours: !newMainHours ? 'Este campo no puede estar vacio' : '',
      };
    } else {
      setIsLoading(true);
      const user = firebase.auth().currentUser.uid;
      bibliotecasDB
        .child(user)
        .child(libraryId)
        .update({mainHours: newMainHours})
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
        onChange={e => setNewMainHours(e.nativeEvent.text)}
        errorMessage={errors.mainHours}
        value={newMainHours}
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
