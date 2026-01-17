import { Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ServiceCardProps {
  title: string;
  price: string;
  image: string;
  badge?: { text: string; color: "yellow" | "blue" | "orange" | "gray" };
}

export const ServiceCard = ({ title, price, image, badge }: ServiceCardProps) => {
  return (
    <div className="flex flex-col w-[160px] md:w-[200px] flex-shrink-0 group cursor-pointer">
      <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-gray-100 border border-gray-100">
        <img 
          src={image} 
          alt={title} 
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badge Overlay */}
        {badge && (
          <Badge 
            className={`absolute top-2 left-2 border-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm ${
              badge.color === "yellow" 
                ? "bg-[#fbce07] text-black hover:bg-[#fbce07]" 
                : badge.color === "blue"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : badge.color === "orange"
                ? "bg-[#F97316] text-white hover:bg-orange-600"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {badge.text}
          </Badge>
        )}

        {/* Favorite Heart */}
        <button className="absolute bottom-2 right-2 p-2 bg-white/90 rounded-full text-gray-500 hover:text-red-500 hover:bg-white transition-all shadow-sm">
          <Heart className="h-4 w-4" />
        </button>
      </div>

      <div className="px-1">
        <h3 className="font-medium text-gray-900 line-clamp-2 text-sm leading-snug h-10 mb-1 group-hover:text-[#F97316] transition-colors">
          {title}
        </h3>
        <p className="font-bold text-base text-gray-900">{price}</p>
      </div>
    </div>
  );
};