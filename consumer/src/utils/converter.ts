/* eslint-disable prettier/prettier */

// Import the base converter function for unit conversions
import convert from './baseconverter';

const Converter = {
    /**
     * Converts a value down to a smaller unit scale.
     * This is used to convert values into a more human-readable format (e.g., from smallest unit to a larger one).
     * 
     * @param {bigint} value - The value to convert.
     * @param {number} decimals - The number of decimal places to round the result to.
     * @returns {string} - The converted value as a string.
     */
    down: function (value: bigint, decimals: number): string {
        try {
            // Return '0' if the value is 0, as there's nothing to convert
            if (value == BigInt(0)) return '0';

            // Convert value down to the desired decimal scale using the 'convert' function
            return convert(value, "1", decimals);
        } catch (error) {
            // Log any error that occurs during the conversion process
            console.error('octas', error);

            // Return '0' if there's an error during conversion
            return '0';
        }
    },

    /**
     * Converts a value up to a larger unit scale.
     * This is used to convert smaller units into a larger unit scale (e.g., from smallest unit to a larger one).
     * 
     * @param {bigint} value - The value to convert.
     * @param {number} decimals - The number of decimal places to round the result to.
     * @returns {string} - The converted value as a string.
     */
    up: function (value: bigint, decimals: number): string {
        try {
            // Return '0' if the value is 0, as there's nothing to convert
            if (value == BigInt(0)) return '0';

            // Convert value up to the desired decimal scale using the 'convert' function
            return convert(value, decimals, "1");
        } catch (error) {
            // Log any error that occurs during the conversion process
            console.error('apt', error);

            // Return '0' if there's an error during conversion
            return '0';
        }
    }
};

export default Converter;
