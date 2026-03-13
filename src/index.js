import { verifySignature } from "./verify.js";
import {
	getChampionData,
	getChampionDetails,
	getUserLanguage,
	setUserLanguage,
} from "./data.js";

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);

		if (request.method === "GET" && url.pathname === "/") {
			return new Response("👋 Alune Bot is running!");
		}

		if (request.method === "POST" && url.pathname === "/interactions") {
			const { isValid, body } = await verifySignature(
				request,
				env.DISCORD_PUBLIC_KEY,
			);
			if (!isValid)
				return new Response("Invalid signature", { status: 401 });

			const interaction = JSON.parse(body);

			// 1. PING
			if (interaction.type === 1) return jsonResponse({ type: 1 });

			// 2. AUTOCOMPLETE
			if (interaction.type === 4) {
				const focusedOption = interaction.data.options.find(
					(o) => o.focused,
				);
				const focusedValue = focusedOption ? focusedOption.value : "";
				const userId = interaction.user
					? interaction.user.id
					: interaction.member.user.id;
				const lang = await getUserLanguage(userId, env);
				const champions = await getChampionData(lang, env);

				const choices = Object.keys(champions || {})
					.filter((key) =>
						champions[key].name
							.toLowerCase()
							.includes(focusedValue.toLowerCase()),
					)
					.slice(0, 25)
					.map((key) => ({
						name: champions[key].name,
						value: champions[key].id,
					}));

				return jsonResponse({ type: 8, data: { choices } });
			}

			// 3. COMMANDS & BUTTONS
			if (interaction.type === 2 || interaction.type === 3) {
				const responseType = interaction.type === 2 ? 5 : 6;
				ctx.waitUntil(handleDeferred(interaction, env));
				return jsonResponse({
					type: responseType,
					data: { flags: 64 },
				});
			}
		}
		return new Response("Not found", { status: 404 });
	},
};

async function handleDeferred(interaction, env) {
	const appId = interaction.application_id;
	const token = interaction.token;
	const userId = interaction.user
		? interaction.user.id
		: interaction.member.user.id;
	const userLang = await getUserLanguage(userId, env);
	let resultData = {
		content: "⚠️ Đã có lỗi xảy ra khi lấy dữ liệu từ Riot.",
	};

	try {
		if (interaction.type === 2) {
			const { name, options } = interaction.data;
			if (name === "language") {
				const lang = options[0].value;
				await setUserLanguage(userId, lang, env);
				resultData = {
					embeds: [
						{
							color: lang === "en" ? 0x007bff : 0xff4500,
							title:
								lang === "en"
									? "Language Updated"
									: "Cập nhật ngôn ngữ",
							description:
								lang === "en"
									? "Your language has been updated to **English** 🇬🇧."
									: "Ngôn ngữ của bạn đã được cập nhật sang **Tiếng Việt** 🇻🇳.",
						},
					],
				};
			} else if (name === "random") {
				const role = options?.find((o) => o.name === "role")?.value;
				const res = await handleRandomLogic(role, userLang, env);
				resultData = res.data;
			} else if (name === "champion") {
				const championId = options[0].value;
				const detailed = await getChampionDetails(
					championId,
					userLang,
					env,
				);
				if (detailed) {
					resultData = {
						embeds: [
							{
								color: 0xb6d0e2,
								title: detailed.name,
								description: detailed.title,
								thumbnail: {
									url: `https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/${championId}.png`,
								},
								image: {
									url: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championId}_0.jpg`,
								},
								fields: [
									{
										name:
											userLang === "en"
												? "Role"
												: "Vai trò",
										value: detailed.tags.join(", "),
										inline: true,
									},
									{
										name:
											userLang === "en"
												? "Blurb"
												: "Mô tả",
										value: detailed.lore || "...",
									},
								],
							},
						],
					};
				}
			} else if (name === "skins") {
				const championId = options[0].value;
				const res = await handleSkinsLogic(
					championId,
					0,
					userLang,
					env,
				);
				resultData = res.data;
			}
		} else if (interaction.type === 3) {
			const [type, action, championId, indexStr] =
				interaction.data.custom_id.split("_");
			if (type === "random") {
				const res = await handleRandomLogic(
					championId || null,
					userLang,
					env,
				);
				resultData = res.data;
			} else if (type === "skin") {
				const res = await handleSkinsLogic(
					championId,
					parseInt(indexStr),
					userLang,
					env,
				);
				resultData = res.data;
			}
		}

		await fetch(
			`https://discord.com/api/v10/webhooks/${appId}/${token}/messages/@original`,
			{
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ...resultData, flags: 64 }),
			},
		);
	} catch (err) {
		console.error("Deferred Error:", err);
	}
}

async function handleRandomLogic(role, language, env) {
	const champions = await getChampionData(language, env);
	if (!champions)
		return { data: { content: "❌ Không thể tải dữ liệu tướng." } };
	const roleMap =
		language === "en"
			? {
					top: ["Fighter", "Tank"],
					jungle: ["Assassin", "Fighter"],
					mid: ["Mage", "Assassin"],
					bot: ["Marksman"],
					support: ["Support", "Tank"],
				}
			: {
					top: ["Đấu Sĩ", "Đỡ Đòn"],
					jungle: ["Sát Thủ", "Đấu Sĩ"],
					mid: ["Pháp Sư", "Sát Thủ"],
					bot: ["Xạ Thủ"],
					support: ["Hỗ Trợ", "Đỡ Đòn"],
				};
	let filtered = Object.values(champions);
	if (role)
		filtered = filtered.filter((champ) =>
			champ.tags.some((tag) => roleMap[role].includes(tag)),
		);
	const champion = filtered[Math.floor(Math.random() * filtered.length)];
	return {
		data: {
			embeds: [
				{
					color: 0xb6d0e2,
					title: role
						? `${role.toUpperCase()} | ${champion.name}`
						: champion.name,
					description: champion.title,
					thumbnail: {
						url: `https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/${champion.id}.png`,
					},
					image: {
						url: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_0.jpg`,
					},
					fields: [
						{
							name: language === "en" ? "Role" : "Vai trò",
							value: champion.tags.join(", "),
							inline: true,
						},
						{
							name: language === "en" ? "Blurb" : "Mô tả",
							value: champion.blurb,
						},
					],
				},
			],
			components: [
				{
					type: 1,
					components: [
						{
							type: 2,
							style: 1,
							label: "Random",
							custom_id: `random_again_${role || ""}`,
						},
					],
				},
			],
		},
	};
}

async function handleSkinsLogic(championId, index, language, env) {
	const detailed = await getChampionDetails(championId, language, env);
	if (!detailed)
		return { data: { content: "❌ Không thể tải dữ liệu skin." } };
	const skins = detailed.skins;
	const skin = skins[index];
	const total = skins.length;
	return {
		data: {
			embeds: [
				{
					color: 0xb6d0e2,
					title: `${detailed.name} - ${skin.name === "default" ? (language === "en" ? "Default" : "Mặc định") : skin.name}`,
					description: `${language === "en" ? "Skin" : "Trang phục"} ${index + 1} / ${total}`,
					image: {
						url: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championId}_${skin.num}.jpg`,
					},
				},
			],
			components: [
				{
					type: 1,
					components: [
						{
							type: 2,
							style: 2,
							label: "◀",
							custom_id: `skin_prev_${championId}_${(index - 1 + total) % total}`,
						},
						{
							type: 2,
							style: 2,
							label: "▶",
							custom_id: `skin_next_${championId}_${(index + 1) % total}`,
						},
					],
				},
			],
		},
	};
}

function jsonResponse(obj) {
	return new Response(JSON.stringify(obj), {
		headers: { "Content-Type": "application/json" },
	});
}
