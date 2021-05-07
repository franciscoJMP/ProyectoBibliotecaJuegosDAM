import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import {Rating, Image, Icon} from 'react-native-elements';
import Toast from 'react-native-easy-toast';
import {List} from 'react-native-paper';
import * as firebase from 'firebase';
import 'firebase/storage';
import 'firebase/database';
import {
  LoadingComponent,
  CarouselComponent,
  ListReviewComponent,
} from 'ProyectoVideoJuegos/src/components';
import {colors} from 'ProyectoVideoJuegos/src/styles/withColors';

const database = firebase.database().ref('Juegos');

//Obtenemos el ancho de la pantalla del dispositivo
const screenWidth = Dimensions.get('window').width;
export default function ViewGameInfo(props) {
  const {navigation, route} = props;
  const {id, gameName} = route.params;
  const [gameInfo, setGameInfo] = useState(null);
  const [rating, setRating] = useState(0);
  const [expandedInfo, setExpandedInfo] = useState(false); //Expandir acordeon de Informacion General
  const [expandedPersonalInfo, setExpandedPersonalInfo] = useState(false); //Expandir acordeon de informacion Personal
  const [isFavourite, setIsFavourite] = useState(false);
  const [userLogged, setUserLogged] = useState(false);
  const [libraryKey, setLibraryKey] = useState('');

  const toastRef = useRef();
  //Funcion para truncar el titulo si es muy largo
  const truncateTitle = (str, n) => {
    return str.length > n ? str.substr(0, n - 1) + '...' : str;
  };
  firebase.auth().onAuthStateChanged(user => {
    user ? setUserLogged(true) : setUserLogged(false);
  });

  useEffect(() => {
    navigation.setOptions({
      title: truncateTitle(gameName, 20),
      headerTitleStyle: {
        width: screenWidth,
      },
    });
    database.child(id).on('value', snapshot => {
      setGameInfo(snapshot.val());
      if (snapshot.exists()) setRating(snapshot.val().rating);
    });
  }, []);
  useEffect(() => {
    if (userLogged && gameInfo) {
      const idUser = firebase.auth().currentUser.uid;
      firebase
        .database()
        .ref('Bibliotecas')
        .child(idUser)
        .on('value', snapshot => {
          snapshot.forEach(data => {
            const info = data.val();
            if (info.idGame === id) {
              setLibraryKey(data.key);
              setIsFavourite(true);
            }
          });
        });
    }
  }, [userLogged, gameInfo]);

  const addLibrary = () => {
    if (!userLogged) {
      toastRef.current.show(
        'Para añadir ese juego a tu biblioteca debes estar registrado',
      );
    } else {
      const idUser = firebase.auth().currentUser.uid;
      const payload = {
        idUser: idUser,
        idGame: id,
        mainHours: '',
        plusExtra: '',
        fullHours: '',
        price: '',
        gameState: '',
        gamePlatform: '',
      };
      firebase
        .database()
        .ref('Bibliotecas')
        .child(idUser)
        .push(payload)
        .then(() => {
          toastRef.current.show('Juego añadido a la biblioteca');
          setIsFavourite(true);
        });
    }
  };
  const removeFromLibrary = () => {
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
            const idUser = firebase.auth().currentUser.uid;
            firebase
              .database()
              .ref('Bibliotecas')
              .child(idUser)
              .child(libraryKey)
              .remove()
              .then(() => {
                setIsFavourite(false);
                toastRef.current.show('Juego eliminado con exito');
              });
          },
        },
      ],
      {cancelable: false},
    );
  };
  const handlePressGeneralInfo = () => setExpandedInfo(!expandedInfo);
  const handlePressPersonalInfo = () =>
    setExpandedPersonalInfo(!expandedPersonalInfo);

  if (!gameInfo)
    return <LoadingComponent isVisible={true} text="Cargando..." />;
  return (
    <ScrollView vertical style={styles.viewBody}>
      <View style={styles.viewFavourites}>
        <Icon
          type="material-community"
          name={isFavourite ? 'plus-circle' : 'plus-circle-outline'}
          onPress={isFavourite ? removeFromLibrary : addLibrary}
          color={isFavourite ? colors.primary : colors.secondary}
          size={35}
          underlayColor="transparent"
        />
      </View>
      <CarouselComponent
        arrayImages={gameInfo.imagesGames}
        height={250}
        width={screenWidth}
      />
      <TitleGame
        gameName={gameInfo.gameName}
        gameDescription={gameInfo.gameDescription}
        rating={rating}
      />

      <List.Accordion
        title="Información General"
        expanded={expandedInfo}
        onPress={handlePressGeneralInfo}>
        <GameInfo gameInfo={gameInfo} age={gameInfo.age} />
      </List.Accordion>

      <List.Accordion
        title="Estadisticas"
        expanded={expandedPersonalInfo}
        onPress={handlePressPersonalInfo}>
        <Stats gameInfo={gameInfo} />
      </List.Accordion>

      <ListReviewComponent navigation={navigation} idGame={gameInfo.id} />
      <Toast ref={toastRef} position="center" opacity={0.9} />
    </ScrollView>
  );
}

const TitleGame = props => {
  const {gameName, gameDescription, rating} = props;

  return (
    <View style={styles.viewGameTitle}>
      <View style={{flexDirection: 'row'}}>
        <Text style={[styles.gameTitle, {width: '60%'}]}>{gameName}</Text>
        <Rating
          style={styles.rating}
          imageSize={20}
          startingValue={parseFloat(rating)}
          readonly
        />
      </View>

      <Text style={styles.gameDescriptionStyle}>{gameDescription}</Text>
    </View>
  );
};
const GameInfo = props => {
  const {gameInfo, age} = props;
  const {gameYear, gameDevelop, mainPlusExtra, mainStory} = gameInfo;
  let imgAge;
  switch (age) {
    case '3':
      imgAge = require('../../assets/img/pegi-icons/3.jpg');
      break;
    case '7':
      imgAge = require('../../assets/img/pegi-icons/7.jpg');
      break;
    case '12':
      imgAge = require('../../assets/img/pegi-icons/12.jpg');
      break;
    case '16':
      imgAge = require('../../assets/img/pegi-icons/16.png');
      break;
    case '18':
      imgAge = require('../../assets/img/pegi-icons/18.png');
      break;
  }
  return (
    <View style={styles.viewGameInfo}>
      <Text style={styles.infosText}>Desarroladora: {gameDevelop}</Text>
      <Text style={styles.infosText}>Fecha de salida: {gameYear}</Text>
      <Text style={styles.infosText}>
        Tiempo en pasar la campaña: {mainStory}
      </Text>
      <Text style={styles.infosText}>
        Tiempo en conseguir el 100%: {mainPlusExtra}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'center',
        }}>
        <Image source={imgAge} resizeMode="contain" style={styles.logo} />
      </View>
    </View>
  );
};

const Stats = props => {
  const {gameInfo} = props;
  const {mainStory, mainPlusExtra, full, quantityStats} = gameInfo;
  let main, extra, auxFull;
  main = Math.round(parseInt(mainStory) / parseInt(quantityStats));
  extra = Math.round(parseInt(mainPlusExtra) / parseInt(quantityStats));
  auxFull = Math.round(parseInt(full) / parseInt(quantityStats));
  return (
    <View style={styles.viewGameInfo}>
      <Text style={styles.infosText}>
        Historia Principal: {mainStory === '0' || isNaN(main) ? 'Sin estadistica' : main} horas.
      </Text>

      <Text style={styles.infosText}>
        Extras: {mainPlusExtra === '0' || isNaN(extra) ? 'Sin estadistica' : extra} horas.
      </Text>

      <Text style={styles.infosText}>
        Completar el 100%: {full === '0' || isNaN(auxFull) ? 'Sin estadistica' : auxFull} horas.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  viewBody: {
    flex: 1,
    backgroundColor: '#fff',
  },
  viewGameTitle: {
    padding: 15,
  },
  gameTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  gameDescriptionStyle: {
    marginTop: 5,
    color: 'grey',
  },
  rating: {
    position: 'absolute',
    right: 0,
  },
  viewGameInfo: {
    margin: 15,
    marginTop: 25,
  },
  infosText: {
    margin: 10,
    fontSize: 15,
  },
  logo: {
    position: 'relative',
    width: 50,
    height: 50,
  },
  viewFavourites: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 2,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 100,
    padding: 5,
    paddingLeft: 15,
  },
});
