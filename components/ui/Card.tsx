export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="border rounded-lg bg-white shadow-sm p-4">
      {children}
    </div>
  );
}
