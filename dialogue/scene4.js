// EDIT ME: image choices below are placeholder guesses based on scene3's
// vocabulary (looking/talky/kicks/lookaway/sing/pointing/waving) — swap to whatever actually fits.

window.NODES = window.NODES || {};
Object.assign(window.NODES, {
  s4_n0: {
    text: "[music:/music/glade.mp3]Hello...[p:400]\nIt's time to tell you about how school has been going!",
    image: "/assets/anim/talky.gif",
    next: "s4_n01"
  },
  s4_n01: {
    text: "[music:/music/glade.mp3](disregarding anything academic ofc)",
    image: "/assets/anim/talky.gif",
    next: "s4_n1"
  },
  s4_n1: {
    text: "[music:/music/glade.mp3]So this cute girl (Alex)[p:200]\nI've known her for maybe two-ish years now throughout my classes...",
    image: "/assets/anim/looking.gif",
    next: "s4_n1_2"
  },
  s4_n1_2: {
    text: "[music:/music/glade.mp3]Well, [p:200]she shares another class with me this semester!",
    image: "/assets/anim/looking.gif",
    next: "s4_n2"
  },
  s4_n2: {
    text: "[music:/music/glade.mp3]. [p:600]. [p:600].",
    image: "/assets/anim/lookaway.gif",
    next: "s4_n3"
  },
  s4_n3: {
    text: "[music:/music/glade.mp3]I enjoy being around her.. as she does with me[p:200]\nShe also now knows i'm trans![p:200]\nI came out to her recently...",
    image: "/assets/anim/sing.gif",
    next: "s4_n4"
  },
  s4_n4: {
    text: "[music:/music/glade.mp3]The thing is... I kinda like her.",
    image: "/assets/anim/lookaway.gif",
    next: "s4_n5"
  },
  s4_n5: {
    text: "[music:/music/glade.mp3]The last time I had another crush like this,[p:200] the guy made my feelings feel like a joke.[p:400]\nEven AFTER the coming out humiliation ritual!",
    image: "/assets/anim/lookaway.gif",
    next: "s4_n6"
  },
  s4_n6: {
    text: "[music:/music/glade.mp3]. [p:400]. [p:400].[p:200]\n(I handled it terribly)",
    image: "/assets/anim/lookaway.gif",
    next: "s4_n7"
  },
  s4_n7: {
    text: "[music:/music/glade.mp3]Falling into the same pit as always,[p:200] Kaia!",
    image: "/assets/anim/kicks.gif",
    next: "s4_n8"
  },
  s4_n8: {
    text: "[music:/music/glade.mp3]Well,[p:200] it's okay[p:200]\nI am still quite uncomfortable with the idea of a relationship.",
    image: "/assets/anim/looking.gif",
    next: "s4_n8_2"
  },
  s4_n8_2: {
    text: "[music:/music/glade.mp3]I shouldn't entertain the idea right now, [p:200]is what I keep telling myself.",
    image: "/assets/anim/looking.gif",
    next: "s4_n9"
  },
  s4_n9: {
    text: "[music:/music/glade.mp3]So I won't be acting on this crush.[p:200]\nFor the better of everyone involved,[p:200] of course my heart hurts from it though.",
    image: "/assets/anim/lookaway.gif",
    next: "s4_n10"
  },
  s4_n10: {
    text: "[music:/music/glade.mp3]. [p:600]. [p:600].",
    image: "/assets/anim/looking.gif",
    next: "s4_n11"
  },
  s4_n11: {
    text: "[music:/music/glade.mp3]Following my heart is a recipe for disaster[p:400]\nBut,[p:200] being vulnerable can lead to some beautiful things!",
    image: "/assets/anim/pointing.gif",
    next: "s4_n12"
  },
  s4_n12: {
    text: "[music:/music/glade.mp3]I've been doing so over the course of some time now.[p:200]\nI'm happy to say it's had a good effect on me!",
    image: "/assets/anim/sing.gif",
    next: "s4_n13"
  },
  s4_n13: {
    text: "[music:/music/glade.mp3]I have 3-ish(?) friends that are very patient and understanding towards me[p:200], which makes me happy.",
    image: "/assets/anim/sing.gif",
    next: "s4_n14"
  },
  s4_n14: {
    text: "[music:/music/glade.mp3]. [p:400]. [p:400].",
    image: "/assets/anim/lookaway.gif",
    next: "s4_n15"
  },
  s4_n15: {
    text: "[music:/music/glade.mp3]Bah![p:200]\nThats enough rambling for now.",
    image: "/assets/anim/kicks.gif",
    next: "s4_n16"
  },
  s4_n16: {
    text: "[music:/music/glade.mp3]I've got some work to do on some projects that I will chat about next time,[p:200] maybe.",
    image: "/assets/anim/pointing.gif",
    next: "s4_n16_2"
  },
  s4_n16_2: {
    text: "[music:/music/glade.mp3]I also have to mentally prepare for therapy tomorrow.[p:200]\nWoo!",
    image: "/assets/anim/pointing.gif",
    next: "s4_n17"
  },
  s4_n17: {
    text: "[music:/music/glade.mp3]Alexis...[p:400]\nDo your theory work for yourself![p:200]\nYou don't need my help,[p:200] trust me.",
    image: "/assets/anim/looking.gif",
    next: "s4_n17_2"
  },
  s4_n17_2: {
    text: "[music:/music/glade.mp3]To think you're right here as I type this away...[p:200]\nMY HEART!!!!",
    image: "/assets/anim/looking.gif",
    next: "s4_n18"
  },
  s4_n18: {
    text: "[music:/music/glade.mp3]Oh,[p:200] and bright...[p:400]\nPut a smile on your face for once![p:400]\nIm thinkin' about ya too.",
    image: "/assets/anim/looking.gif",
    next: "s4_n19"
  },
  s4_n19: {
    text: "[music:/music/glade.mp3]Okok,[p:200] bye bye!",
    image: "/assets/anim/waving.gif",
    next: "s4_n20"
  },
  s4_n20: {
    text: "[music:/music/tea.mp3][hide]",
    image: "/assets/anim/kicks.gif",
    next: null
  },
});