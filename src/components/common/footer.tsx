import { Code2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container flex flex-col items-center justify-between gap-6 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Code2 className="h-6 w-6 text-primary" />
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            코딩메이커 학원 (전남 광양)
            <br />
            <span className="font-headline">&copy; 2024 Coducation. All Rights Reserved.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
