import type { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { FiCheckCircle } from 'react-icons/fi';

export default function Success() {
  return (
    <div className="mx-auto my-12 max-w-1/3 rounded bg-white p-8">
      <div className="text-center">
        <FiCheckCircle className="inline text-green-500" size={50} />
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({ props: { ...(await serverSideTranslations(locale, ['common'])) } });
