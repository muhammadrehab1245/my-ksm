import Link from 'next/link';

export const Header = () => {
  return (
    <header>
      <div className="container text-center">
        <Link className="inline-block" href="/">
          <img src="/images/logo.svg" alt="logo" />
        </Link>
      </div>
    </header>
  );
};
