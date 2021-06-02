import React, {Fragment, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {Image, Icon} from 'react-native-elements';
import {useNavigation} from '@react-navigation/native';
import * as firebase from 'firebase';
import 'firebase/database';
import {LoadingComponent} from 'ProyectoVideoJuegos/src/components';
import {colors} from 'ProyectoVideoJuegos/src/styles/withColors';
import {setI18nConfig} from 'ProyectoVideoJuegos/src/languages/i18n.js';
var texts = setI18nConfig();

const database = firebase.database();
export default function ListGames(props) {
  const {gamesList, userInfo, handleLoadMore, isLoading} = props;

  const [isLoadingComponent, setIsLoadingComponent] = useState(false);
  let userType = null;
  if (userInfo !== null) userType = userInfo.userType;

  const navigation = useNavigation();
  return (
    <View>
      <FlatList
        data={gamesList}
        renderItem={game => (
          <GamesRender
            game={game}
            navigation={navigation}
            setIsLoadingComponent={setIsLoadingComponent}
            userType={userType}
          />
        )}
        keyExtractor={(item, index) => index.toString()}
        onEndReachedThreshold={0.5}
        onEndReached={handleLoadMore}
        ListFooterComponent={<FooterList isLoading={isLoading} />}
      />
      <LoadingComponent isVisible={isLoadingComponent} text="Eliminando..." />
    </View>
  );
}
const GamesRender = props => {
  const {game, navigation, userType, setIsLoadingComponent} = props;
  const {id, gameName, gameDevelop, gameDescription, imagesGames} = game.item;
  const imageGame = imagesGames[0];
  const goInfoGame = () => {
    navigation.navigate('viewgameinfo', {
      id,
      gameName,
    });
  };
  const deleteGame = id => {
    Alert.alert(
      texts.t('delete_gameList_title'),
      texts.t('delete_gameList_text'),
      [
        {
          text: texts.t('cancel_btn'),
          style: 'cancel',
        },
        {
          text: texts.t('delete_btn'),
          onPress: () => {
            setIsLoadingComponent(true);
            deleteComent(id).then(response => {
              if (response)
                delGameFromLibrary(id).then(response => {
                  if (response)
                    delGame(id).then(response => {
                      if (response) setIsLoadingComponent(false);
                    });
                });
            });
          },
        },
      ],
      {cancelable: false},
    );
  };
  const deleteComent = async id => {
    await Promise.all(
      await firebase
        .database()
        .ref('Comentarios')
        .child(id)
        .remove()
        .then(() => {
          return true;
        }),
    );
    return true;
  };
  const delGameFromLibrary = async id => {
    await Promise.all(
      firebase
        .database()
        .ref('Bibliotecas')
        .on('value', snapshot => {
          snapshot.forEach(childrens => {
            childrens.forEach(child => {
              if (child.val().idGame === id) {
                firebase
                  .database()
                  .ref('Bibliotecas')
                  .child(childrens.key)
                  .child(child.key)
                  .remove();
              }
            });
          });
        }),
    );
    return true;
  };

  const delGame = async id => {
    await Promise.all(
      await firebase
        .database()
        .ref('Juegos')
        .child(id)
        .remove()
        .then(() => {
          return true;
        }),
    );
    return true;
  };

  return (
    <TouchableOpacity onPress={goInfoGame}>
      <View style={styles.viewGame}>
        <View style={styles.viewGameImage}>
          <Image
            resizeMode="cover"
            PlaceholderContent={<ActivityIndicator color={colors.primary} />}
            source={
              imageGame
                ? {uri: imageGame}
                : require('../../assets/img/no-image.png')
            }
            style={styles.imageGameStyle}
          />
        </View>
        <View style={{width: '100%'}}>
          <Text style={styles.gameNameStyle}>{gameName}</Text>
          <Text style={styles.gameDevelopStyle}>{gameDevelop}</Text>
          <Text style={styles.gameDescriptionStyle}>
            {gameDescription.substr(0, 50)}...
          </Text>
          {userType && userType !== 'normal' && (
            <View style={{flexDirection: 'row'}}>
              <Icon
                type="material-community"
                name="pencil-outline"
                size={30}
                iconStyle={{color: 'gray', margin: 10}}
                onPress={() => navigation.navigate('editgame', {id, gameName})}
              />
              <Icon
                type="material-community"
                name="delete"
                size={30}
                iconStyle={{color: 'gray', margin: 10}}
                onPress={() => deleteGame(id)}
              />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};
const FooterList = props => {
  const {isLoading} = props;
  if (isLoading) {
    return (
      <View style={styles.loadinGames}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  } else {
    return <Fragment></Fragment>;
  }
};

const styles = StyleSheet.create({
  viewGame: {
    flexDirection: 'row',
    margin: 10,
  },
  viewGameImage: {
    marginRight: 15,
  },
  imageGameStyle: {
    width: 80,
    height: 80,
  },
  gameNameStyle: {
    fontWeight: 'bold',
  },
  gameDevelopStyle: {
    paddingTop: 2,
    color: 'grey',
  },
  gameDescriptionStyle: {
    paddingTop: 2,
    color: 'gray',
    marginRight: 100,
  },
  loadinGames: {
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  notFoundGames: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
});
