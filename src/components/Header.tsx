import Link from 'next/link';

export const Header = () => (
  <header className="bg-white">
    <div className="container text-center">
      <Link className="inline-block" href="/">
        <img className="h-20" src="/images/logo.svg" alt="logo" />
      </Link>
    </div>
  </header>
);
