import { Information, MemberDetail, Plan } from '@/types';
import { proxy } from 'valtio';
import { devtools } from 'valtio/utils';

type Store = {
  userInfo: MemberDetail;
  information: Partial<Information>;
  memberType: string;
  selectedPlan: Plan;
};
export const info = {
  email: '',
  firstName: '',
  lastName: '',
  nationality: 'JP',
  gender: 'MALE',
  dob: undefined,
  phone: '',
  phoneCode: '+81-JP',
  zipCode: '',
  prefecture: '',
  municipality: '',
  address: '',
};

export const store: Partial<Store> = proxy({
  memberType: '',
  information: info,
  selectedPlan: undefined,
  userInfo: undefined,
});

const unsub = devtools(store, { name: 'ksm', enabled: true });
