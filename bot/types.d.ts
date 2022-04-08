import { Context } from "telegraf";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { User } from "./prisma/client";

export interface MyContext extends Context {
	user: User;

	editMessage: (text: string, keyboard?: InlineKeyboardButton[][]) => void;
}
