import React, {useState, useEffect} from 'react';

import NetInfo from '@react-native-community/netinfo';
import * as firebase from 'firebase';
import {
  UserLogger,
  UserGuest,
} from 'ProyectoVideoJuegos/src/components/StateUserComponent';

import {
  LoadingComponent,
  NotNetworkConnection,
} from 'ProyectoVideoJuegos/src/components';
import {
  titleGuestLibrary,
  textGuestLibrary,
} from 'ProyectoVideoJuegos/src/utils/textInfo.js';

export default function LibraryScreen(props) {
  const {navigation} = props;
  const [login, setLogin] = useState(null);
  const [networkInfo, setNetworkInfo] = useState(true);

  firebase.auth().onAuthStateChanged(user => {
    !user ? setLogin(false) : setLogin(true);
  });

  useEffect(() => {
    NetInfo.addEventListener(state => {
      setNetworkInfo(state.isInternetReachable);
    });
  }, []);

  useEffect(() => {
    if (!networkInfo) {
      navigation.setOptions({
        headerRight: null,
      });
    }
  }, [networkInfo]);
  if (login === null) {
    return <LoadingComponent isVisible={true} text="cargando..." />;
  } else {
    if (networkInfo) {
      return login ? (
        <UserLogger type="library" />
      ) : (
        <UserGuest title={titleGuestLibrary} text={textGuestLibrary} />
      );
    } else {
      return <NotNetworkConnection />;
    }
  }
}
