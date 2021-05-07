import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {Image, Icon, Button, SearchBar} from 'react-native-elements';

import {useFocusEffect, useNavigation} from '@react-navigation/native';
import Toast from 'react-native-easy-toast';
import * as firebase from 'firebase';
import 'firebase/storage';
import 'firebase/database';
import {isEmpty} from 'lodash';
import {LoadingComponent} from 'ProyectoVideoJuegos/src/components';
import {colors} from 'ProyectoVideoJuegos/src/styles/withColors';

const bibliotecasDB = firebase.database().ref('Bibliotecas');
const juegosDB = firebase.database().ref('Juegos');

export default function LibraryComponent(props) {
  const [games, setGames] = useState(null);
  const [savesGames, setSavesGames] = useState(null);
  const [userLogged, setUserLogged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toastRef = useRef();
  const navigation = useNavigation();
  const [search, setSearch] = useState('');

  firebase.auth().onAuthStateChanged(user => {
    user ? setUserLogged(true) : setUserLogged(false);
  });

  useFocusEffect(
    useCallback(() => {
      if (userLogged) {
        const idUser = firebase.auth().currentUser.uid;
        bibliotecasDB.child(idUser).on('value', snapshot => {
          const idGames = [];
          snapshot.forEach(children => {
            idGames.push({idGame: children.val().idGame, key: children.key});
          });
          getDataGames(idGames).then(response => {
            setGames(response);
          });
        });
      }
    }, [userLogged]),
  );

  useEffect(() => {
    if (search) {
      juegosDB
        .orderByChild('gameName')
        .startAt(search)
        .endAt(search + '\uf8ff')
        .on('value', snapshot => {
          if (snapshot.exists()) {
            const filtersGames = [];
            snapshot.forEach(children => {
              const data = children.val();
              const filter = games.filter(
                game => game.gameName === data.gameName,
              );
              if (!isEmpty(filter)) filtersGames.push({...filter[0]});
            });
            if (filtersGames.length > 0) {
              setSavesGames(filtersGames);
            } else {
              setSavesGames(null);
            }
          } else {
            setSavesGames(null);
          }
        });
    } else {
      setSavesGames(null);
    }
  }, [search]);

  const getDataGames = idGames => {
    const arrayGames = [];
    idGames.forEach(data => {
      const id = data.idGame;
      juegosDB.child(id).on('value', snapshot => {
        let object = snapshot.val();
        object = {...object, key: data.key};
        arrayGames.push(object);
      });
    });
    return Promise.all(arrayGames);
  };

  if (games?.length === 0) {
    return <NotFoundGames />;
  }
  return (
    <View style={styles.viewBody}>
      <SearchBar
        placeholder="Buscar Juego"
        onChangeText={e => setSearch(e)}
        value={search}
        containerStyle={StyleSheet.searchBar}
      />
      {games ? (
        <FlatList
          data={savesGames ? savesGames : games}
          renderItem={game => (
            <Game
              game={game}
              setIsLoading={setIsLoading}
              toastRef={toastRef}
              navigation={navigation}
            />
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      ) : (
        <View style={styles.loaderGames}>
          <ActivityIndicator size="large" />
          <Text style={{textAlign: 'center'}}>Cargando Juegos...</Text>
        </View>
      )}
      <Toast ref={toastRef} position="center" opacity={0.9} />
      <LoadingComponent text="Eliminando juego" isVisible={isLoading} />
    </View>
  );
}
const NotFoundGames = () => {
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Icon type="material-community" name="alert-outline" size={50} />
      <Text style={{fontSize: 20, fontWeight: 'bold'}}>
        No tienes juegos agregados
      </Text>
    </View>
  );
};

const Game = props => {
  const {game, setIsLoading, toastRef, navigation} = props;
  const {gameName, imagesGames, key, id} = game.item;

  const confirmRemoveLibrary = () => {
    Alert.alert(
      'Eliminar Juego de la biblioteca',
      'Si elimina este juego perdera todas sus estadisticas personales',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          onPress: () => {
            setIsLoading(true);
            const idUser = firebase.auth().currentUser.uid;
            firebase
              .database()
              .ref('Bibliotecas')
              .child(idUser)
              .child(key)
              .remove()
              .then(() => {
                setIsLoading(false);
                toastRef.current.show('Juego eliminado con exito');
              });
          },
        },
      ],
      {cancelable: false},
    );
  };
  return (
    <View style={styles.viewGame}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('viewgamestats', {id, gameName, key})
        }>
        <Image
          resizeMode="cover"
          style={styles.imageView}
          PlaceholderContent={<ActivityIndicator color="#fff" />}
          source={
            imagesGames[0]
              ? {uri: imagesGames[0]}
              : require('../../assets/img/no-image.png')
          }
        />
        <View style={styles.infoGame}>
          <Text style={styles.gameName}>{gameName}</Text>
          <Icon
            type="material-community"
            name="minus-circle"
            onPress={confirmRemoveLibrary}
            color={colors.primary}
            size={30}
            containerStyle={styles.libraryIcon}
            underlayColor="transparent"
          />
        </View>
      </TouchableOpacity>
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
});
