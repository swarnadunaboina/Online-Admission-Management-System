import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  noPadding?: boolean;
}

export function Card({
  children,
  className,
  title,
  description,
  header,
  footer,
  noPadding,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-200 shadow-sm',
        className,
      )}
      {...props}
    >
      {(header || title) && (
        <div className="px-6 py-4 border-b border-gray-100">
          {header || (
            <div>
              {title && <h3 className="text-base font-semibold text-gray-900">{title}</h3>}
              {description && (
                <p className="mt-1 text-sm text-gray-500">{description}</p>
              )}
            </div>
          )}
        </div>
      )}
      <div className={cn(noPadding ? '' : 'p-6')}>{children}</div>
      {footer && (
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          {footer}
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  color?: 'blue' | 'green' | 'yellow' | 'purple' | 'red' | 'orange';
}

const colorMap = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  yellow: 'bg-yellow-50 text-yellow-600',
  purple: 'bg-purple-50 text-purple-600',
  red: 'bg-red-50 text-red-600',
  orange: 'bg-orange-50 text-orange-600',
};

export function StatCard({ title, value, icon, trend, color = 'blue' }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={cn('mt-1 text-xs font-medium', trend.value >= 0 ? 'text-green-600' : 'text-red-600')}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-lg', colorMap[color])}>{icon}</div>
      </div>
    </div>
  );
}
