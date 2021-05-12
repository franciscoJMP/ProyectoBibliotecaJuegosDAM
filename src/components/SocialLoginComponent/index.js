import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import * as firebase from 'firebase';
import 'firebase/auth';
import 'firebase/database';
import {useNavigation} from '@react-navigation/native';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {LoadingComponent} from 'ProyectoVideoJuegos/src/components';

export default function SocialLoginComponent() {
  const [userInfo, setuserInfo] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const [userExit, setUserExit] = useState(false);
  const singIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const {accessToken, idToken} = await GoogleSignin.signIn();
      setLoading(true);
      const credential = firebase.auth.GoogleAuthProvider.credential(
        idToken,
        accessToken,
      );
      await firebase.auth().signInWithCredential(credential);
      const user = firebase.auth().currentUser;
      const database = firebase.database().ref('Usuarios').child(user.uid);
      //Comprobamos que no tenga datos en la base de datos, si no tiene le creamos sus datos
      await database.once('value').then(snapshot => {
        if (!snapshot.exists()) {
          database.set({
            uid: user.uid,
            email: user.email,
            name: user.displayName,
            phone: user.phoneNumber,
            provider: 'google',
            userType: 'normal',
            photoURL: user.photoURL,
            sendSolicitude: false,
            keySolicitude: '',
          });
        }
      });

      setLoading(false);
      navigation.goBack();
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
        alert('Cancel');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        alert('Signin in progress');
        // operation (f.e. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        alert('PLAY_SERVICES_NOT_AVAILABLE');
        // play services not available or outdated
      } else {
        // some other error happened
      }
    }
  };
  const signOut = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      setloggedIn(false);
      setuserInfo([]);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    GoogleSignin.configure({
      scopes: ['email'], // what API you want to access on behalf of the user, default is email and profile
      webClientId:
        '338313711627-5rrfvr5v9spqmu7bh0gh0jqig2m9m81b.apps.googleusercontent.com', // client ID of type WEB for your server (needed to verify user ID and offline access)
      offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
    });
  }, []);
  return (
    <View style={styles.viewContainer}>
      <GoogleSigninButton
        style={{width: '100%'}}
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={singIn}
      />
      <LoadingComponent isVisible={loading} text={'Iniciando Sesión'} />
    </View>
  );
}
const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 5,
    marginRight: 40,
    marginLeft: 40,
  },
});
