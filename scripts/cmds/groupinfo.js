module.exports = {
  config: {
    name: "groupinfo",
    version: "2.1",
    author: "Gemini",
    countDown: 3,
    role: 0, // أي واحد يقدر
    description: {
      ar: "يعرض معلومات المجموعة كاملة"
    },
    category: "معلومات",
    guide: {
      ar: " {pn} : يعرض معلومات المجموعة"
    }
  },

  onStart: async function ({ message, event, api, usersData }) {
    try {
      const threadID = event.threadID;
      const threadInfo = await api.getThreadInfo(threadID);
      const botID = api.getCurrentUserID();

      const name = threadInfo.threadName || "بدون اسم";
      const totalUsers = threadInfo.participantIDs.length;
      const adminIDs = threadInfo.adminIDs.map(e => e.id);
      const totalAdmins = adminIDs.length;
      const isBotAdmin = adminIDs.includes(botID);
      const approvalMode = threadInfo.approvalMode ? "✅ مفعل" : "❌ معطل";

      // أسماء المشرفين
      let adminNames = [];
      for (const id of adminIDs) {
        adminNames.push(`• ${(await usersData.getName(id))}`);
      }
      if(adminNames.length === 0) adminNames = ["لا يوجد"];

      const msg = 
`╭─────⭓ معلومات المجموعة
│ 📛 الاسم: ${name}
│ 🆔 UID: ${threadID}
│ 👥 الأعضاء: ${totalUsers}
│ 👑 المشرفين: ${totalAdmins}
│ 🔐 الموافقة: ${approvalMode}
│ 🤖 البوت مسؤول: ${isBotAdmin ? "✅ آه" : "❌ لا"}
│
│ 👑 المشرفين:
${adminNames.join("\n")}
╰────────────⭓`;

      return message.reply(msg);

    } catch (e) {
      return message.reply("❌ خطأ: " + e.message);
    }
  }
};
