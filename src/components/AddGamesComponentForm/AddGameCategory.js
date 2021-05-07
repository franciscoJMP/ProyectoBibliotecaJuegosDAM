import React, {useState} from 'react';
import {View, NativeModules} from 'react-native';
import {Input, Button} from 'react-native-elements';

import * as firebase from 'firebase';
import 'firebase/database';
import {styles} from '../ChangeUserDataForms/StylesChangeForms';
const database = firebase.database().ref('Propiedades').child('Categorias');

export default function AddGameCategory(props) {
  const {setShowModal, toastRef, gameCategory} = props;
  const [newCategory, setNewCategory] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const onSubmit = () => {
    setError(null);
    if (!newCategory) {
      setError('La categoria no puede estar vacia');
    } else {
      setIsLoading(true);
      const index =
        NativeModules.I18nManager.localeIdentifier === 'es_ES' ? 0 : 1;
      const auxCategory = gameCategory;
      auxCategory[index].categories.push(newCategory);
      database.set(auxCategory).then(() => {
        setIsLoading(false);
        setNewCategory(null);
      });
    }
  };

  return (
    <View style={styles.view}>
      <Input
        placeholder="Categoria"
        defaultValue={newCategory && newCategory}
        containerStyle={styles.input}
        onChange={e => setNewCategory(e.nativeEvent.text)}
        errorMessage={error}
      />
      <Button
        title="Añadir"
        containerStyle={styles.btnContainer}
        buttonStyle={styles.btn}
        onPress={onSubmit}
        loading={isLoading}
      />
    </View>
  );
}
