import React, {useState, useEffect, useRef} from 'react';

import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {Image, Icon, Button, SearchBar, ListItem} from 'react-native-elements';
import Toast from 'react-native-easy-toast';
import * as firebase from 'firebase';
import 'firebase/storage';
import 'firebase/database';
import {
  LoadingComponent,
  ModalComponent,
} from 'ProyectoVideoJuegos/src/components';
import {colors} from 'ProyectoVideoJuegos/src/styles/withColors';

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
    return <LoadingComponent isVisible={true} text="Cargando Usuarios" />;
  return (
    <View style={styles.viewBody}>
      <SearchBar
        placeholder="Buscar email"
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

  const updateUserType = () => {
    if (userType === 'normal') {
      toastRef.current.show(
        'Este usuario debe ser promovido por un moderador ',
        1500,
      );
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
      toastRef.current.show(
        'Este usuario es administrador y no se puede gestionar ',
        1500,
      );
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
            photoURL !== ''
              ? {uri: photoURL}
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
      '¿Promover al usuario ' + name + '?',
      'Una vez promovido tendra control total y no podra ser eliminado',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => {
            setIsLoading(false);
          },
        },
        {
          text: 'Promover',
          onPress: () => {
            let payload = {userType: 'admin'};
            usuariosDB
              .child(uid)
              .update(payload)
              .then(() => {
                setIsLoading(false);
                setShowModal(false);

                toastRef.current.show(
                  'Usuario ' + name + ' promovido con exito',
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
      '¿Eliminar a ' + name + ' su permiso de moderador?',
      'Podra ser promovido en cualquier momento',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => {
            setIsLoadingDelete(false);
          },
        },
        {
          text: 'Eliminar',
          onPress: () => {
            let payload = {userType: 'normal'};
            usuariosDB
              .child(uid)
              .update(payload)
              .then(() => {
                setIsLoadingDelete(false);
                setShowModal(false);

                toastRef.current.show(
                  'Permiso de moderacion eliminado con exito',
                  1500,
                );
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
        Gestión usuario {name}
      </Text>
      <Button
        title="Eliminar Moderación"
        containerStyle={styles.btnContainer}
        buttonStyle={styles.btn}
        disabled={isLoading}
        onPress={userDeleteModerator}
        loading={isLoadingDelete}
      />
      <Button
        title="Promover a administrador"
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
