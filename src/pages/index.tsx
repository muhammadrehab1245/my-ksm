import type { GetStaticProps } from 'next';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Button } from '@mantine/core';
import { Footer } from '@/components';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="flex h-screen flex-col">
      <div className="flex-1">
        <img className="w-full" src={'/images/banner.jpg'} alt="banner" />
        <div className="relative z-10 mx-auto -mt-24 w-[420px] rounded bg-white px-8 pt-6 pb-10 shadow">
          <div className="space-y-4 text-center">
            <div className="justify-center">
              <img className="inline" src="/images/logo.svg" alt="hotus logo" />
            </div>
            <h1 className="h3">{t('welcomeToHotus')}</h1>
            <div className="text-gray-500">{t('welcomeDescription')}</div>
            <Link className="block" href="/subscription">
              <Button fullWidth>{t('register')}</Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({ props: { ...(await serverSideTranslations(locale, ['common'])) } });
