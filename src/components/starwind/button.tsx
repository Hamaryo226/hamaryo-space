import React from 'react';

type ButtonVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

type ButtonSize = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg';

interface SharedProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

type ButtonAsButtonProps = SharedProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonAsAnchorProps = SharedProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

export type ButtonProps = ButtonAsButtonProps | ButtonAsAnchorProps;

const baseClass =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--text)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:pointer-events-none disabled:opacity-50';

const variantClasses: Record<ButtonVariant, string> = {
  default:
    'border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-card)_94%,transparent)] text-[var(--text)] hover:border-[var(--text)] hover:bg-[var(--bg-subtle)]',
  primary: 'bg-[var(--text)] text-[var(--bg)] hover:text-[var(--bg)] hover:opacity-90',
  secondary: 'bg-[var(--bg-subtle)] text-[var(--text)] hover:opacity-90',
  outline:
    'border border-[var(--border)] bg-transparent text-[var(--text)] hover:border-[var(--text)] hover:bg-[var(--bg-subtle)]',
  ghost: 'text-[var(--text)] hover:bg-[var(--bg-subtle)]',
  info: 'bg-sky-600 text-white hover:bg-sky-700',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700',
  warning: 'bg-amber-500 text-black hover:bg-amber-600',
  error: 'bg-rose-600 text-white hover:bg-rose-700'
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-4 text-sm',
  lg: 'h-10 px-6 text-sm',
  icon: 'h-9 w-9 p-0',
  'icon-sm': 'h-8 w-8 p-0',
  'icon-lg': 'h-10 w-10 p-0'
};

const joinClasses = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(' ');

export function Button(props: ButtonProps) {
  const { variant = 'default', size = 'md', className, children } = props;
  const buttonClassName = joinClasses(baseClass, variantClasses[variant], sizeClasses[size], className);

  if ('href' in props && props.href) {
    const { href, variant: _variant, size: _size, className: _className, ...anchorProps } = props;
    return (
      <a href={href} className={buttonClassName} {...anchorProps}>
        {children}
      </a>
    );
  }

  const { variant: _variant, size: _size, className: _className, ...buttonProps } = props as ButtonAsButtonProps;
  return (
    <button className={buttonClassName} {...buttonProps}>
      {children}
    </button>
  );
}
