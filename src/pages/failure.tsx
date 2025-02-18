import type { GetStaticProps } from 'next';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useSnapshot } from 'valtio';
import { Button } from '@mantine/core';
import { useCountries } from '@/hooks/fetch';
import { store } from '@/utilities';
import { ImCross } from 'react-icons/im';
export default function Success() {
  const { t } = useTranslation();

  //   useEffect(() => {
  //     if (!userInfo) {
  //       push('/');
  //     }
  //   }, []);

  return (
    <div className="mx-auto my-12 max-w-1/3">
      <div className="rounded bg-white p-8">
        <div className="text-center">
          <ImCross className="inline text-red-600" size={50} />
          <h4 className="my-4 border-b-2 border-gray-300 pb-4">{t('registrationFailed')}</h4>
        </div>
      </div>
      {/*<Button className="my-4" fullWidth onClick={open}>
        {t('sendTheRegistrationInfoToEmail')}
      </Button>*/}
      <Link href="/">
        <Button variant="outline" fullWidth className="my-4">
          {t('goBackToMainPage')}
        </Button>
      </Link>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({ props: { ...(await serverSideTranslations(locale, ['common'])) } });
