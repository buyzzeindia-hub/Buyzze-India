export default function Badge({ label }: { label: string }) {
  return (
    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
      {label}
    </span>
  );
}
