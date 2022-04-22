import { readFile } from "fs/promises";
import { deunionize, MiddlewareFn, Scenes } from "telegraf";
import { MyContext } from "../types";
import { resolve } from "path";
import { MAIN_SCENE } from "./mainScene";
import { PrismaClient } from "../prisma/client";
import _ from "lodash";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { CREATE_QUIZ_SCENE } from "./createQuizScene";
import { EDIT_QUIZ_SCENE } from "./editQuizSceen";

export const QUIZZES_SCENE = "quizzes_scene";

const prisma = new PrismaClient();

enum Actions {
	Back = "back",
	Create = "create",
}

const quizzesScene = new Scenes.BaseScene<MyContext>(QUIZZES_SCENE);

quizzesScene.enter(startHandler());
quizzesScene.action(Actions.Back, async (ctx) => {
	await ctx.scene.leave();
	await ctx.scene.enter(MAIN_SCENE);
});

quizzesScene.action(Actions.Create, async (ctx) => {
	await ctx.scene.leave();
	await ctx.scene.enter(CREATE_QUIZ_SCENE);
});

quizzesScene.on("callback_query", async (ctx, next) => {
	const { data } = deunionize(ctx.update.callback_query);

	if (!data) {
		return next();
	}

	const match = data.match(/quiz_id=([a-z0-9]{1,})/i);

	if (match) {
		const quizId = match[1];
		ctx.scene.enter(EDIT_QUIZ_SCENE, { quizId });
		return;
	}

	next();
});

quizzesScene.use(startHandler());

export default quizzesScene;

function startHandler(): MiddlewareFn<MyContext> {
	return async (ctx) => {
		const message = await readFile(
			resolve(__dirname, "../messages/quizzes.txt"),
			"utf-8"
		);

		const quizzes = await prisma.quiz.findMany({
			where: { authorId: ctx.user.id },
		});

		const chunks = _.chunk(quizzes, 2);

		const keyboard: InlineKeyboardButton[][] = [
			[{ text: "Создать квиз", callback_data: Actions.Create }],
		];

		keyboard.push(
			...chunks.map((row) =>
				row.map((quiz) => ({
					text: quiz.title,
					callback_data: `quiz_id=${quiz.id}`,
				}))
			)
		);

		keyboard.push([{ text: "Назад", callback_data: Actions.Back }]);

		ctx.send(message, keyboard);
	};
}
