import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, View, Alert, ScrollView} from 'react-native';
import {Button, Avatar, Rating, Icon, Input} from 'react-native-elements';
import moment from 'moment';
import {AirbnbRating} from 'react-native-ratings';
import NetInfo from '@react-native-community/netinfo';
import {NotNetworkConnection} from 'ProyectoVideoJuegos/src/components';
import Toast from 'react-native-easy-toast';
import {map} from 'lodash';
import * as firebase from 'firebase';
import 'firebase/database';
import {colors} from 'ProyectoVideoJuegos/src/styles/withColors';
import {setI18nConfig} from 'ProyectoVideoJuegos/src/languages/i18n.js';
var texts = setI18nConfig();

const database = firebase.database();

export default function ListReviewComponent(props) {
  const {
    navigation,
    gameInfo,
    toastRef,
    setIsLoading,
    setLoadingText,
    setShowModal,
    setRenderComponent,
  } = props;
  const idGame = gameInfo.id;
  const ratingTotal = gameInfo.ratingTotal;
  const quantityVoting = gameInfo.quantityVoting;

  const [userLogger, setUserLogger] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState(null);
  const [networkInfo, setNetworkInfo] = useState(true);
  const [actualyUser, setActualyUser] = useState(null);

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
          const commentKey = child.key;
          const obj = {...child.val(), commentKey: commentKey};
          resultReview.push(obj);
        });
        setReviews(resultReview);
      });
    database.ref('Usuarios').on('value', snapshot => {
      const resultUsers = [];
      snapshot.forEach(children => {
        resultUsers.push(children.val());
      });
      setUsers(resultUsers);
    });
  }, []);

  useEffect(() => {
    if (userLogger) {
      const uid = firebase.auth().currentUser.uid;
      database
        .ref('Usuarios')
        .child(uid)
        .on('value', snapshot => {
          setActualyUser(snapshot.val());
        });
    }
  }, [userLogger]);

  useEffect(() => {
    NetInfo.addEventListener(state => {
      setNetworkInfo(state.isInternetReachable);
    });
  }, []);

  return (
    <View>
      {userLogger ? (
        <Button
          title={texts.t('btn_comment')}
          buttonStyle={styles.addReview}
          titleStyle={styles.btnTitleReview}
          icon={{
            type: 'material-community',
            name: 'square-edit-outline',
            color: colors.primary,
          }}
          onPress={() => {
            if (networkInfo) {
              navigation.navigate('addreviewgame', {idGame: idGame});
            } else {
              toastRef.current.show(texts.t('not_connection'), 1300);
            }
          }}
        />
      ) : (
        <View>
          <Text
            style={styles.textStyle}
            onPress={() => navigation.navigate('accountScreen')}>
            {texts.t('msg_requeriment_comment') + '\n'}
            <Text style={{fontWeight: 'bold'}}>
              {texts.t('msg_comment_click_here')}
            </Text>
          </Text>
        </View>
      )}
      {reviews &&
        users &&
        map(reviews, (r, index) => (
          <Review
            key={index}
            review={r}
            users={users}
            idGame={idGame}
            toastRef={toastRef}
            actualyUser={actualyUser}
            setIsLoading={setIsLoading}
            setLoadingText={setLoadingText}
            setShowModal={setShowModal}
            setRenderComponent={setRenderComponent}
            ratingTotal={ratingTotal}
            quantityVoting={quantityVoting}
            networkInfo={networkInfo}
            toastRef={toastRef}
          />
        ))}
    </View>
  );
}
const Review = props => {
  const {
    users,
    actualyUser,
    idGame,
    toastRef,
    setIsLoading,
    setLoadingText,
    setShowModal,
    setRenderComponent,
    ratingTotal,
    quantityVoting,
    networkInfo,
  } = props;
  const {
    title,
    review,
    rating,
    createAt,
    isEdited,
    idUser,
    commentKey,
  } = props.review;

  const date = new Date(createAt);
  const createReview = moment(date).format('DD/MM/YYYY-HH:mm');
  let avatarUser;
  users.forEach(user => {
    if (user.uid === idUser) {
      avatarUser = user.photoURL;
    }
  });

  const showDeleteIconFunction = () => {
    let show = false;
    if (actualyUser) {
      if (actualyUser.uid === idUser) {
        show = true;
      } else if (
        actualyUser.userType === 'admin' ||
        actualyUser.userType === 'moderator'
      ) {
        show = true;
      } else {
        show = false;
      }
    }
    return show;
  };
  const showEditIconFunction = () => {
    let show = false;
    if (actualyUser) {
      if (actualyUser.uid === idUser) {
        show = true;
      } else {
        show = false;
      }
    }
    return show;
  };
  const showDeleteIcon = showDeleteIconFunction();
  const showEditIcon = showEditIconFunction();
  const deleteComment = () => {
    Alert.alert(
      texts.t('alert_delete_comment_title'),
      texts.t('alert_delete_comment_msg'),
      [
        {
          text: texts.t('cancel_btn'),
          style: 'cancel',
        },
        {
          text: texts.t('delete_btn'),
          onPress: () => {
            setLoadingText(texts.t('deleting_comment') + '...');
            setIsLoading(true);
            setTimeout(() => {
              if (networkInfo) {
                database
                  .ref('Comentarios')
                  .child(idGame)
                  .child(commentKey)
                  .remove()
                  .then(() => {
                    setIsLoading(false);
                    toastRef.current.show(texts.t('deleting_comment_ok'), 1300);
                  });
              } else {
                setIsLoading(false);
                toastRef.current.show(texts.t('not_connection'), 1300);
              }
            }, 500);
          },
        },
      ],
      {cancelable: false},
    );
  };
  const editComment = () => {
    setShowModal(true);
    setRenderComponent(
      <EditComment
        review={props.review}
        toastRef={toastRef}
        setIsLoading={setIsLoading}
        setLoadingText={setLoadingText}
        idGame={idGame}
        ratingTotal={ratingTotal}
        quantityVoting={quantityVoting}
        setShowModal={setShowModal}
        toastRef={toastRef}
      />,
    );
  };

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
        {showDeleteIcon && (
          <Icon
            type="material-community"
            containerStyle={styles.deleteIcon}
            name="trash-can"
            onPress={deleteComment}
          />
        )}
        {showEditIcon && (
          <Icon
            type="material-community"
            containerStyle={[
              styles.deleteIcon,
              {right: showDeleteIcon ? 30 : 0},
            ]}
            name="pencil"
            onPress={
              networkInfo
                ? editComment
                : () => {
                    toastRef.current.show(texts.t('not_connection'), 1300);
                  }
            }
          />
        )}

        <Text style={styles.reviewText}>{review}</Text>
        <Rating imageSize={15} startingValue={rating} readonly />

        <Text style={styles.reviewDate}>
          {createReview}
          {isEdited && (
            <Text style={{fontWeight: 'bold'}}> {texts.t('edit_text')} </Text>
          )}
        </Text>
      </View>
    </View>
  );
};
const EditComment = props => {
  const {
    setIsLoading,
    setLoadingText,
    idGame,
    ratingTotal,
    quantityVoting,
    setShowModal,
    toastRef,
  } = props;
  const {title, review, rating, commentKey} = props.review;
  const [newRaiting, setNewRaiting] = useState(rating);
  const [newTitleReview, setNewTitleReview] = useState(title);
  const [newReview, setNewReview] = useState(review);
  const [thisIsLoading, setThisIsLoading] = useState(false);
  const [error, setError] = useState({});
  const [networkInfo, setNetworkInfo] = useState(true);

  useEffect(() => {
    NetInfo.addEventListener(state => {
      setNetworkInfo(state.isInternetReachable);
    });
  }, []);

  const editComment = () => {
    let tempError = {};

    if (newTitleReview === '') {
      tempError = {title: texts.t('err_title_comment')};
    } else if (newReview === '') {
      tempError = {comment: texts.t('err_comment')};
    } else if (!networkInfo) {
      setThisIsLoading(false);
      setIsLoading(false);
      setShowModal(false);
      toastRef.current.show(texts.t('not_connection'), 1300);
    } else {
      setThisIsLoading(true);
      setLoadingText(texts.t('editing_comment') + '...');
      setIsLoading(true);

      let gameRating;
      let operation;
      let newRaitingTotal, newGameRaiting;
      if (parseInt(newRaiting) >= parseInt(rating)) {
        gameRating = parseInt(newRaiting) - parseInt(rating);
        operation = 'sum';
      } else {
        gameRating = parseInt(rating) - parseInt(newRaiting);
        operation = 'rest';
      }
      switch (operation) {
        case 'sum':
          newRaitingTotal = parseInt(ratingTotal) + parseInt(gameRating);
          newGameRaiting = parseInt(newRaitingTotal) / parseInt(quantityVoting);
          break;
        case 'rest':
          newRaitingTotal = parseInt(ratingTotal) - parseInt(gameRating);
          newGameRaiting = parseInt(newRaitingTotal) / parseInt(quantityVoting);
          break;
      }

      setTimeout(() => {
        const gamePayload = {
          rating: newGameRaiting,
          ratingTotal: newRaitingTotal,
        };
        const commentPayload = {
          isEdited: true,
          rating: newRaiting,
          title: newTitleReview,
          review: newReview,
        };
        database
          .ref('Juegos')
          .child(idGame)
          .update(gamePayload)
          .then(() => {
            database
              .ref('Comentarios')
              .child(idGame)
              .child(commentKey)
              .update(commentPayload)
              .then(() => {
                setThisIsLoading(false);
                setIsLoading(false);
                setShowModal(false);
              })
              .catch(e => {
                console.log(e);
              });
          })
          .catch(e => {
            console.log(e);
          });
      }, 600);
    }
    setError(tempError);
  };

  return (
    <ScrollView
      style={styles.view}
      contentContainerStyle={{alignItems: 'center'}}>
      <Text style={{fontWeight: 'bold', fontSize: 20}}>
        {texts.t('btn_edit_comment')}
      </Text>
      <AirbnbRating
        count={5}
        reviews={[
          texts.t('review_state1'),
          texts.t('review_state2'),
          texts.t('review_state3'),
          texts.t('review_state4'),
          texts.t('review_state5'),
        ]}
        defaultRating={rating}
        size={30}
        onFinishRating={value => setNewRaiting(value)}
      />
      <Input
        placeholder={texts.t('title_text')}
        style={styles.input}
        defaultValue={title}
        onChange={e => setNewTitleReview(e.nativeEvent.text)}
        errorMessage={error.title}
      />
      <Input
        placeholder={texts.t('edit_comment_placeholder') + '...'}
        multiline={true}
        defaultValue={review}
        inputContainerStyle={styles.textArea}
        onChange={e => setNewReview(e.nativeEvent.text)}
        errorMessage={error.comment}
      />

      <Button
        title={texts.t('btn_edit_comment')}
        containerStyle={styles.btnContainer}
        buttonStyle={styles.btn}
        onPress={editComment}
        loading={thisIsLoading}
      />
    </ScrollView>
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
    width: '80%',
  },
  reviewDate: {
    marginTop: 5,
    color: 'grey',
    fontSize: 12,
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  deleteIcon: {
    marginTop: 5,
    position: 'absolute',
    right: 0,
  },
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
