/* eslint-disable prettier/prettier */

import * as crypto from 'crypto';

export class VRF {
    private secretKey = process.env.VRF_SECRET_KEY;

    /**
     * Generates a random number using a cryptographic function and returns it along with a hash.
     * @returns {number} Random number
     * @returns {string} Hash used to verify the random number
     */
    generate(): { randomNumber: number, hash: string; } {
        const randomBytes = crypto.randomBytes(32); // Generate a 32-byte random value
        const randomNumber = parseInt(randomBytes.toString('hex'), 16); // Convert to number

        // Generate a hash using the secret key and the random number
        const hash = crypto.createHmac('sha256', this.secretKey)
            .update(randomBytes)
            .digest('hex');

        return { randomNumber, hash };
    }

    /**
     * Verifies if the generated random number corresponds to the provided hash.
     * @param {number} number The random number to verify.
     * @param {string} hash The expected hash.
     * @returns {boolean} Returns true if the number and hash match, otherwise false.
     */
    verify(number: number, hash: string): boolean {
        // Recreate the random bytes from the number
        const numberAsHex = number.toString(16).padStart(64, '0');
        const randomBytes = Buffer.from(numberAsHex, 'hex');

        // Generate a hash from the random number and secret key
        const computedHash = crypto.createHmac('sha256', this.secretKey)
            .update(randomBytes)
            .digest('hex');

        return computedHash === hash; // Check if the generated hash matches the provided one
    }
}