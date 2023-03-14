import type { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { FiCheckCircle } from 'react-icons/fi';
import { useTranslation } from 'next-i18next';
import { useSnapshot } from 'valtio';
import { store } from '@/utilities';

export default function Success() {
  const { t } = useTranslation();
  const { userInfo } = useSnapshot(store);

  return (
    <div className="mx-auto my-12 max-w-1/3 rounded bg-white p-8">
      <div className="text-center">
        <FiCheckCircle className="inline text-green-500" size={50} />
        <h4 className="my-4 border-b-2 border-gray-300 pb-4">{t('successfullyRegistered')}</h4>
        <div className="space-y-4 text-left">
          <div>
            <div className="text-xs">{t('memberNo')}</div>
            <div>{userInfo?.subscription?.memberNo}</div>
          </div>
          <div>
            <div className="text-xs">{t('name')}</div>
            <div>
              {userInfo?.user?.firstName} {userInfo?.user?.lastName}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs">{t('gender')}</div>
              <div>{userInfo?.user?.gender}</div>
            </div>
            <div>
              <div className="text-xs">{t('dob')}</div>
              <div>{userInfo?.user?.dob}</div>
            </div>
          </div>
          <div>
            <div className="text-xs">{t('phone')}</div>
            <div>{userInfo?.user?.phone}</div>
          </div>
          <div>
            <div className="text-xs">{t('nationality')}</div>
            <div>{userInfo?.user?.nationality}</div>
          </div>
          <div>
            <div className="text-xs">{t('address')}</div>
            <div>{userInfo?.user?.zipCode}</div>
            <div>{userInfo?.user?.address}</div>
          </div>
          <div>
            <div className="text-xs">{t('paymentMethod')}</div>
            <div>{userInfo?.user?.cardRegistered ? t('card') : t('transfer')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({ props: { ...(await serverSideTranslations(locale, ['common'])) } });
