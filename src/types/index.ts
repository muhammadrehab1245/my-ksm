export interface iError {
  error: string;
  stack: string;
}

export interface General {
  pageable: {
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface ZipCode {
  zipCode: string;
  prefecture: string;
  municipality: string;
  town: string;
}

export interface Country {
  code: string;
  nameEn: string;
  nameJa: string;
}

export interface Coupon {
  id: string;
  orgId: string;
  title: string;
  startDate: Date;
  endDate: Date;
  ruleType: string;
  discountType: string;
  discountValue: number;
  oncePerCustomer: boolean;
  usageLimit: number;
  usedCount: number;
  minimumAmount: number;
  minimumQuantity: number;
  planId: string;
  deleted: boolean;
}

export interface MemberFeeDetail {
  initialAdminFee: number;
  initialAdmissionFee: number;
  monthlyFee: number;
  monthlyFeeStartingPeriod: number;
  monthlyFeeCurrent: number;
  monthlyFeeRemaining: number;
  daysLeftInCurrentMonth: number;
  totalDaysOfMonth: number;
  totalAmount: number;
}

export interface Plan {
  id: string;
  orgId: string;
  name: string;
  code: string;
  description: string;
  tagIds: string[];
  minimumAge: number;
  maximumAge: number;
  initialAdminFee: number;
  initialAdmissionFee: number;
  monthlyFee: number;
  monthlyFeeStartingPeriod: number;
  startingPeriodLengthDays: number;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Plans extends General {
  content: Plan[];
}

export interface MemberDetail {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    phoneCountryCode: string;
    dob: Date | string;
    gender: string;
    disabled: boolean | string;
    nationality: string;
    zipCode: string;
    address: string;
    memberType: string;
    gmoMemberId: string;
    cardRegistered: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  subscription: {
    id: string;
    kcId: string;
    email: string;
    planId: string;
    orgId: string;
    trialUntil: Date;
    nextBillingDay: string;
    startingPricePeriodUntil: string;
    disabled: boolean | string;
    disabledAt: Date;
    disabledByKcId: string;
    subscriptionEndedAt: Date;
    memberStatus: string;
    memberNo: number;
    paymentMethod: string;
    registrationDate: Date | string;
    initialAdminFee: number;
    initialAdmissionFee: number;
    monthlyFee: number;
    monthlyFeeStartingPeriod: number;
    pricesLastUpdatedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    lockPinId: string;
    qrCode: string;
  };
}
