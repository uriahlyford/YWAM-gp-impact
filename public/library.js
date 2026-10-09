/*  The Library — five-minute reads of the books on Craig Groeschel's four
    leadership book lists (craiggroeschel.com, "44 leadership books" series),
    written for GP in our own words. Not the authors' or publishers' text and not
    any summary service's; no quotations. Covers load on the phone from Open
    Library by ISBN (teams.html draws a cover underneath in case one is missing).

    Plain script, loaded only when the Library is opened (libLoad_ in teams.html).
    To add a book: add an object with the same fields to GP_LIBRARY.books —
    tests/test-library.mjs checks every field, the shelf, the ISBN check digit
    and that ids are unique. The summaries are English on purpose for now. */
var GP_LIBRARY = {
 "shelves": [
  {
   "id": "lead",
   "name": "Lead & grow",
   "emoji": "🚀",
   "color": "#2D6CB0",
   "ink": "#1D4C82"
  },
  {
   "id": "people",
   "name": "People & culture",
   "emoji": "🤝",
   "color": "#B5475A",
   "ink": "#8A2E40"
  },
  {
   "id": "habits",
   "name": "Habits & goals",
   "emoji": "🔁",
   "color": "#1F8A6F",
   "ink": "#11604D"
  },
  {
   "id": "create",
   "name": "Create & communicate",
   "emoji": "💡",
   "color": "#C9800F",
   "ink": "#7A4A04"
  }
 ],
 "startHere": [
  "the-21-irrefutable-laws-of-leadership",
  "lead-like-jesus",
  "multipliers",
  "the-advantage",
  "the-five-dysfunctions-of-a-team",
  "crucial-conversations",
  "start-with-why",
  "the-4-disciplines-of-execution",
  "extreme-ownership",
  "boundaries"
 ],
 "books": [
  {
   "id": "developing-the-leader-within-you",
   "title": "Developing the Leader Within You",
   "author": "John C. Maxwell",
   "year": 1993,
   "isbn": "",
   "shelf": "lead",
   "mins": 5,
   "vibe": "Leadership is not a job title. It's influence — and you can grow it.",
   "bigIdea": "Maxwell says leadership is simply influence: people follow you because they choose to, not because they have to. Leaders are not only born — they can be developed. Growing as a leader starts on the inside, with your character, priorities and attitude. (He later released an updated version, Developing the Leader Within You 2.0, with refreshed chapters.)",
   "insights": [
    {
     "emoji": "🧲",
     "title": "Leadership = influence",
     "body": "If nobody is following you, you are just taking a walk. A title can give you authority, but it cannot give you real influence. Everyone influences someone, so everyone can grow as a leader."
    },
    {
     "emoji": "🪜",
     "title": "The 5 Levels of Leadership",
     "body": "Level 1 is Position: people follow because they must. Level 2 is Permission: they follow because they like and trust you. Level 3 is Production: they follow because of what you get done together. Level 4 is People Development: they follow because you helped them grow. Level 5 is Personhood: they follow because of who you are over many years."
    },
    {
     "emoji": "🎯",
     "title": "Priorities first",
     "body": "Being busy is not the same as being effective. Maxwell uses the 80/20 idea: a small part of your work brings most of your results. Find that part and give it your best time and energy."
    },
    {
     "emoji": "🧭",
     "title": "Integrity is the foundation",
     "body": "People trust leaders whose words and actions match. Your image is what people think you are; your integrity is what you really are. Trust takes a long time to build and a short time to break."
    },
    {
     "emoji": "🔧",
     "title": "Problems are your training ground",
     "body": "Leaders are not people who avoid problems. They are people who help solve them. Learning to face problems calmly is one of the fastest ways to earn influence."
    },
    {
     "emoji": "☀️",
     "title": "Attitude and self-discipline",
     "body": "Your attitude often decides how far you go, more than your skills do. Self-discipline is the price of growth: doing the right thing even when you don't feel like it. Lead yourself well before you try to lead others."
    },
    {
     "emoji": "🌱",
     "title": "Grow your people",
     "body": "A leader's success is measured by the people around them. Great leaders spend time developing their team, not only directing it. The more leaders you raise, the bigger the impact."
    }
   ],
   "tryThis": [
    "Ask yourself honestly: on which of the 5 Levels am I with each person on my team?",
    "List your tasks this week and circle the 20% that will bring 80% of the results. Do those first.",
    "Pick one younger staff member or student and invest in them on purpose this month."
   ],
   "forUs": "On a mission base, most of us lead without big titles — a kitchen shift, a small group, an outreach team. That is good news: influence is built through trust, faithfulness and care, not position. Leaders who raise up Khmer and international staff to lead after them are building something that lasts.",
   "oneLine": "Real leadership is influence, and it grows from the inside out."
  },
  {
   "id": "first-break-all-the-rules",
   "title": "First, Break All the Rules",
   "author": "Marcus Buckingham & Curt Coffman",
   "year": 1999,
   "isbn": "9780684852867",
   "shelf": "lead",
   "mins": 5,
   "vibe": "Stop trying to fix people. Find their talent and set it free.",
   "bigIdea": "Based on huge Gallup research with tens of thousands of managers, this book shows that the best managers often break the usual rules. They don't try to change people into something they are not. Instead, they find each person's natural talents and help them use those talents every day.",
   "insights": [
    {
     "emoji": "👤",
     "title": "People leave managers",
     "body": "The research found that the direct manager matters more than the organization for how people feel at work. A great place to work is built one team and one manager at a time. If you lead people, you shape their experience more than any policy does."
    },
    {
     "emoji": "🔢",
     "title": "The 12 questions",
     "body": "Gallup found 12 questions that show if a workplace is strong. The most basic ones: Do I know what is expected of me? Do I have what I need to do my work? Do I get to do what I do best every day? Does someone at work care about me as a person?"
    },
    {
     "emoji": "💎",
     "title": "Talent is not the same as skill",
     "body": "Skills and knowledge can be taught. Talent is a natural pattern of thinking, feeling or acting that keeps showing up. You can train skills, but you cannot easily put talent in where it is missing."
    },
    {
     "emoji": "🙅",
     "title": "People don't change much",
     "body": "Great managers don't waste time trying to put in what was left out. They try to draw out what is already there. That is less tiring for everyone — and it works better."
    },
    {
     "emoji": "🗝️",
     "title": "The four keys",
     "body": "Great managers do four things: select people for talent, not only experience; define the right outcomes, not every step; focus on strengths, not weaknesses; and find the right fit for each person."
    },
    {
     "emoji": "🏁",
     "title": "Outcomes, not control",
     "body": "Tell people clearly what result you want. Then let them find their own way to get there, inside a few clear rules. This builds ownership and respects that people work differently."
    },
    {
     "emoji": "🧩",
     "title": "Right person, right role",
     "body": "Promotion is not the only way to honour someone. Sometimes the best gift is helping a person grow deeper in the role they are great at. Help people find where they truly shine."
    }
   ],
   "tryThis": [
    "Ask each person on your team: 'When did you last feel you were doing what you do best?'",
    "For one task you lead, write down the outcome you want — and stop telling people every step.",
    "Encourage someone this week for a specific thing they did well."
   ],
   "forUs": "On base, we often put people where there is a gap, not where they fit. Gaps are real, but notice what each staff member and student is naturally good at — hospitality, teaching, details, encouragement — and lean into it. Clear expectations and real care matter even more when Khmer and international staff work side by side with different ways of doing things.",
   "oneLine": "Great managers find each person's talent and build on it, instead of trying to fix them."
  },
  {
   "id": "good-to-great",
   "title": "Good to Great",
   "author": "Jim Collins",
   "year": 2001,
   "isbn": "9780066620992",
   "shelf": "lead",
   "mins": 5,
   "vibe": "Good is the biggest enemy of great. Don't settle.",
   "bigIdea": "Collins and his research team studied companies that jumped from average results to great results and stayed there for years. They compared them with similar companies that never made the jump. The difference was not luck or a big moment — it was humble leaders, the right people, honest facts, clear focus and steady discipline over time.",
   "insights": [
    {
     "emoji": "🙇",
     "title": "Level 5 Leadership",
     "body": "The leaders of great companies were not loud celebrities. They mixed deep personal humility with a very strong will to do what is best for the organization. When things go well, they give credit to others. When things go badly, they look at themselves first."
    },
    {
     "emoji": "🚌",
     "title": "First who, then what",
     "body": "Great leaders first got the right people on the bus and the wrong people off the bus. Only then did they decide where to drive. With the right people, you need less control and less motivating."
    },
    {
     "emoji": "🧊",
     "title": "Face the brutal facts",
     "body": "Great teams look honestly at hard reality. Collins calls this the Stockdale Paradox: keep strong faith that you will win in the end, but also face the hardest facts of today. Hope and honesty go together."
    },
    {
     "emoji": "🦔",
     "title": "The Hedgehog Concept",
     "body": "Find where three circles overlap: what you are deeply passionate about, what you can be the best in the world at, and what drives your economic engine. Then say no to things outside that overlap. Simple focus beats doing many things okay."
    },
    {
     "emoji": "📏",
     "title": "A culture of discipline",
     "body": "Great organizations have disciplined people, disciplined thinking and disciplined action. When people are self-disciplined, you need fewer rules. Freedom works best inside a clear framework."
    },
    {
     "emoji": "🎡",
     "title": "The Flywheel",
     "body": "There was no single big moment of change. It was like pushing a heavy wheel — slowly at first, then faster as each push builds on the last. Organizations that keep jumping to new programs fall into a 'doom loop' instead."
    },
    {
     "emoji": "💻",
     "title": "Tools are accelerators",
     "body": "Great companies used technology to speed up what already worked. They did not use it as the main cause of change. New tools cannot fix a lack of focus."
    }
   ],
   "tryThis": [
    "Draw the three Hedgehog circles for your ministry and write what goes in each one.",
    "Name one 'brutal fact' your team has been avoiding and talk about it honestly this week.",
    "Choose one small, steady push you will repeat every week instead of starting something new."
   ],
   "forUs": "Collins later wrote a short follow-up for non-profits, noting that for them the 'economic engine' is more about resources and support than profit. For a mission base, the Hedgehog questions are powerful: what are we passionate about, what can we do really well here in Cambodia, and what keeps our people and resources strong? Humble leaders, the right people in the right seats and steady faithfulness will take a ministry further than a new idea every season.",
   "oneLine": "Greatness comes from humble leaders, the right people, honest facts, clear focus and steady discipline."
  },
  {
   "id": "never-split-the-difference",
   "title": "Never Split the Difference",
   "author": "Chris Voss (with Tahl Raz)",
   "year": 2016,
   "isbn": "9780062407801",
   "shelf": "lead",
   "mins": 5,
   "vibe": "Hostage negotiation skills for everyday talks. Listen like it matters — because it does.",
   "bigIdea": "Chris Voss was a lead FBI hostage negotiator. He says people are not purely logical; emotions drive most decisions. The best negotiators don't win by arguing harder. They win by deeply understanding the other person and making them feel understood — he calls this tactical empathy.",
   "insights": [
    {
     "emoji": "🫶",
     "title": "Tactical empathy",
     "body": "Empathy here does not mean agreeing. It means understanding how the other person feels and showing them that you understand. When people feel heard, they relax and become more open."
    },
    {
     "emoji": "🪞",
     "title": "Mirroring",
     "body": "Repeat the last few important words the other person said, with a curious tone. It sounds simple, but it makes people keep talking and explain more. You learn a lot just by letting them talk."
    },
    {
     "emoji": "🏷️",
     "title": "Labeling",
     "body": "Name the feeling you notice: 'It seems like you're worried about...' or 'It sounds like this has been frustrating.' Naming a negative feeling calms it down. Then stay quiet and let them respond."
    },
    {
     "emoji": "✅",
     "title": "Aim for 'That's right'",
     "body": "When you sum up someone's view so well that they say 'that's right', real trust begins. 'You're right' is often just a polite way to end the talk. 'That's right' means they feel truly understood."
    },
    {
     "emoji": "🙅",
     "title": "'No' is a good start",
     "body": "People feel safe and in control when they can say no. Voss suggests questions that invite a 'no', like 'Is now a bad time to talk?' A 'no' often opens the real conversation."
    },
    {
     "emoji": "❓",
     "title": "Calibrated questions",
     "body": "Ask open questions that start with 'how' or 'what'. For example: 'How am I supposed to do that?' or 'What is the biggest challenge for you here?' These invite the other person to help solve the problem with you."
    },
    {
     "emoji": "📻",
     "title": "Voice and the accusation audit",
     "body": "A calm, slow, warm voice helps people feel safe. Before a hard talk, list the negative things they might think about you — and say them first. Saying them out loud often makes them lose their power."
    }
   ],
   "tryThis": [
    "In your next conversation, mirror the last three words someone says and see what happens.",
    "Before a hard talk, write down every negative thing they might think about you, and open by naming a few.",
    "Swap one 'why' question for a 'how' or 'what' question this week."
   ],
   "forUs": "Negotiation is everywhere on a mission base — with landlords, vendors at the market, local officials, partner churches and even with each other about schedules. These tools are really about listening well, which is a deeply Christ-like skill. Across cultures, slowing down, naming feelings and asking 'how' questions can protect relationships and save face for everyone.",
   "oneLine": "Make people feel truly understood first, and better agreements will follow."
  },
  {
   "id": "predictable-success",
   "title": "Predictable Success",
   "author": "Les McKeown",
   "year": 2010,
   "isbn": "",
   "shelf": "lead",
   "mins": 5,
   "vibe": "Every team has a life cycle. Know your stage, know your next move.",
   "bigIdea": "McKeown says every organization moves through predictable stages as it grows. Each stage has its own typical problems. The goal is to reach — and stay in — the stage he calls Predictable Success, where the team can set goals and reach them consistently, without losing its energy and creativity.",
   "insights": [
    {
     "emoji": "🌱",
     "title": "Early Struggle",
     "body": "At the start, everything is about survival. Can we find the people, the money and the right idea to keep going? Many new ventures don't make it past this stage."
    },
    {
     "emoji": "🎉",
     "title": "Fun",
     "body": "Once the idea works, growth comes fast and it feels exciting. Decisions are quick and everyone does a bit of everything. But it usually depends heavily on one or two key people."
    },
    {
     "emoji": "🌊",
     "title": "Whitewater",
     "body": "As the group gets bigger, things get messy: mistakes, confusion and conflict. The old informal way no longer works. The team needs clear systems and processes, and this change often causes tension."
    },
    {
     "emoji": "🎯",
     "title": "Predictable Success",
     "body": "This is the sweet spot. There is a good balance between structure and creativity, so the team can plan and reliably hit its goals. The key work here is to stay balanced and keep renewing."
    },
    {
     "emoji": "🐹",
     "title": "Treadmill, Big Rut and Death Rattle",
     "body": "If structure keeps growing without new ideas, the team gets stuck on a Treadmill of rules and paperwork. Next comes the Big Rut, where things look stable but are slowly dying inside. The final stage, Death Rattle, is decline toward closing."
    },
    {
     "emoji": "🧑‍🤝‍🧑",
     "title": "Different leaders for different needs",
     "body": "McKeown describes leadership styles like the Visionary (big ideas), the Operator (gets things done) and the Processor (builds systems). Each one is needed, but they often clash. The Synergist is the one who helps them work together."
    }
   ],
   "tryThis": [
    "With your team, discuss honestly: which stage are we in right now?",
    "Notice whether you lean more Visionary, Operator or Processor — and thank someone who is different.",
    "If you are in a messy growth season, pick one simple process to put in place this month."
   ],
   "forUs": "A mission base has many 'organizations' inside it — a new cafe, a long-running DTS, an outreach that just started. Each may be in a different stage, so they need different kinds of leadership. Valuing the dreamers, the doers and the system-builders on our teams helps us grow without losing the life and passion that started the work.",
   "oneLine": "Know your team's stage of growth, and balance vision, action and structure to stay healthy."
  },
  {
   "id": "the-4-disciplines-of-execution",
   "title": "The 4 Disciplines of Execution",
   "author": "Chris McChesney, Sean Covey & Jim Huling",
   "year": 2012,
   "isbn": "9781451627053",
   "shelf": "lead",
   "mins": 5,
   "vibe": "Great plans die in the busyness. Here's how to actually get it done.",
   "bigIdea": "Most goals don't fail because the plan is bad. They fail because the daily urgent work — the authors call it the 'whirlwind' — eats up all our time and attention. The 4 Disciplines (often called 4DX) give teams a simple way to keep their most important goal alive in the middle of the whirlwind.",
   "insights": [
    {
     "emoji": "🌪️",
     "title": "The whirlwind",
     "body": "The whirlwind is all the urgent daily work that keeps things running. It's necessary, but it always shouts louder than new goals. 4DX doesn't remove the whirlwind — it protects a small part of your time for what matters most."
    },
    {
     "emoji": "🎯",
     "title": "Discipline 1: Focus on the Wildly Important",
     "body": "Choose one, or at most two, Wildly Important Goals (WIGs). The more goals you chase, the fewer you finish. Write each goal clearly: from X to Y by a certain date."
    },
    {
     "emoji": "🧮",
     "title": "Discipline 2: Act on lead measures",
     "body": "Lag measures tell you the result after it is too late to change it. Lead measures are the actions you can control that drive that result. Example: weight lost is a lag measure; daily walking and healthy meals are lead measures."
    },
    {
     "emoji": "📊",
     "title": "Discipline 3: Keep a compelling scoreboard",
     "body": "People play differently when they keep score. Make a simple scoreboard the team can see and understand in seconds. It should show if you are winning or losing right now."
    },
    {
     "emoji": "🗓️",
     "title": "Discipline 4: A cadence of accountability",
     "body": "Hold a short, regular meeting about the goal — usually weekly and around 20 to 30 minutes. Each person reports on last week's commitments, looks at the scoreboard, and makes one or two new commitments for next week. No whirlwind talk allowed."
    },
    {
     "emoji": "🤝",
     "title": "Commitments, not orders",
     "body": "In these meetings, people choose their own commitments instead of only receiving tasks. Keeping a promise to your team builds real ownership. Over time, the team starts to feel like winners."
    }
   ],
   "tryThis": [
    "With your team, choose one Wildly Important Goal and write it as 'from X to Y by when'.",
    "Name two lead measures — actions you control — that will move that goal.",
    "Start a 20-minute weekly check-in: report, review the scoreboard, make one commitment each."
   ],
   "forUs": "Base life is a strong whirlwind: guests arriving, meals, worship, school schedules, visa runs. If your ministry has a big goal — more Khmer leaders trained, a stronger cafe, better follow-up after outreach — pick one, track a few simple actions, and check in weekly. A whiteboard scoreboard in the office can bring Khmer and international staff together around one clear win.",
   "oneLine": "Pick one big goal, track the actions that drive it, keep score and check in every week."
  },
  {
   "id": "thou-shall-prosper",
   "title": "Thou Shall Prosper",
   "author": "Rabbi Daniel Lapin",
   "year": 2002,
   "shelf": "lead",
   "mins": 5,
   "vibe": "Money is not dirty. Done right, it's a sign that you served people well.",
   "bigIdea": "Rabbi Daniel Lapin draws on old Jewish wisdom to argue that business is moral, honourable work. In his view, money is mostly about relationships: you earn it by meeting the real needs of other people. He shares ten 'commandments' for making money, and most of them are really about character, trust and serving others. Wealth is a tool, and how you earn it and give it says a lot about who you are.",
   "insights": [
    {
     "emoji": "🤝",
     "title": "Business is moral work",
     "body": "Lapin pushes back on the idea that business is greedy or second-class. When you sell good coffee at a fair price, you make someone's day better and they freely choose to pay you. That is a good thing. Believing this changes how you work: with pride, honesty and care."
    },
    {
     "emoji": "🧾",
     "title": "Money as a thank-you note",
     "body": "He describes money as a kind of certificate that says you helped someone. Each coin is a record of a need you met. So if you want more of it, the question is not 'How do I get money?' but 'How can I serve more people, better?'"
    },
    {
     "emoji": "🕸️",
     "title": "Grow your circle of people",
     "body": "Making money is a team sport, because it always happens between people. Lapin encourages you to build many real friendships and connections, not only useful contacts. The more people you know and care about, the more ways you can help them and be helped."
    },
    {
     "emoji": "🪞",
     "title": "Know yourself, then change",
     "body": "He urges you to look honestly at your own habits, strengths and weak spots. Be consistent, so people know what to expect from you. And learn which things in life should change with the times, and which things must never change, like your values and promises."
    },
    {
     "emoji": "🎁",
     "title": "Give a tenth away",
     "body": "Lapin teaches giving about ten percent of what you earn to charity. Giving reminds you that what you have is not only yours. It also breaks the grip that money can have on your heart, and it keeps you generous when things are good and when they are hard."
    },
    {
     "emoji": "🚫",
     "title": "Don't chase perfection, don't retire",
     "body": "Waiting for the perfect plan keeps you stuck, so act and improve as you go. He also argues against the idea of stopping work to do nothing. Work is a way to serve others, so keep serving and stay useful as long as you can."
    }
   ],
   "tryThis": [
    "Think of one customer, guest or supporter and ask: what real need am I meeting for them?",
    "Reach out to one person outside your usual circle this week, just to get to know them.",
    "Look at your budget and decide on one clear, planned gift you will give this month."
   ],
   "forUs": "On a mission base we can feel awkward about money. Some of us run a cafe or small business, and many of us live on support from churches and friends. This book helps us see both as relational and honourable: serving guests with excellence is ministry, and partners who give are real relationships to care for, not just bank deposits. Khmer and international staff alike can learn to handle money with honesty, generosity and joy, trusting God as the true provider.",
   "oneLine": "Serve people well, keep your word, give generously, and money becomes a tool for good."
  },
  {
   "id": "the-e-myth-revisited",
   "title": "The E-Myth Revisited",
   "author": "Michael E. Gerber",
   "year": 1995,
   "isbn": "9780887307287",
   "shelf": "lead",
   "mins": 5,
   "vibe": "Stop just working IN your business. Start working ON it.",
   "bigIdea": "Gerber says most small businesses fail because of a myth: that people who are good at a skill will be good at running a business that uses that skill. A great baker opens a bakery and is soon drowning in work. The fix is to build simple, clear systems so the business runs well without depending on one tired person. Think of your work as a model that anyone could follow.",
   "insights": [
    {
     "emoji": "🥧",
     "title": "The great myth",
     "body": "Many businesses start when a skilled worker gets tired of working for someone else. Gerber calls this an 'entrepreneurial seizure'. He tells the story of Sarah, who loved baking pies until her pie shop took over her life. Being good at the work is not the same as building a business."
    },
    {
     "emoji": "🎭",
     "title": "Three people inside you",
     "body": "Everyone has an Entrepreneur who dreams about the future, a Manager who loves order and plans, and a Technician who just wants to do the work. Most owners are mostly Technician. A healthy business needs all three voices working together."
    },
    {
     "emoji": "🌱",
     "title": "The stages of growth",
     "body": "A business grows from infancy, when the owner does everything, to adolescence, when they get help but it feels chaotic. Many get stuck here or shrink back. Maturity comes when it is built from the start with a clear vision of what it should become."
    },
    {
     "emoji": "🍔",
     "title": "Build it like a franchise",
     "body": "Gerber's big idea is the 'franchise prototype'. Imagine your business will be copied 5,000 times. Every task should be written down and simple enough that a normal person can do it well. Then results are steady, no matter who is on shift."
    },
    {
     "emoji": "📋",
     "title": "Systems over heroes",
     "body": "When things depend on one superstar, everything breaks when that person is sick or leaves. Good systems free people to focus and to grow. Gerber suggests testing ideas, measuring results and then making the best way the normal way."
    },
    {
     "emoji": "🗺️",
     "title": "Plan the whole thing",
     "body": "He walks through a simple program: know your life aim, set the business goal, draw an org chart of roles (not names), then plan how you will manage, train people, market and run your systems. Start with roles, even if one person fills many of them."
    }
   ],
   "tryThis": [
    "Write a simple step-by-step checklist for one task you do every week.",
    "Draw an org chart of roles in your ministry, then write who fills each one today.",
    "Block one hour this week to work ON your ministry, not IN it."
   ],
   "forUs": "Our cafe, guesthouse, school office and kitchen all run better with simple systems. Staff come and go every few months, so if knowledge lives only in one person's head, it leaves with them. Written checklists in English and Khmer help new staff and volunteers serve well from day one, and they free leaders to think, pray and plan. Good systems are a gift to the next team.",
   "oneLine": "Build simple systems so your work can thrive without you holding it all."
  },
  {
   "id": "the-tipping-point",
   "title": "The Tipping Point",
   "author": "Malcolm Gladwell",
   "year": 2000,
   "isbn": "9780316346627",
   "shelf": "lead",
   "mins": 5,
   "vibe": "Small things can start big waves. Here's how ideas go viral.",
   "bigIdea": "Gladwell says ideas, trends and behaviours spread like a flu. For a long time, nothing seems to happen. Then they reach a 'tipping point' and spread very fast. He finds three rules behind this: the right few people, a message that sticks, and the right setting. Small, smart changes in any of these can make a huge difference.",
   "insights": [
    {
     "emoji": "🦠",
     "title": "Change spreads like a virus",
     "body": "Trends behave like epidemics. They are contagious, little causes can have big effects, and change happens suddenly, not slowly. Gladwell uses examples like an old brand of shoes that suddenly became cool again in the 1990s."
    },
    {
     "emoji": "👥",
     "title": "The Law of the Few",
     "body": "A small group of people does most of the spreading. Connectors know huge numbers of people. Mavens love to collect information and share it. Salesmen are great at persuading. Gladwell compares Paul Revere, a Connector who raised many fighters on his famous night ride, with another rider who carried the same news but woke far fewer people."
    },
    {
     "emoji": "🍯",
     "title": "The Stickiness Factor",
     "body": "A message has to stay in people's minds and move them to act. Gladwell shows how kids' TV shows like Sesame Street and Blue's Clues tested and tweaked tiny details so children would remember and learn. Often a small change in how you present something makes it stick."
    },
    {
     "emoji": "🏙️",
     "title": "The Power of Context",
     "body": "People are very sensitive to their surroundings. Gladwell discusses the 'broken windows' idea used in New York City: fixing small signs of disorder, like graffiti and fare-dodging, was linked with less crime. Change the setting and you can change behaviour."
    },
    {
     "emoji": "1️⃣5️⃣0️⃣",
     "title": "The Rule of 150",
     "body": "Groups work best when they stay small enough for people to really know each other, around 150 people. He describes a company that split its factories when they grew past that size. In small groups, people care about each other and pass on ideas naturally."
    },
    {
     "emoji": "🎯",
     "title": "Focus your effort",
     "body": "You do not need huge resources to start change. Find the key people, shape a message that sticks, and set up the right environment. Then test and adjust. The lesson is hopeful: with the right small push, the world can move."
    }
   ],
   "tryThis": [
    "Name the Connectors, Mavens and Salesmen in your team or community.",
    "Take one announcement or poster and make it shorter, clearer and easier to remember.",
    "Fix one small 'broken window' in your shared space this week."
   ],
   "forUs": "When we want a new value or habit to spread on base, like prayer, hospitality or cleaning up together, we can think like Gladwell. Who are the trusted people, Khmer and international, that others listen to? How can we make the message simple and sticky in both languages? Is our shared space saying the right thing? Small, faithful steps by the right people can bring real change in a team or a village.",
   "oneLine": "The right people, a sticky message and the right setting can tip small ideas into big change."
  },
  {
   "id": "the-21-irrefutable-laws-of-leadership",
   "title": "The 21 Irrefutable Laws of Leadership",
   "author": "John C. Maxwell",
   "year": 1998,
   "isbn": "9780785288374",
   "shelf": "lead",
   "mins": 5,
   "vibe": "Leadership has laws, like gravity. Learn them and people will follow.",
   "bigIdea": "Maxwell believes leadership works by laws that are true in every culture and setting. He gives 21 of them, each with stories from business, sport, history and the Bible. You cannot be perfect at all 21, but you can grow in each one and build a team that covers your gaps. Here are some of the most important laws, grouped together.",
   "insights": [
    {
     "emoji": "📏",
     "title": "The Law of the Lid",
     "body": "Your leadership ability is like a lid on how effective you and your team can be. A team rarely rises above its leader. So if you want to see more fruit, the best place to start is growing yourself as a leader."
    },
    {
     "emoji": "🧲",
     "title": "Influence and Process",
     "body": "Maxwell says the true measure of leadership is influence, nothing more and nothing less. And influence is not built in a day. It grows slowly through daily learning and faithful work, step by step, over many years."
    },
    {
     "emoji": "🪨",
     "title": "Solid Ground and Respect",
     "body": "Trust is the foundation of all leadership. Every time you break trust, you lose some of your influence. People naturally follow leaders who are stronger than themselves, so earn respect through character, courage and care."
    },
    {
     "emoji": "❤️",
     "title": "Connection and Magnetism",
     "body": "Leaders touch a heart before they ask for a hand. People need to feel you care before they follow. Also, who you are is who you attract: if you want a team that is faithful and kind, grow those things in yourself first."
    },
    {
     "emoji": "⭕",
     "title": "Inner Circle and Empowerment",
     "body": "A leader's potential depends on the people closest to them, so choose your inner circle wisely. Secure leaders give power away instead of holding it tight. They trust others, train them and let them lead."
    },
    {
     "emoji": "🤲",
     "title": "Buy-In and Sacrifice",
     "body": "People buy into the leader first, then the vision. If they don't trust you, even a great plan will struggle. And leaders must give up to go up: the higher you go, the more you are asked to lay down your own comfort and rights."
    },
    {
     "emoji": "🌳",
     "title": "Explosive Growth and Legacy",
     "body": "Leaders who develop followers grow slowly, but leaders who develop other leaders multiply. Your lasting value is measured by who comes after you. Plan for your work to continue long after you are gone."
    }
   ],
   "tryThis": [
    "Pick one law where you feel weak and ask a trusted friend to rate you honestly.",
    "Have one real heart-level conversation with a team member before talking about tasks.",
    "Give away one responsibility you usually keep, and coach the person who takes it."
   ],
   "forUs": "On a YWAM base, many of us lead small teams for a short time, like a DTS outreach team or a ministry shift. These laws remind us that leadership is about influence, trust and serving, which fits the way Jesus led. When we connect with hearts, give power away and raise up Khmer and international leaders to replace us, the work keeps growing even after we move on.",
   "oneLine": "Leadership is influence built on trust, and its best fruit is new leaders."
  },
  {
   "id": "how-to-win-friends-and-influence-people",
   "title": "How to Win Friends & Influence People",
   "author": "Dale Carnegie",
   "year": 1936,
   "isbn": "9780671027032",
   "shelf": "people",
   "mins": 5,
   "vibe": "People skills are not magic. They are habits of kindness you can learn.",
   "bigIdea": "People are not machines that run on logic. They run on feelings, pride and the need to feel valued. If you sincerely care about people, listen well and honour them, they will want to work with you — and you will rarely need to push.",
   "insights": [
    {
     "emoji": "🚫",
     "title": "Stop criticising, complaining and condemning",
     "body": "Criticism makes people defensive. They protect their pride and look for reasons why they were right. It almost never changes them. Try to understand why they did it instead."
    },
    {
     "emoji": "🙌",
     "title": "Give real appreciation",
     "body": "Everyone wants to feel important. Honest, specific thanks is powerful. Flattery is fake and people can tell. Appreciation is true and people remember it."
    },
    {
     "emoji": "🎯",
     "title": "Start from what they want",
     "body": "If you want someone to act, connect it to what they care about. Your own goals do not move other people. Ask yourself: why would this matter to them?"
    },
    {
     "emoji": "👂",
     "title": "Be interested, not interesting",
     "body": "You make more friends by caring about people than by trying to impress them. Ask questions. Let them talk about themselves. A good listener is rare and loved."
    },
    {
     "emoji": "😊",
     "title": "Smile and remember names",
     "body": "A warm smile says, 'I am happy to see you.' A person's name is a sweet sound to them. Learn it, use it, and get it right."
    },
    {
     "emoji": "🤝",
     "title": "You cannot win an argument",
     "body": "Even if you win the argument, the other person feels smaller and still disagrees. Respect their opinion. If you are wrong, admit it quickly. Begin with things you agree on."
    },
    {
     "emoji": "🌱",
     "title": "Lead by building people up",
     "body": "Begin with praise before you correct. Point to mistakes gently, and talk about your own mistakes first. Ask questions instead of giving orders. Let people keep their dignity, and praise every small step forward."
    }
   ],
   "tryThis": [
    "Learn the full name of three people on base you do not know well — and use their names this week.",
    "In your next conversation, ask two questions about the other person before you share anything about yourself.",
    "Before you correct someone, first tell them one specific thing they are doing well."
   ],
   "forUs": "In Cambodia, 'face' and respect matter a lot — which makes Carnegie's advice even more important. Correct people privately and gently, honour Khmer staff and elders by name, and celebrate small wins. It is basically loving your neighbour, applied to everyday conversations.",
   "oneLine": "Care about people sincerely, and influence will follow."
  },
  {
   "id": "extreme-ownership",
   "title": "Extreme Ownership",
   "author": "Jocko Willink & Leif Babin",
   "year": 2015,
   "isbn": "9781250067050",
   "shelf": "people",
   "mins": 5,
   "vibe": "No excuses. No blame. If it is your team, it is your problem — and your chance to fix it.",
   "bigIdea": "Two former Navy SEAL officers share what they learned leading teams in war and then teaching business leaders. Their main idea: a leader owns everything in their world — the wins and the failures. When leaders take full responsibility instead of blaming others, teams improve fast.",
   "insights": [
    {
     "emoji": "🙋",
     "title": "Own it all",
     "body": "When something goes wrong, the leader does not point at the team, the plan or bad luck. The leader says, 'This is on me,' and then fixes it. This honesty builds trust, and soon the whole team starts owning problems too."
    },
    {
     "emoji": "🚣",
     "title": "No bad teams, only bad leaders",
     "body": "In SEAL training, two boat crews swapped leaders. The worst crew quickly became one of the best. Same people, new leader. What a leader accepts as normal becomes the team's standard."
    },
    {
     "emoji": "💡",
     "title": "Believe in the mission",
     "body": "You cannot lead people well if you do not understand why the mission matters. If you are unsure, ask your own leaders until it is clear. Then explain the 'why' to your team."
    },
    {
     "emoji": "🪞",
     "title": "Check your ego",
     "body": "Ego makes it hard to listen, admit mistakes or accept help. Confidence is good. Pride that blocks learning is dangerous."
    },
    {
     "emoji": "🧭",
     "title": "The four laws of combat",
     "body": "Cover and Move: teams support each other and do not compete. Simple: plans everyone understands. Prioritize and Execute: when everything is going wrong, pick the most important problem first and solve it. Decentralized Command: leaders on every level understand the goal and can decide for themselves."
    },
    {
     "emoji": "↕️",
     "title": "Lead up and down",
     "body": "If your team does not understand a decision, explain it better. If your boss does not support you, give them the information they need. Do not complain about leaders above you — help them."
    },
    {
     "emoji": "🗓️",
     "title": "Discipline brings freedom",
     "body": "Early mornings, clear routines and strong standards may feel restrictive. But they create freedom to adapt when things get hard. Disciplined teams can be flexible because the basics are solid."
    }
   ],
   "tryThis": [
    "Think of one recent problem you blamed on someone else. Write down what part of it was yours to own.",
    "When your team is overwhelmed, list every problem, choose the single most important one, and solve it first.",
    "Explain the 'why' behind your next task or request — not just the 'what'."
   ],
   "forUs": "On a mission base it is easy to blame the schedule, the heat, the budget or 'other teams'. Ownership sounds like: 'The outreach logistics failed — that is on me, here is how we fix it.' And Cover and Move reminds every ministry that we are one team, not competitors.",
   "oneLine": "Leaders take responsibility for everything, so their teams can win."
  },
  {
   "id": "thanks-for-the-feedback",
   "title": "Thanks for the Feedback",
   "author": "Douglas Stone & Sheila Heen",
   "year": 2014,
   "isbn": "9780143127130",
   "shelf": "people",
   "mins": 5,
   "vibe": "Feedback is hard to give, but even harder to receive. This is a book about the receiving side.",
   "bigIdea": "Most training teaches people how to give feedback, but the receiver is the one who decides whether to learn from it. Feedback triggers strong reactions in us. When you understand those reactions, you can stay calm, sort the useful from the unfair, and grow — without losing yourself.",
   "insights": [
    {
     "emoji": "📦",
     "title": "Three kinds of feedback",
     "body": "Appreciation says, 'I see you, and you matter.' Coaching says, 'Here is how to get better.' Evaluation says, 'Here is where you stand.' Many conversations go wrong because one person gives one kind and the other person wants a different kind."
    },
    {
     "emoji": "❌",
     "title": "Truth trigger",
     "body": "Sometimes the feedback just feels wrong. Before you reject it, first understand it. Ask, 'What exactly do you mean? What did you see?' Often there is something useful hidden inside the bit that feels unfair."
    },
    {
     "emoji": "👥",
     "title": "Relationship trigger",
     "body": "Sometimes the problem is who is giving it. 'Who are you to tell me that?' Then we start talking about them instead of the feedback. The authors call this switchtracking. Keep the two topics separate and discuss both."
    },
    {
     "emoji": "🪪",
     "title": "Identity trigger",
     "body": "Sometimes feedback shakes how we see ourselves: 'Maybe I am not a good leader.' People react to this very differently — some feel it strongly and for a long time. Avoid all-or-nothing thinking. You can have weaknesses and still be a good person."
    },
    {
     "emoji": "🔦",
     "title": "Everyone has blind spots",
     "body": "Others can see things about us that we cannot — like our tone of voice or our face when we are stressed. Our intentions are clear to us, but others only see our impact. Feedback can show us what we miss."
    },
    {
     "emoji": "🧩",
     "title": "Look at the system",
     "body": "Problems often come from how people and roles fit together, not just one person. Ask, 'What are we each doing that adds to this?' It reduces blame and finds better solutions."
    },
    {
     "emoji": "🛑",
     "title": "You can say no",
     "body": "Receiving feedback well does not mean accepting everything. You can listen, think about it, and still decide not to change. You can also set boundaries when feedback becomes harmful."
    }
   ],
   "tryThis": [
    "Ask a teammate: 'What is one thing I do that gets in my own way?' Then just listen and say thank you.",
    "Next time feedback stings, name the trigger to yourself: truth, relationship or identity?",
    "Before a feedback conversation, agree together: is this appreciation, coaching or evaluation?"
   ],
   "forUs": "On a cross-cultural team, feedback is extra tricky — some cultures are very direct, others are very indirect, and both can feel hurtful by accident. Learning to receive well (and to ask what someone really meant) helps Khmer and international staff trust each other. In DTS and staff reviews, growth starts with how we listen.",
   "oneLine": "You cannot control the feedback you get, but you can learn to receive it well."
  },
  {
   "id": "the-five-dysfunctions-of-a-team",
   "title": "The Five Dysfunctions of a Team",
   "author": "Patrick Lencioni",
   "year": 2002,
   "isbn": "9780787960759",
   "shelf": "people",
   "mins": 5,
   "vibe": "Smart people, bad teamwork? The problem is probably trust — and everything built on it.",
   "bigIdea": "Told as a story about a new CEO named Kathryn fixing a broken leadership team, this book shows five problems that destroy teams. They stack like a pyramid: each one grows from the one below. Fix trust first, and the rest becomes possible.",
   "insights": [
    {
     "emoji": "🧱",
     "title": "1. Absence of trust",
     "body": "At the bottom of the pyramid is a lack of trust. Here, trust means being willing to be vulnerable — to say 'I was wrong', 'I need help' or 'I am sorry'. Without it, people hide weaknesses and protect themselves."
    },
    {
     "emoji": "🤐",
     "title": "2. Fear of conflict",
     "body": "Teams without trust avoid honest debate. Meetings feel peaceful but boring, and real issues are discussed only in private. Healthy conflict is about ideas, not attacking people."
    },
    {
     "emoji": "🤷",
     "title": "3. Lack of commitment",
     "body": "If people never shared their real opinion, they will not truly support the decision. People do not need to get their way, but they need to feel heard. Then the team can agree and commit, even without full agreement."
    },
    {
     "emoji": "📏",
     "title": "4. Avoiding accountability",
     "body": "When nobody is really committed to a clear plan, nobody calls out a teammate who falls behind. The best teams hold each other accountable — peer to peer, not only through the boss."
    },
    {
     "emoji": "🏆",
     "title": "5. Inattention to results",
     "body": "At the top, people care more about their status, ego or own department than the team's shared goals. Great teams keep their eyes on collective results."
    },
    {
     "emoji": "🗣️",
     "title": "Simple tools to start",
     "body": "Share personal stories so people know each other as humans. At the end of meetings, agree out loud on what was decided and what to tell others. Make goals clear and visible to everyone."
    }
   ],
   "tryThis": [
    "In your next team meeting, have everyone share where they grew up and one challenge from their childhood.",
    "End every meeting with: 'What did we decide, and who will tell whom?'",
    "Ask one teammate directly about a concern you have been avoiding — kindly and in private."
   ],
   "forUs": "In many cultures, including Khmer culture, open disagreement can feel rude, so 'artificial harmony' is a real temptation on our base. Leaders can make it safe by being vulnerable first and by inviting quieter voices to share. Remember: everyone's first team is the whole base mission, not just their own ministry.",
   "oneLine": "Build trust first; it opens the door to honest debate, real commitment, accountability and results."
  },
  {
   "id": "emotional-intelligence",
   "title": "Emotional Intelligence",
   "author": "Daniel Goleman",
   "year": 1995,
   "isbn": "9780553383713",
   "shelf": "people",
   "mins": 5,
   "vibe": "Being smart is not enough. How you handle feelings — yours and others' — shapes your life.",
   "bigIdea": "IQ does not fully explain who does well in life. Emotional intelligence — knowing and managing your emotions and understanding other people — matters a great deal. The good news: these skills are not fixed. They can be learned at any age.",
   "insights": [
    {
     "emoji": "🧠",
     "title": "The emotional hijack",
     "body": "Part of the brain called the amygdala reacts to danger very fast — faster than our thinking brain. Sometimes it takes over and we say or do things we regret. Noticing this moment is the first step to controlling it."
    },
    {
     "emoji": "🪞",
     "title": "Self-awareness comes first",
     "body": "You cannot manage a feeling you do not notice. Knowing what you feel, while you feel it, is the base of emotional intelligence. Naming the emotion often calms it."
    },
    {
     "emoji": "🧘",
     "title": "Managing your emotions",
     "body": "Feelings are not bad — but we can choose how we respond. People who can calm themselves after anger, worry or sadness recover faster and decide more wisely."
    },
    {
     "emoji": "🍬",
     "title": "Waiting for the bigger reward",
     "body": "Goleman describes a famous study where young children could eat one sweet now or wait to get two. Children who could wait often did better years later. Self-control and hope keep us motivated toward long-term goals."
    },
    {
     "emoji": "💞",
     "title": "Empathy",
     "body": "Most emotions are shown through tone, face and body, not words. Empathy is reading these signals and feeling with others. It is the root of compassion and care."
    },
    {
     "emoji": "🤝",
     "title": "Handling relationships",
     "body": "Emotions spread between people. Skilled people can calm a tense room, give criticism kindly and specifically, and help others feel understood. These social skills make great leaders and good friends."
    }
   ],
   "tryThis": [
    "Three times today, pause and name your feeling in one word.",
    "When you feel anger rising, wait before you reply — take a walk or a few slow breaths.",
    "In your next conversation, watch the other person's face and tone, and ask how they are really doing."
   ],
   "forUs": "Mission life is emotional — culture stress, heat, tiredness, homesickness and close community. Emotional intelligence helps us notice what is happening inside before it spills onto our teammates. And across languages, reading faces and tone with empathy is often how we understand each other best.",
   "oneLine": "Know your feelings, manage them well, and read others with care."
  },
  {
   "id": "leaders-eat-last",
   "title": "Leaders Eat Last",
   "author": "Simon Sinek",
   "year": 2014,
   "isbn": "9781591845324",
   "shelf": "people",
   "mins": 5,
   "vibe": "Real leaders protect their people first. Then people give everything back.",
   "bigIdea": "The title comes from the US Marines, where officers eat after their troops. Sinek argues that great leaders build a 'Circle of Safety' where people feel protected from inside threats. When people feel safe, they trust each other, work together and face outside problems bravely.",
   "insights": [
    {
     "emoji": "🛡️",
     "title": "The Circle of Safety",
     "body": "Every workplace faces dangers from outside. When people also have to protect themselves from their own leaders and teammates, they waste energy and stop trusting. Leaders who make the inside feel safe free people to focus on the mission."
    },
    {
     "emoji": "🧪",
     "title": "The body's chemistry",
     "body": "Sinek explains four 'feel-good' chemicals. Endorphins and dopamine help us push through and reach goals. Serotonin and oxytocin help us feel proud, connected and trusting. Healthy teams need both kinds."
    },
    {
     "emoji": "⚠️",
     "title": "Stress kills trust",
     "body": "When people feel unsafe, the body releases cortisol, the stress chemical. Over time this harms health and makes people selfish and closed. Bad leadership is not just unpleasant; it can make people sick."
    },
    {
     "emoji": "🍽️",
     "title": "Leadership is sacrifice",
     "body": "Leadership is not about rank or title. It is choosing to take care of the people in your care, even when it costs you. People notice when a leader gives up comfort for them."
    },
    {
     "emoji": "🏭",
     "title": "People before numbers",
     "body": "Sinek tells of a company that faced hard times. Instead of firing people, everyone took a few weeks of unpaid leave so nobody lost their job. Staff even helped each other with the cost. Trust grew, and so did loyalty."
    },
    {
     "emoji": "👀",
     "title": "Keep it human and close",
     "body": "When organisations grow very big, leaders can start seeing people as numbers. Leaders need to stay close enough to know names and stories. Face-to-face time builds trust that emails cannot."
    }
   ],
   "tryThis": [
    "Ask your team: 'What makes you feel unsafe or worried here?' Then fix one small thing.",
    "Do one small act of service for your team this week that costs you time or comfort.",
    "Put your phone away in your next one-to-one meeting and give full attention."
   ],
   "forUs": "Jesus washed his disciples' feet — servant leadership is at the heart of our mission. A base leader who protects staff from burnout, gossip and fear builds a team that can go out and serve Cambodia with joy. Sometimes that literally means letting the team eat first.",
   "oneLine": "Make people feel safe, and they will trust you, follow you and serve together."
  },
  {
   "id": "lean-in",
   "title": "Lean In",
   "author": "Sheryl Sandberg",
   "year": 2013,
   "isbn": "9780385349949",
   "shelf": "people",
   "mins": 5,
   "vibe": "Women can lead. And everyone — men too — can help make room for them.",
   "bigIdea": "Sheryl Sandberg, then a senior leader at Facebook, writes about why so few women reach top leadership roles. She points to outside barriers like bias, and to inner barriers like fear and self-doubt. She encourages women to step forward with confidence, and asks partners, families and workplaces to support them.",
   "insights": [
    {
     "emoji": "🪑",
     "title": "Sit at the table",
     "body": "Many talented women hold back — they sit at the side of the room or do not speak up. They often feel like a fraud, even when they are doing well. Sandberg encourages women to take their seat and share their ideas."
    },
    {
     "emoji": "⚖️",
     "title": "The likeability problem",
     "body": "Research suggests that when men are successful, people like them more. When women are equally successful, people often like them less. Knowing this bias helps us notice it and treat people fairly."
    },
    {
     "emoji": "🧗",
     "title": "A jungle gym, not a ladder",
     "body": "A career does not have to go straight up. You can move sideways, try new roles and grow in many directions. Have a long-term dream and a plan for the next 18 months or so."
    },
    {
     "emoji": "🧑‍🏫",
     "title": "Mentors come from good work",
     "body": "Do not walk up to strangers and ask, 'Will you be my mentor?' Strong mentoring relationships usually grow from doing great work and asking specific questions."
    },
    {
     "emoji": "🚪",
     "title": "Don't leave before you leave",
     "body": "Some women start pulling back from opportunities years before they have children, just in case. Sandberg says: keep growing and saying yes until you actually need to make a change."
    },
    {
     "emoji": "🏠",
     "title": "Make your partner a real partner",
     "body": "Sharing housework and parenting fairly at home makes leadership possible at work. It also helps children and relationships."
    },
    {
     "emoji": "✅",
     "title": "Let go of perfect",
     "body": "Nobody can do everything perfectly. Trying to have it all and do it all leads to guilt and exhaustion. Finishing something is often better than making it perfect."
    }
   ],
   "tryThis": [
    "In your next meeting, notice who speaks and who stays quiet — and invite one quiet person to share.",
    "If you usually hold back, share one idea out loud this week, even if you feel unsure.",
    "Look at how tasks are shared in your home or team, and make one change to make it fairer."
   ],
   "forUs": "On a mission base, many of our most gifted servants are women — Khmer and international. Leaders can help by noticing who is not being heard, giving real opportunities and sharing everyday work fairly. When everyone uses their gifts fully, the whole body of Christ gets stronger.",
   "oneLine": "Step forward with courage, and help make space for others to do the same."
  },
  {
   "id": "start-with-why",
   "title": "Start with Why",
   "author": "Simon Sinek",
   "year": 2009,
   "isbn": "9781591846444",
   "shelf": "people",
   "mins": 5,
   "vibe": "People don't follow what you do. They follow why you do it.",
   "bigIdea": "Most organisations explain what they do and how they do it, but rarely why. Leaders who inspire start with their purpose. When your 'why' is clear and your actions match it, people trust you and choose to join you.",
   "insights": [
    {
     "emoji": "🎯",
     "title": "The Golden Circle",
     "body": "Picture three circles. In the middle is Why (your purpose). Then How (your way of doing things). Outside is What (your products or activities). Inspiring leaders communicate from the inside out."
    },
    {
     "emoji": "🧠",
     "title": "It matches the brain",
     "body": "Sinek links the Golden Circle to the brain. The part that handles feelings, trust and decisions does not use words. That is why decisions often 'feel right' before we can explain them. A clear why speaks to that part."
    },
    {
     "emoji": "🎣",
     "title": "Inspire, don't manipulate",
     "body": "Discounts, fear, pressure and promises can get people to act once. But they do not build loyalty. Inspiration — people believing what you believe — lasts much longer."
    },
    {
     "emoji": "✈️",
     "title": "Purpose beats resources",
     "body": "The Wright brothers had little money and no fancy team. A well-funded rival, Samuel Langley, wanted fame. The Wrights wanted to change the world through flight, and they inspired their small team to keep going. They flew first."
    },
    {
     "emoji": "🔗",
     "title": "Clarity, discipline, consistency",
     "body": "You need a clear why, the discipline to live it out in your how, and consistency in your what. If what you do does not match why you say you do it, people stop trusting."
    },
    {
     "emoji": "🥬",
     "title": "The celery test",
     "body": "Imagine everyone gives you different advice — buy this, add that. If you know your why, you can choose only what fits it. Others can then see what you believe from the choices you make."
    },
    {
     "emoji": "📉",
     "title": "When the why goes fuzzy",
     "body": "As organisations grow, or the founder leaves, they can forget why they started. They become focused only on results and numbers. Leaders must keep telling the story of why."
    }
   ],
   "tryThis": [
    "Write your personal 'why' in one sentence: 'To ___ so that ___.'",
    "Before your next announcement or recruiting talk, start with why it matters, then explain how and what.",
    "Look at one activity in your ministry and ask: does this clearly match our why?"
   ],
   "forUs": "YWAM has a strong why: to know God and to make Him known. When we explain the why first — to DTS students, new staff or local partners — tasks like cleaning, cooking and paperwork become part of the mission. Make sure every ministry, in Siem Reap and Poipet, can say its why in simple words, in both Khmer and English.",
   "oneLine": "Start with your purpose; it is what inspires people to follow."
  },
  {
   "id": "boundaries",
   "title": "Boundaries",
   "author": "Henry Cloud & John Townsend",
   "year": 1992,
   "isbn": "9780310351801",
   "shelf": "people",
   "mins": 5,
   "vibe": "Saying 'no' can be one of the most loving words you ever say.",
   "bigIdea": "A boundary is like a property line. It shows where you end and someone else begins. God made us responsible for our own hearts, choices and feelings — not for everyone else's. When we know our boundaries, we can love people freely instead of out of fear or guilt. Healthy boundaries are not selfish; they are part of being a good steward of the life God gave you.",
   "insights": [
    {
     "emoji": "🏡",
     "title": "Know your property line",
     "body": "Inside your 'yard' are your feelings, attitudes, choices, time and values. You are the one who must look after them. Other people own their yard. Problems start when we try to manage their yard and forget our own."
    },
    {
     "emoji": "🎒",
     "title": "Boulders and backpacks",
     "body": "The Bible says to carry each other's burdens, and also that each person must carry their own load. A boulder is a crisis too heavy for one person — help with that. A backpack is daily responsibility — each of us carries our own. Love helps with boulders, but does not carry someone's backpack for them."
    },
    {
     "emoji": "🚪",
     "title": "Fences with gates, not walls",
     "body": "Boundaries are not about shutting people out. A good fence has a gate. You let good things in and keep harmful things out. You can open the gate when it is safe and close it when it is not."
    },
    {
     "emoji": "🧩",
     "title": "Four boundary problems",
     "body": "'Compliant' people say yes to things they should refuse. 'Avoidant' people say no to good things, like asking for help. 'Controllers' don't respect other people's no. 'Nonresponsive' people ignore real needs around them. Most of us lean toward one or two of these."
    },
    {
     "emoji": "🌾",
     "title": "Let people reap what they sow",
     "body": "When we always rescue someone from the results of their choices, they never learn. Natural consequences are a teacher. Stepping back is sometimes the most caring thing you can do."
    },
    {
     "emoji": "😤",
     "title": "Expect pushback",
     "body": "When you start setting boundaries, some people will be upset, especially those who benefited from you having none. That does not mean you are wrong. Stay kind, stay calm, and stay clear."
    },
    {
     "emoji": "✝️",
     "title": "God has boundaries too",
     "body": "God is clear about who he is and what he will and won't do. He lets people choose, and he lets them face the results. He respects our 'no' even when it hurts him. Our boundaries reflect his character."
    }
   ],
   "tryThis": [
    "Notice one place this week where you said yes but meant no. Write down why.",
    "Practise a gentle, honest sentence: 'I can't do that this time, but I can help with ___.'",
    "Ask a friend for help with one real 'boulder' instead of carrying it alone."
   ],
   "forUs": "On a mission base, the needs never stop, and it is easy to feel guilty for resting or saying no. Some of us grew up in cultures where saying no to an elder or leader feels impossible, and others say no too quickly. Talk as a team about what healthy boundaries look like — days off, sleep, family time — so nobody has to fight for them alone. Leaders can protect their staff's limits instead of testing them. Serving out of overflow lasts longer than serving out of exhaustion.",
   "oneLine": "Own your life, help with the boulders, and let love — not guilt — drive your yes."
  },
  {
   "id": "the-power-of-moments",
   "title": "The Power of Moments",
   "author": "Chip Heath & Dan Heath",
   "year": 2017,
   "isbn": "9781501147760",
   "shelf": "people",
   "mins": 5,
   "vibe": "Life is mostly ordinary days — so design the moments that people will never forget.",
   "bigIdea": "We remember life in moments, not in averages. A few peak moments shape how we feel about a whole experience. These 'defining moments' don't have to be random — we can create them on purpose. The Heath brothers show that most great moments contain one or more of four elements: Elevation, Insight, Pride and Connection.",
   "insights": [
    {
     "emoji": "🏔️",
     "title": "Peaks and endings matter most",
     "body": "When people remember an experience, they mostly remember the best (or worst) moment and the ending. The middle fades. So you don't need to make everything perfect. Make a few peaks great, and finish strong."
    },
    {
     "emoji": "🚀",
     "title": "Elevation: break the script",
     "body": "Elevation moments rise above the everyday. Add surprise, raise the stakes, and make the senses come alive. A small surprise breaks the normal routine and makes people pay attention. Think celebrations, ceremonies and unexpected kindness."
    },
    {
     "emoji": "💡",
     "title": "Insight: trip over the truth",
     "body": "Some moments suddenly change how we see ourselves or the world. You can create them by helping people meet a problem face to face, not just hear about it. Stretching people with a real challenge also helps them discover what they are capable of."
    },
    {
     "emoji": "🏅",
     "title": "Pride: celebrate the wins",
     "body": "We feel proud when we are recognised and when we reach milestones. Specific, personal thanks means far more than general praise. Break long journeys into smaller milestones so people get to celebrate along the way."
    },
    {
     "emoji": "🤝",
     "title": "Connection: share the moment",
     "body": "Moments become powerful when we share them with others. Doing something meaningful together, or struggling together, bonds a group. People also feel connected when they feel truly understood and cared for."
    },
    {
     "emoji": "🚪",
     "title": "Don't waste transitions",
     "body": "First days, last days and big changes are natural moments. Many organisations let them pass with paperwork and silence. Instead, mark them. A warm welcome on someone's first day can shape how they feel for years."
    }
   ],
   "tryThis": [
    "Plan one small surprise for a teammate this week that breaks the normal routine.",
    "Write a short, specific thank-you note to someone, naming exactly what they did and why it mattered.",
    "Look at your calendar for the next month and find one transition you can turn into a moment."
   ],
   "forUs": "YWAM life is full of natural moments: a DTS student's first day, the send-off before outreach, the return, graduation, a new staff member arriving or a long-term worker leaving. These are gifts — let's not rush past them. Mix cultures in how we celebrate: Khmer hospitality, food and blessing alongside other traditions. Honour people in ways that fit them; for some, public praise feels great, for others a quiet word means more. And remember that many spiritual moments are also defining moments — make space for God to meet people.",
   "oneLine": "Don't just wait for great moments — create them, especially at the peaks and transitions."
  },
  {
   "id": "the-advantage",
   "title": "The Advantage",
   "author": "Patrick Lencioni",
   "year": 2012,
   "isbn": "9780470941522",
   "shelf": "people",
   "mins": 5,
   "vibe": "Being smart is not enough. Healthy teams beat clever teams.",
   "bigIdea": "Most organisations focus on being 'smart' — strategy, plans and skills. Lencioni says the bigger advantage is being healthy: little politics, little confusion, high trust and good morale. Health is simple and free, but it takes courage and discipline. He gives four steps to get there.",
   "insights": [
    {
     "emoji": "🩺",
     "title": "Health beats smarts",
     "body": "A healthy organisation uses all the intelligence it already has. An unhealthy one wastes it through politics and confusion. Leaders often skip health because it feels soft. But it is the foundation that makes everything else work."
    },
    {
     "emoji": "🤝",
     "title": "Step 1: Build a cohesive leadership team",
     "body": "The top team must trust each other, argue honestly about ideas, commit to decisions, hold each other accountable and focus on shared results. If the leaders are divided, everyone below them feels it. Leaders must see the leadership team as their first team."
    },
    {
     "emoji": "❓",
     "title": "Step 2: Create clarity",
     "body": "Leaders must agree on six simple questions: Why do we exist? How do we behave? What do we do? How will we succeed? What is most important right now? Who must do what? Clear answers remove a lot of confusion lower down."
    },
    {
     "emoji": "🎯",
     "title": "Have one top priority",
     "body": "Lencioni calls the answer to 'what is most important right now' a 'thematic goal' or rallying cry. It is one shared goal for a season, usually a few months. When everything is a priority, nothing is."
    },
    {
     "emoji": "📣",
     "title": "Step 3: Overcommunicate clarity",
     "body": "Leaders often say something once and think everyone understood. People need to hear a message many times, from different leaders, before they believe it. Repeating yourself is not boring — it is leadership."
    },
    {
     "emoji": "⚙️",
     "title": "Step 4: Reinforce clarity",
     "body": "Build your values and priorities into everyday systems: hiring, welcoming new people, reviews, rewards and even letting people go. This keeps clarity alive without leaders policing it all the time."
    },
    {
     "emoji": "🗓️",
     "title": "Meetings matter",
     "body": "Bad meetings drain teams. Lencioni suggests different meetings for different purposes, like a short daily check-in, a weekly tactical meeting and longer times for big strategic topics."
    }
   ],
   "tryThis": [
    "Try answering the six questions for your ministry team in one sentence each.",
    "Agree with your team on one top priority for the next three months.",
    "Pick one key message and repeat it clearly at least three times this week."
   ],
   "forUs": "A YWAM base can have many ministries, each doing good work but not always pulling in the same direction. Clarity helps everyone, especially staff working in a second language — simple, repeated messages beat long, clever ones. Leaders from different cultures may avoid conflict in different ways, so building trust is step one. Ask your leaders the six questions together, and pray over the answers. When the leadership team is united, the whole base feels safer.",
   "oneLine": "Get your leaders united, get clear, say it again and again, and build it into how you work."
  },
  {
   "id": "multipliers",
   "title": "Multipliers",
   "author": "Liz Wiseman (with Greg McKeown)",
   "year": 2010,
   "isbn": "9780061964398",
   "shelf": "people",
   "mins": 5,
   "vibe": "The best leaders don't make you feel small. They make you smarter.",
   "bigIdea": "Some leaders drain the energy and ideas from people around them. Wiseman calls them 'Diminishers'. Other leaders, 'Multipliers', bring out more intelligence and effort than people knew they had. Her research found Multipliers get roughly twice as much from their people. The difference is mostly about what a leader believes: that people are smart and can figure things out.",
   "insights": [
    {
     "emoji": "🧲",
     "title": "Talent Magnet, not Empire Builder",
     "body": "Empire Builders collect people and keep them for their own success. Talent Magnets find what people are naturally good at, use them fully, and help them grow — even if it means they move on. Good people want to work for them."
    },
    {
     "emoji": "🕊️",
     "title": "Liberator, not Tyrant",
     "body": "Tyrants create fear, so people play it safe and hide mistakes. Liberators create a calm, safe space where people can think and speak up. But they also expect people's best work."
    },
    {
     "emoji": "🧗",
     "title": "Challenger, not Know-It-All",
     "body": "Know-It-Alls give all the answers and show off what they know. Challengers ask big questions and set stretching goals. They point to an opportunity and let people work out how to get there."
    },
    {
     "emoji": "🗣️",
     "title": "Debate Maker, not Decision Maker",
     "body": "Diminishers decide alone or with a small inner circle. Multipliers bring people together to debate the issue properly before a decision. People understand the decision and own it more."
    },
    {
     "emoji": "🌱",
     "title": "Investor, not Micromanager",
     "body": "Micromanagers jump in and take back control. Investors give real ownership and resources, teach when needed, and then hand the problem back. They hold people accountable for results."
    },
    {
     "emoji": "🙈",
     "title": "Watch for accidental diminishing",
     "body": "Many diminishers have good hearts. Being always 'on', rescuing people fast or having too many ideas can quietly shut others down. Sometimes the most helpful thing is to talk less and ask more."
    }
   ],
   "tryThis": [
    "In your next meeting, ask questions instead of giving your opinion first.",
    "Give one task fully to a teammate — and resist the urge to take it back.",
    "Ask someone, 'What do you think we should do?' and wait for the full answer."
   ],
   "forUs": "On a mission base, older or more experienced staff can easily become the 'answer people' without meaning to. In Khmer culture, younger staff may stay quiet out of respect, so leaders need to invite ideas on purpose — maybe in small groups or one-to-one rather than in front of everyone. Hand real responsibility to local staff and students and trust them to grow. Jesus did this with his disciples: he sent them out before they felt ready.",
   "oneLine": "Lead in a way that makes others smarter, braver and more capable — not more dependent on you."
  },
  {
   "id": "crucial-conversations",
   "title": "Crucial Conversations",
   "author": "Kerry Patterson, Joseph Grenny, Ron McMillan & Al Switzler",
   "year": 2002,
   "isbn": "9780071401944",
   "shelf": "people",
   "mins": 5,
   "vibe": "When it matters most, most of us do our worst talking. You can learn to do better.",
   "bigIdea": "A crucial conversation has high stakes, different opinions and strong emotions. Under that pressure, we usually go silent or get aggressive. The authors teach how to keep honest dialogue going, so everyone's ideas and feelings can be shared safely. Better conversations lead to better decisions and stronger relationships.",
   "insights": [
    {
     "emoji": "🏊",
     "title": "Fill the 'pool of shared meaning'",
     "body": "Every person brings their own facts, feelings and opinions. Good dialogue puts all of it into a shared pool. The more that is in the pool, the better the decision. Silence or force keeps important information out."
    },
    {
     "emoji": "❤️",
     "title": "Start with heart",
     "body": "Before you speak, ask: What do I really want for myself, for the other person, and for our relationship? This stops you from just trying to win. Also reject the 'fool's choice' — the idea that you must pick between being honest and being kind."
    },
    {
     "emoji": "👀",
     "title": "Watch for safety",
     "body": "When people feel unsafe, they move to 'silence' (hiding, avoiding) or 'violence' (attacking, controlling). Notice the signs in them and in yourself. When safety drops, step out of the topic and rebuild it."
    },
    {
     "emoji": "🛡️",
     "title": "Make it safe",
     "body": "People need to feel you care about their goals (mutual purpose) and that you respect them (mutual respect). If you hurt someone, apologise. Use 'contrasting': explain what you don't mean, then what you do mean."
    },
    {
     "emoji": "📖",
     "title": "Master your stories",
     "body": "We see something, tell ourselves a story about it, feel an emotion, then act. Often our story casts us as the victim and them as the villain. Ask what a reasonable person would be thinking, and separate facts from your story."
    },
    {
     "emoji": "🧭",
     "title": "Speak honestly, listen deeply",
     "body": "Share facts first, then your view, tentatively, and invite others to disagree. When listening, ask questions, reflect their feelings and repeat back what you heard. Then agree who will do what by when, and follow up."
    }
   ],
   "tryThis": [
    "Before a hard talk, write down what you really want for you, them and the relationship.",
    "Next time you feel upset, separate the facts from the story you're telling yourself.",
    "Practise one contrasting sentence: 'I don't want ___. I do want ___.'"
   ],
   "forUs": "Across cultures, crucial conversations look different. Many Khmer staff prefer indirect, private conversations that protect face, while some international staff are very direct. Neither is wrong, but both can make the other feel unsafe. Choose the right setting, start with respect, and maybe use a trusted go-between when that fits. Silence can look like agreement when it isn't, so gently check understanding. Speaking the truth in love is exactly what this book is trying to teach.",
   "oneLine": "Make it safe, check your story, and keep talking honestly when it matters most."
  },
  {
   "id": "the-ideal-team-player",
   "title": "The Ideal Team Player",
   "author": "Patrick Lencioni",
   "year": 2016,
   "isbn": "9781119209591",
   "shelf": "people",
   "mins": 5,
   "vibe": "Great teammates are humble, hungry and people smart — all three at once.",
   "bigIdea": "Lencioni tells a story about a new leader at a construction company who needs to fix a struggling team. Along the way, the leaders discover what makes someone a great team player. The answer is three simple virtues: humble, hungry and smart (meaning people smart). When someone has all three, teamwork becomes much easier.",
   "insights": [
    {
     "emoji": "🙇",
     "title": "Humble",
     "body": "Humble team players care more about the team than their own image. They share credit and praise others easily. Lencioni warns about two problems: arrogance, and also false humility, where people put themselves down so much they don't contribute."
    },
    {
     "emoji": "🔥",
     "title": "Hungry",
     "body": "Hungry people are self-motivated. They work hard, take initiative and look for more to do. They don't need to be pushed. But healthy hunger is for the team's mission, not just for personal success."
    },
    {
     "emoji": "🧠",
     "title": "People smart",
     "body": "This is not about IQ. It is common sense about people. People-smart team players read a room well, listen, and understand how their words affect others. They know how to handle conversations wisely."
    },
    {
     "emoji": "⚠️",
     "title": "Missing one virtue is a problem",
     "body": "Humble and hungry without people smarts can be an 'accidental mess-maker'. Humble and smart without hunger can be a 'lovable slacker'. Hungry and smart without humility can be a 'skillful politician' — the most dangerous, because they look great."
    },
    {
     "emoji": "🔎",
     "title": "Hire for the three virtues",
     "body": "In interviews, ask about teamwork, not just skills. Ask what others would say about them. Spend informal time together and watch how they treat everyone, not just the boss."
    },
    {
     "emoji": "🌱",
     "title": "Everyone can grow",
     "body": "These virtues are not fixed personality traits. They can be learned with honest feedback and coaching. Leaders should help people see their weaker virtue and grow in it, and model all three themselves."
    }
   ],
   "tryThis": [
    "Rate yourself from 1 to 3 on humble, hungry and smart. Which is your weakest?",
    "Ask a trusted teammate which of the three virtues they see most and least in you.",
    "Do one practical thing this week to grow your weakest virtue."
   ],
   "forUs": "Humility is already a core value in YWAM and in Khmer culture, which is a great start. But humility without hunger can turn into waiting to be told, and hunger without people smarts can feel pushy across cultures. People smarts also means learning what respect looks like for someone from a different background. Use these three words when choosing staff, building outreach teams and coaching DTS students. Jesus showed all three: he served humbly, worked with purpose and understood people deeply.",
   "oneLine": "Look for — and become — someone who is humble, hungry and people smart."
  },
  {
   "id": "atomic-habits",
   "title": "Atomic Habits",
   "author": "James Clear",
   "year": 2018,
   "isbn": "9780735211292",
   "shelf": "habits",
   "mins": 5,
   "vibe": "Tiny changes, wild results. You don't rise to your goals — you fall to your systems.",
   "bigIdea": "Goals are nice, but systems are what actually move you. Get 1% better at something every day and the gains compound into something huge. Habits are the compound interest of your life — in both directions.",
   "insights": [
    {
     "emoji": "📈",
     "title": "1% better is a big deal",
     "body": "Improving by just 1% a day doesn't feel like much on Tuesday. Keep it up for a year and you're dramatically better. The catch: results lag behind effort. There's a 'valley of disappointment' where you're doing the work and seeing nothing — that's normal. Keep going."
    },
    {
     "emoji": "🧱",
     "title": "Fix the system, not the goal",
     "body": "Winners and losers often have the same goal. The difference is the system — the daily process. Fall in love with the process and the results take care of themselves."
    },
    {
     "emoji": "🪪",
     "title": "Become the kind of person who…",
     "body": "The deepest habits are about identity. Instead of 'I want to read more', try 'I'm a reader'. Every time you do the habit, you cast a vote for who you're becoming."
    },
    {
     "emoji": "🔁",
     "title": "The four laws",
     "body": "To build a habit: make it obvious, make it attractive, make it easy, make it satisfying. To break one, flip them: make it invisible, unattractive, difficult and unsatisfying."
    },
    {
     "emoji": "⏱️",
     "title": "The two-minute rule",
     "body": "Shrink any new habit until it takes two minutes. 'Read the Bible every day' becomes 'open my Bible and read one verse'. Master showing up first; the rest grows from there."
    },
    {
     "emoji": "🧲",
     "title": "Stack it and shape your space",
     "body": "Attach a new habit to one you already do: 'After I pour my morning coffee, I'll pray for one person.' And design your environment so the good choice is the easy one."
    }
   ],
   "tryThis": [
    "Pick one habit and shrink it to a two-minute version you can do today.",
    "Write one habit stack: 'After I ___, I will ___.'",
    "Never miss twice — if you skip a day, make the next day non-negotiable."
   ],
   "forUs": "On a mission base, life is full of rhythms — chores, cooking, worship, outreach. Use them as anchors: stack prayer, language practice or a quick check-in with your team onto something you already do every day. The Habit Tracker in this app is built for exactly this.",
   "oneLine": "Small habits + a good system + time = massive change."
  },
  {
   "id": "decisive",
   "title": "Decisive",
   "author": "Chip Heath & Dan Heath",
   "year": 2013,
   "isbn": "9780307956392",
   "shelf": "habits",
   "mins": 5,
   "vibe": "Your gut is not a decision process. Here is a better one in four steps.",
   "bigIdea": "Our brains make the same mistakes again and again when we decide: we see too few options, we look only for proof we are right, we let short-term feelings take over, and we feel too sure about the future. The Heath brothers give a simple four-step process called WRAP to beat these traps. It will not make every choice perfect, but it makes good choices much more likely.",
   "insights": [
    {
     "emoji": "🧠",
     "title": "The four villains",
     "body": "Bad decisions usually come from four traps. Narrow framing: seeing only one or two options. Confirmation bias: looking only for information that agrees with you. Short-term emotion: feelings in the moment pushing you around. Overconfidence: being too sure about how the future will go."
    },
    {
     "emoji": "🔭",
     "title": "W — Widen your options",
     "body": "Watch out for 'whether or not' choices, like 'Should I do this or not?' That is often a sign you see too few options. Try this: imagine your current options suddenly disappear. What would you do then? Often a better third option appears. You can also try more than one option at the same time."
    },
    {
     "emoji": "🧪",
     "title": "R — Reality-test your assumptions",
     "body": "Ask: what would have to be true for this option to be the best one? Then go and check. Look for people who disagree with you, and ask questions that invite honest bad news. Where you can, run a small, cheap test first. The authors call this 'ooching': trying a little before you commit a lot."
    },
    {
     "emoji": "🏔️",
     "title": "A — Attain distance before deciding",
     "body": "Strong feelings make the short term look huge. One tool is 10/10/10: how will I feel about this in 10 minutes, 10 months and 10 years? Another: what would I tell my best friend to do? Distance helps you see what really matters. Then decide using your core priorities, not your mood."
    },
    {
     "emoji": "🛟",
     "title": "P — Prepare to be wrong",
     "body": "The future is uncertain, so plan for a range of outcomes, from very good to very bad. Imagine it is a year later and the plan failed. Why did it fail? This helps you find problems early. Set 'tripwires': clear signals or dates that tell you it is time to stop and decide again."
    },
    {
     "emoji": "⚖️",
     "title": "Fair process matters",
     "body": "When a decision affects a group, how you decide matters as much as what you decide. People accept hard choices more easily when they feel heard and the process was fair."
    }
   ],
   "tryThis": [
    "For one decision this week, write down at least three real options before you choose.",
    "Do a 10/10/10 check on something you feel strongly about right now.",
    "Before a big plan starts, ask your team: 'Imagine this failed. What went wrong?'"
   ],
   "forUs": "On a base we make big choices all the time: where to send an outreach team, who to invite onto staff, whether to start a new ministry. Pray first, and then use WRAP as a way to listen well: widen the options, test them with small steps, ask both Khmer and international staff for honest views, and agree on a check-in date in case you need to change course. Wisdom and good process work together.",
   "oneLine": "Widen your options, test your ideas, get some distance, and plan for being wrong."
  },
  {
   "id": "drive",
   "title": "Drive",
   "author": "Daniel H. Pink",
   "year": 2009,
   "isbn": "9781594484803",
   "shelf": "habits",
   "mins": 5,
   "vibe": "Rewards and punishments are old tech. People run on something deeper.",
   "bigIdea": "Many organisations still motivate people with 'do this, get that' rewards and punishments. Pink shows research that this works for simple, routine work but often fails for creative, thinking work. What really drives people over time is inside them: autonomy, mastery and purpose.",
   "insights": [
    {
     "emoji": "💻",
     "title": "Motivation 1.0, 2.0, 3.0",
     "body": "Pink compares motivation to a computer operating system. 1.0 was about survival. 2.0 is carrots and sticks: rewards and punishments. 3.0 is intrinsic motivation, which means doing something because the work itself matters to you. He argues our world now needs 3.0."
    },
    {
     "emoji": "🥕",
     "title": "When rewards backfire",
     "body": "For simple tasks with clear steps, rewards can help. But for creative problems, 'if you do this, then you get that' rewards can make people narrower and less creative. They can also kill the joy of the work and encourage shortcuts. A better option is an unexpected 'now that you did this' thank-you, given after the work."
    },
    {
     "emoji": "💵",
     "title": "First, pay people fairly",
     "body": "Pink is clear: money still matters. If people feel underpaid or treated unfairly, they will not be motivated. The goal is to make pay fair enough that people stop thinking about it, so they can focus on the work."
    },
    {
     "emoji": "🕊️",
     "title": "Autonomy",
     "body": "People want to direct their own lives. Pink names four areas of freedom: task (what I do), time (when I do it), technique (how I do it) and team (who I do it with). Even a little freedom in these areas can raise energy and ownership."
    },
    {
     "emoji": "🎯",
     "title": "Mastery",
     "body": "We want to get better at something that matters. Mastery needs a growth mindset, it takes hard and sometimes painful effort, and you never fully arrive, which is part of the joy. Tasks that are not too easy and not too hard help people get into 'flow'."
    },
    {
     "emoji": "🌍",
     "title": "Purpose",
     "body": "The most motivated people connect their work to something bigger than themselves. Purpose is not a nice extra. When people know why their work matters, they care more and keep going longer."
    },
    {
     "emoji": "🅧",
     "title": "Type X and Type I",
     "body": "Pink describes two kinds of behaviour. Type X is driven mostly by outside rewards. Type I is driven mostly by inner satisfaction. Type I is not something you are born with. Anyone can grow toward it."
    }
   ],
   "tryThis": [
    "Ask one person on your team: 'Where would you like more freedom in how you do your work?'",
    "Pick one skill you want to master and spend 20 focused minutes on it today.",
    "Before a task, say out loud who it helps and why it matters."
   ],
   "forUs": "Most of us on a mission base are not here for the money, so purpose is already strong. Leaders can build on it: give staff real ownership of their area, help Khmer and international team members grow real skills, and keep connecting daily tasks like cooking, cleaning and admin to the bigger story of what God is doing. A sincere 'thank you, that made a difference' often means more than any reward.",
   "oneLine": "Pay people fairly, then give them freedom, room to grow and a reason that matters."
  },
  {
   "id": "getting-things-done",
   "title": "Getting Things Done",
   "author": "David Allen",
   "year": 2001,
   "isbn": "9780143126560",
   "shelf": "habits",
   "mins": 5,
   "vibe": "Your brain is for having ideas, not for holding them.",
   "bigIdea": "Stress often comes from all the unfinished things we try to remember in our heads. David Allen's system says: get everything out of your head into a trusted place, decide the very next physical step for each thing, and review it regularly. When your mind is clear, you can focus fully on what you are doing now.",
   "insights": [
    {
     "emoji": "🌀",
     "title": "Open loops drain you",
     "body": "Every unfinished promise, task or idea is an 'open loop'. Your mind keeps reminding you about it, often at the wrong time. This creates low-level stress all day. The fix is not to remember better. It is to write things down in a place you trust."
    },
    {
     "emoji": "🧺",
     "title": "Five steps",
     "body": "The system has five steps. Capture: collect everything that has your attention. Clarify: decide what each thing is and what to do with it. Organise: put it in the right list. Reflect: review your lists often. Engage: choose what to do now and do it."
    },
    {
     "emoji": "👣",
     "title": "What is the next action?",
     "body": "'Plan the outreach' is not something you can do. 'Email Sokha to ask about dates' is. For every item, decide the next visible, physical action. This one question turns fuzzy worry into clear movement."
    },
    {
     "emoji": "⏱️",
     "title": "The two-minute rule",
     "body": "When you clarify an item, if it takes less than two minutes, do it now. Tracking it would take longer than finishing it. Anything longer gets put on a list or handed to someone else."
    },
    {
     "emoji": "🗂️",
     "title": "Projects and lists",
     "body": "In this system, a 'project' is any result that needs more than one action. Keep a list of projects, a list of next actions (often grouped by place or tool, like 'phone' or 'computer'), a 'waiting for' list, and a 'someday/maybe' list. Your calendar is only for things that must happen on a certain day or time."
    },
    {
     "emoji": "🔄",
     "title": "The weekly review",
     "body": "Once a week, empty your inboxes, look over every list, and update your projects. Allen sees this as the key habit that keeps the whole system working. Without it, you stop trusting your lists and things go back into your head."
    },
    {
     "emoji": "💧",
     "title": "Mind like water",
     "body": "Allen uses the picture of calm water: it responds to a stone with exactly the right size of splash and then becomes still again. With a clear system, you can respond to each new thing calmly instead of feeling flooded."
    }
   ],
   "tryThis": [
    "Do a 'mind sweep': spend 15 minutes writing down every task and worry in your head.",
    "For your top three items, write the very next physical action.",
    "Put a 30-minute weekly review in your calendar and protect it."
   ],
   "forUs": "Base life is full of interruptions: a visitor at the gate, a student who needs to talk, a broken water pump, a message from a supporter. A simple capture habit means you can say 'yes, I will get to that' and really mean it. Leaders who run a weekly review stop dropping balls, and their teams learn they can trust them.",
   "oneLine": "Get it all out of your head, decide the next action, and review it every week."
  },
  {
   "id": "grit",
   "title": "Grit",
   "author": "Angela Duckworth",
   "year": 2016,
   "isbn": "9781501111105",
   "shelf": "habits",
   "mins": 5,
   "vibe": "Talent is nice. Staying with it for years is what makes the difference.",
   "bigIdea": "Psychologist Angela Duckworth studied high achievers, from military cadets to spelling bee champions. She found that talent alone did not predict who succeeded. What mattered more was grit: passion and perseverance for long-term goals. Good news: grit can grow.",
   "insights": [
    {
     "emoji": "🏃",
     "title": "Grit beats talent alone",
     "body": "In Duckworth's research, grit often predicted who kept going better than talent or test scores did. For example, it helped predict which new cadets at West Point would finish a very hard first summer. People with natural gifts still have to keep showing up."
    },
    {
     "emoji": "✖️",
     "title": "Effort counts twice",
     "body": "Duckworth offers a simple idea. Talent times effort gives you skill. Skill times effort gives you achievement. So effort appears twice. Without effort, talent stays as potential only."
    },
    {
     "emoji": "🧭",
     "title": "One top goal",
     "body": "Gritty people have many small goals that all point toward one big, top-level goal. Small goals can change when they are not working. The top goal stays steady. This gives direction to daily work."
    },
    {
     "emoji": "❤️",
     "title": "Interest comes first",
     "body": "Passion usually does not arrive in one big moment. It starts with interest, then grows as you learn more and go deeper. You often need to try things before you find what you love."
    },
    {
     "emoji": "🏋️",
     "title": "Practise the hard way",
     "body": "Grit grows through deliberate practice: setting a specific stretch goal, focusing fully, getting quick feedback, and repeating. This kind of practice is often not fun in the moment, but it builds real skill."
    },
    {
     "emoji": "🌱",
     "title": "Purpose and hope",
     "body": "Over time, gritty people connect their work to the good of others. They also have hope: the belief that their own effort can make things better. When they fall, they expect to get up again."
    },
    {
     "emoji": "🏡",
     "title": "Grow it together",
     "body": "Grit is shaped by the people around us. Duckworth recommends being both warm and demanding: high support plus high expectations. In her family, everyone chooses one hard thing to do and does not quit until a natural stopping point."
    }
   ],
   "tryThis": [
    "Write your top-level goal in one sentence, then list three smaller goals that serve it.",
    "Choose one 'hard thing' and commit to it until a clear stopping point, like the end of the term.",
    "Practise one skill for 20 minutes with a specific stretch goal and ask someone for feedback."
   ],
   "forUs": "Long-term missions need grit: learning Khmer, raising support, and serving through hot seasons and slow results. Remember why you came, and keep your 'top goal' clear even when small plans change. As leaders, be warm and demanding at the same time, cheering people on while believing they can do hard things.",
   "oneLine": "Long-term passion and steady effort matter more than talent alone, and both can grow."
  },
  {
   "id": "mindset",
   "title": "Mindset",
   "author": "Carol S. Dweck",
   "year": 2006,
   "isbn": "9780345472328",
   "shelf": "habits",
   "mins": 5,
   "vibe": "Are you trying to prove yourself, or trying to grow?",
   "bigIdea": "Carol Dweck found that people hold one of two basic beliefs about their abilities. With a fixed mindset, you believe ability is set and cannot change much. With a growth mindset, you believe ability can grow through effort, good strategies and help from others. That one belief shapes how you handle challenge, failure and feedback.",
   "insights": [
    {
     "emoji": "🧱",
     "title": "The fixed mindset",
     "body": "If you believe your ability is fixed, every task becomes a test of who you are. So you avoid challenges, hide mistakes and feel threatened by other people's success. Failure feels like a label: 'I am a failure.'"
    },
    {
     "emoji": "🌱",
     "title": "The growth mindset",
     "body": "If you believe ability can grow, challenges look like chances to learn. Effort is the path to skill, not a sign that you are weak. Failure is painful, but it becomes information: 'What can I learn from this?'"
    },
    {
     "emoji": "👏",
     "title": "Praise the process",
     "body": "In Dweck's studies, children praised for being smart often chose easier tasks afterwards, to keep looking smart. Children praised for their effort and strategies were more willing to take on hard problems. Praise what people do, not what they 'are'."
    },
    {
     "emoji": "💬",
     "title": "Feedback is a gift",
     "body": "In a fixed mindset, criticism feels like an attack. In a growth mindset, it is useful information. Learning to welcome feedback is one of the clearest signs of growth."
    },
    {
     "emoji": "👔",
     "title": "Leaders and teams",
     "body": "Dweck shows that fixed-mindset leaders often need to be the smartest person in the room and may surround themselves with people who agree. Growth-mindset leaders focus on learning and on developing their people. Their teams tend to be more honest and creative."
    },
    {
     "emoji": "❤️",
     "title": "Relationships too",
     "body": "Mindset affects friendships and marriages. A fixed mindset can believe that if a relationship is 'right', it should be easy. A growth mindset accepts that good relationships take work, honest talk and growing together."
    },
    {
     "emoji": "🔀",
     "title": "Everyone is a mix",
     "body": "Nobody has a pure growth mindset. We all have areas and situations that trigger fixed thinking. The goal is to notice those moments and choose a growth response, not to pretend you are always growth-minded."
    }
   ],
   "tryThis": [
    "When you think 'I'm just not good at this', add the word 'yet'.",
    "Praise one person this week for their effort or strategy, not their talent.",
    "After a mistake, write down one specific thing you learned from it."
   ],
   "forUs": "Mission life puts us in new places all the time: a new language, a new culture, a new role. A growth mindset lets a Khmer staff member try leading worship in English, or a new missionary try speaking Khmer, without fear of looking foolish. Leaders can build a culture where mistakes are treated as learning, and where everyone is believed in.",
   "oneLine": "Believe your abilities can grow, and challenges and mistakes become ways to learn."
  },
  {
   "id": "rich-dad-poor-dad",
   "title": "Rich Dad Poor Dad",
   "author": "Robert T. Kiyosaki",
   "year": 1997,
   "isbn": "9781612680194",
   "shelf": "habits",
   "mins": 5,
   "vibe": "School taught you to work for money. Nobody taught you how money works.",
   "bigIdea": "Kiyosaki tells the story of two father figures: his own well-educated dad, who struggled with money, and his best friend's dad, a business owner who became wealthy. The main lesson is that understanding money, especially the difference between assets and liabilities, matters more than how much you earn. Some of his specific advice is debated, but the basic ideas about financial understanding are still useful.",
   "insights": [
    {
     "emoji": "👨‍👦",
     "title": "Two dads, two ways of thinking",
     "body": "The 'poor dad' believed in good grades, a safe job and a steady salary. The 'rich dad' believed in learning how money works and building things that earn money. The book uses these two voices to show how our beliefs about money shape our choices."
    },
    {
     "emoji": "📊",
     "title": "Assets vs liabilities",
     "body": "This is the core idea. Kiyosaki defines an asset as something that puts money into your pocket, and a liability as something that takes money out. Many people buy liabilities and call them assets. His advice: build your list of assets first."
    },
    {
     "emoji": "🐀",
     "title": "The rat race",
     "body": "Many people earn more and then simply spend more. They get a raise, buy a bigger house or car, and have more bills. Kiyosaki calls this cycle the 'rat race'. Earning more does not help if spending always grows with it."
    },
    {
     "emoji": "📚",
     "title": "Learn financial basics",
     "body": "Kiyosaki says schools rarely teach money skills. He wants readers to understand basic things like income, expenses, cash flow and simple accounting. You do not need to be an expert, but you do need to understand your own numbers."
    },
    {
     "emoji": "🛠️",
     "title": "Work to learn",
     "body": "He encourages people, especially young people, to choose work for the skills it teaches, not only for the pay. He highlights skills like selling, communicating and managing people as very valuable."
    },
    {
     "emoji": "😨",
     "title": "Fear and feelings",
     "body": "Kiyosaki argues that fear and desire often control money choices. Fear of not having enough keeps people stuck, and desire makes them spend. Noticing these feelings helps you choose more wisely."
    },
    {
     "emoji": "⚠️",
     "title": "Read with care",
     "body": "Some readers and financial experts question parts of the book, for example the claim that your own home is not an asset, or its encouragement of risky investing. Take the big ideas, like understanding cash flow and spending less than you earn, and be careful with the rest."
    }
   ],
   "tryThis": [
    "List what you own and what you owe. Mark each item as 'puts money in' or 'takes money out'.",
    "Track every dollar or riel you spend for one week.",
    "Set aside a small amount from every gift or payment before you spend anything else."
   ],
   "forUs": "Most of us live on support-raised budgets, so we are not chasing wealth, and that is fine. But money wisdom still matters: knowing your cash flow, avoiding debt, and saving a little help you stay on the field longer and lead with less stress. Being faithful with what God provides, a little or a lot, is part of good stewardship.",
   "oneLine": "Understand where your money comes from and where it goes, and grow things that put money in, not take it out."
  },
  {
   "id": "think-like-a-freak",
   "title": "Think Like a Freak",
   "author": "Steven D. Levitt & Stephen J. Dubner",
   "year": 2014,
   "isbn": "9780062218339",
   "shelf": "habits",
   "mins": 5,
   "vibe": "Ask simpler questions, admit what you don't know, and be brave enough to quit.",
   "bigIdea": "The authors of Freakonomics share how they approach problems. They think with data, curiosity and a bit of playfulness instead of following the crowd. The tools are simple: admit what you do not know, ask a better question, look at incentives, and know when to quit.",
   "insights": [
    {
     "emoji": "🤷",
     "title": "Say 'I don't know'",
     "body": "People often pretend to know things to look smart, and that leads to bad decisions. The authors say that admitting 'I don't know' is the first step to finding out. Then you can test and collect real information."
    },
    {
     "emoji": "❓",
     "title": "Change the question",
     "body": "How you frame a problem decides which answers you can see. The book tells about a competitive eater, Takeru Kobayashi, who stopped asking 'How can I eat more hot dogs?' and asked 'How can I make hot dogs easier to eat?' That new question led to new methods and a big win."
    },
    {
     "emoji": "🧒",
     "title": "Think like a child",
     "body": "Children ask simple, obvious questions and are not afraid to look silly. The authors encourage this. Small, simple questions are often easier to answer and can lead to big results."
    },
    {
     "emoji": "🎁",
     "title": "Incentives are everything",
     "body": "To understand people, look at their incentives. These can be about money, but also about what others think of them and what they feel is right. Find out what people really care about, which is often different from what they say."
    },
    {
     "emoji": "🍬",
     "title": "Let people sort themselves",
     "body": "Sometimes you can design a situation so that people show who they are by their own choices. The book tells how the band Van Halen put a rule in their contract: no brown candies backstage. If they found brown candies, they knew the venue had not read the contract carefully, so they checked the safety details again."
    },
    {
     "emoji": "🗣️",
     "title": "Persuading people",
     "body": "Facts alone rarely change minds. The authors suggest being honest about the weak points of your own argument, not insulting the other side, and using stories, which people remember better than numbers."
    },
    {
     "emoji": "🚪",
     "title": "The upside of quitting",
     "body": "We often keep going because of what we already spent (sunk cost) and forget what else we could do with our time (opportunity cost). Quitting a project that is not working can free you for something better. Failing early and cheaply is a kind of success."
    }
   ],
   "tryThis": [
    "Next time you are stuck, rewrite your problem as a smaller, simpler question.",
    "Say 'I don't know, let's find out' at least once this week.",
    "Look at one ongoing activity and ask: 'If we were not already doing this, would we start it today?'"
   ],
   "forUs": "On a base it is easy to keep doing things 'because we always have'. Ask fresh questions: why are fewer people coming to this event, and what do our students and local friends really value? Be humble enough to say 'I don't know', test small ideas, and give yourself permission to stop a ministry activity that is no longer bearing fruit, so energy can go where God is moving.",
   "oneLine": "Admit what you don't know, ask simpler questions, follow the incentives, and don't fear quitting."
  },
  {
   "id": "lead-like-jesus",
   "title": "Lead Like Jesus",
   "author": "Ken Blanchard & Phil Hodges",
   "year": 2005,
   "shelf": "habits",
   "mins": 5,
   "vibe": "The best leadership model ever? He washed feet.",
   "bigIdea": "Ken Blanchard and Phil Hodges say Jesus is the greatest model of leadership we have. For them, leadership is any time you try to influence what other people think or do, so everyone leads somewhere. Leading like Jesus means serving, not being served. The book looks at four parts of a leader: the heart, the head, the hands and the habits. If the heart is wrong, the rest will not stay right for long.",
   "insights": [
    {
     "emoji": "❤️",
     "title": "The heart: why do you lead?",
     "body": "The first question is about motivation. Am I leading to serve others, or to serve myself? The authors say the big enemy is our ego. They turn EGO into a phrase: 'Edging God Out'. The answer is a different EGO: 'Exalting God Only'."
    },
    {
     "emoji": "😨",
     "title": "Pride and fear",
     "body": "Ego usually shows up in two ways. Pride makes us think too highly of ourselves, so we want credit and control. Fear makes us protect ourselves, so we avoid hard talks and hold on to power. Both put me at the center instead of God and the people I serve."
    },
    {
     "emoji": "🧭",
     "title": "The head: a clear vision",
     "body": "Jesus knew his purpose and taught a clear picture of the future and clear values. A servant leader also gives direction: where are we going and why? First you set the vision, then you serve people as they work toward it."
    },
    {
     "emoji": "🙌",
     "title": "The hands: a coach, not a boss",
     "body": "Jesus took ordinary disciples and grew them step by step, from beginners to people who could lead and teach others. Good leaders do the same. Give a beginner clear direction and lots of support. As people grow, give them more freedom. The goal is to send them out, not to keep them dependent on you."
    },
    {
     "emoji": "🙏",
     "title": "The habits: stay filled up",
     "body": "You cannot serve well for long if you are empty. The book points to habits Jesus lived: time alone with God, prayer, learning and living out Scripture, resting in God's unconditional love, and close friends who keep you honest. These habits keep your heart in the right place."
    },
    {
     "emoji": "🧼",
     "title": "Serving is the point",
     "body": "Jesus washed his disciples' feet and said the greatest is the one who serves. In this model, success is not how big your title is. It is whether the people you lead grow and the mission moves forward."
    }
   ],
   "tryThis": [
    "Before a meeting or task you lead this week, ask: am I doing this to serve or to look good?",
    "Notice one moment of pride or fear in yourself and name it honestly to God.",
    "Pick one person you lead and ask: what do you need from me to grow right now?"
   ],
   "forUs": "On a YWAM base almost everyone leads something: a DTS small group, a kitchen team, an outreach team, a ministry. Try to notice ego in small places, like wanting your idea chosen or avoiding a hard talk with a teammate. Coach new staff step by step, and give Khmer leaders real responsibility, not just tasks. And guard your time with God, because a busy base can make even good leaders run on empty.",
   "oneLine": "Lead from a heart that serves, with a clear vision, patient coaching and daily time with God."
  },
  {
   "id": "the-4-hour-workweek",
   "title": "The 4-Hour Workweek",
   "author": "Tim Ferriss",
   "year": 2007,
   "isbn": "9780307465351",
   "shelf": "habits",
   "mins": 5,
   "vibe": "Do less of what doesn't matter, so you have more life for what does.",
   "bigIdea": "Tim Ferriss argues that many people waste their best years working long hours for a future they may never enjoy. He offers a four-step plan called DEAL: Definition, Elimination, Automation and Liberation. His goal is a business that runs with little effort, so you can travel and live freely now, not only at retirement. Not all of this fits missionary life, but his tools for cutting busywork and protecting rest are very useful.",
   "insights": [
    {
     "emoji": "🎯",
     "title": "D — Define what you really want",
     "body": "Ferriss suggests 'fear-setting': write down the worst that could happen if you make a change, how you could fix it, and what it costs you to do nothing. Fear often shrinks when you look at it clearly."
    },
    {
     "emoji": "✂️",
     "title": "E — Eliminate with the 80/20 rule",
     "body": "Often about 80% of results come from about 20% of your activities. Find that 20% and do more of it. Find the tasks that bring little value and stop doing them."
    },
    {
     "emoji": "⏳",
     "title": "Work expands to fill the time",
     "body": "This is 'Parkinson's Law'. If you give a task a whole day, it takes a whole day. Give it a short, clear deadline and you often finish faster and focus better."
    },
    {
     "emoji": "📥",
     "title": "Batch and guard your attention",
     "body": "Checking messages all day breaks your focus again and again. Ferriss checks email at set times only and groups similar tasks together. He also suggests a 'low-information diet': stop taking in news and noise that you will not act on."
    },
    {
     "emoji": "🤝",
     "title": "Automate and delegate",
     "body": "Ferriss hands repeat tasks to assistants and systems. A smaller version works for anyone: write simple steps for a task once, then let someone else do it. Train people instead of becoming the bottleneck."
    },
    {
     "emoji": "🌴",
     "title": "L — Mini-retirements",
     "body": "Instead of saving all rest for old age, Ferriss suggests longer breaks spread across life. He calls them 'mini-retirements'. The heart of this is good: rest and renewal are not a reward at the end, they are part of a healthy life now."
    },
    {
     "emoji": "⚖️",
     "title": "Where we see it differently",
     "body": "The book is built around building automated income and escaping work you dislike. Missionaries on raised support are not trying to earn more with less effort. Our work is relational and comes from a calling, and people are never tasks to outsource. Take the tools, not the whole goal."
    }
   ],
   "tryThis": [
    "List your weekly tasks and circle the 20% that bring most of the good fruit.",
    "Check messages at two or three set times a day for one week.",
    "Write simple step-by-step notes for one task you always do, so someone else could do it."
   ],
   "forUs": "Base life is full of meetings, messages and small jobs that can crowd out the things only you can do: discipling, praying, preparing teaching, being present with people. Use the 80/20 question with your team: which activities really bear fruit? Batch admin, write down simple processes so new Khmer and international staff can step in, and plan real rest between schools and outreaches. Sabbath was God's idea long before mini-retirements. Our aim is not a four-hour week. It is to be faithful and fruitful without burning out.",
   "oneLine": "Cut the busywork, focus on what bears fruit, and build real rest into life now."
  },
  {
   "id": "the-7-habits-of-highly-effective-people",
   "title": "The 7 Habits of Highly Effective People",
   "author": "Stephen R. Covey",
   "year": 1989,
   "isbn": "9780743269513",
   "shelf": "habits",
   "mins": 5,
   "vibe": "Character first, tips second. Change starts on the inside.",
   "bigIdea": "Stephen Covey says real effectiveness comes from character and lasting principles, not quick tricks to look good. He calls this working from the 'inside out'. His seven habits move us from dependence (you take care of me) to independence (I take care of myself) and then to interdependence (we can do more together). The first three habits are about leading yourself. The next three are about working well with others. The last one keeps you renewed.",
   "insights": [
    {
     "emoji": "🔑",
     "title": "Habit 1: Be proactive",
     "body": "Between what happens to you and how you respond, you have a choice. Proactive people focus on their 'circle of influence', the things they can actually change. Reactive people focus on their 'circle of concern', the things they worry about but cannot change, and they feel more and more powerless."
    },
    {
     "emoji": "🗺️",
     "title": "Habit 2: Begin with the end in mind",
     "body": "Picture the end of your life. What would you want people to say about you? Let that shape today. Covey suggests writing a personal mission statement based on your values and roles, so you live on purpose and not by accident."
    },
    {
     "emoji": "📅",
     "title": "Habit 3: Put first things first",
     "body": "Covey sorts tasks by urgent and important. Many of us live in urgent things: crises, interruptions, noise. The secret is the important but not urgent area: planning, relationships, prevention, growth. Plan your week around your roles and your big rocks first."
    },
    {
     "emoji": "🤝",
     "title": "Habit 4: Think win-win",
     "body": "Life is not a competition where someone has to lose. Look for solutions that are good for both sides. This needs good character and trust. Covey's 'emotional bank account' helps here: kindness, keeping promises and saying sorry make deposits that build trust."
    },
    {
     "emoji": "👂",
     "title": "Habit 5: Seek first to understand",
     "body": "Most of us listen while planning our answer. Covey asks for empathic listening: listen until you really understand the other person's feelings and point of view. Then share your own view clearly. People are more open to you when they feel understood."
    },
    {
     "emoji": "🧩",
     "title": "Habit 6: Synergize",
     "body": "When people with different views respect each other, they can find a third way that is better than either first idea."
    },
    {
     "emoji": "🪚",
     "title": "Habit 7: Sharpen the saw",
     "body": "A tired woodcutter with a dull saw works hard but gets little done. Take time to renew four areas: body, mind, heart and relationships, and spirit. This keeps the other habits alive."
    }
   ],
   "tryThis": [
    "Write down one worry and one thing in it that is inside your circle of influence. Act on that part.",
    "On Sunday, plan two important but not urgent things into your week.",
    "In one conversation, repeat back what the other person said before you give your opinion."
   ],
   "forUs": "A YWAM base is the definition of interdependence: Khmer and international staff from many cultures sharing a mission, a kitchen and a schedule. Habit 5 is gold here, because so many misunderstandings come from language and culture, not bad hearts. Make deposits in each other's emotional bank account, look for win-win when teams disagree, and value different cultural views as a way to find better solutions. Covey wrote for everyone, but much of this sounds like Jesus: serve, listen, keep your promises, and take time to be renewed by God.",
   "oneLine": "Lead yourself from the inside out, then work with others in trust, and keep renewing yourself."
  },
  {
   "id": "the-compound-effect",
   "title": "The Compound Effect",
   "author": "Darren Hardy",
   "year": 2010,
   "isbn": "9781593157241",
   "shelf": "habits",
   "mins": 5,
   "vibe": "No magic shortcut. Just small choices, done again and again, for a long time.",
   "bigIdea": "Darren Hardy says success is not about one big moment or a secret trick. It comes from small, smart choices repeated consistently over time. Each choice looks too small to matter, which is why it is easy to skip. But over months and years, small choices add up, like interest on money. This works in both directions: small bad habits also add up, slowly and quietly.",
   "insights": [
    {
     "emoji": "🪙",
     "title": "The magic penny",
     "body": "Hardy asks: would you take a lot of money today, or one penny that doubles every day for a month? The penny looks weak for weeks, then grows into far more by the end. Small, steady actions work the same way. The results come late, so most people quit too early."
    },
    {
     "emoji": "👬",
     "title": "Three friends, three paths",
     "body": "Hardy imagines three friends with similar lives. One changes nothing. One makes small good changes, like reading a little each day and eating a bit less. One makes small bad changes. After months nobody sees a difference. After a few years their lives look completely different."
    },
    {
     "emoji": "🙋",
     "title": "Take 100% responsibility",
     "body": "You cannot control everything that happens, but you can choose your response. Stop blaming luck or other people. Hardy also says to track your choices. Writing down what you actually do, like spending or eating, shows you the truth and makes change much easier."
    },
    {
     "emoji": "🔄",
     "title": "Build habits with a strong why",
     "body": "Willpower alone runs out. A strong reason, your 'why', keeps you going. Find the triggers for your bad habits and remove them, swap them for better habits, and start small. It helps to change habits with a friend."
    },
    {
     "emoji": "🎢",
     "title": "Momentum",
     "body": "Starting something new is hard, like pushing a heavy merry-go-round from stillness. Once it is moving, it takes much less effort to keep it going. Keep a regular rhythm, because stopping and starting again costs a lot of energy."
    },
    {
     "emoji": "🧲",
     "title": "Watch your influences",
     "body": "Three things shape you quietly: what you put into your mind, the people you spend time with, and your environment. Choose them on purpose. Then, to speed up growth, do a little more than expected at key moments."
    }
   ],
   "tryThis": [
    "Pick one small good choice and do it every day for seven days.",
    "Track one area, like phone time or spending, for a week without changing anything. Then look.",
    "Write down your 'why' for one goal and put it somewhere you will see it daily."
   ],
   "forUs": "Mission work rarely has quick wins. Language learning, discipleship, trust between Khmer and international staff, and fruit in a village all come from small faithful steps over years. This book is a good reminder that the daily things count: a few new Khmer words, a short time in the Word, a kind word to a teammate, showing up for intercession. Be patient in the slow middle, when nothing seems to change. God often works through small and steady faithfulness.",
   "oneLine": "Small, smart choices plus consistency plus time equals big change."
  },
  {
   "id": "the-power-of-habit",
   "title": "The Power of Habit",
   "author": "Charles Duhigg",
   "year": 2012,
   "isbn": "9780812981605",
   "shelf": "habits",
   "mins": 5,
   "vibe": "Your brain runs on autopilot. Learn how the autopilot works and you can reprogram it.",
   "bigIdea": "Charles Duhigg, a journalist, explains the science of habits in people, companies and whole communities. A large part of what we do each day is habit, not careful choice. Every habit follows a simple loop, and once you understand the loop you can change it. Habits are not destiny: they can be rebuilt.",
   "insights": [
    {
     "emoji": "🔁",
     "title": "The habit loop",
     "body": "Every habit has three parts. A cue triggers it, like a time, place or feeling. A routine is the behavior itself. A reward is what your brain gets at the end. Repeat the loop enough and it runs on its own, with little thinking."
    },
    {
     "emoji": "🤤",
     "title": "Craving is the engine",
     "body": "Habits get strong when your brain starts to expect the reward as soon as it sees the cue. That expectation is a craving. Duhigg shows how advertisers use this, for example with products that give a fresh, tingling feeling so people crave it and come back."
    },
    {
     "emoji": "🔧",
     "title": "The golden rule of change",
     "body": "You usually cannot just delete a bad habit. Instead keep the same cue and the same reward, but swap in a new routine. Bored at 3 pm and reaching for a snack? Maybe what you really want is a chat with a friend. Belief also matters: change often sticks when people believe they can change, and groups help that belief grow."
    },
    {
     "emoji": "🗝️",
     "title": "Keystone habits",
     "body": "Some habits start a chain reaction. Duhigg tells how Paul O'Neill turned around the company Alcoa by focusing on worker safety, which changed many other habits too. For individuals, things like regular exercise or eating together as a family can lift other parts of life."
    },
    {
     "emoji": "💪",
     "title": "Willpower can be trained",
     "body": "Willpower works like a muscle. It gets tired, but it can grow stronger. Duhigg describes how Starbucks trained staff with simple plans for hard moments, so they knew ahead of time how to respond to an angry customer. Plan your response before the hard moment comes."
    },
    {
     "emoji": "🏘️",
     "title": "Habits in groups and movements",
     "body": "Organizations have habits too, and a crisis can be a chance to change them. Movements grow through friendships, wider community ties, and new shared habits. Duhigg uses the Montgomery bus boycott and Saddleback Church as examples."
    }
   ],
   "tryThis": [
    "Pick one habit you want to change and write down its cue, routine and reward.",
    "Test what reward you really want by trying a different routine when the cue comes.",
    "Plan ahead for one hard moment: decide now what you will do when it comes."
   ],
   "forUs": "A base runs on shared habits: morning worship, intercession, meals, staff meetings, how we greet new students. Some help us and some just happen out of tradition. Ask your team which keystone habit could lift everything else, like a weekly team prayer time or eating lunch together across cultures. When you help a DTS student or teammate with a struggle, remember the golden rule: find the real need behind the habit, and walk with them in community. Lasting change often comes with faith and with friends.",
   "oneLine": "Find the cue and the reward, change the routine, and lasting change becomes possible."
  },
  {
   "id": "deep-work",
   "title": "Deep Work",
   "author": "Cal Newport",
   "year": 2016,
   "isbn": "9781455586691",
   "shelf": "create",
   "mins": 5,
   "vibe": "Focus is the new superpower. Most people have lost it. You can get it back.",
   "bigIdea": "Deep work is focused effort with no distractions, the kind that pushes your mind to its limit. It is becoming rare at the same time as it is becoming more valuable. Newport says if you train your focus, you will produce better work and find more meaning in it.",
   "insights": [
    {
     "emoji": "🌊",
     "title": "Deep vs shallow work",
     "body": "Deep work is hard, focused thinking that creates real value. Shallow work is easy, low-focus tasks like emails, quick messages and admin. Shallow work fills the day and feels busy. But it rarely creates something new."
    },
    {
     "emoji": "💎",
     "title": "Rare and valuable",
     "body": "Newport's main claim: the ability to focus deeply is getting rarer, and also more valuable. People who can learn hard things fast and produce high-quality work will do well. Both of those need deep focus."
    },
    {
     "emoji": "🧠",
     "title": "Attention residue",
     "body": "When you switch from one task to another, part of your mind stays on the first task. Newport calls this attention residue. Checking your phone 'just for a second' leaves you thinking less clearly for a while after."
    },
    {
     "emoji": "🗓️",
     "title": "Pick your focus style",
     "body": "Newport describes four ways to make time for deep work. Monastic: cut out almost all distractions. Bimodal: give whole days or weeks to deep work. Rhythmic: do it at the same time every day. Journalistic: fit it in whenever a gap appears. Most people do best with the rhythmic style."
    },
    {
     "emoji": "😴",
     "title": "Get comfortable with boredom",
     "body": "If you reach for your phone every time you are bored, your brain forgets how to focus. Practise waiting in line or walking with no screen. Newport also suggests planning set times for the internet, instead of set times away from it."
    },
    {
     "emoji": "📵",
     "title": "Choose your tools on purpose",
     "body": "Do not keep an app just because it has some small benefit. Ask: does this tool help my most important goals much more than it hurts them? If not, let it go. Newport suggests trying 30 days without a platform and seeing if anyone notices."
    },
    {
     "emoji": "🔚",
     "title": "End the day properly",
     "body": "Plan every hour of your work day, then change the plan when needed. At the end of the day, use a simple shutdown routine: check your tasks, write tomorrow's plan, then stop. Rest is not lazy. It refills your ability to focus."
    }
   ],
   "tryThis": [
    "Block 90 minutes this week for one important task. Phone in another room, door closed.",
    "Next time you wait in line, do not touch your phone. Just notice and pray.",
    "Create a 3-step shutdown routine for the end of your work day and use it for one week."
   ],
   "forUs": "Base life is full of interruptions: someone at the door, a group chat, a guest who needs help. Those moments matter, and people come first. But lesson planning for DTS, writing a newsletter to supporters, or learning Khmer needs protected time. Agree as a team on some quiet hours, so everyone gets space to do their best work.",
   "oneLine": "Protect your focus, because your best work only happens when your whole mind is in the room."
  },
  {
   "id": "the-psychology-of-money",
   "title": "The Psychology of Money",
   "author": "Morgan Housel",
   "year": 2020,
   "isbn": "9780857197689",
   "shelf": "create",
   "mins": 5,
   "vibe": "Money is less about maths and more about how you behave.",
   "bigIdea": "Doing well with money is not mainly about being smart. It is about patience, humility and how you act when things feel scary or exciting. Housel tells short stories to show that our past, our feelings and our ego shape our money choices more than spreadsheets do.",
   "insights": [
    {
     "emoji": "🌍",
     "title": "Nobody is crazy",
     "body": "Everyone's money habits make sense based on what they have lived through. Someone who grew up in hard times will think about saving very differently from someone who did not. Before you judge, ask about their story."
    },
    {
     "emoji": "🎲",
     "title": "Luck and risk are twins",
     "body": "Some success is luck, and some failure is bad luck. They are two sides of the same thing. So be careful copying one famous person's success, and be kind to yourself and others about failures."
    },
    {
     "emoji": "⏳",
     "title": "Time is the secret ingredient",
     "body": "Compounding means small growth that builds on itself over many years. Housel points out that Warren Buffett earned most of his wealth after his 60s, mainly because he started young and kept going. Staying in the game for a long time matters more than big wins."
    },
    {
     "emoji": "🙈",
     "title": "Wealth is what you do not see",
     "body": "Expensive cars and phones show money that was spent, not money that was kept. Real wealth is the savings no one can see. When we admire someone's nice things, we usually admire the things, not the person."
    },
    {
     "emoji": "🕊️",
     "title": "Freedom is the real reward",
     "body": "Housel says the best thing money can give you is control over your time. Being able to choose what you do, and when, brings more happiness than more stuff."
    },
    {
     "emoji": "🛟",
     "title": "Leave room for error",
     "body": "Plans almost never go exactly to plan. A buffer of savings means one surprise does not destroy you. You can save without a specific reason, because the future will bring things you cannot predict."
    },
    {
     "emoji": "🏁",
     "title": "Know when you have enough",
     "body": "If you keep moving the finish line, you will never feel satisfied. Comparing yourself with others makes it worse. Knowing what 'enough' looks like for you is a quiet kind of strength."
    }
   ],
   "tryThis": [
    "Write down one money belief you learned from your family growing up. Is it still helping you?",
    "Start a small emergency fund, even if it is just a few dollars each month.",
    "Write one sentence that describes what 'enough' looks like for you right now."
   ],
   "forUs": "Many missionaries live on support, and many local staff support whole families, so money can feel tight and personal. This book is not about getting rich. It helps us be wise with what God has given, avoid comparing ourselves with each other, and keep a little margin so one emergency does not become a crisis. It also reminds us that Khmer and international staff come with very different money stories, and both deserve respect.",
   "oneLine": "Good money choices come from patience, humility and knowing what is enough, not from being a genius."
  },
  {
   "id": "made-to-stick",
   "title": "Made to Stick",
   "author": "Chip Heath & Dan Heath",
   "year": 2007,
   "isbn": "9781400064281",
   "shelf": "create",
   "mins": 5,
   "vibe": "Why some ideas live forever and others are forgotten by lunch.",
   "bigIdea": "Some ideas are easy to remember and pass on. The Heath brothers studied why. They found six things that 'sticky' ideas share, and they made them into a simple checklist called SUCCESs that anyone can use when teaching, preaching or sharing a message.",
   "insights": [
    {
     "emoji": "🙉",
     "title": "The curse of knowledge",
     "body": "Once you know something, it is hard to imagine not knowing it. In one experiment, people tapped the rhythm of a famous song and expected listeners to guess it easily. Almost nobody could. Experts often explain things in a way only experts understand."
    },
    {
     "emoji": "🎯",
     "title": "Simple: find the core",
     "body": "Simple does not mean shallow. It means finding the one most important point and cutting everything else. The military uses 'Commander's Intent': one clear goal so people know what to do when plans change."
    },
    {
     "emoji": "😲",
     "title": "Unexpected: break the pattern",
     "body": "Surprise gets attention. Curiosity keeps it. Open a gap in people's knowledge, like a question or a mystery, and they will want to stay to see it closed."
    },
    {
     "emoji": "🧱",
     "title": "Concrete: make it touchable",
     "body": "Abstract words slide out of our minds. Things we can see, hear or touch stay in. Use real examples, real people and real objects instead of big general words."
    },
    {
     "emoji": "✅",
     "title": "Credible: help people believe",
     "body": "You do not always need an expert. Vivid details, a real person's story, or letting people test the idea for themselves can all build trust. Make big numbers human-sized so people can feel them."
    },
    {
     "emoji": "❤️",
     "title": "Emotional: make them care",
     "body": "People respond more to one person than to a huge statistic. Show the one child, the one family, the one story. Also connect the idea to what people already care about."
    },
    {
     "emoji": "📖",
     "title": "Stories: show, do not just tell",
     "body": "Stories work like a practice run for real life. They show people what to do and give them energy to do it. The best stories are often already around you, so look for them."
    }
   ],
   "tryThis": [
    "Before your next talk, write your main point in one short sentence. If you cannot, simplify.",
    "Swap one statistic in your next presentation for the story of one real person (with permission).",
    "Ask a newcomer to explain your idea back to you to check for the curse of knowledge."
   ],
   "forUs": "We explain things all the time: teaching in DTS, sharing the gospel on outreach, training new staff, telling supporters what God is doing. Many listeners are hearing it in their second or third language, so simple and concrete matters even more. One clear point and one true story will often reach further than a long, perfect speech.",
   "oneLine": "Make your message Simple, Unexpected, Concrete, Credible, Emotional and told as a Story, and people will remember it."
  },
  {
   "id": "purple-cow",
   "title": "Purple Cow",
   "author": "Seth Godin",
   "year": 2003,
   "isbn": "9781591840213",
   "shelf": "create",
   "mins": 5,
   "vibe": "Brown cows are boring. Be the purple one.",
   "bigIdea": "If you drive past a field of brown cows, you stop noticing them. A purple cow, though, you would remember. Godin argues that loud advertising works less and less, so the only way to be noticed is to make something truly remarkable, something worth talking about.",
   "insights": [
    {
     "emoji": "🐄",
     "title": "Remarkable means worth a remark",
     "body": "Something is remarkable when people want to talk about it. Godin says this has to be built into the product or idea itself. It cannot be added at the end with clever marketing."
    },
    {
     "emoji": "📺",
     "title": "Shouting does not work anymore",
     "body": "In the past, companies could buy lots of ads and people would pay attention. Now people have too many choices and too little time. They ignore most messages. Being different now matters more than being loud."
    },
    {
     "emoji": "😐",
     "title": "Very good is boring",
     "body": "'Good enough' and even 'very good' are easy to ignore, because there are many very good options. Godin says the safe choice has become the risky choice. Playing it safe can make you invisible."
    },
    {
     "emoji": "🗣️",
     "title": "Find the people who talk",
     "body": "Do not try to reach everyone. Focus on a small group of early fans who love new things and love to share. Godin calls them 'sneezers' because they spread ideas to others. If they care, they will tell the rest."
    },
    {
     "emoji": "🎯",
     "title": "Design for the edges",
     "body": "Aim at a specific group who really care, not the average person. Something made for everyone often excites no one. Go to the edge: the fastest, simplest, friendliest or most surprising."
    },
    {
     "emoji": "🔄",
     "title": "Do not get stuck",
     "body": "Once your purple cow works, enjoy it and use it well. But it will not stay new forever. Keep creating the next remarkable thing while the current one is still working."
    }
   ],
   "tryThis": [
    "Pick one thing your team does. Ask: what would make people want to tell a friend about it?",
    "List the 'sneezers' who love what you do, then ask them for honest feedback.",
    "Change one small detail this week to be surprising in a good way."
   ],
   "forUs": "Think about our cafe, our guest hospitality, or the way we welcome DTS students on day one. It does not need a big budget to be remarkable: a guest remembered by name, a handwritten welcome note, a song from the Khmer team. Being remarkable is not about showing off. It is about loving people so well that they cannot help talking about it.",
   "oneLine": "In a world full of 'very good', only the remarkable gets noticed, so build something worth talking about."
  },
  {
   "id": "switch-on-your-brain",
   "title": "Switch On Your Brain",
   "author": "Dr. Caroline Leaf",
   "year": 2013,
   "isbn": "9780801015625",
   "shelf": "create",
   "mins": 5,
   "vibe": "Your thoughts are not just in your head. Leaf says they shape your brain.",
   "bigIdea": "Caroline Leaf, a communication pathologist and Christian author, argues that your mind can change your brain. She mixes ideas from neuroscience with Bible teaching to say we are not stuck with the thought patterns we have. Some of her scientific claims are debated by other scientists, but her main message is hopeful: with God's help, we can choose and renew our thinking.",
   "insights": [
    {
     "emoji": "🌱",
     "title": "Thoughts are real things",
     "body": "Leaf argues that thoughts are physical, not just ideas floating around. In her view, each thought leaves a trace in the brain, and what you think about often grows stronger. She uses this to explain why repeated worries or lies can feel so powerful."
    },
    {
     "emoji": "🔧",
     "title": "The brain can change",
     "body": "Leaf leans on the idea of neuroplasticity: the brain can rewire and adapt through life. Scientists widely accept that the brain can change. Leaf goes further and argues that our choices and thinking can drive much of that change."
    },
    {
     "emoji": "🎛️",
     "title": "You are not a victim of your biology",
     "body": "A key message of the book is that genes and past experiences are not the final word. Leaf says the mind is in control of the brain, not the other way round. This is her view, and some experts would describe it in a more balanced way."
    },
    {
     "emoji": "❤️",
     "title": "Made for love, not fear",
     "body": "Leaf argues that we are designed for love and that fear and toxic thinking are learned. In her view, this means they can also be unlearned. She links this to Bible verses about renewing the mind and taking every thought captive."
    },
    {
     "emoji": "🔀",
     "title": "Multitasking does not really work",
     "body": "Leaf says that quickly switching between many things leads to shallow, scattered thinking. She encourages focused, deep thinking about one thing at a time instead."
    },
    {
     "emoji": "📝",
     "title": "A 21-day detox plan",
     "body": "The second part of the book is a 21-day plan to deal with one toxic thought pattern at a time. It walks through simple steps: becoming aware of the thought, reflecting on it, writing it down, checking it again and taking a new action. Leaf suggests a few minutes a day, repeated over time."
    }
   ],
   "tryThis": [
    "Notice one thought that keeps coming back this week. Write it down and ask: is this true?",
    "Find a Bible verse that speaks truth into that thought and read it every morning for 21 days.",
    "Spend 10 minutes doing one thing with full focus: no switching, no phone."
   ],
   "forUs": "Mission life can bring stress, homesickness, culture shock and old wounds to the surface. This book can help us notice our thinking and bring it to God, alone or with a mentor or team leader. It is not a replacement for medical or mental health care, so if someone is really struggling, please help them find proper support too.",
   "oneLine": "Leaf's message is that your thoughts matter and, with God's help, you can choose to renew them one day at a time."
  },
  {
   "id": "building-a-storybrand",
   "title": "Building a StoryBrand",
   "author": "Donald Miller",
   "year": 2017,
   "isbn": "9780718033323",
   "shelf": "create",
   "mins": 5,
   "vibe": "Your audience is the hero. You're the guide. Tell the story clearly.",
   "bigIdea": "Miller says most messages fail because they are confusing, not because the product is bad. People's brains filter out anything that is hard to understand. The fix is to use the shape of a good story, where the customer is the hero and you are the helpful guide. His seven-part framework, called SB7, helps you say what you offer so clearly that anyone gets it in seconds.",
   "insights": [
    {
     "emoji": "🧠",
     "title": "Clarity beats clever",
     "body": "The brain is always trying to save energy, so it ignores messages that take work to understand. If people cannot quickly tell what you offer, how it helps them and how to get it, they move on. Clear is better than clever, every time."
    },
    {
     "emoji": "🦸",
     "title": "They are the hero",
     "body": "The first part of the framework is a character who wants something. That character is your customer, not you. Find one simple thing they want, and make your message all about helping them get it."
    },
    {
     "emoji": "🐉",
     "title": "Name the problem",
     "body": "Every story needs a problem, often shown as a villain. Miller says problems have three levels: the outside problem, how it makes people feel inside, and why it is just wrong. People mostly buy solutions to the inside problem, the feeling."
    },
    {
     "emoji": "🧙",
     "title": "Be the guide, not the hero",
     "body": "Heroes need a guide, like Yoda in Star Wars. A good guide shows empathy, saying 'I understand how you feel', and authority, showing they can really help. Brands that make themselves the hero lose people's attention."
    },
    {
     "emoji": "🗺️",
     "title": "Give a plan and a call",
     "body": "Guides give heroes a simple plan, often just three steps, so the path feels safe. Then they clearly call them to act, like 'Book now' or 'Join us'. Miller also suggests a softer option, like a free guide, for people not ready yet."
    },
    {
     "emoji": "🏆",
     "title": "Show what's at stake",
     "body": "Stories need stakes. Show briefly what failure looks like if nothing changes, and paint a clear picture of success if it does. In the end, people want to change and become a better version of themselves."
    }
   ],
   "tryThis": [
    "Write a one-liner for your ministry: the problem, your solution, and the result.",
    "Look at one poster or post and ask: is the audience the hero, or are we?",
    "Turn your sign-up process into three simple steps and share them clearly."
   ],
   "forUs": "We share many messages: DTS promotion, cafe menus, outreach reports, newsletters to supporters. It's easy to make ourselves the hero of every story. StoryBrand reminds us that students, guests and partners are the heroes, and we are guides pointing them toward growth and toward God. Clear, simple words also help Khmer and international readers who use English as a second language.",
   "oneLine": "Make your audience the hero, be the guide, and say it so clearly anyone gets it."
  },
  {
   "id": "the-war-of-art",
   "title": "The War of Art",
   "author": "Steven Pressfield",
   "year": 2002,
   "isbn": "9781936891023",
   "shelf": "create",
   "mins": 5,
   "vibe": "There's a force fighting your best work. Its name is Resistance.",
   "bigIdea": "Pressfield says every person who tries to create or do something good faces an invisible enemy he calls Resistance. It shows up as fear, delay, distraction and excuses. The way to beat it is not to wait for inspiration, but to 'turn pro': show up and do the work every day. When you do, he believes, a deeper help comes to meet you.",
   "insights": [
    {
     "emoji": "👻",
     "title": "Meet Resistance",
     "body": "Resistance is the inner force that stops you from writing, praying, exercising, starting a project or following a calling. It is not a person outside you. It lives inside, and it never fully goes away, so you must face it again each day."
    },
    {
     "emoji": "🧭",
     "title": "It points to what matters",
     "body": "Here's the twist: the more important a task is for your growth, the more Resistance you will feel. So that heavy feeling can be a compass. If you strongly avoid something, it may be exactly what you are meant to do."
    },
    {
     "emoji": "⏳",
     "title": "Its favourite tricks",
     "body": "Resistance loves procrastination, the 'I'll start tomorrow' trick. It also uses smart-sounding excuses, drama, endless busyness and fear of what others think. Pressfield says fear is often a good sign that you are close to something meaningful."
    },
    {
     "emoji": "💼",
     "title": "Amateur vs professional",
     "body": "Amateurs work when they feel like it. Professionals show up every day, no matter how they feel. They are patient, keep learning, take the work seriously but not themselves, and do not let criticism or praise control them."
    },
    {
     "emoji": "✍️",
     "title": "Just sit down and start",
     "body": "Pressfield describes his own routine: he sits down and works for a set time, then stops and lets it go. The hardest part is beginning. Once you start, the work begins to pull you forward."
    },
    {
     "emoji": "✨",
     "title": "Help from beyond",
     "body": "In the last part, Pressfield talks openly about a higher realm, using words like Muse and angels. He believes that when we commit to our work, unseen help comes alongside us. Do the work for its own sake, not for praise, and offer it up."
    }
   ],
   "tryThis": [
    "Name one task you keep avoiding, and write down how Resistance shows up for you.",
    "Set a fixed 25-minute time each day this week and do that task, no matter how you feel.",
    "When you finish, stop and let it go, without judging how good it was."
   ],
   "forUs": "On a busy base, Resistance often hides behind good things: one more meeting, one more chat, one more errand. It can keep us from prayer, language study, preparing a teaching or starting that new ministry idea God put on our heart. Pressfield writes from his own spiritual view, but as followers of Jesus we can take the core lesson: faithfulness every day, and trusting God to meet us in the work.",
   "oneLine": "Resistance is real, but showing up every day like a pro is how you beat it."
  }
 ]
};
