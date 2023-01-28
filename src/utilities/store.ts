import { proxy } from 'valtio';
import { devtools } from 'valtio/utils';
import { getCookie, setCookie } from 'cookies-next';
import { http } from '@/utilities';

export const store = proxy({
  orgId: getCookie('orgId'),
  orgList: (getCookie('orgList') as string)?.split(','),
});

export const actions = {
  setOrgId: (payload: string) => {
    store.orgId = payload;
    setCookie('orgId', payload);
    http.defaults.params['orgId'] = payload;
  },
  setOrgList: (payload: string[]) => {
    store.orgList = payload;
    setCookie('orgId', payload.join(','));
  },
};

const unsub = devtools(store, { name: 'ksm', enabled: true });
