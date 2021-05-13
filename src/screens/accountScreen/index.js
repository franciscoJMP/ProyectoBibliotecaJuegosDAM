import React, {useState, useEffect} from 'react';
import * as firebase from 'firebase';
import {
  UserLogger,
  UserGuest,
} from 'ProyectoVideoJuegos/src/components/StateUserComponent';
import {LoadingComponent} from 'ProyectoVideoJuegos/src/components';
import { titleGuestAccount,textGuestAccount } from "ProyectoVideoJuegos/src/utils/textInfo.js";

export default function AccountScreen(props) {
  const [login, setLogin] = useState(null);

  useEffect(() => {
    firebase.auth().onAuthStateChanged(user => {
      !user ? setLogin(false) : setLogin(true);
    });
  }, []);
  if (login === null)
    return <LoadingComponent isVisible={true} text="Cargando..." />;
  return login ? <UserLogger type="account" /> : <UserGuest title={titleGuestAccount} text={textGuestAccount} />;
}
