import React from 'react';

import {CreateAccountMensagge} from 'ProyectoVideoJuegos/src/components';

export default function UserGuest(props) {
  const {title,text} = props
  return <CreateAccountMensagge title={title} text={text} />;
}
