import { Context, Scenes } from "telegraf";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { User } from "./prisma/client";

interface MyWizardSession extends Scenes.WizardSessionData {
	step: number;
	title: string;
	description: string;
}

interface MySession extends Scenes.WizardSession<MyWizardSession> {}

interface MyContext extends Context {
	user: User;

	send: (text: string, keyboard?: InlineKeyboardButton[][]) => void;
	getMessage: () => string | undefined;

	session: MySession;
	scene: Scenes.SceneContextScene<MyContext, MyWizardSession>;
	wizard: Scenes.WizardContextWizard<MyContext>;
}
