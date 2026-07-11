import { customAlphabet } from "nanoid";

const NANOID_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_-";
const NANOID_LENGTH = 5;

const nanoid = customAlphabet(NANOID_ALPHABET, NANOID_LENGTH);

export class BarcodeCodeGenerator {
    generate(): string {
        return nanoid();
    }
}
