import React from 'react';
import { Users, UserCheck, Award, Building2 } from 'lucide-react';
import { MedicoStats } from '../types';

interface StatsCardsProps {
  stats: MedicoStats | null;
  loading: boolean;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, loading }) => {
  const cards = [
    {
      title: 'Total de Médicos',
      value: stats?.totalMedicos ?? 0,
      icon: Users,
      color: 'blue',
      badge: `${stats?.medicosActivos ?? 0} activos`,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      title: 'Médicos Activos',
      value: stats?.medicosActivos ?? 0,
      icon: UserCheck,
      color: 'emerald',
      badge: `${stats?.medicosInactivos ?? 0} inactivos`,
      badgeColor: 'bg-slate-100 text-slate-600 border-slate-200',
    },
    {
      title: 'Especialidades',
      value: stats?.totalEspecialidades ?? 0,
      icon: Award,
      color: 'indigo',
      badge: 'Registradas',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      title: 'Centros Médicos',
      value: stats?.totalCentros ?? 0,
      icon: Building2,
      color: 'purple',
      badge: 'Asociados',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{card.title}</p>
                <div className="mt-2 flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-slate-900">
                    {loading ? (
                      <span className="inline-block w-8 h-6 bg-slate-200 animate-pulse rounded"></span>
                    ) : (
                      card.value
                    )}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${card.badgeColor}`}
                  >
                    {card.badge}
                  </span>
                </div>
              </div>
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  card.color === 'blue'
                    ? 'bg-blue-50 text-blue-600'
                    : card.color === 'emerald'
                    ? 'bg-emerald-50 text-emerald-600'
                    : card.color === 'indigo'
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'bg-purple-50 text-purple-600'
                }`}
              >
                <IconComponent className="w-6 h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
