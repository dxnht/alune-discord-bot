import fetch from "node-fetch";

const DISCORD_TOKEN = "process.env.DISCORD_TOKEN";
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
	console.error(
		"Thiếu DISCORD_TOKEN hoặc DISCORD_CLIENT_ID trong môi trường. Vui lòng thiết lập biến môi trường.",
	);
	process.exit(1);
}

const commands = [
	{
		name: "random",
		description: "Lấy ngẫu nhiên một tướng Liên Minh Huyền Thoại",
		options: [
			{
				name: "role",
				type: 3,
				description:
					"Vị trí muốn lấy ngẫu nhiên (top, jungle, mid, bot, support)",
				required: false,
				choices: [
					{ name: "Top", value: "top" },
					{ name: "Jungle", value: "jungle" },
					{ name: "Mid", value: "mid" },
					{ name: "Bot", value: "bot" },
					{ name: "Support", value: "support" },
				],
			},
		],
	},
	{
		name: "champion",
		description: "Thông tin chi tiết về vị tướng",
		options: [
			{
				name: "name",
				type: 3,
				description: "Enter the champion's name",
				required: true,
				autocomplete: true,
			},
		],
	},
	{
		name: "skins",
		description: "Xem danh sách trang phục của tướng",
		options: [
			{
				name: "name",
				type: 3,
				description: "Nhập tên tướng muốn xem skin",
				required: true,
				autocomplete: true,
			},
		],
	},
	{
		name: "language",
		description: "Chọn ngôn ngữ hiển thị",
		options: [
			{
				name: "lang",
				type: 3,
				description: "Ngôn ngữ (en hoặc vi)",
				required: true,
				choices: [
					{ name: "English", value: "en" },
					{ name: "Vietnamese", value: "vi" },
				],
			},
		],
	},
];

async function registerCommands() {
	const url = `https://discord.com/api/v10/applications/${DISCORD_CLIENT_ID}/commands`;

	console.log("Đang đăng ký lệnh lên Discord...");

	const response = await fetch(url, {
		method: "PUT",
		headers: {
			Authorization: `Bot ${DISCORD_TOKEN}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(commands),
	});

	if (response.ok) {
		console.log("✅ Đăng ký lệnh thành công!");
	} else {
		const error = await response.json();
		console.error("❌ Lỗi đăng ký lệnh:", error);
	}
}

registerCommands();
