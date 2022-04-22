import { Context, Scenes } from "telegraf";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { Quiz, User } from "./prisma/client";

interface MyWizardSession extends Scenes.WizardSessionData {
	step: number;
	title: string;
	description: string;
}

interface MySession extends Scenes.WizardSession<MyWizardSession> {
	quizId?: string;
}

interface MySceneContextScene
	extends Scenes.SceneContextScene<MyContext, MyWizardSession> {
	state: {
		quizId?: string;
		step?: string;
	};
}

interface MyContext extends Context {
	user: User;

	quizId?: string;
	quiz: Quiz | null;

	send: (text: string, keyboard?: InlineKeyboardButton[][]) => void;
	getMessage: () => string | undefined;

	session: MySession;
	scene: MySceneContextScene;
	wizard: Scenes.WizardContextWizard<MyContext>;
}
