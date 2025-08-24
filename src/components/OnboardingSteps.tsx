import React, { useState } from 'react';
import { CheckCircle, ChevronRight, X, HelpCircle } from 'lucide-react';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
}

export function OnboardingSteps() {
  const [isVisible, setIsVisible] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  
  const steps: OnboardingStep[] = [
    {
      id: 1,
      title: "Salve nosso contato no WhatsApp",
      description: "Adicione BolsoZen (+55 11 99999-9999) aos seus contatos. Envie /start para começar a usar. É só enviar comprovantes e confirmar!",
      completed: false,
      current: currentStep === 1,
    },
    {
      id: 2,
      title: "Aprenda os comandos básicos",
      description: "Use /resumo para ver totais, /categorias para listar suas categorias, /ajuda para comandos disponíveis.",
      completed: currentStep > 2,
      current: currentStep === 2,
    },
    {
      id: 3,
      title: "Envie seu primeiro comprovante",
      description: "Tire foto de qualquer comprovante (PIX, cartão, boleto) e envie pelo WhatsApp. A IA processará e sugerirá categoria.",
      completed: currentStep > 3,
      current: currentStep === 3,
    },
  ];

  const handleContinueWithoutTargets = () => {
    // TODO: Skip onboarding and mark as completed
    console.log('Continue without targets clicked');
    setIsVisible(false);
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      setIsVisible(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  const currentStepData = steps.find(step => step.current);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Left side - Step info */}
          <div className="flex items-center gap-6">
            {/* Step counter */}
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-semibold">
                {currentStep}
              </div>
              <span className="text-sm text-gray-500">
                Step {currentStep} of {steps.length}
              </span>
            </div>

            {/* Step content */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {currentStepData?.title}
              </h3>
              <p className="text-sm text-gray-600 max-w-2xl">
                {currentStepData?.description}
              </p>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-4">
            {/* Continue without targets (only on first step) */}
            {currentStep === 1 && (
              <button
                onClick={handleContinueWithoutTargets}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
              >
                Continuar sem Metas
              </button>
            )}

            {/* Next/Complete button */}
            <button
              onClick={handleNext}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {currentStep === 3 ? 'Concluir' : 'Próximo'}
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Help button */}
            <button
              className="flex items-center justify-center w-10 h-10 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
              title="Ajuda"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 transition-colors"
              title="Fechar onboarding"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 pb-4">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium transition-colors ${
                  step.completed
                    ? 'bg-green-600 text-white'
                    : step.current
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step.completed ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  step.id
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 transition-colors ${
                    step.completed ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}