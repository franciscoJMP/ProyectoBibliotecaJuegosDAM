import React, {useState, useEffect, useCallback, Fragment} from 'react';
import {View, Text, StyleSheet, NativeModules} from 'react-native';
import {Icon, Button} from 'react-native-elements';
import {useFocusEffect} from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import {size} from 'lodash';
import DropDownPicker from 'react-native-dropdown-picker';
import * as firebase from 'firebase';
import 'firebase/database';
import {
  LoadingComponent,
  GamesComponent,
  ModalComponent,
  NotNetworkConnection,
} from 'ProyectoVideoJuegos/src/components';
import ListGames from 'ProyectoVideoJuegos/src/components/GamesComponent/ListGames';
import {colors} from 'ProyectoVideoJuegos/src/styles/withColors';
import {setI18nConfig} from 'ProyectoVideoJuegos/src/languages/i18n.js';
var texts = setI18nConfig();
const database = firebase.database().ref('Juegos');
const propiedadesDB = firebase.database().ref('Propiedades');

export default function MainScreen(props) {
  const {navigation} = props;
  const [networkInfo, setNetworkInfo] = useState(true);
  const [login, setLogin] = useState(null);
  const [gamesList, setGamesList] = useState(null);
  const [totalGamesList, setTotalGamesList] = useState(null);
  const [startGames, setStartGames] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [renderComponent, setRenderComponent] = useState(false);
  const [totalFilterList, setTotalFilterList] = useState(null);
  const [gameFilterList, setGameFilterList] = useState(null);

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
        let i = 0;
        snapshot.forEach(children => {
          if (children.val().visibility === 'public') i++;
        });
        setTotalGamesList(i);
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

  useEffect(() => {
    if (networkInfo) {
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
  }, [isFilterActive, networkInfo]);

  const listFilter = () => {
    setRenderComponent(true);
    setShowModal(true);
  };
  const resetFilter = () => {
    setIsFilterActive(false);
    setTotalFilterList(null);
    setGameFilterList(null);
    setRenderComponent(false);
  };

  const downloadContent = () => {
    const resultGames = [];
    database
      .orderByChild('id')
      .limitToFirst(limitsGames)
      .on('value', snapshot => {
        var x = 1;
        var i = 1;
        snapshot.forEach(children => {
          if (children.val().visibility === 'public') x++;
        });

        snapshot.forEach(childSnapshot => {
          let game = childSnapshot.val();

          if (game.visibility === 'public') {
            resultGames.push(game);
            i++;
          }
          if (i === x) {
            setStartGames(childSnapshot);
          }
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
                if (game.visibility === 'public') resultGames.push(game);

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
      {login === null && gamesList === null ? (
        <LoadingComponent isVisible={true} text={texts.t('load_message')} />
      ) : login ? (
        <Fragment>
          {gameFilterList === null || size(gameFilterList) > 0 ? (
            <GamesComponent
              gamesList={isFilterActive ? gameFilterList : gamesList}
              totalGamesList={isFilterActive ? totalFilterList : totalGamesList}
              handleLoadMore={!isFilterActive && handleLoadMore}
              isLoading={!isFilterActive ? isLoading : false}
            />
          ) : (
            <NotFoundGames resetFilter={resetFilter} />
          )}
        </Fragment>
      ) : (
        <Fragment>
          {gamesList !== null && totalGamesList !== null && (
            <ListGames
              gamesList={isFilterActive ? gameFilterList : gamesList}
              userInfo={null}
              totalGamesList={isFilterActive ? totalFilterList : totalGamesList}
              handleLoadMore={!isFilterActive && handleLoadMore}
              isLoading={!isFilterActive ? isLoading : false}
            />
          )}
        </Fragment>
      )}
      {renderComponent && (
        <ModalComponent isVisible={showModal} setIsVisible={setShowModal}>
          <FilterModal
            setTotalFilterList={setTotalFilterList}
            setGameFilterList={setGameFilterList}
            setIsFilterActive={setIsFilterActive}
            setShowModal={setShowModal}
            setRenderComponent={setRenderComponent}
          />
        </ModalComponent>
      )}
    </Fragment>
  ) : (
    <NotNetworkConnection />
  );
}
const FilterModal = props => {
  const {
    setTotalFilterList,
    setGameFilterList,
    setShowModal,
    setIsFilterActive,
    setRenderComponent,
  } = props;

  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedPlatform, setSelectedPlatform] = useState('Todas');
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
    database.on('value', snapshot => {
      const resultGames = [];
      let i = 0;
      snapshot.forEach(children => {
        if (children.val().visibility === 'public') {
          const game = children.val();
          let gamePlatform = game.gamePlatform;
          let gameCategories = game.gameCategory;
          let foudGamePlatform, foundGameCategory;
          if (selectedPlatform !== 'Todas') {
            if (selectedCategory !== 'Todas') {
              foudGamePlatform = gamePlatform.find(e => e === selectedPlatform);
              foundGameCategory = gameCategories.find(
                e => e === selectedCategory,
              );
              if (
                foundGameCategory !== undefined &&
                foudGamePlatform !== undefined
              ) {
                i++;
                resultGames.push(game);
              }
            } else {
              foudGamePlatform = gamePlatform.find(e => e === selectedPlatform);
              if (foudGamePlatform !== undefined) {
                i++;
                resultGames.push(game);
              }
            }
          } else {
            if (selectedCategory !== 'Todas') {
              foundGameCategory = gameCategories.find(
                e => e === selectedCategory,
              );
              if (foundGameCategory !== undefined) {
                i++;
                resultGames.push(game);
              }
            } else {
              i++;
              resultGames.push(game);
            }
          }
        }
      });

      setTotalFilterList(i);
      setGameFilterList(resultGames);
    });
    setIsFilterActive(true);
    setShowModal(false);
    setRenderComponent(false);
  };

  const listCategories = [];
  listCategories.push({label: 'Todas', value: 'Todas'});

  if (gameCategories !== null) {
    gameCategories.forEach(gc => {
      const obj = {label: gc, value: gc};
      listCategories.push(obj);
    });
  }

  const listPlatform = [];
  listPlatform.push({label: 'Todas', value: 'Todas'});
  if (gamePlatforms !== null) {
    gamePlatforms.forEach(gp => {
      const obj = {label: gp, value: gp};
      listPlatform.push(obj);
    });
  }

  return (
    <View style={{height: '65%'}}>
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
            {texts.t('category_text')}:
          </Text>
          <DropDownPicker
            items={listCategories}
            placeholder={texts.t('category_text')}
            defaultValue="Todas"
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
            {texts.t('platform_text')}:
          </Text>
          <DropDownPicker
            items={listPlatform}
            defaultValue="Todas"
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

const NotFoundGames = props => {
  const {resetFilter} = props;
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Icon type="material-community" name="alert-outline" size={50} />
      <Text style={{fontSize: 20, fontWeight: 'bold'}}>
        {texts.t('not_found_games')}
      </Text>
      <Button
        title={texts.t('btn_reload')}
        onPress={resetFilter}
        containerStyle={{marginTop: 20}}
        buttonStyle={styles.btn}></Button>
    </View>
  );
};
const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.primary,
  },
});
