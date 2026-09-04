
window.NODES = window.NODES || {};
Object.assign(window.NODES, {
  s2_n1: {
    text: "[music:/music/hometown2.mp3]Hi! [p:400]\nIt's nice to see you here!",
    image: "/assets/anim/looking.gif",
    next: "s2_n2"
  },
  s2_n2: {
    text: "[music:/music/hometown2.mp3]I've gotten a little busy on the site.",
    image: "/assets/anim/lookaway.gif",
    next: "s2_n3"
  },
  s2_n3: {
    text: "[music:/music/hometown2.mp3]Would you like to hear about it?",
    image: "/assets/anim/lookaway.gif",
    next: "s2_n3_1"
  },
  s2_n3_1: {
    text: "",
    image: "/assets/anim/looking.gif",
    choices: [
      { label: "Yes! I'd love to!", next: "s2_n4" },
      { label: "Nah, skip it.", next: "s2_n999" }
    ]
  },
        s2_n4: {
          text: "[music:/music/hometown2.mp3]Well, [p:200]for starters, [p:200]you can have dialogue choices now![p:600]\nOh and theres an item system too...",
          image: "/assets/anim/sing.gif",
          next: "s2_n5"
        },
        s2_n5: {
          text: "[music:/music/hometown2.mp3]Of course, [p:200]with an item system comes a menu as well...",
          image: "/assets/anim/lookaway.gif",
          next: "s2_n6"
        },
        s2_n6: {
          text: "[music:/music/hometown2.mp3]Go ahead and press [C] for me![p:600]\nPretty cool, [p:400]right?[p:800]",
          image: "/assets/anim/sing.gif",
          next: "s2_n7_1"
        },
        s2_n7_1: {
          text: "[music:/music/hometown2.mp3]This way you can interact with me a little more and whatnot.",
          image: "/assets/anim/sing.gif",
          next: "s2_n7_2"
        },
        s2_n7_2: {
          text: "[music:/music/hometown2.mp3]There aren't many items, [p:200]but I'll be sure to give some out...",
          image: "/assets/anim/sing.gif",
          next: "s2_n8"
        },
        s2_n8: {
          text: "[music:/music/hometown2.mp3]I was thinking of some fun uses for them![p:600]\nBut that will have to wait!",
          image: "/assets/anim/kicks.gif",
          next: "s2_n9"
        },
        s2_n9: {
          text: "[music:/music/hometown2.mp3]Enough about the site for now though.[p:600]\nLet's continue on.",
          image: "/assets/anim/sing.gif",
          next: "s2_n10"
        },
        s2_n999: {
          text: "[music:/music/hometown2.mp3]Awh, okay.[p:600]\nWell then, [p:200]let's continue on.",
          image: "/assets/anim/lookaway.gif",
          next: "s2_n10"
        },
  s2_n10: {
    text: "[music:/music/hometown2.mp3]So, [p:200]I've been writing a little bit today.[p:600]\nIt helps me clear my mind.",
    image: "/assets/anim/kicks.gif",
    next: "s2_n11"
  },
  s2_n11: {
    text: "[music:/music/hometown2.mp3]I've been just being a super-duper creative person today really.",
    image: "/assets/anim/sing.gif",
    next: "s2_n12"
  },
  s2_n12: {
    text: "[music:/music/hometown2.mp3]It's felt quite freeing![p:600]\nBeing able to just make stuff.",
    image: "/assets/anim/kicks.gif",
    next: "s2_n12_2"
  },
  s2_n12_2: {
    text: "[music:/music/hometown2.mp3]Now I'm eating a b[p:50]i[p:50]i[p:50]i[p:50]i[p:50]ig bowl of ramen.",
    image: "/assets/anim/kicks.gif",
    next: "s2_n12_3"
  },
  s2_n12_3: {
    text: "[music:/music/13am.mp3]. [p:600]. [p:600]. [p:600]",
    image: "/assets/anim/lookaway.gif",
    next: "s2_n13"
  },
  s2_n13: {
    text: "[music:/music/13am.mp3]Also, [p:200]I had something to tell you, [p:200] but I lost it somewhere along this whole creative process of mine.",
    image: "/assets/anim/lookaway.gif",
    next: "s2_n14"
  },
  s2_n14: {
    text: "[music:/music/13am.mp3]Which has been happening often, [p:200]lately.",
    image: "/assets/anim/lookaway.gif",
    next: "s2_n15"
  },
  s2_n15: {
    text: "[music:/music/13am.mp3]Is that strange to you? [p:800]Do you ever lose a thought like that, [p:600]right at the moment you wanted or needed it most?",
    image: "/assets/anim/kicks.gif",
    next: "s2_n16"
  },
  s2_n16: {
    text: "[music:/music/13am.mp3]I think it's alright. [p:800]I think most things come back around, [p:200]eventually, [p:200]in one shape or another.",
    image: "/assets/anim/kicks.gif",
    next: "s2_n17"
  },
  s2_n17: {
    text: "[music:/music/13am.mp3]But sometimes I wonder if I am the one who wandered off, [p:400]and not the thought at all.",
    image: "/assets/anim/kicks.gif",
    next: "s2_n18"
  },
  s2_n18: {
    text: "[music:/music/13am.mp3]. [p:600]. [p:600]. [p:600]",
    image: "/assets/anim/lookaway.gif",
    next: "s2_n19"
  },
  s2_n19: {
    text: "[music:/music/13am.mp3]Anyway. [p:800]It is good that you came by.",
    image: "/assets/anim/lookaway.gif",
    next: "s2_n20"
  },
  s2_n20: {
    text: "[music:/music/13am.mp3]I have been thinking, [p:200] lately, [p:200] that perhaps nothing is ever really gone.",
    image: "/assets/anim/lookaway.gif",
    next: "s2_n21"
  },
  s2_n21: {
    text: "[music:/music/13am.mp3]So when I forget something, [p:200]or someone forgets me, [p:200]I try not to mind it too much.",
    image: "/assets/anim/sunset.gif",
    next: "s2_n22"
  },
  s2_n22: {
    text: "[music:/music/13am.mp3]It is still somewhere. [p:400]Waiting to be found again, [p:200]by someone, [p:200]someday.[p:2600][hide]",
    image: "/assets/anim/sunset.gif",
    next: "s2_n23"
  },
  s2_n23: {
    text: "[music:/music/13am.mp3]Maybe thats why you keep finding me here, [p:200]even though you may forget I am here.",
    image: "/assets/anim/kicks.gif",
    next: "s2_n24"
  },
  s2_n24: {
    text: "[music:/music/13am.mp3] Something in you knows you should keep looking here, [p:200]or tells you that you should.",
    image: "/assets/anim/kicks.gif",
    next: "s2_n25"
  },
  s2_n25: {
    text: "[music:/music/13am.mp3]. [p:600]. [p:600]. [p:600]",
    image: "/assets/anim/kicks.gif",
    next: "s2_n26"
  },
  s2_n26: {
    text: "[music:/music/13am.mp3]Do you ever notice things like that?",
    image: "/assets/anim/kicks.gif",
    next: "s2_n27"
  },
  s2_n27: {
    text: "[music:/music/13am.mp3]Do you ever notice the spaces where someone used to stand?",
    image: "/assets/anim/kicks.gif",
    next: "s2_n28"
  },
  s2_n28: {
    text: "[music:/music/13am.mp3]. [p:600]. [p:600]. [p:600]",
    image: "/assets/anim/lookaway.gif",
    next: "s2_n29"
  },
  s2_n29: {
    text: "[music:/music/13am.mp3]Just some thoughts of mine. [p:400]",
    image: "/assets/anim/kicks.gif",
    next: "s2_n30"
  },
  s2_n30: {
    text: "[music:/music/13am.mp3]. [p:600]. [p:600]. [p:600]",
    image: "/assets/anim/lookaway.gif",
    next: "s2_n31"
  },
  s2_n31: {
    text: "[music:/music/13am.mp3]I would like to give you something for sitting here and listening to me, [p:200]but I don't really have much to give right now.",
    image: "/assets/anim/looking.gif",
    next: "s2_n32"
  },
  s2_n32: {
    text: "[music:/music/na.mp3]Well,[p:400] I guess you can have this.[p:200]\nIt isn't much though.",
    image: "/assets/anim/talky.gif",
    next: "s2_n33",
    giveItem: "egg"
  },
  s2_n33: {
    text: "[music:/music/timber.mp3]Thanks for sticking around and listening![p:400]\nSee ya next time :)",
    image: "/assets/anim/waving.gif",
    next: "s2_n34"
  },
  s2_n34: {
    text: "[music:/music/timber.mp3]Time to relax for a little bit.",
    image: "/assets/anim/kicks.gif",
    next: "s2_n35"
  },
  s2_n35: {
    text: "[music:/music/timber.mp3].[hide]",
    image: "/assets/anim/kicks.gif",
    next: null
  },
});