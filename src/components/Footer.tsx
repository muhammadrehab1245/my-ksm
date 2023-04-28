import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { IconExternalLink } from '@tabler/icons';

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="container flex flex-wrap justify-between py-3">
      <ul className="flex flex-wrap space-x-4">
        <li>
          <Link className="flex items-center hover:underline" href="/hotus/privacy-policy" target="_blank">
            {t('privacyPolicy')}
            <IconExternalLink className="ml-1 inline" size={20} stroke={1} />
          </Link>
        </li>
        <li>
          <Link className="flex items-center hover:underline" href="/hotus/terms-and-conditions" target="_blank">
            {t('termsAndConditions')}
            <IconExternalLink className="ml-1 inline" size={20} stroke={1} />
          </Link>
        </li>
        <li>
          <Link className="flex items-center hover:underline" href="https://watashino-koshimizu.jp/tokushohou" target="_blank">
            {t('guideForSpecifiedCommercialTransactionsAct')}
            <IconExternalLink className="ml-1 inline" size={20} stroke={1} />
          </Link>
        </li>
      </ul>
      <div>&copy; {new Date().getFullYear()}. 特定非営利活動法人グラウンドワークこしみず</div>
    </footer>
  );
};
