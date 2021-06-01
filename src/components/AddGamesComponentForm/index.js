import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Alert,
  Dimensions,
  LogBox,
  NativeModules,
  Text,
} from 'react-native';
import {
  Icon,
  Avatar,
  Image,
  Input,
  Button,
  CheckBox,
} from 'react-native-elements';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

import DropDownPicker from 'react-native-dropdown-picker';
import {List} from 'react-native-paper';
import uuid from 'react-native-uuid';
import {map, size, filter} from 'lodash';
import * as firebase from 'firebase';
import 'firebase/storage';
import 'firebase/database';
import RNFetchBlob from 'react-native-fetch-blob';
import ImagePicker from 'react-native-image-crop-picker';
import moment from 'moment';
import {colors} from 'ProyectoVideoJuegos/src/styles/withColors';
import {items} from './ageItems';
import {
  LoadingComponent,
  ModalComponent,
} from 'ProyectoVideoJuegos/src/components';
import AddGameCategory from './AddGameCategory';
import AddGamePlatform from './AddGamePlatform';
import {setI18nConfig} from 'ProyectoVideoJuegos/src/languages/i18n.js';
var texts = setI18nConfig();

LogBox.ignoreAllLogs();
const database = firebase.database();

//Constante para el tamaño de la pantalla
const widthScreen = Dimensions.get('window').width;

export default function AddGamesComponentForm(props) {
  const {toastRef, setIsLoading, navigation} = props;

  //useStates
  const [gameName, setGameName] = useState('');
  const [gameDevelop, setGameDevelop] = useState('');
  const [gameYear, setGameYear] = useState('');
  const [gameDescription, setGameDescription] = useState('');
  const [imagesSelected, setImagesSelected] = useState([]);
  const [selectDefault, setSelectedDefault] = useState('0');
  const [gameCategory, setGameCategory] = useState(null);
  const [gamePlatform, setGamePlatform] = useState(null);
  const [expanded, setExpanded] = useState(false); //Expandir acordeon de Categorias
  const [expandedP, setExpandedP] = useState(false); //Expandir acordeon de Plataformas
  const [checkboxes, setCheckBoxes] = useState(null); //checkboxes Categorias
  const [checkboxesP, setcheckboxesP] = useState(null); //checkboxes Plataformas
  const [showModal, setShowModal] = useState(false);
  const [renderComponent, setRenderComponent] = useState(null);
  const [isVisibleDatePicker, setIsVisibleDatePicker] = useState(false);

  useEffect(() => {
    loadGameCategory();

    firebase
      .database()
      .ref('Propiedades')
      .child('Categorias')
      .on('child_added', snapshot => {
        setGameCategory(null);
        setCheckBoxes(null);
        loadGameCategory();
      });

    loadGamePlatforms();

    firebase
      .database()
      .ref('Propiedades')
      .child('Plataformas')
      .on('child_added', snapshot => {
        setGamePlatform(null);
        setcheckboxesP(null);
        loadGamePlatforms();
      });
  }, []);

  const loadGameCategory = async () => {
    await firebase
      .database()
      .ref('Propiedades')
      .child('Categorias')
      .on('value', snapshot => {
        if (!snapshot.exists()) {
          const defaultCategories = [
            {
              language: 'es',
              categories: ['Accion', 'Rol', 'Plataformas', 'Mundo Abierto'],
            },
            {
              language: 'en',
              categories: ['Action', 'Rol', 'Platform', 'Open World'],
            },
          ];
          firebase
            .database()
            .ref('Propiedades')
            .child('Categorias')
            .set(defaultCategories)
            .then(() => {
              setGameCategory(defaultCategories);
            });
        } else {
          setGameCategory(snapshot.val());
          const categories = [];

          map(
            snapshot.val()[
              NativeModules.I18nManager.localeIdentifier === 'es_ES' ? 0 : 1
            ].categories,
            (c, index) => {
              const obj = {
                id: index + 1,
                title: c,
                checked: false,
              };
              categories.push(obj);
            },
          );
          setCheckBoxes(categories);
        }
      });
  };
  const loadGamePlatforms = async () => {
    await firebase
      .database()
      .ref('Propiedades')
      .child('Plataformas')
      .on('value', snapshot => {
        if (!snapshot.exists()) {
          const defaultPlatforms = [
            'Nintendo Switch',
            'PS4',
            'PS5',
            'Xbox Series X/S',
            'Xbox One/X',
            'Steam',
            'Epic Game Store',
            'Android',
            'IOS',
          ];

          firebase
            .database()
            .ref('Propiedades')
            .child('Plataformas')
            .set(defaultPlatforms)
            .then(() => {
              setGamePlatform(defaultPlatforms);
            });
        } else {
          setGamePlatform(snapshot.val());
          const platforms = [];
          map(snapshot.val(), (p, index) => {
            const obj = {
              id: index + 1,
              title: p,
              checked: false,
            };
            platforms.push(obj);
          });
          setcheckboxesP(platforms);
        }
      });
  };

  const addGame = () => {
    const addArray = arrayCheckboxes => {
      const array = [];
      map(arrayCheckboxes, (cb, index) => {
        if (cb.checked) {
          array.push(cb.title);
        }
      });
      return array;
    };

    const arrayCategories = addArray(checkboxes);
    const arrayPlatforms = addArray(checkboxesP);

    if (!gameName || !gameDevelop || !gameDescription || !gameYear) {
      toastRef.current.show(texts.t('input_fail_mesagge'), 1500);
    } else if (size(imagesSelected) === 0) {
      toastRef.current.show(texts.t('err_imgselct'));
    } else if (size(arrayPlatforms) === 0 || size(arrayCategories) === 0) {
      toastRef.current.show(texts.t('err_catg_selected'));
    } else if (selectDefault === '0') {
      toastRef.current.show(texts.t('err_select_age'));
    } else {
      setIsLoading(true);
      //Esta funcion nos devuelve una promesa con las URL de todas las imagenes
      upladImageStorage().then(response => {
        const userId = firebase.auth().currentUser.uid;
        const gameData = {
          id: uuid.v4(),
          gameName: gameName,
          gameDevelop: gameDevelop,
          gameDescription: gameDescription,
          gameYear: gameYear,
          mainStory: 0,
          mainPlusExtra: 0,
          full: 0,
          quantityStats: 0,
          rating: 0,
          ratingTotal: 0,
          quantityVoting: 0,
          age: selectDefault,
          gameCategory: arrayCategories,
          gamePlatform: arrayPlatforms,
          imagesGames: response,
          visibility: 'public',
          createdBy: userId,
        };
        database
          .ref('Juegos')
          .child(gameData.id)
          .set(gameData)
          .then(() => {
            setIsLoading(false);
            navigation.goBack();
          });
      });
    }
  };

  const upladImageStorage = async () => {
    const UrlImages = [];
    const Blob = RNFetchBlob.polyfill.Blob;
    const fs = RNFetchBlob.fs;
    window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
    window.Blob = Blob;
    //No se hace el return hasta que no se hayan subido todas las imagenes
    await Promise.all(
      map(imagesSelected, async image => {
        const imagePath = image;
        let uploadBlob = null;
        const imageRef = firebase.storage().ref().child(`juegos/${uuid.v4()}`);
        let mime = 'image/jpg';
        //Esperamos a que se suban todas las imagenes
        await fs
          .readFile(imagePath, 'base64')
          .then(data => {
            return Blob.build(data, {type: `${mime};BASE64`});
          })
          .then(blob => {
            uploadBlob = blob;
            return imageRef.put(blob, {contentType: mime});
          })
          .then(() => {
            uploadBlob.close();
            return imageRef.getDownloadURL();
          })
          .then(url => {
            UrlImages.push(url);
          })
          .catch(error => {
            console.log(error);
          });
      }),
    );

    return UrlImages;
  };

  const toggleCheckbox = id => {
    const changedCheckbox = checkboxes.find(cb => cb.id === id);
    changedCheckbox.checked = !changedCheckbox.checked;
    const filterCheckbox = checkboxes.filter(check => check.id !== id);
    filterCheckbox.push(changedCheckbox);
    filterCheckbox.sort((a, b) => {
      return parseInt(a.id) - parseInt(b.id);
    });
    setCheckBoxes(filterCheckbox);
  };

  const toggleCheckboxP = id => {
    const changedCheckbox = checkboxesP.find(cb => cb.id === id);
    changedCheckbox.checked = !changedCheckbox.checked;
    const filterCheckbox = checkboxesP.filter(check => check.id !== id);
    filterCheckbox.push(changedCheckbox);
    filterCheckbox.sort((a, b) => {
      return parseInt(a.id) - parseInt(b.id);
    });
    setcheckboxesP(filterCheckbox);
  };

  if (!checkboxes && !checkboxesP)
    return (
      <LoadingComponent
        isVisible={true}
        text={texts.t('load_message') + '...'}
      />
    );
  return (
    <ScrollView style={styles.scrollView}>
      <ImageGame imageGame={imagesSelected[0]} />
      <FormAdd
        setGameName={setGameName}
        setGameDevelop={setGameDevelop}
        setGameDescription={setGameDescription}
        setGameYear={setGameYear}
        gameYear={gameYear}
        setSelectedDefault={setSelectedDefault}
        expanded={expanded}
        setExpanded={setExpanded}
        expandedP={expandedP}
        setExpandedP={setExpandedP}
        checkboxes={checkboxes}
        checkboxesP={checkboxesP}
        toggleCheckbox={toggleCheckbox}
        toggleCheckboxP={toggleCheckboxP}
        showModal={showModal}
        setShowModal={setShowModal}
        renderComponent={renderComponent}
        setRenderComponent={setRenderComponent}
        toastRef={toastRef}
        gamePlatform={gamePlatform}
        gameCategory={gameCategory}
        isVisibleDatePicker={isVisibleDatePicker}
        setIsVisibleDatePicker={setIsVisibleDatePicker}
      />
      <UploadImage
        toastRef={toastRef}
        imagesSelected={imagesSelected}
        setImagesSelected={setImagesSelected}
      />

      <Button
        title={texts.t('create_game')}
        onPress={addGame}
        buttonStyle={styles.btnAddGame}></Button>
    </ScrollView>
  );
}
const ImageGame = props => {
  const {imageGame} = props;
  return (
    <View style={styles.viewPhoto}>
      <Image
        source={
          imageGame
            ? {uri: imageGame}
            : require('../../assets/img/no-image.png')
        }
        style={{width: widthScreen, height: 200}}
      />
    </View>
  );
};
const FormAdd = props => {
  const {
    setGameName,
    setGameDevelop,
    setGameDescription,
    setGameYear,
    gameYear,
    setSelectedDefault,
    expanded,
    expandedP,
    setExpanded,
    setExpandedP,
    checkboxes,
    checkboxesP,
    toggleCheckbox,
    toggleCheckboxP,
    showModal,
    setShowModal,
    renderComponent,
    setRenderComponent,
    toastRef,
    gamePlatform,
    gameCategory,
    isVisibleDatePicker,
    setIsVisibleDatePicker,
  } = props;

  const handlePressC = () => setExpanded(!expanded);
  const handlePressP = () => setExpandedP(!expandedP);
  const selectComponent = key => {
    switch (key) {
      case 'p':
        setRenderComponent(
          <AddGamePlatform
            gamePlatform={gamePlatform}
            setShowModal={setShowModal}
            toastRef={toastRef}
          />,
        );
        setShowModal(true);
        break;
      case 'c':
        setRenderComponent(
          <AddGameCategory
            gameCategory={gameCategory}
            setShowModal={setShowModal}
            toastRef={toastRef}
          />,
        );
        setShowModal(true);
        break;
    }
  };
  const handlerConfirmDate = data => {
    setGameYear(moment(data).format('DD/MM/YYYY'));
    setIsVisibleDatePicker(false);
  };
  const showDatePicker = () => {
    setIsVisibleDatePicker(true);
  };

  return (
    <View style={styles.viewForm}>
      <Input
        placeholder={texts.t('placeholder_gameName')}
        containerStyle={styles.input}
        onChange={e => setGameName(e.nativeEvent.text)}
      />
      <Input
        placeholder={texts.t('placeholder_gameDevelop')}
        containerStyle={styles.input}
        onChange={e => setGameDevelop(e.nativeEvent.text)}
      />
      <Input
        placeholder={texts.t('placeholder_gameDescription')}
        multiline={true}
        inputContainerStyle={styles.textArea}
        onChange={e => setGameDescription(e.nativeEvent.text)}
      />

      <View style={[styles.inputDatePicker, styles.datePicker]}>
        <Text
          style={[
            styles.textDate,
            {color: gameYear === '' ? '#969696' : 'black'},
          ]}
          onPress={showDatePicker}>
          {gameYear !== '' ? gameYear : texts.t('published_date')}
        </Text>
      </View>
      <DateTimePickerModal
        isVisible={isVisibleDatePicker}
        mode="date"
        onConfirm={handlerConfirmDate}
        onCancel={() => setIsVisibleDatePicker(false)}
      />
      <DropDownPicker
        items={items}
        placeholder="PEGI"
        containerStyle={{height: 40, marginTop: 20}}
        style={{backgroundColor: '#fafafa'}}
        itemStyle={{
          justifyContent: 'flex-start',
        }}
        dropDownStyle={{backgroundColor: '#fafafa'}}
        onChangeItem={item => setSelectedDefault(item.value)}
      />
      <List.Accordion
        title={texts.t('category_text')}
        titleStyle={{
          fontSize: 18,
          fontWeight: 'bold',
        }}
        style={{marginBottom: 15}}
        descriptionStyle={{width: '90%'}}
        expanded={expanded}
        onPress={handlePressC}>
        <CheckBoxes
          checkboxes={checkboxes}
          toggleCheckbox={toggleCheckbox}
          text={texts.t('add_categoria')}
          type="c"
          selectComponent={selectComponent}
        />
      </List.Accordion>
      <List.Accordion
        title={texts.t('platform_text')}
        titleStyle={{
          fontSize: 18,
          fontWeight: 'bold',
        }}
        style={{marginBottom: 15}}
        descriptionStyle={{width: '90%'}}
        expanded={expandedP}
        onPress={handlePressP}>
        <CheckBoxes
          checkboxes={checkboxesP}
          toggleCheckbox={toggleCheckboxP}
          text={texts.t('add_platform')}
          type="p"
          selectComponent={selectComponent}
        />
      </List.Accordion>
      {renderComponent && (
        <ModalComponent isVisible={showModal} setIsVisible={setShowModal}>
          {renderComponent}
        </ModalComponent>
      )}
    </View>
  );
};
const UploadImage = props => {
  const {toastRef, imagesSelected, setImagesSelected} = props;

  const imageSelect = async () => {
    try {
      await ImagePicker.openPicker({
        width: 300,
        height: 400,
        cropping: false,
        mediaType: 'photo',
      }).then(image => {
        //Se pone oldArray para poder copiar el contenido antiguo del array
        setImagesSelected(oldArray => [...oldArray, image.path]);
      });
    } catch (error) {
      console.log('Error: ', error);
    }
  };
  const removeImage = image => {
    Alert.alert(
      texts.t('delete_img_title'),
      texts.t('delete_img_question'),
      [
        {
          text: texts.t('cancel_btn'),
          style: 'cancel',
        },
        {
          text: texts.t('delete_btn'),
          onPress: () => {
            setImagesSelected(
              //Filtra el array devolviendo todas las imagenes menos la seleccionada
              filter(imagesSelected, imageUrl => imageUrl !== image),
            );
          },
        },
      ],
      {cancelable: false},
    );
  };

  return (
    <View style={styles.viewImage}>
      {size(imagesSelected) < 4 && (
        <Icon
          type="material-community"
          name="camera"
          color="#7a7a7a"
          containerStyle={styles.containerIcon}
          onPress={imageSelect}
        />
      )}

      {map(imagesSelected, (imageGame, index) => (
        <Avatar
          key={index}
          style={styles.miniatureStyle}
          source={{
            uri: imageGame,
          }}
          onPress={() => removeImage(imageGame)}
        />
      ))}
    </View>
  );
};

const CheckBoxes = props => {
  const {checkboxes, toggleCheckbox, text, type, selectComponent} = props;

  return (
    <View>
      {map(checkboxes, (cb, index) => (
        <CheckBox
          key={index}
          title={cb.title}
          checked={cb.checked}
          onPress={() => toggleCheckbox(cb.id)}
        />
      ))}
      <Button
        title={text}
        buttonStyle={styles.btnAddGame}
        onPress={() => selectComponent(type)}></Button>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    height: '100%',
  },
  viewForm: {
    marginLeft: 10,
    marginRight: 10,
  },
  input: {
    marginBottom: 10,
  },
  textArea: {
    height: 100,
    width: '100%',
    padding: 0,
    margin: 0,
  },
  btnAddGame: {
    backgroundColor: colors.primary,
    margin: 20,
  },
  viewImage: {
    flexDirection: 'row',
    marginLeft: 20,
    marginRight: 20,
    marginTop: 30,
  },
  containerIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    height: 70,
    width: 70,
    backgroundColor: '#e3e3e3',
  },
  miniatureStyle: {
    width: 70,
    height: 70,
    marginRight: 10,
  },
  viewPhoto: {
    alignItems: 'center',
    height: 200,
    marginBottom: 20,
  },
  inputDatePicker: {
    height: 50,
    color: '#fff',
    marginBottom: 25,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    marginRight: 10,
    marginLeft: 10,
    marginBottom: 20,
    marginTop: 10,
    borderColor: '#969696',
    fontSize: 18,
  },
  datePicker: {
    justifyContent: 'center',
  },
  textDate: {
    fontSize: 18,
  },
});
