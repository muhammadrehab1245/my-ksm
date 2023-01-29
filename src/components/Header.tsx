import Link from 'next/link';

export const Header = () => {
  return (
    <header>
      <div className="container text-center">
        <Link className="inline-block" href="/">
          <img className="h-20" src="/images/logo.svg" alt="logo" />
        </Link>
      </div>
    </header>
  );
};
