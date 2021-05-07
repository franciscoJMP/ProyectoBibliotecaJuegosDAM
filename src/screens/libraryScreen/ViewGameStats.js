import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import {Image, Icon, Button, Input} from 'react-native-elements';
import {List} from 'react-native-paper';
import Toast from 'react-native-easy-toast';
import DropDownPicker from 'react-native-dropdown-picker';
import AlertAsync from 'react-native-alert-async';
import * as firebase from 'firebase';
import 'firebase/storage';
import 'firebase/database';
import {colors} from 'ProyectoVideoJuegos/src/styles/withColors';
import {
  LoadingComponent,
  CarouselComponent,
  ModalComponent,
} from 'ProyectoVideoJuegos/src/components';
import {
  ChangeMainHours,
  ChangePlusExtra,
  ChangeFull,
  ChangeState,
  ChangePlatform,
  ChangePrice,
} from 'ProyectoVideoJuegos/src/components/ChangeGamesStats';
import {items} from './items';
import {reject} from 'lodash';

const juegosDB = firebase.database().ref('Juegos');
const bibliotecasDB = firebase.database().ref('Bibliotecas');

const screenWidth = Dimensions.get('window').width;

export default function ViewGameStats(props) {
  const {navigation, route} = props;
  const {id, gameName, key} = route.params;

  const [gameInfo, setGameInfo] = useState(null);
  const [gamesLibraryInfo, setGamesLibraryInfo] = useState(null);
  const [expandedInfo, setExpandedInfo] = useState(false); //Expandir acordeon de Informacion General
  const [expandedPersonalInfo, setExpandedPersonalInfo] = useState(false); //Expandir acordeon de informacion Personal
  const [showModal, setShowModal] = useState(false);
  const [renderComponent, setRenderComponent] = useState(null);
  const toastRef = useRef();

  //Funcion para truncar el titulo si es muy largo
  const truncateTitle = (str, n) => {
    return str.length > n ? str.substr(0, n - 1) + '...' : str;
  };

  useEffect(() => {
    navigation.setOptions({
      title: truncateTitle(gameName, 20),
      headerTitleStyle: {
        width: screenWidth,
      },
    });
    juegosDB.child(id).on('value', snapshot => {
      setGameInfo(snapshot.val());
    });
    const user = firebase.auth().currentUser.uid;
    bibliotecasDB
      .child(user)
      .child(key)
      .on('value', snapshot => {
        setGamesLibraryInfo(snapshot.val());
      });
  }, []);

  const handlePressGeneralInfo = () => setExpandedInfo(!expandedInfo);
  const handlePressPersonalInfo = () =>
    setExpandedPersonalInfo(!expandedPersonalInfo);
  const viewAddStats = () => {
    setRenderComponent(
      <AddGameStats
        setShowModal={setShowModal}
        libraryId={key}
        id={id}
        gameInfo={gameInfo}
      />,
    );
    setShowModal(true);
  };

  if (!gameInfo || !gamesLibraryInfo)
    return <LoadingComponent isVisible={true} text="Cargando..." />;
  return (
    <ScrollView vertical style={styles.viewBody}>
      <CarouselComponent
        arrayImages={gameInfo.imagesGames}
        height={250}
        width={screenWidth}
      />
      <TitleGame
        gameName={gameInfo.gameName}
        gameDescription={gameInfo.gameDescription}
        age={gameInfo.age}
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
        <Stats
          gamesLibraryInfo={gamesLibraryInfo}
          gamesPlatform={gameInfo.gamePlatform}
          setRenderComponent={setRenderComponent}
          setShowModal={setShowModal}
          gameId={id}
          libraryId={key}
          gameInfo={gameInfo}
          toastRef={toastRef}
        />
      </List.Accordion>

      <Button
        title="Añadir Estadisticas"
        onPress={viewAddStats}
        buttonStyle={styles.btnAddGame}></Button>

      {renderComponent && (
        <ModalComponent isVisible={showModal} setIsVisible={setShowModal}>
          {renderComponent}
        </ModalComponent>
      )}

      <Toast ref={toastRef} position="center" opacity={0.9} />
    </ScrollView>
  );
}

const TitleGame = props => {
  const {gameName, gameDescription, age} = props;

  return (
    <View style={styles.viewGameTitle}>
      <View style={{flexDirection: 'row', marginBottom: 10}}>
        <Text style={[styles.gameTitle, {width: '100%'}]}>{gameName}</Text>
      </View>

      <Text style={styles.gameDescriptionStyle}>{gameDescription}</Text>
    </View>
  );
};

const GameInfo = props => {
  const {gameInfo, age} = props;
  const {gameYear, gameDevelop, mainPlusExtra, mainStory, rating} = gameInfo;

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
      <Text style={styles.infosText}>Historia Principal: {mainStory}</Text>
      <Text style={styles.infosText}>Completar el 100%: {mainPlusExtra}</Text>
      <Text style={styles.infosText}>Nota Media: {rating}/5</Text>
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
  const {
    gamesLibraryInfo,
    setRenderComponent,
    setShowModal,
    libraryId,
    gamesPlatform,
    gameId,
    gameInfo,
    toastRef,
  } = props;
  const {
    fullHours,
    mainHours,
    plusExtra,
    price,
    gameState,
    gamePlatform,
  } = gamesLibraryInfo;
  const {full, mainStory, mainPlusExtra, quantityStats} = gameInfo;
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const listGamesPlatform = [];
  gamesPlatform.forEach(platform => {
    const obj = {label: platform, value: platform};
    listGamesPlatform.push(obj);
  });

  const uploadStats = () => {
    setIsButtonDisabled(true);
    Alert.alert(
      '¿Publicar Estadisticas?',
      'Las estadisticas son anonimas y lo unico que se añaden son las horas al conteo global',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => setIsButtonDisabled(false),
        },
        {
          text: 'Publicar',
          onPress: () => {
            let mainTotal, plusExtraTotal, fullTotal, quantityStatsTotal;
            if (
              parseInt(mainHours) <= 0 ||
              parseInt(plusExtra) <= 0 ||
              parseInt(fullHours) <= 0
            ) {
              setIsButtonDisabled(false);
              toastRef.current.show(
                'No se pueden publicar estadisticas si hay alguna que valga 0',
                1200,
              );
            } else {
              setIsLoading(true);
              quantityStatsTotal = parseInt(quantityStats) + 1;
              mainTotal = parseInt(mainStory) + parseInt(mainHours);
              plusExtraTotal = parseInt(mainPlusExtra) + parseInt(plusExtra);
              fullTotal = parseInt(full) + parseInt(fullHours);
              const payload = {
                full: fullTotal,
                mainStory: mainTotal,
                mainPlusExtra: plusExtraTotal,
                quantityStats: quantityStatsTotal,
              };

              setTimeout(() => {
                promiseUploadStast(payload)
                  .then(response => {
                    if (response) {
                      setTimeout(() => {
                        setIsLoading(false);
                        setIsButtonDisabled(false);
                      }, 1200);
                    }
                  })
                  .catch(e => {
                    setIsLoading(false);
                    setIsButtonDisabled(false);
                  });
              }, 100);
            }
          },
        },
      ],
      {cancelable: false},
    );
  };
  const promiseUploadStast = async payload => {
    return await new Promise((resolve, reject) => {
      juegosDB
        .child(gameId)
        .update(payload)
        .then(() => {
          resolve(true);
        })
        .catch(e => {
          reject(false);
        });
    });
  };
  return (
    <View style={styles.viewGameInfo}>
      <View style={styles.viewTextStats}>
        <Text style={styles.infosText}>
          Estado: <Text>{gameState === '' ? 'Sin estado' : gameState} </Text>
        </Text>
        {gameState !== '' && (
          <Icon
            type="material-community"
            name="pencil-outline"
            containerStyle={styles.containerIcon}
            onPress={() => {
              setRenderComponent(
                <ChangeState
                  libraryId={libraryId}
                  setShowModal={setShowModal}
                  gameState={gameState}
                  items={items}
                />,
              );
              setShowModal(true);
            }}
          />
        )}
      </View>

      <View style={styles.viewTextStats}>
        <Text style={styles.infosText}>
          Historia Principal: {mainHours === '' ? '0' : mainHours}{' '}
        </Text>
        {mainHours !== '' && (
          <Icon
            type="material-community"
            name="pencil-outline"
            containerStyle={styles.containerIcon}
            onPress={() => {
              setRenderComponent(
                <ChangeMainHours
                  libraryId={libraryId}
                  setShowModal={setShowModal}
                  mainHours={mainHours}
                />,
              );
              setShowModal(true);
            }}
          />
        )}
      </View>
      <View style={styles.viewTextStats}>
        <Text style={styles.infosText}>
          Extras: {plusExtra === '' ? '0' : plusExtra}{' '}
        </Text>
        {plusExtra !== '' && (
          <Icon
            type="material-community"
            name="pencil-outline"
            containerStyle={styles.containerIcon}
            onPress={() => {
              setRenderComponent(
                <ChangePlusExtra
                  libraryId={libraryId}
                  setShowModal={setShowModal}
                  plusExtra={plusExtra}
                />,
              );
              setShowModal(true);
            }}
          />
        )}
      </View>
      <View style={styles.viewTextStats}>
        <Text style={styles.infosText}>
          Completar el 100%: {fullHours === '' ? '0' : fullHours}{' '}
        </Text>
        {fullHours !== '' && (
          <Icon
            type="material-community"
            name="pencil-outline"
            containerStyle={styles.containerIcon}
            onPress={() => {
              setRenderComponent(
                <ChangeFull
                  libraryId={libraryId}
                  setShowModal={setShowModal}
                  fullHours={fullHours}
                />,
              );
              setShowModal(true);
            }}
          />
        )}
      </View>
      <View style={styles.viewTextStats}>
        <Text style={styles.infosText}>
          Precio: {price === '' ? '0' : price}{' '}
        </Text>
        {price !== '' && (
          <Icon
            type="material-community"
            name="pencil-outline"
            containerStyle={styles.containerIcon}
            onPress={() => {
              setRenderComponent(
                <ChangePrice
                  libraryId={libraryId}
                  setShowModal={setShowModal}
                  price={price}
                />,
              );
              setShowModal(true);
            }}
          />
        )}
      </View>
      <View style={styles.viewTextStats}>
        <Text style={styles.infosText}>
          Plataforma: {gamePlatform === '' ? 'Sin Plataforma' : gamePlatform}{' '}
        </Text>
        {gamePlatform !== '' && (
          <Icon
            type="material-community"
            name="pencil-outline"
            containerStyle={styles.containerIcon}
            onPress={() => {
              setRenderComponent(
                <ChangePlatform
                  libraryId={libraryId}
                  setShowModal={setShowModal}
                  gamePlatform={gamePlatform}
                  listGamesPlatform={listGamesPlatform}
                />,
              );
              setShowModal(true);
            }}
          />
        )}
      </View>
      <Button
        title="Publicar Estadisticas"
        onPress={uploadStats}
        disabled={isButtonDisabled}
        buttonStyle={styles.btnAddGame}></Button>

      <LoadingComponent isVisible={isLoading} text="Publicando Estadisticas" />
    </View>
  );
};

const AddGameStats = props => {
  const {id, libraryId, setShowModal, gameInfo} = props;
  const {gamePlatform} = gameInfo;
  const listGamesPlatform = [];
  const [mainHours, setMainHours] = useState(null);
  const [plusExtra, setPlusExtra] = useState(null);
  const [fullHours, setFullHours] = useState(null);
  const [gameState, setGameState] = useState('');
  const [price, setPrice] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const toastRef = useRef();
  const onSubmit = () => {
    let isSetError = true;
    let errorsTemp = {};
    if (!mainHours || !plusExtra || !fullHours || !price) {
      errorsTemp = {
        mainHours: !mainHours ? 'Este campo no puede estar vacio' : '',
        plusExtra: !plusExtra ? 'Este campo no puede estar vacio' : '',
        fullHours: !fullHours ? 'Este campo no puede estar vacio' : '',
        price: !price ? 'Este campo no puede estar vacio' : '',
      };
    } else if (gameState === '') {
      toastRef.current.show('Seleccione un estado para este titulo');
    } else if (selectedPlatform === '') {
      toastRef.current.show('Seleccione una plataforma de juego');
    } else {
      setIsLoading(true);
      const user = firebase.auth().currentUser.uid;
      const payload = {
        mainHours,
        plusExtra,
        fullHours,
        price,
        gameState,
        gamePlatform: selectedPlatform,
      };
      bibliotecasDB
        .child(user)
        .child(libraryId)
        .update(payload)
        .then(() => {
          setIsLoading(false);
          setShowModal(false);
        })
        .catch(() => {
          setIsLoading(false);
          setShowModal(false);
        });
    }
    isSetError && setError(errorsTemp);
  };

  gamePlatform.forEach(platform => {
    const obj = {label: platform, value: platform};
    listGamesPlatform.push(obj);
  });

  return (
    <ScrollView
      style={styles.view}
      contentContainerStyle={{alignItems: 'center'}}>
      <Text style={{fontWeight: 'bold', fontSize: 20}}>Crear Estadisticas</Text>
      <DropDownPicker
        items={items}
        placeholder="Estado"
        containerStyle={{width: '100%', height: 40, marginTop: 20}}
        style={{backgroundColor: '#fafafa'}}
        itemStyle={{
          justifyContent: 'flex-start',
        }}
        dropDownStyle={{backgroundColor: '#fafafa'}}
        onChangeItem={item => setGameState(item.value)}
      />

      <DropDownPicker
        items={listGamesPlatform}
        placeholder="Plataformas"
        containerStyle={{width: '100%', height: 40, marginTop: 20}}
        style={{backgroundColor: '#fafafa'}}
        itemStyle={{
          justifyContent: 'flex-start',
        }}
        dropDownStyle={{backgroundColor: '#fafafa'}}
        onChangeItem={item => setSelectedPlatform(item.value)}
      />

      <Input
        placeholder="Completar la historia principal"
        keyboardType="decimal-pad"
        maxLength={5}
        containerStyle={styles.input}
        onChange={e => setMainHours(e.nativeEvent.text)}
        errorMessage={error.mainHours}
      />
      <Input
        placeholder="Completar los extras"
        containerStyle={styles.input}
        keyboardType="decimal-pad"
        maxLength={5}
        onChange={e => setPlusExtra(e.nativeEvent.text)}
        errorMessage={error.plusExtra}
      />
      <Input
        placeholder="Completar el 100%"
        containerStyle={styles.input}
        keyboardType="decimal-pad"
        maxLength={5}
        onChange={e => setFullHours(e.nativeEvent.text)}
        errorMessage={error.fullHours}
      />
      <Input
        placeholder="Precio al que lo compraste"
        containerStyle={styles.input}
        keyboardType="decimal-pad"
        maxLength={7}
        onChange={e => setPrice(e.nativeEvent.text)}
        errorMessage={error.price}
      />

      <Button
        title="Añadir"
        containerStyle={styles.btnContainer}
        buttonStyle={styles.btn}
        onPress={onSubmit}
        loading={isLoading}
      />
      <Toast ref={toastRef} position="center" opacity={0.9} />
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  viewBody: {
    flex: 1,
    backgroundColor: '#fff',
  },
  viewGameTitle: {
    padding: 15,
    marginBottom: 10,
  },
  gameTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 30,
  },
  gameDescriptionStyle: {
    marginTop: 5,
    color: 'grey',
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
  btnAddGame: {
    backgroundColor: colors.primary,
    margin: 20,
  },
  view: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  input: {
    margin: 10,
  },
  btnContainer: {
    marginTop: 20,
    width: '95%',
  },
  btn: {
    backgroundColor: colors.primary,
  },
  viewTextStats: {
    flexDirection: 'row',
    alignContent: 'space-around',
  },
  containerIcon: {
    alignItems: 'center',
    marginTop: 5,
    marginRight: 15,
    height: 30,
    width: 30,
  },
});
