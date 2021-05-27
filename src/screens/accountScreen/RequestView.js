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
  NotNetworkConnection,
  NotFoundSolicitude,
} from 'ProyectoVideoJuegos/src/components';
import {colors} from 'ProyectoVideoJuegos/src/styles/withColors';
const solicitudesDB = firebase.database().ref('Solicitudes');
const usuariosDB = firebase.database().ref('Usuarios');
export default function RequestView() {
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
        if (
          children.val().keySolicitude &&
          children.val().keySolicitude !== ''
        ) {
          arrayUsers.push(children.val());
        }
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
            if (
              children.val().keySolicitude &&
              children.val().keySolicitude !== ''
            ) {
              arrayUsers.push(children.val());
            }
          });
          setFilterUsers(arrayUsers);
        });
    } else {
      setFilterUsers(null);
    }
  }, [search]);
  if (!users) {
    return <LoadingComponent isVisible={true} text="Cargando Solicitudes" />;
  }
  if (users.length === 0) {
    return (
      <View style={styles.viewBody}>
        <SearchBar
          placeholder="Buscar email"
          onChangeText={e => setSearch(e)}
          value={search}
          containerStyle={StyleSheet.searchBar}
        />
        <NotFoundSolicitude />
      </View>
    );
  } else {
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
      </View>
    );
  }
}

const ListUsers = props => {
  const {user, toastRef, setRenderComponent, setShowModal} = props;
  const {email, name, uid, userType, photoURL, keySolicitude} = user.item;

  const updateUserType = () => {
    let payload = {
      keySolicitude: '',
      userType: 'moderator',
      sendSolicitude: false,
    };
    usuariosDB
      .child(uid)
      .update(payload)
      .then(() => {
        solicitudesDB
          .child(keySolicitude)
          .remove()
          .then(() => {})
          .catch(e => {
            console.log(e);
          });
      })
      .catch(e => {
        console.log(e);
      });
  };
  const rejectRequest = () => {
    let payload = {
      keySolicitude: '',
      sendSolicitude: false,
    };
    usuariosDB
      .child(uid)
      .update(payload)
      .then(() => {
        solicitudesDB
          .child(keySolicitude)
          .remove()
          .then(() => {})
          .catch(e => {
            console.log(e);
          });
      })
      .catch(e => {
        console.log(e);
      });
  };

  return (
    <ListItem
      title={email}
      leftAvatar={{
        source:
          photoURL !== ''
            ? {uri: photoURL}
            : require('../../assets/img/avatar-default.jpg'),
      }}
      leftIcon={
        <Icon type="material-community" name="close" onPress={rejectRequest} />
      }
      rightIcon={
        <Icon type="material-community" name="check" onPress={updateUserType} />
      }
      containerStyle={{borderWidth: 2}}
    />
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
