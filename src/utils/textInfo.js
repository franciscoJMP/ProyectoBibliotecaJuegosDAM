import {setI18nConfig} from 'ProyectoVideoJuegos/src/languages/i18n.js';
var texts = setI18nConfig();

const titleGuestAccount = texts.t('title_info_guest_account');
const textGuestAccount = texts.t('text_info_guest_account') + ' ' + '';
const titleGuestLibrary = texts.t('title_info_guest_library');
const textGuestLibrary = texts.t('text_info_guest_library') + ' ' + '';

export {
  titleGuestAccount,
  textGuestAccount,
  titleGuestLibrary,
  textGuestLibrary,
};
