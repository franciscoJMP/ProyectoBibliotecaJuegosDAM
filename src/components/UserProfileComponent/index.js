import React, {Component, useState, useEffect, useRef, Fragment} from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import {Button} from 'react-native-elements';
import Toast from 'react-native-easy-toast';
import * as firebase from 'firebase';
import LoadingComponent from '../LoadingComponent';
import InfoUserComponent from '../InfoUserComponent';
import AccountOptionsComponent from '../AccountOptionsComponent';
import {colors} from 'ProyectoVideoJuegos/src/styles/withColors';

export default function UserProfileComponent(props) {
  const [userInfo, setuserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const toastRef = useRef();
  useEffect(() => {
    (async () => {
      const user = await firebase.auth().currentUser;
      setuserInfo(user);
    })();
  }, []);
  return (
    <View style={styles.viewUserInfo}>
      {userInfo ? (
        <Fragment>
          <InfoUserComponent
            userInfo={userInfo}
            toastRef={toastRef}
            setLoading={setLoading}
            setLoadingText={setLoadingText}
          />
          <AccountOptionsComponent userInfo={userInfo} toastRef={toastRef} />
        </Fragment>
      ) : (
        <ActivityIndicator size="large" color="#1251E1" />
      )}

      <Button
        title="Cerrar Sesion"
        buttonStyle={styles.btnCloseSession}
        titleStyle={styles.btCloseSessionText}
        onPress={() => firebase.auth().signOut()}
      />
      <Toast ref={toastRef} position="center" opacity={0.9}/>
      <LoadingComponent isVisible={loading} text={loadingText} />
    </View>
  );
}
const styles = StyleSheet.create({
  viewUserInfo: {
    minHeight: '100%',
    backgroundColor: colors.backgroudContent,
  },
  btnCloseSession: {
    marginTop: 30,
    borderRadius: 0,
    backgroundColor: colors.primaryTextContrast,
    borderTopWidth: 1,
    borderTopColor: '#e3e3e3',
    borderBottomWidth: 1,
    borderBottomColor: '#e3e3e3',
    paddingTop: 10,
    paddingBottom: 10,
  },
  btCloseSessionText: {
    color: colors.primary,
  },
});
