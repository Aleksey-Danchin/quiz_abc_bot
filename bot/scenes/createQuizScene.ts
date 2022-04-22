import { readFile } from "fs/promises";
import { MiddlewareFn, Scenes, deunionize } from "telegraf";
import { MyContext } from "../types";
import { resolve } from "path";
import { PrismaClient } from "../prisma/client";
import _ from "lodash";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { QUIZZES_SCENE } from "./quizzesScene";
import { EDIT_QUIZ_SCENE } from "./editQuizSceen";

export const CREATE_QUIZ_SCENE = "create_quiz_scene";

const prisma = new PrismaClient();

const BACK_ACTION = "back";

const step1: MiddlewareFn<MyContext> = async (ctx) => {
	await ctx.send("Название квиза:");
	return ctx.wizard.next();
};

const step2: MiddlewareFn<MyContext> = async (ctx) => {
	const message = ctx.getMessage();

	if (!message) {
		await ctx.send("Нужно название квиза:");
		return;
	}

	ctx.scene.session.title = message;
	await ctx.send("Дай небольшое описание квизу:");
	return ctx.wizard.next();
};

const step3: MiddlewareFn<MyContext> = async (ctx) => {
	const message = ctx.getMessage();

	if (!message) {
		await ctx.send("Нужно небольшое описание квизу:");
		return;
	}

	ctx.scene.session.description = message;

	const quiz = await prisma.quiz.create({
		data: {
			authorId: ctx.user.id,
			title: ctx.scene.session.title,
			description: ctx.scene.session.description,
		},
	});

	return ctx.scene.enter(EDIT_QUIZ_SCENE, { quizId: quiz.id });
};

const createQuizScene = new Scenes.WizardScene<MyContext>(
	CREATE_QUIZ_SCENE,
	step1,
	step2,
	step3
);

// createQuizScene.enter(startHandler());
// createQuizScene.action(BACK_ACTION, async (ctx) => {
// 	await ctx.scene.leave();
// 	await ctx.scene.enter(QUIZZES_SCENE);
// });

// createQuizScene.use(startHandler());

export default createQuizScene;

// function startHandler(): MiddlewareFn<MyContext> {
// 	return async (ctx) => {
// const message = await readFile(
// 	resolve(__dirname, "../messages/createQuiz.txt"),
// 	"utf-8"
// );
// 		const keyboard: InlineKeyboardButton[][] = [];

// 		keyboard.push([{ text: "Назад", callback_data: BACK_ACTION }]);

// 		ctx.send(message, keyboard);
// 	};
// }
