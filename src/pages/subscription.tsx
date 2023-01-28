import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Button } from '@mantine/core';
import { usePlans } from '@/hooks/fetch';

export default function Subscription() {
  const { t } = useTranslation();
  const { data } = usePlans();

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      <div className="flex-1">
        <div className="relative">
          <img className="h-72 w-full object-cover" src={'/images/banner.jpg'} alt="banner" />
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="space-y-2 text-center font-bold">
              <h2 className="text-3xl">プラン選択</h2>
              <h3>契約プランを選択してください。</h3>
            </div>
          </div>
        </div>
        <div className="container relative z-10 -mt-8 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2 rounded-xl bg-white p-8 text-center">
            <div className="relative inline-block">
              <img className="inline" src="/icons/mark.svg" alt="mark" />
              <span className="absolute left-0 top-1.5 w-full text-center text-xl text-white">1</span>
            </div>
            <h2 className="text-2xl">プラン A</h2>
            <div>
              <span className="text-primary-500 text-3xl font-bold">￥7,990</span>
              <span className="pl-1 text-sm">(incl. TAX)/Month</span>
            </div>
            <p>
              Text description from admin <br />
              Text description from admin <br />
              Text description from admin <br />
              Text description from admin
            </p>
            <Button>Select</Button>
          </div>
          <div className="space-y-2 rounded-xl bg-white p-8 text-center">
            <div className="relative inline-block">
              <img className="inline" src="/icons/mark.svg" alt="mark" />
              <span className="absolute left-0 top-1.5 w-full text-center text-xl text-white">2</span>
            </div>
            <h2 className="text-2xl">プラン B</h2>
            <div>
              <span className="text-primary-500 text-3xl font-bold">￥5,990</span>
              <span className="pl-1 text-sm">(incl. TAX)/Month</span>
            </div>
            <p>
              Text description from admin <br />
              Text description from admin <br />
              Text description from admin <br />
              Text description from admin
            </p>
            <Button>Select</Button>
          </div>
          <div className="space-y-2 rounded-xl bg-white p-8 text-center">
            <div className="relative inline-block">
              <img className="inline" src="/icons/mark.svg" alt="mark" />
              <span className="absolute left-0 top-1.5 w-full text-center text-xl text-white">3</span>
            </div>
            <h2 className="text-2xl">プラン C</h2>
            <div>
              <span className="text-primary-500 text-3xl font-bold">￥4,990</span>
              <span className="pl-1 text-sm">(incl. TAX)/Month</span>
            </div>
            <p>
              Text description from admin <br />
              Text description from admin <br />
              Text description from admin <br />
              Text description from admin
            </p>
            <Button>Select</Button>
          </div>
          <div className="space-y-2 rounded-xl bg-white p-8 text-center">
            <div className="relative inline-block">
              <img className="inline" src="/icons/mark.svg" alt="mark" />
              <span className="absolute left-0 top-1.5 w-full text-center text-xl text-white">4</span>
            </div>
            <h2 className="text-2xl">プラン D</h2>
            <div>
              <span className="text-primary-500 text-3xl font-bold">￥3,990</span>
              <span className="pl-1 text-sm">(incl. TAX)/Month</span>
            </div>
            <p>
              Text description from admin <br />
              Text description from admin <br />
              Text description from admin <br />
              Text description from admin
            </p>
            <Button>Select</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({ props: { ...(await serverSideTranslations(locale, ['common'])) } });
