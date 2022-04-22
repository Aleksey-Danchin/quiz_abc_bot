import { readFile } from "fs/promises";
import { MiddlewareFn, Scenes } from "telegraf";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { MyContext } from "../types";
import { resolve } from "path";
import { QUIZZES_SCENE } from "./quizzesScene";

export const MAIN_SCENE = "main_scene";

enum Actions {
	Back = "back",
	Quizzes = "quizzes",
	Forms = "forms",
	Information = "information",
}

const mainScene = new Scenes.BaseScene<MyContext>(MAIN_SCENE);

const mainKeyboards: InlineKeyboardButton[][] = [
	[{ text: "Мои квизы", callback_data: Actions.Quizzes }],
	[{ text: "Мои формы", callback_data: Actions.Forms }],
	[{ text: "Информация", callback_data: Actions.Information }],
];

mainScene.enter(startHandler());
mainScene.action(Actions.Back, startHandler());

mainScene.action(Actions.Quizzes, async (ctx) => {
	await ctx.scene.leave();
	await ctx.scene.enter(QUIZZES_SCENE);
});

mainScene.action(Actions.Forms, async (ctx) => {
	ctx.send("Тут будет информация по твои формам", [
		[{ text: "Вернуться", callback_data: Actions.Back }],
	]);
});

mainScene.action(Actions.Information, async (ctx) => {
	ctx.send("Тут будет информация о боте и разработчиках", [
		[{ text: "Вернуться", callback_data: Actions.Back }],
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
