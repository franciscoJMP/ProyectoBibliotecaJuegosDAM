import React, {useState, useEffect, useRef} from 'react';

import {StyleSheet, Text, View, FlatList, Alert} from 'react-native';
import {Icon, Button, SearchBar, ListItem} from 'react-native-elements';
import Toast from 'react-native-easy-toast';
import * as firebase from 'firebase';
import 'firebase/storage';
import 'firebase/database';
import {
  LoadingComponent,
  ModalComponent,
} from 'ProyectoVideoJuegos/src/components';
import {colors} from 'ProyectoVideoJuegos/src/styles/withColors';
import {setI18nConfig} from 'ProyectoVideoJuegos/src/languages/i18n.js';
var texts = setI18nConfig();

const usuariosDB = firebase.database().ref('Usuarios');
export default function AdministrateUsers() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState(null);
  const [filterUsers, setFilterUsers] = useState(null);
  const [renderComponent, setRenderComponent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const toastRef = useRef();
  useEffect(() => {
    usuariosDB.on('value', snapshot => {
      const arrayUsers = [];
      snapshot.forEach(children => {
        arrayUsers.push(children.val());
      });
      setUsers(arrayUsers);
    });
  }, []);

  useEffect(() => {
    if (search) {
      usuariosDB
        .orderByChild('email')
        .startAt(search)
        .endAt(search + '\uf8ff')
        .on('value', snapshot => {
          const arrayUsers = [];
          snapshot.forEach(children => {
            arrayUsers.push(children.val());
          });
          setFilterUsers(arrayUsers);
        });
    } else {
      setFilterUsers(null);
    }
  }, [search]);

  if (!users)
    return (
      <LoadingComponent
        isVisible={true}
        text={texts.t('loading_user') + '...'}
      />
    );
  return (
    <View style={styles.viewBody}>
      <SearchBar
        placeholder={texts.t('find_email_msg')}
        onChangeText={e => setSearch(e)}
        value={search}
        containerStyle={StyleSheet.searchBar}
      />
      <FlatList
        data={filterUsers ? filterUsers : users}
        renderItem={user => (
          <ListUsers
            user={user}
            toastRef={toastRef}
            setRenderComponent={setRenderComponent}
            setShowModal={setShowModal}
          />
        )}
        keyExtractor={(item, index) => index.toString()}
      />
      <Toast ref={toastRef} position="center" opacity={0.9} />

      {renderComponent && (
        <ModalComponent isVisible={showModal} setIsVisible={setShowModal}>
          {renderComponent}
        </ModalComponent>
      )}
    </View>
  );
}
const ListUsers = props => {
  const {user, toastRef, setRenderComponent, setShowModal} = props;
  const {email, name, uid, userType, photoURL} = user.item;
  const currentUser = firebase.auth().currentUser.email;

  let thisPhotoUrl = '';

  //controlo las fotos que no tiene contenido
  if (photoURL !== undefined) {
    thisPhotoUrl = photoURL;
  }

  const updateUserType = () => {
    if (userType === 'normal') {
      toastRef.current.show(texts.t('msg_manageuser_one'), 1500);
    } else if (userType === 'moderator') {
      setRenderComponent(
        <OptionsModeratorUsers
          user={user}
          toastRef={toastRef}
          setShowModal={setShowModal}
        />,
      );
      setShowModal(true);
    } else {
      toastRef.current.show(texts.t('msg_manageuser_two'), 1500);
    }
  };

  const userTypeColorFunction = () => {
    let color = 'black';
    switch (userType) {
      case 'moderator':
        color = colors.primary;
        break;
      case 'admin':
        color = '#F50606';
    }
    return color;
  };
  const userTypeColor = userTypeColorFunction();

  if (currentUser !== email) {
    return (
      <ListItem
        title={email}
        leftAvatar={{
          source:
            thisPhotoUrl !== ''
              ? {uri: thisPhotoUrl}
              : require('../../assets/img/avatar-default.jpg'),
        }}
        rightIcon={
          <Icon
            type="material-community"
            name={
              userType === 'admin' ? 'shield-account' : 'shield-account-outline'
            }
            iconStyle={{color: userTypeColor}}
            onPress={updateUserType}
          />
        }
        containerStyle={{borderWidth: 2}}
        titleStyle={{color: userTypeColor}}
      />
    );
  } else {
    return null;
  }
};

const OptionsModeratorUsers = props => {
  const {user, toastRef, setShowModal} = props;
  const {email, name, uid, userType, photoURL} = user.item;

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);

  const userSetAdmin = () => {
    setIsLoading(true);
    Alert.alert(
      texts.t('promote_msg_title') + ' ' + name + '?',
      texts.t('promote_msg_text'),
      [
        {
          text: texts.t('cancel_btn'),
          style: 'cancel',
          onPress: () => {
            setIsLoading(false);
          },
        },
        {
          text: texts.t('btn_promote'),
          onPress: () => {
            let payload = {userType: 'admin'};
            usuariosDB
              .child(uid)
              .update(payload)
              .then(() => {
                setIsLoading(false);
                setShowModal(false);

                toastRef.current.show(
                  texts.t('promote_ok_msg_one') +
                    ' ' +
                    name +
                    ' ' +
                    texts.t('promote_ok_msg_two'),
                  1500,
                );
              });
          },
        },
      ],
      {cancelable: false},
    );
  };
  const userDeleteModerator = () => {
    setIsLoadingDelete(true);
    Alert.alert(
      texts.t('delete_userpermission_msg_one') +
        ' ' +
        name +
        ' ' +
        texts.t('delete_userpermission_msg_two'),
      texts.t('delete_userpermission_msg_three'),
      [
        {
          text: texts.t('cancel_btn'),
          style: 'cancel',
          onPress: () => {
            setIsLoadingDelete(false);
          },
        },
        {
          text: texts.t('delete_btn'),
          onPress: () => {
            let payload = {userType: 'normal'};
            usuariosDB
              .child(uid)
              .update(payload)
              .then(() => {
                setIsLoadingDelete(false);
                setShowModal(false);

                toastRef.current.show(texts.t('permission_complete_ok'), 1500);
              });
          },
        },
      ],
      {cancelable: false},
    );
  };
  return (
    <View style={[styles.view, {height: '35%'}]}>
      <Text style={{fontWeight: 'bold', fontSize: 20}}>
        {texts.t('manage_user') + ' ' + name}
      </Text>
      <Button
        title={texts.t('delete_mod_permission')}
        containerStyle={styles.btnContainer}
        buttonStyle={styles.btn}
        disabled={isLoading}
        onPress={userDeleteModerator}
        loading={isLoadingDelete}
      />
      <Button
        title={texts.t('add_mod_permission')}
        containerStyle={styles.btnContainer}
        buttonStyle={styles.btn}
        disabled={isLoadingDelete}
        onPress={userSetAdmin}
        loading={isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  viewBody: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  loaderGames: {
    marginTop: 10,
    marginBottom: 10,
  },
  viewGame: {
    margin: 10,
  },
  imageView: {
    width: '100%',
    height: 180,
  },
  infoGame: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: -30,
    backgroundColor: '#fff',
  },
  gameName: {
    fontWeight: 'bold',
    fontSize: 25,
  },
  libraryIcon: {
    marginTop: -35,
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 100,
  },
  searchBar: {
    marginBottom: 200,
  },
  view: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  input: {
    marginBottom: 10,
  },
  btnContainer: {
    marginTop: 30,
    height: '100%',
    width: '95%',
  },
  btn: {
    backgroundColor: colors.primary,
  },
});
