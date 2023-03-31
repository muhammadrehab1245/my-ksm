import type { GetStaticProps } from 'next';
import { Coupon, Plan } from '@/types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { date, object, string } from 'yup';
import { DatePicker } from '@mantine/dates';
import { useForm, yupResolver } from '@mantine/form';
import { Badge, Button, Input, Radio, Select, Stepper, TextInput } from '@mantine/core';
import { useCountries, useCoupon, useDetectRule, useMemberCalculateFeeDetail, usePlans, usePrefectures, useSearchZipcode } from '@/hooks/fetch';
import { countryCodes, http } from '@/utilities';
import { PaymentForm, Skeleton } from '@/components';
import { FiCalendar } from 'react-icons/fi';
import 'dayjs/locale/ja';

export default function Subscription() {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<Plan>();
  const [memberType, setMemberType] = useState();
  const { data } = usePlans({ memberType });
  const nextStep = () => setActive((current) => (current < 3 ? current + 1 : current));
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  const [tempCouponCode, setTempCouponCode] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState<Coupon>();

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
      prefecture: '',
      municipality: '',
      address: '',
    },
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
              setMemberType(data?.memberType);
              nextStep();
            });
        }
      });
    } else {
      http
        .post('/members/member-type/search', { firstName: values.firstName, lastName: values.lastName, dob: dayjs(values.dob).format('YYYY-MM-DD') })
        .then(({ data }) => {
          setMemberType(data?.memberType);
          nextStep();
        });
    }
  });

  const [nationality, setNationality] = useState<string | undefined>();
  useEffect(() => {
    setNationality(countries?.find(({ value }) => value === values?.nationality)?.label);
  }, [countries]);

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

  const { data: planData } = useMemberCalculateFeeDetail(selectedPlan?.id, values.email);
  const { data: rule, isLoading } = useDetectRule({ planId: selectedPlan, amount: planData?.totalAmount });
  const { data: coupon } = useCoupon({ planId: selectedPlan, amount: planData?.totalAmount, couponCode, quantity: 1 });

  useEffect(() => {
    if (rule) {
      setCouponData(rule);
    } else if (coupon?.ruleType) {
      setCouponData(coupon);
      toast.success(t('couponApplied'));
    } else if (coupon?.error) {
      toast.error(coupon?.stack);
    } else {
      setCouponData(null);
    }
  }, [rule, coupon]);

  return (
    <div className="my-12">
      <Stepper active={active} onStepClick={setActive} allowNextStepsSelect={false} breakpoint="sm" classNames={{ steps: 'container' }}>
        <Stepper.Step label={t('basicInformation')}>
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
                <Select searchable label={t('prefecture')} placeholder={t('selectPlaceholder')} data={prefectures} {...register('prefecture')} />
              )}
              <TextInput label={t('municipality')} {...register('municipality')} />
              <TextInput withAsterisk label={t('address')} placeholder={t('addressPlaceholder')} {...register('address')} />
              <Button fullWidth type="submit">
                {t('next')}
              </Button>
            </div>
          </form>
        </Stepper.Step>
        <Stepper.Step label={t('selectPlan')}>
          <div className="mb-8 flex-col bg-gray-100">
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
                          setSelectedPlan(item);
                          nextStep();
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
        </Stepper.Step>
        <Stepper.Step label={t('checkOut')}>
          <div className="container grid gap-y-4 gap-x-8 lg:grid-cols-2">
            <div className="col-span-full">
              <h3 className="h5">{t('basicInfo')}</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-4 bg-white p-4">
                <div>
                  <div className="text-xs">{t('name')}</div>
                  <div className="text-xl font-semibold">
                    {values.firstName} {values.lastName}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs">{t('gender')}</div>
                    <div>{t(values.gender)}</div>
                  </div>
                  <div>
                    <div className="text-xs">{t('dob')}</div>
                    <div>{dayjs(values.dob).format('YYYY/MM/DD')}</div>
                  </div>
                </div>
                {values?.email && (
                  <div>
                    <div className="text-xs">{t('email')}</div>
                    <div>{t(values?.email)}</div>
                  </div>
                )}
                <div>
                  <div className="text-xs">{t('phone')}</div>
                  <div>
                    {values.phoneCountryCode} {values.phone}
                  </div>
                </div>
                <div>
                  <div className="text-xs">{t('nationality')}</div>
                  <div>{nationality}</div>
                </div>
                <div>
                  <div className="text-xs">{t('address')}</div>
                  <div>
                    {values?.zipCode} {values?.prefecture} {values?.municipality} {values?.address}
                  </div>
                </div>
              </div>
              <h3 className="h5">{t('selectedPlan')}</h3>
              <div className="flex justify-between space-y-4 bg-white p-4">
                <div>
                  <h3>{selectedPlan?.name}</h3>
                  <div>
                    {selectedPlan?.tags.map(({ name }, index) => (
                      <Badge className="mr-2 mb-2" key={index}>
                        {name}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-red-500">{planData?.totalAmount}円</h3>
                </div>
              </div>
              <PaymentForm info={values} planId={selectedPlan?.id} />
            </div>
            <div>
              {planData ? (
                <div className="rounded-xl bg-white p-4 shadow">
                  <h4 className="font-semibold">{t('orderSummary')}</h4>
                  <div className="flex justify-between">
                    <div>{t('initialSetupFee')}:</div>
                    <div>{planData.initialAdmissionFee}円</div>
                  </div>
                  <div className="flex justify-between">
                    <div>{t('handlingFee')}:</div>
                    <div>{planData.initialAdminFee}円</div>
                  </div>
                  <div className="flex justify-between">
                    <div>{t('monthlyFee')}:</div>
                    <div>{planData.monthlyFeeRemaining}円</div>
                  </div>
                  {couponData && (
                    <div className="flex justify-between">
                      <div>
                        {t('discount')}
                        {couponData?.discountType === 'PERCENTAGE' && `(${couponData?.discountValue}%)`}:
                      </div>
                      <div>
                        -
                        {couponData?.discountType === 'PERCENTAGE'
                          ? Math.round((couponData?.discountValue / 100) * planData.totalAmount)
                          : couponData.discountValue}
                        円
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <div>{t('VAT')}:</div>
                    <div>-</div>
                  </div>
                  {!rule && (
                    <>
                      <div className="mt-2 flex space-x-2">
                        <TextInput
                          className="flex-1"
                          placeholder={t('couponPlaceholder')}
                          onChange={({ currentTarget }) => setTempCouponCode(currentTarget.value)}
                        />
                        <Button type="button" size="sm" onClick={() => setCouponCode(tempCouponCode)}>
                          {t('submitCoupon')}
                        </Button>
                      </div>
                    </>
                  )}
                  <div className="mt-4 mb-4 flex justify-between border-t border-gray-300 pt-4 text-xl font-semibold">
                    <div>{t('total')}:</div>
                    <div>
                      {planData.totalAmount -
                        (couponData?.discountType === 'PERCENTAGE'
                          ? Math.round((couponData?.discountValue / 100) * planData.totalAmount)
                          : couponData?.discountValue || 0)}
                      円
                    </div>
                  </div>
                </div>
              ) : (
                <Skeleton />
              )}
            </div>
          </div>
        </Stepper.Step>
      </Stepper>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({ props: { ...(await serverSideTranslations(locale, ['common'])) } });
