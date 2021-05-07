import React, {useState, useEffect, Fragment} from 'react';
import {Text, View, StyleSheet} from 'react-native';
import {ListItem} from 'react-native-elements';
import {map} from 'lodash';
import * as firebase from 'firebase';
import 'firebase/database';
import {useNavigation} from '@react-navigation/native';
import ModalComponent from '../ModalComponent';
import {
  ChangeDisplayNameForm,
  ChangePhoneNumberForm,
  ChangeEmailForm,
  ChangePasswordForm,
} from '../ChangeUserDataForms';

const database = firebase.database();
export default function AccountOptionsComponent(props) {
  const {userInfo, toastRef} = props;
  const [showModal, setShowModal] = useState(false);
  const [renderComponent, setRenderComponent] = useState(null);
  const [user, setUser] = useState(null);
  const navigation = useNavigation();
  useEffect(() => {
    const userData = database.ref('Usuarios').child(userInfo.uid);
    userData.on('value', snapshot => {
      setUser(snapshot.val());
    });
  }, []);
  //Funcion para abrir la ventana modal segun la key
  const selectComponent = key => {
    switch (key) {
      case 'displayName':
        setRenderComponent(
          <ChangeDisplayNameForm
            displayName={user.name}
            setShowModal={setShowModal}
            toastRef={toastRef}
          />,
        );
        setShowModal(true);
        break;
      case 'displayEmail':
        setRenderComponent(
          <ChangeEmailForm
            email={user.email}
            setShowModal={setShowModal}
            toastRef={toastRef}
          />,
        );
        setShowModal(true);
        break;
      case 'displayPhone':
        setRenderComponent(
          <ChangePhoneNumberForm
            setShowModal={setShowModal}
            toastRef={toastRef}
          />,
        );
        setShowModal(true);
        break;
      case 'displayPassword':
        setRenderComponent(
          <ChangePasswordForm
            displayPhone={user.phone}
            setShowModal={setShowModal}
            toastRef={toastRef}
          />,
        );
        setShowModal(true);
        break;
      case 'adminUsers':
        navigation.navigate('adminusers');
        break;
      default:
        setRenderComponent(null);
        setShowModal(false);
        break;
    }
  };
  //Opciones del menu del listItem
  let menuOptions = user
    ? generateOptions(selectComponent, user.provider, user.userType)
    : null;
  return (
    <View>
      {map(menuOptions, (menu, index) => (
        <ListItem
          key={index}
          title={menu.title}
          leftIcon={{
            type: menu.iconType,
            name: menu.iconNameLeft,
            color: menu.iconColorLeft,
          }}
          rightIcon={{
            type: menu.iconType,
            name: menu.iconNameRight,
            color: menu.iconColorRight,
          }}
          containerStyle={styles.menuItem}
          onPress={menu.onPress}
        />
      ))}
      {renderComponent && (
        <ModalComponent isVisible={showModal} setIsVisible={setShowModal}>
          {renderComponent}
        </ModalComponent>
      )}
    </View>
  );
}

//Generamos opciones para el menu en el listItem
const generateOptions = (selectComponent, provider, type) => {
  //Segun el provider se renderizara un menu u otro
  if (type !== 'admin') {
    if (provider !== 'google') {
      return [
        {
          title: 'Cambiar Nombre',
          iconType: 'material-community',
          iconNameLeft: 'account-circle',
          iconColorLeft: '#ccc',
          iconNameRight: 'chevron-right',
          iconColorRight: '#ccc',
          onPress: () => selectComponent('displayName'),
        },
        {
          title: 'Cambiar Email',
          iconType: 'material-community',
          iconNameLeft: 'at',
          iconColorLeft: '#ccc',
          iconNameRight: 'chevron-right',
          iconColorRight: '#ccc',
          onPress: () => selectComponent('displayEmail'),
        },
        {
          title: 'Cambiar Telefono',
          iconType: 'material-community',
          iconNameLeft: 'phone',
          iconColorLeft: '#ccc',
          iconNameRight: 'chevron-right',
          iconColorRight: '#ccc',
          onPress: () => selectComponent('displayPhone'),
        },
        {
          title: 'Cambiar Contraseña',
          iconType: 'material-community',
          iconNameLeft: 'lock-reset',
          iconColorLeft: '#ccc',
          iconNameRight: 'chevron-right',
          iconColorRight: '#ccc',
          onPress: () => selectComponent('displayPassword'),
        },
      ];
    } else {
      return [
        {
          title: 'Cambiar Nombre',
          iconType: 'material-community',
          iconNameLeft: 'account-circle',
          iconColorLeft: '#ccc',
          iconNameRight: 'chevron-right',
          iconColorRight: '#ccc',
          onPress: () => selectComponent('displayName'),
        },

        {
          title: 'Cambiar Telefono',
          iconType: 'material-community',
          iconNameLeft: 'phone',
          iconColorLeft: '#ccc',
          iconNameRight: 'chevron-right',
          iconColorRight: '#ccc',
          onPress: () => selectComponent('displayPhone'),
        },
      ];
    }
  } else {
    if (provider !== 'google') {
      return [
        {
          title: 'Cambiar Nombre',
          iconType: 'material-community',
          iconNameLeft: 'account-circle',
          iconColorLeft: '#ccc',
          iconNameRight: 'chevron-right',
          iconColorRight: '#ccc',
          onPress: () => selectComponent('displayName'),
        },
        {
          title: 'Cambiar Email',
          iconType: 'material-community',
          iconNameLeft: 'at',
          iconColorLeft: '#ccc',
          iconNameRight: 'chevron-right',
          iconColorRight: '#ccc',
          onPress: () => selectComponent('displayEmail'),
        },
        {
          title: 'Cambiar Telefono',
          iconType: 'material-community',
          iconNameLeft: 'phone',
          iconColorLeft: '#ccc',
          iconNameRight: 'chevron-right',
          iconColorRight: '#ccc',
          onPress: () => selectComponent('displayPhone'),
        },
        {
          title: 'Cambiar Contraseña',
          iconType: 'material-community',
          iconNameLeft: 'lock-reset',
          iconColorLeft: '#ccc',
          iconNameRight: 'chevron-right',
          iconColorRight: '#ccc',
          onPress: () => selectComponent('displayPassword'),
        },
        {
          title: 'Administrar Usuarios',
          iconType: 'material-community',
          iconNameLeft: 'account-group',
          iconColorLeft: '#ccc',
          iconNameRight: 'chevron-right',
          iconColorRight: '#ccc',
          onPress: () => selectComponent('adminUsers'),
        },
      ];
    } else {
      return [
        {
          title: 'Cambiar Nombre',
          iconType: 'material-community',
          iconNameLeft: 'account-circle',
          iconColorLeft: '#ccc',
          iconNameRight: 'chevron-right',
          iconColorRight: '#ccc',
          onPress: () => selectComponent('displayName'),
        },

        {
          title: 'Cambiar Telefono',
          iconType: 'material-community',
          iconNameLeft: 'phone',
          iconColorLeft: '#ccc',
          iconNameRight: 'chevron-right',
          iconColorRight: '#ccc',
          onPress: () => selectComponent('displayPhone'),
        },
        {
          title: 'Administrar Usuarios',
          iconType: 'material-community',
          iconNameLeft: 'account-group',
          iconColorLeft: '#ccc',
          iconNameRight: 'chevron-right',
          iconColorRight: '#ccc',
          onPress: () => selectComponent('adminUsers'),
        },
      ];
    }
  }
};

const styles = StyleSheet.create({
  menuItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e3e3e3',
  },
});
