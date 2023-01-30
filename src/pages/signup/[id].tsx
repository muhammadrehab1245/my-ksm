import type { GetServerSideProps } from 'next';
import type { Plan } from '@/types';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { DatePicker } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { useForm, yupResolver } from '@mantine/form';
import { Alert, Button, Modal, Radio, Select, TextInput } from '@mantine/core';
import { date, object, string } from 'yup';
import { usePlans } from '@/hooks/fetch';
import { countries, http } from '@/utilities';
import { Skeleton } from '@/components';
import { FiCalendar, FiCheckCircle, FiChevronRight } from 'react-icons/fi';
import 'dayjs/locale/ja';

export default function Signup() {
  const { t } = useTranslation();
  const { query, push } = useRouter();
  const { data } = usePlans();
  const [plan, setPlan] = useState<Plan>();
  const [opened, { toggle }] = useDisclosure(false);

  useEffect(() => {
    if (data && query.id) {
      const plan = data.find(({ id }) => id == query.id);
      setPlan(plan);
    }
  }, [data, query.id]);

  const schema = object({
    email: string().email(t('emailRequired')).required(t('required')),
    firstName: string().required(t('required')),
    lastName: string().required(t('required')),
    gender: string().required(t('required')),
    dob: date().required(t('required')),
    nationality: string().required(t('required')),
    phone: string().required(t('required')),
    paymentMethod: string().required(t('required')),
    zipCode: string().when('nationality', { is: (nat: string) => nat === 'JP', then: (schema) => schema.required(t('required')) }),
    address: string().when('nationality', { is: (nat: string) => nat === 'JP', then: (schema) => schema.required(t('required')) }),
    cardNumber: string().when('paymentMethod', { is: (pm: string) => pm === 'card', then: (schema) => schema.required(t('required')) }),
    expiryDate: string().when('paymentMethod', { is: (pm: string) => pm === 'card', then: (schema) => schema.required(t('required')) }),
    cvv: string().when('paymentMethod', { is: (pm: string) => pm === 'card', then: (schema) => schema.required(t('required')) }),
    cardholderName: string().when('paymentMethod', { is: (pm: string) => pm === 'card', then: (schema) => schema.required(t('required')) }),
  });

  const {
    onSubmit: handleSubmit,
    getInputProps: register,
    values,
    setFieldValue,
  } = useForm({
    initialValues: {
      email: '',
      firstName: '',
      lastName: '',
      nationality: 'JP',
      gender: 'MALE',
      dob: undefined,
      phone: '',
      zipCode: '',
      address: '',
      paymentMethod: 'card',
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
    const { email, firstName, lastName, dob, gender, nationality, zipCode, phone, address } = values;

    const data = {
      email,
      firstName,
      lastName,
      gender,
      dob,
      phone,
      nationality,
      zipCode,
      address,
      paymentMethod,
      planId: query.id,
      orgId: process.env.NEXT_PUBLIC_HOTUS_ORG_ID,
    };

    if (paymentMethod === 'card') {
      window.Multipayment.init(process.env.NEXT_PUBLIC_GMO_SHOP_ID);
      window.Multipayment.getToken(
        {
          cardno: cardNumber,
          expire: expiryDate,
          securitycode: cvv,
          holdername: cardholderName,
        },
        function ({ resultCode, tokenObject: { token } }: { resultCode: string; tokenObject: { token: string } }) {
          if (resultCode != '000') {
            toast.error(t('cardError'));
          } else {
            http
              .post('/organizations/public/subscribe', { ...data, cardToken: token })
              .then(() => {
                toast.success(t('itemAdded'));
                push('/success');
              })
              .catch((error) => toast.error(error.message));
          }
        },
      );
    } else {
      http
        .post('/organizations/public/subscribe', data)
        .then(() => {
          toast.success(t('itemAdded'));
          push('/success');
        })
        .catch((error) => toast.error(error.message));
    }
  });

  return (
    <div className="container py-12">
      <form onSubmit={onSubmit}>
        <div className="grid gap-20 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="text-right text-red-500">* {t('required')}</div>
            <h3 className="h5">{t('basicInfo')}</h3>
            <TextInput withAsterisk label={t('email')} placeholder={t('emailPlaceholder')} {...register('email')} />
            <div className="grid grid-cols-2 gap-4">
              <TextInput withAsterisk label={t('firstName')} placeholder={t('firstNamePlaceholder')} {...register('firstName')} />
              <TextInput withAsterisk label={t('lastName')} placeholder={t('lastNamePlaceholder')} {...register('lastName')} />
            </div>
            <Radio.Group withAsterisk label={t('gender')} {...register('gender')}>
              <Radio value="MALE" label={t('genderOptions.male')} />
              <Radio value="FEMALE" label={t('genderOptions.female')} />
              <Radio value="UNDISCLOSED" label={t('genderOptions.preferNotToSay')} />
            </Radio.Group>
            <DatePicker withAsterisk label={t('dob')} placeholder={t('datePlaceholder')} locale="ja" icon={<FiCalendar />} {...register('dob')} />
            <TextInput withAsterisk label={t('phone')} placeholder={t('phone')} {...register('phone')} />
            <Select
              searchable
              withAsterisk
              label={t('nationality')}
              placeholder={t('selectPlaceholder')}
              data={countries}
              {...register('nationality')}
            />
            {values.nationality === 'JP' && (
              <div className="flex gap-4">
                <TextInput withAsterisk label={t('zipCode')} placeholder={t('zipCodePlaceholder')} {...register('zipCode')} />
                <TextInput className="flex-1" withAsterisk label={t('address')} placeholder={t('addressPlaceholder')} {...register('address')} />
              </div>
            )}
            <h3 className="h5">{t('paymentInformation')}</h3>
            <Radio value="card" checked={values.paymentMethod === 'card'} label={t('creditCard')} onChange={register('paymentMethod').onChange} />
            {values.paymentMethod === 'card' && (
              <div className="ml-8 space-y-2">
                <TextInput withAsterisk label={t('cardNumber')} placeholder={t('cardNumberPlaceholder')} {...register('cardNumber')} />
                <div className="flex gap-2">
                  <TextInput withAsterisk label={t('expiryDate')} placeholder={t('expiryDatePlaceholder')} {...register('expiryDate')} />
                  <TextInput withAsterisk label={t('cvv')} placeholder={t('cvvPlaceholder')} {...register('cvv')} />
                </div>
                <TextInput withAsterisk label={t('cardholderName')} placeholder={t('cardholderNamePlaceholder')} {...register('cardholderName')} />
              </div>
            )}
            <Radio value="bank" checked={values.paymentMethod === 'bank'} label={t('bankTransfer')} onChange={register('paymentMethod').onChange} />
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
            <Modal opened={opened} onClose={toggle} title={t('termsAndConditions')} size="lg" classNames={{ title: 'h3' }} centered>
              <Alert>{t('agreeAndContinue')}</Alert>
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
          </div>
          <div>
            {plan ? (
              <div className="rounded-xl bg-white p-4 shadow">
                <h4 className="font-semibold">{t('orderSummary')}</h4>
                {/*<div className="flex justify-between">
                  <div>Subtotal:</div>
                  <div className="font-bold">9,000円</div>
                </div>*/}
                <div className="flex justify-between">
                  <div>{t('initialSetupFee')}:</div>
                  <div>{plan.initialAdmissionFee}円</div>
                </div>
                <div className="flex justify-between">
                  <div>{t('handlingFee')}:</div>
                  <div>{plan.initialAdminFee}円</div>
                </div>
                <div className="flex justify-between">
                  <div>{t('monthlyFee')}:</div>
                  <div>{plan.monthlyFee}円</div>
                </div>
                <div className="flex justify-between">
                  <div>{t('VAT')}:</div>
                  <div>-</div>
                </div>
                <div className="mt-4 mb-4 flex justify-between border-t border-gray-300 pt-4 text-xl font-semibold">
                  <div>{t('total')}:</div>
                  <div>{plan.initialAdmissionFee + plan.initialAdminFee + plan.monthlyFee}円</div>
                </div>
                <Button fullWidth type="submit" disabled={values.acceptTos === false}>
                  {t('register')}
                </Button>
              </div>
            ) : (
              <Skeleton />
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({ props: { ...(await serverSideTranslations(locale, ['common'])) } });
