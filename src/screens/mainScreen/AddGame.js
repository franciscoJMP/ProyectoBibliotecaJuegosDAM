import React, {useState, useRef} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Toast from 'react-native-easy-toast';
import {
  LoadingComponent,
  AddGamesComponentForm,
} from 'ProyectoVideoJuegos/src/components';

export default function AddGame(props) {
 
  const {navigation} = props;
  const [isLoading, setIsLoading] = useState(false);
  const toastRef = useRef();
  return (
    <View>
      <AddGamesComponentForm toastRef={toastRef} setIsLoading={setIsLoading} navigation={navigation} />
      <Toast ref={toastRef} position="center" opacity={0.9} />
      <LoadingComponent isVisible={isLoading} text="Creando Juego" />
    </View>
  );
}
