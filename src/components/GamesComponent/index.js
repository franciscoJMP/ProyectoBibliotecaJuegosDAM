import React, {useState, useEffect, Fragment} from 'react';
import {View, StyleSheet, Text, ActivityIndicator, LogBox} from 'react-native';
import * as firebase from 'firebase';
import 'firebase/database';
import {useNavigation} from '@react-navigation/native';
import {setI18nConfig} from 'ProyectoVideoJuegos/src/languages/i18n.js';
import {LoadingComponent} from 'ProyectoVideoJuegos/src/components';
import ControllerComponent from './ControllerComponent';
var texts = setI18nConfig();
LogBox.ignoreAllLogs();
const database = firebase.database();

export default function GamesComponent(props) {
  const [userInfo, setuserInfo] = useState(null);
  const {
    gamesList,
    totalGamesList,
    handleLoadMore,
    isLoading,
  } = props;
  useEffect(() => {
    (async () => {
      const user = await firebase.auth().currentUser;
      setuserInfo(user);
    })();
  }, []);

  return (
    <View style={styles.viewBody}>
      {userInfo && (
        <ControllerComponent
          userInfo={userInfo}
          gamesList={gamesList}
          totalGamesList={totalGamesList}
        
          handleLoadMore={handleLoadMore}
          isLoading={isLoading}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  viewBody: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
