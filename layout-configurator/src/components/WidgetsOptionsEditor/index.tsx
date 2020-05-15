import React, { useCallback } from 'react';

import styles from './index.module.css';

type Props = {
  value: string;
  parsingError: boolean;
  onOptionsChange: (widgetsOptions: string) => unknown;
};

const WidgetsOptionsEditor = ({
  value,
  onOptionsChange,
  parsingError,
}: Props) => {
  const handleChange = useCallback(
    (e) => {
      const value: string = e.target.value;
      onOptionsChange(value);
    },
    [onOptionsChange]
  );

  return (
    <textarea
      className={`${styles.root} ${parsingError ? styles.error : ''}`}
      spellCheck={false}
      value={value}
      onChange={handleChange}
    />
  );
};

export default WidgetsOptionsEditor;
