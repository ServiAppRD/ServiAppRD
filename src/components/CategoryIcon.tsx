import { LucideIcon } from "lucide-react";

interface CategoryIconProps {
  icon: LucideIcon;
  label: string;
  count: string;
}

export const CategoryIcon = ({ icon: Icon, label, count }: CategoryIconProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white border rounded-lg hover:shadow-md cursor-pointer hover:border-[#F97316] transition-all group w-full">
      <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mb-3 group-hover:bg-[#F97316] transition-colors">
        <Icon className="h-6 w-6 text-[#F97316] group-hover:text-white" />
      </div>
      <h3 className="font-semibold text-sm text-center text-[#0F172A]">{label}</h3>
      <p className="text-xs text-gray-400 mt-1">{count} anuncios</p>
    </div>
  );
};