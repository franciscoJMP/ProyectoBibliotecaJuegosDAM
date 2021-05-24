import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, FlatList, Image} from 'react-native';
import {SearchBar, ListItem, Icon} from 'react-native-elements';
import * as firebase from 'firebase';
import NetInfo from '@react-native-community/netinfo';
import 'firebase/storage';
import 'firebase/database';
import {NotNetworkConnection} from 'ProyectoVideoJuegos/src/components';
const juegosDB = firebase.database().ref('Juegos');

export default function SearchScreen(props) {
  const {navigation} = props;
  const [search, setSearch] = useState('');
  const [games, setGames] = useState([]);
  const [networkInfo, setNetworkInfo] = useState(true);

  useEffect(() => {
    if (search) {
      //Esto es igual ha hacer SELECT * FROM JUEGOS WHERE GAMENAME=Search%;
      juegosDB
        .orderByChild('gameName')
        .startAt(search)
        .endAt(search + '\uf8ff')
        .on('value', snapshot => {
          if (snapshot.exists()) {
            const arrayGames = [];
            snapshot.forEach(children => {
              arrayGames.push(children.val());
            });
            setGames(arrayGames);
          } else {
            setGames([]);
          }
        });
    } else {
      setGames([]);
    }
  }, [search]);

  useEffect(() => {
    NetInfo.addEventListener(state => {
      setNetworkInfo(state.isInternetReachable);
    });
    firebase.auth().onAuthStateChanged(user => {
      !user ? setLogin(false) : setLogin(true);
    });
  }, []);
  if (!networkInfo) {
    return <NotNetworkConnection />;
  } else {
    return (
      <View>
        <SearchBar
          placeholder="Buscar Juego"
          onChangeText={e => setSearch(e)}
          value={search}
          containerStyle={StyleSheet.searchBar}
        />
        {games.length === 0 ? (
          <NotFoundGames />
        ) : (
          <FlatList
            data={games}
            renderItem={game => (
              <GameComponent game={game} navigation={navigation} />
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        )}
      </View>
    );
  }
}
const NotFoundGames = () => {
  return (
    <View style={{flex: 1, alignItems: 'center'}}>
      <Image
        source={require('../../assets/img/no-result-found.png')}
        style={{width: 200, height: 200}}
      />
    </View>
  );
};

const GameComponent = props => {
  const {game, navigation} = props;
  const {gameName, imagesGames, id} = game.item;
  return (
    <ListItem
      title={gameName}
      leftAvatar={{
        source: imagesGames[0]
          ? {uri: imagesGames[0]}
          : require('../../assets/img/no-image.png'),
      }}
      rightIcon={<Icon type="material-community" name="chevron-right" />}
      onPress={() =>
        navigation.navigate('mainscreen', {
          screen: 'viewgameinfo',
          params: {id, gameName},
        })
      }
    />
  );
};
const styles = StyleSheet.create({
  searchBar: {
    marginBottom: 200,
  },
});
