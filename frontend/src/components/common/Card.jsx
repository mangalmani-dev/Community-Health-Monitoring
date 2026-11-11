import React from 'react';

export function Card({ children, title, subtitle, action, className = '', bodyClassName = '', headerClassName = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200/80 shadow-soft overflow-hidden transition-all ${className}`}>
      {(title || subtitle || action) && (
        <div className={`px-6 py-4 border-b border-slate-100 flex items-center justify-between ${headerClassName}`}>
          <div>
            {title && <h3 className="font-semibold text-slate-900 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={`p-6 ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
}

