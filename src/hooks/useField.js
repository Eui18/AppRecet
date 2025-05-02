import { useState, } from 'react';
import * as validateField from '../utils/validations';

const useField = ({ type }) => {
  const [value, setValue] = useState('');
  const [messageError, setMessageError] = useState('');
  const [touched, setTouched] = useState(false);

  const onChangeText = (text) => {
    setValue(text);
    if (touched) {
      const validation = validateField[type](text);
      setMessageError(validation.message);
    }
  };

  const onBlur = () => {
    setTouched(true);
    const validation = validateField[type](value);
    setMessageError(validation.message);
  };

  return {
    value,
    onChangeText,
    onBlur,
    messageError,
    hasError: !!messageError,
  };
};

export default useField;