import React, {useState, useEffect} from 'react';
import {View} from 'react-native';
import {Input, Button} from 'react-native-elements';
import * as firebase from 'firebase';
import 'firebase/database';
import {styles} from './StylesChangeForms';
const database = firebase.database();
export default function ChangeDisplayNameForm(props) {
  const {displayName, setShowModal, toastRef} = props;
  const [newDisplayName, setNewDisplayName] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const onSubmit = () => {
    setError(null);
    if (!newDisplayName) {
      setError('El nombre no puede estar vacio');
    } else if (displayName === newDisplayName) {
      setError('El nombre no puede ser igual al actual');
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
              setError('Error al actualizar el nombre');
            });
        });
    }
  };
  return (
    <View style={styles.view}>
      <Input
        placeholder="Nombre"
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
        title="Cambiar Nombre"
        containerStyle={styles.btnContainer}
        buttonStyle={styles.btn}
        onPress={onSubmit}
        loading={isLoading}
      />
    </View>
  );
}
