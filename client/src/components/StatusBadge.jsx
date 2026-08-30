import {
  Clock,
  Navigation,
  MapPin,
  TestTube2,
  Truck,
  FlaskConical,
  CheckCircle2,
} from 'lucide-react';

const statusConfig = {
  booked: {
    label: 'Booked',
    color: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    icon: Clock,
    step: 1,
  },
  en_route: {
    label: 'En Route',
    color: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    icon: Navigation,
    step: 2,
  },
  arrived: {
    label: 'Arrived',
    color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    icon: MapPin,
    step: 3,
  },
  sample_collected: {
    label: 'Sample Collected',
    color: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    icon: TestTube2,
    step: 4,
  },
  in_transit: {
    label: 'In Transit',
    color: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    icon: Truck,
    step: 5,
  },
  processing: {
    label: 'Processing',
    color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    icon: FlaskConical,
    step: 6,
  },
  completed: {
    label: 'Completed',
    color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    icon: CheckCircle2,
    step: 7,
  },
};

const allStatuses = ['booked', 'en_route', 'arrived', 'sample_collected', 'in_transit', 'processing', 'completed'];

export function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.booked;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold shadow-sm ${config.color}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

export function StatusTimeline({ currentStatus }) {
  const currentStep = statusConfig[currentStatus]?.step || 1;

  return (
    <div className="w-full py-4 px-2">
      <div className="flex items-center justify-between min-w-[500px]">
        {allStatuses.map((status, i) => {
          const config = statusConfig[status];
          const Icon = config.icon;
          const isActive = config.step <= currentStep;
          const isCurrent = status === currentStatus;

          return (
            <div key={status} className="flex items-center flex-1 last:flex-initial">
              <div className="flex flex-col items-center gap-2 relative">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 ${
                    isCurrent
                      ? 'bg-accent-primary border-accent-primary text-bg-primary pulse-glow scale-110 shadow-lg'
                      : isActive
                      ? 'bg-accent-primary/20 border-accent-primary/50 text-accent-primary'
                      : 'bg-bg-card border-border-custom text-text-muted'
                  }`}
                  title={config.label}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span
                  className={`text-[11px] font-medium whitespace-nowrap ${
                    isCurrent
                      ? 'text-accent-primary font-bold'
                      : isActive
                      ? 'text-text-primary'
                      : 'text-text-muted'
                  }`}
                >
                  {config.label}
                </span>
              </div>

              {i < allStatuses.length - 1 && (
                <div className="flex-1 px-2 mb-6">
                  <div
                    className={`h-1 w-full rounded-full transition-all duration-500 ${
                      config.step < currentStep
                        ? 'bg-gradient-to-r from-accent-primary to-accent-secondary'
                        : 'bg-border-custom'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StatusBadge;
