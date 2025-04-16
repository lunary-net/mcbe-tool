const readline = require('readline');
const bedrock = require('bedrock-protocol');
const { ping } = require('bedrock-protocol');
const { Authflow, Titles } = require('prismarine-auth');
const { v4: uuidv4 } = require('uuid');
const { RealmAPI } = require('prismarine-realms');
const fs = require('fs');
const axl = require('app-xbox-live');
const path = require('path');
require('punycode')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log(`  ⌈ ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯ ⌉`);
console.log(` |                           |`);
console.log(`|         [ USSR ]             |`);
console.log(` |                           |`);
console.log(`  ⌊ _ _ _ _ _ _ _ _ _ _ _ _ ⌋`);

// External spam (*External)
console.log(`1. External spam`);
console.log(`    ⌊ Message`);
console.log(`    ⌊ Interval`);
console.log(`    ⌊ Type: /me or /tell or /w @a`);
console.log(`    ⌊ Namespoof`);
console.log(`    ⌊ Realm invite`);
// Get realm
console.log(`2. Get realm`);
console.log(`    ⌊ Realm invite`);
// Ping realm
console.log(`3. Ping realm`);
console.log(`    ⌊ IP`);
console.log(`    ⌊ Port`);
// Playerlist
console.log(`4. Playerlist`);
console.log(`    ⌊ ClubID`);
// Get address
console.log(`5. Get address`);
console.log(`    ⌊ Realm invite`);
// Send message to player
console.log(`6. Seed`);
console.log(`    ⌊ Realm invite`);

rl.question('Choose an option (1, 2, 3, 4, 5, or 6): ', (option) => {
    if (option == '1') {
        rl.question('Enter message: ', (message) => {
            rl.question('Enter interval (in seconds): ', (interval) => {
                rl.question('Enter type (/me, /tell, /w @a): ', (type) => {
                    rl.question('Enter namespoof name: ', (namespoof) => {
                        rl.question('Enter realm code: ', (realmInvite) => {
                            console.log(`Sending "${message}" every ${interval} seconds using ${type} with namespoof ${namespoof} in realm ${realmInvite}`);
                            const client = bedrock.createClient({
                                realms: {
                                    realmInvite: realmInvite,
                                },
                                skinData: {
                                    ThirdPartyName: namespoof,
                                    ThirdPartyNameOnly: true,
                                },
                                username: "",
                                profilesFolder: "./auth2",
                                onMsaCode: (code) => console.log(code),
                                authTitle: Titles.MinecraftNintendoSwitch,
                                flow: "live",
                                conLog: (log) => console.log(log)
                            });

                            client.on("play_status", (packet) => {
                                console.log(packet);
                                setInterval(() => {
                                    client.queue("command_request", {
                                        command: `${type} ${message}`,
                                        origin: {
                                            type: 5,
                                            uuid: uuidv4(),
                                            request_id: uuidv4()
                                        },
                                        internal: false,
                                        version: 52,
                                        namespoof: namespoof === 'true'
                                    });
                                }, interval * 1000);
                            });

                            client.on('text', (packet) => {
                                const { source_name, message } = packet;
                                console.log(`<${source_name}> ${message}`);
                            });

                            client.on('disconnect', (packet) => {
                                console.log(packet);
                            });

                            rl.close();
                        });
                    });
                });
            });
        });
    } else if (option == '2') {
        rl.question('Enter realmInvite: ', (realmInvite) => {
            console.log(`Fetching information for realm ${realmInvite}`);
            async function getrealminfo(realmInvite) {
                const authflow = new Authflow(undefined, "./auth", { 
                    flow: "live", 
                    authTitle: Titles.MinecraftNintendoSwitch, 
                    deviceType: "Nintendo", 
                    doSisuAuth: true 
                });
                const info = await authflow.getXboxToken(); 
                const api = RealmAPI.from(authflow, 'bedrock');
            
                try {
                    const filePath = './data/client/database.json';
                    let dumpedData = [];
                    if (fs.existsSync(filePath)) {
                        const fileContent = fs.readFileSync(filePath, 'utf8');
                        dumpedData = fileContent ? JSON.parse(fileContent) : [];
                    }
                    if (realmInvite.length === 8) {
                        const realminfoid = {
                            id: invite,
                            name: invite,
                            
                        };
                        return realminfoid;
                    }
                    const realm = await api.getRealmFromInvite(realmInvite);
            
                    let host = null;
                    let port = null;
                    let server = { invalid: true };
            
                    if(realm.state !== "CLOSED"){ 
                        ({ host, port } = await realm.getAddress());
                        server = await ping({ host: host, port: port });
                    
                    }
                    const xl = new axl.Account(`XBL3.0 x=${info.userHash};${info.XSTSToken}`);
                    const owner = await xl.people.get(realm.ownerUUID);
                    const club = await xl.club.get(realm.clubId);
                    const clubInfo = club.clubs[0];
                    const ownerInfo = owner.people[0] || {};
            
                    const ownerDetails = {
                        xuid: ownerInfo.xuid || "Unknown",
                        displayName: ownerInfo.displayName || "Unknown",
                        gamertag: ownerInfo.gamertag || "Unknown",
                        gamerScore: ownerInfo.gamerScore || "Unknown",
                        presenceState: ownerInfo.presenceState || "Unknown",
                        presenceText: ownerInfo.presenceText || "Unknown",
                    };
            
                    const clubdetail = {
                        id: clubInfo.id,
                        tags: clubInfo.tags,
                        preferredColor: clubInfo.preferredColor,
                        membersCount: clubInfo.membersCount,
                        followersCount: clubInfo.followersCount,
                        reportCount: clubInfo.reportCount,
                        reportedItemsCount: clubInfo.reportedItemsCount
                    };
            
                    const realminfo = {
                        id: realm.id,
                        ip: host,
                        port: port,
                        remoteSubscriptionId: realm.remoteSubscriptionId,
                        ownerUUID: realm.ownerUUID,
                        name: realm.name,
                        motd: realm.motd,
                        defaultPermission: realm.defaultPermission,
                        state: realm.state,
                        daysLeft: realm.daysLeft,
                        expired: realm.expired,
                        expiredTrial: realm.expiredTrial,
                        gracePeriod: realm.gracePeriod,
                        worldType: realm.worldType,
                        maxPlayers: realm.maxPlayers,
                        clubId: realm.clubId,
                        member: realm.member,
                        invite: {
                            code: realmInvite,
                            ownerxuid: realm.ownerUUID,
                            codeurl: "https://realms.gg/" + realmInvite,
                        },
                        server: {
                            motd: server.motd,
                            levelname: server.levelName,
                            playersonline: server.playersOnline,
                            maxplayers: server.playersMax,
                            gamemode: server.gamemode ?? "unknown",
                            gamemodeid: server.gamemodeId,
                            version: server.version,
                            protocol: server.protocol
                        },
                        owner: ownerDetails,
                        club: clubdetail
                    };
                    console.log(realminfo)
                } catch (error) {
                    console.error("Error in getrealminfo:", error);
                    return { name: false, realmcode: realmInvite, valid: false };
                }
            }
            getrealminfo(realmInvite)
            rl.close();
        });
    } else if (option == '3') {
        rl.question('Enter host (IP): ', (host) => {
            rl.question('Enter port: ', (port) => {
                console.log(`Pinging realm with host ${host} and port ${port}`);
                bedrock.ping({
                    host: host, port: port
                });
            });
        });
    } else if (option == '4') {
        rl.question('Enter ClubID: ', (clubID) => {
            console.log(`Fetching player list for ClubID: ${clubID}`);
            async function playerlist(clubID) {
                const authflow = new Authflow(undefined, `./auth`, { 
                    flow: "live", 
                    authTitle: Titles.MinecraftNintendoSwitch, 
                    deviceType: "Nintendo", 
                    doSisuAuth: true 
                });
        
                try {
                    const info = await authflow.getXboxToken(); 
                    const xl = new axl.Account(`XBL3.0 x=${info.userHash};${info.XSTSToken}`);
                    const clubData = await xl.club.get(clubID);
                    
                    const clubInfo = clubData.clubs[0];
            
                    const ingameMembers = clubInfo.clubPresence
                        .filter(member => member.lastSeenState === 'InGame');
            
                    const ingameMembersInfo = await Promise.all(ingameMembers.map(async (member) => {
                        const { xuid } = member;
                        const personInfo = await xl.people.get(xuid);
                        return {
                            xuid: xuid,
                            gamerTag: personInfo.people[0].gamertag,
                            displayname: personInfo.people[0].displayName,
                            realname: personInfo.people[0].realName,
                            gamerScore: personInfo.people[0].gamerScore,
                            presenceText: personInfo.people[0].presenceText,
                            uniqueModernGamertag: personInfo.people[0].uniqueModernGamertag,
                            xboxOneRep: personInfo.people[0].xboxOneRep,
                            presenceState: personInfo.people[0].presenceState,
                            lastSeenTimestamp: member.lastSeenTimestamp,
                        };
                    }));
            
                    const result = {
                        clubName: clubInfo.name,
                        ingameMembers: ingameMembersInfo,
                    };
                    console.log(result)
                    return result;       
                } catch (error) {
                    return null;
                }
            }

            playerlist(clubID)
            
            rl.close();
        });
    } else if (option == '5') {
        rl.question(' Enter realm invite: ', (realmInvite) => {
            console.log(`Fetching IP Address and Port for ${realmInvite}`);
            async function getAddress(realmInvite) {
                const authflow = new Authflow(undefined, "./auth", { 
                    flow: "live", 
                    authTitle: Titles.MinecraftNintendoSwitch, 
                    deviceType: "Nintendo", 
                    doSisuAuth: true 
                });
                const info = await authflow.getXboxToken(); 
                const api = RealmAPI.from(authflow, 'bedrock');
            
                try {
                    const realm = await api.getRealmFromInvite(realmInvite);
                    const { host, port } = await realm.getAddress();
                    if (host && port) {
                        const hostandport = {
                            name: realm.name,
                            host: host,
                            port: port,
                        };
                        console.log(`Host: ${host}, Port: ${port}`);  // Display IP and Port
                        return hostandport;
                    } else {
                        console.log("IP and Port are not available.");
                        return { host: null, port: null };
                    }
                } catch (error) {
                    console.error("Error while fetching address:", error);
                    return { host: null, port: null };
                }
            }
            
            getAddress(realmInvite);
            rl.close();
        });
    } else if (option == '6') {
        rl.question('Realm invite: ', (realmInvite) => {
                console.log(`Connecting to ${realmInvite}`);
                async function getSeed(realmInvite) {
                    const client = bedrock.createClient({
                        realms: {
                            realmInvite: realmInvite,
                        },
                        username: "",
                        profilesFolder: "./auth2",
                        onMsaCode: (code) => console.log(code),
                        authTitle: Titles.MinecraftNintendoSwitch,
                        flow: "live",
                        conLog: (log) => console.log(log)
                    });
                    client.on('start_game', (packet) => {
                        console.log(packet.seed.toString());
                    });  
                }
                getSeed(realmInvite)
                rl.close();
        });
     } else {
        console.log('Invalid option.');
        rl.close();
    }
});
