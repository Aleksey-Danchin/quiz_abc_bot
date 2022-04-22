import { readFile } from "fs/promises";
import { MiddlewareFn, Scenes } from "telegraf";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { MyContext } from "../types";
import { resolve } from "path";
import { QUIZZES_SCENE } from "./quizzesScene";
import prisma from "../prisma";

export const EDIT_QUIZ_SCENE = "edit_quiz_scene";

enum Actions {
	ChangeName = "change_name",
	ChangeDescription = "change_description",
	Back = "back",
}

const editQuizScene = new Scenes.BaseScene<MyContext>(EDIT_QUIZ_SCENE);

const mainKeyboards: InlineKeyboardButton[][] = [
	[
		{ text: "Изменить название", callback_data: Actions.ChangeName },
		{ text: "Изменить описание", callback_data: Actions.ChangeDescription },
	],
	[{ text: "Назад", callback_data: Actions.Back }],
];

editQuizScene.enter(startHandler());

editQuizScene.action(Actions.ChangeName, async (ctx) => {
	ctx.scene.state.step = Actions.ChangeName;
	await ctx.send(`Старое название: ${ctx.quiz?.title}\nНовое название:`);
});

editQuizScene.action(Actions.ChangeDescription, async (ctx) => {
	ctx.scene.state.step = Actions.ChangeDescription;
	await ctx.send(
		`Старое описание: \n\n${ctx.quiz?.description}\nНовое описание:`
	);
});

editQuizScene.action(Actions.Back, async (ctx) => {
	ctx.scene.enter(QUIZZES_SCENE);
});

editQuizScene.on("text", async (ctx, next) => {
	if (ctx.scene.state.step !== Actions.ChangeName) {
		return next();
	}

	const message = ctx.getMessage();

	if (!message) {
		await ctx.send("Пожалуйства, введи новое название!");
		return;
	}

	if (ctx.quiz) {
		delete ctx.scene.state.step;
		ctx.quiz.title = message;

		ctx.quiz = await prisma.quiz.update({
			where: { id: ctx.quiz.id },
			data: ctx.quiz,
		});
	}

	next();
});

editQuizScene.on("text", async (ctx, next) => {
	if (ctx.scene.state.step !== Actions.ChangeDescription) {
		return next();
	}

	const message = ctx.getMessage();

	if (!message) {
		await ctx.send("Пожалуйства, введи новое описание!");
		return;
	}

	if (ctx.quiz) {
		delete ctx.scene.state.step;
		ctx.quiz.description = message;

		ctx.quiz = await prisma.quiz.update({
			where: { id: ctx.quiz.id },
			data: ctx.quiz,
		});
	}

	next();
});

editQuizScene.use(startHandler());

export default editQuizScene;

function startHandler(): MiddlewareFn<MyContext> {
	return async (ctx) => {
		if (ctx.scene.state.quizId) {
			if (ctx.quizId !== ctx.scene.state.quizId) {
				ctx.quizId = ctx.scene.state.quizId;
				ctx.session.quizId = ctx.scene.state.quizId;

				ctx.quiz = await prisma.quiz.findFirst({
					where: { id: ctx.quizId },
				});
			}
		} else {
			throw Error(
				"В сцену редактирования квиза нужно заходить с initState и quizId"
			);
		}

		// const message = await readFile(
		// 	resolve(__dirname, "../messages/editQuiz.txt"),
		// 	"utf-8"
		// );

		ctx.send(
			`${ctx.quiz?.title}\n\n${ctx.quiz?.description}`,
			mainKeyboards
		);
	};
}
