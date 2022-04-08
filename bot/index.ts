import { Markup, Telegraf } from "telegraf";
import { config } from "dotenv";
import { writeFile } from "fs/promises";
import { PrismaClient } from "./prisma/client";
import { MyContext } from "./types";

const prisma = new PrismaClient();

config();

const bot = new Telegraf<MyContext>(process.env.BOT_API_KEY as string);

// if (process.env.NODE_ENV === "development") {
// 	bot.use(async (ctx, next) => {
// 		await writeFile("file.json", JSON.stringify(ctx, null, 2), "utf-8");
// 		next();
// 	});
// }

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

	ctx.editMessage = async (text, keyboard) => {
		try {
			if (text) {
				await ctx.editMessageText(text);
			}

			if (keyboard) {
				await ctx.editMessageReplyMarkup({
					inline_keyboard: keyboard,
				});
			}
		} catch (error) {
			console.error(error);
		}
	};

	next();
});

bot.start((ctx) => {
	ctx.reply(
		"Привет! Я Quiz ABC Bot!",
		Markup.inlineKeyboard([
			[{ text: "Кто тебя создал?", callback_data: "q1" }],
			[{ text: "Что такое ConstCode?", url: "https://constcode.ru" }],
		])
	);
});

bot.action("begin", async (ctx) => {
	ctx.editMessage("Привет! Я Quiz ABC Bot!", [
		[{ text: "Кто тебя создал?", callback_data: "q1" }],
		[{ text: "Что такое ConstCode?", url: "https://constcode.ru" }],
	]);
});

bot.action("q1", async (ctx) => {
	ctx.editMessage("Бота создал Алексей Данчин прямо на стриме", [
		[
			{
				text: "Покажи мне этот стрим!",
				url: "https://youtu.be/r9OY9_QIn9Y",
			},
		],
		[
			{
				text: "Покажи код на Github",
				url: "https://github.com/Aleksey-Danchin/quiz_abc_bot",
			},
		],
		[
			{
				text: "Вернуться",
				callback_data: "begin",
			},
		],
	]);
});

bot.launch().then(() => {
	console.log(`Quiz abc bot started! [${process.env.NODE_ENV}]`);
});

bot.catch((err) => console.log(err));
