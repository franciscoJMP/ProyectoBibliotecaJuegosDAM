import React, {Fragment} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {Icon} from 'react-native-elements';
import {useNavigation} from '@react-navigation/native';
import {colors} from 'ProyectoVideoJuegos/src/styles/withColors';


export default function AdminOptions(props) {
  const navigation = useNavigation();
  return (
    <Fragment>
      <Icon
        type="material-community"
        name="plus"
        color={colors.primary}
        reverse
        containerStyle={styles.btnContainer}
        onPress={() => navigation.navigate('addgame')}></Icon>
    </Fragment>
  );
}
const styles = StyleSheet.create({
  btnContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    shadowColor: 'black',
    shadowOffset: {width: 2, height: 2},
    shadowOpacity: 0.5,
  },
});
