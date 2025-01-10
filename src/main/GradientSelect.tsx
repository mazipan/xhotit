import clsx from 'clsx';
import { ClassMap, GRADIENTS } from '../gradients';

export const GradientSelect = ({
  activeGradient,
  onClick,
}: {
  activeGradient: string;
  onClick: (gradient: ClassMap) => void;
}) => {
  return (
    <div className="flex gap-2 flex-wrap">
      {GRADIENTS.map((gradient: ClassMap) => (
        <div
          key={gradient.id}
          className={clsx(
            'h-6 w-6 border rounded-full cursor-pointer',
            gradient.class,
            activeGradient === gradient.id
              ? 'border-2 border-gray-900 dark:border-gray-100'
              : ''
          )}
          onClick={() => {
            onClick?.(gradient);
          }}
        />
      ))}
    </div>
  );
};
