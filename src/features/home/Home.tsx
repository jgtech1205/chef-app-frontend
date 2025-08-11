import { useTranslation } from '@/lib/i18n';
import { ChefLogo } from '@/components/ChefLogo';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <ChefLogo />
          </div>
          <h1 className="text-5xl font-bold text-white mb-6">
            {t.welcomeToChefEnPlace}
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            {t.homeDescription}
          </p>
          <div className="flex justify-center space-x-4">
            <button className="bg-[#D4B896] hover:bg-[#C4A886] text-slate-900 px-8 py-3 rounded-lg font-semibold transition-colors">
              {t.getStarted}
            </button>
            <button className="border border-[#D4B896] text-[#D4B896] hover:bg-[#D4B896] hover:text-slate-900 px-8 py-3 rounded-lg font-semibold transition-colors">
              {t.learnMore}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
