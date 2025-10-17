import styles from './BlurInput.module.scss';

export const BlurInput: React.FC<
  React.PropsWithChildren<{ label: string }>
> = ({ label, children }) => {
  return (
    <fieldset className={styles.fieldset}>
      <legend>{label}</legend>
      {children}
    </fieldset>
  );
};
