import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Button, Avatar, Rating} from 'react-native-elements';
import moment from 'moment';
import {map} from 'lodash';
import * as firebase from 'firebase';
import 'firebase/database';
import {colors} from 'ProyectoVideoJuegos/src/styles/withColors';

const database = firebase.database();

export default function ListReviewComponent(props) {
  const {navigation, idGame} = props;

  const [userLogger, setUserLogger] = useState(false);
  const [reviews, setReviews] = useState([]);

  firebase.auth().onAuthStateChanged(user => {
    user ? setUserLogger(true) : setUserLogger(false);
  });
  useEffect(() => {
    database
      .ref('Comentarios')
      .child(idGame)
      .orderByChild('createAt')
      .on('value', snapshot => {
        const resultReview = [];
        snapshot.forEach(child => {
          resultReview.push(child.val());
        });
        setReviews(resultReview);
      });
  }, []);
  return (
    <View>
      {userLogger ? (
        <Button
          title="Comentar"
          buttonStyle={styles.addReview}
          titleStyle={styles.btnTitleReview}
          icon={{
            type: 'material-community',
            name: 'square-edit-outline',
            color: colors.primary,
          }}
          onPress={() => navigation.navigate('addreviewgame', {idGame: idGame})}
        />
      ) : (
        <View>
          <Text
            style={styles.textStyle}
            onPress={() => navigation.navigate('loginstack')}>
            Para comentar necesitas estar registrado{'\n'}
            <Text style={{fontWeight: 'bold'}}>
              pulsa AQUÍ para iniciar Sesión
            </Text>
          </Text>
        </View>
      )}
      {reviews && map(reviews, (r, index) => <Review key={index} review={r} />)}
    </View>
  );
}
const Review = props => {
  const {title, review, rating, createAt, avatarUser} = props.review;
  const date = new Date(createAt);
  const createReview = moment(date).format('DD/MM/YYY-HH:mm');

  return (
    <View style={styles.viewReview}>
      <View style={styles.viewAvatar}>
        <Avatar
          size="large"
          rounded
          containerStyle={styles.imgAvatarUser}
          source={
            avatarUser
              ? {uri: avatarUser}
              : require('../../assets/img/avatar-default.jpg')
          }
        />
      </View>
      <View style={styles.viewInfo}>
        <Text style={styles.reviewTitle}>{title}</Text>
        <Text style={styles.reviewText}>{review}</Text>
        <Rating imageSize={15} startingValue={rating} readonly />
        <Text style={styles.reviewDate}>{createReview}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  addReview: {
    backgroundColor: 'transparent',
  },
  btnTitleReview: {
    color: colors.primary,
  },
  textStyle: {
    textAlign: 'center',
    color: colors.primary,
    padding: 20,
  },
  viewReview: {
    flexDirection: 'row',
    padding: 10,
    paddingBottom: 20,
    borderBottomColor: '#e3e3e3',
    borderBottomWidth: 1,
  },
  viewAvatar: {
    marginRight: 15,
  },
  imgAvatarUser: {
    width: 50,
    height: 50,
  },
  viewInfo: {
    flex: 1,
    alignItems: 'flex-start',
  },
  reviewTitle: {
    fontWeight: 'bold',
  },
  reviewText: {
    paddingTop: 2,
    color: 'gray',
    marginBottom: 5,
  },
  reviewDate: {
    marginTop: 5,
    color: 'grey',
    fontSize: 12,
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
});
