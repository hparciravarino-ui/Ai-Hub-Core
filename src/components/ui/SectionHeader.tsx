import React from 'react';

interface SectionHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}

export function SectionHeader({ title, description, icon, actions }: SectionHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        {icon && <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg">{icon}</div>}
        <div>
          <h2 className="text-xl font-bold text-zinc-100">{title}</h2>
          {description && <p className="text-sm text-zinc-400 mt-1">{description}</p>}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
