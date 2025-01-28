export function Footer() {
  return (
    <footer className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-16 md:px-7 md:py-18">
      <cite>&copy; {new Date().getFullYear()} ije. All rights reserved.</cite>
      <address>
        <a href="mailto:me@ije.run">me@ije.run</a>
      </address>
    </footer>
  );
}
