import type { GetStaticProps } from 'next';
import { Coupon } from '@/types';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { Badge, Button, Stepper, TextInput } from '@mantine/core';
import { useCountries, useCoupon, useDetectRule, useMemberCalculateFeeDetail } from '@/hooks/fetch';
import { store } from '@/utilities';
import { PaymentForm, Skeleton } from '@/components';

export default function Checkout() {
  const { push } = useRouter();
  const { t } = useTranslation();
  const { selectedPlan, information } = store;

  useEffect(() => {
    if (!selectedPlan) {
      push('/');
    }
  }, []);

  const [tempCouponCode, setTempCouponCode] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState<Coupon | null>();

  const { data: planData } = useMemberCalculateFeeDetail(selectedPlan?.id, information?.email);
  const { data: rule, isLoading } = useDetectRule({ planId: selectedPlan?.id, amount: planData?.totalAmount });
  const { data: coupon } = useCoupon({ planId: selectedPlan?.id, amount: planData?.totalAmount, couponCode, quantity: 1 });

  const { countries } = useCountries();
  const [nationality, setNationality] = useState<string | undefined>();
  useEffect(() => {
    setNationality(countries?.find(({ value }) => value === information?.nationality)?.label);
  }, [countries]);

  useEffect(() => {
    if (rule) {
      setCouponData(rule);
    } else if (coupon?.ruleType) {
      setCouponData(coupon);
      toast.success(t('couponApplied'));
      // @ts-ignore
    } else if (coupon?.error) {
      // @ts-ignore
      toast.error(coupon?.stack);
      setCouponCode('');
    } else {
      setCouponData(null);
      setCouponCode('');
    }
  }, [rule, coupon]);

  let discount: number;
  if (couponData?.discountType === 'PERCENTAGE') {
    // @ts-ignore
    discount = Math.round((couponData?.discountValue / 100) * planData?.totalAmount);
  } else {
    discount = couponData?.discountValue || 0;
  }

  // @ts-ignore
  let total = planData?.totalAmount - discount;

  return (
    <div className="my-12">
      <Stepper active={2} allowNextStepsSelect={false} breakpoint="sm" classNames={{ steps: 'container' }}>
        <Stepper.Step label={t('basicInformation')} />
        <Stepper.Step label={t('selectPlan')} />
        <Stepper.Step label={t('checkOut')} />
      </Stepper>
      <div className="container my-8 grid gap-y-4 gap-x-8 lg:grid-cols-2">
        <div className="col-span-full">
          <h3 className="h5">{t('basicInfo')}</h3>
        </div>
        <div className="space-y-4">
          <div className="space-y-4 bg-white p-4">
            <div>
              <div className="text-xs">{t('name')}</div>
              <div className="text-xl font-semibold">
                {information?.firstName} {information?.lastName}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs">{t('gender')}</div>
                <div>{t(information?.gender)}</div>
              </div>
              <div>
                <div className="text-xs">{t('dob')}</div>
                <div>{dayjs(information?.dob).format('YYYY/MM/DD')}</div>
              </div>
            </div>
            {information?.email && (
              <div>
                <div className="text-xs">{t('email')}</div>
                <div>{t(information?.email)}</div>
              </div>
            )}
            <div>
              <div className="text-xs">{t('phone')}</div>
              <div>
                {information?.phoneCountryCode} {information?.phone}
              </div>
            </div>
            <div>
              <div className="text-xs">{t('nationality')}</div>
              <div>{nationality}</div>
            </div>
            {information?.nationality === 'JP' && (
              <div>
                <div className="text-xs">{t('address')}</div>
                <div>
                  {information?.zipCode} {information?.prefecture} {information?.municipality} {information?.address}
                </div>
              </div>
            )}
          </div>
          <h3 className="h5">{t('selectedPlan')}</h3>
          <div className="flex justify-between space-y-4 bg-white p-4">
            <div>
              <h3>{selectedPlan?.name}</h3>
              <div>
                {selectedPlan?.tags?.map(({ name }, index) => (
                  <Badge className="mr-2 mb-2" key={index}>
                    {name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <PaymentForm couponCode={couponCode} />
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
                    {couponData?.ruleType === 'AUTO' ? t('autoDiscount') : t('couponDiscount')}
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
                <div className="text-red-500">{total > 0 ? total : 0}円</div>
              </div>
            </div>
          ) : (
            <Skeleton />
          )}
        </div>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({ props: { ...(await serverSideTranslations(locale, ['common'])) } });
