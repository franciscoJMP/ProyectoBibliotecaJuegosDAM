import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Input, Button} from 'react-native-elements';
import DropDownPicker from 'react-native-dropdown-picker';
import * as firebase from 'firebase';
import {styles} from './StylesChangeForms';

const bibliotecasDB = firebase.database().ref('Bibliotecas');
export default function ChangeState(props) {
  const {libraryId, setShowModal, gameState, items} = props;
  const [newGameState, setNewGameState] = useState(gameState);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = () => {
    setIsLoading(true);
    const user = firebase.auth().currentUser.uid;
    bibliotecasDB
      .child(user)
      .child(libraryId)
      .update({gameState: newGameState})
      .then(() => {
        setIsLoading(false);
        setShowModal(false);
      });
  };

  return (
    <View style={[styles.view, {height: '38%'}]}>
      <DropDownPicker
        items={items}
        placeholder="Estado"
        defaultValue={gameState}
        containerStyle={{width: '100%', height: 60, marginTop: 20}}
        style={{backgroundColor: '#fafafa'}}
        globalTextStyle={{fontSize: 20, fontWeight: 'bold'}}
        itemStyle={{
          justifyContent: 'flex-start',
          /* justifyContent: 'center', */
        }}
        dropDownStyle={{backgroundColor: '#fafafa'}}
        onChangeItem={item => setNewGameState(item.value)}
      />

      <Button
        title="Actualizar"
        containerStyle={{marginTop: 50, width: '95%',height:300}}
        buttonStyle={styles.btn}
        onPress={onSubmit}
        loading={isLoading}
      />
    </View>
  );
}
