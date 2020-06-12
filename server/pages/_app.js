import { Grommet } from 'grommet';
import { ToastContainer } from 'react-toastify';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import 'react-toastify/dist/ReactToastify.css';
import './styles.css';

// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }) {
  return (
    <Grommet full>
      <Component {...pageProps} />
      <ToastContainer position="top-center" />
    </Grommet>
  );
}
