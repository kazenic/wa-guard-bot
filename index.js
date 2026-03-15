const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys")

let antiLink = false

async function startBot() {

const { state, saveCreds } = await useMultiFileAuthState("session")

const sock = makeWASocket({
auth: state
})

sock.ev.on("creds.update", saveCreds)

sock.ev.on("group-participants.update", async (data) => {

const user = data.participants[0]
const group = data.id

if(data.action === "add"){

await sock.sendMessage(group,{
text:`👋 Welcome member baru!

Semoga betah di grup ini

No: ${user}`
})

}

})

sock.ev.on("messages.upsert", async ({ messages }) => {

const msg = messages[0]
if(!msg.message) return

const text = msg.message.conversation || msg.message.extendedTextMessage?.text

const from = msg.key.remoteJid
const sender = msg.key.participant || msg.key.remoteJid

if(!text) return

// ANTILINK ON
if(text === ".antilink on"){
antiLink = true
sock.sendMessage(from,{text:"✅ Anti link aktif dan siap menjaga grup dari link berbahaya"})
}

// ANTILINK OFF
if(text === ".antilink off"){
antiLink = false
sock.sendMessage(from,{text:"❌ Anti link dimatikan"})
}

// DETEKSI LINK
if(antiLink && text.includes("chat.whatsapp.com")){
await sock.sendMessage(from,{text:`⚠️ ${sender} mengirim link!`})
}

// KICK
if(text.startsWith(".kick")){

let number = text.replace(".kick","").trim()

if(!number.includes("@")) number = number+"@s.whatsapp.net"

await sock.groupParticipantsUpdate(from,[number],"remove")

}

// GC CLOSE
if(text === ".gc close"){

await sock.groupSettingUpdate(from,"announcement")

sock.sendMessage(from,{text:"🔒 Grup ditutup (hanya admin yang bisa chat)"})

}

// GC OPEN
if(text === ".gc open"){

await sock.groupSettingUpdate(from,"not_announcement")

sock.sendMessage(from,{text:"🔓 Grup dibuka untuk semua member"})

}

})

}

startBot()
