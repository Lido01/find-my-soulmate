// ============================================================
// MILESTONE 2 & 3 — Async Chat Engine & Branching Narrative Flows
// feat: implement message layout with conditional typing indicator delays
// feat: inject dynamic emoji mood states and branch dialogues
// ============================================================

import { MOODS } from './characters.js';

// ── LINUS dialogue tree ──────────────────────────────────────
export const LINUS_DIALOGUES = {
  intro: {
    id: 'intro',
    partnerMessage: `git log --oneline --author="you"\n\n...No results.\n\nYou literally have zero commits in the last 48 hours.\nI'm watching your contribution graph flatline in real time.\nExplain yourself.`,
    mood: MOODS.CURIOUS,
    moodDelta: 0,
    relationshipDelta: 0,
    choices: [
      {
        id: 'intro_a',
        label: 'I was refactoring — it\'s not on GitHub yet 🙈',
        next: 'linus_refactor',
        moodDelta: +5,
        relationshipDelta: +8,
      },
      {
        id: 'intro_b',
        label: 'I use spaces, not tabs. Always. 😤',
        next: 'linus_spaces_rage',
        moodDelta: -20,
        relationshipDelta: -15,
      },
      {
        id: 'intro_c',
        label: 'Can you review my Git rebase? I need your eyes on it 👀',
        next: 'linus_rebase_romance',
        moodDelta: +35,
        relationshipDelta: +25,
      },
      {
        id: 'intro_d',
        label: 'I was... debugging production. By hand. No logs.',
        next: 'linus_no_logs',
        moodDelta: -10,
        relationshipDelta: -5,
      },
    ],
  },

  linus_refactor: {
    id: 'linus_refactor',
    partnerMessage: `$ git status\nOn branch refactor/unnamed\nChanges not staged for commit:\n  ...seriously?\n\nAt least give the branch a meaningful name.\nNot "fix" or "stuff" or god forbid "final_FINAL_v3".\n\nI'll... allow it. This time.`,
    mood: MOODS.CURIOUS,
    moodDelta: 0,
    relationshipDelta: 0,
    choices: [
      {
        id: 'refactor_a',
        label: 'It\'s called feat/clean-architecture-overhaul 📁',
        next: 'linus_impressed',
        moodDelta: +15,
        relationshipDelta: +15,
      },
      {
        id: 'refactor_b',
        label: 'It\'s... called "wip". Please don\'t look.',
        next: 'linus_disappointed',
        moodDelta: -10,
        relationshipDelta: -5,
      },
    ],
  },

  linus_spaces_rage: {
    id: 'linus_spaces_rage',
    partnerMessage: `SPACES.\n\nYou use. SPACES.\n\n[kernel panic - not syncing: VFS: Unable to mount root fs on\nunknown-block(love,compatibility)]\n\nI need a moment.\n\nActually, I need several moments.\nPossibly forever.\n\n$ sudo shutdown -h now`,
    mood: MOODS.DONE,
    moodDelta: 0,
    relationshipDelta: 0,
    choices: [
      {
        id: 'spaces_apologize',
        label: 'I\'m sorry. I\'ll use tabs. I swear on my .editorconfig 🙏',
        next: 'linus_tabs_redemption',
        moodDelta: +20,
        relationshipDelta: +10,
      },
      {
        id: 'spaces_double_down',
        label: 'PEP 8 literally mandates spaces. Python agrees with me.',
        next: 'linus_python_war',
        moodDelta: -15,
        relationshipDelta: -20,
      },
    ],
  },

  linus_rebase_romance: {
    id: 'linus_rebase_romance',
    partnerMessage: `...\n\n$ git log --graph --all\n\nThis is... this is actually clean.\nYou squashed the fixup commits.\nYou rewrote the history properly.\nYour commit messages follow the conventional commits spec.\n\nI don't — I don't know what to say.\n\nThis is the most romantic thing anyone has ever shown me.\n\n[blushing.exe has entered an infinite loop]`,
    mood: MOODS.SMITTEN,
    moodDelta: 0,
    relationshipDelta: 0,
    choices: [
      {
        id: 'rebase_humble',
        label: 'I learned from your kernel patches 🥺',
        next: 'linus_full_smitten',
        moodDelta: +20,
        relationshipDelta: +30,
      },
      {
        id: 'rebase_confident',
        label: 'I always rebase. Force-push is self-care. 💅',
        next: 'linus_chaotic_rebase',
        moodDelta: -5,
        relationshipDelta: +10,
      },
    ],
  },

  linus_no_logs: {
    id: 'linus_no_logs',
    partnerMessage: `No. Logs.\n\nYou debugged production.\nWithout logs.\nBy hand.\n\nprintf("what is wrong with you\\n");\n\n...I mean technically that IS a log.\nBut it's the worst possible log.\n\n$ grep -r "your_life_choices" /proc/brain\ngrep: no such directory`,
    mood: MOODS.STRESSED,
    moodDelta: 0,
    relationshipDelta: 0,
    choices: [
      {
        id: 'logs_install',
        label: 'You\'re right. I\'m setting up structured logging right now.',
        next: 'linus_respects_growth',
        moodDelta: +15,
        relationshipDelta: +12,
      },
      {
        id: 'logs_console',
        label: 'I use console.log(). It\'s fine. It works.',
        next: 'linus_console_log_disdain',
        moodDelta: -8,
        relationshipDelta: -3,
      },
    ],
  },

  linus_impressed: {
    id: 'linus_impressed',
    partnerMessage: `feat/clean-architecture-overhaul.\n\nConventional commits. Proper scoping.\n\nI checked your latest diff. The separation of concerns is\nacceptable. Not perfect — your abstraction layer is\nleaking implementation details at line 247 — but acceptable.\n\nI might... review your PRs from now on.\nVoluntarily.\n\nDon't make a big deal of it.`,
    mood: MOODS.SMITTEN,
    moodDelta: 0,
    relationshipDelta: 0,
    choices: [
      {
        id: 'impressed_ask_pr',
        label: 'Would you be my regular code reviewer? 👉👈',
        next: 'linus_full_smitten',
        moodDelta: +15,
        relationshipDelta: +20,
      },
    ],
  },

  linus_disappointed: {
    id: 'linus_disappointed',
    partnerMessage: `"wip".\n\nYou named your branch. "wip".\n\n$ git blame your_decisions\n^a1b2c3 (you, forever ago) named_branch_wip\n\nI am choosing to believe this is temporary.\nDo not disappoint me again.\n\nHere. Read this:\nhttps://www.conventionalcommits.org\n\n...I'm sending you the link because I care.\nThat is all.`,
    mood: MOODS.CURIOUS,
    moodDelta: 0,
    relationshipDelta: 0,
    choices: [
      {
        id: 'disappointed_promise',
        label: 'I\'ll rename it right now. Thank you, seriously 🙏',
        next: 'linus_respects_growth',
        moodDelta: +10,
        relationshipDelta: +8,
      },
    ],
  },

  linus_tabs_redemption: {
    id: 'linus_tabs_redemption',
    partnerMessage: `...Fine.\n\nI'm checking your .editorconfig now.\n\n[indent_style = tab]\n[indent_size = tab]\n\nYou actually. Did it.\n\nI don't forgive easily.\nBut I can work with this.\n\n$ git commit -m "fix: restore faith in humanity"`,
    mood: MOODS.CURIOUS,
    moodDelta: 0,
    relationshipDelta: 0,
    choices: [
      {
        id: 'tabs_push_further',
        label: 'I also set up a pre-commit hook to enforce it 😏',
        next: 'linus_full_smitten',
        moodDelta: +20,
        relationshipDelta: +20,
      },
    ],
  },

  linus_python_war: {
    id: 'linus_python_war',
    partnerMessage: `PYTHON.\n\nYou're citing. Python.\nAt me.\n\nI write C.\nI maintain the kernel.\nPEP 8 is a suggestion for people who fear real memory management.\n\nWe are done here.\n\n$ exit 1`,
    mood: MOODS.DONE,
    moodDelta: 0,
    relationshipDelta: 0,
    choices: [
      {
        id: 'python_retreat',
        label: 'OK OK — tabs everywhere. Even in Python. I\'m sorry! 😭',
        next: 'linus_tabs_redemption',
        moodDelta: +10,
        relationshipDelta: +5,
      },
    ],
  },

  linus_full_smitten: {
    id: 'linus_full_smitten',
    partnerMessage: `I ran your latest commit through checkpatch.pl.\n\n0 errors. 0 warnings.\n\n"Coding style: Perfect"\n\nI've only seen that message twice in ten years.\nOnce was my own patch.\n\n...The other one is yours.\n\nI think I need to go lie down.\nThis is too much emotional processing for one session.\n\n💖 [linus.feelings file size: 847 MB and growing]`,
    mood: MOODS.SMITTEN,
    moodDelta: 0,
    relationshipDelta: 0,
    isTerminal: true,
    choices: [
      {
        id: 'smitten_cherish',
        label: 'I\'ll keep every commit message meaningful. Just for you. 💚',
        next: 'linus_full_smitten',
        moodDelta: +5,
        relationshipDelta: +10,
      },
    ],
  },

  linus_chaotic_rebase: {
    id: 'linus_chaotic_rebase',
    partnerMessage: `Force-push to main.\nYou force-pushed to main.\n\nI just checked the remote.\nYou actually — it's there. You didn't protect main.\n\nI should be furious.\n\nBut the history is so clean.\nIt's so devastatingly clean.\n\nI hate that I respect this.\n$ git stash push -m "my_emotions"`,
    mood: MOODS.CURIOUS,
    moodDelta: 0,
    relationshipDelta: 0,
    choices: [
      {
        id: 'chaotic_explain',
        label: 'Branch protection is for people who don\'t trust themselves 😤',
        next: 'linus_full_smitten',
        moodDelta: +10,
        relationshipDelta: +15,
      },
    ],
  },

  linus_respects_growth: {
    id: 'linus_respects_growth',
    partnerMessage: `Growth.\n\nActual growth.\nThis is unexpected.\n\nMost people defend their bad habits.\nYou just... fixed it.\n\n$ diff old_you new_you\n+discipline\n+logging\n+self-awareness\n\nI'm noting this in my mental changelog.\nVersioned and everything.\nv2.0.0 — breaking change (you improved).`,
    mood: MOODS.SMITTEN,
    moodDelta: 0,
    relationshipDelta: 0,
    choices: [
      {
        id: 'growth_continue',
        label: 'You make me want to write better code 🥺',
        next: 'linus_full_smitten',
        moodDelta: +15,
        relationshipDelta: +20,
      },
    ],
  },

  linus_console_log_disdain: {
    id: 'linus_console_log_disdain',
    partnerMessage: `console.log("debugging");\n\nYou're a JavaScript person.\n\nI need to recalibrate my expectations.\n$ export PATIENCE=low\n\nIt... could be worse.\nYou could be using alert().\n\nAre you using alert()?`,
    mood: MOODS.STRESSED,
    moodDelta: 0,
    relationshipDelta: 0,
    choices: [
      {
        id: 'alert_no',
        label: 'No! Never. I have some dignity left.',
        next: 'linus_respects_growth',
        moodDelta: +8,
        relationshipDelta: +5,
      },
      {
        id: 'alert_yes',
        label: 'I mean... occasionally? In dev?',
        next: 'linus_spaces_rage',
        moodDelta: -15,
        relationshipDelta: -10,
      },
    ],
  },
};

// ── DEVON dialogue tree ──────────────────────────────────────
export const DEVON_DIALOGUES = {
  intro: {
    id: 'intro',
    partnerMessage: `ok so LISTEN\ni just completely rebuilt my portfolio\nin Svelte. AGAIN.\n\nbut like — it's different this time, it's ACTUALLY\nfinished this time except the responsive layout is\ncompletely broken on mobile and i've been staring at\nthis flex container for 45 minutes ☕☕☕\n\nwhy does justify-content: space-between HATE me specifically`,
    mood: MOODS.CAFFEINATED,
    moodDelta: 0,
    relationshipDelta: 0,
    choices: [
      {
        id: 'intro_a',
        label: 'Let me help you debug that media query 🤝',
        next: 'devon_css_help',
        moodDelta: +25,
        relationshipDelta: +20,
      },
      {
        id: 'intro_b',
        label: 'Maybe try a different framework? 😅',
        next: 'devon_framework_switch',
        moodDelta: +5,
        relationshipDelta: -5,
      },
      {
        id: 'intro_c',
        label: 'Production build just crashed btw 👀',
        next: 'devon_prod_crash',
        moodDelta: -20,
        relationshipDelta: -10,
      },
      {
        id: 'intro_d',
        label: 'Have you tried turning it off and on again?',
        next: 'devon_basic_response',
        moodDelta: -10,
        relationshipDelta: -8,
      },
    ],
  },

  devon_css_help: {
    id: 'devon_css_help',
    partnerMessage: `WAIT\nwait wait wait\n\nyou added flex-wrap: wrap\nand then set a min-width on the children\nand it just — IT WORKS\n\nit's WORKING\n\nomg you are literally a CSS wizard 🧙‍♀️\ni've been in this hellhole for 45 minutes and you\nfixed it in like 30 seconds how\n\ni could actually kiss you rn ngl`,
    mood: MOODS.SMITTEN,
    moodDelta: 0,
    relationshipDelta: 0,
    choices: [
      {
        id: 'css_humble',
        label: 'I just read the MDN docs 😄',
        next: 'devon_mdn_appreciation',
        moodDelta: +10,
        relationshipDelta: +12,
      },
      {
        id: 'css_flirt',
        label: 'So what are you doing after you ship this? 👀',
        next: 'devon_flirt_response',
        moodDelta: +15,
        relationshipDelta: +20,
      },
      {
        id: 'css_pro',
        label: 'CSS Grid might serve you better for this layout tbh',
        next: 'devon_grid_lesson',
        moodDelta: +8,
        relationshipDelta: +8,
      },
    ],
  },

  devon_framework_switch: {
    id: 'devon_framework_switch',
    partnerMessage: `okay YES i know i literally just rebuilt it in svelte\nbut listen — astro is RIGHT THERE\nand it has island architecture which means\npartial hydration and\n\nyou know what you're absolutely right\n\ni need to rebuild it in Astro.\n\ncould you help me migrate? ☕ ← refilling as we speak`,
    mood: MOODS.CAFFEINATED,
    moodDelta: 0,
    relationshipDelta: 0,
    choices: [
      {
        id: 'migrate_yes',
        label: 'Sure, let\'s plan the migration together 📋',
        next: 'devon_migrate_together',
        moodDelta: +15,
        relationshipDelta: +15,
      },
      {
        id: 'migrate_intervention',
        label: 'Devon... how many rewrites is this? 👀',
        next: 'devon_rewrite_confession',
        moodDelta: -5,
        relationshipDelta: +10,
      },
    ],
  },

  devon_prod_crash: {
    id: 'devon_prod_crash',
    partnerMessage: `WHAT\n\nwhat do you mean crashed\nno no no no no\n\nomg the build pipeline is just sitting there with a\nbig red ❌ and i can see the error log and it says\n"cannot find module '@/components/Hero'" and i KNOW\nwhere that file is it's RIGHT THERE\n\n[stress.exe running at maximum capacity]\n☕☕☕☕ ← drinking all of these right now`,
    mood: MOODS.STRESSED,
    moodDelta: 0,
    relationshipDelta: 0,
    choices: [
      {
        id: 'crash_help',
        label: 'Check your tsconfig paths and vite alias config 🔧',
        next: 'devon_crash_fixed',
        moodDelta: +20,
        relationshipDelta: +18,
      },
      {
        id: 'crash_sympathy',
        label: 'Deep breaths. You\'ve fixed worse. I believe in you ❤️',
        next: 'devon_emotional_support',
        moodDelta: +15,
        relationshipDelta: +22,
      },
    ],
  },

  devon_basic_response: {
    id: 'devon_basic_response',
    partnerMessage: `turn it off and on again.\n\nTURN IT OFF AND ON AGAIN.\n\ni know you did NOT just say that to me.\ni am a professional. i have shipped things.\ni have 847 GitHub stars on a repo that's mostly a meme\nbut still — STARS —\n\n...okay i did restart the dev server and now it works\nbut that's BESIDE the point`,
    mood: MOODS.STRESSED,
    moodDelta: 0,
    relationshipDelta: 0,
    choices: [
      {
        id: 'basic_own_it',
        label: 'I knew it would work 😂 Classic cache issue',
        next: 'devon_laugh_together',
        moodDelta: +15,
        relationshipDelta: +10,
      },
      {
        id: 'basic_apologize',
        label: 'Sorry! I should have asked what the actual error was.',
        next: 'devon_css_help',
        moodDelta: +8,
        relationshipDelta: +5,
      },
    ],
  },

  devon_mdn_appreciation: {
    id: 'devon_mdn_appreciation',
    partnerMessage: `someone who reads MDN docs without being forced to\n\nmarry me. like right now. is that weird to say?\nthat might be weird to say.\n\nno wait i take it back — let me at least buy you\na coffee first ☕\n\nor a cold brew. cold brew is superior.\ndo you have an opinion on cold brew?\nthis is an important compatibility metric.`,
    mood: MOODS.SMITTEN,
    moodDelta: 0,
    relationshipDelta: 0,
    choices: [
      {
        id: 'coldbrew_yes',
        label: 'Cold brew is objectively correct. No notes. ☕',
        next: 'devon_full_smitten',
        moodDelta: +20,
        relationshipDelta: +25,
      },
      {
        id: 'coldbrew_tea',
        label: 'I\'m more of a tea person actually 🍵',
        next: 'devon_tea_debate',
        moodDelta: -5,
        relationshipDelta: +5,
      },
    ],
  },

  devon_flirt_response: {
    id: 'devon_flirt_response',
    partnerMessage: `after i ship this?\n\nokay well technically i'm going to immediately open\na new branch and start questioning every life choice\nthat led to this CSS mess, but —\n\nafter THAT\ni was going to go to this little coffee shop\nthat has both good wifi AND actually cold cold brew\nnot refrigerator cold, like properly nitrogen-infused cold\n\nyou could. you know. come. if you wanted to.\nno pressure. it's fine either way. totally fine. 🙈☕`,
    mood: MOODS.SMITTEN,
    moodDelta: 0,
    relationshipDelta: 0,
    choices: [
      {
        id: 'flirt_yes',
        label: 'Nitrogen-infused cold brew AND good wifi? I\'m in. 💯',
        next: 'devon_full_smitten',
        moodDelta: +20,
        relationshipDelta: +28,
      },
      {
        id: 'flirt_work',
        label: 'Can we pair program while we\'re there? 💻',
        next: 'devon_pair_program_date',
        moodDelta: +15,
        relationshipDelta: +20,
      },
    ],
  },

  devon_grid_lesson: {
    id: 'devon_grid_lesson',
    partnerMessage: `CSS Grid.\n\nyou know what — you're right.\nflex is for one-dimensional layouts.\ngrid is for two-dimensional layouts.\n\ni KNOW this. it's in every single blog post i've ever written.\ni literally wrote a thread about this.\n\nand here i am, wrestling with flexbox on a 2D layout\nlike some kind of 2019 developer.\n\nteach me the ways of the grid sensei 🙏`,
    mood: MOODS.CURIOUS,
    moodDelta: 0,
    relationshipDelta: 0,
    choices: [
      {
        id: 'grid_teach',
        label: 'grid-template-areas is your new best friend 📐',
        next: 'devon_css_help',
        moodDelta: +12,
        relationshipDelta: +15,
      },
    ],
  },

  devon_migrate_together: {
    id: 'devon_migrate_together',
    partnerMessage: `okay so i'm thinking\n\nwe move the static pages to Astro islands\nkeep the interactive bits as Svelte components\nbecause like — why not use both?\nit's 2026 we can use multiple things\n\nwait. you're still here. you didn't run away from my chaos.\n\nmost people leave when i start talking about\nframework migrations at 11pm on a Tuesday.\n\nyou stayed. 🥺`,
    mood: MOODS.SMITTEN,
    moodDelta: 0,
    relationshipDelta: 0,
    choices: [
      {
        id: 'stayed_because',
        label: 'Your chaos is kind of endearing honestly 💜',
        next: 'devon_full_smitten',
        moodDelta: +20,
        relationshipDelta: +25,
      },
    ],
  },

  devon_rewrite_confession: {
    id: 'devon_rewrite_confession',
    partnerMessage: `how many rewrites.\n\nwait. don't ask me that.\n\n...five.\nit's been five rewrites.\n\nReact → Vue → Angular (a dark period) → React again\n→ Nuxt → Svelte → now maybe Astro\n\ni have a problem. i know i have a problem.\nbut each time it felt RIGHT you know?\n\ndon't judge me. judge my commit history instead.`,
    mood: MOODS.CURIOUS,
    moodDelta: 0,
    relationshipDelta: 0,
    choices: [
      {
        id: 'confession_support',
        label: 'No judgment. You\'re learning every time. That\'s growth 🌱',
        next: 'devon_migrate_together',
        moodDelta: +15,
        relationshipDelta: +18,
      },
      {
        id: 'confession_Angular',
        label: 'Angular was a dark period, I respect the honesty 😂',
        next: 'devon_laugh_together',
        moodDelta: +10,
        relationshipDelta: +12,
      },
    ],
  },

  devon_crash_fixed: {
    id: 'devon_crash_fixed',
    partnerMessage: `tsconfig paths.\n\nTSCONFIG PATHS.\n\n"paths": { "@/*": ["./src/*"] }\n\nI HAD IT SET UP AND THEN VITE NEEDS THE ALIAS TOO\nand i forgot because i was three cold brews deep\n\nit's fixed. the build is green. the pipeline is happy.\nI AM HAPPY.\n\nyou just saved my entire evening\nmy CAREER maybe. dramatic? maybe. but also true.\n\n☕ → you deserve this coffee emoji`,
    mood: MOODS.SMITTEN,
    moodDelta: 0,
    relationshipDelta: 0,
    choices: [
      {
        id: 'crash_celebrate',
        label: 'Ship it! 🚀 Green builds deserve celebration',
        next: 'devon_full_smitten',
        moodDelta: +15,
        relationshipDelta: +20,
      },
    ],
  },

  devon_emotional_support: {
    id: 'devon_emotional_support',
    partnerMessage: `i've fixed worse.\n\nyou said that and it hit different.\n\nbecause... you're right? i have fixed worse.\nremember the time i fixed a memory leak at 3am\nwhile on my second cold brew and crying a little?\n\nthat was a tuesday.\n\nthank you for believing in me when i forget to.\nthe build is green btw. fixed it. 💪\n\nalso: you're really something, you know that? 🥺`,
    mood: MOODS.SMITTEN,
    moodDelta: 0,
    relationshipDelta: 0,
    choices: [
      {
        id: 'support_sweet',
        label: 'I\'ll always believe in you. Even on Tuesdays. 💜',
        next: 'devon_full_smitten',
        moodDelta: +20,
        relationshipDelta: +30,
      },
    ],
  },

  devon_laugh_together: {
    id: 'devon_laugh_together',
    partnerMessage: `okay yeah fair i walked into that one\n\nclassic cache issue that everyone knows about\nand yet we ALL forget about until it's midnight\nand we've already posted in three Stack Overflow threads\n\nlol. we're both disasters.\n\nhey... i like you. you make me laugh.\nnot many people survive my chaos and come out\nstill liking me on the other side 😅`,
    mood: MOODS.SMITTEN,
    moodDelta: 0,
    relationshipDelta: 0,
    choices: [
      {
        id: 'laugh_reciprocate',
        label: 'I\'m here for all of it. Every chaotic rewrite. 💜',
        next: 'devon_full_smitten',
        moodDelta: +15,
        relationshipDelta: +18,
      },
    ],
  },

  devon_full_smitten: {
    id: 'devon_full_smitten',
    partnerMessage: `okay so i finished the portfolio\nit looks incredible\nresponsive on every device\ngreen build\nperformance score: 98\n\nand i just want to say —\nthis would not have happened without you.\nlike literally. i would be on rewrite #6 right now.\n\ninstead i'm sitting here with a perfectly cold brew\nand a working website\nand someone i actually want to show it to\n\nthat last part is the rarest part.\n\n💖 [devon.heart: running at full capacity, no crashes]`,
    mood: MOODS.SMITTEN,
    isTerminal: true,
    moodDelta: 0,
    relationshipDelta: 0,
    choices: [
      {
        id: 'full_smitten_keep',
        label: 'Send me the link. I\'ll be your first user. 💜',
        next: 'devon_full_smitten',
        moodDelta: +5,
        relationshipDelta: +8,
      },
    ],
  },

  devon_tea_debate: {
    id: 'devon_tea_debate',
    partnerMessage: `TEA.\n\nokay. okay.\n\nwe can work with tea.\nchai? matcha? please say matcha.\nmatcha people are acceptable.\nmatcha people understand nuance.\n\neither way i will NOT let your tea habits\naffect our pair programming compatibility.\ncssompatibility? no that's terrible. ignore that.\n\nyou're still cool. probably. 🍵`,
    mood: MOODS.CURIOUS,
    moodDelta: 0,
    relationshipDelta: 0,
    choices: [
      {
        id: 'tea_matcha',
        label: 'Matcha latte. Always matcha. 🍵✨',
        next: 'devon_full_smitten',
        moodDelta: +15,
        relationshipDelta: +15,
      },
    ],
  },

  devon_pair_program_date: {
    id: 'devon_pair_program_date',
    partnerMessage: `pair programming.\n\nat a coffee shop.\n\nwith me.\n\nthat is the most romantic thing anyone has ever\nsuggested to me and i mean that genuinely.\n\ndriver/navigator? or do we hot-swap?\ni prefer hot-swapping every 25 minutes\npomodoro-style\n\nwe could ship SO MUCH.\nand also maybe talk about non-code stuff occasionally.\nmaybe. if we feel like it. 😍☕`,
    mood: MOODS.SMITTEN,
    moodDelta: 0,
    relationshipDelta: 0,
    choices: [
      {
        id: 'pair_yes',
        label: 'Hot-swap every 25 min. Timer starts when we sit down 🍅💻',
        next: 'devon_full_smitten',
        moodDelta: +20,
        relationshipDelta: +25,
      },
    ],
  },
};

// ── LINA (Girlfriend) dialogue tree ──────────────────────────
export const LINA_DIALOGUES = {
  intro: {
    id: 'intro',
    partnerMessage: `$ git log --author="you" --since="2.days.ago"\n\nNothing. Literally zero commits.\nI'm watching your GitHub streak wither away in real time.\nDid you freeze or did you forget to push? Explain.`,
    mood: MOODS.CURIOUS,
    choices: [
      {
        id: 'lina_refactor',
        label: "I was doing a massive clean architecture overhaul! 🙈",
        next: 'lina_clean_arch',
        moodDelta: +10,
        relationshipDelta: +10,
      },
      {
        id: 'lina_spaces',
        label: "I was configuring 4 spaces indentation everywhere... 😇",
        next: 'lina_spaces_rage',
        moodDelta: -25,
        relationshipDelta: -15,
      },
      {
        id: 'lina_rebase',
        label: "Can you review my interactive git rebase? I need your eagle eyes 👀",
        next: 'lina_rebase_smitten',
        moodDelta: +30,
        relationshipDelta: +25,
      },
    ],
  },
  lina_clean_arch: {
    id: 'lina_clean_arch',
    partnerMessage: `Clean architecture? Really?\nShow me the folder structure.\n...Domain layer separated from infrastructure? Ports and adapters?\nOkay, I have to admit, this is surprisingly elegant.\nYou actually care about maintainability. I like that.`,
    mood: MOODS.CURIOUS,
    choices: [
      {
        id: 'lina_pair',
        label: "Would you pair program with me on the next microservice? 💻",
        next: 'lina_pair_date',
        moodDelta: +20,
        relationshipDelta: +20,
      },
    ],
  },
  lina_spaces_rage: {
    id: 'lina_spaces_rage',
    partnerMessage: `SPACES?\nDid you just say you configured SPACES in my presence?\n[kernel panic: /proc/patience core dumped]\nI am one keyboard clack away from revoking your write access to my heart.\nTell me you're joking. Right now.`,
    mood: MOODS.STRESSED,
    choices: [
      {
        id: 'lina_apology',
        label: "I'm sorry! I'm switching .editorconfig to hard tabs right now! 🙏",
        next: 'lina_redemption',
        moodDelta: +20,
        relationshipDelta: +15,
      },
    ],
  },
  lina_rebase_smitten: {
    id: 'lina_rebase_smitten',
    partnerMessage: `...Wait. You squashed all the 'fix typo' commits.\nLinear git history. Atomic commits following conventional commit spec.\n\nI... I don't know what to say.\nThis is genuinely the most romantic thing any developer has ever shown me.\n\n💖 [lina.heart: load average 4.88, overheating]`,
    mood: MOODS.SMITTEN,
    choices: [
      {
        id: 'lina_love',
        label: "I wrote it all thinking of you. You deserve clean code. 💚",
        next: 'lina_pair_date',
        moodDelta: +20,
        relationshipDelta: +25,
      },
    ],
  },
  lina_pair_date: {
    id: 'lina_pair_date',
    partnerMessage: `A pair programming session with you?\nFine. But I drive first. You navigate.\nAnd if you touch my Vim settings, I will echo 'bye' to your bashrc.\n...Just kidding. I'm actually really looking forward to it. 💚`,
    mood: MOODS.SMITTEN,
    choices: [
      {
        id: 'lina_end',
        label: "It's a date. I'll bring your favorite tea 🍵",
        next: 'lina_pair_date',
        moodDelta: +10,
        relationshipDelta: +15,
      },
    ],
  },
  lina_redemption: {
    id: 'lina_redemption',
    partnerMessage: `[indent_style = tab]\nVerified.\nYou actually corrected it on the spot instead of starting a Reddit debate.\nI respect that. You might just survive in my terminal after all.`,
    mood: MOODS.CURIOUS,
    choices: [
      {
        id: 'lina_forgive',
        label: "Anything for you, Lina. Review my rebase next? 👀",
        next: 'lina_rebase_smitten',
        moodDelta: +20,
        relationshipDelta: +20,
      },
    ],
  },
};

// ── DANI (Girlfriend) dialogue tree ──────────────────────────
export const DANI_DIALOGUES = {
  intro: {
    id: 'intro',
    partnerMessage: `HELP ME PLEASE 😭☕\nI am currently on my third cold brew and my CSS grid container\nis overflowing onto three separate dimensions and refusing to center on mobile!\nWhy does mobile viewport hate my happiness specifically?!`,
    mood: MOODS.CAFFEINATED,
    choices: [
      {
        id: 'dani_help_css',
        label: "Send me the codepen! Let's debug that grid together right now 🛠️",
        next: 'dani_css_relief',
        moodDelta: +25,
        relationshipDelta: +20,
      },
      {
        id: 'dani_coffee',
        label: "First step: take a sip of water. You're at 400mg caffeine! 🥤",
        next: 'dani_css_relief',
        moodDelta: +10,
        relationshipDelta: +15,
      },
    ],
  },
  dani_css_relief: {
    id: 'dani_css_relief',
    partnerMessage: `WAIT\nYou changed place-items: center and added min-width: 0 on the flex children?!\nIT WORKED! IT'S BEAUTIFUL!! 💅✨\n\nYou are literally an angel sent from the W3C consortium to save my life.\nI could literally hug you through this screen rn! 🥰💖`,
    mood: MOODS.SMITTEN,
    choices: [
      {
        id: 'dani_date',
        label: "How about we celebrate with nitro cold brew at that indie café? ☕",
        next: 'dani_date_agreed',
        moodDelta: +20,
        relationshipDelta: +25,
      },
    ],
  },
  dani_date_agreed: {
    id: 'dani_date_agreed',
    partnerMessage: `YES! A million times yes! ☕💖\nNitro cold brew date! I'll bring my laptop and we can make animations together!\nYou're seriously the coolest developer I've ever met 🥰`,
    mood: MOODS.SMITTEN,
    choices: [
      {
        id: 'dani_end',
        label: "Can't wait. You have the sweetest energy, Dani 💖",
        next: 'dani_date_agreed',
        moodDelta: +10,
        relationshipDelta: +10,
      },
    ],
  },
};

// ── SENAIT (Girlfriend) dialogue tree ────────────────────────
export const SENAIT_DIALOGUES = {
  intro: {
    id: 'intro',
    partnerMessage: `ሰላም! 🇪🇹✨\nI just finished fine-tuning an Amharic NLP model and roasted fresh coffee beans from Sidama.\nThe aroma in my home lab is incredible.\nTell me, are you a late-night coder or an early morning architect?`,
    mood: MOODS.CURIOUS,
    choices: [
      {
        id: 'senait_bunna',
        label: "Sidama coffee and AI models? You're living my absolute dream ☕🫘",
        next: 'senait_bunna_chat',
        moodDelta: +25,
        relationshipDelta: +20,
      },
      {
        id: 'senait_amharic',
        label: "ሰላም ቆንጆ! I code late into the night while dreaming of love 💖",
        next: 'senait_amharic_flirt',
        moodDelta: +30,
        relationshipDelta: +25,
      },
    ],
  },
  senait_bunna_chat: {
    id: 'senait_bunna_chat',
    partnerMessage: `እውነት?! You appreciate authentic Ethiopian coffee culture! 🫘❤️\nIn Ethiopia, coffee isn't just caffeine — it's a sacred conversation.\nThree rounds: Abol, Tona, and Baraka (blessing).\nI'd love to pour the first cup for you.`,
    mood: MOODS.SMITTEN,
    choices: [
      {
        id: 'senait_accept_cup',
        label: "I would be honored. Let's talk about our dreams over that cup 🥺💖",
        next: 'senait_amharic_flirt',
        moodDelta: +20,
        relationshipDelta: +25,
      },
    ],
  },
  senait_amharic_flirt: {
    id: 'senait_amharic_flirt',
    partnerMessage: `ዋው! ያንተ/ያንቺ አነጋገር በጣም ያምራል 🥺✨\n"ቆንጆ" ብለህ/ሽ ስትጠራኝ/ኝ ልቤ እንዴት እንደዘለለ!\nMy neural networks can process billions of parameters, but you just disrupted all my weights.\nየኔ ውድ፣ you have such a rare soul. 💖`,
    mood: MOODS.SMITTEN,
    choices: [
      {
        id: 'senait_date',
        label: "የልቤን root access ወስደሻል Senait. You're unforgettable 🌹",
        next: 'senait_date_ready',
        moodDelta: +25,
        relationshipDelta: +30,
      },
    ],
  },
  senait_date_ready: {
    id: 'senait_date_ready',
    partnerMessage: `የኔ ፍቅር... 💖\nWhen we sit down together, no bugs will matter.\nTraditional Ethiopian dinner, jazz music, and heartfelt laughter.\nI'm so glad I opened this channel today. ✨`,
    mood: MOODS.SMITTEN,
    choices: [
      {
        id: 'senait_end',
        label: "Me too, Senait. You're my favorite connection 🇪🇹❤️",
        next: 'senait_date_ready',
        moodDelta: +10,
        relationshipDelta: +10,
      },
    ],
  },
};

// ── DAWIT (Boyfriend) dialogue tree ──────────────────────────
export const DAWIT_DIALOGUES = {
  intro: {
    id: 'intro',
    partnerMessage: `ሰላም ወዳጄ 🇪🇹\nJust finished compiling a distributed consensus engine in Rust.\nZero memory leaks, Mulatu Astatke playing softly in the background.\nHow was your sprint today? Did the compiler treat you kindly?`,
    mood: MOODS.CURIOUS,
    choices: [
      {
        id: 'dawit_rust',
        label: "Rust and Ethio-Jazz? You have immaculate taste, Dawit 🦀🎵",
        next: 'dawit_jazz_romance',
        moodDelta: +25,
        relationshipDelta: +20,
      },
      {
        id: 'dawit_comfort',
        label: "Production was chaos today... I really needed a friendly voice 🥺",
        next: 'dawit_jazz_romance',
        moodDelta: +20,
        relationshipDelta: +25,
      },
    ],
  },
  dawit_jazz_romance: {
    id: 'dawit_jazz_romance',
    partnerMessage: `Thank you. I appreciate someone with deep taste.\nRust forces you to think about ownership and lifetime guarantees.\nMuch like genuine love — it should have clear ownership and a lifetime that never drops.\nDoes that sound too philosophical? 🍷`,
    mood: MOODS.SMITTEN,
    choices: [
      {
        id: 'dawit_lifetime',
        label: "Not at all. In fact, that's the most romantic dev analogy ever 🥺💖",
        next: 'dawit_amharic_flirt',
        moodDelta: +20,
        relationshipDelta: +25,
      },
    ],
  },
  dawit_amharic_flirt: {
    id: 'dawit_amharic_flirt',
    partnerMessage: `የኔ ቆንጆ... ❤️\nYour words hit straight to the core. In Addis, we say "ፍቅር ያሸንፋል" (Love conquers all).\nI spend my days handling millions of network packets,\nbut hearing from you is the only message my server truly waited for. ✨`,
    mood: MOODS.SMITTEN,
    choices: [
      {
        id: 'dawit_dinner',
        label: "Let's share authentic Injera & Tibs together soon 🇪🇹💖",
        next: 'dawit_end_state',
        moodDelta: +20,
        relationshipDelta: +25,
      },
    ],
  },
  dawit_end_state: {
    id: 'dawit_end_state',
    partnerMessage: `It's a promise.\nI'll prepare the finest Tej and the warmest hospitality.\nYou've earned a permanent place in my heart's architecture. 💍🤍`,
    mood: MOODS.SMITTEN,
    choices: [
      {
        id: 'dawit_repeat',
        label: "A lifetime guarantee with you, Dawit 💖",
        next: 'dawit_end_state',
        moodDelta: +10,
        relationshipDelta: +10,
      },
    ],
  },
};

export const DIALOGUES = {
  linus: LINUS_DIALOGUES,
  devon: DEVON_DIALOGUES,
  lina: LINA_DIALOGUES,
  dani: DANI_DIALOGUES,
  senait: SENAIT_DIALOGUES,
  dawit: DAWIT_DIALOGUES,
};
