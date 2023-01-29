import type { FC } from 'react';
import clsx from 'clsx';

export const Footer: FC<{ className?: string }> = ({ className }) => {
  return (
    <footer className={clsx(className, 'bg-gray-100 py-3 text-center')}>
      <div>&copy; 2022. RENNAISANCE INC. All Rights Reserved.</div>
    </footer>
  );
};
