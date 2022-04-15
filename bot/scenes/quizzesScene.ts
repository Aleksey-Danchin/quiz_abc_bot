import { readFile } from "fs/promises";
import { MiddlewareFn, Scenes } from "telegraf";
import { MyContext } from "../types";
import { resolve } from "path";
import { MAIN_SCENE } from "./mainScene";
import { PrismaClient } from "../prisma/client";
import _ from "lodash";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { CREATE_QUIZ_SCENE } from "./createQuizScene";

export const QUIZZES_SCENE = "quizzes_scene";

const prisma = new PrismaClient();

const BACK_ACTION = "back";
const CREATE_ACTION = "create";

const quizzesScene = new Scenes.BaseScene<MyContext>(QUIZZES_SCENE);

quizzesScene.enter(startHandler());
quizzesScene.action(BACK_ACTION, async (ctx) => {
	await ctx.scene.leave();
	await ctx.scene.enter(MAIN_SCENE);
});

quizzesScene.action(CREATE_ACTION, async (ctx) => {
	await ctx.scene.leave();
	await ctx.scene.enter(CREATE_QUIZ_SCENE);
});

quizzesScene.use(startHandler());

export default quizzesScene;

function startHandler(): MiddlewareFn<MyContext> {
	return async (ctx) => {
		console.log("start handler");
		const message = await readFile(
			resolve(__dirname, "../messages/quizzes.txt"),
			"utf-8"
		);

		const quizzes = await prisma.quiz.findMany({
			where: { authorId: ctx.user.id },
		});

		const chunks = _.chunk(quizzes, 2);

		const keyboard: InlineKeyboardButton[][] = [
			[{ text: "Создать квиз", callback_data: CREATE_ACTION }],
		];

		keyboard.push(
			...chunks.map((row) =>
				row.map((quiz) => ({
					text: quiz.title,
					callback_data: `QUIZ: ${quiz.id}`,
				}))
			)
		);

		keyboard.push([{ text: "Назад", callback_data: BACK_ACTION }]);

		ctx.send(message, keyboard);
	};
}
