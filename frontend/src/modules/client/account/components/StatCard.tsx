const StatCard = ({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
}) => (
  <div className="flex items-center p-4 rounded-lg bg-white border border-gray-200 shadow-sm">
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}
    >
      {icon}
    </div>
    <div className="ml-3">
      <div className="text-lg font-medium">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  </div>
);

export default StatCard;
