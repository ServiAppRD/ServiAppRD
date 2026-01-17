import { Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ServiceCardProps {
  title: string;
  price: string;
  image: string;
  badge?: { text: string; color: "yellow" | "blue" | "gray" };
}

export const ServiceCard = ({ title, price, image, badge }: ServiceCardProps) => {
  return (
    <div className="flex flex-col w-[160px] md:w-[200px] flex-shrink-0">
      <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-gray-100">
        <img 
          src={image} 
          alt={title} 
          className="object-cover w-full h-full"
        />
        
        {/* Badge Overlay */}
        {badge && (
          <Badge 
            className={`absolute top-2 left-2 border-0 px-2 py-0.5 text-xs font-bold rounded-md ${
              badge.color === "yellow" 
                ? "bg-[#fbce07] text-black hover:bg-[#fbce07]" 
                : badge.color === "blue"
                ? "bg-[#0058ab] text-white hover:bg-[#0058ab]"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {badge.text}
          </Badge>
        )}

        {/* Favorite Heart */}
        <button className="absolute bottom-2 right-2 p-1.5 bg-black/40 rounded-full text-white hover:bg-red-500 transition-colors backdrop-blur-sm">
          <Heart className="h-5 w-5" />
        </button>
      </div>

      <div className="px-1">
        <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm leading-tight h-9 mb-1">
          {title}
        </h3>
        <p className="font-bold text-lg text-gray-900">{price}</p>
      </div>
    </div>
  );
};