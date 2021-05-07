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
import {LoadingComponent} from 'ProyectoVideoJuegos/src/components';
import {colors} from 'ProyectoVideoJuegos/src/styles/withColors';

const usuariosDB = firebase.database().ref('Usuarios');
export default function AdministrateUsers() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState(null);
  const [filterUsers, setFilterUsers] = useState(null);
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
        renderItem={user => <ListUsers user={user} toastRef={toastRef} />}
        keyExtractor={(item, index) => index.toString()}
      />
      <Toast ref={toastRef} position="center" opacity={0.9} />
    </View>
  );
}
const ListUsers = props => {
  const {user, toastRef} = props;
  const {email, name, uid, userType, photoURL} = user.item;
  const currentUser = firebase.auth().currentUser.email;
  const updateUserType = () => {
    let payload;
    if (userType === 'normal') {
      payload = {userType: 'admin'};
    } else {
      payload = {userType: 'normal'};
    }
    usuariosDB
      .child(uid)
      .update(payload)
      .then(() => {
        toastRef.current.show(
          'Usuario cambiado a Usuario ' + payload.userType,
          1500,
        );
      });
  };
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
            onPress={updateUserType}
          />
        }
        containerStyle={{borderWidth: 2}}
        titleStyle={{color: userType === 'admin' ? 'red' : 'black'}}
      />
    );
  } else {
    return null;
  }
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
});
