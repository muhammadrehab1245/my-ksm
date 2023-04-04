import type { GetStaticProps } from 'next';
import type { Information } from '@/types';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { IMaskInput } from 'react-imask';
import { date, object, string } from 'yup';
import { DatePicker } from '@mantine/dates';
import { useForm, yupResolver } from '@mantine/form';
import { Button, Input, Radio, Select, Stepper, TextInput } from '@mantine/core';
import { useCountries, usePrefectures, useSearchZipcode } from '@/hooks/fetch';
import { countryCodes, http, store } from '@/utilities';
import { FiCalendar } from 'react-icons/fi';
import 'dayjs/locale/ja';
import clsx from 'clsx';

export default function Information() {
  const { t } = useTranslation();
  const { push } = useRouter();

  const { countries } = useCountries();
  const { prefectures } = usePrefectures();

  const schema = object({
    email: string().email(t('emailRequired')),
    firstName: string().required(t('required')),
    lastName: string().required(t('required')),
    gender: string().required(t('required')),
    dob: date().required(t('required')),
    nationality: string().required(t('required')),
    phone: string().min(1, t('required')).required(t('required')),
    zipCode: string().when('nationality', {
      is: (nationality: string) => nationality === 'JP',
      then: (schema) => schema.required(t('required')),
    }),
    address: string().when('nationality', {
      is: (nationality: string) => nationality === 'JP',
      then: (schema) => schema.required(t('required')),
    }),
  });

  const {
    onSubmit: handleSubmit,
    getInputProps: register,
    values,
    setFieldValue,
  } = useForm<Partial<Information>>({
    initialValues: store.information,
    validate: yupResolver(schema),
  });
  const onSubmit = handleSubmit((values) => {
    if (values?.email) {
      http('/auth/email-available', { params: { email: values.email } }).then(({ data }) => {
        if (data?.available === false) {
          toast.error(t('emailExist'));
        } else {
          http
            .post('/members/member-type/search', {
              firstName: values.firstName,
              lastName: values.lastName,
              dob: dayjs(values.dob).format('YYYY-MM-DD'),
            })
            .then(({ data }) => {
              store.memberType = data?.memberType;
              store.information = values;
              push('/select-plan');
            });
        }
      });
    } else {
      http
        .post('/members/member-type/search', { firstName: values.firstName, lastName: values.lastName, dob: dayjs(values.dob).format('YYYY-MM-DD') })
        .then(({ data }) => {
          store.memberType = data?.memberType;
          store.information = values;
          push('/select-plan');
        });
    }
  });

  const [zipSearch, setZipSearch] = useState(0);
  const [zipCode, setZipCode] = useState<string>();
  const { data: zipData } = useSearchZipcode(zipCode);
  useEffect(() => {
    setZipCode(values.zipCode);
  }, [zipSearch]);
  useEffect(() => {
    if (zipData?.prefecture) setFieldValue('prefecture', zipData?.prefecture);
    if (zipData?.municipality) setFieldValue('municipality', zipData?.municipality);
    if (zipData?.town) setFieldValue('address', zipData?.town);
  }, [zipData]);

  return (
    <div className="my-12">
      <Stepper active={0} allowNextStepsSelect={false} breakpoint="sm" classNames={{ steps: 'container' }}>
        <Stepper.Step label={t('basicInformation')} />
        <Stepper.Step label={t('selectPlan')} />
        <Stepper.Step label={t('checkOut')} />
      </Stepper>
      <form className="container my-8" onSubmit={onSubmit}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3>{t('basicInfo')}</h3>
            <div className="text-red-500">* {t('required')}</div>
          </div>
          <TextInput label={t('email')} placeholder={t('emailPlaceholder')} {...register('email')} />
          <div className="grid grid-cols-2 gap-4">
            <TextInput withAsterisk label={t('firstName')} placeholder={t('firstNamePlaceholder')} {...register('firstName')} />
            <TextInput withAsterisk label={t('lastName')} placeholder={t('lastNamePlaceholder')} {...register('lastName')} />
          </div>
          <Radio.Group withAsterisk label={t('gender')} {...register('gender')}>
            <Radio value="MALE" label={t('genderOptions.male')} />
            <Radio value="FEMALE" label={t('genderOptions.female')} />
            <Radio value="UNDISCLOSED" label={t('genderOptions.preferNotToSay')} />
          </Radio.Group>
          <DatePicker
            withAsterisk
            inputFormat="YYYY/MM/DD"
            labelFormat="YYYY/MM"
            label={t('dob')}
            placeholder={t('datePlaceholder')}
            locale="ja"
            icon={<FiCalendar />}
            {...register('dob')}
            maxDate={new Date()}
          />
          <div className="flex gap-4">
            <Select searchable withAsterisk label={t('phoneCountryCode')} data={countryCodes} {...register('phoneCountryCode')} />
            <Input.Wrapper className="flex-1" label=" " error={register('phone').error}>
              <IMaskInput
                // @ts-ignore
                className={clsx(
                  'mantine-Input-input mantine-TextInput-input mantine-1j89rho',
                  register('phone').error && 'border-red-500 placeholder-red-500',
                )}
                mask="00000000000"
                value={values.phone}
                unmask={true}
                onAccept={(value: any) => setFieldValue('phone', value)}
                placeholder={t('phone')}
              />
            </Input.Wrapper>
          </div>
          {countries && (
            <Select
              searchable
              withAsterisk
              label={t('nationality')}
              placeholder={t('selectPlaceholder')}
              data={countries}
              {...register('nationality')}
            />
          )}
          {values.nationality === 'JP' && (
            <>
              <Input.Wrapper withAsterisk label={t('zipCode')} error={register('zipCode').error}>
                <div className="flex gap-2">
                  <IMaskInput
                    // @ts-ignore
                    className={clsx(
                      'mantine-Input-input mantine-TextInput-input mantine-1j89rho w-48',
                      register('zipCode').error && 'border-red-500 placeholder-red-500',
                    )}
                    mask="0000000"
                    value={values.zipCode}
                    unmask={true}
                    onAccept={(value: any) => setFieldValue('zipCode', value)}
                    placeholder={t('zipCodePlaceholder')}
                  />
                  <Button size="sm" type="button" onClick={() => setZipSearch(Math.random())}>
                    {t('search')}
                  </Button>
                </div>
              </Input.Wrapper>
              {prefectures && (
                <Select searchable label={t('prefecture')} placeholder={t('selectPlaceholder')} data={prefectures} {...register('prefecture')} />
              )}
              <TextInput label={t('municipality')} {...register('municipality')} />
              <TextInput withAsterisk label={t('address')} placeholder={t('addressPlaceholder')} {...register('address')} />
            </>
          )}
          <Button fullWidth type="submit">
            {t('next')}
          </Button>
        </div>
      </form>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({ props: { ...(await serverSideTranslations(locale, ['common'])) } });
