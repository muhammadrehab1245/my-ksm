import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Badge, Button, Stepper } from '@mantine/core';
import { usePlans } from '@/hooks/fetch';
import { store } from '@/utilities';
import { Skeleton } from '@/components';
import { useRouter } from 'next/router';

export default function SelectPlan() {
  const { t } = useTranslation();
  const { memberType } = store;
  const { data } = usePlans({ memberType });
  const { push } = useRouter();

  return (
    <div className="my-12">
      <Stepper active={1} allowNextStepsSelect={false} breakpoint="sm" classNames={{ steps: 'container' }}>
        <Stepper.Step label={t('basicInformation')} />
        <Stepper.Step label={t('selectPlan')} />
        <Stepper.Step label={t('checkOut')} />
      </Stepper>
      <div className="my-8 flex-col bg-gray-100">
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
          <div className="container relative z-10 -mt-8 grid gap-4 px-8 lg:grid-cols-2 xl:grid-cols-3">
            {data ? (
              data.map((item, index) => (
                <div className="space-y-2 rounded-xl bg-white p-8 text-center" key={index}>
                  <div className="relative inline-block">
                    <img className="inline" src="/icons/mark.svg" alt="mark" />
                    <span className="absolute left-0 top-1.5 w-full text-center text-xl text-white">{index + 1}</span>
                  </div>
                  <h2 className="text-2xl">{item?.name}</h2>
                  {item?.tags.map(({ name }, index) => (
                    <Badge className="mr-2 mb-2" key={index}>
                      {name}
                    </Badge>
                  ))}
                  <div>
                    <span className="text-3xl font-bold text-primary-500">￥{item?.monthlyFee}</span>
                    <span className="pl-1 text-sm">{t('afterPrice')}</span>
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: item?.description }} />
                  <Button
                    onClick={() => {
                      store.selectedPlan = item;
                      push('/checkout');
                    }}
                    className="mt-4"
                  >
                    {t('select')}
                  </Button>
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
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({ props: { ...(await serverSideTranslations(locale, ['common'])) } });
