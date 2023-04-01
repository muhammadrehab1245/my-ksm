import { FC, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import clsx from 'clsx';
import IMask, { MaskedRange } from 'imask';
import toast from 'react-hot-toast';
import { object, string } from 'yup';
import { IMaskInput } from 'react-imask';
import { useDisclosure } from '@mantine/hooks';
import { useForm, yupResolver } from '@mantine/form';
import { Alert, Button, Input, Modal, Radio, TextInput } from '@mantine/core';
import { http, store } from '@/utilities';
import { FiCheckCircle, FiChevronRight } from 'react-icons/fi';
import TermsAndConditions from '@/pages/hotus/terms-and-conditions';

export const PaymentForm: FC<{ couponCode?: string }> = ({ couponCode }) => {
  const { t } = useTranslation();
  const { push } = useRouter();
  const { information, selectedPlan } = store;

  const [opened, { toggle }] = useDisclosure(false);

  const expiryDate = useRef(null);

  useEffect(() => {
    // @ts-ignore
    IMask(expiryDate.current, {
      mask: 'm/y',
      blocks: {
        m: { mask: MaskedRange, from: 1, to: 12 },
        y: { mask: MaskedRange, from: 10, to: 99 },
      },
    });
  }, []);

  const schema = object({
    paymentMethod: string().required(t('required')),
    cardNumber: string().when('paymentMethod', { is: (pm: string) => pm === 'CARD', then: (schema) => schema.required(t('required')) }),
    expiryDate: string().when('paymentMethod', {
      is: (pm: string) => pm === 'CARD',
      then: (schema) => schema.required(t('required')).min(5, t('required')),
    }),
    cvv: string().when('paymentMethod', { is: (pm: string) => pm === 'CARD', then: (schema) => schema.required(t('required')) }),
    cardholderName: string().when('paymentMethod', { is: (pm: string) => pm === 'CARD', then: (schema) => schema.required(t('required')) }),
  });

  const {
    onSubmit: handleSubmit,
    getInputProps: register,
    values,
    setFieldValue,
  } = useForm({
    initialValues: {
      paymentMethod: 'CARD',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: '',
      acceptTos: false,
    },
    validate: yupResolver(schema),
  });

  const onSubmit = handleSubmit((values) => {
    const { paymentMethod, cardNumber, expiryDate, cvv, cardholderName } = values;

    const data = {
      ...information,
      planId: selectedPlan?.id,
      paymentMethod,
      couponCode,
      orgId: process.env.NEXT_PUBLIC_HOTUS_ORG_ID,
    };

    if (paymentMethod === 'CARD') {
      let expire = expiryDate.split('/');

      // @ts-ignore
      window.Multipayment.init(process.env.NEXT_PUBLIC_GMO_SHOP_ID);
      // @ts-ignore
      window.Multipayment.getToken(
        {
          cardno: cardNumber,
          expire: `20${expire[1]}${expire[0]}`,
          securitycode: cvv,
          holdername: cardholderName,
        },
        function ({ resultCode, tokenObject }: { resultCode: string; tokenObject: { token: string } }) {
          if (resultCode != '000') {
            toast.error(t('cardError'));
          } else {
            http
              .post('/organizations/public/subscribe', { ...data, cardToken: tokenObject?.token })
              .then(({ data }) => {
                toast.success(t('successfullyRegistered'));
                store.userInfo = data;
                push('/success');
              })
              .catch((error) => toast.error(error?.response?.data?.stack || error.message));
          }
        },
      );
    } else {
      http
        .post('/organizations/public/subscribe', data)
        .then(({ data }) => {
          toast.success(t('successfullyRegistered'));
          store.userInfo = data;
          push('/success');
        })
        .catch((error) => toast.error(error?.response?.data?.stack || error.message));
    }
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <h3 className="h5">{t('paymentInformation')}</h3>
      <Radio value="CARD" checked={values.paymentMethod === 'CARD'} label={t('creditCard')} onChange={register('paymentMethod').onChange} />
      {values.paymentMethod === 'CARD' && (
        <div className="ml-8 space-y-2">
          <Input.Wrapper withAsterisk label={t('cardNumber')}>
            <IMaskInput
              className="mantine-Input-input mantine-TextInput-input mantine-1j89rho"
              mask="0000 0000 0000 0000"
              unmask={true}
              onAccept={(value, mask) => setFieldValue('cardNumber', value)}
              placeholder={t('cardNumberPlaceholder')}
            />
          </Input.Wrapper>
          <div className="flex gap-2">
            <TextInput ref={expiryDate} withAsterisk label={t('expiryDate')} placeholder={t('expiryDatePlaceholder')} {...register('expiryDate')} />
            <Input.Wrapper withAsterisk label={t('cvv')}>
              <IMaskInput
                className="mantine-Input-input mantine-TextInput-input mantine-1j89rho"
                mask={Number}
                min={0}
                max={9999}
                unmask={true}
                onAccept={(value, mask) => setFieldValue('cvv', value)}
                placeholder={t('cvvPlaceholder')}
              />
            </Input.Wrapper>
          </div>
          <TextInput withAsterisk label={t('cardholderName')} placeholder={t('cardholderNamePlaceholder')} {...register('cardholderName')} />
        </div>
      )}
      <Radio value="TRANSFER" checked={values.paymentMethod === 'TRANSFER'} label={t('bankTransfer')} onChange={register('paymentMethod').onChange} />
      <h3 className="h5">{t('termsAndConditions')}</h3>
      <button
        className={clsx(
          'flex w-full items-center justify-between rounded border bg-white px-4 py-3 hover:border-blue-500',
          values.acceptTos === true ? 'border-green-500' : 'border-gray-300',
        )}
        type="button"
        onClick={toggle}
      >
        <span className="flex items-center gap-2">
          <FiCheckCircle className={clsx(values.acceptTos === true && 'text-green-500')} />
          {t('confirmAndAgreeTnc')}
          <span className="text-red-500" aria-hidden="true">
            *
          </span>
        </span>
        <FiChevronRight />
      </button>
      <Modal opened={opened} onClose={toggle} title={t('termsAndConditions')} size="xl" classNames={{ title: 'h3' }} centered>
        <Alert>
          <TermsAndConditions />
        </Alert>
        <Button
          onClick={() => {
            setFieldValue('acceptTos', true);
            toggle();
          }}
          className="mt-4"
          fullWidth
          type="button"
        >
          {t('agreeAndContinue')}
        </Button>
      </Modal>
      <Button fullWidth type="submit" disabled={values.acceptTos === false}>
        {t('register')}
      </Button>
    </form>
  );
};
