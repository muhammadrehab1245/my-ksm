import type { FC } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { MaskedRange } from 'imask';
import toast from 'react-hot-toast';
import { object, string } from 'yup';
import { IMaskInput } from 'react-imask';
import { useDisclosure } from '@mantine/hooks';
import { useForm, yupResolver } from '@mantine/form';
import { Alert, Button, Input, Modal, Radio } from '@mantine/core';
import { http, info, store } from '@/utilities';
import TermsAndConditions from '@/pages/hotus/terms-and-conditions';
import { FiCheckCircle, FiChevronRight } from 'react-icons/fi';

export const PaymentForm: FC<{ couponCode?: string }> = ({ couponCode }) => {
  const { t } = useTranslation();
  const { push } = useRouter();
  const { information, selectedPlan } = store;
  const [loading, setLoading] = useState(false);

  const [opened, { toggle }] = useDisclosure(false);

  const schema = object({
    paymentMethod: string().required(t('required')),
    cardNumber: string().when('paymentMethod', {
      is: (pm: string) => pm === 'CARD',
      then: (schema) => schema.required(t('required')).min(14, t('required')),
    }),
    expiryDate: string().when('paymentMethod', {
      is: (pm: string) => pm === 'CARD',
      then: (schema) => schema.required(t('required')).min(4, t('required')),
    }),
    cvv: string().when('paymentMethod', {
      is: (pm: string) => pm === 'CARD',
      then: (schema) => schema.required(t('required')).min(3, t('required')),
    }),
    cardholderName: string().when('paymentMethod', {
      is: (pm: string) => pm === 'CARD',
      then: (schema) => schema.required(t('required')),
    }),
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

  // @ts-ignore
  const onSubmit = handleSubmit((values) => {
    if (values.paymentMethod === 'CARD' && dayjs(`20${values.expiryDate.substring(2)}-${values.expiryDate.substring(0, 2)}`).isBefore(new Date())) {
      return toast.error(t('invalidCardExpiryDate'));
    }

    const { paymentMethod, cardNumber, expiryDate, cvv, cardholderName } = values;

    const data = {
      ...information,
      planId: selectedPlan?.id,
      paymentMethod,
      couponCode,
      orgId: process.env.NEXT_PUBLIC_HOTUS_ORG_ID,
    };

    const onfulfilled = async ({ data }: { data: any }) => {
      console.log('new res:', data);
      toast.success(t('successfullyRegistered'));
      store.userInfo = data;
      store.information = info;
      store.memberType = '';

      if (paymentMethod === 'CARD') {
        if (data.paymentDone) {
          http
            .post(`organizations/public/post-payment-subscribe?subscriptionId=${data.subscriptionId}&success=${data.paymentDone}`, {})
            .then((response) => {
              store.userInfo = response.data;
              push('/success');
            });
        } else if (!data.redirectUrl || data.redirectUrl === '') {
          http.post(`organizations/public/post-payment-subscribe?subscriptionId=${data.subscriptionId}&success=${false}`, {}).then((response) => {
            store.userInfo = response.data;
            push('/failure');
          });
        } else {
          sessionStorage.setItem('subscriptionId', data.subscriptionId);
          push(data.redirectUrl).then(() => setLoading(false));
        }
        setLoading(false);
      } else {
        push('/success').then(() => setLoading(false));
      }
    };

    if (paymentMethod === 'CARD') {
      // @ts-ignore
      window.Multipayment.init(process.env.NEXT_PUBLIC_GMO_SHOP_ID);
      // @ts-ignore
      window.Multipayment.getToken(
        {
          cardno: cardNumber,
          expire: `20${expiryDate.substring(2)}${expiryDate.substring(0, 2)}`,
          securitycode: cvv,
          holdername: cardholderName,
        },
        function ({ resultCode, tokenObject }: { resultCode: string; tokenObject: { token: string } }) {
          if (resultCode != '000') {
            setLoading(false);
            toast.error(t('cardError'));
          } else {
            setLoading(true);
            http
              .post(`/organizations/public/subscribe-new?callBackUrl=${location.origin}/api/callback`, { ...data, cardToken: tokenObject?.token })
              .then(onfulfilled)
              .catch((error) => {
                toast.error(error?.response?.data?.stack || error.message);
                setLoading(false);
              });
          }
        },
      );
    } else {
      setLoading(true);
      http
        .post('/organizations/public/subscribe', data)
        .then(onfulfilled)
        .catch((error) => {
          setLoading(false);
          toast.error(error?.response?.data?.stack || error.message);
        });
    }
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <h3 className="h5">{t('paymentInformation')}</h3>
      <Radio value="CARD" checked={values.paymentMethod === 'CARD'} label={t('creditCard')} onChange={register('paymentMethod').onChange} />
      <div className={clsx('ml-8 space-y-2', values.paymentMethod === 'CARD' ? 'block' : 'hidden')}>
        <Input.Wrapper withAsterisk label={t('cardNumber')} error={register('cardNumber').error}>
          <IMaskInput
            // @ts-ignore
            className={clsx(
              'mantine-Input-input mantine-TextInput-input mantine-1j89rho',
              register('cardNumber').error && 'border-red-500 placeholder-red-500',
            )}
            mask="0000 0000 0000 0000"
            unmask={true}
            onAccept={(value: any) => setFieldValue('cardNumber', value)}
            placeholder={t('cardNumberPlaceholder')}
          />
        </Input.Wrapper>
        <div className="flex gap-2">
          <Input.Wrapper withAsterisk label={t('expiryDate')} error={register('expiryDate').error}>
            <IMaskInput
              // @ts-ignore
              className={clsx(
                'mantine-Input-input mantine-TextInput-input mantine-1j89rho',
                register('expiryDate').error && 'border-red-500 placeholder-red-500',
              )}
              mask="m/y"
              blocks={{
                m: { mask: MaskedRange, from: 1, to: 12 },
                y: { mask: MaskedRange, from: 10, to: 99 },
              }}
              unmask={true}
              onAccept={(value: any) => setFieldValue('expiryDate', value)}
              placeholder={t('expiryDatePlaceholder')}
            />
          </Input.Wrapper>
          <Input.Wrapper withAsterisk label={t('cvv')} error={register('cvv').error}>
            <IMaskInput
              // @ts-ignore
              className={clsx(
                'mantine-Input-input mantine-TextInput-input mantine-1j89rho',
                register('cvv').error && 'border-red-500 placeholder-red-500',
              )}
              mask={/^[0-9]{1,4}$/}
              unmask={true}
              onAccept={(value: any) => setFieldValue('cvv', value)}
              placeholder={t('cvvPlaceholder')}
            />
          </Input.Wrapper>
        </div>
        <Input.Wrapper withAsterisk label={t('cardholderName')} error={register('cardholderName').error}>
          <IMaskInput
            // @ts-ignore
            className={clsx(
              'mantine-Input-input mantine-TextInput-input mantine-1j89rho',
              register('cardholderName').error && 'border-red-500 placeholder-red-500',
            )}
            mask={/^[A-Za-z ]+$/}
            unmask={true}
            onAccept={(value: any) => setFieldValue('cardholderName', value)}
            placeholder={t('cardholderNamePlaceholder')}
          />
        </Input.Wrapper>
      </div>
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
      <Modal opened={opened} onClose={toggle} title={t('termsAndConditions')} size="70vw" classNames={{ title: 'h3' }} centered>
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
      <Button fullWidth type="submit" loading={loading} disabled={values.acceptTos === false}>
        {t('register')}
      </Button>
    </form>
  );
};
