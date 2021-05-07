import React, {
  Component,
  useState,
  useEffect,
  useCallback,
  Fragment,
} from 'react';
import {View, Text, Button, ActivityIndicator} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import * as firebase from 'firebase';
import 'firebase/database';
import {
  LoadingComponent,
  GamesComponent,
} from 'ProyectoVideoJuegos/src/components';
import ListGames from 'ProyectoVideoJuegos/src/components/GamesComponent/ListGames';
const database = firebase.database().ref('Juegos');

export default function MainScreen(props) {
  const [networkInfo, setNetworkInfo] = useState(true);
  const [login, setLogin] = useState(null);
  const [gamesList, setGamesList] = useState(null);
  const [totalGamesList, setTotalGamesList] = useState(null);
  const [startGames, setStartGames] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  //Limite de carga de la lista de los juegos
  const limitsGames = 7;

  useEffect(() => {
    (async () => {
      const user = await firebase.auth().currentUser;
      firebase
        .database()
        .ref('Usuarios')
        .child(user.uid)
        .on('value', snapshot => {
          setUserInfo(snapshot.val());
        });
    })();
  }, []);

  useEffect(() => {
    NetInfo.addEventListener(state => {
      setNetworkInfo(state.isInternetReachable);
    });
    firebase.auth().onAuthStateChanged(user => {
      !user ? setLogin(false) : setLogin(true);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      database.on('value', snapshot => {
        setTotalGamesList(snapshot.numChildren());
      });
      downloadContent();

      database.on('child_changed', snapshot => {
        downloadContent();
      });
      database.on('child_removed', snapshot => {
        downloadContent();
      });
    }, []),
  );

  const downloadContent = () => {
    const resultGames = [];
    database
      .orderByChild('id')
      .limitToFirst(limitsGames)
      .on('value', snapshot => {
        var i = 1;
        snapshot.forEach(childSnapshot => {
          let game = childSnapshot.val();

          resultGames.push(game);
          if (i === snapshot.numChildren()) {
            setStartGames(childSnapshot);
          }
          i++;
        });
        setGamesList(resultGames);
      });
  };

  const handleLoadMore = () => {
    const resultGames = [];
    if (gamesList.length < totalGamesList) {
      setIsLoading(true);
      database
        .orderByChild('id')
        .startAt(startGames.val().id)
        .limitToFirst(limitsGames + 1)
        .on('value', snapshot => {
          var i = 0;

          if (snapshot.numChildren() > 0) {
            snapshot.forEach(childSnapshot => {
              if (i > 0) {
                let game = childSnapshot.val();
                resultGames.push(game);
                if (i === snapshot.numChildren() - 1) {
                  setStartGames(childSnapshot);
                }
              }

              i++;
            });
          }
        });
      setGamesList([...gamesList, ...resultGames]);
    } else {
      setIsLoading(false);
    }
  };

  return networkInfo ? (
    <Fragment>
      {}
      {login === null && gamesList === null ? (
        <LoadingComponent isVisible={true} text="Cargando..." />
      ) : login ? (
        <GamesComponent
          gamesList={gamesList}
          totalGamesList={totalGamesList}
          handleLoadMore={handleLoadMore}
          isLoading={isLoading}
        />
      ) : (
        <Fragment>
          {gamesList !== null && totalGamesList !== null && (
            <ListGames
              gamesList={gamesList}
              userInfo={null}
              totalGamesList={totalGamesList}
              handleLoadMore={handleLoadMore}
              isLoading={isLoading}
            />
          )}
        </Fragment>
      )}
    </Fragment>
  ) : (
    <View>
      <Text>Sin Conexion</Text>
    </View>
  );
}
