import type { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';
import { useRouter } from 'next/router';
import { Toaster } from 'react-hot-toast';
import { appWithTranslation } from 'next-i18next';
import { MantineProvider } from '@mantine/core';
import { config, mantineTheme } from '@/utilities';
import { Footer, Header, RouterTransition } from '@/components';
import '@/assets/css/style.css';

export function App({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter();

  return (
    <>
      <Head>
        <title>{config.app.name}</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>
      <Script src={process.env.NEXT_PUBLIC_GMO_TOKEN} />

      <MantineProvider withGlobalStyles withNormalizeCSS theme={mantineTheme}>
        <RouterTransition />
        {['/', '/terms-and-conditions', '/privacy-policy'].includes(pathname) ? (
          <>
            <Toaster position="top-right" />
            <Component {...pageProps} />
          </>
        ) : (
          <>
            <Toaster position="top-right" />
            <Header />
            <Component {...pageProps} />
            <Footer />
          </>
        )}
      </MantineProvider>
    </>
  );
}

export default appWithTranslation(App);
