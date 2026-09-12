import {
  Check,
  FileText,
  Sparkles,
  Upload,
} from 'lucide-react';

function InterviewStepper({
  currentStep = 1,
}) {
  const steps = [
    {
      number: 1,
      label: 'Basic Information',
      icon: FileText,
    },
    {
      number: 2,
      label: 'Upload Resume',
      icon: Upload,
    },
    {
      number: 3,
      label: 'Review & Generate',
      icon: Sparkles,
    },
  ];

  return (
    <div className="interview-stepper">
      {steps.map((step, index) => {
        const Icon = step.icon;

        const completed =
          currentStep > step.number;

        const active =
          currentStep === step.number;

        return (
          <div
            className="stepper-item"
            key={step.number}
            aria-current={active ? 'step' : undefined}
          >
            <div
              className={[
                'stepper-item__circle',
                active
                  ? 'stepper-item__circle--active'
                  : '',
                completed
                  ? 'stepper-item__circle--completed'
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {completed ? (
                <Check size={15} />
              ) : (
                <Icon size={15} />
              )}
            </div>

            <span
              className={
                active
                  ? 'stepper-item__label stepper-item__label--active'
                  : 'stepper-item__label'
              }
            >
              {step.label}
            </span>

            {index <
              steps.length - 1 && (
              <div
                className={[
                  'stepper-item__line',
                  currentStep >
                  step.number
                    ? 'stepper-item__line--completed'
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default InterviewStepper;
