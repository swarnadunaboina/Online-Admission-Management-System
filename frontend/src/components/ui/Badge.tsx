import { cn, getStatusColor, formatStatusLabel } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'status';
  status?: string;
  color?: 'gray' | 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo' | 'orange';
}

const colorStyles = {
  gray: 'bg-gray-100 text-gray-700',
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  red: 'bg-red-100 text-red-700',
  purple: 'bg-purple-100 text-purple-700',
  indigo: 'bg-indigo-100 text-indigo-700',
  orange: 'bg-orange-100 text-orange-700',
};

export function Badge({
  children,
  className,
  variant = 'default',
  status,
  color = 'gray',
  ...props
}: BadgeProps) {
  const statusStyles = status ? getStatusColor(status) : colorStyles[color];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variant === 'outline'
          ? 'border border-current bg-transparent'
          : statusStyles,
        className,
      )}
      {...props}
    >
      {status ? formatStatusLabel(status) : children}
    </span>
  );
}
