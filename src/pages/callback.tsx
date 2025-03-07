'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { http, store } from '@/utilities';
import { Loader } from '@mantine/core';
export default function Callback() {
  const router = useRouter();
  const { query, push } = router;

  useEffect(() => {
    if (Object.keys(query).length > 0) {
      // console.log('Query Parameters:', query);
      http
        .post(`users/gmo/call-back`, { param: query.param, MD: query.MD }, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
        .then((response) => {
          // console.log(response.data);
          let data = response.data;
          let success = false;
          let subscriptionId = sessionStorage.getItem('subscriptionId');
          if (Object.keys(data).includes('approve')) success = true;

          http.post(`organizations/public/post-payment-subscribe?subscriptionId=${subscriptionId}&success=${success}`, {}).then((response) => {
            store.userInfo = response.data;
            if (success) {
              push('/success');
            } else {
              push('/failure');
            }
          });
          sessionStorage.removeItem('subscriptionId');
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [query]);

  return (
    <div className="mt-20 flex justify-center">
      <Loader color="blue" />;
    </div>
  );
}
