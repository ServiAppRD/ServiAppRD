import { Heart, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ServiceCardProps {
  title: string;
  price: string;
  location: string;
  image: string;
  isFeatured?: boolean;
  category: string;
}

export const ServiceCard = ({ title, price, location, image, isFeatured, category }: ServiceCardProps) => {
  return (
    <Card className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300 border-gray-100">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
        />
        {isFeatured && (
          <Badge className="absolute top-2 left-2 bg-[#FDBA74] text-[#0F172A] hover:bg-[#FDBA74]">
            Destacado
          </Badge>
        )}
        <button className="absolute bottom-2 right-2 p-1.5 bg-black/50 rounded-full text-white hover:bg-[#FDBA74] hover:text-[#0F172A] transition-colors">
          <Heart className="h-4 w-4" />
        </button>
      </div>
      <CardContent className="p-3">
        <p className="text-xs text-gray-500 mb-1">{category}</p>
        <h3 className="font-semibold text-[#0F172A] line-clamp-2 min-h-[3rem] mb-2 text-sm leading-tight">
          {title}
        </h3>
        <div className="flex items-center justify-between mt-auto">
          <p className="font-bold text-[#FDBA74] text-lg">{price}</p>
        </div>
        <div className="flex items-center text-gray-400 text-xs mt-2">
          <MapPin className="h-3 w-3 mr-1" />
          <span className="truncate">{location}</span>
        </div>
      </CardContent>
    </Card>
  );
};