import bcrypt from "bcrypt";
export const Hash = async (plainText, salt_rounds=12) => {
    return await bcrypt.hashSync(plainText, salt_rounds);
};

export const Compare = async (plainText, cipherText) => {
    return await bcrypt.compareSync(plainText, cipherText);
};