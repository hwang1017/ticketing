import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/header';

// global component
const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <Header currentUser={currentUser} />
      <div className='container'>
        <Component currentUser={currentUser} {...pageProps} />
      </div>
    </div>
  );
};

//Initial props for the global page and the sub-component before they are rendered
AppComponent.getInitialProps = async (appContext) => {
  // set props for global component
  const client = buildClient(appContext.ctx);
  const { data } = await client.get('/api/users/currentuser');
  // console.log(data);

  // set props for sub-component
  let pageProps = {};
  // if the page is rendered need initial their props,
  // then we set their props here below
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(
      appContext.ctx,
      client,
      data.currentUser
    );
  }
  // console.log(pageProps);
  return {
    pageProps,
    ...data,
  };
};

export default AppComponent;
