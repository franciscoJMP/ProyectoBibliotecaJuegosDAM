import React, {useState, useEffect} from 'react';
import * as firebase from 'firebase';
import {
  UserLogger,
  UserGuest,
} from 'ProyectoVideoJuegos/src/components/StateUserComponent';
import {LoadingComponent} from 'ProyectoVideoJuegos/src/components';
import {
  titleGuestLibrary,
  textGuestLibrary,
} from 'ProyectoVideoJuegos/src/utils/textInfo.js';

export default function LibraryScreen(props) {
  const [login, setLogin] = useState(null);

  firebase.auth().onAuthStateChanged(user => {
    !user ? setLogin(false) : setLogin(true);
  });

  if (login === null)
    return <LoadingComponent isVisible={true} text="cargando..." />;
  return login ? (
    <UserLogger type="library" />
  ) : (
    <UserGuest title={titleGuestLibrary} text={textGuestLibrary} />
  );
}
