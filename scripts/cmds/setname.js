const fs = require("fs");
const path = require("path");
const filePath = path.join(__dirname, "setname.json");

async function checkShortCut(nickname, uid, usersData) {
  try {
    if (/\{userName\}/gi.test(nickname))
      nickname = nickname.replace(/\{userName\}/gi, await usersData.getName(uid));
    if (/\{userID\}/gi.test(nickname))
      nickname = nickname.replace(/\{userID\}/gi, uid);
    return nickname;
  } catch (e) {
    return nickname;
  }
}

let nicknameProtection = {};
if (fs.existsSync(filePath)) {
  nicknameProtection = JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function saveData() {
  fs.writeFileSync(filePath, JSON.stringify(nicknameProtection, null, 2));
}

module.exports = {
  config: {
    name: "setname",
    version: "3.1",
    author: "Gemini",
    countDown: 5,
    role: 1, // أدمن البوت فقط
    description: {
      ar: "تبديل كنيات الأعضاء وتفعيل الحماية التلقائية ضد التغيير"
    },
    category: "صندوق الدردشة",
    guide: " {pn} الكل <الكنية>: تبديل كنية الكل وتفعيل الحماية\nمثال: {pn} الكل {userName} | عضو" // <-- هنا صلحتها. وليت string مباشرة
  },

  onStart: async function ({ args, message, event, api, usersData }) {
    const threadID = event.threadID;
    const nickname = args.slice(1).join(" ");

    if (args[0]!== "الكل" && args[0]!== "all")
      return message.reply("❌ الطريقة: /setname الكل <الكنية>\nمثال: /setname الكل {userName} | عضو");

    if (!nickname)
      return message.reply("❌ خاصك تحدد الكنية اللي بغيتي");

    const uids = (await api.getThreadInfo(threadID)).participantIDs;

    for (const uid of uids) {
      const finalName = await checkShortCut(nickname, uid, usersData);
      await api.changeNickname(finalName, threadID, uid);
      nicknameProtection[threadID] = nicknameProtection[threadID] || {};
      nicknameProtection[threadID][uid] = finalName;
    }

    saveData();
    return message.reply(`✅ تم تبديل ${uids.length} كنية وتفعيل الحماية بنجاح.`);
  },

  onEvent: async function ({ event, api }) {
    if (event.logMessageType === "log:user-nickname") {
      const threadID = event.threadID;
      const targetUID = event.logMessageData.participant_id;
      const authorID = event.author;
      const botID = api.getCurrentUserID();

      if (nicknameProtection[threadID] && nicknameProtection[threadID][targetUID] && authorID!== botID) {
        const protectedName = nicknameProtection[threadID][targetUID];
        try {
          await api.changeNickname(protectedName, threadID, targetUID);
        } catch (e) {}
      }
    }
  }
};
