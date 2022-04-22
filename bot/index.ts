import { Markup, Scenes, Telegraf, session, deunionize } from "telegraf";
import { config } from "dotenv";
import { writeFile } from "fs/promises";

import { MyContext } from "./types";
import mainScene, { MAIN_SCENE } from "./scenes/mainScene";
import quizzesScene, { QUIZZES_SCENE } from "./scenes/quizzesScene";
import createQuizScene, { CREATE_QUIZ_SCENE } from "./scenes/createQuizScene";
import editQuizScene from "./scenes/editQuizSceen";
import prisma from "./prisma";

const stage = new Scenes.Stage<MyContext>([
	quizzesScene,
	mainScene,
	createQuizScene,
	editQuizScene,
]);

config();

const bot = new Telegraf<MyContext>(process.env.BOT_API_KEY as string);

bot.use(session());

bot.use(async (ctx, next) => {
	const chat = ctx.chat;

	if (!chat || chat.type !== "private") {
		return;
	}

	let user = await prisma.user.findFirst({ where: { id: chat.id } });

	if (user) {
		ctx.user = user;
	} else {
		ctx.user = await prisma.user.create({
			data: {
				id: chat.id,
				firstName: chat.first_name ?? "",
				lastName: chat.last_name ?? "",
				username: chat.username ?? "",
			},
		});
	}

	if (ctx.session?.quizId) {
		ctx.quizId = ctx.session.quizId;
		ctx.quiz = await prisma.quiz.findFirst({ where: { id: ctx.quizId } });
	}

	ctx.send = async (text, keyboard) => {
		try {
			if (ctx.callbackQuery) {
				await ctx.editMessageText(text);

				if (keyboard) {
					await ctx.editMessageReplyMarkup({
						inline_keyboard: keyboard,
					});
				}
			} else {
				if (keyboard) {
					await ctx.reply(text, Markup.inlineKeyboard(keyboard));
				} else {
					await ctx.reply(text);
				}
			}
		} catch (error) {
			console.error(error);
		}
	};

	ctx.getMessage = () => {
		if (!ctx.update) {
			return;
		}

		const update = deunionize(ctx.update);

		if (!update.message) {
			return;
		}

		const message = deunionize(update.message);

		if (!message.text) {
			return;
		}

		return message.text;
	};

	return next();
});

if (process.env.NODE_ENV === "development") {
	bot.use(async (ctx, next) => {
		await writeFile("file.json", JSON.stringify(ctx, null, 2), "utf-8");
		next();
	});
}

bot.use(stage.middleware());

bot.use((ctx) => ctx.scene.enter(QUIZZES_SCENE));
// bot.use((ctx) => ctx.scene.enter(CREATE_QUIZ_SCENE));

bot.launch().then(() => {
	console.log(`Quiz abc bot started! [${process.env.NODE_ENV}]`);
});

bot.catch((err) => console.log(err));

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

// bot.start((ctx) => {
// 	ctx.reply(
// 		"Привет! Я Quiz ABC Bot!",
// 		Markup.inlineKeyboard([
// 			[{ text: "Кто тебя создал?", callback_data: "q1" }],
// 			[{ text: "Что такое ConstCode?", url: "https://constcode.ru" }],
// 		])
// 	);
// });

// bot.action("begin", async (ctx) => {
// 	ctx.editMessage("Привет! Я Quiz ABC Bot!", [
// 		[{ text: "Кто тебя создал?", callback_data: "q1" }],
// 		[{ text: "Что такое ConstCode?", url: "https://constcode.ru" }],
// 	]);
// });

// bot.action("q1", async (ctx) => {
// 	ctx.editMessage("Бота создал Алексей Данчин прямо на стриме", [
// 		[
// 			{
// 				text: "Покажи мне этот стрим!",
// 				url: "https://youtu.be/r9OY9_QIn9Y",
// 			},
// 		],
// 		[
// 			{
// 				text: "Покажи код на Github",
// 				url: "https://github.com/Aleksey-Danchin/quiz_abc_bot",
// 			},
// 		],
// 		[
// 			{
// 				text: "Вернуться",
// 				callback_data: "begin",
// 			},
// 		],
// 	]);
// });
