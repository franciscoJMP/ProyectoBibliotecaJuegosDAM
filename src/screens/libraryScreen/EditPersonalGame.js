import React, {useState, useEffect, useRef} from 'react';
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
import Toast from 'react-native-easy-toast';
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
import {
  LoadingComponent,
  ModalComponent,
  CarouselComponent,
} from 'ProyectoVideoJuegos/src/components';
import {items} from '../../components/AddGamesComponentForm/ageItems';
import {setI18nConfig} from 'ProyectoVideoJuegos/src/languages/i18n.js';

var texts = setI18nConfig();
const database = firebase.database().ref('Juegos');
const screenWidth = Dimensions.get('window').width;

export default function EditPersonalGame(props) {
  const {navigation, route} = props;
  const {id, gameName} = route.params;
  const [gameInfo, setGameInfo] = useState(null);
  const [imagesSelected, setImagesSelected] = useState(null);
  const [auxImagesSelected, setAuxImagesSelected] = useState(null);
  const [checkboxes, setCheckBoxes] = useState(null); //checkboxes Categorias
  const [checkboxesP, setcheckboxesP] = useState(null);
  const [gameCategory, setGameCategory] = useState(null);
  const [gamePlatform, setGamePlatform] = useState(null);
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
    database.child(id).on('value', snapshot => {
      if (snapshot.exists()) {
        setGameInfo(snapshot.val());
        setImagesSelected(snapshot.val().imagesGames);
        setAuxImagesSelected(snapshot.val().imagesGames);
      }
    });
  }, []);

  useEffect(() => {
    if (gameInfo) {
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
    }
  }, [gameInfo]);

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
          let resultIndex = 0;
          map(
            snapshot.val()[
              NativeModules.I18nManager.localeIdentifier === 'es_ES' ? 0 : 1
            ].categories,
            (c, index) => {
              let checked = false;
              let categoriesGame = gameInfo.gameCategory;

              categoriesGame.forEach(category => {
                if (category === c) checked = true;
              });

              const obj = {
                id: index + 1,
                title: c,
                checked: checked,
              };

              categories.push(obj);
              resultIndex = index + 1;
            },
          );

          gameInfo.gameCategory.forEach(category => {
            const find = categories.find(obj => obj.title === category);

            if (find === undefined) {
              const obj = {
                id: resultIndex + 1,
                title: category,
                checked: true,
              };
              categories.push(obj);
            }
          });

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
          let resultIndex = 0;

          map(snapshot.val(), (p, index) => {
            let platformGame = gameInfo.gamePlatform;
            let checked = false;
            platformGame.forEach(data => {
              if (data === p) checked = true;
            });
            const obj = {
              id: index + 1,
              title: p,
              checked: checked,
            };
            platforms.push(obj);
            resultIndex = index + 1;
          });
          gameInfo.gamePlatform.forEach(data => {
            const find = platforms.find(obj => obj.title === data);
            if (find === undefined) {
              const obj = {
                id: resultIndex + 1,
                title: data,
                checked: true,
              };
              platforms.push(obj);
            }
          });

          setcheckboxesP(platforms);
        }
      });
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

  if (!gameInfo || (!checkboxes && !checkboxesP) || !imagesSelected) {
    return <LoadingComponent isVisible={true} text={texts.t('load_message')} />;
  } else {
    return (
      <ScrollView style={styles.scrollView}>
        {size(imagesSelected) > 0 ? (
          <CarouselComponent
            arrayImages={imagesSelected}
            height={250}
            width={screenWidth}
          />
        ) : (
          <Image
            source={require('../../assets/img/no-image.png')}
            style={{width: screenWidth, height: 200}}
          />
        )}

        <UploadImage
          imagesSelected={imagesSelected}
          setImagesSelected={setImagesSelected}
          auxImagesSelected={auxImagesSelected}
          setAuxImagesSelected={setAuxImagesSelected}
        />
        <FormEditGames
          gameInfo={gameInfo}
          checkboxes={checkboxes}
          setCheckBoxes={setCheckBoxes}
          checkboxesP={checkboxesP}
          setcheckboxesP={setcheckboxesP}
          gamePlatform={gamePlatform}
          gameCategory={gameCategory}
          toggleCheckbox={toggleCheckbox}
          toggleCheckboxP={toggleCheckboxP}
          toastRef={toastRef}
          navigation={navigation}
          imagesSelected={imagesSelected}
          auxImagesSelected={auxImagesSelected}
        />
      </ScrollView>
    );
  }
}

const FormEditGames = props => {
  const {
    gameInfo,
    checkboxes,
    setCheckBoxes,
    checkboxesP,
    setcheckboxesP,
    toggleCheckbox,
    toggleCheckboxP,
    gamePlatform,
    gameCategory,
    toastRef,
    navigation,
    imagesSelected,
    auxImagesSelected,
  } = props;
  const [gameName, setGameName] = useState(gameInfo.gameName);
  const [gameDevelop, setGameDevelop] = useState(gameInfo.gameDevelop);
  const [gameYear, setGameYear] = useState(gameInfo.gameYear);
  const [gameDescription, setGameDescription] = useState(
    gameInfo.gameDescription,
  );
  const [age, setAge] = useState(gameInfo.age);
  const [expanded, setExpanded] = useState(false); //Expandir acordeon de Categorias
  const [expandedP, setExpandedP] = useState(false); //Expandir acordeon de Plataformas

  const [showModal, setShowModal] = useState(false);
  const [renderComponent, setRenderComponent] = useState(null);
  const [isVisibleDatePicker, setIsVisibleDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlerConfirmDate = data => {
    setGameYear(moment(data).format('DD/MM/YYYY'));
    setIsVisibleDatePicker(false);
  };
  const showDatePicker = () => {
    setIsVisibleDatePicker(true);
  };
  const handlePressC = () => setExpanded(!expanded);
  const handlePressP = () => setExpandedP(!expandedP);

  const selectComponent = key => {
    switch (key) {
      case 'p':
        setRenderComponent(
          <AddGamePlatform
            checkboxesP={checkboxesP}
            setcheckboxesP={setcheckboxesP}
            setShowModal={setShowModal}
            toastRef={toastRef}
          />,
        );
        setShowModal(true);
        break;
      case 'c':
        setRenderComponent(
          <AddGameCategory
            checkboxes={checkboxes}
            setCheckBoxes={setCheckBoxes}
            setShowModal={setShowModal}
            toastRef={toastRef}
          />,
        );
        setShowModal(true);
        break;
    }
  };

  const editGame = () => {
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
    } else {
      setIsLoading(true);
      //Esta funcion nos devuelve una promesa con las URL de todas las imagenes
      upladImageStorage().then(response => {
        const userId = firebase.auth().currentUser.uid;
        const gameData = {
          gameName: gameName,
          gameDevelop: gameDevelop,
          gameDescription: gameDescription,
          gameYear: gameYear,
          age: age,
          gameCategory: arrayCategories,
          gamePlatform: arrayPlatforms,
          imagesGames: response,
        };
        database
          .child(gameInfo.id)
          .update(gameData)
          .then(() => {
            setIsLoading(false);
            navigation.goBack();
          });
      });
    }
  };

  const upladImageStorage = async () => {
    const UrlImages = auxImagesSelected;
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
            if (__DEV__) console.log(error);
          });
      }),
    );

    return UrlImages;
  };

  return (
    <View style={styles.viewForm}>
      <Input
        placeholder={texts.t('placeholder_gameName')}
        containerStyle={styles.input}
        onChange={e => setGameName(e.nativeEvent.text)}
        defaultValue={gameName}
      />
      <Input
        placeholder={texts.t('placeholder_gameDevelop')}
        containerStyle={styles.input}
        onChange={e => setGameDevelop(e.nativeEvent.text)}
        defaultValue={gameDevelop}
      />
      <Input
        placeholder={texts.t('placeholder_gameDescription')}
        multiline={true}
        inputContainerStyle={styles.textArea}
        onChange={e => setGameDescription(e.nativeEvent.text)}
        defaultValue={gameDescription}
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
        defaultValue={age}
        dropDownStyle={{backgroundColor: '#fafafa'}}
        onChangeItem={item => setAge(item.value)}
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
      <Toast ref={toastRef} position="center" opacity={0.9} />
      <Button
        title={texts.t('edit_game')}
        onPress={editGame}
        buttonStyle={styles.btnAddGame}></Button>
      <LoadingComponent
        isVisible={isLoading}
        text={texts.t('editing_game') + '...'}
      />
    </View>
  );
};

const UploadImage = props => {
  const {
    imagesSelected,
    setImagesSelected,
    auxImagesSelected,
    setAuxImagesSelected,
  } = props;

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
            const aux = filter(
              auxImagesSelected,
              imageUrl => imageUrl !== image,
            );
            console.log('Aux img', aux);
            if (size(aux) > 0 || aux) {
              setAuxImagesSelected(aux);
            } else {
              setAuxImagesSelected([]);
            }
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

const AddGamePlatform = props => {
  const {setShowModal, checkboxesP, setcheckboxesP} = props;
  const [newPlatform, setNewPlatform] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const onSubmit = () => {
    setError(null);
    if (!newPlatform) {
      setError(texts.t('err_gamePlatform'));
    } else {
      setIsLoading(true);
      const auxCheckboxes = checkboxesP;
      const obj = {
        checked: false,
        id: checkboxesP[checkboxesP.length - 1].id + 1,
        title: newPlatform,
      };
      auxCheckboxes.push(obj);
      setcheckboxesP(auxCheckboxes);
      setIsLoading(false);
      setShowModal(false);
    }
  };
  return (
    <View style={styles.view}>
      <Input
        placeholder={texts.t('placeholder_platform')}
        defaultValue={newPlatform && newPlatform}
        containerStyle={styles.input}
        onChange={e => setNewPlatform(e.nativeEvent.text)}
        errorMessage={error}
      />
      <Button
        title={texts.t('add_sgText')}
        containerStyle={styles.btnContainer}
        buttonStyle={styles.btn}
        onPress={onSubmit}
        loading={isLoading}
      />
    </View>
  );
};
const AddGameCategory = props => {
  const {setShowModal, checkboxes, setCheckBoxes} = props;
  const [newCategory, setNewCategory] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const onSubmit = () => {
    setError(null);
    if (!newCategory) {
      setError(texts.t('err_void_categroy'));
    } else {
      setIsLoading(true);
      const auxCheckboxes = checkboxes;
      const obj = {
        checked: false,
        id: checkboxes[checkboxes.length - 1].id + 1,
        title: newCategory,
      };
      auxCheckboxes.push(obj);
      setCheckBoxes(auxCheckboxes);
      setIsLoading(false);
      setShowModal(false);
    }
  };

  return (
    <View style={styles.view}>
      <Input
        placeholder="Categoria"
        defaultValue={newCategory && newCategory}
        containerStyle={styles.input}
        onChange={e => setNewCategory(e.nativeEvent.text)}
        errorMessage={error}
      />
      <Button
        title={texts.t('add_sgText')}
        containerStyle={styles.btnContainer}
        buttonStyle={styles.btn}
        onPress={onSubmit}
        loading={isLoading}
      />
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
  view: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
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
    marginBottom: 30,
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
  btnContainer: {
    marginTop: 20,
    width: '95%',
  },
  btn: {
    backgroundColor: colors.primary,
  },
});
