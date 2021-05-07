import React, {useState} from 'react';
import {View} from 'react-native';
import {Input, Button} from 'react-native-elements';
import * as firebase from 'firebase';
import 'firebase/database';
import {styles} from './StylesChangeForms';
const database = firebase.database();
export default function ChangePhoneNumberForm(props) {
  const {displayPhone, setShowModal, toastRef} = props;
  const [newDisplayPhone, setNewDisplayPhone] = useState(displayPhone);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const onSubmit = () => {
    setError(null);

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
            setError('Error al actualizar el numero');
          });
      });
  };
  return (
    <View style={styles.view}>
      <Input
        placeholder="Numero"
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
        title="Cambiar Numero"
        containerStyle={styles.btnContainer}
        buttonStyle={styles.btn}
        onPress={onSubmit}
        loading={isLoading}
      />
    </View>
  );
}
