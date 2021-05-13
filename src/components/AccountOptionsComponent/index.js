import React, {useState, useEffect, Fragment} from 'react';
import {Text, View, StyleSheet, ScrollView} from 'react-native';
import {ListItem} from 'react-native-elements';
import {map} from 'lodash';
import * as firebase from 'firebase';
import 'firebase/database';
import {useNavigation} from '@react-navigation/native';
import ModalComponent from '../ModalComponent';
import LoadingComponent from '../LoadingComponent';
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
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
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
      case 'modsolicitude':
        addModSolicitude();
        break;
      case 'cancelsolicitude':
        cancelSolicitude();
        break;
      case 'viewrequest':
        navigation.navigate('requestview');
        break;
      default:
        setRenderComponent(null);
        setShowModal(false);
        break;
    }
  };
  const addModSolicitude = () => {
    setLoadingText('Enviando solicitud...');
    setIsLoading(true);
    let payloadSolicitude = {userId: user.uid, userEmail: user.email};

    database
      .ref('Solicitudes')
      .push(payloadSolicitude)
      .then(response => {
        const keySolicitude = response.key;
        let payloadUser = {sendSolicitude: true, keySolicitude: keySolicitude};
        database
          .ref('Usuarios')
          .child(user.uid)
          .update(payloadUser)
          .then(() => {
            setIsLoading(false);
          })
          .catch(e => {
            console.log(e);
          });
      });
  };

  const cancelSolicitude = () => {
    setLoadingText('Cancelando Solicitud...');
    setIsLoading(true);
    let payloadUser = {sendSolicitude: false, keySolicitude: ''};
    firebase
      .database()
      .ref('Solicitudes')
      .child(user.keySolicitude)
      .remove()
      .then(() => {
        firebase
          .database()
          .ref('Usuarios')
          .child(user.uid)
          .update(payloadUser)
          .then(() => {
            setIsLoading(false);
          });
      });
  };

  //Opciones del menu del listItem
  let menuOptions = user
    ? generateOptions(
        selectComponent,
        user.provider,
        user.userType,
        user.sendSolicitude,
      )
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
      <LoadingComponent isVisible={isLoading} text={loadingText} />
    </View>
  );
}

//Generamos opciones para el menu en el listItem
const generateOptions = (selectComponent, provider, type, sendSolicitude) => {
  //Segun el provider se renderizara un menu u otro
  const options = [];
  let obj;
  if (type === 'normal') {
    if (provider !== 'google') {
      obj = {
        title: 'Cambiar Nombre',
        iconType: 'material-community',
        iconNameLeft: 'account-circle',
        iconColorLeft: '#ccc',
        iconNameRight: 'chevron-right',
        iconColorRight: '#ccc',
        onPress: () => selectComponent('displayName'),
      };
      options.push(obj);

      obj = {
        title: 'Cambiar Email',
        iconType: 'material-community',
        iconNameLeft: 'at',
        iconColorLeft: '#ccc',
        iconNameRight: 'chevron-right',
        iconColorRight: '#ccc',
        onPress: () => selectComponent('displayEmail'),
      };
      options.push(obj);
      obj = {
        title: 'Cambiar Telefono',
        iconType: 'material-community',
        iconNameLeft: 'phone',
        iconColorLeft: '#ccc',
        iconNameRight: 'chevron-right',
        iconColorRight: '#ccc',
        onPress: () => selectComponent('displayPhone'),
      };
      options.push(obj);
      obj = {
        title: 'Cambiar Contraseña',
        iconType: 'material-community',
        iconNameLeft: 'lock-reset',
        iconColorLeft: '#ccc',
        iconNameRight: 'chevron-right',
        iconColorRight: '#ccc',
        onPress: () => selectComponent('displayPassword'),
      };
      options.push(obj);
      obj = {
        title: !sendSolicitude ? 'Solicitar moderación' : 'Cancelar solicitud',
        iconType: 'material-community',
        iconNameLeft: !sendSolicitude
          ? 'email-send-outline'
          : 'close-circle-outline',
        iconColorLeft: '#ccc',
        iconNameRight: 'chevron-right',
        iconColorRight: '#ccc',
        onPress: () =>
          selectComponent(
            !sendSolicitude ? 'modsolicitude' : 'cancelsolicitude',
          ),
      };
      options.push(obj);
    } else {
      obj = {
        title: 'Cambiar Nombre',
        iconType: 'material-community',
        iconNameLeft: 'account-circle',
        iconColorLeft: '#ccc',
        iconNameRight: 'chevron-right',
        iconColorRight: '#ccc',
        onPress: () => selectComponent('displayName'),
      };
      options.push(obj);
      obj = {
        title: 'Cambiar Telefono',
        iconType: 'material-community',
        iconNameLeft: 'phone',
        iconColorLeft: '#ccc',
        iconNameRight: 'chevron-right',
        iconColorRight: '#ccc',
        onPress: () => selectComponent('displayPhone'),
      };
      options.push(obj);
      obj = {
        title: !sendSolicitude ? 'Solicitar Moderación' : 'Cancelar Moderacion',
        iconType: 'material-community',
        iconNameLeft: !sendSolicitude
          ? 'email-send-outline'
          : 'close-circle-outline',
        iconColorLeft: '#ccc',
        iconNameRight: 'chevron-right',
        iconColorRight: '#ccc',
        onPress: () =>
          selectComponent(
            !sendSolicitude ? 'modsolicitude' : 'cancelsolicitude',
          ),
      };
      options.push(obj);
    }
  } else if (type == 'moderator') {
    if (provider !== 'google') {
      obj = {
        title: 'Cambiar Nombre',
        iconType: 'material-community',
        iconNameLeft: 'account-circle',
        iconColorLeft: '#ccc',
        iconNameRight: 'chevron-right',
        iconColorRight: '#ccc',
        onPress: () => selectComponent('displayName'),
      };
      options.push(obj);
      obj = {
        title: 'Cambiar Email',
        iconType: 'material-community',
        iconNameLeft: 'at',
        iconColorLeft: '#ccc',
        iconNameRight: 'chevron-right',
        iconColorRight: '#ccc',
        onPress: () => selectComponent('displayEmail'),
      };
      options.push(obj);
      obj = {
        title: 'Cambiar Telefono',
        iconType: 'material-community',
        iconNameLeft: 'phone',
        iconColorLeft: '#ccc',
        iconNameRight: 'chevron-right',
        iconColorRight: '#ccc',
        onPress: () => selectComponent('displayPhone'),
      };
      options.push(obj);
      obj = {
        title: 'Cambiar Contraseña',
        iconType: 'material-community',
        iconNameLeft: 'lock-reset',
        iconColorLeft: '#ccc',
        iconNameRight: 'chevron-right',
        iconColorRight: '#ccc',
        onPress: () => selectComponent('displayPassword'),
      };
      options.push(obj);

      obj = {
        title: 'Ver Solicitudes',
        iconType: 'material-community',
        iconNameLeft: 'email-mark-as-unread',
        iconColorLeft: '#ccc',
        iconNameRight: 'chevron-right',
        iconColorRight: '#ccc',
        onPress: () => selectComponent('viewrequest'),
      };
      options.push(obj);
    } else {
      obj = {
        title: 'Cambiar Nombre',
        iconType: 'material-community',
        iconNameLeft: 'account-circle',
        iconColorLeft: '#ccc',
        iconNameRight: 'chevron-right',
        iconColorRight: '#ccc',
        onPress: () => selectComponent('displayName'),
      };
      options.push(obj);
      obj = {
        title: 'Cambiar Telefono',
        iconType: 'material-community',
        iconNameLeft: 'phone',
        iconColorLeft: '#ccc',
        iconNameRight: 'chevron-right',
        iconColorRight: '#ccc',
        onPress: () => selectComponent('displayPhone'),
      };
      options.push(obj);
      obj = {
        title: 'Ver Solicitudes',
        iconType: 'material-community',
        iconNameLeft: 'email-mark-as-unread',
        iconColorLeft: '#ccc',
        iconNameRight: 'chevron-right',
        iconColorRight: '#ccc',
        onPress: () => selectComponent('viewrequest'),
      };
      options.push(obj);
    }
  } else if (type === 'admin') {
    if (provider !== 'google') {
      obj = {
        title: 'Cambiar Nombre',
        iconType: 'material-community',
        iconNameLeft: 'account-circle',
        iconColorLeft: '#ccc',
        iconNameRight: 'chevron-right',
        iconColorRight: '#ccc',
        onPress: () => selectComponent('displayName'),
      };
      options.push(obj);
      obj = {
        title: 'Cambiar Email',
        iconType: 'material-community',
        iconNameLeft: 'at',
        iconColorLeft: '#ccc',
        iconNameRight: 'chevron-right',
        iconColorRight: '#ccc',
        onPress: () => selectComponent('displayEmail'),
      };
      options.push(obj);
      obj = {
        title: 'Cambiar Telefono',
        iconType: 'material-community',
        iconNameLeft: 'phone',
        iconColorLeft: '#ccc',
        iconNameRight: 'chevron-right',
        iconColorRight: '#ccc',
        onPress: () => selectComponent('displayPhone'),
      };
      options.push(obj);
      obj = {
        title: 'Cambiar Contraseña',
        iconType: 'material-community',
        iconNameLeft: 'lock-reset',
        iconColorLeft: '#ccc',
        iconNameRight: 'chevron-right',
        iconColorRight: '#ccc',
        onPress: () => selectComponent('displayPassword'),
      };
      options.push(obj);
      obj = {
        title: 'Administrar Usuarios',
        iconType: 'material-community',
        iconNameLeft: 'account-group',
        iconColorLeft: '#ccc',
        iconNameRight: 'chevron-right',
        iconColorRight: '#ccc',
        onPress: () => selectComponent('adminUsers'),
      };
      options.push(obj);
      obj = {
        title: 'Ver Solicitudes',
        iconType: 'material-community',
        iconNameLeft: 'email-mark-as-unread',
        iconColorLeft: '#ccc',
        iconNameRight: 'chevron-right',
        iconColorRight: '#ccc',
        onPress: () => selectComponent('viewrequest'),
      };
      options.push(obj);
    } else {
      obj = {
        title: 'Cambiar Nombre',
        iconType: 'material-community',
        iconNameLeft: 'account-circle',
        iconColorLeft: '#ccc',
        iconNameRight: 'chevron-right',
        iconColorRight: '#ccc',
        onPress: () => selectComponent('displayName'),
      };
      options.push(obj);
      obj = {
        title: 'Cambiar Telefono',
        iconType: 'material-community',
        iconNameLeft: 'phone',
        iconColorLeft: '#ccc',
        iconNameRight: 'chevron-right',
        iconColorRight: '#ccc',
        onPress: () => selectComponent('displayPhone'),
      };
      options.push(obj);
      obj = {
        title: 'Administrar Usuarios',
        iconType: 'material-community',
        iconNameLeft: 'email-mark-as-unread',
        iconColorLeft: '#ccc',
        iconNameRight: 'chevron-right',
        iconColorRight: '#ccc',
        onPress: () => selectComponent('adminUsers'),
      };
      options.push(obj);
      obj = {
        title: 'Ver Solicitudes',
        iconType: 'material-community',
        iconNameLeft: 'email-mark-as-unread',
        iconColorLeft: '#ccc',
        iconNameRight: 'chevron-right',
        iconColorRight: '#ccc',
        onPress: () => selectComponent('viewrequest'),
      };
      options.push(obj);
    }
  }
  return options;
};

const styles = StyleSheet.create({
  menuItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e3e3e3',
  },
});
