
window.NODES = window.NODES || {};
Object.assign(window.NODES, {
  s3_n0: {
    text: "[music:/music/story.mp3]Hello!",
    image: "/assets/anim/waving.gif",
    next: "s3_pq1"
  },
  s3_pq1: {
    text: "[music:/music/story.mp3]Firstly,[p:200] would you like to hear about the site updates?[p:400]\nIt could be useful.",
    image: "/assets/anim/looking.gif",
    next: "s3_q1"
  },
  s3_q1: {
    text: "[music:/music/story.mp3]",
    image: "/assets/anim/looking.gif",
    choices: [
      { label: "Yea, but keep it brief!", next: "s3_q2" },
      { label: "Not really...", next: "s3_q6" }
    ]
  },
      s3_q2: {
        text: "[music:/music/story.mp3]Well,[p:200] you can interact with things sometimes.",
        image: "/assets/anim/talky.gif",
        next: "s3_q3"
      },
      s3_q3: {
        text: "[music:/music/story.mp3]Like if you hover over me with your mouse while I sit on this cliff,[p:200] notice how the cursor changes a little?",
        image: "/assets/anim/talky.gif",
        next: "s3_q4"
      },
      s3_q4: {
        text: "[music:/music/story.mp3]I'll let you explore that for yourself then.",
        image: "/assets/anim/kicks.gif",
        next: "s3_q5"
      },
      s3_q5: {
        text: "[music:/music/walking.mp3]Okay,[p:200] now let's talk.",
        image: "/assets/anim/looking.gif",
        next: "s3_n1"
      },
      s3_q6: {
        text: "[music:/music/walking.mp3]Okay then,[p:200] lets get into today then.",
        image: "/assets/anim/looking.gif",
        next: "s3_n1"
      },
  s3_n1: {
    text: "[music:/music/walking.mp3]Life can be bitter...",
    image: "/assets/anim/kicks.gif",
    next: "s3_n2"
  },
  s3_n2: {
    text: "[music:/music/walking.mp3]Rain can feel like acid.[p:400]\nBreathing can feel like dying.",
    image: "/assets/anim/lookaway.gif",
    next: "s3_n3"
  },
  s3_n3: {
    text: "[music:/music/walking.mp3]Sometimes we feel like we're trying to swim through tar,[p:200] like every step forward is two steps back. ",
    image: "/assets/anim/looking.gif",
    next: "s3_n4"
  },
  s3_n4: {
    text: "[music:/music/walking.mp3]Sometimes it's just as bad as it seems.[p:400]\nSometimes worse.",
    image: "/assets/anim/looking.gif",
    next: "s3_n5"
  },
  s3_n5: {
    text: "[music:/music/walking.mp3]But,[p:200] we keep moving.",
    image: "/assets/anim/kicks.gif",
    next: "s3_n6"
  },
  s3_n6: {
    text: "[music:/music/walking.mp3]Even if it's only coasting through life,[p:200] we keep moving.[p:400]\nOne day we'll find a better tomorrow.",
    image: "/assets/anim/looking.gif",
    next: "s3_n7"
  },
  s3_n7: {
    text: "[music:/music/walking.mp3]However heavy this feels right now,[p:200] you're not as lost as it seems.",
    image: "/assets/anim/looking.gif",
    next: "s3_n7_2"
  },
  s3_n7_2: {
    text: "[music:/music/walking.mp3]There's parts of you that's still noticing all this,[p:200] and trying to put words to it!",
    image: "/assets/anim/sing.gif",
    next: "s3_n8"
  },
  s3_n8: {
    text: "[music:/music/walking.mp3]Lately,[p:200] it's been exceedingly difficult to recognize ones self in the mirror,[p:200] hasn't it?",
    image: "/assets/anim/kicks.gif",
    next: "s3_n8_2"
  },
  s3_n8_2: {
    text: "[music:/music/walking.mp3]Movement feels sluggish.[p:400]\nAudio feels dampened.[p:400]\nColors feel dull.",
    image: "/assets/anim/lookaway.gif",
    next: "s3_n9"
  },
  s3_n9: {
    text: "[music:/music/walking.mp3]But suddenly,[p:400] summer turned to fall..",
    image: "/assets/anim/pointing.gif",
    next: "s3_n10"
  },
  s3_n10: {
    text: "[music:/music/walking.mp3]You felt like a portion of you has failed to catch up.[p:400]\nOnce again,[p:200] crushed by stress and anxiety.",
    image: "/assets/anim/lookaway.gif",
    next: "s3_n11"
  },
  s3_n11: {
    text: "[music:/music/walking.mp3]...please,[p:200] give it time.[p:400]\nPush through it,[p:200] and days will get brighter.",
    image: "/assets/anim/looking.gif",
    next: "s3_n12"
  },
  s3_n12: {
    text: "[music:/music/walking.mp3]Whatever you carry,[p:200] whether you share it or not,[p:200] won't stay heavy forever.",
    image: "/assets/anim/looking.gif",
    next: "s3_n13"
  },
  s3_n13: {
    text: "[music:/music/walking.mp3]The sun will rise again.[p:1000]\nI was told it always does.",
    image: "/assets/anim/kicks.gif",
    next: "s3_n13_2"
  },
  s3_n13_2: {
    text: "[music:/music/walking.mp3]What's the point of a story[p:200] without a happy ending,[p:400] right?",
    image: "/assets/anim/kicks.gif",
    next: "s3_n13_3"
  },
  s3_n13_3: {
    text: "[music:/music/walking.mp3]So,[p:200] despite the odds being stacked against you.[p:400]\n[c:#d535d9]You[/c][p:200] must still move forward.",
    image: "/assets/anim/looking.gif",
    next: "s3_n14"
  },
  s3_n14: {
    text: "[music:/music/walking.mp3]. [p:600]. [p:600]. [p:600]",
    image: "/assets/anim/kicks.gif",
    next: "s3_n15"
  },
  s3_n15: {
    text: "[music:/music/walking.mp3]Well,[p:200] I've been here for quite some time now.",
    image: "/assets/anim/sing.gif",
    next: "s3_n16"
  },
  s3_n16: {
    text: "[music:/music/walking.mp3]Surely the sun will set here,[p:200] and I'll have to head on back.",
    image: "/assets/anim/lookaway.gif",
    next: "s3_n17"
  },
  s3_n17: {
    text: "[music:/music/walking.mp3]B[p:50]u[p:50]u[p:50]u[p:50]u[p:50]t not yet![p:400]\nI wanna see the sun as it sets.",
    image: "/assets/anim/looking.gif",
    next: "s3_n18"
  },
  s3_n18: {
    text: "[music:/music/walking.mp3]So I will do just that",
    image: "/assets/anim/pointing.gif",
    next: "s3_n19"
  },
  s3_n19: {
    text: "[music:/music/walking.mp3]Oh![p:400] But before you go.[p:400]\nHere I got something for you!",
    image: "/assets/anim/looking.gif",
    next: "s3_n20"
  },
  s3_n20: {
    text: "[music:/music/walking.mp3]It's a flower!",
    image: "/assets/anim/give_flower.gif",
    next: "s3_n21"
  },
  s3_n21: {
    text: "[music:/music/na.mp3]( You recieved the Lily of the Valley )",
    image: "/assets/anim/give_flower.gif",
    giveItem: "lily",
    blip: "none",
    next: "s3_n22"
  },
  s3_n22: {
    text: "[music:/music/na.mp3]For now,[p:200] rest and watch the sun with me.[p:800]\nBye bye! ~<3",
    image: "/assets/anim/kicks.gif",
    next: "s3_n23"
  },
  s3_n23: {
    text: "[music:/music/sunsetsevensuns_sketch.mp3][hide]",
    image: "/assets/anim/sing.gif",
    next: null
  },
});