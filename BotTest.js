const mineflayer = require('mineflayer');
const pathfinder = require('mineflayer-pathfinder');
const tool = require('mineflayer-tool')
const autoeat = require('mineflayer-auto-eat').default
const { Vec3 } = require('vec3')
const mineflayerViewer = require('prismarine-viewer').mineflayer
const admin_name = 'YableZhao'

//Create a bot
const bot = mineflayer.createBot({
  port: 50893,
  username: 'YableBot',
  //version: 1.19
});

//pathfinder module plugin
bot.loadPlugin(pathfinder.pathfinder)

//tool module plugin
bot.loadPlugin(tool.plugin)

//autoeat module plugin
bot.loadPlugin(autoeat)

// Wait for the bot to connect to the server
bot.on('login', () => {
  console.log('Bot connected to server');
  bot.chat(`Hi there!`)
})
  // Listen for chat messages. This module is a testing module.
  /*
  bot.on('chat', (username, message) => {
    if (message === 'go') {
      // Move the bot around the world
      bot.setControlState('forward', true);
      setTimeout(() => {
        bot.setControlState('forward', false);
        bot.setControlState('left', true);
      }, 1000);
      setTimeout(() => {
        bot.setControlState('left', false);
        bot.setControlState('back', true);
      }, 2000);
      setTimeout(() => {
        bot.setControlState('back', false);
        bot.setControlState('right', true);
      }, 3000);
      setTimeout(() => {
        bot.setControlState('right', false);
      }, 4000);

      // Send a chat message
      bot.chat('Hello, world!');
}}))
*/

//prevent bot from quitting due to water
bot.on('move', () => {

  const blocks = [
    bot.blockAt(bot.entity.position.offset(0, 1, 0)),  // Above
    bot.blockAt(bot.entity.position.offset(0, -1, 0)), // Below
    bot.blockAt(bot.entity.position.offset(-1, 0, 0)), // Left
    bot.blockAt(bot.entity.position.offset(1, 0, 0)),  // Right
    bot.blockAt(bot.entity.position.offset(0, 0, -1)), // Behind
    bot.blockAt(bot.entity.position.offset(0, 0, 1))   // In front
  ];
  // Check if the bot is in water
  for (const block of blocks) {
    if (block && block.name === 'water' || block && block.name === 'lava') {
      // Set the bot's game mode to spectator
      bot.chat('quit because of water or lava')
      bot.chat(`Last position is ${bot.entity.position}`)
      bot.quit();
      break;
    }
  }

  }
);

//Bot death
bot.on('death', () => {
  bot.chat('I just fxxking died!!!')
  console.log('The bot just died')
})

//Bot eat module
bot.once('spawn', () => {
  bot.autoEat.options = {
      priority: "foodPoints",
      startAt: 14,
  }
})

bot.on('autoeat_started', (item, offhand) => {
  console.log(`Eating ${item.name} in ${offhand ? 'offhand' : 'hand'}`)
})

bot.on('autoeat_error', (error) => {
  console.error(error)
})

bot.on('autoeat_finished', (item, offhand) => {
  console.log(`Finished eating ${item.name} in ${offhand ? 'offhand' : 'hand'}`)
})


/*
bot.on('health', () => {
  if (bot.food >= 14) {
      //bot.autoEat.disable()
      bot.chat('I stop eating')
      console.log('Bot stops eating')
      console.log(bot.food)
      console.log(bot.foodSaturation)
  } else {
      //bot.autoEat.enable()
      bot.chat('I start to eat')
      console.log('Bot starts to eat')
      console.log(bot.food)
      console.log(bot.foodSaturation)
  }
})
*/

// PathFinder

//pathfinder message seperation module
bot.on('chat', (username, message) => {
  message = message.split(' ')
//message testing module, please comment if the program is working well.
  //console.log(message[3])
  //console.log(message.length)
//start by type in "go follow/block/stop (xxx,xxx,xxx)"
  //movement module
  if (message[0] == 'go') {
    botGo(message)
  }
  //mining module
  if (message[0] == 'mine'){
    botMine(message)
  }
  //stop mining or movement
  if (message[0] == 'stop') {
    bot.pathfinder.stop()
    bot.stopDigging()
    bot.chat('Yes, sir! I will stop right now.')
  }
  //List bot's backpack items with numbers
  if (message[0] == 'list'){
    getList(bot.inventory.items())
  }
  //Chest interaction
  if (message[0] == 'chest') {
    botChest(message)
  }
  //Drop things
  if (message[0] == 'drop') {
    dropThings()
  }
}
)

//Pathfinding function

function botGo(message){
  //find player
  const admin_entity = bot.players[admin_name].entity

  //set player as the bot's object
  const goal_admin = new pathfinder.goals.GoalFollow(admin_entity,1)

  switch (message[1]) {
    
    case "follow":
      bot.pathfinder.setGoal(goal_admin,true)
      bot.chat('Yes, sir! I will follow you.')
      break;
    case "stop":
      bot.pathfinder.stop()
      bot.stopDigging()
      bot.chat('Yes, sir! I will stop right now.')
      break;
    case "block":
      //go to a specific block
      if (message.length <= 4) {
        bot.chat('wrong format')
        return
      }
      x = parseInt(message[2])
      y = parseInt(message[3])
      z = parseInt(message[4])
      const goal_block = new pathfinder.goals.GoalBlock(x,y,z)
      try{
        bot.pathfinder.setGoal(goal_block)
        bot.chat(`Yes, sir! I will go to block position: ${message[2]} ${message[3]} ${message[4]}`)
      } catch (e) {
        console.log(e[0])
        bot.chat("error, please enter again")
        return
      }
      break
    default:
      //move to the player's position
      bot.pathfinder.setGoal(goal_admin,false)
    }
}


//Mining module

async function botMine(message) {

  //find block
  //try{
    blocks = bot.findBlocks(
      {
        matching: bot.registry.blocksByName[message[1]].id,
        maxDistance: 500,
        count: message[2]
    }
  )

  //avoid lava and water
/*
  function filter(e) {
      return WaterOrLava(e);
    }
  blocks = blocks.filter(filter)
*/
  //print block position
  console.log(blocks)
  bot.chat(`${blocks}`)
  bot.chat(`Yes, sir! I will dig ${message[2]}*${message[1]}!`)
  }
  //digging
  /*
  for (block of blocks) {
    try{
    //walk to the block
    const goal_block = new pathfinder.goals.GoalBlock(block.x, block.y, block.z)
    await bot.pathfinder.goto(goal_block)

    //equip the bot with the optimal tool for digging
    block_in_MC = bot.world.getBlock(block.x, block.y, block.z)
    await bot.tool.equipForBlock(block_in_MC)

    // digging
    //bot.digTimeout = 20000 
    await bot.dig(block_in_MC) 
    //await bot.pathfinder.goto(goal_block)

    if (bot.inventory.items().length >= 30) {
      dropThings()
    }

  }catch(e){
    console.log(e)
    continue
  }
}
  // Send chat message indicating that mining task is complete
  bot.chat("I have completed the mining task.");
}
 catch(e){
  //if there's a typo or the bot cannot dig the ore, print error message
  bot.chat('I cannot find the block or there is a typo')
  console.log(e)
  
}}
*/

//List bot's backpack items

function getList(items){
  answer = ""
  for (item of items) {
    answer = answer + `${item.count}*${item.name} `
  }
  bot.chat('Inventory info: ' + answer)
}

//List chest items
function getChest(items){
  answer = ""
  for (item of items) {
    answer = answer + `${item.count}*${item.name} `
  }
  bot.chat(answer + 'in the chest')
}

//Avoid lava and water
function WaterOrLava(block) {
  x = block.x
  y = block.y
  z = block.z
  I = [1, -1, 0, 0, 0, 0]
  J = [0, 0, 1, -1, 0, 0]
  K = [0, 0, 0, 0, 1, -1]
  for (t = 0; t < 6; t++) {
      i = I[t], j = J[t], k = K[t]
      tmp = bot.world.getBlock(new Vec3(x + i, y + j, z + k))
      if (!tmp) continue
      if (tmp.name == 'lava' || tmp.name == 'water') {
          return false
      }
  }
  return true
}

//Chest interaction module

async function botChest() {
  // Find the chest
  chestToOpen = bot.findBlock({
      matching: bot.registry.blocksByName['chest'].id,
      maxDistance: 6
  })
  if (!chestToOpen) {
      bot.chat("cannot find chest")
      return
  }

  // open chest
  const chest = await bot.openChest(chestToOpen)
  getList(chest.containerItems())

  bot.on('chat', workWithChest);
  async function workWithChest(username, message) {
      if (username == bot.username) return
      message = message.split(' ')

      // close chest
      if (message[0] == "close") {
          chest.close()
          //bot.removeListener('chat', workWithChest)
          return
      }
      // show items
      if (message[0] == "show") {
          getList(chest.containerItems())
      }
      // in/out [item_name] [item_count]
      if (message.length == 1) return
      if (message[0] == "all") {
          const items = bot.inventory.items()
          if (items.length == 0) return
          if (message[1] == "in") {
              for (const item of items) {
                  await chest.deposit(item.type, null, item.count)
              }
              await bot.chat("have put all items in")
              return
          } else if (message[1] == "out") {
              for (item of items) {
                  await chest.withdraw(item.type, null, item.count)
              }
              bot.chat("have withdrawn all items")
              return
          }
      }
      item_name = message[1]
      item_count = parseInt(message[2])
      try {
          item_id = bot.registry.itemsByName[item_name].id
      } catch (e) {
          bot.chat(`cannot find${item_name}`)
          return
      }

      // put items in
      if (message[0] == "in") {
          await chest.deposit(item_id, null, item_count)
          bot.chat(`Have put ${item_count}*${item_name} in the chest`)
      }
      // put items out
      if (message[0] == "out") {
          await chest.withdraw(item_id, null, item_count)
          bot.chat(`Have withdrawn ${item_count}*${item_name}`)
      }
  }
}


//Dropthings module
async function dropThings() {

  // 丢弃身上所有满组圆石 + 所有杂牌石头
  if (bot.inventory.items().length <= 34) {
      items = bot.inventory.slots
      len = items.length
      for (i = 0; i < len; i++) {
          item = items[i]
          if (!item) continue

          // 圆石 -> 留一部分垫脚用
          if (item.name == 'cobblestone' && item.count == 64) {
              await bot.tossStack(bot.inventory.slots[item.slot])
          }
          // 杂牌石头
          if (item.name == 'stone') {
              await bot.tossStack(bot.inventory.slots[item.slot])
          }
          // 地狱岩 + 玄武岩
          if (item.name == 'netherrack') {
              await bot.tossStack(bot.inventory.slots[item.slot])
          }
          if (item.name == 'basalt') {
              await bot.tossStack(bot.inventory.slots[item.slot])
          }
      }
  }

  // 丢弃身上除矿物和工具外的绝大多数物品
  else {
      items = bot.inventory.slots
      len = items.length
      for (i = 0; i < len; i++) {
          item = items[i]
          if (!item) continue
          if (item.name == goal_item) {
              continue
          }
          // 逐个检索是否是工具比较麻烦，而且一般其他矿物不会只挖到1个，
          // 这里改成==1比较简洁而且也能起到较好的效果
          if (item.count == 1) {
              continue
          }
          await bot.tossStack(bot.inventory.slots[item.slot])
      }
  }
}

//web viewer
/*
bot.once('spawn', () => {
  mineflayerViewer(bot, { port: 3007, firstPerson: false })
})
*/