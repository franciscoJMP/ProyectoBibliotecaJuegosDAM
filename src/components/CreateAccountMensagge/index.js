import React from 'react';
import {StyleSheet, View, ScrollView, Text, Image} from 'react-native';
import {Button} from 'react-native-elements';
import {useNavigation} from '@react-navigation/native';

export default function CreateAccountMensagge(props) {
  const navigation = useNavigation();

  const {title, text} = props;
  return (
    <ScrollView centerContent={true} style={styles.viewBody}>
      <Image
        source={require('ProyectoVideoJuegos/src/assets/img/logo.png')}
        resizeMode="contain"
        style={styles.image}
      />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{text}</Text>
      <View style={styles.btnView}>
        <Button
          buttonStyle={styles.btnStyle}
          containerStyle={styles.btnContainer}
          title="Registrarse"
          onPress={() =>
            navigation.navigate('accountScreen', {screen: 'loginscreen'})
          }
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  viewBody: {
    width: '100%',
  },
  image: {
    height: 300,
    width: '100%',
    marginBottom: 40,
    marginTop: 30,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 19,
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: 20,
  },
  btnView: {
    flex: 1,
    alignItems: 'center',
    marginBottom: 20,
  },
  btnStyle: {
    backgroundColor: '#1251E1',
  },
  btnContainer: {
    width: '70%',
  },
});
