import { describe, it, expect } from 'vitest';
import { formatPrice, formatPriceInput, parsePriceInput } from '../utils/formatPrice';

describe('formatPrice', () => {
    it('should format number as Indonesian Rupiah', () => {
        expect(formatPrice(2800000)).toBe('Rp\u00A02.800.000');
    });

    it('should return "-" for null value', () => {
        expect(formatPrice(null)).toBe('-');
    });

    it('should return "-" for undefined value', () => {
        expect(formatPrice(undefined)).toBe('-');
    });

    it('should format small numbers correctly', () => {
        expect(formatPrice(1000)).toBe('Rp\u00A01.000');
    });

    it('should format large numbers correctly', () => {
        expect(formatPrice(15000000)).toBe('Rp\u00A015.000.000');
    });
});

describe('formatPriceInput', () => {
    it('should format number without currency symbol', () => {
        expect(formatPriceInput(2800000)).toBe('2.800.000');
    });

    it('should return empty string for null', () => {
        expect(formatPriceInput(null)).toBe('');
    });

    it('should return empty string for undefined', () => {
        expect(formatPriceInput(undefined)).toBe('');
    });

    it('should return empty string for empty string', () => {
        expect(formatPriceInput('')).toBe('');
    });

    it('should handle string numbers', () => {
        expect(formatPriceInput('2800000')).toBe('2.800.000');
    });
});

describe('parsePriceInput', () => {
    it('should parse formatted string to number', () => {
        expect(parsePriceInput('2.800.000')).toBe(2800000);
    });

    it('should parse unformatted string to number', () => {
        expect(parsePriceInput('2800000')).toBe(2800000);
    });

    it('should return null for empty string', () => {
        expect(parsePriceInput('')).toBe(null);
    });

    it('should return null for null input', () => {
        expect(parsePriceInput(null)).toBe(null);
    });

    it('should handle string with currency prefix', () => {
        expect(parsePriceInput('Rp 2.800.000')).toBe(2800000);
    });

    it('should return null for non-numeric string', () => {
        expect(parsePriceInput('abc')).toBe(null);
    });
});
