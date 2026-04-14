import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * MoneyInput — formatted number input
 *
 * Props:
 *   value    : number | string  — raw numeric value (controlled)
 *   onChange : (number) => void — called with raw number on every change
 *   devise   : string           — currency code/label shown as suffix (default 'XOF')
 *   className: string
 *   ...rest  : passed to <input>
 *
 * Behaviour:
 *   - On blur  : shows "1 250 000" (fr-FR thousands spacing)
 *   - On focus : shows raw digits "1250000" and selects all
 *   - Typing   : accepts only digits (no letters, no signs)
 */
export function MoneyInput({ value, onChange, devise = 'XOF', className, placeholder = '0', ...rest }) {
    const focused = useRef(false);

    function toRaw(v) {
        const n = parseFloat(String(v ?? '').replace(/[\s\u00a0\u202f]/g, '').replace(',', '.'));
        return isNaN(n) ? '' : String(Math.round(n));
    }

    function toFormatted(v) {
        const n = parseFloat(String(v ?? '').replace(/[\s\u00a0\u202f]/g, '').replace(',', '.'));
        if (!v && v !== 0) return '';
        if (isNaN(n)) return '';
        // Séparateur de milliers = espace insécable normal (évite \u202F invisible)
        return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
    }

    const [display, setDisplay] = useState(() => toFormatted(value));

    // Sync external value changes (e.g. form reset) without interrupting typing
    useEffect(() => {
        if (!focused.current) {
            setDisplay(toFormatted(value));
        }
    }, [value]);

    function handleFocus(e) {
        focused.current = true;
        const raw = toRaw(display);
        setDisplay(raw);
        // Select all after next paint so browser renders the value first
        requestAnimationFrame(() => e.target.select());
    }

    function handleChange(e) {
        // Accept digits only (and a single decimal comma/dot — round anyway on blur)
        const raw = e.target.value.replace(/[^\d]/g, '');
        setDisplay(raw);
        const num = raw ? Number(raw) : '';
        onChange(num);
    }

    function handleBlur() {
        focused.current = false;
        const num = display ? Number(display.replace(/[^\d]/g, '')) : '';
        setDisplay(num !== '' ? toFormatted(num) : '');
        if (num !== '') onChange(num);
    }

    return (
        <div className="relative">
            <input
                type="text"
                inputMode="numeric"
                value={display}
                placeholder={placeholder}
                onFocus={handleFocus}
                onChange={handleChange}
                onBlur={handleBlur}
                className={cn(
                    'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pr-14 text-sm shadow-sm',
                    'tabular-nums text-right',
                    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                    'placeholder:text-muted-foreground placeholder:text-left',
                    className
                )}
                {...rest}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground select-none">
                {devise}
            </span>
        </div>
    );
}
