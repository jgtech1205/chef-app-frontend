import { ChefLogo } from './ChefLogo'
import { Button } from '@/components/ui/button'
import { getTranslations, type Locale } from '@/lib/i18n'

interface LanguageSelectionProps {
  onLanguageSelect: (locale: Locale) => void
}

export function LanguageSelection({ onLanguageSelect }: LanguageSelectionProps) {
  const t = getTranslations('en') // Default to English for this screen

  const handleSelect = (locale: Locale) => {
    onLanguageSelect(locale)
  }

  return (
   <div className="min-h-screen bg-[#0F1A24] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <ChefLogo />

        <div className="mb-8">
          <h2 className="text-white text-lg md:text-xl text-center mb-6">{t.selectLanguage} / Seleccionar Idioma</h2>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => handleSelect("en")}
            className="w-full h-14 bg-transparent border-2 border-[#D4B896] text-[#D4B896] text-xl font-medium hover:bg-[#D4B896] hover:text-[#0F1A24] transition-colors"
          >
            {t.english}
          </Button>

          <Button
            onClick={() => handleSelect("es")}
            className="w-full h-14 bg-transparent border-2 border-[#D4B896] text-[#D4B896] text-xl font-medium hover:bg-[#D4B896] hover:text-[#0F1A24] transition-colors"
          >
            {t.spanish}
          </Button>
        </div>
      </div>
    </div>
  )
}
