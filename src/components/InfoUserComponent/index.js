import React, {useState, useEffect, Fragment} from 'react';
import {Text, View, StyleSheet, LogBox, ActivityIndicator} from 'react-native';
import {Avatar, Button} from 'react-native-elements';
import * as firebase from 'firebase';
import 'firebase/storage';
import 'firebase/database';
import RNFetchBlob from 'react-native-fetch-blob';
import ImagePicker from 'react-native-image-crop-picker';
import {colors} from 'ProyectoVideoJuegos/src/styles/withColors';
import {setI18nConfig} from 'ProyectoVideoJuegos/src/languages/i18n.js';
var texts = setI18nConfig();

LogBox.ignoreAllLogs();
const database = firebase.database();
export default function InfoUserComponent(props) {
  const {userInfo, setLoading, setLoadingText} = props;
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = database.ref('Usuarios').child(userInfo.uid);
    userData.on('value', snapshot => {
      setUser(snapshot.val());
    });
  }, []);

  const changeAvatar = async () => {
    const Blob = RNFetchBlob.polyfill.Blob;
    const fs = RNFetchBlob.fs;
    window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
    window.Blob = Blob;
    try {
      await ImagePicker.openPicker({
        width: 300,
        height: 400,
        cropping: false,
        mediaType: 'photo',
      }).then(image => {
        setLoadingText(texts.t('updating_img') + '...');
        setLoading(true);
        const imagePath = image.path;
        let uploadBlob = null;
        const imageRef = firebase
          .storage()
          .ref()
          .child(`avatares/${userInfo.uid}`);
        let mime = 'image/jpg';

        fs.readFile(imagePath, 'base64')
          .then(data => {
            return Blob.build(data, {type: `${mime};BASE64`});
          })
          .then(blob => {
            uploadBlob = blob;
            return imageRef.put(blob, {contentType: mime});
          })
          .then(() => {
            uploadBlob.close();
            return imageRef.getDownloadURL();
          })
          .then(url => {
            updatePhotoUrl();
          })
          .catch(error => {
            console.log(error);
          });
      });
    } catch (error) {
      console.log('Error: ', error);
    }
  };
  const updatePhotoUrl = () => {
    firebase
      .storage()
      .ref(`avatares/${userInfo.uid}`)
      .getDownloadURL()
      .then(async response => {
        const update = {
          photoURL: response,
        };
        await firebase.auth().currentUser.updateProfile(update);
        await firebase
          .database()
          .ref('Usuarios')
          .child(userInfo.uid)
          .update({photoURL: response})
          .then(() => {});
        setLoading(false);
      })
      .catch(() => {
        console.log('Error');
      });
  };
  const userTextStyleFunction = () => {
    let style;
    if (user) {
      const type = user.userType;
      switch (type) {
        case 'normal':
          style = styles.displayName;
          break;
        case 'moderator':
          style = styles.displayNameModerator;
          break;
        case 'admin':
          style = styles.displayNameAdmin;
          break;
      }
    }
    return style;
  };
  const userTextStyle = userTextStyleFunction();

  return (
    <View style={styles.viewUserInfo}>
      <Avatar
        rounded
        size="large"
        showEditButton
        onEditPress={changeAvatar}
        containerStyle={styles.userInfoAvatar}
        source={
          userInfo.photoURL
            ? {uri: userInfo.photoURL}
            : require('../../assets/img/avatar-default.jpg')
        }
      />
      <View>
        {user ? (
          <Fragment>
            <Text style={userTextStyle}>{user.name}</Text>
            <Text>{user.email}</Text>
            <Text>{user.phone ? user.phone : texts.t('no_phone')}</Text>
          </Fragment>
        ) : (
          <ActivityIndicator size="large" color="#1251E1" />
        )}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  viewUserInfo: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: colors.backgroudContent,
    paddingTop: 30,
    paddingBottom: 30,
  },
  userInfoAvatar: {
    marginRight: 20,
  },
  displayName: {
    fontWeight: 'bold',
    color: 'black',
    paddingBottom: 5,
  },
  displayNameAdmin: {
    fontWeight: 'bold',
    paddingBottom: 5,
    color: '#F50606',
  },
  displayNameModerator: {
    fontWeight: 'bold',
    paddingBottom: 5,
    color: colors.primary,
  },
});
