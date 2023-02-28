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

export interface Country {
  code: string;
  nameEn: string;
  nameJa: string;
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
