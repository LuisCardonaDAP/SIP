import { Logo } from "./logo";

export function Header() {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-3">
        <Logo />
      </div>
    </header>
  );
}
