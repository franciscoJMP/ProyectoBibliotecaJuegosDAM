import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Input, Button} from 'react-native-elements';
import * as firebase from 'firebase';
import {styles} from './StylesChangeForms';

const bibliotecasDB = firebase.database().ref('Bibliotecas');
export default function ChangePrice(props) {
  const {libraryId, setShowModal, price} = props;
  const [newPrice, setNewPrice] = useState(price);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const onSubmit = () => {
    let isSetError = true;
    let errorsTemp = {};

    if (newPrice === '') {
      errorsTemp = {
        mainHours: !newPrice ? 'Este campo no puede estar vacio' : '',
      };
    } else {
      setIsLoading(true);
      const user = firebase.auth().currentUser.uid;
      bibliotecasDB
        .child(user)
        .child(libraryId)
        .update({price: newPrice})
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
        placeholder="Actualizar Precio"
        containerStyle={styles.input}
        onChange={e => setNewPrice(e.nativeEvent.text)}
        errorMessage={errors.mainHours}
        value={newPrice}
        maxLength={7}
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
