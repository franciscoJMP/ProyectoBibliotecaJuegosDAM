import React, {useState} from 'react';
import {View, NativeModules} from 'react-native';
import {Input, Button} from 'react-native-elements';

import * as firebase from 'firebase';
import 'firebase/database';
import {styles} from '../ChangeUserDataForms/StylesChangeForms';
import {setI18nConfig} from 'ProyectoVideoJuegos/src/languages/i18n.js';
var texts = setI18nConfig();

const database = firebase.database().ref('Propiedades').child('Categorias');

export default function AddGameCategory(props) {
  const {setShowModal, toastRef, gameCategory} = props;
  const [newCategory, setNewCategory] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const onSubmit = () => {
    setError(null);
    if (!newCategory) {
      setError(texts.t('err_void_categroy'));
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
        placeholder={texts.t('placeholder_category')}
        defaultValue={newCategory && newCategory}
        containerStyle={styles.input}
        onChange={e => setNewCategory(e.nativeEvent.text)}
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
