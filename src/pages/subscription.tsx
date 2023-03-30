import type { GetStaticProps } from 'next';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { date, object, string } from 'yup';
import { DatePicker } from '@mantine/dates';
import { useForm, yupResolver } from '@mantine/form';
import { Badge, Button, Input, Radio, Select, Stepper, TextInput } from '@mantine/core';
import { useCountries, usePlans, usePrefectures, useSearchZipcode } from '@/hooks/fetch';
import { countryCodes, http } from '@/utilities';
import { Skeleton } from '@/components';
import { FiCalendar } from 'react-icons/fi';

export default function Subscription() {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const [memberType, setMemberType] = useState();
  const { data } = usePlans({ memberType });
  const nextStep = () => setActive((current) => (current < 3 ? current + 1 : current));
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  const { countries } = useCountries();
  const { prefectures } = usePrefectures();

  const schema = object({
    email: string().email(t('emailRequired')),
    firstName: string().required(t('required')),
    lastName: string().required(t('required')),
    gender: string().required(t('required')),
    dob: date().required(t('required')),
    nationality: string().required(t('required')),
    phone: string().required(t('required')),
    zipCode: string().required(t('required')),
    municipality: string().required(t('required')),
    address: string().required(t('required')),
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
      phoneCountryCode: '+81',
      zipCode: '',
      address: '',
    },
    validate: yupResolver(schema),
  });
  const onSubmit = handleSubmit((values) => {
    const data = { firstName: values.firstName, lastName: values.lastName, dob: dayjs(values.dob).format('YYYY-MM-DD') };
    if (values?.email) {
      http('/auth/email-available', { params: { email: values.email } }).then(({ data }) => {
        if (data?.available === false) {
          toast.error(t('emailExist'));
        } else {
          http.post('/members/member-type/search', data).then(({ data }) => {
            setMemberType(data?.memberType);
            nextStep();
          });
        }
      });
    } else {
      http.post('/members/member-type/search', data).then(({ data }) => {
        setMemberType(data?.memberType);
        nextStep();
      });
    }
  });

  const [zipSearch, setZipSearch] = useState(0);
  const [zipCode, setZipCode] = useState('');
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
    <div className="container my-12 lg:max-w-1/2">
      <Stepper active={active} onStepClick={setActive} allowNextStepsSelect={false} breakpoint="sm">
        <Stepper.Step label="Basic information">
          <form className="my-8" onSubmit={onSubmit}>
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
                label={t('dob')}
                placeholder={t('datePlaceholder')}
                locale="ja"
                icon={<FiCalendar />}
                {...register('dob')}
                maxDate={new Date()}
              />
              <div className="flex gap-4">
                <Select searchable withAsterisk label={t('phoneCountryCode')} data={countryCodes} {...register('phoneCountryCode')} />
                <TextInput className="flex-1" withAsterisk label={t('phone')} placeholder={t('phone')} {...register('phone')} />
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
              <Input.Wrapper withAsterisk label={t('zipCode')}>
                <div className="flex gap-2">
                  <TextInput placeholder={t('zipCodePlaceholder')} {...register('zipCode')} />
                  <Button size="sm" type="button" onClick={() => setZipSearch(Math.random())}>
                    {t('search')}
                  </Button>
                </div>
              </Input.Wrapper>
              {prefectures && (
                <Select
                  searchable
                  withAsterisk
                  label={t('prefecture')}
                  placeholder={t('selectPlaceholder')}
                  data={prefectures}
                  {...register('prefecture')}
                />
              )}
              <TextInput withAsterisk label={t('municipality')} {...register('municipality')} />
              <TextInput withAsterisk label={t('address')} placeholder={t('addressPlaceholder')} {...register('address')} />
              <Button type="submit">Next step</Button>
            </div>
          </form>
        </Stepper.Step>
        <Stepper.Step label="Select plan">
          <div className="mb-8 ml-[50%] flex w-[100vw] -translate-x-[50vw] flex-col bg-gray-100">
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
              <div className="relative z-10 mx-auto -mt-8 grid max-w-[1400px] gap-4 px-8 lg:grid-cols-2 xl:grid-cols-4">
                {data ? (
                  data.map(({ id, name, monthlyFee, description, code, tags }, index) => (
                    <div className="space-y-2 rounded-xl bg-white p-8 text-center" key={index}>
                      <div className="relative inline-block">
                        <img className="inline" src="/icons/mark.svg" alt="mark" />
                        <span className="absolute left-0 top-1.5 w-full text-center text-xl text-white">{index + 1}</span>
                      </div>
                      <h2 className="text-2xl">{name}</h2>
                      {tags.map(({ name }, index) => (
                        <Badge className="mr-2 mb-2" key={index}>
                          {name}
                        </Badge>
                      ))}

                      <div>
                        <span className="text-3xl font-bold text-primary-500">￥{monthlyFee}</span>
                        <span className="pl-1 text-sm">{t('afterPrice')}</span>
                      </div>
                      <div dangerouslySetInnerHTML={{ __html: description }} />
                      <Link className="mt-4 inline-block" href={`/signup/${id}`}>
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
        </Stepper.Step>
        <Stepper.Step label="Check out">Step 3 content: Get full access</Stepper.Step>
      </Stepper>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({ props: { ...(await serverSideTranslations(locale, ['common'])) } });
