import React, {useState, useEffect, useRef, Fragment} from 'react';
import {StyleSheet, ActivityIndicator, ScrollView} from 'react-native';
import {CommonActions} from '@react-navigation/native';
import {Button} from 'react-native-elements';
import Toast from 'react-native-easy-toast';
import * as firebase from 'firebase';
import LoadingComponent from '../LoadingComponent';
import InfoUserComponent from '../InfoUserComponent';
import AccountOptionsComponent from '../AccountOptionsComponent';
import {colors} from 'ProyectoVideoJuegos/src/styles/withColors';
import {setI18nConfig} from 'ProyectoVideoJuegos/src/languages/i18n.js';
var texts = setI18nConfig();

export default function UserProfileComponent(props) {
  const {navigation} = props;
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
  const singout = () => {
    firebase.auth().signOut();
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [{name: 'mainscreen'}],
      }),
    );
  };
  return (
    <ScrollView style={styles.viewUserInfo}>
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
        title={texts.t('btn_signout')}
        buttonStyle={styles.btnCloseSession}
        titleStyle={styles.btCloseSessionText}
        onPress={singout}
      />
      <Toast ref={toastRef} position="center" opacity={0.9} />
      <LoadingComponent isVisible={loading} text={loadingText} />
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  viewUserInfo: {
    minHeight: '100%',
    backgroundColor: colors.backgroudContent,
  },
  btnCloseSession: {
    marginTop: 10,
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
