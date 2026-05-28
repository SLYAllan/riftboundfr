export default function DeckbuilderLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`footer { display: none !important; } main { overflow: hidden; }`}</style>
      {children}
    </>
  );
}
