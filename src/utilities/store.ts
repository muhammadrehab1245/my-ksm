import type { MemberDetail } from '@/types';
import { proxy } from 'valtio';
import { devtools } from 'valtio/utils';

export const store: { userInfo: MemberDetail } = proxy({
  userInfo: {},
});

const unsub = devtools(store, { name: 'ksm', enabled: true });
