import type { AppWalletModel } from "./AppWalletModel";

export interface UserModel {
    id: string,
    firstName: string,
    lastName: string,
    fullName: string,
    username: string,
    createdAt: Date,
    updatedAt: Date,
    Wallet: AppWalletModel
}