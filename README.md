# MCServStatus
This is a discord bot that will keep track of minecraft servers on multiple discord servers.
config.json not included, but when you make it, it must include 
`{token: <token>, serverIP: <MinecraftServerIP>, and clientId: <ClientID>}`

Features:
  Store pairs of Discord Servers and Minecraft Servers in a serverinfo.json file
  Scalable to any number of servers
  Interact with MCSRVSTAT through a modified version of this wrapper https://github.com/azpha/mcsrvstat-js
  slash commands
  returns an embed with basic Minecraft Server information when /info is used
