/**
 * @file ErrorMessage.jsx
 * @description Standard error feedback box for forms, wrapping the core Alert component.
 */

import Alert from './Alert';

const ErrorMessage = ({ message, className = '', ...props }) => {
  if (!message) return null;

  return (
    <Alert
      variant="error"
      className={className}
      style={{
        width: '100%',
        marginBottom: '1rem',
        ...props.style,
      }}
      {...props}
    >
      {message}
    </Alert>
  );
};

export default ErrorMessage;
