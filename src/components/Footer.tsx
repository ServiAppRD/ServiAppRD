import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="hidden md:block bg-gray-50 border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Columna 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="ServiAPP" className="h-10 w-auto" />
              <span className="font-bold text-xl text-gray-900">ServiAPP</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Conectando profesionales de confianza con clientes que necesitan soluciones rápidas y seguras.
            </p>
          </div>

          {/* Columna 2: Enlaces Rápidos */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Plataforma</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/search" className="hover:text-[#F97316] transition-colors">Explorar Servicios</Link></li>
              <li><Link to="/publish" className="hover:text-[#F97316] transition-colors">Publicar Anuncio</Link></li>
              <li><Link to="/login" className="hover:text-[#F97316] transition-colors">Ingresar / Registro</Link></li>
            </ul>
          </div>

          {/* Columna 3: Legal */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/terms" className="hover:text-[#F97316] transition-colors">Términos y Condiciones</Link></li>
              <li><Link to="/privacy" className="hover:text-[#F97316] transition-colors">Política de Privacidad</Link></li>
              <li><a href="#" className="hover:text-[#F97316] transition-colors">Normas de la Comunidad</a></li>
            </ul>
          </div>

          {/* Columna 4: Contacto */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Contacto</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> serviapp.help@gmail.com</li>
              <li className="flex gap-4 mt-4">
                <a href="#" className="p-2 bg-white border border-gray-200 rounded-full hover:border-[#F97316] hover:text-[#F97316] transition-all"><Facebook className="h-4 w-4" /></a>
                <a 
                  href="https://www.instagram.com/serviapp.rd/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2 bg-white border border-gray-200 rounded-full hover:border-[#F97316] hover:text-[#F97316] transition-all"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a href="#" className="p-2 bg-white border border-gray-200 rounded-full hover:border-[#F97316] hover:text-[#F97316] transition-all"><Twitter className="h-4 w-4" /></a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8 flex justify-between items-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} ServiAPP. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <span>Hecho con ❤️ en República Dominicana</span>
          </div>
        </div>
      </div>
    </footer>
  );
};