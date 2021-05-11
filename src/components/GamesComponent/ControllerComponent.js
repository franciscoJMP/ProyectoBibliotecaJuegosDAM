import React, {useState, useEffect, Fragment} from 'react';
import {View, Text, ActivityIndicator} from 'react-native';
import * as firebase from 'firebase';
import 'firebase/database';
import AdminOptions from './AdminOptions';
import ListGames from './ListGames';
const database = firebase.database();

export default function ControllerComponent(props) {
  const {
    userInfo,
    gamesList,
    totalGamesList,
    handleLoadMore,
    isLoading,
  } = props;
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = database.ref('Usuarios').child(userInfo.uid);
    userData.on('value', snapshot => {
      setUser(snapshot.val());
    });
  }, []);

  return user ? (
    <Fragment>
      <ListGames
        gamesList={gamesList}
        totalGamesList={totalGamesList}
        handleLoadMore={handleLoadMore}
        userInfo={user}
        isLoading={isLoading}
      />
      {user.userType === 'admin' && <AdminOptions />}
    </Fragment>
  ) : (
    <ActivityIndicator size="large" color="#1251E1" />
  );
}
