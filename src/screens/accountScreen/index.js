import React, {useState, useEffect} from 'react';
import * as firebase from 'firebase';
import {
  UserLogger,
  UserGuest,
} from 'ProyectoVideoJuegos/src/components/StateUserComponent';
import NetInfo from '@react-native-community/netinfo';
import {
  LoadingComponent,
  NotNetworkConnection,
} from 'ProyectoVideoJuegos/src/components';
import {
  titleGuestAccount,
  textGuestAccount,
} from 'ProyectoVideoJuegos/src/utils/textInfo.js';

export default function AccountScreen(props) {
  const [login, setLogin] = useState(null);
  const [networkInfo, setNetworkInfo] = useState(true);

  useEffect(() => {
    NetInfo.addEventListener(state => {
      setNetworkInfo(state.isInternetReachable);
    });
    firebase.auth().onAuthStateChanged(user => {
      !user ? setLogin(false) : setLogin(true);
    });
  }, []);
  if (login === null) {
    return <LoadingComponent isVisible={true} text="Cargando..." />;
  } else {
    if (networkInfo) {
      return login ? (
        <UserLogger type="account" />
      ) : (
        <UserGuest title={titleGuestAccount} text={textGuestAccount} />
      );
    } else {
      return <NotNetworkConnection />;
    }
  }
}
