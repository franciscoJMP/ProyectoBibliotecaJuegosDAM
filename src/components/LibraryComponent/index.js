import React, {useState, useEffect, useRef, useCallback, Fragment} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  NativeModules,
} from 'react-native';
import {Image, Icon, Button, SearchBar} from 'react-native-elements';
import NetInfo from '@react-native-community/netinfo';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import Toast from 'react-native-easy-toast';
import {size} from 'lodash';
import DropDownPicker from 'react-native-dropdown-picker';
import * as firebase from 'firebase';
import 'firebase/storage';
import 'firebase/database';
import {isEmpty} from 'lodash';
import {
  LoadingComponent,
  ModalComponent,
} from 'ProyectoVideoJuegos/src/components';
import {colors} from 'ProyectoVideoJuegos/src/styles/withColors';
import {items} from '../../screens/libraryScreen/items';
import {setI18nConfig} from 'ProyectoVideoJuegos/src/languages/i18n.js';
var texts = setI18nConfig();

const bibliotecasDB = firebase.database().ref('Bibliotecas');
const juegosDB = firebase.database().ref('Juegos');
const usuariosDB = firebase.database().ref('Usuarios');
const propiedadesDB = firebase.database().ref('Propiedades');

export default function LibraryComponent() {
  const [games, setGames] = useState(null);
  const [networkInfo, setNetworkInfo] = useState(true);
  const [savesGames, setSavesGames] = useState(null);
  const [userLogged, setUserLogged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [search, setSearch] = useState('');
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [renderComponent, setRenderComponent] = useState(false);

  const toastRef = useRef();
  const navigation = useNavigation();

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
            const gameState =
              children.val().gameState === ''
                ? texts.t('no_start')
                : children.val().gameState;
            idGames.push({
              idGame: children.val().idGame,
              gameState: gameState,
              key: children.key,
            });
          });
          getDataGames(idGames).then(response => {
            setGames(response);
          });
        });
        usuariosDB.child(idUser).on('value', snapshot => {
          setUserInfo(snapshot.val());
        });
      }
    }, [userLogged]),
  );
  useEffect(() => {
    NetInfo.addEventListener(state => {
      setNetworkInfo(state.isInternetReachable);
    });
  }, []);

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
        object = {...object, key: data.key, gameState: data.gameState};
        arrayGames.push(object);
      });
    });
    return Promise.all(arrayGames);
  };

  useEffect(() => {
    if (games?.length > 0) {
      navigation.setOptions({
        headerRight: () => (
          <Icon
            type="material-community"
            name={!isFilterActive ? 'filter' : 'filter-remove'}
            size={30}
            onPress={!isFilterActive ? listFilter : resetFilter}
            iconStyle={{color: '#fff'}}
            underlayColor="transparent"
          />
        ),
      });
    } else {
      navigation.setOptions({
        headerRight: null,
      });
    }
  }, [isFilterActive, games, networkInfo]);

  const listFilter = () => {
    setRenderComponent(true);
    setSavesGames(null);
    setSearch('');
    setShowModal(true);
  };
  const resetFilter = () => {
    setIsFilterActive(false);
    setSavesGames(null);
    setSearch('');
    setRenderComponent(false);
  };

  if (games?.length === 0) {
    return (
      <Fragment>
        <NotFoundGames navigation={navigation} />
        <Toast ref={toastRef} position="center" opacity={0.9} />
        <LoadingComponent
          text={texts.t('deleting_game') + '...'}
          isVisible={isLoading}
        />
      </Fragment>
    );
  }
  return (
    <View style={styles.viewBody}>
      <SearchBar
        placeholder={texts.t('find_game')}
        onChangeText={e => setSearch(e)}
        value={search}
        containerStyle={StyleSheet.searchBar}
      />
      {games && userInfo ? (
        <Fragment>
          <FlatList
            data={savesGames ? savesGames : games}
            renderItem={game => (
              <Game
                game={game}
                userInfo={userInfo}
                setIsLoading={setIsLoading}
                toastRef={toastRef}
                navigation={navigation}
              />
            )}
            keyExtractor={(item, index) => index.toString()}
          />
          {renderComponent && (
            <ModalComponent isVisible={showModal} setIsVisible={setShowModal}>
              <FilterModal
                setSavesGames={setSavesGames}
                setIsFilterActive={setIsFilterActive}
                setShowModal={setShowModal}
                setRenderComponent={setRenderComponent}
                games={games}
                toastRef={toastRef}
              />
            </ModalComponent>
          )}
        </Fragment>
      ) : (
        <View style={styles.loaderGames}>
          <ActivityIndicator size="large" />
          <Text style={{textAlign: 'center'}}>
            {texts.t('loading_games_library') + '...'}
          </Text>
        </View>
      )}
      <Fragment>
        <Icon
          type="material-community"
          name="plus"
          color={colors.primary}
          reverse
          containerStyle={styles.btnContainer}
          onPress={() => navigation.navigate('addpersonalgame')}></Icon>
      </Fragment>
      <Toast ref={toastRef} position="center" opacity={0.9} />
      <LoadingComponent
        text={texts.t('deleting_game') + '...'}
        isVisible={isLoading}
      />
    </View>
  );
}
const NotFoundGames = props => {
  const {navigation} = props;
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Icon type="material-community" name="alert-outline" size={50} />
      <Text style={{fontSize: 20, fontWeight: 'bold'}}>
        {texts.t('not_games_library')}
      </Text>
      <Fragment>
        <Icon
          type="material-community"
          name="plus"
          color={colors.primary}
          reverse
          containerStyle={styles.btnContainer}
          onPress={() => navigation.navigate('addpersonalgame')}></Icon>
      </Fragment>
    </View>
  );
};

const Game = props => {
  const {game, setIsLoading, toastRef, navigation, userInfo} = props;
  const {gameName, imagesGames, key, id, createdBy} = game.item;
  const {uid} = userInfo;
  const confirmRemoveLibrary = () => {
    Alert.alert(
      texts.t('t_deleteGameLibrary'),
      texts.t('m_deleteGameLibrary'),
      [
        {
          text: texts.t('cancel_btn'),
          style: 'cancel',
        },
        {
          text: texts.t('delete_btn'),
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
                if (createdBy === uid) {
                  juegosDB
                    .child(id)
                    .remove()
                    .then(() => {
                      setIsLoading(false);
                      toastRef.current.show(texts.t('ok_removeGame'));
                    });
                } else {
                  setIsLoading(false);
                  toastRef.current.show(texts.t('ok_removeGame'));
                }
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
          <Icon
            type="material-community"
            name="minus-circle"
            onPress={confirmRemoveLibrary}
            color={colors.primary}
            size={30}
            containerStyle={styles.libraryIcon}
            underlayColor="transparent"
          />
          <Text style={styles.gameName}>{gameName}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const FilterModal = props => {
  const {
    setSavesGames,
    games,
    setShowModal,
    setIsFilterActive,
    setRenderComponent,
    toastRef,
  } = props;
  var all = texts.t('all_msg');
  var alls = texts.t('alls_msg');

  const [selectedCategory, setSelectedCategory] = useState(all);
  const [selectedPlatform, setSelectedPlatform] = useState(all);
  const [selectedState, setSelectedState] = useState(alls);
  const [gamePlatforms, setGamePlatforms] = useState(null);
  const [gameCategories, setGameCategories] = useState(null);

  useEffect(() => {
    propiedadesDB.child('Categorias').on('value', snapshot => {
      const categories = snapshot.val()[
        NativeModules.I18nManager.localeIdentifier === 'es_ES' ? 0 : 1
      ].categories;
      setGameCategories(categories);
    });
    propiedadesDB.child('Plataformas').on('value', snapshot => {
      setGamePlatforms(snapshot.val());
    });
  }, []);

  const filtersGames = () => {
    setIsFilterActive(true);
    const thisSaveGames = [];

    const result =
      selectedState !== alls
        ? games.filter(game => game.gameState === selectedState)
        : games;

    console.log(result.length);

    if (result.length > 0) {
      result.forEach(game => {
        const thisGameCategory = game.gameCategory;
        const thisGamePlatform = game.gamePlatform;
        if (selectedCategory !== all && selectedPlatform !== all) {
          thisGameCategory.forEach(gc => {
            if (gc === selectedCategory) {
              thisGamePlatform.forEach(gp => {
                if (gp === selectedPlatform) {
                  thisSaveGames.push(game);
                }
              });
            }
          });
        } else if (selectedCategory !== all || selectedPlatform !== all) {
          if (selectedPlatform === all) {
            thisGameCategory.forEach(gc => {
              if (gc === selectedCategory) {
                thisSaveGames.push(game);
              }
            });
          } else {
            thisGamePlatform.forEach(gp => {
              if (gp === selectedPlatform) {
                thisSaveGames.push(game);
              }
            });
          }
        } else {
          thisSaveGames.push(game);
        }
      });
    }

    if (thisSaveGames.length > 0) {
      setSavesGames(thisSaveGames);
      setIsFilterActive(true);
      setShowModal(false);
    } else {
      setIsFilterActive(false);
      setShowModal(false);

      toastRef.current.show(texts.t('not_found_games'), 1100);
    }

    setRenderComponent(false);
  };

  const listCategories = [];
  listCategories.push({label: all, value: all});

  if (gameCategories !== null) {
    gameCategories.forEach(gc => {
      const obj = {label: gc, value: gc};
      listCategories.push(obj);
    });
  }

  const listPlatform = [];
  listPlatform.push({label: all, value: all});
  if (gamePlatforms !== null) {
    gamePlatforms.forEach(gp => {
      const obj = {label: gp, value: gp};
      listPlatform.push(obj);
    });
  }
  const thisItems = [...items, {label: alls, value: alls}];

  return (
    <View style={{height: '85%'}}>
      <Text
        style={{
          fontWeight: 'bold',
          fontSize: 20,
          textAlign: 'center',
          marginBottom: 20,
        }}>
        {texts.t('filter_title_head')}
      </Text>
      {gameCategories && gamePlatforms && (
        <Fragment>
          <Text
            style={{
              fontWeight: 'bold',
              fontSize: 16,
            }}>
            {texts.t('category_text') + ':'}
          </Text>
          <DropDownPicker
            items={listCategories}
            placeholder={texts.t('category_text')}
            defaultValue={all}
            containerStyle={{width: '100%', height: 50, marginTop: 20}}
            style={{backgroundColor: '#fafafa'}}
            dropDownStyle={{backgroundColor: '#fafafa'}}
            onChangeItem={item => setSelectedCategory(item.value)}
          />
          <Text
            style={{
              marginTop: 20,
              fontWeight: 'bold',
              fontSize: 16,
            }}>
            {texts.t('platform_text') + ':'}
          </Text>
          <DropDownPicker
            items={listPlatform}
            defaultValue={all}
            placeholder={texts.t('platform_text')}
            containerStyle={{
              width: '100%',
              height: 50,
              marginTop: 20,
              marginBottom: 30,
            }}
            style={{backgroundColor: '#fafafa'}}
            dropDownStyle={{backgroundColor: '#fafafa'}}
            onChangeItem={item => setSelectedPlatform(item.value)}
          />
          <Text
            style={{
              marginTop: 10,
              fontWeight: 'bold',
              fontSize: 16,
            }}>
            {texts.t('state_text') + ':'}
          </Text>
          <DropDownPicker
            items={thisItems}
            placeholder={texts.t('state_text')}
            defaultValue={alls}
            containerStyle={{
              width: '100%',
              height: 50,
              marginTop: 10,
              marginBottom: 30,
            }}
            style={{backgroundColor: '#fafafa'}}
            itemStyle={{
              justifyContent: 'flex-start',
            }}
            dropDownStyle={{backgroundColor: '#fafafa'}}
            onChangeItem={item => setSelectedState(item.value)}
          />
        </Fragment>
      )}
      <Button
        title={texts.t('btn_filter_apply')}
        onPress={filtersGames}
        containerStyle={{marginTop: 20}}
        buttonStyle={styles.btn}></Button>
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
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
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
    marginLeft: 20,
    width: '90%',
  },
  libraryIcon: {
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 100,
  },
  searchBar: {
    marginBottom: 200,
  },
  btnContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    shadowColor: 'black',
    shadowOffset: {width: 2, height: 2},
    shadowOpacity: 0.5,
  },
  btn: {
    backgroundColor: colors.primary,
  },
});
