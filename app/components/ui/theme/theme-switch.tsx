import './theme-switch.css';

import { useIsMounted } from '@mado/hooks';
import { type ButtonHTMLAttributes, forwardRef, useId } from 'react';
import { twJoin } from 'tailwind-merge';

import { DARK, LIGHT, type Theme } from './theme';
import { useTheme } from './use-theme';

export interface ThemeSwitchProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  onChange?: (theme: Theme) => void;
}

export const ThemeSwitch = forwardRef<HTMLButtonElement, ThemeSwitchProps>(
  (props, ref) => {
    const { className, onChange, onClick, style, ...other } = props;

    const id = useId();
    const isMounted = useIsMounted();
    const theme = useTheme();

    return (
      <button
        ref={ref}
        aria-label={isMounted ? theme : undefined}
        aria-live="polite"
        className={twJoin('theme-switch', className)}
        style={{ cursor: 'pointer', ...style }}
        title="Theme Switch"
        type="button"
        onClick={(e) => {
          const preferredTheme = theme === DARK ? LIGHT : DARK;

          // @ts-expect-error
          globalThis.__setPreferredTheme(preferredTheme);
          onClick?.(e);
          onChange?.(preferredTheme);
        }}
        {...other}
      >
        <svg aria-hidden="true" strokeLinecap="round" viewBox="0 0 24 24">
          <mask fill="currentColor" id={id}>
            <rect fill="white" height="100%" width="100%" x="0" y="0" />
            <circle className="moon" cx="24" cy="10" fill="black" r="6" />
          </mask>
          <circle
            className="sun"
            cx="12"
            cy="12"
            fill="currentColor"
            mask={`url(#${id})`}
            r="6"
          />
          <g className="sun-beams" stroke="currentColor" strokeWidth="2">
            <line x1="12" x2="12" y1="1" y2="3" />
            <line x1="12" x2="12" y1="21" y2="23" />
            <line x1="4.22" x2="5.64" y1="4.22" y2="5.64" />
            <line x1="18.36" x2="19.78" y1="18.36" y2="19.78" />
            <line x1="1" x2="3" y1="12" y2="12" />
            <line x1="21" x2="23" y1="12" y2="12" />
            <line x1="4.22" x2="5.64" y1="19.78" y2="18.36" />
            <line x1="18.36" x2="19.78" y1="5.64" y2="4.22" />
          </g>
        </svg>
      </button>
    );
  },
);

ThemeSwitch.displayName = 'ThemeSwitch';
