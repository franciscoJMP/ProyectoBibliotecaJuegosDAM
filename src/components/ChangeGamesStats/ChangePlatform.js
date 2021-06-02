import React, {useState} from 'react';
import {View} from 'react-native';
import {Button} from 'react-native-elements';
import DropDownPicker from 'react-native-dropdown-picker';
import * as firebase from 'firebase';
import {styles} from './StylesChangeForms';
import {setI18nConfig} from 'ProyectoVideoJuegos/src/languages/i18n.js';
var texts = setI18nConfig();

const bibliotecasDB = firebase.database().ref('Bibliotecas');
export default function ChangePlatform(props) {
  const {libraryId, setShowModal, gamePlatform, listGamesPlatform} = props;
  const [newGamePlatform, setNewGamePlatform] = useState(gamePlatform);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = () => {
    setIsLoading(true);
    const user = firebase.auth().currentUser.uid;
    bibliotecasDB
      .child(user)
      .child(libraryId)
      .update({gamePlatform: newGamePlatform})
      .then(() => {
        setIsLoading(false);
        setShowModal(false);
      });
  };
  return (
    <View style={[styles.view, {height: '38%'}]}>
      <DropDownPicker
        items={listGamesPlatform}
        defaultValue={newGamePlatform}
        placeholder={texts.t('platform_text')}
        containerStyle={{width: '100%', height: 60, marginTop: 20}}
        globalTextStyle={{fontSize: 20, fontWeight: 'bold'}}
        style={{backgroundColor: '#fafafa'}}
        itemStyle={{
          justifyContent: 'flex-start',
        }}
        dropDownStyle={{backgroundColor: '#fafafa'}}
        onChangeItem={item => setNewGamePlatform(item.value)}
      />

      <Button
        title={texts.t('btn_update')}
        containerStyle={{marginTop: 50, width: '95%', height: 300}}
        buttonStyle={styles.btn}
        onPress={onSubmit}
        loading={isLoading}
      />
    </View>
  );
}
