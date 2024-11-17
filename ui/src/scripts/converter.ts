import convert from './baseconverter';
import { BigNumber } from 'bignumber.js';

const Converter = {
    getAverage: (answers: BigNumber[]): BigNumber => {
        return (answers.reduce((sum, answer) => sum.plus(answer))).div(new BigNumber(answers.length));
    },

    validateEmail: (email: string) => {
        const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    toChecksumAddress: function (address: `ak_${string}`, space: number = 4) {
        return address.substring(0, space + 3) + '...' +
            address.substring(address.length - space, address.length);
    },

    formatNumber: function (value: number) {
        if (value >= 1e9) {
            return (value / 1e9).toFixed(1) + 'b';
        } else if (value >= 1e6) {
            return (value / 1e6).toFixed(1) + 'm';
        } else if (value >= 1e3) {
            return (value / 1e3).toFixed(1) + 'k';
        } else {
            return value.toString();
        }
    },

    /**
     * Converts a value down to a smaller unit scale.
     * This is used to convert values into a more human-readable format (e.g., from smallest unit to a larger one).
     * 
     * @param {bigint} value - The value to convert.
     * @param {number} decimals - The number of decimal places to round the result to.
     * @returns {string} - The converted value as a string.
     */
    down: function (value: BigNumber, decimals: number): BigNumber {
        try {
            // Return '0' if the value is 0, as there's nothing to convert
            if (value.eq(0)) return value;

            // Convert value down to the desired decimal scale using the 'convert' function
            return convert(value, "0", decimals);
        } catch (error) {
            // Log any error that occurs during the conversion process
            console.error('convert', error);

            // Return '0' if there's an error during conversion
            return new BigNumber(0);
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
    up: function (value: BigNumber, decimals: number): BigNumber {
        try {
            // Return '0' if the value is 0, as there's nothing to convert
            if (value.eq(0)) return value;

            // Convert value up to the desired decimal scale using the 'convert' function
            return convert(value, decimals, "0");
        } catch (error) {
            // Log any error that occurs during the conversion process
            console.error('convert', error);

            // Return '0' if there's an error during conversion
            return new BigNumber(0);
        }
    },

    convert: function (value: BigNumber, decimals0: BigNumber, decimals1: number): BigNumber {
        try {
            // Return '0' if the value is 0, as there's nothing to convert
            if (value.eq(0)) return value;

            // Convert value up to the desired decimal scale using the 'convert' function
            return convert(value, decimals0, decimals1);
        } catch (error) {
            // Log any error that occurs during the conversion process
            console.error('convert', error);

            // Return '0' if there's an error during conversion
            return new BigNumber(0);
        }
    },

    convertSecondsToHHMMSS: function (ms: number): string {
        const seconds = Math.floor(ms / 1000);

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        // Pad with leading zeros if necessary
        const hoursStr = hours.toString().padStart(2, '0');
        const minutesStr = minutes.toString().padStart(2, '0');
        const secsStr = secs.toString().padStart(2, '0');

        return `${hoursStr}:${minutesStr}:${secsStr}`;
    },

    convertSecondsToMMSS: function (ms: number): string {
        const seconds = Math.floor(ms / 1000);

        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        // Pad with leading zeros if necessary
        const minutesStr = minutes.toString().padStart(2, '0');
        const secsStr = secs.toString().padStart(2, '0');

        return `${minutesStr}:${secsStr}`;
    },

    toMoney: function (amount: any, max = null) {
        let maxF = max ? max : 6;
        if (amount > 1) {
            maxF = 10;
        }
        if (amount > 10) {
            maxF = 8;
        }
        if (amount > 200) {
            maxF = 5;
        }
        if (amount > 1000) {
            maxF = 3;
        }

        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: maxF
        });
        return formatter.format(amount).replace('$', '');
    },

    fullMonth: function (date: Date): string {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' };
        return date.toLocaleString('en-US', options);
    },

    nFormatter: function (num: number, digits: number) {
        if (num < 1000) return this.toMoney(num);
        const lookup = [
            { value: 1, symbol: "" },
            { value: 1e3, symbol: "k" },
            { value: 1e6, symbol: "M" },
            { value: 1e9, symbol: "G" },
            { value: 1e12, symbol: "T" },
            { value: 1e15, symbol: "P" },
            { value: 1e18, symbol: "E" }
        ];
        const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
        const item = lookup.slice().reverse().find(function (item) {
            return num >= item.value;
        });
        const result = item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
        return result.replace('$', '');
    }
};

export default Converter;