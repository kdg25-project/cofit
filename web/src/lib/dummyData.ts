// ダミーデータ集約ファイル
// バックエンド実装時はこのファイルを参照してAPIエンドポイントを実装してください

// メッセージの型定義
export interface Message {
	id: number;
	userId: string;
	userName: string;
	message: string;
	timestamp: string;
	isToday: boolean;
}

// フレンドの型定義
export interface Friend {
	id: number;
	name: string;
	message: string;
	time: string;
	unread: number;
}

// フレンド申請の型定義
export interface FriendRequest {
	id: number;
	name: string;
}

// チャットメッセージのダミーデータ
export const dummyMessages: Message[] = [
	{
		id: 1,
		userId: "1",
		userName: "飯田　陸",
		message: "テキストテキストテキストテキスト\nテキストテキストテキストテキスト",
		timestamp: "1/28 19:01",
		isToday: false,
	},
	{
		id: 2,
		userId: "2",
		userName: "不労所得万歳",
		message: "テキストテキストテキストテキスト\nテキストテキストテキストテキスト",
		timestamp: "1/28 19:01",
		isToday: false,
	},
	{
		id: 3,
		userId: "2",
		userName: "不労所得万歳",
		message: "テキストテキストテキストテキスト\nテキストテキストテキストテキスト",
		timestamp: "1/28 19:01",
		isToday: false,
	},
	{
		id: 4,
		userId: "2",
		userName: "不労所得万歳",
		message: "テキストテキストテキストテキスト\nテキストテキストテキストテキスト",
		timestamp: "19:01",
		isToday: true,
	},
];

// フレンドリストのダミーデータ
export const dummyFriends: Friend[] = [
	{ id: 1, name: "飯田　陸", message: "デザインまだ？", time: "11:34", unread: 1 },
	{ id: 2, name: "なかもと きょうすけ", message: "おつ〜", time: "11:34", unread: 1 },
	{ id: 3, name: "aomona", message: "ごめ〜〜ん。。。寝てた", time: "11:34", unread: 1 },
	{ id: 4, name: "こじま　ゆうせい", message: "インターンdesu", time: "11:34", unread: 0 },
	{ id: 5, name: "しおん", message: "一本だけ！！", time: "11:34", unread: 0 },
	{ id: 6, name: "長田", message: "それは僕の一存で決められることじゃないから.....", time: "11:34", unread: 0 },
	{ id: 7, name: "たつき", message: "Copilotおすすめです！", time: "11:34", unread: 0 },
];

// フレンド申請のダミーデータ
export const dummyFriendRequests: FriendRequest[] = [
	{ id: 1, name: "飯田　陸" },
	{ id: 2, name: "飯田　陸" },
	{ id: 3, name: "飯田　陸" },
	{ id: 4, name: "飯田　陸" },
	{ id: 5, name: "飯田　陸" },
	{ id: 6, name: "飯田　陸" },
];
