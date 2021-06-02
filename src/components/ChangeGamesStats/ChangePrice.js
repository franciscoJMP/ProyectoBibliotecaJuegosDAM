import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Input, Button} from 'react-native-elements';
import * as firebase from 'firebase';
import {styles} from './StylesChangeForms';
import {setI18nConfig} from 'ProyectoVideoJuegos/src/languages/i18n.js';
var texts = setI18nConfig();

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
        mainHours: !newPrice ? texts.t('void_input_msg') : '',
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
        placeholder={texts.t('update_price')}
        containerStyle={styles.input}
        onChange={e => setNewPrice(e.nativeEvent.text)}
        errorMessage={errors.mainHours}
        value={newPrice}
        maxLength={7}
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
