/**
 * Format a number as Indonesian Rupiah
 * @param {number} value - The price value
 * @returns {string} Formatted price string
 */
export function formatPrice(value) {
    if (value === null || value === undefined) {
        return '-';
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

/**
 * Format price for display in input fields (without currency symbol)
 * @param {number} value - The price value
 * @returns {string} Formatted number string
 */
export function formatPriceInput(value) {
    if (value === null || value === undefined || value === '') {
        return '';
    }

    return new Intl.NumberFormat('id-ID').format(value);
}

/**
 * Parse a formatted price string back to number
 * @param {string} str - The formatted price string
 * @returns {number|null} Parsed number or null
 */
export function parsePriceInput(str) {
    if (!str) return null;
    // Remove all non-digit characters
    const cleaned = str.replace(/\D/g, '');
    const num = parseInt(cleaned, 10);
    return isNaN(num) ? null : num;
}
