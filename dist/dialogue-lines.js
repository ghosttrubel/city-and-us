// Original City & Us script. See assets/dialogue/manifest.json for voice provenance.
export const LINES={
 hello:{speaker:'npc',text:'Hello! How your day dey go?'},
 greet:{speaker:'player',text:'I dey fine. How far?'},
 well:{speaker:'npc',text:'I dey okay. Just getting a few things for home.'},
 directions:{speaker:'player',text:'Please, where is Dispatch?'},
 north:{speaker:'npc',text:'Walk north along this street, past the crossing. Dispatch is on your right.'},
 work:{speaker:'player',text:'Any work around here?'},
 jobs:{speaker:'npc',text:'Try Dispatch for a parcel run, or Mama T for a kitchen shift. Ask at the counter.'},
 casual:{speaker:'player',text:'What do you like about this area?'},
 garden:{speaker:'npc',text:'The little garden. When the day gets busy, I sit there and breathe small.'},
 askmore:{speaker:'player',text:'Can you show me around?'},
 refuse:{speaker:'npc',text:'Sorry, I cannot today. I need to get these things home.'},
 busy:{speaker:'npc',text:'Hello! Sorry, I am heading back to work. Just a quick question, please.'},
 busyreply:{speaker:'npc',text:'Sorry, my break is over. Try Dispatch. Take care.'},
 thanks:{speaker:'player',text:'Thank you. Take care.'},
 welcome:{speaker:'npc',text:'No wahala. Have a good day!'},
 deliveryhello:{speaker:'npc',text:'Hello! Your food from Mama T is here. Ready to collect?'},
 receive:{speaker:'player',text:'Yes, that is my order. Thank you.'},
 handover:{speaker:'npc',text:'Here you go. Hold the bag from underneath. Enjoy your food!'},
 dishquestion:{speaker:'player',text:'Please, which meal is in the bag?'},
 jollof:{speaker:'npc',text:'Jollof rice and plantain. One plate, just as you ordered.'},
 beans:{speaker:'npc',text:'Beans and plantain. One plate, just as you ordered.'},
 later:{speaker:'player',text:'Not just yet, please. Give me a moment.'},
 wait:{speaker:'npc',text:'No problem. I will wait here. Come back when you are ready.'},
 extra:{speaker:'player',text:'Can I have an extra plate?'},
 noextra:{speaker:'npc',text:'Sorry, I only have your order. You can order another after this one.'},
 deliverythanks:{speaker:'player',text:'Thanks for bringing it. Safe journey.'},
 goodbye:{speaker:'npc',text:'Thank you too. Enjoy!'},
 handsfull:{speaker:'npc',text:'Your hands are full. Please store that meal, then collect this one.'}
};

// These follow-ups have subtitles only; no missing audio requests or mismatched clips.
Object.assign(LINES,Object.fromEntries(Object.entries({
 another:['player','One more quick question?'],ayoanother:['npc','Go ahead. What do you need?'],
 ayowork:['npc','Dispatch has parcel runs. If you prefer cooking, ask at Mama T’s counter. Which work interests you?'],
 parcelquestion:['player','What does a parcel run involve?'],ayoparcel:['npc','Collect at the Dispatch desk, take the parcel to Provisions, then head home. Check Jobs for the run first.'],
 kitchenquestion:['player','What happens at Mama T’s?'],ayokitchen:['npc','Customers order at her outdoor counter. Prepare the right meal and hand it to the waiting customer.'],
 ayonorth:['npc','Dispatch is north of this crossing, on the right. I can mark the route for you.'],
 deskquestion:['player','Where do I collect the parcel?'],ayodesk:['npc','Go through the Dispatch door and approach the parcel desk inside. The street entrance alone will not collect it.'],
 routequestion:['player','Please mark the route again.'],ayoroute:['npc','Done. Follow the green route to the Dispatch door, then use Enter.'],
 breakquestion:['player','How is your break going?'],ayobreak:['npc','Too quickly! I stopped for some air before heading back. Have you eaten yet?'],
 foodquestion:['player','Where can I get a meal?'],ayofood:['npc','Mama T’s is nearby. You can order her jollof or beans through Food on your phone and meet the courier outside.'],
 talklater:['player','I will let you get back to work.'],ayolater:['npc','Thanks. Catch me another time. Good luck with your day!'],ayogoodbye:['npc','You are welcome. Hope that helps. Take care!']
}).map(([id,[speaker,text]])=>[id,{speaker,text,textOnly:true}])));

Object.assign(LINES,{ayocarrying:{speaker:'npc',text:'You have a parcel for Provisions. Take it to the shopkeeper inside; stop and dismount first.',textOnly:true},ayopaid:{speaker:'npc',text:'Your handover is paid. Head home to finish the round, then collect another when ready.',textOnly:true},ayoexperienced:{speaker:'npc',text:'Good to see you again. How are your delivery rounds going?',textOnly:true},ayohungry:{speaker:'npc',text:'You look ready for a break. Mama T serves meals nearby. What can I help you with?',textOnly:true},bisishopping:{speaker:'npc',text:'I am choosing provisions for home. The shopkeeper can help you with prices and your basket.',textOnly:true},bisihome:{speaker:'npc',text:'I am taking groceries home, then coming back to the shops. How is your day going?',textOnly:true}});

LINES.bisitostore={speaker:'npc',text:'I am on my way to Provisions for groceries. I can answer a quick question while I walk.',textOnly:true};
