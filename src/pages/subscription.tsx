import type { GetStaticProps } from 'next';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Button } from '@mantine/core';
import { usePlans } from '@/hooks/fetch';
import { Skeleton } from '@/components';

export default function Subscription() {
  const { t } = useTranslation();
  const { data } = usePlans();

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      <div className="flex-1">
        <div className="relative">
          <img className="h-72 w-full object-cover" src={'/images/banner.jpg'} alt="banner" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="space-y-2 text-center font-bold text-white">
              <h2>{t('heading')}</h2>
              <h5>{t('subHeading')}</h5>
            </div>
          </div>
        </div>
        <div className="container relative z-10 -mt-8 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {data ? (
            data.map(({ id, name, monthlyFee, description, code }, index) => (
              <div className="space-y-2 rounded-xl bg-white p-8 text-center" key={index}>
                <div className="relative inline-block">
                  <img className="inline" src="/icons/mark.svg" alt="mark" />
                  <span className="absolute left-0 top-1.5 w-full text-center text-xl text-white">{index + 1}</span>
                </div>
                <h2 className="text-2xl">{t(code) || name}</h2>
                <div>
                  <span className="text-3xl font-bold text-primary-500">￥{monthlyFee}</span>
                  <span className="pl-1 text-sm">{t('afterPrice')}</span>
                </div>
                <div dangerouslySetInnerHTML={{ __html: description }} />
                <Link href={`/signup/${id}`}>
                  <Button>{t('select')}</Button>
                </Link>
              </div>
            ))
          ) : (
            <div className="rounded-xl bg-white p-8 text-center">
              <Skeleton />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({ props: { ...(await serverSideTranslations(locale, ['common'])) } });
