import React from 'react';
import { useFestival } from '../context/FestivalContext';
import { AlMamouraLogo } from './AlMamouraLogo';
import { ExternalLink, RefreshCw } from 'lucide-react';

export const Footer: React.FC = () => {
  const { resetAllData, language } = useFestival();
  const isAr = language === 'ar';

  return (
    <footer className="mt-16 border-t border-stone-200 bg-white py-8 text-xs text-stone-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <AlMamouraLogo variant="light" size="sm" showJuryLabel={false} />
          <div>
            <div className="font-semibold text-stone-800">
              Al Mamoura International Film Festival
            </div>
            <div className="text-[11px] text-stone-400">
              {isAr ? 'بوابة تحكيم مسابقة الأفلام القصيرة الرسمية · أبوظبي، الإمارات العربية المتحدة' : 'Official Short Film Competition Screening Portal · Abu Dhabi, UAE'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-5 text-stone-500">
          <a
            href="https://www.almamourafestival.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-[#9E7A2A] transition-colors"
          >
            <span>www.almamourafestival.com</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            onClick={() => {
              if (window.confirm(isAr ? 'إعادة ضبط بيانات الأفلام القصيرة والتقييمات؟' : 'Reset short films and jury scores?')) {
                resetAllData();
              }
            }}
            className="flex items-center gap-1 hover:text-stone-800 transition-colors"
            title="Reset Demo Data"
          >
            <RefreshCw className="w-3 h-3" />
            <span>{isAr ? 'إعادة ضبط' : 'Reset'}</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
