import { Information, MemberDetail, Plan } from '@/types';
import { proxy } from 'valtio';
import { devtools } from 'valtio/utils';

type Store = {
  userInfo: MemberDetail;
  information: Partial<Information>;
  memberType: string;
  selectedPlan: Plan;
};
export const store: Partial<Store> = proxy({
  memberType: '',
  information: {
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
  selectedPlan: undefined,
  userInfo: undefined,
});

const unsub = devtools(store, { name: 'ksm', enabled: true });
