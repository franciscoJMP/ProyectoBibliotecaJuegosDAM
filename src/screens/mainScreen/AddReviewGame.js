import React, {useState, useRef} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Button, Input} from 'react-native-elements';
import {AirbnbRating} from 'react-native-ratings';
import * as firebase from 'firebase';
import 'firebase/database';
import {LoadingComponent} from 'ProyectoVideoJuegos/src/components';
import {colors} from 'ProyectoVideoJuegos/src/styles/withColors';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Toast from 'react-native-easy-toast';
const database = firebase.database();
export default function AddReviewGame(props) {
  const {navigation, route} = props;
  const {idGame} = route.params;
  const [rating, setRating] = useState(null);
  const [title, setTitle] = useState('');
  const [review, setReview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toastRef = useRef();

  const addReview = () => {
    if (!title) {
      toastRef.current.show('El titulo es obligatorio');
    } else if (!review) {
      toastRef.current.show('El comentario es obligatorio');
    } else {
      setIsLoading(true);
      const user = firebase.auth().currentUser;
      const createAt = new Date();
      const paylod = {
        idUser: user.uid,
        avatarUser: user.photoURL,
        idGame: idGame,
        title: title,
        review: review,
        rating: rating,
        createAt: createAt.toString(),
      };

      database
        .ref('Comentarios')
        .child(idGame)
        .push(paylod)
        .then(() => {
          updateGameReview();
        })
        .catch(() => {
          setIsLoading(false);
          toastRef.current.show('Error al enviar el comentario');
        });
    }
  };
  const updateGameReview = async () => {
    const gameRef = database.ref('Juegos').child(idGame);
    let gameData, ratingTotal, quantityVoting, ratingResult;
    await gameRef.on('value', snapshot => {
      if (snapshot.exists()) {
        gameData = snapshot.val();
        ratingTotal = gameData.ratingTotal + rating;
        quantityVoting = gameData.quantityVoting + 1;
        ratingResult = ratingTotal / quantityVoting;
      }
    });
    await gameRef
      .update({
        rating: ratingResult,
        ratingTotal,
        quantityVoting,
      })
      .then(() => {
        setIsLoading(false), navigation.goBack();
      });
  };


  return (
    <View style={styles.viewBody}>
      <View style={styles.viewRating}>
        <AirbnbRating
          count={5}
          reviews={['Pésimo', 'Deficiente', 'Normal', 'Bueno', 'Muy Bueno']}
          defaultRating={1}
          size={30}
          onFinishRating={value => setRating(value)}
        />
      </View>
      <KeyboardAwareScrollView contentContainerStyle={styles.formView}>
        <Input
          placeholder="Titulo"
          style={styles.input}
          onChange={e => setTitle(e.nativeEvent.text)}
        />
        <Input
          placeholder="Comentario..."
          multiline={true}
          inputContainerStyle={styles.textArea}
          onChange={e => setReview(e.nativeEvent.text)}
        />
        <Button
          title="Enviar Comentario"
          containerStyle={styles.btnContainer}
          buttonStyle={styles.btn}
          onPress={addReview}
        />
      </KeyboardAwareScrollView>
      <Toast ref={toastRef} position="center" opacity={0.9} />
      <LoadingComponent isVisible={isLoading} text="Enviando Comentario" />
    </View>
  );
}

const styles = StyleSheet.create({
  viewBody: {
    flex: 1,
  },
  viewRating: {
    height: 110,
    backgroundColor: '#f2f2f2',
  },
  formView: {
    alignItems: 'center',
    margin: 10,
    marginTop: 40,
  },
  input: {
    marginBottom: 10,
  },
  textArea: {
    height: 150,
    width: '100%',
    padding: 0,
    margin: 0,
  },
  btnContainer: {
    marginTop: 40,
    marginBottom: 10,
    width: '95%',
  },
  btn: {
    backgroundColor: colors.primary,
  },
});
