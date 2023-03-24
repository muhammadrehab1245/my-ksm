import type { GetServerSideProps } from 'next';
import type { Coupon } from '@/types';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import clsx from 'clsx';
import iMask, { MaskedRange } from 'imask';
import toast from 'react-hot-toast';
import { date, object, string } from 'yup';
import { DatePicker } from '@mantine/dates';
import { useForm, yupResolver } from '@mantine/form';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import { Alert, Button, Input, Modal, Radio, Select, TextInput } from '@mantine/core';
import { useCountries, useCoupon, useDetectRule, useMemberCalculateFeeDetail, usePrefectures, useSearchZipcode } from '@/hooks/fetch';
import { http, store } from '@/utilities';
import { Skeleton } from '@/components';
import { FiCalendar, FiCheckCircle, FiChevronRight } from 'react-icons/fi';
import 'dayjs/locale/ja';

export default function Signup() {
  const { t } = useTranslation();
  const { query, push } = useRouter();
  const { countries } = useCountries();
  const { prefectures } = usePrefectures();
  const [opened, { toggle }] = useDisclosure(false);
  const cardNumber = useRef(null);
  const cvv = useRef(null);
  const expiryDate = useRef(null);
  const [tempCouponCode, setTempCouponCode] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState<Coupon>();

  useEffect(() => {
    // @ts-ignore
    iMask(cardNumber.current, { mask: '0000 0000 0000 0000' });
    // @ts-ignore
    iMask(cvv.current, { mask: Number, min: 0, max: 999 });
    // @ts-ignore
    iMask(expiryDate.current, {
      mask: 'm/y',
      blocks: {
        m: { mask: MaskedRange, from: 1, to: 12 },
        y: { mask: MaskedRange, from: 10, to: 99 },
      },
    });
  }, []);

  const schema = object({
    email: string().email(t('emailRequired')),
    firstName: string().required(t('required')),
    lastName: string().required(t('required')),
    gender: string().required(t('required')),
    dob: date().required(t('required')),
    nationality: string().required(t('required')),
    phone: string().required(t('required')),
    paymentMethod: string().required(t('required')),
    zipCode: string().when('nationality', { is: (nat: string) => nat === 'JP', then: (schema) => schema.required(t('required')) }),
    address: string().when('nationality', { is: (nat: string) => nat === 'JP', then: (schema) => schema.required(t('required')) }),
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
      email: '',
      firstName: '',
      lastName: '',
      nationality: 'JP',
      gender: 'MALE',
      dob: undefined,
      phone: '',
      zipCode: '',
      address: '',
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

    if (paymentMethod === 'CARD') {
      let expire = expiryDate.split('/');

      // @ts-ignore
      window.Multipayment.init(process.env.NEXT_PUBLIC_GMO_SHOP_ID);
      // @ts-ignore
      window.Multipayment.getToken(
        {
          cardno: cardNumber.replaceAll(' ', ''),
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

  const [debounced] = useDebouncedValue(values.email, 800);
  const { data } = useMemberCalculateFeeDetail(query.id as string, debounced);
  const { data: rule, isLoading } = useDetectRule({ planId: query.id as string, amount: data?.totalAmount });
  const { data: coupon } = useCoupon({ planId: query.id as string, amount: data?.totalAmount, couponCode, quantity: 1 });

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
    <div className="container py-12">
      <form onSubmit={onSubmit}>
        <div className="grid gap-20 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="text-right text-red-500">* {t('required')}</div>
            <h3 className="h5">{t('basicInfo')}</h3>
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
            <TextInput withAsterisk label={t('phone')} placeholder={t('phone')} {...register('phone')} />
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
            <h3 className="h5">{t('paymentInformation')}</h3>
            <Radio value="CARD" checked={values.paymentMethod === 'CARD'} label={t('creditCard')} onChange={register('paymentMethod').onChange} />
            {values.paymentMethod === 'CARD' && (
              <div className="ml-8 space-y-2">
                <TextInput ref={cardNumber} withAsterisk label={t('cardNumber')} placeholder={t('cardNumberPlaceholder')} {...register('cardNumber')} />
                <div className="flex gap-2">
                  <TextInput
                    ref={expiryDate}
                    withAsterisk
                    label={t('expiryDate')}
                    placeholder={t('expiryDatePlaceholder')}
                    {...register('expiryDate')}
                  />
                  <TextInput ref={cvv} withAsterisk label={t('cvv')} placeholder={t('cvvPlaceholder')} {...register('cvv')} />
                </div>
                <TextInput withAsterisk label={t('cardholderName')} placeholder={t('cardholderNamePlaceholder')} {...register('cardholderName')} />
              </div>
            )}
            <Radio
              value="TRANSFER"
              checked={values.paymentMethod === 'TRANSFER'}
              label={t('bankTransfer')}
              onChange={register('paymentMethod').onChange}
            />
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
              <Alert>
                <div className="prose">
                  <h1>利用規約</h1>
                  <p>
                    この利用規約（以下，「本規約」といいます。）は、特定非営利活動法人グランドワークこしみずがこのアプリ上で提供するサービス（以下、「本サービス」といいます。）の利用条件を定めるものです。利用者のみなさまには、本規約に従って，本サービスをご利用いただきます。
                  </p>
                  <h2>第1条（適用）</h2>
                  <ol>
                    <li>
                      本規約は、ユーザーと特定非営利活動法人グランドワークこしみずとの間の本サービスの利用に関わる一切の関係に適用されるものとします。
                    </li>
                    <li>
                      本サービスに関し、本規約のほか、ご利用にあたってのルール等、各種の定め（以下，「個別規定」といいます。）をすることがあります。これら個別規定はその名称のいかんに関わらず，本規約の一部を構成するものとします。
                    </li>
                    <li>
                      本規約の規定が前条の個別規定の規定と矛盾する場合には、個別規定において特段の定めなき限り、個別規定の規定が優先されるものとします。
                    </li>
                  </ol>
                  <h2>第２条（禁止事項）</h2>
                  <p>ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。</p>
                  <ol>
                    <li>法令または公序良俗に違反する行為</li>
                    <li>犯罪行為に関連する行為</li>
                    <li>本サービスの内容等，本サービスに含まれる著作権，商標権ほか知的財産権を侵害する行為</li>
                    <li>
                      特定非営利活動法人グランドワークこしみず、ほかのユーザー、またはその他第三者のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為
                    </li>
                    <li>本サービスによって得られた情報を商業的に利用する行為</li>
                    <li>特定非営利活動法人グランドワークこしみずのサービスの運営を妨害するおそれのある行為</li>
                    <li>不正アクセスをし、またはこれを試みる行為</li>
                    <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
                    <li>不正な目的を持って本サービスを利用する行為</li>
                    <li> 本サービスの他のユーザーまたはその他の第三者に不利益、損害、不快感を与える行為</li>
                    <li> 他のユーザーに成りすます行為</li>
                    <li> 特定非営利活動法人グランドワークこしみずが許諾しない本サービス上での宣伝、広告、勧誘、または営業行為</li>
                    <li> 面識のない異性との出会いを目的とした行為</li>
                    <li> 特定非営利活動法人グランドワークこしみずのサービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為</li>
                    <li> その他、特定非営利活動法人グランドワークこしみずが不適切と判断する行為</li>
                  </ol>
                  <h2>第3条（本サービスの提供の停止等）</h2>
                  <ol>
                    <li>
                      特定非営利活動法人グランドワークこしみずは、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
                      <ul>
                        <li>(ア) 本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
                        <li>(イ) 地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</li>
                        <li>(ウ) コンピュータまたは通信回線等が事故により停止した場合</li>
                        <li>(エ) その他、特定非営利活動法人グランドワークこしみずが本サービスの提供が困難と判断した場合</li>
                      </ul>
                    </li>
                    <li>
                      特定非営利活動法人グランドワークこしみずは、本サービスの提供の停止または中断により、ユーザーまたは第三者が被ったいかなる不利益または損害についても、一切の責任を負わないものとします。
                    </li>
                  </ol>
                  <h2>第4条（保証の否認および免責事項）</h2>
                  <ol>
                    <li>
                      特定非営利活動法人グランドワークこしみずは、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）がないことを明示的にも黙示的にも保証しておりません。
                    </li>
                    <li>
                      特定非営利活動法人グランドワークこしみずは、本サービスに起因してユーザーに生じたあらゆる損害について一切の責任を負いません。ただし、本サービスに関する特定非営利活動法人グランドワークこしみずとユーザーとの間の契約（本規約を含みます。）が消費者契約法に定める消費者契約となる場合、この免責規定は適用されません。
                    </li>
                    <li>
                      前項ただし書に定める場合であっても、特定非営利活動法人グランドワークこしみずは、特定非営利活動法人グランドワークこしみずの過失（重過失を除きます。）による債務不履行または不法行為によりユーザーに生じた損害のうち特別な事情から生じた損害（特定非営利活動法人グランドワークこしみずまたはユーザーが損害発生につき予見し、または予見し得た場合を含みます。）について一切の責任を負いません。また、特定非営利活動法人グランドワークこしみずの過失（重過失を除きます。）による債務不履行または不法行為によりユーザーに生じた損害の賠償は、ユーザーから当該損害が発生した月に受領した利用料の額を上限とします。
                    </li>
                    <li>
                      特定非営利活動法人グランドワークこしみずは、本サービスに関して、ユーザーと他のユーザーまたは第三者との間において生じた取引、連絡または紛争等について一切責任を負いません。
                    </li>
                  </ol>
                  <h2>第5条（著作権について）</h2>
                  <p>
                    当サイトに掲載されている個々の文章、写真、イラスト、画像などは、著作権の対象となっています。また、当サイト全体も、編集著作物として著作権法により保護されています。 非営利目的の個人利用など著作権法上認められた場合を除き、無断で複製・転用することは著作権法により禁止されています。
                  </p>
                  <h2>第6条（商標等について）</h2>
                  <p>
                    当サイトに表示されている商標、サービスマーク、商号、意匠等は法的に保護されています。これらの無断使用等の侵害行為を禁止しております。
                  </p>
                  <h2>第7条（サービス内容の変更等）</h2>
                  <p>
                    特定非営利活動法人グランドワークこしみずは、ユーザーに通知することなく、本サービスの内容を変更しまたは本サービスの提供を中止することができるものとし、これによってユーザーに生じた損害について一切の責任を負いません。
                  </p>
                  <h2>第8条（利用規約の変更）</h2>
                  <p>
                    特定非営利活動法人グランドワークこしみずは、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。なお，本規約の変更後、本サービスの利用を開始した場合には、当該ユーザーは変更後の規約に同意したものとみなします。
                  </p>
                  <h2>第9条（個人情報の取扱い）</h2>
                  <p>
                    特定非営利活動法人グランドワークこしみずは、本サービスの利用によって取得する個人情報については，特定非営利活動法人グランドワークこしみず「プライバシーポリシー」に従い適切に取り扱うものとします。
                  </p>
                  <h2>第10条（準拠法・裁判管轄）</h2>
                  <ol>
                    <li>本規約の解釈にあたっては、日本法を準拠法とします。</li>
                    <li>
                      本サービスに関して紛争が生じた場合には、特定非営利活動法人グランドワークこしみずの本店所在地を管轄する裁判所を専属的合意管轄とします。
                    </li>
                  </ol>
                  <p>以上</p>
                </div>
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
          </div>
          <div>
            {data ? (
              <div className="rounded-xl bg-white p-4 shadow">
                <h4 className="font-semibold">{t('orderSummary')}</h4>
                {/*<div className="flex justify-between">
                  <div>Subtotal:</div>
                  <div className="font-bold">9,000円</div>
                </div>*/}
                <div className="flex justify-between">
                  <div>{t('initialSetupFee')}:</div>
                  <div>{data.initialAdmissionFee}円</div>
                </div>
                <div className="flex justify-between">
                  <div>{t('handlingFee')}:</div>
                  <div>{data.initialAdminFee}円</div>
                </div>
                <div className="flex justify-between">
                  <div>{t('monthlyFee')}:</div>
                  <div>{data.monthlyFeeRemaining}円</div>
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
                        ? Math.round((couponData?.discountValue / 100) * data.totalAmount)
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
                    {data.totalAmount -
                      (couponData?.discountType === 'PERCENTAGE'
                        ? Math.round((couponData?.discountValue / 100) * data.totalAmount)
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
      </form>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({ props: { ...(await serverSideTranslations(locale, ['common'])) } });
