import { readFile } from "fs/promises";
import { MiddlewareFn, Scenes } from "telegraf";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { MyContext } from "../types";
import { resolve } from "path";
import { QUIZZES_SCENE } from "./quizzesScene";

export const MAIN_SCENE = "main_scene";

const BACK_ACTION = "back";
const QUIZZES_ACTION = "quizzes";
const FORMS_ACTION = "forms";
const INFORMATION_ACTION = "information";

const mainScene = new Scenes.BaseScene<MyContext>(MAIN_SCENE);

const mainKeyboards: InlineKeyboardButton[][] = [
	[{ text: "Мои квизы", callback_data: QUIZZES_ACTION }],
	[{ text: "Мои формы", callback_data: FORMS_ACTION }],
	[{ text: "Информация", callback_data: INFORMATION_ACTION }],
];

mainScene.enter(startHandler());
mainScene.action(BACK_ACTION, startHandler());

mainScene.action(QUIZZES_ACTION, async (ctx) => {
	await ctx.scene.leave();
	await ctx.scene.enter(QUIZZES_SCENE);
});

mainScene.action(FORMS_ACTION, async (ctx) => {
	ctx.send("Тут будет информация по твои формам", [
		[{ text: "Вернуться", callback_data: BACK_ACTION }],
	]);
});

mainScene.action(INFORMATION_ACTION, async (ctx) => {
	ctx.send("Тут будет информация о боте и разработчиках", [
		[{ text: "Вернуться", callback_data: BACK_ACTION }],
	]);
});

mainScene.use(startHandler());

export default mainScene;

function startHandler(): MiddlewareFn<MyContext> {
	return async (ctx) => {
		const message = await readFile(
			resolve(__dirname, "../messages/greeting.txt"),
			"utf-8"
		);
		ctx.send(message, mainKeyboards);
	};
}
