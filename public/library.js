/*  The Library — five-minute reads of the books on Craig Groeschel's four
    leadership book lists (craiggroeschel.com, "44 leadership books" series),
    written for GP in our own words. Not the authors' or publishers' text and not
    any summary service's; no quotations.
    The covers are drawn by teams.html (libCoverHtml_) in one series look from the
    shelf colours and the brand paper, ink and marigold below — nothing is fetched.

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
   "color": "#6B4FA0",
   "ink": "#3F2A66"
  }
 ],
 "cover": {
  "paper": "#FAF6F0",
  "ink": "#17150F",
  "accent": "#FFB323"
 },
 "startHere": [
  "the-21-irrefutable-laws-of-leadership",
  "the-7-habits-of-highly-effective-people",
  "the-advantage",
  "the-five-dysfunctions-of-a-team",
  "crucial-conversations",
  "start-with-why",
  "the-4-disciplines-of-execution",
  "the-e-myth-revisited",
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
   "bigIdea": "Many people think leaders are born, or that leadership comes with a title. John Maxwell disagrees. After many years as a pastor and a trainer of leaders, he says leadership is simply influence: the ability to get people to follow you because they want to, not because they have to. The good news is that influence can be learned. Some people start with more natural gifts, but anyone can grow. Maxwell also says real leadership growth starts on the inside. Before it shows in your team, it shows in your priorities, your integrity, your attitude and your self-discipline. If you serve or lead anyone at all, it gives you a clear path to grow. (He later released an updated version, Developing the Leader Within You 2.0.)",
   "insights": [
    {
     "emoji": "🧲",
     "title": "Leadership = influence",
     "body": "Maxwell opens with a simple definition: leadership is influence, nothing more and nothing less. He likes an old saying that a person who thinks they are leading, but has no one following, is only taking a walk. A title can give you authority, but it cannot make people trust you or want to follow you.\n\nHe also points out that everyone influences someone. A parent, a teacher, a friend, a coworker — all of them shape the people around them, often without noticing. Even a quiet person affects many others over a lifetime.\n\nSo instead of asking 'Am I a leader?', ask how you are using the influence you already have. If influence can grow, leadership can grow too. You do not need to wait for a position to start leading well."
    },
    {
     "emoji": "🪜",
     "title": "The 5 Levels of Leadership",
     "body": "Maxwell describes five levels of influence. Level 1 is Position: people follow because they have to. Level 2 is Permission: they follow because they like you and feel cared for. Level 3 is Production: they follow because of what you get done together. Level 4 is People Development: they follow because you helped them grow. Level 5 is Personhood: after many years of growing people, they follow because of who you are and what you stand for.\n\nEach level builds on the one before it. You cannot skip the relationship stage and jump to results. You may be on different levels with different people, and in a new place you usually start again at the bottom.\n\nUse the levels as a mirror. With each person you lead, ask honestly where you are, and what the next step up would look like."
    },
    {
     "emoji": "🎯",
     "title": "Priorities first",
     "body": "Being busy is not the same as being effective. Maxwell says leaders must decide what matters most and give it their best time. He uses the Pareto Principle, or 80/20 idea: about 20 percent of your work brings about 80 percent of your results.\n\nHe also suggests sorting tasks by importance and urgency. Important and urgent things get done first. Important but not urgent things need planned time, or they get pushed aside forever. Urgent but unimportant things can often be handed off or done quickly. Some good things must be left undone so the best things get done.\n\nSimple everyday example: a team leader who answers every message the moment it arrives may feel busy all day, yet never find time to train her team. Protect time for what really matters."
    },
    {
     "emoji": "🧭",
     "title": "Integrity is the foundation",
     "body": "Maxwell calls integrity the most important ingredient of leadership. Integrity means your words and actions match, and you are the same person in public and in private. He contrasts image and integrity: your image is what people think you are, but your integrity is what you really are.\n\nPeople do not follow a plan first; they follow a person. If they cannot trust you, your good ideas will not matter much. Trust is built slowly, through many small promises kept, and it can be broken very quickly. Small compromises add up over time.\n\nIntegrity also brings freedom: when you have nothing to hide, you can lead with a clear conscience. To grow here, live the standards you ask of others, admit mistakes quickly, and keep small promises, like starting meetings on time."
    },
    {
     "emoji": "🔧",
     "title": "Problems are your training ground",
     "body": "Maxwell says the quickest way to gain influence is to help solve problems. Every leader faces problems, and how you handle them shows people who you are. Leaders who stay calm, look for the real cause and invite others into the solution earn trust quickly.\n\nHe links this to change. In his view, the real test of leadership is whether you can bring positive change. But people often resist change, especially when they do not understand it, did not help shape it, or fear losing something. Wise leaders explain the why, involve people early and build trust before asking for big changes.\n\nSimple everyday example: when a schedule breaks down, one leader blames people, while another asks the team what went wrong and how to fix it together. The second leader grows in influence."
    },
    {
     "emoji": "☀️",
     "title": "Attitude and self-discipline",
     "body": "Maxwell says attitude often decides how far you go, more than skill or talent. People feel your attitude before you say anything. A leader's attitude also spreads: a team tends to catch the mood of the person in front.\n\nYou cannot always choose what happens to you, but you can choose how you respond. Maxwell encourages leaders to guard their thinking, focus on what they can change and keep a teachable spirit.\n\nSelf-discipline is the price of growth. It means doing the right thing even when you do not feel like it. Maxwell says leaders must first lead themselves: manage their time, keep their commitments and keep learning. Before you ask others to follow you, show that you can follow your own good plans. Small daily choices, repeated over time, build a leader people can count on."
    },
    {
     "emoji": "🌱",
     "title": "Grow your people",
     "body": "Maxwell calls people a leader's most valuable asset, and he says the most important lesson is to develop them. The people closest to a leader often decide how far that leader can go. If you gather and grow good people, your impact multiplies.\n\nGrowing people is different from just using them to get work done. It means seeing their potential, giving them real responsibility, training them and cheering when they succeed. It also means sharing a clear vision, so people know where the team is going and why their part matters.\n\nA leader who does everything alone soon hits a ceiling. A leader who raises other leaders keeps bearing fruit even after moving on. So ask: who am I helping to grow right now, and could they lead without me?"
    }
   ],
   "tryThis": [
    "For each person on your team, ask yourself honestly: which of the 5 Levels am I on with them?",
    "List your tasks this week, circle the few that bring the most results, and do those first.",
    "Pick one younger staff member or student and meet with them on purpose this month to help them grow."
   ],
   "forUs": "On a mission base, most of us lead without big titles. You might lead a kitchen shift, a small group, a worship team or an outreach team for a few weeks. That is good news: influence grows through trust, faithfulness and care, not position. Jesus led this way too, by serving and by investing deeply in a few people. For Khmer and international staff, the Permission level matters a lot. People need to feel known and valued before they follow, and that takes time across languages and cultures. Leaders who keep their word, stay calm in problems and raise up others to lead after them are building something that will last long after their own season here ends.",
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
   "bigIdea": "Most of us were taught that a good manager fixes people's weaknesses, treats everyone the same and promotes the best workers. Marcus Buckingham and Curt Coffman tested those ideas. Their Gallup research included surveys of over a million employees and interviews with about 80,000 managers. They found that the best managers often break these common rules. Great managers do not try to change people into something they are not. Instead, they find each person's natural talents and help them use those talents every day. They focus on results, care about people as individuals and help each person find the right fit. If you lead even one person, this book can change how you see them.",
   "insights": [
    {
     "emoji": "👤",
     "title": "People leave managers",
     "body": "The research found that a person's direct manager matters more than the organization itself for how they feel at work. If that relationship is poor, people tend to leave, or they stay but stop giving their best. That is a big responsibility. In short, people often join an organization but leave a manager. So a strong workplace is built one team at a time. Two teams in the same organization can feel very different because of who leads them.\n\nThe authors describe the manager as a catalyst. Leaders look outward, at the future and the big direction. Managers look inward, into each person, to turn their talent into good work. Both roles matter. If you lead people day to day, you shape their experience more than any policy or vision statement does."
    },
    {
     "emoji": "🔢",
     "title": "The 12 questions",
     "body": "Gallup found 12 questions that show if a workplace is strong. The authors describe them like climbing a mountain. At base camp, people ask: Do I know what is expected of me? Do I have what I need to do my work? Next, they ask about what they give: Do I get to do what I do best every day? Have I been praised recently? Does someone at work care about me as a person? Does someone encourage my growth?\n\nHigher up come questions of belonging and growth: Do my opinions count? Do I see meaning in our mission? Do I have chances to learn and grow?\n\nThe order matters. If people do not know what is expected, team-building events will not help much. Start at the base. Make expectations clear, give the right tools, then build up to praise, belonging and growth."
    },
    {
     "emoji": "💎",
     "title": "Talent is not the same as skill",
     "body": "The authors make a clear difference between skills, knowledge and talent. Skills are the how-to of a task, and they can be taught. Knowledge, like facts and experience, can also be learned. Talent is different. They describe it as a natural pattern of thinking, feeling or acting that keeps showing up and can be used well.\n\nThey group talents into three kinds: striving talents (what drives you), thinking talents (how you think and decide) and relating talents (how you build trust and connect with others).\n\nSimple everyday example: you can teach anyone the steps for welcoming a guest. But the person who naturally remembers names and notices when someone feels left out has a relating talent. Training builds on talent; it cannot easily replace it. So choose and place people for talent first."
    },
    {
     "emoji": "🙅",
     "title": "People don't change much",
     "body": "At the heart of the book is one big belief: people do not change that much. Great managers do not waste time trying to put in what was left out. Instead, they try to draw out what is already there. That is hard enough work on its own.\n\nThis does not mean ignoring weaknesses. When a weakness gets in the way, the authors suggest practical options: give the person a support system or tool, pair them with a partner whose strengths fill the gap, or find another way to get the task done.\n\nThe authors also found that the best managers spend the most time with their best people, not their weakest. Less fixing and more building is less tiring for everyone, and it usually brings better results."
    },
    {
     "emoji": "🗝️",
     "title": "The four keys",
     "body": "The book sums up what great managers do in four keys. First, select for talent, not only for experience, intelligence or determination. Second, define the right outcomes, and let each person find their own route. Third, focus on strengths, not weaknesses. Fourth, find the right fit for each person, so they can grow in a role that suits them.\n\nThe keys work together. If you select for talent but then control every step, you waste that talent. If you focus on strengths but leave someone in the wrong role, they will still struggle.\n\nWhen choosing people, the authors suggest open questions about what someone has actually done before, because past patterns are the best guide to future ones. Simple everyday example: ask someone to tell you about a time they helped a new person feel at home, and listen for real stories."
    },
    {
     "emoji": "🏁",
     "title": "Outcomes, not control",
     "body": "Great managers tell people clearly what result they want, and then let them find their own way to get there. Everyone is different, so one 'best way' often fits nobody perfectly. Clear outcomes build ownership.\n\nThere are limits. The authors say some steps should be required: anything needed for safety or accuracy, and the key standards of the organization or industry. Outside those few firm rules, people have freedom. This also changes how you check work. Instead of watching every move, you look at the results and talk about them together.\n\nSimple everyday example: tell a cafe team the goal is that every guest feels welcome and gets their order quickly, instead of writing a long script. Give clear safety and hygiene rules, then trust their style."
    },
    {
     "emoji": "🧩",
     "title": "Right person, right role",
     "body": "Many organizations reward good workers by promoting them into management. But being great at a role does not mean you will be a great manager. Often the organization loses a great worker and gains a frustrated manager.\n\nThe authors suggest creating 'heroes in every role'. Every role, done with excellence, should be honoured and should have room to grow. They even suggest pay levels that overlap, so a truly excellent worker can earn as much as some managers without changing jobs.\n\nGreat managers also help people who are in the wrong role move to a better fit, kindly and honestly. This is not a punishment; it is a gift. Help each person notice what they love, what drains them and where they truly shine. Then help them grow deeper there, instead of only climbing upward."
    }
   ],
   "tryThis": [
    "Ask each person on your team when they last felt they were doing what they do best, and listen well.",
    "For one task you lead, write down the outcome you want, add only the must-follow rules, and stop telling people every step.",
    "Encourage someone this week for one specific thing they did well."
   ],
   "forUs": "On base, we often put people where there is a gap, not where they fit. Gaps are real, and sometimes we all wash dishes. But leaders can still notice what each staff member and student is naturally good at — hospitality, teaching, details, prayer, encouragement — and lean into it when planning roles. The 12 questions are a great check for any ministry team. Do our new staff know what is expected? Do they have what they need? Does someone care about them as a person? Clear expectations and real care matter even more when Khmer and international staff work side by side with different ways of doing things. Seeing each person's God-given design is a way to honour the One who made them.",
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
   "bigIdea": "Why do some organizations become truly great, while others stay just good? Jim Collins and his research team spent five years looking for an answer. They searched through more than 1,400 large companies and found 11 that moved from average results to great results and kept them for at least 15 years. Then they compared each one with a similar company that never made the jump. The difference was not luck, a famous leader or one big moment. It was humble leaders, the right people, honest facts, clear focus and steady discipline over time. Collins also warns that being good is a hidden enemy, because it makes it easy to stop growing. That message matters for any team, including a ministry.",
   "insights": [
    {
     "emoji": "🙇",
     "title": "Level 5 Leadership",
     "body": "The leaders of the great companies surprised the researchers. They were not loud celebrities. Collins calls them Level 5 leaders: they mix deep personal humility with a fierce will to do what is best for the organization.\n\nOne example is Darwin Smith at Kimberly-Clark. He was quiet and plain, yet he made the bold choice to sell the company's paper mills and focus on consumer paper products. It was a hard decision, but it led to great results.\n\nCollins describes a 'window and mirror' habit. When things go well, Level 5 leaders look out the window and give credit to others or to good fortune. When things go badly, they look in the mirror and take responsibility. They also prepare the organization to do well after they leave. Their ambition is for the work, not for themselves."
    },
    {
     "emoji": "🚌",
     "title": "First who, then what",
     "body": "Collins uses the picture of a bus. Great leaders first got the right people on the bus, the wrong people off the bus, and the right people in the right seats. Only then did they decide where to drive.\n\nThis sounds backwards, but it works. If people joined only because of the destination, they may leave when the direction changes. If they joined because of who else is on the bus, they can adapt. The right people do not need to be tightly managed or constantly motivated; they bring their own drive.\n\nCollins also says to be rigorous, not ruthless. That means being careful and clear in people decisions, and when in doubt, not hiring yet but continuing to look. A wrong person in a key seat costs far more than an empty seat for a little longer."
    },
    {
     "emoji": "🧊",
     "title": "Face the brutal facts",
     "body": "Great teams look honestly at hard reality. One comparison in the book is between two grocery chains, Kroger and A&P. Both could see that shopping habits were changing. Kroger faced the facts and rebuilt its stores. A&P avoided the hard truth and slowly declined.\n\nCollins also tells the story of Admiral Jim Stockdale, a prisoner of war in Vietnam for years. Stockdale said the prisoners who did not survive were often the optimists, who kept expecting to be home by Christmas and then lost heart. He never lost faith that he would get out, but he also faced his brutal situation every day. Collins calls this the Stockdale Paradox.\n\nFor leaders, this means creating a place where truth can be heard. Ask questions, allow honest debate, and look at problems without blaming people."
    },
    {
     "emoji": "🦔",
     "title": "The Hedgehog Concept",
     "body": "Collins borrows an old story about the fox and the hedgehog. The fox knows many things and keeps trying clever plans. The hedgehog knows one big thing and does it again and again — and it wins.\n\nGreat companies found a simple Hedgehog Concept where three circles overlap: what they are deeply passionate about, what they can be the best in the world at, and what drives their economic engine. Walgreens, for example, focused on convenient drugstores and measured success by profit per customer visit.\n\nNote the second circle: it is not what you want to be best at, but what you truly can be best at. That takes honesty. Once you know your Hedgehog, you can say no to good ideas that do not fit. Collins even suggests a 'stop doing' list. Simple focus beats doing many things only okay."
    },
    {
     "emoji": "📏",
     "title": "A culture of discipline",
     "body": "Great organizations have disciplined people, disciplined thinking and disciplined action. Collins makes an important point: when people are self-disciplined, you need fewer rules and less control. Too many rules often grow to make up for a lack of discipline and a lack of the right people.\n\nIn the great companies, people had real freedom, but inside a clear framework. They stayed very consistent with their Hedgehog Concept and were willing to say no to anything outside it. This is different from a harsh leader forcing discipline from the top.\n\nCollins gives the picture of a champion triathlete who even rinsed his cottage cheese to remove a little extra fat. It sounds extreme, but it shows a person so committed to the goal that small details matter. Freedom and responsibility grow together when everyone shares the same focus."
    },
    {
     "emoji": "🎡",
     "title": "The Flywheel",
     "body": "Looking back, great change seems dramatic. But leaders inside the great companies said there was no single big moment and no magic program. Collins compares it to pushing a giant, heavy flywheel. At first it barely moves. You keep pushing in the same direction, turn after turn. Slowly it speeds up, until each push builds on all the pushes before it.\n\nThe comparison companies did the opposite. They fell into a 'doom loop': launching new programs, making big purchases, changing direction often, then reacting to poor results with yet another new plan. Momentum never built.\n\nThe lesson is patience with a clear direction. Keep making small, steady pushes that fit your Hedgehog. When people see real progress, they join in pushing. Results attract commitment, which builds more results."
    },
    {
     "emoji": "💻",
     "title": "Tools are accelerators",
     "body": "Many people expected technology to be the main cause of the great companies' success. It was not. The great companies used technology carefully, as an accelerator of what already worked. They chose tools that fit their Hedgehog Concept, and then they used those specific tools very well.\n\nThe comparison companies often grabbed new technology out of fear of being left behind. They hoped a new tool would save them, but tools cannot fix a lack of focus or the wrong people. The great companies stayed calm about the latest trends. Their question was simple: does this help us do what we are already best at, faster or better? If yes, they went deep. If no, they ignored it.\n\nSimple everyday example: a new app will not fix a confused team, but it can help a clear, healthy team move faster."
    }
   ],
   "tryThis": [
    "Draw the three Hedgehog circles for your ministry and write what goes in each one.",
    "Name one 'brutal fact' your team has been avoiding and talk about it honestly this week.",
    "Choose one small, steady push you will repeat every week instead of starting something new."
   ],
   "forUs": "Collins later wrote a short follow-up for non-profits. He noted that for them the 'economic engine' is more of a resource engine — time, money and support — than profit. For a mission base, the Hedgehog questions are powerful. What are we deeply passionate about? What can we do really well here in Cambodia? What keeps our people, volunteers and resources strong? Answering honestly may mean saying no to some good ideas. The Stockdale Paradox fits faith well: we trust God for the final outcome, and we also face hard facts honestly in prayer and planning. Humble leaders, the right people in the right seats and steady faithfulness will take a ministry further than a new idea every season.",
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
   "bigIdea": "Chris Voss spent years as an FBI hostage negotiator, talking with kidnappers, bank robbers and terrorists. He noticed that many negotiation ideas taught in business schools assume people are logical. Real people are not. Emotions drive most of our decisions. The title comes from a simple picture: if you want black shoes and your partner wants brown, splitting the difference and wearing one of each is a bad deal for everyone. Instead of quick compromise, Voss teaches a way of listening he calls tactical empathy: deeply understanding the other person and showing them that you understand. It sounds soft, but he says it is the strongest tool in any hard talk — with a boss, a landlord or a friend.",
   "insights": [
    {
     "emoji": "🫶",
     "title": "Tactical empathy",
     "body": "Empathy in this book does not mean agreeing or being nice. It means understanding how the other person sees the situation and how they feel about it, and then showing them that you understand. Voss calls this tactical empathy, because you use it on purpose.\n\nHe describes negotiation as a process of discovery, not a battle. The goal is to uncover as much information as you can: what the other person wants, what they fear and what pressures they face. People share more when they feel safe and heard.\n\nWhen people feel understood, they become less defensive and more open to new ideas. Simple everyday example: a frustrated coworker will often calm down not when you explain why they are wrong, but when you first show you really get why they are upset."
    },
    {
     "emoji": "🪞",
     "title": "Mirroring",
     "body": "A mirror is simple: repeat the last one to three important words the other person said, with a curious, gentle tone. Then wait. It feels almost too easy, but it makes people keep talking and explain more.\n\nVoss gives an office example. A demanding boss asks for two copies of all the paperwork. Instead of arguing, the employee simply mirrors: 'Two copies?' The boss then explains the real concern behind the request, and together they find a better plan.\n\nMirroring works because people feel that you are following them and that you are on their side. It also gives you time to think. You do not need a clever answer; you just need to keep them talking. The more they talk, the more you learn about what really matters to them."
    },
    {
     "emoji": "🏷️",
     "title": "Labeling",
     "body": "A label names the feeling you notice. You might say, 'It seems like you're worried about the cost,' or 'It sounds like this week was hard.' Voss suggests starting with words like 'it seems', 'it sounds' or 'it looks', not 'I hear', so the focus stays on them.\n\nNaming a negative feeling helps calm it down. Feelings that stay hidden can grow stronger, but once they are spoken, they lose some of their power. Naming positive feelings, on the other hand, can make them stronger.\n\nAfter you give a label, stop talking. Silence feels uncomfortable, but it gives the other person space to respond, correct you or say more. Even if your label is wrong, they will usually tell you what they really feel. That is still a win, because now you understand them better."
    },
    {
     "emoji": "✅",
     "title": "Aim for 'That's right'",
     "body": "Voss says the words that matter most are not 'yes' or 'you're right', but 'that's right'. You get there with a summary: you repeat their view and their feelings in your own words so well that they say, 'That's right.'\n\n'You're right' is often just a polite way to end a talk. 'Yes' can be fake too. Voss describes a counterfeit yes, where people agree just to escape the conversation, and then they do not follow through.\n\nBut 'that's right' shows the person feels truly understood. In that moment, real trust begins, and they become more willing to work with you. Simple everyday example: before you try to solve a friend's problem, sum up how they see it. If they answer, 'Yes, that's right,' you have earned the right to suggest an idea."
    },
    {
     "emoji": "🙅",
     "title": "'No' is a good start",
     "body": "Most people chase a 'yes' and fear a 'no'. Voss flips this. People feel safe and in control when they are allowed to say no. A 'no' protects them, and once they feel protected, the real conversation can begin.\n\nSo he suggests questions that invite a 'no'. Instead of asking if someone has a few minutes, you might ask, 'Is now a bad time to talk?' When someone has gone silent, he suggests a short message asking if they have given up on the project. It often gets a fast reply, because people want to say no and explain.\n\nA 'no' is not the end. It tells you what the person does not want, and it gives them dignity. That makes it easier to discover what they do want."
    },
    {
     "emoji": "❓",
     "title": "Calibrated questions",
     "body": "Calibrated questions are open questions, usually starting with 'how' or 'what'. They avoid 'why', which can sound like blame. Examples: 'What is the biggest problem here?' or 'How am I supposed to do that?'\n\nThese questions give the other person a feeling of control, but they also invite them to help solve your problem. In kidnapping cases, Voss used calm 'how' questions, such as asking how the family could know the victim was safe, to get proof of life without making demands.\n\n'How' questions are also a gentle way to say no. When someone asks for too much, you can ask how you are supposed to do that, and let them see the problem. Voss also uses 'how' questions to check that an agreement will really happen."
    },
    {
     "emoji": "📻",
     "title": "Voice and the accusation audit",
     "body": "How you speak matters as much as what you say. Voss describes a calm, slow, warm voice — like a late-night radio host — that helps people feel safe. Most of the time he suggests a positive, playful voice. A direct, firm voice should be used rarely.\n\nBefore a hard talk, he suggests an accusation audit. List every negative thing the other person might think about you, and then say a few of them first: 'You probably think I'm being unfair.'\n\nThis seems risky, but it often removes fear and anger before they grow. The other person may even say it is not that bad. Voss also teaches careful bargaining, like making offers that move in smaller and smaller steps. But the heart of the book stays the same: understand first."
    }
   ],
   "tryThis": [
    "In your next conversation, mirror the last few words someone says and see what happens.",
    "Before a hard talk, write down every negative thing they might think about you, and open by naming a few.",
    "Swap one 'why' question for a 'how' or 'what' question this week."
   ],
   "forUs": "Negotiation is everywhere on a mission base — with landlords, vendors at the market, local officials, partner churches and even with each other about schedules, rooms and team plans. These tools are really about listening well, which is a deeply Christ-like skill. Jesus often answered with questions and noticed what people felt underneath their words. Across cultures, slowing down, naming feelings and asking 'how' questions can protect relationships and help everyone save face. In Khmer culture, a direct 'no' can be hard to say, so leaders may need extra patience and gentle questions to learn what someone really thinks. Use these skills to understand and serve people, never to trick or pressure them.",
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
   "bigIdea": "Why do some teams grow smoothly while others stay stuck in chaos or slowly lose their life? Les McKeown, who has started and advised many organizations, says every organization moves through predictable stages as it grows. He names seven: Early Struggle, Fun, Whitewater, Predictable Success, Treadmill, the Big Rut and Death Rattle. Each stage has its own typical problems and needs a different kind of leadership. The goal is to reach — and stay in — the stage he calls Predictable Success. Here a team can set goals and reach them consistently, without losing its energy and creativity. Knowing your stage helps you stop blaming people for problems that are really just a normal part of growing.",
   "insights": [
    {
     "emoji": "🌱",
     "title": "Early Struggle",
     "body": "At the start, everything is about survival. Can we find the people, the money and the right idea to keep going? Founders often work very long hours, and every day feels uncertain. Many new ventures do not make it past this stage.\n\nMcKeown says the key question in Early Struggle is simple: is there a real need for what we offer, and can we keep going long enough to prove it? The organization needs to find a clear group of people it serves before it runs out of money or energy.\n\nLeaders in this stage need courage, flexibility and a willingness to change the plan quickly. It is not yet the time for detailed systems. Simple everyday example: a new ministry might try several ideas before finding the one that truly meets people's needs. That trying is normal, not failure."
    },
    {
     "emoji": "🎉",
     "title": "Fun",
     "body": "Once the idea works, growth comes fast and it feels exciting. McKeown calls this stage Fun. Decisions are quick, everyone does a bit of everything, and people feel close and full of energy. Results come from hard work and strong instincts more than from careful plans.\n\nBut Fun has a hidden weakness. It usually depends heavily on one or two key people, often the founder, who makes most of the decisions. While the group is small, this works well.\n\nAs the organization grows, more people and more activities bring more complexity. The same quick, informal style that made this stage so fun starts to cause problems: things are forgotten, work is repeated, and people are unsure who decides what. These are early signs that Whitewater is coming. Enjoy this stage, but start noticing what will need to change."
    },
    {
     "emoji": "🌊",
     "title": "Whitewater",
     "body": "Whitewater is like a small boat in rough water. The group is now bigger, and things get messy: mistakes, confusion and conflict. Growth may slow down. The old informal way no longer works, but new systems are not in place yet.\n\nMcKeown says the team now needs clear processes, structures and ways of deciding that do not depend on one person. This change often causes tension. Founders and doers may feel the new rules slow them down, while others feel the chaos is wearing them out.\n\nThere are two dangers. One is to go back to the founder making every decision, which shrinks the organization back toward Fun. The other is to stay stuck in chaos until people burn out or the work fails. The way through is to agree together on simple systems, share decision-making and keep the original vision alive while you build structure."
    },
    {
     "emoji": "🎯",
     "title": "Predictable Success",
     "body": "This is the sweet spot. There is a good balance between structure and creativity. The team can set goals and reliably reach them. Decisions are made in a clear way, people know their roles, and there is still room for new ideas and flexibility.\n\nMcKeown stresses that Predictable Success is not a place you reach once and then relax. It needs constant care. The natural drift is toward more and more systems, until the life is squeezed out.\n\nSo the key work here is to stay balanced and keep renewing. Leaders regularly ask: are our systems still serving our people and our purpose, or are we now serving the systems? Are we still trying new things? Simple everyday example: a healthy school keeps its clear schedule and policies, but each year it also reviews what is working and makes room for fresh ideas."
    },
    {
     "emoji": "🐹",
     "title": "Treadmill, Big Rut and Death Rattle",
     "body": "If structure keeps growing without new ideas, the team slides onto the Treadmill. Rules, reports and paperwork become the main focus. Creativity and risk-taking fade. People are busy, but the work feels heavy, and decisions get slow.\n\nNext comes the Big Rut. From the outside things look stable, maybe even comfortable. But inside, the organization has lost its ability to change. It keeps doing the same things in the same way, while the world around it moves on, and people may not notice the slow decline.\n\nThe final stage, Death Rattle, is decline toward closing or being taken over. McKeown says it is possible to climb back from the Treadmill, but much harder from the Big Rut. The cure is to bring back vision and action: welcome new ideas, listen to frontline people and question systems that no longer help."
    },
    {
     "emoji": "🧑‍🤝‍🧑",
     "title": "Different leaders for different needs",
     "body": "McKeown describes four leadership styles. The Visionary loves big ideas and new possibilities. The Operator loves action and getting things done now. The Processor loves systems, order and clear data. The Synergist is the one who helps the others work together toward a shared goal.\n\nEach style is needed, but at different times. Visionaries and Operators drive Early Struggle and Fun. Processors become vital in Whitewater. But the styles often clash: Operators think Processors slow everything down, and Processors think Operators create chaos.\n\nMcKeown says the Synergist role is key to staying in Predictable Success, and that people can learn to act more like Synergists. That means seeing value in each style, putting the shared goal first and helping different people listen to each other. Knowing your own natural style also helps you see your blind spots."
    }
   ],
   "tryThis": [
    "With your team, discuss honestly: which of the seven stages are we in right now?",
    "Notice whether you lean more Visionary, Operator or Processor, and thank someone whose style is different from yours.",
    "If you are in a messy growth season, choose one simple process to put in place this month."
   ],
   "forUs": "A mission base has many small 'organizations' inside it — a new cafe, a long-running DTS, an outreach that just started, a community project that has run for years. Each may be in a different stage, so each needs a different kind of leadership. A new ministry may need freedom and quick tries. A growing one may need simple systems. An older one may need fresh vision so it does not become a treadmill. Visionaries, doers and system-builders on our teams often frustrate each other, especially across cultures. Valuing each style, and asking God for unity, helps us grow without losing the life and passion that started the work in the first place.",
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
   "bigIdea": "Most goals do not fail because the plan is bad. They fail because the daily urgent work eats up all our time and attention. The authors, who worked with many organizations through FranklinCovey, call this the whirlwind. Leaders announce a big new goal, everyone agrees, and then the whirlwind of normal work slowly swallows it. A few months later, nobody remembers it. The 4 Disciplines of Execution, often called 4DX, give teams a simple way to keep their most important goal alive in the middle of the whirlwind. The four disciplines are: focus on the wildly important, act on lead measures, keep a compelling scoreboard and create a cadence of accountability. Simple, but not easy.",
   "insights": [
    {
     "emoji": "🌪️",
     "title": "The whirlwind",
     "body": "The whirlwind is all the urgent daily work that keeps things running: messages, meetings, customers and problems that need fixing today. It is necessary. If you ignore it, things fall apart. But it always shouts louder than new goals.\n\nThe authors point out a key difference. The whirlwind is urgent, and it acts on you. A new goal is important, but you must act on it, and it rarely feels urgent. So the whirlwind wins almost every time.\n\n4DX does not try to remove the whirlwind. That is impossible. Instead, it protects a small part of your time and energy for what matters most, while most of your time still goes to the daily work. Simple everyday example: a cafe team still needs to serve every guest, but it can protect a little time each week to work on one big improvement."
    },
    {
     "emoji": "🎯",
     "title": "Discipline 1: Focus on the Wildly Important",
     "body": "Choose one, or at most two, Wildly Important Goals, which the authors call WIGs. A WIG is a goal that will make a real difference, where failing would be a serious loss. The more goals you chase at once, the fewer you finish with excellence.\n\nThis is hard, because many good goals compete for attention. The authors suggest asking: if everything else stayed the same, which one area would make the biggest difference?\n\nEach WIG should be written as a clear finish line: from X to Y by when. Simple example: grow repeat guests from 20 to 35 a week by December. A team's WIG should help the bigger organization's WIG, like small battles that help win a war. Senior leaders can guide and can say no to a weak choice, but teams should help choose their own WIGs, so they own them."
    },
    {
     "emoji": "🧮",
     "title": "Discipline 2: Act on lead measures",
     "body": "Lag measures tell you the result: income, attendance, weight lost. They matter, but by the time you see them, it is too late to change them. Lead measures are the actions you can control that drive the result.\n\nA good lead measure has two features. It is predictive: if it moves, the result will likely move too. And it is influenceable: the team can directly make it happen.\n\nThe book's simple example is weight loss. Weight lost is the lag measure. Calories eaten and exercise each day are lead measures. You cannot control the scale directly, but you can control your meals and your walks. The authors say this discipline makes the biggest difference, and it is also the hardest. Lead measures can feel strange and are easy to forget, so they must be tracked with care."
    },
    {
     "emoji": "📊",
     "title": "Discipline 3: Keep a compelling scoreboard",
     "body": "People play differently when they keep score. The authors say that when a team can see if it is winning or losing, energy and focus rise. Simple everyday example: kids playing football in the street play with much more energy when someone is keeping score.\n\nSo make a scoreboard for the players, not only for the leaders. A leader's scoreboard is often complex and full of data. A players' scoreboard is simple and easy to see. Within a few seconds, anyone should know the goal, the lead measures and whether the team is winning right now.\n\nIdeally, the team designs the scoreboard itself, so people own it. Put it where everyone sees it often, like on an office wall, and update it regularly. When people can see the progress made through their own actions, they start to care more about the goal."
    },
    {
     "emoji": "🗓️",
     "title": "Discipline 4: A cadence of accountability",
     "body": "The fourth discipline is where execution really happens. Teams meet regularly for a short WIG session, usually weekly and around 20 to 30 minutes. Each meeting follows the same simple pattern.\n\nFirst, account: each person reports on the commitments they made last week. Second, review the scoreboard: are we winning or losing, and what did we learn? Third, plan: each person makes one or two new commitments for the coming week that will move the lead measures. There is one strict rule: no whirlwind talk. Daily problems, schedules and other issues belong in other meetings.\n\nThe rhythm matters. When people know they will report to their team every week, they keep the goal in mind. Without this regular check-in, even good goals slowly slip back into the whirlwind."
    },
    {
     "emoji": "🤝",
     "title": "Commitments, not orders",
     "body": "In WIG sessions, people choose their own commitments instead of only receiving tasks. Each person asks: what are the one or two most important things I can do this week to move the scoreboard? Because they chose it, they own it.\n\nThe authors say people are more committed to their own ideas than to orders from above. Keeping a promise to your team builds trust and real accountability. It is not mainly about the boss checking on you; it is about teammates keeping their word to each other.\n\nLeaders make commitments too, and they can ask what they can do to clear the path for their people this week. Over time, as people keep commitments and see the scoreboard move, the team starts to feel like winners. That feeling of winning is very motivating, and it can slowly change the culture of a whole team."
    }
   ],
   "tryThis": [
    "With your team, choose one Wildly Important Goal and write it as 'from X to Y by when'.",
    "Name two lead measures — actions you control — that will move that goal.",
    "Start a 20-minute weekly check-in: report, review the scoreboard, make one commitment each."
   ],
   "forUs": "Base life is a strong whirlwind: guests arriving, meals, worship, school schedules, visa runs, sickness and surprises. Many good plans start at a staff meeting and are forgotten a month later. 4DX offers a gentle structure. If your ministry has a big goal — more Khmer leaders trained, a stronger cafe, better follow-up after outreach — pick one, choose a few simple actions you can control, and check in weekly. A whiteboard scoreboard in the office can bring Khmer and international staff together around one clear win, even with limited shared language. Keep it humble. Goals are tools to serve people well, and we still pray, rest and trust God with the results.",
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
   "bigIdea": "Many people, including many Christians, feel that money and business are a bit dirty. Rabbi Daniel Lapin disagrees. Drawing on old Jewish wisdom and teaching, he argues that business is moral, honourable work. In his view, money is mostly about relationships: you earn it by meeting the real needs of other people, who freely choose to pay you. He shares ten 'commandments' for making money, and most of them are really about character, trust and serving others well. Wealth is not the goal of life. It is a tool, and how you earn it, use it and give it says a lot about who you are. That makes this a book about faithfulness, not only about finances.",
   "insights": [
    {
     "emoji": "🤝",
     "title": "Business is moral work",
     "body": "Lapin pushes back on the idea that business is greedy or second-class work. His first commandment is to believe in the dignity and morality of business. If you secretly feel that making money is wrong, you will struggle to do it well, and you may even feel guilty about serving customers.\n\nSimple everyday example: when you sell good coffee at a fair price, you make someone's day better, and they freely choose to pay you. Both sides win, and nobody was forced.\n\nLapin says that in a free exchange, you gain only by first giving someone else something they value. That is a good thing. Believing this changes how you work. You can serve with pride, honesty and care, knowing that excellent work is a way to bless people and not just a way to get paid."
    },
    {
     "emoji": "🧾",
     "title": "Money as a thank-you note",
     "body": "Lapin describes money as a kind of certificate. Each one is a record that says you served someone and they valued what you did. In a sense, money is a thank-you note from the people you helped.\n\nThis changes the question we ask. Instead of 'How do I get more money?', the better question is how you can serve more people, and serve them better. Money tends to follow real service.\n\nIt also changes how we see honest success. If someone earned money fairly, it usually means they served many people well. That does not make a rich person a better person, and money can still be misused. But it helps us stop seeing honest earning as shameful. Simple everyday example: a tuk-tuk driver who is safe, kind and on time soon has more regular customers."
    },
    {
     "emoji": "🕸️",
     "title": "Grow your circle of people",
     "body": "Making money is a team sport, because it always happens between people. Nobody earns a living alone on an island. One of Lapin's commandments is to keep widening your network of real connections.\n\nHe encourages you to build many true friendships, not only useful contacts you call when you need something. Show real interest in people. Remember their names and their stories. Look for ways to help them, even when there is nothing to gain right away.\n\nThe more people you know and care about, the more ways you can serve them, and the more chances come your way through them. Part of this is becoming the kind of person others enjoy being around. Be reliable, be pleasant and keep learning, so you have something to offer in every conversation."
    },
    {
     "emoji": "🪞",
     "title": "Know yourself, then change",
     "body": "Lapin urges you to look honestly at your own habits, strengths and weak spots. Getting to know yourself is hard, because we easily fool ourselves. So take time to reflect, and listen carefully to how others see you.\n\nHe also says leaders need to be consistent. People need to know what to expect from you, on good days and bad days. A leader whose mood or promises keep changing is hard to trust or follow.\n\nAnother of his commandments is about change itself: keep changing the things that should change, while holding firmly to the things that must never change. Methods, tools and styles can change with the times. Values, honesty and promises must not. Simple everyday example: a shop can update its menu and prices, but it should never cheat on weights or break its word to a supplier."
    },
    {
     "emoji": "🔭",
     "title": "Look ahead and know your money",
     "body": "Lapin sees the ability to look ahead as an important human gift. We can plan, save and give up something today for something better later. He encourages readers to grow this skill: think long term, notice patterns and prepare for what is coming, instead of living only for today.\n\nHe also urges you to know your money. That means understanding how money works, keeping track of what comes in and what goes out, and not being afraid to look at the numbers. Many people avoid this because it feels stressful, but not knowing usually makes things worse.\n\nSimple everyday example: someone who writes down every expense for one month often finds small leaks they never noticed. Clear knowledge brings calm, and it helps you make wise choices instead of reacting to each new crisis."
    },
    {
     "emoji": "🎁",
     "title": "Give a tenth away",
     "body": "Lapin teaches giving about ten percent of what you earn to charity. This comes from a long Jewish tradition where giving is seen as doing what is right, not just a nice extra for people who have plenty.\n\nGiving reminds you that what you have is not only yours. It also breaks the grip that money can have on your heart. You become the master of your money instead of its servant. Lapin also links giving to the way you see yourself: when you give, you start to see yourself as someone who has enough to share.\n\nGiving keeps you connected to others and keeps you generous when things are good and when they are hard. Simple everyday example: a person who gives first, at the start of each month, usually gives more steadily than one who waits to see what is left over."
    },
    {
     "emoji": "🚫",
     "title": "Don't chase perfection, don't retire",
     "body": "Waiting for the perfect plan or the perfect moment keeps you stuck. Lapin warns against chasing perfection. People and businesses grow by acting, making mistakes and improving as they go. A good plan started today is often better than a perfect plan that never starts.\n\nHis last commandment is never to retire. He does not mean you must keep the same job until you die. He argues against the idea that the goal of life is to stop working and do nothing. Work is one of the main ways we serve others and find meaning.\n\nSo as you get older, you may slow down or change roles, but keep serving and stay useful as long as you can. Purposeful work keeps your mind and relationships healthy, and it lets you keep blessing people."
    }
   ],
   "tryThis": [
    "Think of one customer, guest or supporter and ask: what real need am I meeting for them?",
    "Reach out to one person outside your usual circle this week, just to get to know them.",
    "Look at your budget and decide on one clear, planned gift you will give this month."
   ],
   "forUs": "On a mission base we can feel awkward about money. Some of us run a cafe, a guesthouse or a small business, and many of us live on support from churches and friends. This book helps us see both as relational and honourable. Serving guests with excellence is ministry, not a distraction from it. Partners who give are real relationships to care for, not just bank deposits — so thank them, update them and pray for them. Lapin writes from a Jewish view, and we read him through our faith in Jesus. Still, Khmer and international staff alike can learn to handle money with honesty, generosity and joy, trusting God as the true provider.",
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
   "bigIdea": "Michael Gerber worked with thousands of small business owners and saw the same sad pattern again and again. Most small businesses fail, he says, because of a myth: the belief that people who are good at a skill will be good at running a business that uses that skill. A great baker opens a bakery and is soon drowning in work, with no time for family or rest. The business owns them. Gerber's answer is to build simple, clear systems so the business runs well without depending on one tired person. Think of your work as a model that anyone could follow. His big message: stop only working in your business, and start working on it.",
   "insights": [
    {
     "emoji": "🥧",
     "title": "The great myth",
     "body": "Many businesses start when a skilled worker gets tired of working for someone else. Gerber calls this an 'entrepreneurial seizure'. The worker decides they could do it better on their own and keep all the profit. Then they assume that knowing the technical work means they know how to run a business. Gerber calls this the fatal assumption.\n\nHe tells the story of Sarah, who loved baking pies and opened her own pie shop. At first it was exciting. Soon she was working long hours, doing everything herself, and starting to dislike the very thing she once loved.\n\nBeing good at the work is not the same as building a business. A business needs planning, systems, marketing, money management and people. If you only know how to do the work, you have simply bought yourself a demanding new job."
    },
    {
     "emoji": "🎭",
     "title": "Three people inside you",
     "body": "Gerber says everyone who goes into business has three people inside. The Entrepreneur is the dreamer, who lives in the future and sees new possibilities. The Manager loves order and planning, and wants things to be predictable. The Technician is the doer, who lives in the present and just wants to get the work done.\n\nEach one wants to be the boss, and they often fight. Gerber says the typical small business owner is about 10 percent Entrepreneur, 20 percent Manager and 70 percent Technician. So the Technician runs everything, and the business never grows beyond what one person can do.\n\nA healthy business needs all three voices working together. Simple everyday example: someone running a small cafe needs to dream about what it could become, plan how it will work, and still make great coffee."
    },
    {
     "emoji": "🌱",
     "title": "The stages of growth",
     "body": "Gerber describes three stages of growth. In infancy, the owner and the business are the same thing. The owner does everything, and if the owner stops, the business stops.\n\nIn adolescence, the owner gets help, often by hiring someone. But Gerber warns against what he calls management by abdication: handing work to someone and then walking away, with no clear systems or standards. When things go wrong, the owner takes everything back and works even harder. Many businesses get stuck here, or shrink back to what the owner can handle alone.\n\nMaturity is different. A mature business is built from the start with a clear picture of what it will become. Gerber points to IBM, whose leader Tom Watson described having a clear picture from the beginning of how the company would look when it was finally done."
    },
    {
     "emoji": "🍔",
     "title": "Build it like a franchise",
     "body": "Gerber's big idea is the 'franchise prototype'. He is not saying you must sell franchises. He means build your business as if you will copy it 5,000 times. McDonald's under Ray Kroc is his favourite example: the system itself is the product, so young workers anywhere can serve the same meal.\n\nHe also tells of staying at a small hotel where everything was just right: a warm fire, a mint on the pillow, and his favourite coffee waiting the next morning. The manager explained that none of it was luck; it all came from a clear system the staff followed.\n\nIn a franchise prototype, every task is written down and simple enough for an ordinary person to do well. The result is steady quality. Customers know what to expect, no matter who is on shift."
    },
    {
     "emoji": "📋",
     "title": "Systems over heroes",
     "body": "When things depend on one superstar, everything breaks when that person is sick, tired or leaves. Gerber says good businesses are built so ordinary people can do excellent work, with the help of good systems.\n\nThis is not about treating people like machines. Good systems free people to focus, grow and serve well, because they do not have to guess or reinvent everything each day. Gerber suggests a simple cycle he calls innovation, quantification and orchestration. First, try a new way of doing something. Second, measure the results with real numbers. Third, when something works, make it the standard way, so everyone does it. Then keep looking for better ways.\n\nSimple everyday example: a guesthouse might test a new welcome checklist, see whether guests feel more at home, and then train every staff member to use it."
    },
    {
     "emoji": "🗺️",
     "title": "Plan the whole thing",
     "body": "Gerber gives a simple program for building a business, step by step. First comes your primary aim: what do you want your life to look like? The business should serve your life, not swallow it. Next is your strategic objective: a clear picture of what the business must become to support that aim.\n\nThen comes your organizational strategy: draw an org chart of roles, not names. Even if one person fills many roles today, write down each role and what it is responsible for. After that, plan your management, people, marketing and systems strategies.\n\nThe people part is not only about rules. Gerber says people need to understand why the work matters, so the business should feel like a game worth playing. Simple everyday example: a small team that writes down every role soon sees which roles are empty and who needs help."
    }
   ],
   "tryThis": [
    "Write a simple step-by-step checklist for one task you do every week.",
    "Draw an org chart of roles in your ministry, then write who fills each one today.",
    "Block one hour this week to work ON your ministry, not IN it."
   ],
   "forUs": "Our cafe, guesthouse, school office and kitchen all run better with simple systems. Staff come and go every few months, so if knowledge lives only in one person's head, it leaves with them. Written checklists in English and Khmer, with pictures where helpful, help new staff and volunteers serve well from day one. They also free leaders to think, pray and plan instead of putting out fires all day. This is not about being cold or businesslike. Good systems are a form of love: they protect people from burnout and make it easier for the next team to carry the work forward. Build so the ministry can thrive long after you leave.",
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
   "bigIdea": "Why do some ideas, products and habits suddenly spread everywhere, while others die quietly? Malcolm Gladwell, a journalist, says social change often works like a flu. For a long time almost nothing seems to happen. Then one day the idea reaches a 'tipping point', and it spreads very fast.\n\nGladwell believes this is not luck or magic. He finds three rules behind it. First, a few special people do most of the spreading. Second, the message must be 'sticky', so people remember it and act on it. Third, the setting around people shapes what they do.\n\nThis matters for anyone who leads or serves. You may not have money, fame or a big team. But if you understand these three rules, a small, smart push in the right place can make a huge difference.",
   "insights": [
    {
     "emoji": "🦠",
     "title": "Change spreads like a virus",
     "body": "Gladwell asks us to think about trends like epidemics. Epidemics have three features. They are contagious, passing from person to person. Little causes can have big effects. And change happens suddenly, at one dramatic moment, not slowly and evenly.\n\nHis opening example is Hush Puppies, an old American brand of shoes. By the early 1990s almost nobody bought them. Then a few young people in New York started wearing them, partly because nobody else did. Fashion designers noticed. Soon the shoes were everywhere, and sales grew many times over in a short time. The company did not plan any of it.\n\nThis idea gives hope. We often expect change to need huge effort over a long time. But when the conditions are right, a small push can tip a whole group. So watch for small signs that something good is starting to spread, and be ready to support it."
    },
    {
     "emoji": "👥",
     "title": "The Law of the Few",
     "body": "Most people do not spread ideas much. A small group does most of the work. Gladwell names three kinds. Connectors know a huge number of people across many different worlds. Mavens collect information and love to help others make good choices. Salesmen have energy and charm that make people say yes.\n\nHis famous example is the night ride of Paul Revere in 1775, at the start of the American war for independence. Revere rode to warn towns that British soldiers were coming, and many men came out to fight. Another man, William Dawes, carried the same news on the same night, but few people responded. Gladwell says the difference was Revere himself. He was a Connector and a Maven, so people knew him and trusted his news.\n\nSo if you want an idea to spread, do not try to reach everyone at once. Find the few trusted people others listen to, and win them first."
    },
    {
     "emoji": "🍯",
     "title": "The Stickiness Factor",
     "body": "Spreading is not enough. The message must also stick. People need to remember it, and it must move them to act. Gladwell says stickiness often comes from small, careful changes in how a message is presented.\n\nHe studies two children's TV shows. The makers of Sesame Street tested their episodes with real children and watched closely for the moments when the children lost interest. Then they changed those parts. Blue's Clues went even further. It showed the same episode five days in a row, because young children love repeating things and learn more each time. Small details, like pausing so kids could shout out the answer, made the learning stick.\n\nFor us, this means testing our messages. Do not just announce something and hope. Watch how people actually respond. Then change one small thing, such as making it shorter, adding a picture or repeating it, and see what helps."
    },
    {
     "emoji": "🏙️",
     "title": "The Power of Context",
     "body": "People are more sensitive to their surroundings than we think. Small details in a place can change how people behave, sometimes more than their character does.\n\nGladwell describes the 'broken windows' idea used in New York City. Leaders cleaned graffiti off subway trains and stopped people skipping fares. These were small problems, but they said that nobody cared. Fixing them was linked with a big drop in serious crime, though later writers have argued about how much it explains. He also tells of a study with students training to be pastors. Students told they were late for a talk often walked past a man in need, even when the talk was about the Good Samaritan. Students with more time stopped to help much more often.\n\nSo if you want to change behaviour, look at the setting, not only at the people. A clean space, a calmer schedule or a simple sign can help people do the right thing."
    },
    {
     "emoji": "1️⃣5️⃣0️⃣",
     "title": "The Rule of 150",
     "body": "Groups are also a kind of context. Gladwell explains research suggesting that humans can only keep real social relationships with about 150 people. Above that size, people stop knowing each other well, and groups start to need rules and bosses instead of friendship and trust.\n\nHe describes the company that makes Gore-Tex fabric. When one of its factories grew to about 150 people, the company built a new factory and split the group. Everyone could still know each other, so care and peer pressure worked naturally. He also mentions the Hutterites, a Christian farming community that divides a colony when it grows too big.\n\nThis matters for spreading ideas too. In a small group where people really know each other, a new idea or value passes easily from friend to friend. If your group is growing, think about smaller teams or family groups where every person truly belongs."
    },
    {
     "emoji": "🎯",
     "title": "Focus your effort",
     "body": "At the end of the book, Gladwell shares a hopeful lesson. You do not need huge resources to start change. You need to put a small amount of effort in the right places.\n\nHe tells of Georgia Sadler, a health worker in San Diego who wanted to teach Black women about breast cancer. Her talks in churches and community events reached only a small number of women. So she moved her teaching into beauty salons, where women spend hours talking and trust their stylists. The stylists learned the message and shared it, and it reached many more women.\n\nThe pattern is simple. Find the key people. Shape a message that sticks. Choose the right setting. Then test, watch what happens and adjust. Change can feel impossible when you look at the whole problem. But with the right small push in the right place, the world can move."
    }
   ],
   "tryThis": [
    "Name the Connectors, Mavens and Salesmen in your team or community, and talk with one of them about an idea you care about.",
    "Take one announcement or poster and make it shorter, clearer and easier to remember. Then watch if people respond better.",
    "Fix one small 'broken window' in your shared space this week, like a messy corner or a broken sign."
   ],
   "forUs": "When we want a new value or habit to spread on base, like prayer, hospitality or cleaning up together, we can think like Gladwell. Who are the trusted people, Khmer and international, that others listen to? Win them first. How can we make the message simple and sticky in both languages, maybe with a picture or a short phrase people repeat? Is our shared space saying the right thing about who we are?\n\nIn DTS and on outreach, small groups of people who really know each other spread faith and love more naturally than big meetings. And in a village or at the cafe, the right setting can open hearts. Small, faithful steps by the right people, with God's help, can bring real change in a team or a community.",
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
   "bigIdea": "John Maxwell has taught leadership for decades, first as a pastor and later as a trainer around the world. In this book he claims that leadership works by laws, like gravity. They are true in every culture and every kind of group, from a business to a church to a sports team.\n\nHe gives 21 laws, each with stories from business, sport, history and the Bible. Nobody is great at all 21, and Maxwell says he is not either. But you can grow in each one, and you can build a team whose strengths cover your gaps.\n\nWhy does this matter? Maxwell believes everything rises and falls on leadership. Here are some of the most important laws, grouped together.",
   "insights": [
    {
     "emoji": "📏",
     "title": "The Law of the Lid",
     "body": "Your leadership ability is like a lid. It sets the limit on how effective you and your team can be. A team rarely rises above its leader.\n\nMaxwell's example is the McDonald brothers. In the 1940s and 1950s they built a fast, clever hamburger restaurant in California. They had a great system, but they could not grow it much. Then Ray Kroc, a strong leader, joined them. He built a team and a plan to grow, and McDonald's spread across the world. The food and the idea were the same. Only the lid was higher.\n\nSo if you want to see more fruit, the best place to start is yourself. Read, learn, ask for feedback and grow. When your lid rises, your whole team has more room to grow too."
    },
    {
     "emoji": "🧲",
     "title": "Influence and Process",
     "body": "Maxwell says the true measure of leadership is influence, nothing more and nothing less. A title does not make you a leader. He quotes an old saying: if you think you lead but nobody follows, you are only taking a walk.\n\nHe points to Princess Diana. She had no official power, yet millions were moved by her care for the sick and the poor. Her influence came from who she was and what she did, not from a position.\n\nInfluence is not built in a day. The Law of Process says leadership grows through daily learning. Maxwell's example is Theodore Roosevelt, a weak and sickly child who trained his body and mind step by step and became a brave American president. Small daily growth adds up over many years. There are no shortcuts."
    },
    {
     "emoji": "🪨",
     "title": "Solid Ground and Respect",
     "body": "Trust is the foundation of all leadership. Maxwell says leaders build trust by showing competence, connection and character. Each time you break trust, you lose some influence, like spending coins from your pocket. Break it too often and you have nothing left.\n\nThe Law of Respect adds that people naturally follow leaders who are stronger than themselves. Maxwell tells the story of Harriet Tubman. She was a small woman who escaped slavery, then went back again and again to lead others to freedom. She could not read and had no title. But her courage and faith were so strong that people trusted her with their lives.\n\nSo earn respect through character, courage and care. People follow the person they respect, even when that person is not the official boss."
    },
    {
     "emoji": "❤️",
     "title": "Connection and Magnetism",
     "body": "Leaders touch a heart before they ask for a hand. People need to feel that you care about them before they will follow your plans. Maxwell says starting this connection is the leader's job, not the follower's. Do not wait for people to come to you. Go to them, learn their names and listen to their stories.\n\nThe Law of Magnetism says that who you are is who you attract. If you are negative, you will gather negative people. If you are generous, faithful and kind, you will draw people like that. Many leaders wish their team had more energy or commitment, but those things usually start with the leader.\n\nSo before you ask why your team is the way it is, ask what you are showing them. Grow in yourself the qualities you want to see in them."
    },
    {
     "emoji": "⭕",
     "title": "Inner Circle and Empowerment",
     "body": "A leader's potential depends on the people closest to them. No leader succeeds alone. So choose your inner circle wisely: people with good character, real skill and a healthy influence on others.\n\nThe Law of Empowerment says that only secure leaders give power to others. Maxwell's warning example is Henry Ford. Ford changed the world with his car factory, but he did not like others to have power. He refused to change his famous car even when other companies did better, and he weakened leaders around him, including his own son. His company suffered for years.\n\nSecure leaders do the opposite. They trust people, train them and let them lead, even if those people may one day do better than them. When you give power away, the team gets stronger."
    },
    {
     "emoji": "🤲",
     "title": "Buy-In and Sacrifice",
     "body": "People buy into the leader first, then the vision. If people do not trust you, even a great plan will struggle. If they trust you, they will follow even when the plan is not perfect.\n\nMaxwell points to Mahatma Gandhi. Millions in India followed his peaceful way to freedom because they believed in him as a person. The Law of Sacrifice says a leader must give up to go up. The higher you go, the more you are asked to lay down your own comfort and rights. Maxwell tells how Martin Luther King Jr. was arrested, threatened and finally killed for the cause he led.\n\nSo build trust before you share big plans. And when leadership asks you to give something up, see it as part of the calling, not as something unfair."
    },
    {
     "emoji": "🌳",
     "title": "Explosive Growth and Legacy",
     "body": "Leaders who develop followers grow slowly, one person at a time. Leaders who develop other leaders multiply, because every new leader brings their own followers. Maxwell says this is harder work, but it brings the biggest growth.\n\nThe Law of Legacy says a leader's lasting value is seen in what happens after they leave. Maxwell admires Roberto Goizueta, a leader of Coca-Cola, who prepared the next leaders so well that when he died in 1997, the company carried on strongly without crisis. His success continued through others.\n\nSo do not hold all the knowledge and keys yourself. Train someone to do your job. Plan for your work to continue long after you are gone. As Christians we might say it like this: we plant, others water, and God gives the growth."
    }
   ],
   "tryThis": [
    "Pick one law where you feel weak and ask a trusted friend to rate you honestly from 1 to 10.",
    "Have one real heart-level conversation with a team member before talking about tasks.",
    "Give away one responsibility you usually keep, and coach the person who takes it."
   ],
   "forUs": "On a YWAM base, many of us lead small teams for a short time, like a DTS outreach team, a ministry shift or a cafe crew. These laws remind us that leadership is about influence, trust and serving, which fits the way Jesus led. He had no official title, yet he changed the world through twelve people he trained.\n\nWhen we connect with hearts, give power away and raise up Khmer and international leaders to replace us, the work keeps growing even after we move on. Staff come and go often in missions, so this matters even more for us. The question for each of us is: who am I training right now?",
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
   "bigIdea": "Dale Carnegie taught public speaking to business people in New York in the early 1900s. He noticed that his students needed more than speaking skills. They needed to get along with people. So he wrote this book, and it became one of the best-selling books of all time.\n\nHis main point is simple. People are not machines that run on logic. They run on feelings, pride and a deep need to feel important. If you push or argue, people resist. But if you sincerely care about people, listen well and honour them, they will want to work with you.\n\nCarnegie warns that these ideas only work when they come from the heart. They are not tricks.",
   "insights": [
    {
     "emoji": "🚫",
     "title": "Stop criticising, complaining and condemning",
     "body": "Criticism makes people defensive. They protect their pride and look for reasons why they were right. It almost never changes them, and it often leaves bitterness.\n\nCarnegie shows that even criminals rarely blame themselves. He tells of a violent New York gunman, 'Two Gun' Crowley, who still saw himself as a kind-hearted man. If such people excuse themselves, the ordinary people we work with will too. Carnegie also describes how Abraham Lincoln, as a young man, wrote cruel letters that once nearly led to a duel. Later he learned to hold back. During the war he wrote a sharp letter to a general, but never sent it.\n\nSo before you criticise, try to understand. Ask why the person did what they did. Patience and understanding change people far more than blame."
    },
    {
     "emoji": "🙌",
     "title": "Give real appreciation",
     "body": "Everyone wants to feel important. Carnegie calls it one of the deepest desires of human nature. People will work hard, change and even do strange things to feel valued.\n\nHe tells of Charles Schwab, who was paid a huge salary to run a steel company in the early 1900s. Schwab said his greatest skill was not knowing about steel. It was bringing out the best in people, through appreciation and encouragement, and by being slow to find fault.\n\nBut Carnegie is clear that flattery is different. Flattery is fake praise used to get something, and people can tell. Real appreciation is honest and specific. It notices something true and good, and says it. People forget flattery, but they remember sincere thanks for years. So look for the good in people, and tell them."
    },
    {
     "emoji": "🎯",
     "title": "Start from what they want",
     "body": "If you want someone to act, connect it to what they care about. Your own goals do not move other people. They are busy thinking about their own needs and hopes.\n\nCarnegie uses a simple picture. He loved strawberries and cream, but when he went fishing, he did not put strawberries on the hook. He used worms, because that is what fish want. He also tells how Andrew Carnegie, the rich steel businessman, got his nephews to answer his letters. He wrote that he was sending them money, but did not put it in. They wrote back quickly to ask about it.\n\nSo before you ask for something, ask yourself why it would matter to them. Then speak from their side. This is not manipulation when you truly want their good too."
    },
    {
     "emoji": "👂",
     "title": "Be interested, not interesting",
     "body": "Carnegie says you will make more friends, and much faster, by caring about other people than by trying to make them care about you. He points to dogs. A dog does not try to impress you. It is just happy to see you, and so everybody loves it.\n\nHe tells a story from his own life. At a dinner party he met a famous expert on plants. Carnegie listened to him for hours, asking questions with real interest, and hardly spoke about himself. At the end of the night, the man told others that Carnegie was a wonderful person to talk with.\n\nPeople love to be heard. So ask questions. Let them talk about themselves and the things they love. Listen without just waiting for your turn. A good listener is rare, and people remember how you made them feel."
    },
    {
     "emoji": "😊",
     "title": "Smile and remember names",
     "body": "A warm smile says, 'I am happy to see you.' Carnegie says actions speak louder than words, and a real smile is one of the simplest ways to make people feel welcome. He tells of a businessman who decided to smile at his wife, his staff and strangers every day. Both his home and his work became happier.\n\nNames matter too. To most people, their own name is one of the sweetest sounds there is. Carnegie tells of Jim Farley, an American political leader who could remember the first names of tens of thousands of people. It helped him win friends everywhere.\n\nSo learn names, use them and say them correctly. In a busy community, being remembered by name tells people that they matter. It costs nothing, but it means a lot."
    },
    {
     "emoji": "🤝",
     "title": "You cannot win an argument",
     "body": "Even if you win an argument, you lose. The other person feels smaller, and their mind usually has not changed. Carnegie learned this the hard way. At a dinner, he corrected a man about where a famous quotation came from. An older friend who knew the answer quietly said the man was right. Later the friend explained: why prove a man wrong at a party? It only makes him dislike you. Carnegie had actually been correct, but that was not the point.\n\nSo respect other people's opinions. Never tell someone bluntly that they are wrong. If you are wrong, admit it quickly and clearly. Begin with things you agree on, so the talk starts with yes. Let the other person do much of the talking, and let them feel the idea is partly theirs."
    },
    {
     "emoji": "🌱",
     "title": "Lead by building people up",
     "body": "In the last part of the book, Carnegie explains how to change people without hurting them. Begin with praise and honest appreciation before you correct. Point to mistakes gently and indirectly. Talk about your own mistakes first, so the other person does not feel alone.\n\nHe tells of Charles Schwab finding some workers smoking right under a 'No Smoking' sign. He did not shout or point at the sign. He gave each man a cigar and said he would be glad if they smoked them outside. The men knew they had broken the rule, and they respected him even more.\n\nAsk questions instead of giving orders. Let people keep their dignity. Praise every small step forward, and give people a good name to live up to. People grow toward the trust we show them."
    }
   ],
   "tryThis": [
    "Learn the full name of three people on base you do not know well, and use their names this week.",
    "In your next conversation, ask two questions about the other person before you share anything about yourself.",
    "Before you correct someone, first tell them one specific thing they are doing well."
   ],
   "forUs": "In Cambodia, 'face' and respect matter a lot, which makes Carnegie's advice even more important. Correct people privately and gently, never in front of the group. Honour Khmer staff and elders by name, and say thank you in specific ways. Celebrate small wins in DTS, at the cafe and on outreach. Learn to say names well in both Khmer and English.\n\nInternational staff can learn a lot here from Khmer culture, which often already values politeness and saving face. And Khmer staff may find that warm, direct appreciation is a gift to foreign teammates far from home. In the end, this book is basically loving your neighbour, applied to everyday conversations.",
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
   "vibe": "No excuses. No blame. If it is your team, it is your problem, and your chance to fix it.",
   "bigIdea": "Jocko Willink and Leif Babin were officers in the US Navy SEALs. In 2006 they led SEAL teams in the city of Ramadi, Iraq, during some of the hardest fighting of the war. Later they started a company that teaches leadership to businesses.\n\nEach chapter tells a true story from battle, explains one leadership principle, and then shows how it works in a company. Their main idea: a leader owns everything in their world, the wins and the failures. There is no one else to blame.\n\nThis may sound heavy, but it is freeing. When leaders take full responsibility instead of blaming others, they can actually fix problems, and the whole team improves fast.",
   "insights": [
    {
     "emoji": "🙋",
     "title": "Own it all",
     "body": "When something goes wrong, the leader does not point at the team, the plan or bad luck. The leader says, 'This is on me,' and then works to fix it.\n\nThe book opens with the worst day of Jocko's time in Iraq. In a confusing operation, friendly units fired on each other by mistake. One Iraqi soldier died and others were hurt. Many people had made errors, and Jocko could have blamed them. Instead, at the review, he stood up and said the fault was his, because he was the commander and responsible for everything. His bosses trusted him more after that, not less.\n\nThis kind of honesty builds trust. When the leader owns mistakes, team members feel safe to own theirs. Soon the team stops looking for someone to blame and starts looking for solutions."
    },
    {
     "emoji": "🚣",
     "title": "No bad teams, only bad leaders",
     "body": "In basic SEAL training, students race heavy boats in crews of about seven men. In one class, Boat Crew II kept winning, while Boat Crew VI was almost always last. The instructors swapped the two crew leaders. The worst crew, with its new leader, quickly started winning almost every race.\n\nSame people, new leader, different result. The authors say there are no bad teams, only bad leaders. A team becomes what its leader allows. What a leader accepts as normal becomes the team's real standard, no matter what the rules on paper say.\n\nSo if your team is struggling, look first at your own leadership. What are you tolerating? What standard are you really showing them? Raising the standard is hard at first, but people often rise to meet it when the leader believes they can."
    },
    {
     "emoji": "💡",
     "title": "Believe in the mission",
     "body": "You cannot lead people well if you do not believe in what you are asking them to do. If you doubt the mission, your team will feel it.\n\nIn Ramadi, the SEALs were ordered to train and fight alongside Iraqi soldiers. Many SEALs hated this. The Iraqi troops were poorly trained, and working with them felt dangerous. The leaders did not like it either at first. But they stepped back and asked why it mattered. They saw that Iraq could only be safe in the long run if its own soldiers could protect it. Once they understood that bigger reason, they could explain it to their men, and the men committed.\n\nIf you are unsure why a decision was made, ask your own leaders until it is clear. Then explain the 'why' to your team, not just the 'what'."
    },
    {
     "emoji": "🪞",
     "title": "Check your ego",
     "body": "Ego makes it hard to listen, admit mistakes or accept help. The authors say ego gets in the way of everything: planning, taking advice and accepting criticism.\n\nThey warn that success can be dangerous. After many wins, a team can start to feel too good for basic rules or for other people's advice. That kind of pride is often when mistakes happen. In their business work, they also met leaders who blamed others and refused to admit their part, so the problems never got fixed.\n\nConfidence is good, and a leader needs it. But pride that blocks learning is dangerous. Stay humble enough to say, 'I was wrong,' and to ask for help. Remember that the mission matters more than your image. The best leaders are confident and humble at the same time."
    },
    {
     "emoji": "🧭",
     "title": "The four laws of combat",
     "body": "The middle of the book teaches four laws. First, Cover and Move: every part of the team supports the others. In battle, one group covers while another moves. In a company, departments must help each other instead of competing. Second, Simple: plans and orders must be clear enough for everyone to understand. When things go wrong, complex plans fall apart.\n\nThird, Prioritize and Execute. When many problems hit at once, the leader stays calm, steps back, picks the most important problem and solves it, then moves to the next. The authors sum it up as relax, look around, make a call. Fourth, Decentralized Command: small teams with clear goals, led by people who understand the leader's intent and can decide for themselves.\n\nTogether these laws help a team act fast and well under pressure."
    },
    {
     "emoji": "↕️",
     "title": "Lead up and down",
     "body": "Leading down means making sure your team understands the big picture and why decisions are made. If they are confused, it is your job to explain better.\n\nLeading up means helping the leaders above you. In Ramadi, Leif was frustrated by the many questions and approvals his commanders wanted before each operation. Jocko told him to stop complaining and own it. So he learned to give the commanders the information they needed, clearly and early. Approvals came faster, trust grew, and his team got to do more of the work they cared about.\n\nIf your boss does not support you, ask yourself: have I explained it well? Do they have what they need to understand? Do not complain about the leaders above you. Help them see what you see. This is also part of owning your situation."
    },
    {
     "emoji": "🗓️",
     "title": "Discipline brings freedom",
     "body": "The last chapter's big idea is that discipline equals freedom. Early mornings, clear routines and strong standards may feel restrictive. But they create freedom to act and adapt when things get hard.\n\nThe SEAL teams practised standard ways of moving, communicating and checking on each other until everyone knew them well. Because the basics were automatic, the team could change plans quickly without confusion. Jocko himself is known for getting up very early every day to train. He believes small daily habits of discipline give him more freedom in the rest of life.\n\nThe authors also say that leadership is full of balances. Be confident but not proud. Be strict but not harsh. Lead, but also know how to follow. Disciplined teams can be flexible, because the basics are solid."
    }
   ],
   "tryThis": [
    "Think of one recent problem you blamed on someone else. Write down what part of it was yours to own.",
    "When your team is overwhelmed, list every problem, choose the single most important one, and solve it first.",
    "Explain the 'why' behind your next task or request, not just the 'what'."
   ],
   "forUs": "On a mission base it is easy to blame the schedule, the heat, the budget or 'other teams'. Ownership sounds like this: the outreach plan failed, that is on me, and here is how we fix it. It is close to what the Bible calls confession, and it builds trust fast. Nobody has to defend themselves, so everyone can focus on fixing the problem.\n\nCover and Move reminds every ministry, from DTS to the cafe to community work, that we are one team, not competitors. And because staff change often, Decentralized Command matters: train Khmer and international leaders to understand the 'why', so they can make good decisions without waiting for you.",
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
   "bigIdea": "Douglas Stone and Sheila Heen teach at Harvard Law School and help people with difficult conversations. They noticed that most training teaches people how to give feedback. But the receiver is the one who decides whether to learn from it.\n\nFeedback is everywhere: in reviews, in a friend's comment, even in a look across the room. It often hurts, because we are caught between two needs. We want to learn and grow, but we also want to be accepted just as we are.\n\nThe authors show that our strong reactions come from three triggers. When you understand them, you can stay calm, sort the useful from the unfair, and grow without losing yourself.",
   "insights": [
    {
     "emoji": "📦",
     "title": "Three kinds of feedback",
     "body": "The authors say feedback comes in three kinds. Appreciation says, 'I see you, and you matter.' Coaching says, 'Here is how to get better.' Evaluation says, 'Here is where you stand.'\n\nMany conversations go wrong because people are talking about different kinds without noticing. Here is a simple everyday example. A volunteer asks how she can improve, which is a request for coaching. Her leader gives her a score, which is evaluation, and she feels judged. Or someone works hard all year and just wants to feel noticed, but only receives tips. The authors also warn that evaluation is loud. When a score is involved, people often cannot hear the coaching at all.\n\nSo be clear. Before a feedback talk, ask: what kind is this, and what kind do I need?"
    },
    {
     "emoji": "❌",
     "title": "Truth trigger",
     "body": "Sometimes feedback just feels wrong, and we want to reject it. The authors call this the truth trigger. Before you decide it is wrong, first make sure you understand it.\n\nFeedback often comes as vague labels, like be more confident or you are too negative. Labels are not clear. So ask where the feedback comes from: what did the person see, and how did they understand it? Then ask where it is going: what exactly would they like you to do differently?\n\nThe authors suggest a useful shift. Instead of looking for what is wrong in the feedback, which is easy, look for what is different. How does the other person see this differently from you, and why? Often there is something useful hidden inside the part that feels unfair."
    },
    {
     "emoji": "👥",
     "title": "Relationship trigger",
     "body": "Sometimes the problem is not the feedback but the person giving it. We think, 'Who are you to tell me that?' or 'After how you treated me?'\n\nThen something strange happens. The receiver starts talking about the giver, while the giver keeps talking about the first issue. The authors call this switchtracking. Two topics run on two tracks, and the two people talk past each other. A simple everyday example: someone says your report was late, and you reply that they never thank you for anything. Both points may be true, but they are different conversations.\n\nThe answer is to notice the two topics, name them out loud and give each its own time. Discuss the late report. Then, separately, discuss feeling unappreciated. Both matter, and neither should get lost."
    },
    {
     "emoji": "🪪",
     "title": "Identity trigger",
     "body": "Sometimes feedback shakes how we see ourselves. Maybe I am not a good leader. Maybe I am a bad friend. This is the identity trigger, and it can feel very strong.\n\nThe authors explain that people are wired differently. They describe three differences: our normal mood level, how far our feelings swing when we hear criticism, and how long it takes us to recover. Some people bounce back in minutes. Others feel low for days. Neither is wrong, but it helps to know yourself.\n\nThey also warn against all-or-nothing thinking. One piece of feedback is not the whole truth about you. You can have weaknesses and still be a good person. They encourage a growth identity: see yourself as someone still learning, so a mistake becomes part of your story, not the end of it."
    },
    {
     "emoji": "🔦",
     "title": "Everyone has blind spots",
     "body": "Others can see things about us that we cannot. The authors point out that we cannot see our own face, especially when we are stressed. We do not hear our own tone of voice the way others do. These things leak our feelings even when our words are calm.\n\nThere is also a gap between intention and impact. We know what we meant, so we judge ourselves by our good intentions. Other people only see what we did and how it affected them. A simple everyday example: you think you are being efficient in a meeting, but others feel you are rushing them.\n\nSo feedback can show us what we miss. Ask a trusted friend what you do that gets in your own way. Then listen, and try not to defend yourself straight away."
    },
    {
     "emoji": "🧩",
     "title": "Look at the system",
     "body": "Problems often come from how people and roles fit together, not just from one person. The authors suggest stepping back to look at the whole system.\n\nThey describe a few ways to look. First, what is each person adding to the problem? Often both people contribute something. Second, what about roles? Two people with different jobs may naturally clash. Third, what about the bigger setting, like rules, schedules or busy seasons that push people into bad patterns? A simple everyday example: the cooks blame the servers for slow orders, and the servers blame the cooks. Maybe the real problem is how orders are passed between them.\n\nAsking 'What is my part in this?' reduces blame. It also finds better solutions, because you can fix the system instead of just accusing a person."
    },
    {
     "emoji": "🛑",
     "title": "You can say no",
     "body": "Receiving feedback well does not mean accepting everything. You can listen, think about it honestly and still decide not to change. That is your choice.\n\nThe authors describe healthy boundaries. You can say that you will hear someone's advice, but may not take it. You can ask someone to stop giving you feedback on a certain topic for now. And in rare cases, when a relationship keeps hurting you, you can step back from it. Saying no is not the same as being defensive, as long as you have really listened first.\n\nIn the end, the authors hope for teams and families where people ask for feedback, not just wait for it. When people feel safe and heard, learning becomes something we do together, not something that is done to us."
    }
   ],
   "tryThis": [
    "Ask a teammate: 'What is one thing that holds me back?' Then just listen and say thank you.",
    "Next time feedback stings, name the trigger to yourself: truth, relationship or identity?",
    "Before a feedback conversation, agree together: is this appreciation, coaching or evaluation?"
   ],
   "forUs": "On a cross-cultural team, feedback is extra tricky. Some cultures are very direct, others are very indirect, and both can hurt by accident. A Khmer staff member may hint at a problem very gently, and an international teammate may miss it completely. Or a direct comment from a foreigner may feel like a loss of face.\n\nLearning to receive well, and to ask what someone really meant, helps Khmer and international staff trust each other. In DTS, staff reviews and outreach debriefs, growth starts with how we listen. And as followers of Jesus, our identity rests in God's love, so we can face hard feedback without fear and keep growing together.",
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
   "vibe": "Smart people, bad teamwork? The problem is probably trust, and everything built on it.",
   "bigIdea": "Patrick Lencioni tells this book as a story, like a novel. Kathryn Petersen becomes the new CEO of DecisionTech, a technology company in Silicon Valley. The company has money, smart people and good products, but it is falling behind. The real problem is the leadership team. They are polite in meetings, avoid hard issues and protect their own departments.\n\nOver several retreats, Kathryn patiently helps them change. Some team members grow, and one leaves. After the story, Lencioni explains his model in simple terms.\n\nHis big idea is that five problems destroy teams. They stack like a pyramid, and each one grows from the one below. Fix trust first, and the rest becomes possible. Real teamwork is powerful because it is so rare.",
   "insights": [
    {
     "emoji": "🧱",
     "title": "1. Absence of trust",
     "body": "At the bottom of the pyramid is a lack of trust. Lencioni does not mean trusting that someone will do their job well. He means trust based on vulnerability: being willing to say 'I was wrong', 'I need help' or 'I am sorry' without fear.\n\nAt the first retreat, Kathryn asks each person to share where they grew up, how many children were in their family, and the hardest challenge of their childhood. It is a simple exercise, but it surprises the team. People who have worked together for a long time learn new things about each other. Later they also talk about personality types, so they can understand each other's strengths and weaknesses.\n\nWithout trust, people hide weaknesses and waste energy protecting their image. With it, they can be honest. Leaders must go first, showing real weakness, not a fake humble act."
    },
    {
     "emoji": "🤐",
     "title": "2. Fear of conflict",
     "body": "Teams without trust avoid honest debate. Their meetings feel peaceful but boring, and real problems are only discussed in private, in the hallway or behind people's backs. Lencioni calls this artificial harmony.\n\nHealthy conflict is passionate debate about ideas, not attacks on people. In the story, Kathryn surprises the team by saying they need more conflict, not less. When disagreements come up, she lets them continue instead of calming things down too fast. Lencioni suggests leaders go looking for hidden disagreements and bring them into the open. When a debate gets uncomfortable, the leader can remind people that this kind of conflict is good and needed.\n\nAvoiding conflict does not remove it. It pushes it underground, where it becomes gossip and frustration. A team that can argue well about ideas decides better, and often finishes meetings faster too."
    },
    {
     "emoji": "🤷",
     "title": "3. Lack of commitment",
     "body": "If people never shared their real opinion, they will not truly support the decision. They may nod in the meeting and then quietly do something else.\n\nLencioni says commitment needs two things: clarity and buy-in. People do not need to get their way. Most reasonable people just need to know their ideas were heard and considered. Then they can support the team's decision even if they argued against it. Waiting for everyone to agree, or for perfect information, only causes delay.\n\nIn the story, Kathryn ends meetings by asking the team to say clearly what they decided and what each person will tell their own staff. Lencioni calls this cascading communication. This simple habit quickly shows if people are leaving with different ideas about what was agreed. A clear decision, even an imperfect one, is better than a vague one."
    },
    {
     "emoji": "📏",
     "title": "4. Avoiding accountability",
     "body": "When nobody is really committed to a clear plan, nobody calls out a teammate who falls behind. People feel awkward and do not want to damage the relationship. So standards slowly drop, and the leader becomes the only one who corrects anybody.\n\nLencioni says the best teams hold each other accountable, peer to peer, not only through the boss. In the story, Kathryn leads an exercise where each person names one thing each teammate does that helps the team, and one thing that hurts it. It is uncomfortable, but it is honest and kind, and it shows people clearly what to change.\n\nAvoiding a hard conversation is not really kind. It lets a teammate keep failing, and it makes others quietly resent them. When goals and standards are clear and public, it becomes much easier to remind each other gently."
    },
    {
     "emoji": "🏆",
     "title": "5. Inattention to results",
     "body": "At the top of the pyramid, people care more about their status, ego or own department than the team's shared goals. They want their area to look good, even when the whole organisation is struggling.\n\nIn the story, Kathryn tells the leaders that this leadership team must be their first team, more important than the departments they lead. That is hard for some of them. She also makes a painful choice. Mikey, a gifted marketing leader, keeps putting herself above the team and will not change. In the end, Mikey leaves the company, and the team becomes healthier.\n\nLencioni says great teams make shared results clear, public and the true measure of success. When everyone looks at the same scoreboard, it is harder for individual egos to take over. Talent matters, but a team that wins together matters more."
    },
    {
     "emoji": "🗣️",
     "title": "Simple tools to start",
     "body": "Lencioni gives practical tools for each level. For trust, share personal stories and talk about personality types and strengths. For conflict, make it clear that disagreement is welcome, and invite quieter voices to speak. For commitment, end every meeting by saying out loud what was decided and who will tell whom. For accountability, make goals and standards visible and review progress together. For results, keep a simple scoreboard of shared goals.\n\nNone of this is complicated. The hard part is discipline and courage. Lencioni admits that building a real team is simple in theory but hard in practice, because it asks people to stay humble and vulnerable for a long time.\n\nSo start small. Pick one tool, use it at your next team meeting, and keep using it until it feels normal. Change takes months, not one retreat."
    }
   ],
   "tryThis": [
    "In your next team meeting, have everyone share where they grew up and one challenge from their childhood.",
    "End every meeting by asking: 'What did we decide?' and 'Who will tell whom?'",
    "Ask one teammate directly about a concern you have been avoiding, kindly and in private."
   ],
   "forUs": "In many cultures, including Khmer culture, open disagreement can feel rude, so artificial harmony is a real temptation on our base. People may smile and agree in a meeting, then share their real thoughts later with friends. Leaders can make it safer by being vulnerable first, by asking quieter people for their view one by one, and by thanking people who disagree respectfully.\n\nThe personal histories exercise works well with DTS teams and new staff, and it helps Khmer and international staff see each other as people, not just roles. And remember: everyone's first team is the whole base and its mission, not just their own ministry. When the cafe, the school and the outreach teams cheer for each other's results, the whole base grows stronger.",
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
   "vibe": "Being smart is not enough. How you handle feelings, yours and others', shapes your life.",
   "bigIdea": "Why do some very clever people make a mess of their lives, while people with average grades do well? Daniel Goleman, a psychologist and science writer, says IQ cannot explain it. IQ is only one part of the picture.\n\nHe argues that emotional intelligence matters a great deal. It includes knowing your own emotions, managing them, motivating yourself, understanding other people's feelings and handling relationships well. These skills shape our marriages, friendships, work and even our health.\n\nThe good news is that these skills are not fixed at birth. Goleman uses brain science and many studies to show that emotional habits can be learned and improved at any age. For anyone who leads or serves, this is hopeful. We are not stuck with the way we react today.",
   "insights": [
    {
     "emoji": "🧠",
     "title": "The emotional hijack",
     "body": "Goleman explains that a small part of the brain called the amygdala works like an alarm. It reacts to danger very fast, faster than the thinking part of the brain. This helped humans survive real danger. But sometimes the alarm takes over when it should not, and we say or do things we deeply regret. Goleman calls this an emotional hijacking.\n\nHe opens with true stories where the alarm went off before the mind could think, and people did in a second what they regretted for years. Simple everyday example: someone slams a door behind you and, before you know why, your heart jumps and your fists are ready.\n\nMost of our hijacks are much smaller, like snapping at a teammate. The first step to controlling them is noticing the moment: my heart is racing, I feel attacked. That small pause gives the thinking brain time to catch up."
    },
    {
     "emoji": "🪞",
     "title": "Self-awareness comes first",
     "body": "You cannot manage a feeling you do not notice. Knowing what you feel, while you feel it, is the foundation of emotional intelligence.\n\nGoleman retells an old Japanese story. A proud samurai asked a Zen teacher to explain heaven and hell. The teacher insulted him. The samurai became furious and raised his sword. The teacher said calmly that this was hell. The samurai understood, put his sword away and bowed in thanks. The teacher said that this was heaven. The moment the samurai saw his own anger, he was free from it.\n\nGoleman says people handle their moods in different ways. Some are aware of them. Some are swamped by them. Others accept them and do not try to change them. Simply naming an emotion, like I feel embarrassed, often calms it and helps us choose what to do next."
    },
    {
     "emoji": "🧘",
     "title": "Managing your emotions",
     "body": "Feelings are not bad. They are part of being human. But we can choose how we respond. People who can calm themselves after anger, worry or sadness recover faster and make wiser decisions.\n\nGoleman looks closely at anger. Angry thoughts feed more anger, so going over the same story again and again makes it worse. Research he describes found that angry people calm down best when they cool off away from the trigger, for example by taking a walk, and when they see the situation in a new way. Perhaps the person was tired, not cruel. Shouting to let the anger out usually keeps it alive longer. With worry, it helps to question the worried thoughts and to practise relaxing the body.\n\nThis is not about hiding feelings. It is about not letting one feeling take control of everything. Calm is a skill that grows with practice."
    },
    {
     "emoji": "🍬",
     "title": "Waiting for the bigger reward",
     "body": "Goleman describes a famous study from Stanford University. Four-year-old children were offered one marshmallow now, or two if they could wait until the researcher came back. Some ate it at once. Others found ways to wait, like covering their eyes, singing or playing games. Years later, the children who had waited were, on average, more confident and dependable, and did better on school tests. Later research suggests that family background also plays a big part.\n\nGoleman's point is that self-control and hope keep us moving toward long-term goals. He also talks about optimism and flow, the happy state of being fully absorbed in something you do well. Hopeful people believe they can find a way, so they do not give up easily.\n\nFor leaders, this is encouraging. Self-control is like a muscle. We can help ourselves and others grow it through small daily habits."
    },
    {
     "emoji": "💞",
     "title": "Empathy",
     "body": "Most emotions are shown through tone of voice, face and body, not through words. Empathy is the skill of reading these signals and feeling with others. Goleman says it grows from self-awareness: the more open we are to our own feelings, the better we can read the feelings of others.\n\nHe describes research where people watched short films of a woman showing different feelings, with the words made impossible to understand. People who were good at reading the feelings without words were often better liked and more emotionally stable. Goleman also notes that even babies become upset when they hear another baby cry.\n\nEmpathy is the root of compassion and care. Goleman points out that people who do great harm to others often lack it. In daily life, empathy means slowing down, watching faces, listening to tone and gently asking how someone really is."
    },
    {
     "emoji": "🤝",
     "title": "Handling relationships",
     "body": "Emotions spread between people, almost like a cold. Goleman calls this emotional contagion. Skilled people can calm a tense room, give criticism kindly, and help others feel understood.\n\nAt the start of the book, he describes a bus driver in New York City on a hot, sticky afternoon. The driver greeted each passenger warmly and chatted happily about the city as they rode. Tired, grumpy people stepped off the bus smiling. One person's mood changed the mood of many others.\n\nGoleman also shows how to give criticism well. Be specific about the problem, offer a way to fix it, and say it face to face with care. Attacking someone's character only creates anger and defensiveness. These social skills, together with empathy and self-control, are what make great leaders, good team members and loyal friends."
    }
   ],
   "tryThis": [
    "Three times today, pause and name your feeling in one word.",
    "When you feel anger rising, wait before you reply. Take a short walk or a few slow breaths first.",
    "In your next conversation, watch the other person's face and tone, and ask how they are really doing."
   ],
   "forUs": "Mission life is emotional: culture stress, heat, tiredness, homesickness and living close together in community. Emotional intelligence helps us notice what is happening inside before it spills onto our teammates. A short walk before replying to a hard message can save a friendship.\n\nAcross languages, reading faces and tone with empathy is often how we understand each other best. Many Khmer people show feelings quietly, and many internationals show them openly, so we need to watch and ask with care. The Bible also calls us to be slow to anger and to weep with those who weep. Growing in these skills is part of growing in love, and the Holy Spirit helps us grow in self-control.",
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
   "bigIdea": "Why do some teams trust each other and work together so well, while others are full of fear and politics? Simon Sinek found one clue in the US Marine Corps. At meals, the most junior Marines eat first and the most senior leaders eat last. It is not a written rule. It is simply the culture: leaders put their people's needs before their own.\n\nSinek argues that great leaders build a 'Circle of Safety' around their people. Inside it, people feel protected from dangers inside the group, like fear of being blamed, betrayed or suddenly fired. When people feel safe, they trust each other, work together and face outside problems bravely.\n\nHe uses biology, history and real companies to show that this is not soft. It is how humans are made to work best together.",
   "insights": [
    {
     "emoji": "🛡️",
     "title": "The Circle of Safety",
     "body": "Every group faces dangers from outside: competition, hard economic times, sickness or opposition. Sinek says that is normal. The real problem comes when people also have to protect themselves from their own leaders and teammates. Then they waste energy on politics and self-protection, and they stop trusting.\n\nHe opens the book with Captain William Swenson, a US Army officer in Afghanistan. During an ambush, Swenson ran into danger again and again to rescue wounded soldiers. A video shows him gently kissing the head of a badly wounded man as he puts him on a helicopter. Sinek asks why people like this risk themselves for others. His answer: they feel part of a group that would do the same for them.\n\nLeaders who make the inside feel safe free people to focus on the mission and give their best."
    },
    {
     "emoji": "🧪",
     "title": "The body's chemistry",
     "body": "Sinek explains four natural chemicals that make us feel good. Endorphins help us push through pain and tiredness. Dopamine gives us a happy feeling when we reach a goal or tick something off a list. These two help us work hard and achieve. Sinek calls them selfish chemicals, because they mostly reward individual effort.\n\nSerotonin and oxytocin are the selfless chemicals. Serotonin gives us a feeling of pride and respect, both when others honour us and when we see people we care for do well. Oxytocin is the feeling of trust, love and friendship. It grows through acts of kindness and time spent together.\n\nHealthy teams need both kinds. A culture driven only by dopamine can become obsessed with targets and numbers, and Sinek warns that this can become almost like an addiction. Trust and care keep the team human."
    },
    {
     "emoji": "⚠️",
     "title": "Stress kills trust",
     "body": "When people feel unsafe, the body releases cortisol, the stress chemical. It helps us react to danger in the short term. But if it stays high for a long time, it harms our health. It also blocks oxytocin, so people become more selfish, suspicious and closed.\n\nSinek describes the Whitehall studies of British government workers. Researchers found that people lower down in the organisation had more stress-related health problems than those at the top. The pressure of big responsibility was not the main cause. The bigger problem was feeling that they had little control over their own work.\n\nSo bad leadership is not just unpleasant. It can actually make people sick. Leaders can lower stress by giving people more control over their work, clear information, and the feeling that someone has their back."
    },
    {
     "emoji": "🍽️",
     "title": "Leadership is sacrifice",
     "body": "Leadership is not about rank or title. Sinek says leaders have a choice: to take care of the people in their care, or not. Real leaders give up their own comfort, time and sometimes safety for their people. In return, people give their trust and their best work.\n\nHe tells of a US Air Force pilot, known by the call sign Johnny Bravo, who flew low under thick clouds in Afghanistan to help soldiers under attack on the ground. It was very dangerous, and he could hardly see, but he would not leave them alone. Stories like this show how leaders earn deep loyalty.\n\nPeople notice when a leader gives something up for them. They also notice when a leader takes the best for themselves. The leaders we follow most gladly are the ones who would eat last. The cost is real, but so is the trust it builds."
    },
    {
     "emoji": "🏭",
     "title": "People before numbers",
     "body": "Sinek tells of Bob Chapman, the leader of a manufacturing company called Barry-Wehmiller. During the economic crisis of 2008, one part of the company lost many orders and needed to save a lot of money. Many companies would simply have laid people off. Instead, Chapman asked everyone, from the factory floor to the managers, to take four weeks of unpaid leave. Everyone shared a small pain so that nobody suffered a big one.\n\nThen something beautiful happened. Some workers who could afford it offered to take extra unpaid time, so that others who could not afford it would lose less. Trust grew, and so did loyalty.\n\nSinek contrasts this with leaders who protect profits by cutting people at the first sign of trouble. When people feel like numbers, they protect themselves. When they feel valued, they protect each other."
    },
    {
     "emoji": "👀",
     "title": "Keep it human and close",
     "body": "When organisations grow very big, leaders can start seeing people as numbers on a screen. Sinek calls this abstraction, and he says it is dangerous.\n\nHe describes the famous Milgram experiments from the 1960s. Ordinary people were told to give electric shocks to a stranger in another room. The shocks were not real, but the people did not know that. Many obeyed. But when the stranger was in the same room, where they could see him, far fewer people went all the way. Distance made it easier to hurt someone.\n\nThe same is true in leadership. It is easier to make harsh decisions about people you never see. So leaders need to stay close enough to know names and stories. Face-to-face time, real meals and simple conversations build trust that emails and messages cannot."
    }
   ],
   "tryThis": [
    "Ask your team what makes them feel worried or unsafe here. Then fix one small thing.",
    "Do one small act of service for your team this week that costs you time or comfort.",
    "Put your phone away in your next one-to-one meeting and give full attention."
   ],
   "forUs": "Jesus washed his disciples' feet, and servant leadership is at the heart of our mission. A base leader who protects staff from burnout, gossip and fear builds a team that can go out and serve Cambodia with joy. Safety inside the team gives courage for outreach outside. A team that feels protected can take risks for the gospel.\n\nFor us, building a Circle of Safety might mean defending a teammate who is being talked about, making sure Khmer and international staff are both heard, or checking on volunteers who are tired. It also means staying close: eating together, learning names and visiting people's homes. Sometimes it literally means letting the team eat first.",
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
   "bigIdea": "Why are there still so few women at the top of companies, governments and organisations? Sheryl Sandberg asked this while she was a senior leader at Facebook. Her answer has two sides. Some barriers are outside us: bias, unfair systems and little support for working parents. Other barriers are inside us: fear, self-doubt and the habit of holding back before anyone even asks. Sandberg says we need to fight both. She mixes research with honest stories from her own life, including her mistakes. Her message to women is simple: lean in. Take the seat, raise your hand and keep growing. Her message to men, families and leaders matters just as much: make room, share the load at home, and notice bias when you see it.",
   "insights": [
    {
     "emoji": "🪑",
     "title": "Sit at the table",
     "body": "Sandberg tells of a meeting she hosted at Facebook for the US Treasury Secretary and his team. The women on his team took chairs at the side of the room, even though there was space at the main table. They did not feel they belonged there.\n\nMany capable women feel this way. Sandberg describes 'impostor syndrome': feeling like a fraud who will soon be found out, even after real success. She also shares a company report that men often apply for a job when they meet only some of the requirements, while women wait until they meet nearly all of them.\n\nThe lesson is simple. Doubt should not decide where you sit. Take the seat, share the idea and ask for the opportunity."
    },
    {
     "emoji": "⚖️",
     "title": "The likeability problem",
     "body": "Sandberg describes a well-known class experiment at a business school. Students read a true story about a successful business leader. Half the class read it with a woman's name, Heidi. The other half read the same story with a man's name, Howard. Students rated both as equally capable. But they liked Howard more, and saw Heidi as selfish and not someone they would want to work with.\n\nThis shows a hidden bias. When men succeed, people tend to like them more. When women succeed, people often like them less. So women may hide their wins, avoid asking for more, or apologise for being strong.\n\nSandberg says we should name this bias out loud, so teams can catch it. When someone calls a woman too pushy, ask: would we say this about a man who did the same thing?"
    },
    {
     "emoji": "🧗",
     "title": "A jungle gym, not a ladder",
     "body": "Sandberg borrows a picture from a journalist friend: a career is more like a jungle gym than a ladder. On a ladder there is only one way up, and many people are stuck waiting. On a jungle gym you can move sideways, go down a little or climb in a new direction, and still reach somewhere great.\n\nHer own path looked like this. She worked in government, then joined Google when it was still young, and later moved to Facebook. When she was unsure about a job at Google, its leader told her not to worry about the title. If you are offered a seat on a fast-growing rocket ship, just get on.\n\nShe suggests two things. Have a long-term dream, even a vague one. And have an 18-month plan: what will your team achieve, and what new skills will you learn?"
    },
    {
     "emoji": "🧑‍🏫",
     "title": "Mentors come from good work",
     "body": "Sandberg often met young women who walked up to senior leaders and asked, 'Will you be my mentor?' She compares this to a children's picture book where a baby bird wanders around asking every animal, 'Are you my mother?' If you have to ask, the answer is usually no.\n\nMentoring tends to grow the other way around. Senior people notice someone who does excellent work and shows promise, and they choose to invest. Sandberg herself was helped by a university professor who later hired her to work with him.\n\nSo the better path is to do great work first. When you do get time with someone wise, bring a specific question, not a vague request. Also look sideways: friends and peers at your own level can give some of the best support."
    },
    {
     "emoji": "🚪",
     "title": "Don't leave before you leave",
     "body": "Sandberg noticed a pattern. Many women start stepping back from their careers long before they have children. They think ahead: one day I want a family, so I should not take on too much. So they stop raising their hand for new projects. She tells of a young woman at Facebook who asked how to balance work and family. When Sandberg asked if she had a child, the woman said she did not even have a boyfriend yet.\n\nThe problem is that by the time a baby comes, these women may be in jobs that feel less interesting. Then leaving is easier.\n\nSandberg's advice is to keep your foot on the gas. Keep learning and saying yes. If the time comes to make a change, make it then, with the full picture, not years early out of fear."
    },
    {
     "emoji": "🏠",
     "title": "Make your partner a real partner",
     "body": "Sandberg calls the choice of a life partner one of the most important career decisions a woman makes. In many homes, even when both people work outside the home, the woman still does most of the cooking, cleaning and child care. That leaves her less time and energy for her work.\n\nShe shares that she and her husband, Dave, worked hard at sharing things fairly. She also warns about a habit she calls 'maternal gatekeeping'. A mother criticises how the father feeds or dresses the baby, so he slowly stops trying. If you want a partner to share the work, let them do it their own way.\n\nShe points to research linking involved fathers with healthier, happier children. Fair sharing is good for the whole family, not only for the woman."
    },
    {
     "emoji": "✅",
     "title": "Let go of perfect",
     "body": "Sandberg says the idea of having it all is a trap. Nobody can do every part of life perfectly. Trying to be the perfect worker, parent, partner and friend at the same time leads to guilt and exhaustion. A poster on the wall at Facebook said that done is better than perfect, and she found that freeing.\n\nShe is honest about her own struggle. After her first child, she started leaving the office earlier to be home for dinner. At first she worried people would think she was not committed. In the end, her work did not suffer.\n\nThe skill here is to set clear priorities and then be at peace with the things you chose not to do. Being clear about a few important things helps everyone."
    }
   ],
   "tryThis": [
    "In your next meeting, notice who speaks and who stays quiet, and invite one quiet person to share.",
    "If you usually hold back, share one idea out loud this week, even if you feel unsure.",
    "Look at how tasks are shared in your home or team, and make one change to make it fairer."
   ],
   "forUs": "At GP, many of our most gifted leaders, teachers and servants are women, both Khmer and international. Yet in many cultures, women can still hold back or be overlooked. Leaders can help in simple ways. Notice who sits at the side of the room in staff meetings, and invite them to the table. Give real chances to lead a DTS, an outreach team or a ministry, not only support roles. When a woman leads strongly, watch for the likeability bias in how we talk about her. Married couples on staff can model fair sharing of home and children, so both can serve well. When everyone uses their gifts fully, the whole body of Christ gets stronger.",
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
   "bigIdea": "Why do some leaders and groups inspire deep loyalty, while others with more money and talent do not? Simon Sinek noticed a pattern. Most organisations can explain what they do, and some can explain how. Very few can clearly say why. By 'why' he does not mean making money. He means purpose, cause or belief: why does your group exist, and why should anyone care? Sinek claims that leaders who inspire, like Martin Luther King Jr. or the Wright brothers, all think, act and speak from the why first. People do not join a cause because of a list of features. They join because they share the belief. For anyone leading a team or a ministry, this means purpose is not decoration. It is the heart of everything.",
   "insights": [
    {
     "emoji": "🎯",
     "title": "The Golden Circle",
     "body": "Sinek draws three circles, one inside another. In the centre is Why: your purpose. Next is How: the special way you do things. On the outside is What: the things you actually do or sell. Most groups talk from the outside in. They start with what they offer.\n\nHis favourite example is Apple. A normal computer company might say: we make great computers, they are easy to use, do you want one? Sinek imagines Apple's message the other way round: everything we do challenges the normal way and thinks differently; we do this with beautiful, simple design; and we happen to make great computers. The facts are the same, but the order changes how people feel.\n\nStart with what you believe. Then what you do becomes the proof of it."
    },
    {
     "emoji": "🧠",
     "title": "It matches the brain",
     "body": "Sinek says the Golden Circle is not just a nice idea. It matches how the human brain works. The newest, outer part of the brain handles facts, numbers and language. That lines up with What. The inner part, called the limbic brain, handles feelings, trust, loyalty and decisions. That lines up with Why and How. And the limbic brain does not use words.\n\nThis is why people often say a choice just feels right, even when the facts point another way. We decide with the feeling part and explain with the thinking part.\n\nIf you only give people facts and features, they may understand you but not be moved. When you speak about your purpose, you reach the part of the brain that actually decides and commits."
    },
    {
     "emoji": "🎣",
     "title": "Inspire, don't manipulate",
     "body": "There are two ways to get people to act. You can manipulate them, or you can inspire them. Sinek lists common ways to manipulate: lower prices, special offers, fear, peer pressure, big promises and the excitement of something new. They do work in the short term. That is why businesses use them so much.\n\nBut manipulation does not create loyalty. If a shop wins you only with a discount, you will leave the day someone else is cheaper. Sinek describes companies that used discounts so often that customers stopped buying without them.\n\nInspired people behave differently. They stay even when it costs them more, or when a rival has a better offer, because they believe what you believe. That kind of loyalty is worth far more than any short-term trick."
    },
    {
     "emoji": "✈️",
     "title": "Purpose beats resources",
     "body": "In the early 1900s, Samuel Langley seemed sure to build the first powered airplane. He was a respected scientist with government money, well-trained people and newspapers following his every move. Wilbur and Orville Wright had none of that. They paid for their dream with money from their bicycle shop, and nobody on their team had a college degree.\n\nThe difference was their why. Sinek says Langley wanted to be first and famous. The Wrights believed flight could change the world. Their belief kept their small team going through many failures and crashes. In December 1903, they flew. When Langley heard, he gave up, because he could not be famous for being second.\n\nA clear purpose can carry a small, poor team further than a rich team without one."
    },
    {
     "emoji": "🔗",
     "title": "Clarity, discipline, consistency",
     "body": "Sinek says three things must work together. First, clarity of why: the leader must know, and be able to say, why the group exists. Second, discipline of how: the values and habits that guide the group must be lived every day, even when it is hard. Third, consistency of what: everything you say and do should prove what you believe.\n\nThis is how trust grows. People watch whether your actions match your words, again and again. Southwest Airlines is one of his examples. It set out to be the champion of the ordinary person, and its low prices, simple service and fun attitude all pointed back to that purpose.\n\nWhen the what stops matching the why, people notice. They may not be able to explain it, but they feel it, and trust starts to fade."
    },
    {
     "emoji": "🥬",
     "title": "The celery test",
     "body": "Imagine you go to a dinner party and people give you advice. Buy Oreos. Buy M&Ms. Buy rice milk. Buy celery. Each idea is good advice from someone. If you buy everything, you waste money, and nobody can tell what you stand for. But if you know your why is to be healthy, you buy only the rice milk and the celery.\n\nThen something else happens. Anyone who sees your shopping basket can tell at a glance what you value. Your choices make your belief visible.\n\nSinek calls this the celery test. Use it whenever you face many options, ideas or opportunities. Ask: does this fit our why? Say yes to what fits, and no to the rest, even if the rest is popular or works well for others."
    },
    {
     "emoji": "📉",
     "title": "When the why goes fuzzy",
     "body": "Sinek calls it a split. When an organisation is small, the founder's purpose is clear and everyone can feel it. As it grows, more systems and managers come in, and the why can get lost. People begin to focus only on what they do and how much they achieve.\n\nHe points to Walmart. Its founder, Sam Walton, deeply cared about ordinary people and their communities. After he died, the company kept chasing low prices but often lost that heart, and it faced scandals about how it treated workers and towns.\n\nSinek believes leaders must keep the why alive on purpose. Tell the founding story again and again. Pass it on to new people. Hire people who believe what you believe, not only people with the right skills. Growth is good, but only if the purpose grows too."
    }
   ],
   "tryThis": [
    "Write your personal 'why' in one sentence: 'To ___ so that ___.'",
    "Before your next announcement or recruiting talk, start with why it matters, then explain how and what.",
    "Look at one activity in your ministry and ask: does this clearly match our why?"
   ],
   "forUs": "YWAM has a strong why: to know God and to make Him known. But busy days on a base can make it fuzzy. Cleaning, cooking, paperwork and fixing the water pump can feel far from the mission. When we explain the why first, to DTS students, new staff or local partners, these tasks become part of the story. Use the celery test before starting a new project: does it truly fit our calling here in Cambodia? Make sure every ministry, in Siem Reap and Poipet, can say its why in simple words, in both Khmer and English. And when new staff arrive, tell the story of why GP began. People who share the belief will carry it further than any plan.",
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
   "bigIdea": "Do you feel guilty when you say no? Do you carry other people's problems as if they were your own? Christian psychologists Henry Cloud and John Townsend wrote for people like that. They open with a day in the life of a woman who cannot say no to her mother, her children, her boss or her church, and ends each day tired and resentful. Their main idea is that a boundary is like a property line. It shows where you end and someone else begins. God made each of us responsible for our own heart, choices and feelings, but not for everyone else's. Healthy boundaries are not selfish. They are part of being a good steward of the life God gave you, so we can love freely, not out of fear or guilt.",
   "insights": [
    {
     "emoji": "🏡",
     "title": "Know your property line",
     "body": "Think of your life as a yard with a fence around it. Inside your yard are the things you own: your feelings, attitudes, behaviour, choices, values, thoughts, desires, limits and gifts. You are the one responsible for looking after them. Other people own what is inside their yard.\n\nProblems start when we mix this up. We take responsibility for things that are not ours, like another adult's moods or choices. Or we let others take control of what is ours, like our time or our yes. Feelings like resentment are often a warning light that a line has been crossed.\n\nKnowing your property line is the first step. You cannot look after a yard if you do not know where it ends."
    },
    {
     "emoji": "🎒",
     "title": "Boulders and backpacks",
     "body": "Galatians 6 seems to say two opposite things. Verse 2 says to carry each other's burdens. Verse 5 says each person should carry their own load. The authors explain that the Greek words are different. A burden is like a boulder: a crisis too heavy for one person, like a serious illness, a death or a disaster. A load is like a backpack: the normal daily things each person must carry, like their own work, feelings and choices.\n\nLove helps with boulders. If a friend's house floods, we come and help. But if we carry someone's backpack every day, like always finishing their tasks or fixing their problems, they stay weak and we get crushed.\n\nSo ask: is this a boulder or a backpack? The answer shows you when to step in and when to step back."
    },
    {
     "emoji": "🚪",
     "title": "Fences with gates, not walls",
     "body": "Some people hear the word boundaries and imagine a high wall that keeps everyone out. That is not what the authors mean. A healthy boundary is more like a fence with a gate. You let good things in, like love, support and wise advice. You keep harmful things out, like abuse, manipulation or someone's constant anger. You also let bad things out of your own yard, like confessing sin and releasing pain, instead of keeping them locked inside.\n\nBoundaries come in many forms. Words, especially a clear no, are the most basic. Physical distance, time, the help of other people and natural consequences can all work as boundaries too.\n\nThe goal is not to be cold or closed. It is to have enough control over your gate that you can open it to love when it is safe."
    },
    {
     "emoji": "🧩",
     "title": "Four boundary problems",
     "body": "The authors describe four common patterns. 'Compliants' say yes to bad things. They cannot refuse, so they get pulled into things they should avoid. 'Avoidants' say no to good things. They will not ask for help or let people in, even when they truly need it. 'Controllers' do not respect other people's no. Some push openly and hard; others use guilt and quiet pressure. 'Nonresponsives' do not hear the real needs of others.\n\nHere is a simple everyday example. A team member who takes every extra task and never refuses may be compliant. The person who keeps pushing tasks onto them may be a controller.\n\nMost of us lean toward one or two of these patterns. Naming yours honestly is a humble and healthy first step toward change."
    },
    {
     "emoji": "🌾",
     "title": "Let people reap what they sow",
     "body": "One of the book's laws of boundaries is the law of sowing and reaping. Our choices have results. But when someone always steps in to rescue us, the results land on them instead of us.\n\nDr Cloud tells of parents who came to him worried about their grown-up son. He was drifting, with no steady job and no direction, and always needing money. They kept paying his bills and fixing his messes. Cloud told them he agreed there was a problem, but it was mainly theirs, not their son's. As long as they carried the pain of his choices, he felt no pain, so he had no reason to change.\n\nStepping back can feel unloving. But natural consequences are often a teacher God uses. Help in a real crisis, but do not stop people from learning."
    },
    {
     "emoji": "😤",
     "title": "Expect pushback",
     "body": "When you start setting boundaries, not everyone will clap. Some people will be angry, especially those who benefited from you having none. Others will use guilt, reminding you of all they have done for you. You may also feel resistance inside yourself, like fear of being alone or old habits from childhood.\n\nThe authors say this does not mean you are wrong. They give a helpful test: is my boundary hurting this person, or harming them? Hurt is pain that can help someone grow, like the pain of hearing no. Harm is real damage. A boundary that causes hurt but not harm can still be loving.\n\nStay kind, calm and clear. Do not fight back with anger. Find supportive friends who will stand with you while you practise."
    },
    {
     "emoji": "✝️",
     "title": "God has boundaries too",
     "body": "The authors show that boundaries come from God's own character. God is clear about who he is, what he loves and what he will not accept. He gives people real choices, and he lets them face the results of those choices, as he did with Adam and Eve in the garden.\n\nThink of the father in Jesus' story of the prodigal son. He did not chase his son or block the door. He let him go, and let him face hunger and loss. But his heart stayed open, and he ran to welcome him home.\n\nGod respects our no, even when it grieves him. He does not force love. Healthy boundaries do not make us less loving. We are becoming more like the God who made us free and responsible."
    }
   ],
   "tryThis": [
    "Notice one moment this week when you said yes but meant no. Write down what you were afraid of.",
    "Practise a short, kind no that offers what you can do instead, like: I can't this time, but I can help on Friday.",
    "Ask a friend for help with one real boulder instead of carrying it alone."
   ],
   "forUs": "On a mission base, the needs never stop. Someone always needs a ride, a meal, a talk or an extra hand, and it is easy to feel guilty for resting or saying no. Some of us grew up in cultures where saying no to an elder or leader feels impossible. Others say no too quickly and keep everyone outside the fence. Talk as a team about what healthy boundaries look like, such as days off, sleep, family time and quiet evenings, so nobody has to fight for them alone. Leaders can protect their staff's limits instead of testing them. In DTS, help students learn the difference between a boulder and a backpack. Serving out of overflow lasts longer than serving out of exhaustion.",
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
   "bigIdea": "Think back on your life. What do you remember? Probably not ordinary Tuesdays, but a handful of moments: a first day, a wedding, a hard trip, a word of praise that changed you. Brothers Chip and Dan Heath ask why some moments stick with us while others vanish. Their answer is that these defining moments are not just luck. We can create them on purpose. They found that memorable moments usually contain at least one of four elements: Elevation, Insight, Pride and Connection. Teachers, managers, pastors and parents can all use these elements to turn ordinary experiences into ones people treasure. For anyone leading or serving, this book is a gentle reminder. People will forget most of what we planned, but they will remember how a few moments made them feel.",
   "insights": [
    {
     "emoji": "🏔️",
     "title": "Peaks and endings matter most",
     "body": "Psychologists have found that when people look back on an experience, they do not add up every minute. They mostly remember the peak, meaning the best or worst moment, and the ending. The middle fades away. This is called the peak-end rule.\n\nThe Heaths give the example of the Magic Castle Hotel in Los Angeles. Its rooms are plain and its pool is small, yet guests rate it among the best hotels in the city. Why? It creates peaks. Beside the pool is a red phone on the wall. Pick it up and someone answers, 'Popsicle Hotline!' Minutes later a staff member wearing white gloves brings free ice pops on a silver tray.\n\nThe lesson: you do not need to make everything perfect. Many parts can simply be good. Put your energy into a few peaks, and make the ending strong."
    },
    {
     "emoji": "🚀",
     "title": "Elevation: break the script",
     "body": "Elevation moments lift us above the everyday. The Heaths say you can build them in three ways: make the senses come alive, raise the stakes, and break the script, which means doing something people do not expect.\n\nOne example is Signing Day at YES Prep, a group of schools in Houston that serve students from low-income families. Every spring, the graduating students stand on stage in front of a huge crowd and announce which college they will attend. Younger students watch, cheer and imagine their own future day. What could have been a letter in the mail becomes a celebration.\n\nAnother example is a teacher who turned the study of a novel into a full mock trial, with students acting as lawyers and witnesses.\n\nElevation does not need to be expensive. A small surprise, a ceremony or a celebration can make an ordinary day unforgettable."
    },
    {
     "emoji": "💡",
     "title": "Insight: trip over the truth",
     "body": "Some moments suddenly change how we see ourselves or the world. The Heaths say you can help these happen by letting people trip over the truth: meet a problem face to face, in a way that is quick and hard to ignore.\n\nThey tell how Dr Kamal Kar helped villages in Bangladesh and other countries stop open defecation. Instead of giving lectures, his team walked with villagers to the places where people relieved themselves. Later, they asked for a glass of drinking water, touched a hair to human waste, dipped it in the glass and offered it around. Nobody would drink. Then the villagers realised that flies were doing the same thing to their food every day. Many villages decided to build toilets themselves.\n\nThe second path to insight is stretching: giving people a real challenge, with support, so they discover what they can do."
    },
    {
     "emoji": "🏅",
     "title": "Pride: celebrate the wins",
     "body": "We feel proud when others recognise us and when we reach milestones. The Heaths found a big gap here: many managers believe they often show appreciation, while most of their staff feel they rarely receive it.\n\nGood recognition is personal and specific. It names exactly what someone did and why it mattered. The authors also describe the gratitude letter from positive psychology. You write to someone who changed your life and read it to them in person. It becomes a powerful moment for both people.\n\nMilestones help too. Long goals can feel endless, so break them into smaller steps you can celebrate. Running programmes like Couch to 5K turn one big goal into weekly wins, and karate's coloured belts do the same.\n\nFinally, the Heaths encourage people to practise courage in small ways, so they are ready when a big moment comes."
    },
    {
     "emoji": "🤝",
     "title": "Connection: share the moment",
     "body": "Moments become powerful when we share them. The Heaths name a few ways to build connection. One is to create a shared moment, where a group experiences something together, like a ceremony, a challenge or a celebration. Another is to invite a group into a shared struggle. People who work hard together toward a meaningful goal often become very close.\n\nA third way is about one-to-one relationships. Research on responsiveness shows that people feel close when they feel understood, valued and cared for. The authors describe hospitals where staff began asking patients 'What matters to you?' and not only 'What is the matter with you?' That simple question helped nurses and doctors see the person, not just the illness, and patients felt truly heard.\n\nConnection moments do not need big budgets. They need attention, presence and a reason to be together."
    },
    {
     "emoji": "🚪",
     "title": "Don't waste transitions",
     "body": "Some times in life naturally call for a moment. The Heaths point to three: transitions, like a first day, a graduation or a goodbye; milestones, like finishing a big project; and pits, the hard and painful times. Yet many organisations let these pass with paperwork and silence.\n\nThey describe how the tractor company John Deere redesigned the first day for new staff in Asia. Before you arrive, a friendly teammate contacts you. On the day, your name is on a welcome screen, your desk is ready, and you receive a small gift and a message from the company's leader about why the work matters. You feel welcomed, not just processed.\n\nIn the pits, simply showing up for someone can become a moment they never forget. Look at the transitions coming up and ask: how can we mark this, so people feel seen?"
    }
   ],
   "tryThis": [
    "Plan one small surprise for a teammate this week that breaks the normal routine.",
    "Write a short, specific thank-you note to someone, naming exactly what they did and why it mattered.",
    "Look at your calendar for the next month and find one transition you can turn into a moment."
   ],
   "forUs": "YWAM life is full of natural moments: a DTS student's first day, the send-off before outreach, the return, graduation, a new staff member arriving or a long-term worker leaving. These are gifts, so let's not rush past them. Mix cultures in how we celebrate: Khmer hospitality, food and blessing alongside other traditions. Honour people in ways that fit them. For some, public praise feels great; for others, a quiet word means more. Remember the pits too. When a teammate is sick, grieving or far from home, showing up matters. And many spiritual moments are also defining moments, like a night of worship or a breakthrough on outreach. Make space for God to meet people, and do not fill every minute with programme.",
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
   "bigIdea": "Most leaders spend their energy on being smart: strategy, marketing, finance and technology. Patrick Lencioni says this is only half the picture. The bigger advantage, and the one most groups ignore, is organisational health. A healthy organisation has little politics, little confusion, high morale, high productivity and low turnover of good people. Lencioni argues that health is simple, open to almost anyone, and costs no money. Yet leaders skip it, because it feels soft, takes courage and is hard to measure. He offers four disciplines to get there: build a cohesive leadership team, create clarity, overcommunicate clarity and reinforce clarity. For anyone leading a team, a school or a ministry, this is hopeful news. You do not need more money or cleverer people. You need unity, clarity and the discipline to keep going.",
   "insights": [
    {
     "emoji": "🩺",
     "title": "Health beats smarts",
     "body": "Lencioni compares a smart organisation with a healthy one. A smart one is good at strategy, marketing, finance and technology. A healthy one is whole: its people trust each other and are clear about what matters. The healthy one uses all the intelligence it already has. The unhealthy one wastes it through politics, confusion and mistrust.\n\nSo why do leaders ignore health? He names three biases. A sophistication bias: health seems too simple to be important. An adrenaline bias: leaders are too busy putting out fires to slow down. A quantification bias: health is hard to measure in numbers.\n\nHealth is the multiplier. Smart plans fail in an unhealthy team. A healthy team keeps getting smarter, because people speak up, learn from mistakes and work together."
    },
    {
     "emoji": "🤝",
     "title": "Step 1: Build a cohesive leadership team",
     "body": "The first discipline is to make the leadership team truly united. Lencioni uses the five behaviours from his earlier book on teams. Leaders build trust, where they can be open about weaknesses and mistakes. With trust, they can have healthy conflict, arguing honestly about ideas, not attacking people. Then they commit to decisions, even if they first disagreed. They hold each other accountable. And they focus on shared results, not just their own department.\n\nHe also talks about the 'first team'. Leaders often feel more loyal to the team they lead than to the team of their peers. But the leadership team must come first. Otherwise each leader protects their own area, and the organisation splits into silos.\n\nIf the people at the top are divided, everyone below feels it."
    },
    {
     "emoji": "❓",
     "title": "Step 2: Create clarity",
     "body": "The second discipline is to get leaders fully aligned on six simple questions. Why do we exist? How do we behave? What do we do? How will we succeed? What is most important, right now? Who must do what?\n\nLencioni gives careful advice on each one. For example, on behaviour, he separates true core values from other kinds: aspirational values you wish you had, permission-to-play values that are just the minimum, and accidental values that grew without anyone choosing them. Only a few real core values should guide decisions.\n\nThe answers do not need to be clever or polished. They need to be true, clear and agreed by the whole leadership team. When leaders answer these together, a lot of confusion lower down disappears, because people know what to do without asking every time."
    },
    {
     "emoji": "🎯",
     "title": "Have one top priority",
     "body": "The fifth question, what is most important right now, gets special attention. Lencioni calls the answer a thematic goal, or rallying cry. It is one single priority that the whole leadership team owns for a season, usually somewhere between three and twelve months. It is not a slogan. It is a shared focus.\n\nUnder the thematic goal are a few defining objectives, the concrete pieces that will achieve it. Alongside them are standard operating objectives, the ongoing work that must keep going, like finances or quality.\n\nWhy only one? Because when everything is a priority, nothing is. Leaders of different departments each push their own needs, and staff get pulled in many directions. A single rallying cry gives everyone permission to say no to good things that do not serve the main thing right now."
    },
    {
     "emoji": "📣",
     "title": "Step 3: Overcommunicate clarity",
     "body": "Leaders often say something once and assume everyone understood. Lencioni says people need to hear a message many times before they believe it is real. He suggests leaders see themselves as chief reminding officers. Repeating yourself is not boring. It is part of the job.\n\nHe also recommends cascading communication. At the end of a leadership meeting, the leaders agree together on the key messages to pass on. Then each leader shares the same message with their own team within a day or two. That way, staff in every part of the organisation hear the same thing, from their own leader, at about the same time.\n\nThis builds trust. People stop guessing what leaders really mean. A message becomes real when people hear it from many directions, over months, not just once."
    },
    {
     "emoji": "⚙️",
     "title": "Step 4: Reinforce clarity",
     "body": "The fourth discipline is to build clarity into the everyday human systems, so it does not depend only on leaders reminding people. Lencioni points to hiring, welcoming new people, managing performance, rewards and recognition, and even letting people go.\n\nFor example, when hiring, use your core values to decide who fits, not only skills. When welcoming new people, teach them the answers to the six questions from the start. When reviewing work, keep forms simple and focus on real conversations. When thanking people, praise behaviour that matches your values. And if someone keeps acting against the core values, have the courage to let them go.\n\nLencioni warns against too much structure. Systems should be simple and helpful. Their job is to make the right behaviour normal, so the culture holds even when leaders are busy."
    },
    {
     "emoji": "🗓️",
     "title": "Meetings matter",
     "body": "Lencioni says meetings are where health is built or lost. Many meetings are boring and confusing because they mix everything together. He suggests four kinds. A daily check-in of about five minutes, often standing, to share what is happening today. A weekly tactical meeting that starts with a quick round of everyone's top priorities, then sets the agenda from what comes up. Topical meetings of a few hours to dig deep into one big strategic issue. And a quarterly review away from the office, to step back and look at the bigger picture.\n\nThe key is not to mix tactical and strategic topics. When you do, the urgent pushes out the important.\n\nGood meetings should also include healthy conflict. If nobody ever disagrees, the meeting is probably avoiding the real issues."
    }
   ],
   "tryThis": [
    "Try answering the six questions for your ministry team in one sentence each.",
    "Agree with your team on one top priority for the next three months.",
    "Pick one key message and repeat it clearly at least three times this week."
   ],
   "forUs": "A YWAM base can have many ministries, each doing good work but not always pulling in the same direction. Clarity helps everyone, especially staff working in a second language. Simple, repeated messages beat long, clever ones. Leaders from different cultures may avoid conflict in different ways, so building trust is step one. Make room for honest disagreement in leadership meetings, in ways that feel safe for Khmer and international leaders alike. Ask your leaders the six questions together, and pray over the answers. Then choose one rallying cry for the season, like preparing well for the next DTS. When the leadership team is united, the whole base feels safer and more peaceful.",
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
   "bigIdea": "Have you worked with one leader who made you feel smart, and another who made you feel small? Liz Wiseman, a former executive at Oracle, studied this question through research on more than 150 leaders across four continents. She found two kinds. 'Diminishers' drain intelligence and energy from the people around them. Deep down, they believe only they can figure things out. 'Multipliers' bring out more intelligence and effort than people knew they had. They believe people are smart and will work it out. Her research found that Multipliers got roughly twice as much from their people as Diminishers did. The difference is not mainly about skill. It is about what a leader believes about others, and five habits that grow from that belief. For anyone leading a team or a school, this is both a warning and an invitation.",
   "insights": [
    {
     "emoji": "🧲",
     "title": "Talent Magnet, not Empire Builder",
     "body": "Empire Builders gather talented people, but mainly to make themselves look strong. They hold on to resources, keep good people in a small box and underuse them. Talent Magnets attract talent and use it fully. People grow quickly around them, so more talented people want to join.\n\nWiseman describes four habits of a Talent Magnet. Look for talent everywhere, not only in the obvious places. Find each person's 'native genius', the thing they do easily, freely and well, often without even noticing. Use people to their fullest by connecting them with opportunities that fit that genius. And remove the blockers, including difficult people who hold the team back, and sometimes even yourself.\n\nWhen people leave a Talent Magnet, they often move on to bigger roles. Good leaders see that as success, not loss, and it attracts even more talent."
    },
    {
     "emoji": "🕊️",
     "title": "Liberator, not Tyrant",
     "body": "Tyrants create fear. People play it safe, hide mistakes and say what the boss wants to hear. Their best thinking stays locked away. Liberators create a calm, safe space where people can think, speak and try. But it is not a soft place. Liberators also expect people's best work. Safety and challenge go together.\n\nOne practical tool Wiseman shares is to talk less and listen more. Some leaders give themselves a few imaginary poker chips for a meeting. Every comment costs a chip, so they must choose carefully when to speak, which leaves room for others.\n\nLiberators also talk openly about their own mistakes. This shows people that failing and learning is normal. When the leader admits mistakes, others feel free to take risks, test new ideas and learn fast, without fear of being shamed."
    },
    {
     "emoji": "🧗",
     "title": "Challenger, not Know-It-All",
     "body": "Know-It-Alls think their job is to have all the answers. They give instructions and show off what they know, so the team stops thinking for itself. Challengers think their job is to ask the right questions. They point to an opportunity that stretches people beyond what they believe they can do.\n\nWiseman describes three moves. Seed the opportunity: help people see a need or a challenge for themselves, instead of just telling them. Lay down a challenge: set a stretching goal and ask hard questions that you do not know the answer to. Generate belief: show that it is possible, perhaps by starting with a small win or a clear first step.\n\nA Challenger does not hand out the plan. A Challenger shows what is possible and asks how the team might get there. The team does the hard thinking, and grows through it."
    },
    {
     "emoji": "🗣️",
     "title": "Debate Maker, not Decision Maker",
     "body": "Decision Makers decide alone or with a small inner circle. Everyone else hears about it later and has to guess why. Debate Makers bring the right people together to debate an important issue properly before a decision is made.\n\nWiseman describes three steps. Frame the issue: explain the question, why it matters and how the decision will be made. Spark the debate: ask for evidence, invite different views and make it safe to disagree, even with the leader. Drive a sound decision: be clear about who will decide, then explain the final choice and the reasons behind it.\n\nNot every small decision needs a big debate. But for important ones, debate helps the leader learn what the team knows. It also builds ownership. People who helped think through a decision understand it, and they are much more likely to carry it out well."
    },
    {
     "emoji": "🌱",
     "title": "Investor, not Micromanager",
     "body": "Micromanagers give someone a task, then jump back in, check every detail and take control when things get hard. Investors give real ownership and then support people to succeed. Wiseman says they do three things. Define ownership: name who is in charge and give them the bigger part of the job. She describes giving someone 51 percent of the vote, so they know the final call is theirs. Invest resources: teach, coach and provide what they need. Hold people accountable: when they bring a problem, ask good questions and then give the problem back.\n\nThat giving back is the key. Many leaders take a problem off someone's desk just to be helpful. But then that person never grows. An Investor helps, and then makes clear that the problem still belongs to them, and that they believe they can solve it."
    },
    {
     "emoji": "🙈",
     "title": "Watch for accidental diminishing",
     "body": "This may be the most humbling part of the book. Many Diminishers do not mean to diminish anyone. They have good hearts and good intentions. Wiseman calls them accidental Diminishers.\n\nHere are some examples she describes. The idea person has so many ideas that the team cannot keep up and stops offering their own. The leader who is always on, full of energy and talk, leaves little space for others. The rescuer jumps in so quickly to help that people never learn to solve hard things. The pacesetter moves so fast that others give up trying to keep up. Even a constant optimist can make people feel their real worries are not heard.\n\nThe fix is often simple. Talk less, ask more and wait longer. Ask your team honestly how your style affects them. Most leaders can grow toward being Multipliers with practice."
    }
   ],
   "tryThis": [
    "In your next meeting, ask questions instead of giving your opinion first.",
    "Give one task fully to a teammate, and resist the urge to take it back.",
    "Ask someone, 'What do you think we should do?' and wait for the full answer."
   ],
   "forUs": "On a mission base, older or more experienced staff can easily become the answer people without meaning to. In Khmer culture, younger staff may stay quiet out of respect, so leaders need to invite ideas on purpose, maybe in small groups or one-to-one rather than in front of everyone. Look for the native genius in each staff member and student, not only the gifts that are easy to see. Hand real responsibility to local staff and students, and when they bring a problem, gently give it back with your support. Watch for accidental diminishing too, like rescuing too fast. Jesus did this with his disciples: he sent them out before they felt ready, and trusted them to grow.",
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
   "bigIdea": "Some conversations matter much more than others. The authors call them crucial conversations: talks where the stakes are high, opinions differ and emotions are strong. Think of asking a leader to change a decision, giving hard feedback to a friend, or talking with your spouse about money. Sadly, these are the moments when most of us do our worst. We either go quiet and avoid the issue, or we push, attack or try to control. The authors, a team of researchers and trainers, studied people who handle these moments well. They found that these people were not just born that way. They use skills that anyone can learn. The goal is dialogue: a free and honest flow of meaning between people. Better dialogue leads to better decisions, stronger teams and healthier relationships.",
   "insights": [
    {
     "emoji": "🏊",
     "title": "Fill the 'pool of shared meaning'",
     "body": "Everyone comes to a conversation with their own facts, feelings, ideas and experiences. The authors call this a person's meaning. Dialogue happens when each person adds their meaning to a shared pool. The bigger and fuller the pool, the better the decisions the group can make.\n\nWhen people stay silent or try to force their view, important meaning stays out of the pool. Decisions are then made with half the information. People also commit less, because they never felt heard.\n\nHere is a simple everyday example. A team plans an outreach trip. One member knows a road floods in the rainy season, but stays quiet because the leader seems so sure. The team goes anyway and gets stuck. The information existed; it just never reached the pool.\n\nWhen everything is in the pool, people act with more unity, because they own the decision together."
    },
    {
     "emoji": "❤️",
     "title": "Start with heart",
     "body": "The first skill is about yourself, not the other person. In a heated moment, our motives slowly change without us noticing. We start wanting to win, to punish, to look good or to keep the peace at any cost.\n\nSo before and during a crucial conversation, ask yourself some questions. What do I really want for myself? What do I really want for the other person? What do I really want for our relationship? And how would I behave if I truly wanted these things?\n\nThe authors also warn against the 'fool's choice'. This is the belief that you must choose between being honest and being kind, or between speaking up and keeping a friend. Skilled people refuse that choice. They look for a way to be completely honest and fully respectful at the same time. Starting with heart keeps your focus on what truly matters."
    },
    {
     "emoji": "👀",
     "title": "Watch for safety",
     "body": "While people talk, skilled people watch two things at once: the content of the conversation and the conditions. The key condition is safety. When people feel unsafe, they move to silence or violence.\n\nSilence can look like masking (hiding real feelings or using sarcasm), avoiding (changing the subject) or withdrawing (leaving the conversation completely). Violence can look like controlling (forcing your view or talking over people), labelling (putting people in boxes) or attacking (insulting or threatening).\n\nThe authors also ask you to look at yourself. Each of us has a style under stress, a usual way we react when things heat up. Some of us go quiet; some of us get loud. Knowing yours helps you catch it early.\n\nWhen you notice silence or violence, take it as a signal. Step out of the topic for a moment and rebuild safety before going on."
    },
    {
     "emoji": "🛡️",
     "title": "Make it safe",
     "body": "Safety rests on two things. Mutual purpose: the other person believes you care about their goals, not just your own. Mutual respect: they believe you respect them as a person. If either one is missing, the conversation quickly turns defensive.\n\nThe authors give practical tools. If you have truly hurt someone, apologise sincerely. If someone has misunderstood your purpose, use contrasting: first say what you do not mean, then what you do mean. For example, you might say you do not think their work is poor, because it is good, and you only want to talk about one missed deadline.\n\nWhen goals really clash, commit to finding a shared purpose. Look for the deeper goal behind each person's demand, then brainstorm new options together. Often both people want the same deeper thing, even when their first ideas look opposite."
    },
    {
     "emoji": "📖",
     "title": "Master your stories",
     "body": "The authors describe a path to action. We see or hear something. We quickly tell ourselves a story about what it means. That story creates a feeling, and the feeling drives what we do. We often say other people make us angry, but really it is the story we told ourselves.\n\nIn one example, a woman's coworker presents their shared project to the boss without her. She quickly decides he is stealing the credit, feels angry and starts acting coldly toward him. But she does not yet know the facts.\n\nWatch for three clever stories. The victim story says it is not my fault. The villain story says they are bad and want to hurt me. The helpless story says there is nothing I can do. To get back to the truth, separate facts from your story, and ask why a reasonable, decent person might do this."
    },
    {
     "emoji": "🧭",
     "title": "Speak honestly, listen deeply",
     "body": "When it is your turn to speak about something sensitive, the authors offer five steps. Share your facts, the least controversial part. Tell your story, what you are starting to conclude. Ask for the other person's view. Talk tentatively, as a possible story, not a final truth. And encourage them to test your view or disagree.\n\nWhen it is your turn to listen, be truly curious. Ask questions. Mirror their feelings by gently naming what you notice. Paraphrase what they said in your own words. If they are still silent, you can prime them by kindly guessing what they might be thinking.\n\nFinally, move to action. Decide how the decision will be made. Then agree clearly on who will do what by when, and how you will follow up. Many good conversations fail simply because nobody leaves knowing the next step."
    }
   ],
   "tryThis": [
    "Before a hard talk, write down what you really want for you, for them and for the relationship.",
    "Next time you feel upset, separate the facts from the story you are telling yourself.",
    "Practise one contrasting sentence: 'I don't want ___. I do want ___.'"
   ],
   "forUs": "Across cultures, crucial conversations look different. Many Khmer staff prefer indirect, private conversations that protect face, while some international staff are very direct. Neither is wrong, but each can make the other feel unsafe. Choose the right setting, start with respect, and maybe use a trusted go-between when that fits. Silence can look like agreement when it is not, so gently check understanding, especially when people are speaking in a second language. In DTS and on outreach teams, tension often builds quietly, so name it early and kindly. And check your stories before you act on them. Speaking the truth in love, as Paul writes in Ephesians, is exactly what this book is trying to teach.",
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
   "bigIdea": "Patrick Lencioni tells most of this book as a story. Jeff Shanley leaves a job in Silicon Valley to lead his uncle Bob's construction company in Napa Valley, California, as Bob steps back for health reasons. Jeff soon learns that the company has two big new projects coming, and not enough strong team players to deliver them. Working with Clare, who leads the people side of the company, and Bobby, who runs the building work, Jeff asks a simple question. Why are some people great teammates, while others make teamwork hard? Together they discover three virtues: humble, hungry and smart, meaning people smart. When someone has all three, teamwork comes much more easily. After the story, Lencioni explains the model and how to use it in hiring, coaching and building a healthy culture.",
   "insights": [
    {
     "emoji": "🙇",
     "title": "Humble",
     "body": "Lencioni sees humility as the most important of the three virtues. Humble team players care more about the team than about their own image. They share credit, point to the group's success and praise others easily. They are not afraid to admit when they are wrong.\n\nHe warns about two problems. The first is obvious: arrogance, where people make everything about themselves. The second is quieter: people who put themselves down so much that they do not share their gifts or speak up. They may look humble, but they still keep the focus on themselves, and the team loses what they could give.\n\nA simple everyday example: after a successful event, a humble team member talks about what the team did and thanks the people who worked behind the scenes. Real humility means seeing your gifts clearly, and using them for others."
    },
    {
     "emoji": "🔥",
     "title": "Hungry",
     "body": "Hungry people are self-motivated and hard-working. They always want to learn more, do more and take on more responsibility. They do not need a manager to push them. They think about the next step and how they can help the team move forward.\n\nBut Lencioni is careful here. Hunger can become unhealthy if it is all about personal success, or if it turns into overwork that harms health and family. Healthy hunger is for the team's mission, not just for one person's career.\n\nHere is a simple everyday example. Two staff members notice the kitchen is a mess after an event. One walks past because it is not their job. The other quietly starts cleaning and asks a friend to help. The second person shows healthy hunger.\n\nHunger also shows in small things: coming prepared, following up and caring about results as if they were your own."
    },
    {
     "emoji": "🧠",
     "title": "People smart",
     "body": "This kind of smart is not about IQ or education. It is common sense about people. People-smart team players read a room well. They notice how others feel, listen carefully and understand how their words and actions affect people. They know when to speak, when to stay quiet and how to say hard things in a way that can be heard.\n\nLencioni says this is similar to emotional intelligence, but simpler and more practical. Someone can be very clever and still weak in this area. They may say something true at the wrong moment, or miss that a teammate is struggling.\n\nIn a team, people smarts helps the other two virtues work well. A humble, hungry person without people smarts can still cause hurt and confusion without meaning to. People-smart teammates help others feel respected, and that helps trust grow across the whole team."
    },
    {
     "emoji": "⚠️",
     "title": "Missing one virtue is a problem",
     "body": "Lencioni describes what happens when people have only one or two of the virtues. With only one, the problems are easy to see. The 'pawn' is only humble and often gets left out. The 'bulldozer' is only hungry and pushes everyone aside. The 'charmer' is only smart and is fun to be with, but adds little.\n\nWith two virtues, the problems are harder to spot. Humble and hungry but not smart is the 'accidental mess-maker', who means well but leaves hurt feelings behind. Humble and smart but not hungry is the 'lovable slacker', who is pleasant but only does what is asked. Hungry and smart but not humble is the 'skillful politician', who is clever and ambitious but serves themselves.\n\nThe politician is the most dangerous, because they look great to leaders. Watch how they treat people who cannot help their career."
    },
    {
     "emoji": "🔎",
     "title": "Hire for the three virtues",
     "body": "Lencioni gives practical advice for interviews. Ask questions that reveal the virtues, not only skills. For humility, ask about their biggest achievement and their biggest mistake, and notice whether they say I or we. For hunger, ask about the hardest they have ever worked. For people smarts, ask how others would describe them.\n\nIf an answer is vague, ask the same question again in a different way. Interview as a team, then compare notes. Spend time together outside the formal interview, like sharing a meal or running errands, and watch how they treat a waiter or a stranger. You can even ask candidates to do some real work with the team.\n\nHe also suggests being very honest about what your team expects. People without these virtues often decide not to join once they hear how much humility and hard work the culture requires."
    },
    {
     "emoji": "🌱",
     "title": "Everyone can grow",
     "body": "Lencioni insists the three virtues are not fixed personality traits. They are habits that people can learn through honest feedback, coaching and practice. He suggests leaders use the model with current staff too, not only new hires. A simple self-assessment asks people to rate how often they show behaviours connected to each virtue.\n\nWhen someone is weak in one virtue, the leader's job is to name it kindly and clearly, and then help them grow. Regular reminders, honest conversations and real examples all help. If a person truly will not change after real effort, they often discover the team is not a good fit for them.\n\nLeaders must also model all three themselves. If a leader is proud, lazy or careless with people, the virtues become empty words. When leaders live them, the whole culture shifts, and people begin to expect them from one another."
    }
   ],
   "tryThis": [
    "Rate yourself from 1 to 3 on humble, hungry and smart. Which is your weakest?",
    "Ask a trusted teammate which of the three virtues they see most and least in you.",
    "Do one practical thing this week to grow your weakest virtue."
   ],
   "forUs": "Humility is already a core value in YWAM and in Khmer culture, which is a great start. But humility without hunger can turn into waiting to be told, and hunger without people smarts can feel pushy across cultures. People smarts also means learning what respect looks like for someone from a different background, like how to greet an elder or when to speak directly. Use these three words when inviting new staff, building outreach teams and coaching DTS students. They are simple enough to remember in Khmer and English. Leaders can model them first, by serving quietly and asking for feedback. Jesus showed all three: he served humbly, worked with purpose and understood people deeply.",
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
   "bigIdea": "Most of us try to change our lives with big goals and a lot of willpower. James Clear says the problem is usually not you. The problem is your system. Small habits, repeated every day, add up like interest in a bank account. Get 1% better each day and over a year the change is huge. Get 1% worse each day and the slide is just as big. In this book Clear explains how habits work, why identity matters more than goals, and four simple laws that make good habits easier and bad habits harder. If you lead or serve others, this matters twice: your own habits shape your life, and the systems you build shape your team's life too.",
   "insights": [
    {
     "emoji": "📈",
     "title": "1% better is a big deal",
     "body": "Improving by 1% a day does not feel like much on a Tuesday. But Clear does the maths: 1% better every day for a year makes you about 37 times better. 1% worse every day takes you almost down to zero.\n\nThe hard part is that results come late. Clear uses the picture of an ice cube in a cold room. The room warms one degree, then another, and nothing seems to happen. Then, at the melting point, the ice starts to melt. The earlier degrees were not wasted; they were building up. Clear calls the feeling of doing the work but seeing nothing the 'valley of disappointment'.\n\nSo when progress feels slow, do not quit. Look at your direction, not only your results. Are your daily habits moving you toward the person you want to be?"
    },
    {
     "emoji": "🧱",
     "title": "Fix the system, not the goal",
     "body": "Goals are about the results you want. Systems are the daily processes that lead to those results. Clear points out that winners and losers usually have the same goals. So the goal cannot be what makes the difference. The system is.\n\nHe tells the story of British Cycling. For about a hundred years British riders won very little. Then a new coach, Dave Brailsford, looked for tiny 1% improvements everywhere: more comfortable bike seats, the best pillows for good sleep, even teaching riders to wash their hands well so they got sick less. Each change was small. Together they changed everything, and within a few years British riders were winning the Tour de France and Olympic gold.\n\nClear also notes that a goal can only make you happy after you reach it, and then you may stop. A system keeps you going. Fall in love with the process, and the results will follow."
    },
    {
     "emoji": "🪪",
     "title": "Become the kind of person who…",
     "body": "Clear describes three layers of change. The outer layer is outcomes: what you get. The middle layer is process: what you do. The inner layer is identity: what you believe about yourself. Most people start from the outside. Clear says the strongest habits start from the inside.\n\nImagine two people trying to stop smoking. Someone offers them a cigarette. The first says, 'No thanks, I'm trying to quit.' The second says, 'No thanks, I'm not a smoker.' The first person still sees themselves as a smoker who is fighting it. The second has a new identity, and that makes the choice much easier.\n\nEvery action is like a vote for the kind of person you are becoming. One run does not make you a runner, and one missed day does not ruin you. But each vote counts. So first decide who you want to be. Then prove it to yourself with small wins, one vote at a time."
    },
    {
     "emoji": "🔁",
     "title": "The four laws",
     "body": "Clear explains that every habit runs in a loop of four steps: a cue, a craving, a response and a reward. From this come his four laws. Make it obvious, so you notice the cue. Make it attractive, so you want to do it. Make it easy, so little stands in your way. Make it satisfying, so your brain wants to do it again. To break a bad habit, turn each law around: make it invisible, unattractive, difficult and unsatisfying.\n\nOne story from the book shows the second law. A student in Ireland connected his exercise bike to his laptop and TV so that his shows would only play while he was cycling fast enough. He joined something he needed to do with something he loved to do. Clear calls this 'temptation bundling'.\n\nWhen a habit is not sticking, ask which of the four laws is missing. That usually shows you what to fix."
    },
    {
     "emoji": "⏱️",
     "title": "The two-minute rule",
     "body": "When we start a new habit, we often aim too high. Clear's answer is the two-minute rule: shrink the habit until you can do it in two minutes or less. 'Read before bed each night' becomes 'read one page'. 'Go for a run' becomes 'put on my running shoes'. 'Read the Bible every day' could become 'open my Bible and read one verse'.\n\nThis can feel silly, but there is a reason. A habit must be started before it can be improved. First you master the skill of showing up. Once showing up is normal, it is easy to do a little more.\n\nClear tells of one reader who lost a lot of weight this way. At first he went to the gym every day but did not let himself stay longer than five minutes. He was building the identity of someone who goes to the gym. Later he added more. Start so small that you cannot say no."
    },
    {
     "emoji": "🧲",
     "title": "Stack it and shape your space",
     "body": "Two tools make good habits more obvious. The first is habit stacking, which builds on the work of researcher BJ Fogg. You attach a new habit to one you already do every day. The formula is simple: after my current habit, I will do my new habit. For example, after I pour my morning coffee, I will pray for one person. The old habit becomes the reminder for the new one.\n\nThe second tool is your environment. Clear says we often think we lack willpower, when really our space is working against us. He describes a hospital cafeteria where a doctor changed where the drinks were placed. Bottled water was put near the cash registers and in baskets around the room. With no new rules or messages, water sales went up and soda sales went down.\n\nMake the good choice easy to see, and the bad choice hard to reach."
    }
   ],
   "tryThis": [
    "Pick one habit and shrink it to a two-minute version you can do today.",
    "Write one habit stack: 'After I ___, I will ___.' Then do it every day this week.",
    "Never miss twice: if you skip a day, make sure you do it the next day."
   ],
   "forUs": "On a mission base, life is already full of rhythms: chores, cooking, worship, classes, outreach. You could stack prayer onto your morning coffee, Khmer or English practice onto lunch, or a quick check-in with your team onto the end of a work duty. In a DTS, staff can help students choose one small habit, like reading one chapter a day, instead of a big plan they will drop after a week. Teams can shape their space too: a Bible on the table, phones away during meetings, the cafe's cleaning checklist where everyone can see it. And remember identity. We are not trying to earn God's love with good habits. We are already his children, and small daily choices are a way to live like it. The Habit Tracker in this app is built for exactly this.",
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
   "bigIdea": "We make decisions every day, from small ones to choices that shape our whole lives. Most of us trust our gut, or we make a quick list of pros and cons. Chip and Dan Heath say that is not enough. Research shows our minds fall into the same four traps again and again: we see too few options, we look only for proof that we are right, we let short-term feelings take over, and we feel too sure about the future. The Heaths offer a simple four-step process called WRAP: Widen your options, Reality-test your assumptions, Attain distance before deciding, and Prepare to be wrong. It will not make every choice perfect. But for anyone who leads a team or guides other people, it makes wise choices much more likely.",
   "insights": [
    {
     "emoji": "🧠",
     "title": "The four villains",
     "body": "The Heaths say bad decisions usually come from four 'villains'. Narrow framing means seeing only one or two options. Confirmation bias means looking for information that agrees with what we already want. Short-term emotion means feelings in the moment push us around. Overconfidence means being too sure about how the future will go.\n\nThey compare our attention to a spotlight. It shows what is inside the circle of light very clearly, but we forget how much is outside it. One example from the book is the food company Quaker Oats, which paid a huge amount of money to buy the drink brand Snapple. The leaders were confident it would work. It did not, and a few years later they sold it for a small part of what they paid.\n\nOnce you can name them, you can build steps into your decisions to fight each one."
    },
    {
     "emoji": "🔭",
     "title": "W — Widen your options",
     "body": "Watch out for 'whether or not' decisions, like 'Should I take this job or not?' The Heaths share research showing that teenagers often decide this way, but so do many organisations. One study of business decisions found that choices made with only one option on the table failed far more often than choices where people compared two or more.\n\nA useful tool is the 'vanishing options' test. Imagine that you cannot choose any of the options you are thinking about now. What would you do then? This pushes your mind to search for something new, and often a better third option appears.\n\nAnother tool is to think about opportunity cost: what else could I do with this money or time? Where you can, try 'multitracking', which means exploring more than one option at the same time instead of betting everything on one."
    },
    {
     "emoji": "🧪",
     "title": "R — Reality-test your assumptions",
     "body": "Once you have options, you need honest information about them. The problem is confirmation bias: we ask questions that will give us the answer we want. The Heaths suggest a better question: what would have to be true for this option to be the best one? Then go and check whether those things are true.\n\nThey also suggest asking questions that make it easy for people to share bad news. The book describes a study about selling a used music player that had a hidden problem. Buyers who asked a general question rarely heard about the problem. Buyers who asked directly, 'What problems does it have?', heard the truth much more often.\n\nFinally, where you can, test small before you commit big. The authors call this 'ooching'. For example, someone thinking about a new career can spend a few days with a person who already does that job before quitting their own."
    },
    {
     "emoji": "🏔️",
     "title": "A — Attain distance before deciding",
     "body": "When we feel strongly, the short term looks huge and the long term looks small. The Heaths offer simple tools to get some distance. One is the 10/10/10 test from writer Suzy Welch: how will I feel about this choice in 10 minutes, in 10 months and in 10 years? Another is to ask: what would I tell my best friend to do?\n\nThe book tells a famous story from the computer chip company Intel. In the 1980s the company was losing money on memory chips, which had been its main business. Leader Andy Grove asked his partner Gordon Moore what new leaders would do if the two of them were replaced. Moore said new leaders would get out of memory chips. So Grove asked why they should not do it themselves. They did, and Intel grew stronger.\n\nDistance helps you remember your core priorities, so you choose by what matters most, not by your mood."
    },
    {
     "emoji": "🛟",
     "title": "P — Prepare to be wrong",
     "body": "We cannot know the future, but we often act as if we can. The Heaths suggest you 'bookend' the future: think about a range of outcomes, from very good to very bad, and prepare for both.\n\nOne strong tool is the 'premortem', an idea from psychologist Gary Klein. Before a project starts, the team imagines that it is a year later and the project has failed. Each person writes down why it failed. This makes it safe to share worries that people might otherwise keep quiet, and it shows problems while there is still time to fix them.\n\nAnother tool is setting 'tripwires'. These are clear signals or dates that wake you up and tell you it is time to stop and decide again. A simple everyday example: a team agrees that if no teacher is found by March, they will change the plan. Without tripwires, we often keep going without thinking, long after we should have stopped."
    },
    {
     "emoji": "⚖️",
     "title": "Fair process matters",
     "body": "When a decision affects a group, how you decide matters a lot. The Heaths explain that people accept hard decisions much more easily when they feel the process was fair. That means they were listened to, they could share their views, and they understand the reasons for the final choice.\n\nA simple everyday example: a team leader needs to change the weekly schedule. If she announces it with no explanation, people may complain for months. If she first asks for ideas, explains what she has to balance, and then shares the reasons for her choice, most people will accept it, even those who wanted something different.\n\nUsing WRAP together also helps the group. It turns a fight between two people's opinions into a shared search for the best option. The Heaths say a good process will not guarantee a good result, but it builds trust, and trust makes the next decision easier too."
    }
   ],
   "tryThis": [
    "For one decision this week, write down at least three real options before you choose.",
    "Do a 10/10/10 check on something you feel strongly about right now.",
    "Before a big plan starts, ask your team: 'Imagine this failed. What went wrong?'"
   ],
   "forUs": "On a base we make big choices all the time: where to send an outreach team, who to invite onto staff, whether to start a new ministry. We pray first, and we listen for God. WRAP does not replace that. It can be a way to listen well. Widen the options before you vote on just one idea. Test plans with small steps, like running a cafe event once before making it weekly. Ask both Khmer and international staff for honest views, and ask in a way that makes bad news easy to share, because in many cultures people will not say no to a leader directly. Run a premortem before a DTS outreach team leaves. And agree on a check-in date in case you need to change course. Wisdom and good process work together.",
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
   "bigIdea": "How do you get people to do good work? Many organisations still use the same answer: reward people when they do well and punish them when they do badly. Daniel Pink calls this 'carrots and sticks'. He shows from decades of science that this works fine for simple, routine tasks. But for creative, thinking work, it often fails and can even make things worse. What really drives people over time comes from inside: autonomy, the desire to direct our own lives; mastery, the desire to get better at something that matters; and purpose, the desire to serve something bigger than ourselves. The deepest motivation does not depend on money. It depends on how we treat people and how we shape their work.",
   "insights": [
    {
     "emoji": "💻",
     "title": "Motivation 1.0, 2.0, 3.0",
     "body": "Pink compares human motivation to the operating system of a computer. Motivation 1.0 was about survival: food, safety, staying alive. Motivation 2.0 is the carrot-and-stick system: people work for rewards and to avoid punishment. Most schools and workplaces still run on this.\n\nPink tells about an experiment from 1949 by scientist Harry Harlow. He gave monkeys a simple puzzle, with no food or reward for solving it. The monkeys solved it anyway, again and again, and seemed to enjoy it. Harlow suggested there was a third drive: the joy of the task itself.\n\nThat is Motivation 3.0. It is intrinsic motivation, which means doing something because it is interesting, meaningful or satisfying in itself. Pink argues that modern work, which needs creativity and problem solving, needs an upgrade to 3.0."
    },
    {
     "emoji": "🥕",
     "title": "When rewards backfire",
     "body": "For simple tasks with clear steps, rewards can help. But Pink shows that 'if you do this, then you get that' rewards often backfire on creative work. A well-known example is the candle problem. People must fix a candle to a wall using only a box of pins and some matches. In one version of the study, people offered money took longer to solve it, not less time. The reward narrowed their focus, and they missed the creative answer.\n\nRewards can also change how people see a task. Pink describes day-care centres in Israel that started fining parents who picked up their children late. Late pick-ups went up, not down. The fine turned a moral duty into something people could simply pay for.\n\nPink suggests a better option for creative work: an unexpected 'now that' reward, like a thank-you, given after the work is done, not promised before it."
    },
    {
     "emoji": "💵",
     "title": "First, pay people fairly",
     "body": "Pink is clear that his message is not that money does not matter. He calls pay a 'baseline reward'. If people feel underpaid, or treated unfairly compared to others, they will be unhappy and distracted, and no amount of freedom or purpose will fix that.\n\nSo the first step is to make pay fair and adequate. Pink suggests paying people fairly for their role, and even a little more than average if you can. The goal is that money stops being a constant worry, so people can focus on the work itself.\n\nA simple everyday example: if a worker is worried every month about paying rent, it is hard for them to feel creative or excited about a new project. Fair pay is where motivation starts, not where it ends."
    },
    {
     "emoji": "🕊️",
     "title": "Autonomy",
     "body": "People want to direct their own lives. Pink names four areas where people can have freedom: task (what I do), time (when I do it), technique (how I do it) and team (who I do it with). Autonomy does not mean working alone.\n\nPink gives examples from companies. The Australian software company Atlassian began giving engineers a day to work on anything they wanted, as long as they showed what they made the next day. They called it a 'FedEx Day' because you had to deliver something overnight. Many new ideas and fixes came from those days.\n\nPink also describes workplaces where people are judged by their results, not by how many hours they sit at a desk. Even a little freedom in one of the four areas can raise energy and ownership."
    },
    {
     "emoji": "🎯",
     "title": "Mastery",
     "body": "We want to get better at something that matters. Pink starts with 'flow', a state described by psychologist Mihaly Csikszentmihalyi, when a task fits your skill so well that you lose track of time. Flow happens with 'Goldilocks tasks', named after a children's story: not too easy and not too hard.\n\nPink then gives three rules of mastery. First, mastery is a mindset: you must believe your ability can grow, an idea he takes from Carol Dweck. Second, mastery is a pain: it takes long, hard and sometimes boring effort, as Angela Duckworth's research on grit shows. Third, mastery is like a line you can get closer to but never touch. You never fully arrive.\n\nThat last rule might sound sad, but Pink sees it as part of the joy. There is always more to learn. Leaders can help by giving people tasks that stretch them just enough."
    },
    {
     "emoji": "🌍",
     "title": "Purpose",
     "body": "The most motivated people connect their work to something bigger than themselves.\n\nHe describes a study of university graduates in the United States. Some had 'profit goals', like becoming rich or famous. Others had 'purpose goals', like helping others or growing as a person. A year or two later, people who were reaching their purpose goals were happier. People who were reaching their profit goals were not happier, and some showed more anxiety and sadness.\n\nPink also shares a simple tool. Ask: what is my sentence? A great life can often be described in one sentence, like saying of Abraham Lincoln that he kept his country together and freed the slaves. Then ask a smaller question each day: was I better today than yesterday? Purpose gives direction. Daily progress keeps you moving."
    },
    {
     "emoji": "🅧",
     "title": "Type X and Type I",
     "body": "Pink describes two kinds of behaviour. Type X behaviour is fuelled mostly by outside desires, like money, praise or status. Type I behaviour is fuelled mostly by inner desires: the work is interesting, it matters, and it helps you grow.\n\nType I people still care about money and recognition. The difference is that these are not the main reason they work. Pink says Type I people usually do better over time and are more satisfied, because their energy renews itself. It does not run out when the rewards stop.\n\nThe important news is that Type I is not a personality you are born with. It can be learned. A simple everyday example: a young worker who starts a job only for the pay can, with good support and real ownership, come to love the work itself. Leaders can create places where this growth happens."
    }
   ],
   "tryThis": [
    "Ask one person on your team where they would like more freedom in their work.",
    "Pick one skill you want to master and spend 20 focused minutes on it today.",
    "Before a task, say out loud who it helps and why it matters."
   ],
   "forUs": "Most of us on a mission base are not here for the money, so purpose is already strong. Give staff real ownership of their area, like the cafe menu, a DTS lecture week or a community project, and let them decide how to do it. Help Khmer and international team members grow real skills through training, feedback and tasks that stretch them. Be careful with prizes and competitions in ministry, because they can sometimes take the joy out of serving. Keep connecting daily tasks like cooking, cleaning and admin to the bigger story of what God is doing in Cambodia. And a sincere 'thank you, that made a difference' often means more than any reward.",
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
   "bigIdea": "Most of us carry a long, invisible list in our heads: messages to answer, things to buy, promises we made, ideas for later, worries about the future. David Allen says this is a big reason we feel stressed, even when we are not doing very much. Our minds are good at having ideas, but bad at holding them. Allen's system, known as GTD, is simple at its core. Get everything out of your head into a trusted place. Decide the very next physical step for each item. Keep it organised and review it regularly. When your mind is clear, you can give full attention to what is in front of you. For leaders, this means fewer forgotten promises and more calm focus for people.",
   "insights": [
    {
     "emoji": "🌀",
     "title": "Open loops drain you",
     "body": "Allen calls every unfinished thing an 'open loop'. Each open loop takes a little space in your mind. Your mind keeps reminding you about it, but usually at the wrong time.\n\nAllen gives an example like this. Your mind reminds you that you need new batteries when you pick up a torch that does not work. It does not remind you when you walk past the shop that sells them. So the reminder comes, but you cannot act on it, and you just feel a little stress.\n\nMany open loops together create a low level of stress all day. The answer is not to try harder to remember. It is to write everything down in a place outside your head that you trust, and to check it often. Then your mind can relax."
    },
    {
     "emoji": "🧺",
     "title": "Five steps",
     "body": "The GTD system has five steps. Capture: collect everything that has your attention into a few inboxes, like a notebook, a tray or an app. Clarify: go through each item and decide what it is. Organise: put the results where they belong. Reflect: review your lists often enough to trust them. Engage: choose what to do now, and do it.\n\nClarify is where many people get stuck, so Allen gives a clear set of questions. First, is it actionable? If not, throw it away, keep it as reference, or put it on a 'someday/maybe' list. If it is actionable, what is the next action? If it takes less than two minutes, do it. If someone else should do it, pass it on. If not, put it on a list or in your calendar."
    },
    {
     "emoji": "👣",
     "title": "What is the next action?",
     "body": "Allen's most famous question is: what is the next action? He means the next physical, visible thing you can do to move something forward.\n\nMany of our to-do lists are full of things we cannot actually do. 'Car' or 'mother's birthday' are not actions. Even 'plan the outreach' is not something you can sit down and do. 'Email Sokha to ask about dates' is. When an item is vague, our minds avoid it and leave it on the list.\n\nFor bigger projects, Allen suggests a simple way to think, which he calls natural planning: know the purpose, picture a good outcome, brainstorm ideas, organise them, and then decide the next actions. Most of the time, though, the single question about the next action is enough to turn fuzzy worry into clear movement."
    },
    {
     "emoji": "⏱️",
     "title": "The two-minute rule",
     "body": "When you clarify your inbox, some items take only a moment to finish. Allen's rule is simple: if the next action takes less than two minutes, do it right now. Reply to the short message. Sign the form. Put the date in your calendar.\n\nThe reason is practical. For a very small task, writing it down, tracking it and coming back to it later takes more time and energy than just doing it.\n\nBut the rule has limits. It is for when you are clarifying, not a reason to stop your real work every time something small appears. And if a task takes longer than two minutes, you do not do it now. Either you delegate it to someone else and track it on a 'waiting for' list, or you defer it by putting it on a list or in your calendar."
    },
    {
     "emoji": "🗂️",
     "title": "Projects and lists",
     "body": "In GTD, a 'project' is any result that needs more than one action. Most people have more projects than they think. Allen suggests keeping a simple set of lists.\n\nA projects list shows every result you have committed to. Next action lists hold the actions, often grouped by where you are or what tool you need, like calls, computer, errands or home. So when you are in town, you can look at your errands list and see only what you can do there. A 'waiting for' list tracks what others owe you. A 'someday/maybe' list holds ideas you are not ready to start.\n\nAllen is strict about the calendar. Only put things there that must happen on a certain day or at a certain time. If you fill it with wishes, you stop trusting it."
    },
    {
     "emoji": "🔄",
     "title": "The weekly review",
     "body": "Allen calls the weekly review the key habit that makes the whole system work. Once a week, you sit down for an hour or two and make everything clear and current again.\n\nHe describes it in three parts. Get clear: empty all your inboxes, collect loose papers and notes, and write down anything new in your head. Get current: look over your action lists, your calendar for the past and coming weeks, your waiting-for list and every project, and make sure each project has a next action. Get creative: look at your someday/maybe list, ask if anything is ready to start, and add new ideas.\n\nWithout this review, the lists slowly go out of date. When that happens, you stop trusting them, and things move back into your head. With it, you end the week calm and start the next one knowing where you stand."
    },
    {
     "emoji": "💧",
     "title": "Mind like water",
     "body": "Allen borrows a picture from martial arts. Imagine throwing a small stone into a calm pond. The water responds with exactly the right size of splash, no more and no less, and then it becomes calm again.\n\nThat is the state he wants for us. When something new comes, like an urgent request or a sudden problem, you can respond in the right way and then return to calm. This is only possible when you trust that nothing important is being forgotten.\n\nAllen also talks about different levels of focus: today's actions, current projects, areas of responsibility, goals, vision and life purpose. He compares these to looking at your life from different heights, like from a plane. GTD starts at ground level, getting daily actions under control, because that frees your mind to think clearly about the bigger questions."
    }
   ],
   "tryThis": [
    "Do a 'mind sweep': spend 15 minutes writing down every task and worry in your head.",
    "For your top three items, write the very next physical action.",
    "Put a 30-minute weekly review in your calendar and protect it."
   ],
   "forUs": "Base life is full of interruptions: a visitor at the gate, a student who needs to talk, a broken water pump, a message from a supporter. A simple capture habit means you can say 'yes, I will get to that' and really mean it. Ministry leaders can use a projects list for things like DTS planning or a cafe repair, with a clear next action for each. A 'waiting for' list helps across languages and cultures, because you can follow up kindly instead of forgetting. Leaders who run a weekly review forget fewer things, and their teams learn they can trust them. And with a clearer mind, it is easier to be fully present with God and with people.",
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
   "bigIdea": "Why do some people keep going when others give up? Psychologist Angela Duckworth spent years trying to answer this. She studied new cadets at the West Point military academy, salespeople, students and spelling bee champions. Again and again she found that talent alone did not predict who would succeed. What mattered more was something she calls grit: a mix of passion and perseverance for long-term goals. The good news is that grit is not fixed. It can grow, and we can help others grow it too. For anyone who serves long term, leads a team or trains young leaders, this book is a strong reminder that steady faithfulness matters more than a flashy start.",
   "insights": [
    {
     "emoji": "🏃",
     "title": "Grit beats talent alone",
     "body": "West Point is one of the hardest military schools in the United States. The school gives each one a score based on grades, fitness and leadership. Yet every year some new cadets quit during the very hard first summer of training. Duckworth found that the school's score did not predict well who would stay. Her short grit test did much better.\n\nShe saw the same pattern in other places. At the National Spelling Bee, grittier children went further, partly because they practised more.\n\nDuckworth is not saying talent is not real. She is saying we often focus on talent too much. When we see someone with a natural gift, we may decide they are just special, and stop noticing how hard they worked. People with talent still have to keep showing up."
    },
    {
     "emoji": "✖️",
     "title": "Effort counts twice",
     "body": "Duckworth offers two simple equations. Talent times effort equals skill. Skill times effort equals achievement. So effort appears twice. Talent tells you how fast you can improve when you work. But without effort, talent stays as potential. And without more effort, skill does not turn into anything real.\n\nShe points to the work of sociologist Dan Chambliss, who studied swimmers. He found that top swimmers were not doing anything magic. They did many small, ordinary things very well and very often: good technique, careful habits, steady training. Over years, these ordinary actions added up to excellence.\n\nThis idea is freeing. You cannot change the gifts you were born with, but you can choose your effort. Someone with less natural talent who keeps working can go further than a gifted person who stops."
    },
    {
     "emoji": "🧭",
     "title": "One top goal",
     "body": "Duckworth describes goals as a kind of pyramid. At the bottom are many small, daily goals, like making a phone call or finishing a task. At the top is one top-level goal: the big direction of your life or work. Gritty people have their goals lined up, so the small ones serve the big one.\n\nShe tells a story about investor Warren Buffett. He once advised his pilot to list his top 25 career goals, circle the 5 most important, and then avoid the other 20 completely. Duckworth adds a gentle change: instead of throwing the others away, ask which ones can serve your top goal.\n\nSmall goals can change when they do not work. The top goal stays steady. This gives direction and meaning to daily work, and helps you say no to good things that would pull you away from it."
    },
    {
     "emoji": "❤️",
     "title": "Interest comes first",
     "body": "Many young people are told to 'follow your passion', as if passion arrives in one big moment. Duckworth says that is rarely how it works. Passion usually starts with interest, often in a playful, low-pressure way. Then it grows as you learn more and go deeper. Over years, an interest can become a passion.\n\nShe points to research by Benjamin Bloom, who studied world-class performers like pianists, swimmers and scientists. In their early years, most of them were not serious or under pressure. They had fun, and they had warm, encouraging teachers. Hard, focused training came later.\n\nSo you often need to try things before you find what you love. And once you find it, interest needs to be fed by new questions and new details. If you are waiting for passion to arrive, try exploring instead."
    },
    {
     "emoji": "🏋️",
     "title": "Practise the hard way",
     "body": "Grit is not only about working many hours. It is about working in the right way. Duckworth uses the research of Anders Ericsson on deliberate practice. This means setting a specific stretch goal, focusing fully on it, getting quick feedback, and repeating until you improve. Then you set a new stretch goal.\n\nShe studied spelling bee finalists. The children who did the most deliberate practice, like quizzing themselves alone on hard words, did the best in the competition. But they also said this kind of practice was the least fun.\n\nDeliberate practice is often uncomfortable in the moment. Duckworth notes that experts learn to accept the struggle, and they make practice a habit, often at the same time and place each day. Aim your effort well, and it will count for much more."
    },
    {
     "emoji": "🌱",
     "title": "Purpose and hope",
     "body": "Over time, gritty people connect their work to the good of others. Duckworth tells an old story about three bricklayers. Asked what they were doing, the first said he was laying bricks. The second said he was building a church. The third said he was building the house of God. The first has a job, the second a career, the third a calling.\n\nGritty people also have hope. This is not just wishing that things will turn out fine. It is the belief that your own effort can make things better. Duckworth explains research by Martin Seligman showing that when people feel nothing they do matters, they give up. But people can learn to see setbacks in a hopeful way: this problem is specific and temporary, and I can do something about it.\n\nSo when gritty people fall, they expect to get up again."
    },
    {
     "emoji": "🏡",
     "title": "Grow it together",
     "body": "Grit is shaped by the people around us. Duckworth recommends what she calls wise parenting, which works for leaders and teachers too: be both warm and demanding. High support with low expectations lets people stay small. High expectations without warmth crushes them. Together, they help people grow.\n\nIn her own family, Duckworth uses a 'Hard Thing Rule'. Everyone, parents included, does one hard thing that needs daily practice. You choose your own hard thing. And you cannot quit in the middle; you keep going until a natural stopping point, like the end of a season or term.\n\nShe also says culture matters. When you join a group where everyone is gritty, you tend to become grittier. She gives examples of sports teams that build strong cultures of effort. Leaders can shape a culture where grit becomes normal for everyone."
    }
   ],
   "tryThis": [
    "Write your top-level goal in one sentence, then list three smaller goals that serve it.",
    "Choose one 'hard thing' and commit to it until a clear stopping point, like the end of the term.",
    "Practise one skill for 20 minutes with a specific stretch goal and ask someone for feedback."
   ],
   "forUs": "Long-term missions need grit: learning Khmer or English, raising support, serving through hot seasons, slow results and team changes. Remember why you came, and keep your top goal clear even when smaller plans change. Treat language learning like deliberate practice: a clear stretch goal, short focused time, and feedback from a friend who speaks the language well. In DTS and schools, staff can be warm and demanding at the same time, cheering students on while believing they can do hard things. And on hard days, remember the third bricklayer. Washing dishes, teaching kids or fixing a pump can be part of building God's house. Our hope is not only in our own effort, but in his faithfulness.",
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
   "bigIdea": "Why do some people love a challenge, while others avoid anything that might make them look bad? Psychologist Carol Dweck spent decades studying this question. She found that people hold one of two basic beliefs about their abilities. With a fixed mindset, you believe your intelligence and talents are set and cannot change much. With a growth mindset, you believe ability can grow through effort, good strategies and help from others. That one belief shapes how you handle challenge, failure, effort and feedback. Dweck's message is hopeful: mindsets can change. For leaders and teachers this matters, because how we talk about ability, praise and mistakes pushes people toward one mindset or the other.",
   "insights": [
    {
     "emoji": "🧱",
     "title": "The fixed mindset",
     "body": "If you believe your ability is fixed, every task becomes a test of who you are. Each success says you are smart or talented. Each failure says you are not. So you avoid challenges, hide mistakes and may feel threatened when other people do well. Even effort can feel like bad news: if you were really talented, you think, you would not need to try so hard.\n\nDweck uses tennis star John McEnroe as an example. He had great talent, but he often blamed others when things went wrong: the referee, the crowd, the conditions. He did not like to learn from losses. For him, a loss said something about who he was, so it had to be someone else's fault.\n\nIn a fixed mindset, failure stops being an event and becomes a label: I am a failure."
    },
    {
     "emoji": "🌱",
     "title": "The growth mindset",
     "body": "If you believe ability can grow, challenges look like chances to learn. Effort is the path to skill, not a sign that you are weak. Failure still hurts, but it becomes information: what can I learn from this?\n\nDweck tells how she first noticed this as a young researcher. She gave children puzzles that got harder and harder, to see how they coped with failure. Some children were upset. But one boy rubbed his hands together and said that he loved a challenge. These children did not think they were failing. They thought they were learning.\n\nA growth mindset does not mean anyone can become anything, or that effort alone is enough. It means your current abilities are a starting point, not a final limit. With good strategies, hard work and help from others, people can grow far more than they expect."
    },
    {
     "emoji": "👏",
     "title": "Praise the process",
     "body": "In one of Dweck's best-known studies, children did a set of fairly easy problems. Afterwards, some were praised for their intelligence and told they must be smart. Others were praised for their effort and told they must have worked hard.\n\nThe difference was big. Children praised for being smart often chose easier tasks next, so they could keep looking smart. When the problems got hard, they lost confidence and did worse. Many even lied about their scores. Children praised for effort chose harder tasks, enjoyed them more and kept improving.\n\nThe lesson for leaders and parents is simple: praise what people do, not what they 'are'. Talk about effort, strategies and progress. The goal is learning, so praise the process, and when someone is stuck, help them find a new strategy."
    },
    {
     "emoji": "💬",
     "title": "Feedback is a gift",
     "body": "In a fixed mindset, criticism feels like an attack on who you are. In a growth mindset, it is useful information for getting better.\n\nDweck describes a study where people answered hard questions while their brain activity was measured. After each answer, they were told if they were right, and then given the correct answer. People with a fixed mindset paid close attention when they heard whether they were right or wrong. But when the information that could help them learn came, their attention dropped. People with a growth mindset paid close attention to the learning information too.\n\nIf you only care about how you look, you miss the help that is right in front of you. Learning to welcome feedback, ask for it and act on it is one of the clearest signs that you are growing."
    },
    {
     "emoji": "👔",
     "title": "Leaders and teams",
     "body": "Dweck shows that mindset is a big deal in leadership. Fixed-mindset leaders often need to prove they are the smartest person in the room. They may surround themselves with people who agree with them, punish bad news and blame others when things go wrong. She describes car company leader Lee Iacocca this way: he became more focused on his own image while his company struggled.\n\nGrowth-mindset leaders focus on learning and on developing their people. Dweck points to Lou Gerstner, who led the computer company IBM through hard times. He broke down walls between departments, listened to customers and valued teamwork more than looking like a hero.\n\nTeams often take on the mindset of their leaders. In a fixed-mindset culture, people hide mistakes and stop sharing ideas. In a growth-mindset culture, people are more honest, more creative and more willing to try new things."
    },
    {
     "emoji": "❤️",
     "title": "Relationships too",
     "body": "Mindset affects friendships, marriages and families, not only work. Dweck explains that a fixed mindset in relationships often believes that if a relationship is right, it should be easy. When problems come, someone must be to blame: me, the other person, or the relationship itself.\n\nA growth mindset sees it differently. Good relationships take work, honest talk and growing together. Problems are normal. They are chances to understand each other better, not proof that everything is wrong.\n\nA simple everyday example: two friends have a misunderstanding. With a fixed mindset, one may decide the other is just a selfish person, and pull away. With a growth mindset, they talk, listen, and learn how to handle it better next time. This applies to teams too. Conflict handled well can make a team stronger."
    },
    {
     "emoji": "🔀",
     "title": "Everyone is a mix",
     "body": "Nobody has a pure growth mindset, and Dweck is honest about this. We all have areas and situations that trigger fixed thinking: a new challenge, harsh criticism, or meeting someone who is better than us. In later editions of the book, she also warns about a 'false growth mindset', where people say the right words but do not really live it, for example by praising effort that is not helping.\n\nHer advice is to notice your fixed-mindset triggers. She even suggests giving your fixed-mindset voice a name, so that when it speaks you can recognise it and answer it calmly. Then you can choose a growth response: try a new strategy, ask for help, or keep going.\n\nThe goal is not to pretend you are always growth-minded. The goal is to grow, little by little, in how you respond."
    }
   ],
   "tryThis": [
    "When you think 'I'm just not good at this', add the word 'yet'.",
    "Praise one person this week for their effort or strategy, not their talent.",
    "After a mistake, write down one specific thing you learned from it."
   ],
   "forUs": "Mission life puts us in new places all the time: a new language, a new culture, a new role. A growth mindset lets a Khmer staff member try leading worship in English, or a new missionary try speaking Khmer at the market, without fear of looking foolish. In DTS and schools, staff can praise students for effort and learning, not for being gifted. In outreach debriefs, teams can ask what they learned, not only whether it went well. Leaders can share their own mistakes first, which makes it safe for others. In cultures where losing face is painful, this needs extra kindness and private feedback. Most of all, we remember that God is patient with us as we grow. We can show that same patience to each other.",
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
   "bigIdea": "Why do some people with good salaries still struggle with money, while others with less income slowly become secure? Robert Kiyosaki tells the story of two father figures. His own father was highly educated and worked hard, but often struggled with money. His best friend's father left school early, owned businesses and became wealthy. Kiyosaki calls them his poor dad and his rich dad. The main lesson is that understanding how money works matters more than how much you earn. He wants readers to think differently about work and risk. Some of his specific advice is strongly debated. But the basic ideas about money awareness are useful for anyone, including people serving on a small budget.",
   "insights": [
    {
     "emoji": "👨‍👦",
     "title": "Two dads, two ways of thinking",
     "body": "The 'poor dad' believed in good grades, a safe job, and a steady salary. The 'rich dad' believed in learning how money works and building things that produce money. The book uses these two voices to show how our beliefs shape our choices.\n\nOne example Kiyosaki gives is about words. When something cost too much, his poor dad would say he could not afford it. His rich dad did not allow that sentence in his home. Instead he asked how he could afford it. Kiyosaki says the first sentence closes your mind, while the question makes your mind start working to find a way.\n\nThe point is not that one was good and one was bad. The point is that the way we talk and think about money, often learned at home, quietly shapes what we do with it."
    },
    {
     "emoji": "📊",
     "title": "Assets vs liabilities",
     "body": "This is the core idea of the book. Kiyosaki gives very simple definitions. An asset is something that puts money into your pocket. A liability is something that takes money out of your pocket. He says the most important thing is to know the difference, and then to keep buying assets.\n\nHe draws simple pictures of cash flow. For a middle-class person, money comes in from a job and goes out to expenses and to liabilities like loans, which they often think of as assets. For a rich person, money comes in from assets, like businesses or property that earns rent, and much of it is used to buy more assets.\n\nHis advice is to build your list of assets first, and to buy luxuries only with the money your assets produce."
    },
    {
     "emoji": "🐀",
     "title": "The rat race",
     "body": "Many people earn more and then simply spend more. Kiyosaki describes a common story. A young couple marry, both work, and they start earning more money. So they buy a bigger house and a new car, and their bills grow. They work harder and harder, but never feel secure. Kiyosaki calls this the 'rat race', like a rat running on a wheel that never goes anywhere.\n\nHe says that more money does not fix this, because the problem is not the income. It is the habit of spending all of it, and borrowing for more.\n\nA simple everyday example: someone gets a pay rise and quickly buys a more expensive phone on monthly payments. Now the rise is already gone. Earning more does not help if spending always grows with it."
    },
    {
     "emoji": "📚",
     "title": "Learn financial basics",
     "body": "Kiyosaki says schools rarely teach money skills, so many smart, educated people never learn them. He calls this financial literacy: being able to read and understand the numbers in your own life. That includes income, expenses, assets, liabilities and cash flow.\n\nHe also talks about a wider 'financial IQ', which includes simple accounting, investing, understanding markets and knowing the rules about money, like taxes and laws. He spends time on how wealthy people in the United States use companies to pay less tax. This part is specific to his country and time, and it is one of the more debated sections.\n\nYou do not need to be an expert. But you do need to understand your own numbers. If you do not know how much comes in each month and where it goes, it is very hard to make wise choices."
    },
    {
     "emoji": "🛠️",
     "title": "Work to learn",
     "body": "Kiyosaki encourages people, especially young people, to choose work for the skills it teaches, not only for the pay. He did this himself, for example taking a job in sales to get over his fear of rejection and learn to communicate.\n\nHe tells a story about a young journalist in Singapore who interviewed him. She wrote well and dreamed of becoming a best-selling author. He suggested she take a course in selling. She was offended, because she saw selling as beneath her. Kiyosaki pointed out that he was known as a best-selling author, not a best-writing author. Good skills often need to be joined by the ability to sell and communicate.\n\nThe idea is to keep learning a range of skills, instead of knowing more and more about less and less."
    },
    {
     "emoji": "😨",
     "title": "Fear and feelings",
     "body": "Kiyosaki argues that fear and desire often control our money choices. Fear of not having enough keeps people in jobs they dislike. Desire for more things makes them spend as soon as they are paid.\n\nHe tells how, as a boy of nine, he and his friend Mike asked the rich dad to teach them about money. The rich dad gave them work in one of his shops for a very small wage, and later took the wage away completely. Robert was angry. Then the rich dad explained the lesson: most people let fear and anger push them to work for money all their lives. He wanted the boys to notice those feelings and use their minds instead.\n\nNoticing these feelings does not make them disappear, but it helps you choose more wisely."
    },
    {
     "emoji": "⚠️",
     "title": "Read with care",
     "body": "Rich Dad Poor Dad is one of the best-selling money books ever, but many financial experts question parts of it. Kiyosaki says your own home is not an asset, because it takes money out each month. Many advisers disagree, or say it depends on the situation. He also encourages fairly risky investing.\n\nSome writers have even questioned whether the rich dad was one real person, or more of a teaching story. Kiyosaki has defended the story, but readers should know this question exists.\n\nSo take the big ideas with you: understand your cash flow, spend less than you earn, avoid debt for things that lose value, keep learning, and build things that help you over time. Be careful with the rest. Before any big financial decision, get advice from someone wise and trustworthy who knows your situation."
    }
   ],
   "tryThis": [
    "List what you own and what you owe. Mark each item as 'puts money in' or 'takes money out'.",
    "Track every dollar or riel you spend for one week.",
    "Set aside a small amount from every gift or payment before you spend anything else."
   ],
   "forUs": "Most of us live on support-raised budgets or modest local salaries, so we are not chasing wealth, and that is fine. Jesus warns us about loving money, and our security is in God. But money wisdom still matters. Knowing your cash flow, avoiding debt and saving a little each month help you stay on the field longer and serve with less stress. For Khmer staff, it can mean helping family wisely without taking loans you cannot repay. For international staff, it can mean being honest with supporters and planning ahead for trips home. Leaders can help their teams by teaching simple budgeting in a kind, practical way, without shame. Being faithful with what God provides, a little or a lot, is part of good stewardship.",
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
   "bigIdea": "Steven Levitt is an economist and Stephen Dubner is a journalist. Together they wrote Freakonomics, which used data to answer strange questions about everyday life. In this book they share how they think, so readers can use the same approach on their own problems. Their way of thinking is about being honest, curious and a bit playful. Admit what you do not know. Ask a better or simpler question. Look at the real incentives that drive people. Tell stories when you want to persuade. And know when it is time to quit. For leaders and teams, these tools help us stop doing things only because we always have, and start solving the problems that really matter.",
   "insights": [
    {
     "emoji": "🤷",
     "title": "Say 'I don't know'",
     "body": "The authors call 'I don't know' some of the hardest words to say. People often pretend to know things so they look smart or confident. That leads to bad decisions, because nobody checks whether the guess is right.\n\nThey point to research by Philip Tetlock, who studied hundreds of experts making predictions about politics and economics. The experts did not do much better than chance, and the most confident ones were often the least accurate. They also describe a study where children in England were asked questions that had no real answer. Many of the children made up an answer instead of saying they did not know.\n\nAdmitting 'I don't know' is the first step to finding out. Then you can gather real information, run small experiments and learn from feedback. Being honest about what you do not know is a sign of strength."
    },
    {
     "emoji": "❓",
     "title": "Change the question",
     "body": "How you frame a problem decides which answers you can see.\n\nThe book tells about Takeru Kobayashi, a young man from Japan who entered a famous hot dog eating contest in New York. The record was about 25 hot dogs in 12 minutes. Other eaters asked how they could eat more hot dogs. Kobayashi asked a different question: how can I make hot dogs easier to eat? He broke each hot dog in half and dipped the bread in water, and he practised and tested his methods carefully. In his first contest he ate 50, about double the old record. He also refused to accept the old record as a real limit.\n\nWhen you are stuck, try rewriting your problem in a new way. A small change in the question can open new answers."
    },
    {
     "emoji": "🧒",
     "title": "Think like a child",
     "body": "Children ask simple, obvious questions and are not afraid to look silly. The authors encourage adults to do the same.\n\nThey note that magicians often say children are harder to fool than adults. Adults think they know where to look, so they follow the magician's direction. Children look at things adults ignore, so they are more likely to notice the trick.\n\nThe authors also give an example of thinking small. In some poor areas, many children were doing badly at school. Big plans to change the whole school system were slow and expensive. But one simple question was: can the children see the board? Many could not. Giving children glasses helped their learning a lot, at a low cost. Ask simple questions out loud. They often show what everyone else has missed."
    },
    {
     "emoji": "🎁",
     "title": "Incentives are everything",
     "body": "To understand why people do what they do, look at their incentives. These can be financial, social or moral. The authors say the key is to find out what people really care about, which is often different from what they say.\n\nThey describe a study in California about saving electricity. Different homes got different signs on their doors. Some said saving energy would save money. Some said it would protect the environment. Some said it was good for society. One said that most of your neighbours were already saving energy. People said the neighbour message would matter least to them. But it was the one that changed their behaviour the most.\n\nSo watch what people do, not only what they say. And design your plans around what truly moves them."
    },
    {
     "emoji": "🍬",
     "title": "Let people sort themselves",
     "body": "Sometimes you can set things up so people show who they really are by their own choices. The authors describe this as teaching your garden to weed itself.\n\nOne of their examples comes from the Bible: King Solomon and the two women who both claimed the same baby. Solomon offered to cut the baby in two. The real mother begged him to give the baby to the other woman instead, and by this he knew she was the true mother.\n\nThey also tell about the rock band Van Halen. Its contract asked for a bowl of candies backstage, with all the brown ones removed. The contract had many important safety rules for the heavy stage equipment. If the band found brown candies, they knew the venue had not read the contract carefully, so they checked everything else again. A small, clever test can show what big questions cannot."
    },
    {
     "emoji": "🗣️",
     "title": "Persuading people",
     "body": "Facts alone rarely change minds. The authors note that people often hold on to their beliefs even when the evidence says otherwise, because strong opinions are often tied to identity and to the group we belong to.\n\nSo how can you persuade someone who does not want to be persuaded? They give some simple advice. First, be humble, and do not pretend your idea is perfect. Admit its weak points; this makes people trust you more. Second, admit the strong points of the other side. Third, do not insult people who disagree. Insults only make people defend themselves.\n\nFinally, tell stories. People remember a good story much longer than a list of numbers. A simple everyday example: a story about one child helped by a project often moves people more than a chart about a thousand children."
    },
    {
     "emoji": "🚪",
     "title": "The upside of quitting",
     "body": "We often keep going with something that is not working. One reason is 'sunk cost': we think about the time and money we already spent and do not want to waste it. Another is that we forget 'opportunity cost': everything else we could do with that time and energy.\n\nLevitt set up a website where people facing a hard choice, like whether to quit a job or end a relationship, could flip a digital coin. Heads meant make the change; tails meant stay. Months later, people who had made the change, including those who quit, said they were happier on average than those who stayed.\n\nThe authors also say that failing early and cheaply is a kind of success. A small failure can save you from a big one. And quitting one thing can free you for something better."
    }
   ],
   "tryThis": [
    "Next time you are stuck, rewrite your problem as a smaller, simpler question.",
    "Say 'I don't know, let's find out' at least once this week.",
    "Look at one ongoing activity and ask: if we were not already doing this, would we start it today?"
   ],
   "forUs": "On a base it is easy to keep doing things because we always have. Why are fewer people coming to this event? What do our students and our Khmer neighbours really value, not just what they say to be polite? Be humble enough to say 'I don't know', and test small ideas before making big plans. When you share a vision with supporters or local leaders, tell real stories, not only numbers. And give yourself permission to stop a ministry activity that is no longer bearing fruit, so energy can go where God is moving. Stopping one good thing is not a failure if it makes room for what God is asking of us now.",
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
   "bigIdea": "Most leadership books start with skills. Ken Blanchard, a well-known business writer, and his friend Phil Hodges start with Jesus. They say he is the greatest model of leadership we have, and that his way works in a family, a church or a company. For them, leadership is any time you try to influence what other people think or do. That means everyone leads somewhere: parents, teammates, friends. So the big question is not if you lead, but how and why. Jesus told his followers that they must not be like the rulers of this world, who use power over people. Among them, the greatest must be the servant. The book looks at four parts of a leader: the heart, the head, the hands and the habits. If the heart is wrong, the rest will not stay right for long.",
   "insights": [
    {
     "emoji": "❤️",
     "title": "The heart: why do you lead?",
     "body": "The first question is about motivation. Am I leading to serve others, or to serve myself? The authors say the heart is where leadership goes right or wrong, and the big enemy is our ego. They turn EGO into a phrase: 'Edging God Out'. This happens when we put ourselves at the center, trust our own strength and want our own way.\n\nThe answer is a different EGO: 'Exalting God Only'. This means we look to God for our worth and security, not to our title or to what people think of us. When our worth is settled in God, we are free to serve without needing applause.\n\nWhy does this matter? A leader with a self-serving heart can still have good plans and skills. But sooner or later people feel it, and trust breaks. So the authors invite leaders to start with honest questions about their own heart."
    },
    {
     "emoji": "😨",
     "title": "Pride and fear",
     "body": "Ego usually shows up in two ways. Pride makes us think too highly of ourselves. We want credit, we want control, and we find it hard to admit we were wrong. Fear makes us protect ourselves. We avoid hard conversations, hold on to power, and hide our weak spots so no one sees them.\n\nThe two look different, but they grow from the same root. Both put me at the center instead of God and the people I serve. A proud leader pushes people down. A fearful leader stays quiet when people need the truth. Either way, the team suffers.\n\nThink of Jesus in the wilderness. He was tempted to prove himself, to grab easy comfort and to take power the wrong way. He said no each time and stayed close to his Father. For us, the first step is to notice pride and fear when they show up, name them honestly, and bring them to God."
    },
    {
     "emoji": "🧭",
     "title": "The head: a clear vision",
     "body": "Jesus knew who he was and why he came. He had a clear purpose, he taught a clear picture of the future, which he called the kingdom of God, and he lived by clear values, like loving God and loving your neighbor. The authors say a servant leader also needs a clear and compelling vision.\n\nThey describe vision in simple parts. Purpose: what are we here to do, and why? Picture of the future: what will it look like if we succeed? Values: what will guide our choices on the way? When Jesus called fishermen to become fishers of people, he gave them a purpose they could understand.\n\nServing people does not mean doing whatever they want. First the leader sets the direction with the team. Then the leader turns the pyramid upside down and serves people as they work toward that vision. Without direction, serving gets confusing."
    },
    {
     "emoji": "🙌",
     "title": "The hands: a coach, not a boss",
     "body": "Jesus took ordinary people and grew them step by step. The authors describe four stages a learner moves through: novice, apprentice, journeyman, and finally master or teacher. At each stage, the leader gives a different kind of help.\n\nLook at Peter in the Gospels. When Jesus called him from his fishing boat, he was a beginner who needed clear direction. Later he stepped out of the boat to walk on water, then sank and needed Jesus to catch him. He was learning, with ups and downs. Jesus sent him out with the others to preach and heal, giving him more freedom. After the Holy Spirit came, Peter stood up, preached and helped lead the young church.\n\nGood leaders do the same. Give a beginner clear direction and lots of support. Stay close when they are discouraged. As people grow, give them more freedom. The goal is to send them out, not to keep them dependent on you."
    },
    {
     "emoji": "🙏",
     "title": "The habits: stay filled up",
     "body": "You cannot serve well for long if you are empty. Busy leaders often give and give until there is nothing left. The authors say Jesus shows us habits that kept him full, even under huge pressure.\n\nThey name five. Solitude: time alone with God, like when Jesus went to quiet places early in the morning. Prayer: honest talk with the Father. Knowing and applying Scripture: knowing God's Word well enough to live it, as Jesus did when he answered temptation with Scripture. Accepting God's unconditional love: resting in the fact that you are loved before you do anything. And supportive relationships: a few close friends who know you and keep you honest.\n\nThese habits are not extra tasks for super-spiritual people. They are how a leader's heart stays in the right place. When the habits slip, pride and fear grow back fast."
    },
    {
     "emoji": "🧼",
     "title": "Serving is the point",
     "body": "On the night before he died, Jesus took a towel and a bowl of water and washed his disciples' feet. This was a servant's job. Then he told them to do the same for each other. He also taught that he came not to be served, but to serve.\n\nIn this model, success is not how big your title is, or how many people obey you. The authors say a leader should be measured by what happens to the people they lead and to the mission. Do people grow? Are they becoming leaders themselves? Is the work moving forward in a good way?\n\nThis changes daily choices. A servant leader listens before deciding, shares credit, admits mistakes and is not too proud for small jobs. This is not weakness. Jesus was clear and strong, and he served. That mix is what the authors hope every leader will learn."
    }
   ],
   "tryThis": [
    "Before a meeting or task you lead this week, ask: am I doing this to serve or to look good?",
    "Notice one moment of pride or fear in yourself and name it honestly to God.",
    "Pick one person you lead and ask: what do you need from me to grow right now?"
   ],
   "forUs": "On a YWAM base almost everyone leads something: a DTS small group, a kitchen team, an outreach team, a ministry like the cafe. So this book is for all of us, not only base leaders. Try to notice ego in small places, like wanting your idea chosen, or avoiding a hard talk with a teammate because you fear their reaction. Coach new staff step by step. A new Khmer staff member and a new international volunteer may both be beginners in different ways, so give each the help they need. Give Khmer leaders real responsibility and trust, not just tasks. And guard your time with God, because a busy base can make even good leaders run on empty. Sometimes washing feet looks like cleaning up after a team meal when no one is watching.",
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
   "bigIdea": "Tim Ferriss argues that many people waste their best years working long hours for a future they may never enjoy. They wait until retirement to rest, travel or do what they love. Ferriss calls this the deferred life. Instead he describes the 'New Rich', people who value time and freedom more than a big salary. He offers a four-step plan called DEAL: Definition, Elimination, Automation and Liberation. His goal is a small business that runs with little effort, so you can live freely now. Not all of this fits missionary life. But his tools for cutting busywork, protecting focus and planning real rest are very useful for anyone with too much to do.",
   "insights": [
    {
     "emoji": "🎯",
     "title": "D — Define what you really want",
     "body": "Many people never make a change because of a fear they have never looked at closely. Ferriss suggests an exercise called 'fear-setting'. Write down the worst thing that could happen if you make the change. Then write how you could fix it or get back to where you are now. Then write what it costs you to do nothing for another six months or a year.\n\nFerriss did this himself when he was burned out running his company. He feared a long trip would ruin his business. When he wrote it out, the worst case was not so bad and could be fixed. So he went.\n\nHe also helps readers turn dreams into goals with dates, which he calls 'dreamlining'. Many of us are not stuck because of real danger, but because of a vague worry we have never written down."
    },
    {
     "emoji": "✂️",
     "title": "E — Eliminate with the 80/20 rule",
     "body": "The 80/20 rule says that about 80% of results often come from about 20% of causes. When he looked at his own company, he found that a few customers brought most of the money, and another small group caused most of the stress. He stopped serving the difficult ones who gave little, and put his energy into the best ones. His income went up and his stress went down.\n\nYou can ask two simple questions. Which 20% of my activities bring 80% of the good results? Which 20% bring 80% of my problems? Do more of the first and less of the second.\n\nFerriss also says being busy is not the same as being productive. A useless job done very well is still a useless job. Cut first, then speed up."
    },
    {
     "emoji": "⏳",
     "title": "Work expands to fill the time",
     "body": "This is 'Parkinson's Law': a task grows to fill the time you give it. Give a report a whole week and it takes a whole week. Make the deadline tomorrow and you somehow finish it, often just as well.\n\nFerriss says the 80/20 rule and Parkinson's Law work best together. Cut your tasks down to the few important ones, so you can work shorter hours. And give yourself shorter hours, so you are forced to focus only on the important tasks.\n\nHere is a simple everyday example. If you tell yourself you will answer messages sometime this morning, it takes all morning. If you give it twenty minutes before a meeting, you get it done. Short, clear deadlines push us to stop polishing small things and decide what really matters. Set the finish line before you start."
    },
    {
     "emoji": "📥",
     "title": "Batch and guard your attention",
     "body": "Checking messages all day breaks your focus again and again, and each time it takes a while to get back. Ferriss suggests checking email only at set times, for example twice a day, and telling people when they can expect a reply. He also groups similar tasks together, like paying bills or making calls, and does them in one block.\n\nHe also suggests a 'low-information diet'. Most news, feeds and online noise do not change what we do. They just make us tired and worried. Ferriss even suggests a one-week break from news and reading that you do not need for work.\n\nHe adds a hard but useful skill: learning to say no, and stopping interruptions before they start. Your attention is limited. Spend it on purpose, not on whatever pings next."
    },
    {
     "emoji": "🤝",
     "title": "Automate and delegate",
     "body": "Ferriss hands repeat tasks to virtual assistants and builds systems, so his business does not need him for every decision. But first he gives a warning: eliminate before you delegate. Never hand off a task that should not be done at all. Then, for tasks that really need doing, write clear steps once and let someone else follow them.\n\nHe also gave his helpers permission to solve customer problems on their own, up to a set amount of money, without asking him. This freed him from many emails, and his team grew more confident.\n\nA smaller version works for anyone. Write a simple checklist for a weekly job. Train a teammate. Agree on what decisions they can make without you. You stop being the bottleneck, and others get the chance to grow. Good delegation is not dumping work. It is trusting people."
    },
    {
     "emoji": "🌴",
     "title": "L — Mini-retirements",
     "body": "The last step is Liberation: freedom to work from anywhere and to rest well. Ferriss explains how employees can ask to work remotely, starting with a day or two as a test. Then he suggests that instead of saving all rest for old age, we take longer breaks spread across life. He calls them 'mini-retirements'.\n\nOn his own long trip, Ferriss learned languages and studied tango in Argentina. But he admits that endless free time is not the answer. With no purpose, people can feel empty and bored. So he ends the book by encouraging readers to fill their time with learning and with serving others.\n\nThe heart of this is good. Rest and renewal are not just a reward at the very end of life. They are part of a healthy life now."
    },
    {
     "emoji": "⚖️",
     "title": "Where we see it differently",
     "body": "The book is built around automated income, a small business Ferriss calls a 'muse', and escaping work you dislike. Missionaries on raised support are not trying to earn more with less effort.\n\nOur work is relational and comes from a calling. Many of our most important moments cannot be batched or planned: a long talk with a struggling student, a meal with a neighbor, an unplanned time of prayer. People are never tasks to outsource.\n\nStill, the tools can serve a good goal. Cutting busywork can give you more time for people. Clear steps can help new staff serve with confidence. Planned rest can keep you healthy in the field for many years. So take the tools, not the whole goal. And when you do save time, ask God what that time is for."
    }
   ],
   "tryThis": [
    "List your weekly tasks and circle the 20% that bring most of the good fruit.",
    "Check messages at two or three set times a day for one week.",
    "Write simple step-by-step notes for one task you always do, so someone else could do it."
   ],
   "forUs": "On a base, life is full of meetings, messages and small jobs that can crowd out the things only you can do: discipling, praying, preparing teaching, being present with people. Use the 80/20 question with your team: which activities really bear fruit, and which just keep us busy? Batch admin, and write down simple processes so new Khmer and international staff can step in with confidence. Plan real rest between schools and outreaches, instead of waiting until you are exhausted. Sabbath was God's idea long before mini-retirements, and it is a gift, not a reward. Our aim is not a four-hour week. It is to be faithful and fruitful without burning out.",
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
   "bigIdea": "Stephen Covey studied many years of success writing. Older books focused on character, like honesty, patience and humility. Newer ones focused more on image and quick tricks. Covey says real effectiveness comes from character and lasting principles, working from the 'inside out'. He also shows how the way we see things, our paradigm, shapes everything. On a train, he was annoyed by a father who let his children run wild, until the man said their mother had died an hour earlier. In a moment, Covey saw everything differently. His seven habits move us from dependence to independence, then to interdependence, where we do more together. Habits 1 to 3 are about leading yourself, 4 to 6 about working with others, and 7 keeps you renewed.",
   "insights": [
    {
     "emoji": "🔑",
     "title": "Habit 1: Be proactive",
     "body": "Between what happens to you and how you respond, there is a space, and in that space you have a choice. Covey tells the story of Viktor Frankl, a Jewish psychiatrist held in Nazi death camps. Frankl lost almost everything, but he saw that no one could take away his freedom to choose his attitude.\n\nProactive people take responsibility for their choices. They focus on their 'circle of influence', the things they can actually change. Reactive people focus on their 'circle of concern', the things they worry about but cannot change, and they feel more and more powerless.\n\nListen to your words. Reactive language sounds like 'there is nothing I can do'. Proactive language sounds like 'I can choose another way'. Small changes in words can lead to big changes in action."
    },
    {
     "emoji": "🗺️",
     "title": "Habit 2: Begin with the end in mind",
     "body": "Covey asks readers to imagine their own funeral. Family, a friend, a coworker and someone from church or community each speak about your life. What would you want them to say?\n\nThis picture shows what really matters to you. Covey says all things are created twice: first in the mind, then in reality. Your life works the same way. If you do not decide what you want it to become, other people and circumstances will decide for you.\n\nSo he suggests writing a personal mission statement based on your values and your main roles, like son or daughter, teammate, leader and friend. It is not written in one night. You return to it, improve it, and let it guide daily choices, so you live on purpose and not by accident."
    },
    {
     "emoji": "📅",
     "title": "Habit 3: Put first things first",
     "body": "Covey sorts tasks with two questions: is it urgent, and is it important? This makes four boxes. Many of us live in the urgent box: crises, interruptions, noise. Others drift into things that are neither, like endless scrolling.\n\nThe secret is the important but not urgent box. It holds planning, building relationships, preventing problems, learning and rest. Nothing forces us to do these today, so they get pushed aside. But the more time we spend here, the fewer crises we face later.\n\nCovey's practical tool is weekly planning. List your roles, choose one or two important goals for each role, and put those into your week first. Then fit other tasks around them. To make room, you will need to say no to some good things, kindly and without guilt, because you are saying yes to something better."
    },
    {
     "emoji": "🤝",
     "title": "Habit 4: Think win-win",
     "body": "Before Habits 4 to 6, Covey introduces the 'emotional bank account'. Kindness, keeping promises, clear expectations, honesty and sincere apologies are deposits that build trust. Broken promises, rudeness and gossip are withdrawals. With high trust, even a clumsy word is understood. With low trust, every word is suspected.\n\nHabit 4 says life is not a competition where someone must lose. Win-win looks for solutions that are good for both sides. It needs courage to say what you need, and care for what the other person needs.\n\nCovey adds an honest option: win-win or no deal. If we cannot find something good for both of us, we agree kindly not to go ahead, instead of forcing a bad agreement. This protects the relationship, which is often worth more than winning one argument."
    },
    {
     "emoji": "👂",
     "title": "Habit 5: Seek first to understand",
     "body": "Most of us listen while planning our answer. We give advice before we understand the problem. Covey compares this to an eye doctor who hears that you cannot see well, takes off his own glasses and tells you to wear them because they work for him. Of course they do not help you.\n\nCovey asks for empathic listening: listening until you really understand the other person's feelings and point of view, from their side. This means reflecting back what you hear, without rushing to judge, advise or question. People who feel understood relax and open up.\n\nThe second half of the habit is to then be understood. After listening well, share your own view clearly and with respect. This order matters. When people feel heard, they are far more ready to listen to you."
    },
    {
     "emoji": "🧩",
     "title": "Habit 6: Synergize",
     "body": "Synergy means the whole is greater than the sum of the parts. When people with different views respect each other and stay open, they can find a 'third alternative', a way that is better than either first idea.\n\nCovey gives a family example. A husband plans a fishing holiday, but his wife wants to visit her sick mother at the same time. Each could fight to win, or one could give in and feel bitter. Instead they listen deeply to each other and look for a new plan that meets the real needs of both.\n\nThe key is valuing differences. If two people always think the same, one of them is not really needed. Different cultures, personalities and skills are not problems to fix. They are the raw material for better ideas. Synergy grows from trust and humble listening."
    },
    {
     "emoji": "🪚",
     "title": "Habit 7: Sharpen the saw",
     "body": "Covey tells of a man working hard to cut down a tree with a dull saw. Someone asks why he does not stop to sharpen it. He says he is too busy sawing. He works hard but gets little done.\n\nHabit 7 is about renewal in four areas. Physical: sleep, food, exercise and rest. Mental: reading, learning and thinking. Social and emotional: serving others and building deep relationships. Spiritual: prayer, reflection and anything that reconnects you to your deepest values.\n\nCovey also uses an old fable about a goose that laid golden eggs. A greedy farmer killed the goose to get all the eggs at once, and ended up with nothing. Real effectiveness means caring for the goose, your health and relationships, not only the eggs, your results. Renewal keeps all the other habits alive."
    }
   ],
   "tryThis": [
    "Write down one worry and one thing in it that is inside your circle of influence. Act on that part.",
    "On Sunday, plan two important but not urgent things into your week.",
    "In one conversation, repeat back what the other person said before you give your opinion."
   ],
   "forUs": "A YWAM base is a picture of interdependence: Khmer and international staff from many cultures sharing a mission, a kitchen and a schedule. Habit 5 is gold here, because so many misunderstandings come from language and culture, not bad hearts. Make deposits in each other's emotional bank account, look for win-win when teams disagree, and value different cultural views as a way to find better solutions. Covey wrote for everyone, but much of this sounds like Jesus: serve, listen, keep your promises, and take time to be renewed by God. Try weekly planning around your roles in ministry, and protect time for prayer, rest and friendship before the urgent things fill your week.",
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
   "bigIdea": "Darren Hardy was the publisher of SUCCESS magazine and spent years learning from high achievers. His conclusion is simple, maybe too simple to feel exciting. Success is not about one big moment or a secret trick. It comes from small, smart choices repeated consistently over time. Each choice looks too small to matter, which is why it is easy to skip. Eating one donut will not make you sick. Reading ten pages will not make you wise. But over months and years, small choices add up, like interest on money. This works in both directions. Small bad habits also add up, slowly and quietly, until one day the result appears. Hardy sums it up as a formula: small, smart choices, plus consistency, plus time, equals a radical difference.",
   "insights": [
    {
     "emoji": "🪙",
     "title": "The magic penny",
     "body": "Hardy asks: would you take three million dollars in cash today, or one penny that doubles every day for 31 days? Most people take the cash. After 20 days the penny is still only worth a few thousand dollars, and it looks like a bad choice. Only in the last days does it jump past the cash. By day 31 it is worth more than ten million dollars.\n\nThe lesson is that compounding is slow and quiet at the start. The big results come late. That is why most people quit too early. They exercise for two weeks, see no change, and stop. They try a new habit for a month, feel nothing new, and give up.\n\nIf you understand the penny, you can stay patient in the boring middle. Keep doing the right small thing, even when it seems to be doing nothing. It is working under the surface."
    },
    {
     "emoji": "👬",
     "title": "Three friends, three paths",
     "body": "Hardy imagines three friends, Larry, Scott and Brad, who grew up together and have similar lives. Larry changes nothing. Scott makes small good changes. He reads about ten pages of a helpful book a day, listens to something useful on his drive to work, and eats a little less each day. Brad makes small bad changes, like buying a big new TV, watching more of it, and snacking more.\n\nAfter five months, nobody can see a difference. After a year, still not much. But after about two and a half years, Scott is healthier and growing in his work and his marriage, while Brad is heavier, less happy and struggling.\n\nNone of their daily choices looked dramatic. That is the point. Life is not usually changed by one big decision, but by the little ones we hardly notice. Ask yourself which friend your daily choices are making you."
    },
    {
     "emoji": "🙋",
     "title": "Take 100% responsibility",
     "body": "Hardy says you cannot control everything that happens, but you are fully responsible for your choices and responses. Stop blaming luck, your boss, your background or the weather.\n\nHe tells how he took this into his marriage. For one year he wrote down, every day, something he appreciated about his wife. Looking for good things changed how he saw her, and their relationship grew warmer. At the end of the year he gave her the journal as a gift, and she was deeply moved.\n\nHe also says to track your choices. Carry a small notebook and write down what you actually do in one area, like spending money or eating, for a week or more. Most people are surprised by what they see. Tracking shows you the truth, and you cannot change what you do not notice. Awareness is the first small step toward a big change."
    },
    {
     "emoji": "🔄",
     "title": "Build habits with a strong why",
     "body": "Willpower alone runs out. Hardy says what keeps you going is a strong reason, your 'why'. He calls this 'why-power'. When your goal is connected to your values and the people you love, you keep going when you feel tired or bored.\n\nTo break a bad habit, find its triggers. What time, place, feeling or person sets it off? Then remove what you can, like clearing junk food from the house. Swap the bad habit for a better one, rather than just leaving an empty space. Some habits you can ease out of slowly. Others you need to stop all at once.\n\nTo build good habits, start small, plan ahead and tell people. Hardy suggests finding a buddy with the same goal, because it is easier to keep going together. A little friendly competition or accountability makes a big difference."
    },
    {
     "emoji": "🎢",
     "title": "Momentum",
     "body": "Starting something new is hard. Hardy compares it to pushing a heavy merry-go-round at a playground. At first it barely moves, and you push with all your strength. But once it is spinning, a small push each time keeps it going fast.\n\nNew habits work the same way. The first weeks need lots of effort. Then routine takes over and the habit gets easier. Hardy encourages morning and evening routines, a set start and end to your day, so good choices happen without much thinking.\n\nThe danger is stopping. If you quit for a while and then start again, you are pushing from zero again, and that costs a lot of energy. This is why steady rhythm matters more than big bursts of effort. A short daily practice usually beats a huge effort once in a while. Keep the wheel turning, even slowly, on the hard days."
    },
    {
     "emoji": "🧲",
     "title": "Watch your influences",
     "body": "Three things shape you quietly, often without you noticing. Inputs: what you put into your mind through what you watch, read and listen to. Associations: the people you spend time with, whose habits and attitudes rub off on you. Environment: the spaces and things around you every day.\n\nHardy says to choose them on purpose. Guard your mind from a constant stream of negative news. Spend more time with people who help you grow, and less with people who pull you down. Arrange your space so good choices are easy.\n\nThen, to speed up growth, Hardy talks about acceleration. At key moments, when most people stop or do only what is expected, do a little more. Push a bit further, give a bit more effort, surprise people with care. These small extras also compound, and they often make the difference between good results and great ones."
    }
   ],
   "tryThis": [
    "Pick one small good choice and do it every day for seven days.",
    "Track one area, like phone time or spending, for a week without changing anything. Then look.",
    "Write down your 'why' for one goal and put it somewhere you will see it daily."
   ],
   "forUs": "Mission work rarely has quick wins. Language learning, discipleship, trust between Khmer and international staff, and fruit in a village all come from small faithful steps over years. This book is a good reminder that the daily things count: a few new Khmer words, a short time in the Word, a kind word to a teammate, showing up for intercession. Think about your team's small habits too, like how you welcome new students or how you end a hard week together. Be patient in the slow middle, when nothing seems to change. Jesus said the kingdom is like a tiny seed that grows into a big tree. God often works through small and steady faithfulness.",
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
   "bigIdea": "Charles Duhigg, a journalist, explains the science of habits in people, companies and whole communities. Researchers suggest that a large part of what we do each day is habit, not careful choice: how we brush our teeth, drive to work, or react when we are stressed. This saves our brains energy, but it also means we can get stuck in patterns we do not want. Duhigg tells many true stories, from a man who lost his memory, to athletes, companies and churches. His message is hopeful. Every habit follows a simple loop, and once you understand the loop you can change it. For anyone who wants to grow, or to help others grow, this is good news. Habits are not destiny. They can be rebuilt.",
   "insights": [
    {
     "emoji": "🔁",
     "title": "The habit loop",
     "body": "Every habit has three parts. A cue triggers it, like a time, place, feeling or person. A routine is the behavior itself. A reward is what your brain gets at the end, and it teaches the brain to remember this loop for next time.\n\nDuhigg describes scientists at MIT who watched the brains of rats learning a maze. At first their brains worked hard the whole time. As the route became a habit, their brains went quiet in the middle and were busy only at the start and the end. He also tells of Eugene Pauly, a man who lost his memory after a serious illness. He could not remember new facts, yet he still learned new habits, like taking a walk around his neighborhood.\n\nSo habits live deep in the brain and run with little thinking. That is good news for good habits, and bad news for bad ones."
    },
    {
     "emoji": "🤤",
     "title": "Craving is the engine",
     "body": "Habits get strong when your brain starts to expect the reward as soon as it sees the cue. That expectation is a craving, and it is the real engine of a habit.\n\nDuhigg tells how an advertising man named Claude Hopkins made toothpaste popular in America about a hundred years ago. His ads told people to feel for a film on their teeth, which gave them a simple cue. The toothpaste also had ingredients that made the mouth tingle. People began to want that fresh, tingling feeling, so they kept using it. Duhigg also tells how a company could not sell a spray that removed bad smells, until they linked it to the nice feeling at the end of cleaning a room.\n\nUnderstanding craving helps us. If we want a good habit to stick, we can make the reward clear and enjoyable, so we start to look forward to it."
    },
    {
     "emoji": "🔧",
     "title": "The golden rule of change",
     "body": "You usually cannot just delete a bad habit. Duhigg's golden rule: keep the same cue and the same reward, but swap in a new routine.\n\nHe tells his own story. Every afternoon he got up from his desk, walked to the cafeteria and bought a chocolate chip cookie, and he was gaining weight. He tested different rewards and found that what he really wanted was not sugar but a break and a chat with colleagues. So when the afternoon cue came, he went to talk with a friend instead, and the cookie habit faded.\n\nBelief also matters. Duhigg shows how groups like Alcoholics Anonymous help people replace drinking routines, and how belief, often growing in community and sometimes in faith in God, helps change last when stress comes. People change more easily together than alone."
    },
    {
     "emoji": "🗝️",
     "title": "Keystone habits",
     "body": "Some habits start a chain reaction. Duhigg calls them keystone habits.\n\nWhen Paul O'Neill became the leader of Alcoa, a big aluminum company, investors expected him to talk about profit. Instead he said his top goal was worker safety. To get close to zero injuries, the company had to change how workers reported problems, how managers listened and how ideas were shared. Those changes made the whole company work better, and profits grew.\n\nDuhigg also describes small wins. The swimmer Michael Phelps followed the same routine before every race, so he started each one with a sense of success and calm. For individuals, habits like regular exercise or eating together as a family look small, but they are linked with many other good changes. Look for the one habit that, if it changed, would pull other good habits along with it."
    },
    {
     "emoji": "💪",
     "title": "Willpower can be trained",
     "body": "Willpower works like a muscle. It gets tired with use, but it can grow stronger with practice. Duhigg describes studies where people who had to resist tasty food gave up sooner on a hard puzzle afterward, because their willpower was already tired.\n\nHe then tells how Starbucks trained its young staff. Many of them wanted to do well but struggled under stress, especially with an angry customer. Starbucks gave them simple plans for hard moments. One was called LATTE: listen, acknowledge the complaint, take action, thank the customer, and explain what happened. Staff practised these plans until they became habits, so in the hard moment they did not need to think.\n\nThe lesson for us is simple. Plan your response before the hard moment comes. Write down what you will do when a known trigger appears. Then, when it comes, you just follow the plan."
    },
    {
     "emoji": "🏘️",
     "title": "Habits in groups and movements",
     "body": "Organizations have habits too, often called routines or culture. Some are healthy, and some are dangerous. Duhigg says a crisis can be a chance to change them, because people are more open when they can see something is wrong.\n\nMovements also grow through habits. In the Montgomery bus boycott, Rosa Parks had many friends across different groups in her city. Those strong friendships, plus wider community ties, spread the protest. Then leaders like Martin Luther King Jr. gave people new habits, like meeting and walking together, so the movement kept going.\n\nDuhigg also describes Rick Warren at Saddleback Church. He started small groups so people would build habits of faith in community, not only on Sunday. For leaders, this means change is not only about inspiring speeches. It grows through relationships and new shared habits that people practise together."
    }
   ],
   "tryThis": [
    "Pick one habit you want to change and write down its cue, routine and reward.",
    "Test what reward you really want by trying a different routine when the cue comes.",
    "Plan ahead for one hard moment: decide now what you will do when it comes."
   ],
   "forUs": "A base runs on shared habits: morning worship, intercession, meals, staff meetings, how we greet new students. Some help us and some just happen out of tradition. Ask your team which keystone habit could lift everything else, like a weekly team prayer time or eating lunch together across cultures. When you help a DTS student or teammate with a struggle, remember the golden rule: look for the real need behind the habit, and walk with them in community. Habits also cross cultures, so ask Khmer and international teammates which team habits feel natural to them. On outreach, plan ahead for hard moments, like tiredness or conflict, so the team already knows how it will respond. Lasting change often comes with faith and with friends.",
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
   "bigIdea": "Cal Newport is a computer science professor who writes books and research papers, and he has never had a social media account. Deep work is focused effort with no distractions, the kind that pushes your mind to its limit and creates real value. Newport says this kind of focus is becoming rare, because phones, chats and busy offices break our attention all day. At the same time it is becoming more valuable, because the world needs people who can learn hard things and do excellent work. The book has two parts: why deep work matters, and four rules to train it. If you train your focus, you will produce better work and find more meaning in it.",
   "insights": [
    {
     "emoji": "🌊",
     "title": "Deep vs shallow work",
     "body": "Deep work is hard, focused thinking that creates something new or grows your skill. Shallow work is easy, low-focus tasks like emails, quick messages, meetings and admin. You can do it even while distracted.\n\nShallow work fills the day and feels busy. But it rarely creates something that lasts. Newport opens with the psychologist Carl Jung, who built a simple stone tower in a quiet village by a lake. He went there to think and write without interruption, and much of his most important work came from that place.\n\nWe all need some shallow work. The goal is not to remove it but to keep it in its place. Notice how much of your week is deep and how much is shallow. Many people are shocked to find that almost none of it is deep."
    },
    {
     "emoji": "💎",
     "title": "Rare and valuable",
     "body": "Newport's main claim is that the ability to focus deeply is getting rarer, and also more valuable. In a fast-changing world, two abilities help people do well: learning hard things quickly, and producing work of high quality. Both need deep focus.\n\nNewport says we learn hard skills through 'deliberate practice': working at the edge of our ability, with full attention, and getting feedback. You cannot do this while checking your phone every few minutes.\n\nHe also argues that deep work makes life more meaningful. People often feel most alive when they are fully absorbed in a hard and worthwhile task. Think of a craftsman shaping wood, or a student finally solving a hard problem. So deep work is not only about getting more done. It can bring real satisfaction and the joy of doing something well."
    },
    {
     "emoji": "🧠",
     "title": "Attention residue",
     "body": "When you switch from one task to another, part of your mind stays on the first task. A researcher named Sophie Leroy called this attention residue. Her studies showed that people who switched tasks did worse on the next one, because their thoughts were still partly on the first.\n\nThis is why a quick look at your phone is never really quick. You read one message, and even after you put the phone down, your mind keeps thinking about it.\n\nIn a day full of small checks, you may never reach full focus at all. You are always half here and half somewhere else. The fix is simple but not easy: stay on one thing for a longer block of time, and keep messages for set times. Treat your attention as precious, not as something anyone can take."
    },
    {
     "emoji": "🗓️",
     "title": "Pick your focus style",
     "body": "Newport describes four ways to make time for deep work. Monastic: cut out almost all distractions, like the computer scientist Donald Knuth, who does not use email. Bimodal: give whole days or seasons to deep work and stay open the rest of the time. Rhythmic: do deep work at the same time every day, so it becomes a habit you do not have to decide about. Journalistic: fit it in whenever a gap appears, which only works for experienced people.\n\nMost people do best with the rhythmic style. For example, you might give the first 90 minutes of each morning to your most important task.\n\nNewport also suggests clear rituals: a set place, a set time and simple rules, like no internet. Sometimes a big change helps. J.K. Rowling checked into a hotel to finish her last Harry Potter book."
    },
    {
     "emoji": "😴",
     "title": "Get comfortable with boredom",
     "body": "If you reach for your phone every time you are bored, your brain learns to need something new every few seconds. Then, when you sit down to do hard work, it fights you and wants a distraction.\n\nSo practise being bored. Wait in line or walk without a screen. Newport suggests planning set times for the internet, instead of set times away from it. Outside those times, stay offline, even if you have nothing else to do.\n\nHe also suggests 'productive meditation'. While you walk or travel, think about one clear problem. When your mind wanders, gently bring it back. Another training idea is memorizing things, like the order of a deck of cards, to build mental strength. These practices sound simple. Over time they help your mind stay with one thing for longer."
    },
    {
     "emoji": "📵",
     "title": "Choose your tools on purpose",
     "body": "Many of us keep an app because it has some small benefit. Newport calls this the any-benefit approach. Instead, think like a craftsman choosing tools. Name your most important goals. Then ask: does this tool help those goals much more than it hurts them? If not, let it go.\n\nFor social media, he suggests a test. Quit a platform for 30 days without telling anyone. After the month, ask two questions. Would the last month have been clearly better if I had used it? Did people care that I was gone? If both answers are no, you may not need it.\n\nHe also warns against filling free time with aimless browsing. Plan your free time with good things, like reading, hobbies or time with friends. Chosen rest is usually more refreshing than endless scrolling."
    },
    {
     "emoji": "🔚",
     "title": "End the day properly",
     "body": "Newport suggests planning every hour of your work day in blocks, on paper. When things change, and they will, just make a new plan for the rest of the day. The point is not to be strict. It is to choose, not drift.\n\nHe also suggests limiting shallow work on purpose, even agreeing with your boss on how much of your time it should take. And he says to make yourself a bit harder to reach, so others think before they send another message.\n\nAt the end of the day, use a simple shutdown routine: check your tasks, write a plan for tomorrow, then stop. Rest is not lazy. Evenings off let your mind recharge and even work on problems in the background. You cannot do deep work all day, so protect your rest too."
    }
   ],
   "tryThis": [
    "Block 90 minutes this week for one important task. Phone in another room, door closed.",
    "Next time you wait in line, do not touch your phone. Just notice and pray.",
    "Create a 3-step shutdown routine for the end of your work day and use it for one week."
   ],
   "forUs": "Base life is full of interruptions: someone at the door, a group chat, a guest who needs help. Those moments matter, and people come first. But preparing DTS teaching, writing a newsletter to supporters, or learning Khmer needs protected time. Agree as a team on some quiet hours, so everyone gets space to do their best work. Leaders can help by not expecting instant replies to every message, especially in the evening. Try one morning a week with no meetings, so deep tasks get the best hours, not the leftovers. Time alone with God is deep work too. Jesus often went to quiet places to pray, even when crowds were waiting for him.",
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
   "bigIdea": "Most people think money is about maths: earn more, spend less, invest well. Morgan Housel, a writer about finance, says doing well with money is not mainly about being smart. It is about behavior: patience, humility, and how you act when things feel scary or exciting. A person with little education can do very well if they behave wisely, while a trained expert can lose everything through pride or greed. In short chapters, Housel tells true stories to show that our past, our feelings and our ego shape our money choices more than spreadsheets do. This matters for everyone, rich or poor, because money touches our worries, our families and our freedom.",
   "insights": [
    {
     "emoji": "🌍",
     "title": "Nobody is crazy",
     "body": "Everyone's money habits make sense to them, based on what they have lived through. Housel notes that people who grew up when prices were rising very fast think about money very differently from people who grew up in calm, stable times. Someone who lived through a big crash may never trust investing again.\n\nHe gives a surprising example. In the United States, people with low incomes spend a lot on lottery tickets. To outsiders it looks foolish. But for someone who feels there is no other path to a better life, a ticket feels like buying a dream. It makes sense from inside their story.\n\nSo before you judge someone's money choices, ask about their story. And look at your own. Some of your strong beliefs about money may come from your family's experience, not from wisdom."
    },
    {
     "emoji": "🎲",
     "title": "Luck and risk are twins",
     "body": "Some success is luck, and some failure is bad luck. Housel says they are two sides of the same coin, because both come from forces outside our control.\n\nHe tells the story of Bill Gates, who went to one of very few high schools in the world that had a computer in the late 1960s. That was a huge piece of luck. Gates had a close friend there, Kent Evans, who was just as gifted and shared his dreams. But Kent died in a mountain climbing accident before finishing school. Similar talent, similar start, very different outcome.\n\nSo be careful copying one famous person's success, because luck is part of every story. And be kind to yourself and others about failures, because not every bad result comes from a bad decision."
    },
    {
     "emoji": "⏳",
     "title": "Time is the secret ingredient",
     "body": "Compounding means small growth that builds on itself over many years. Warren Buffett is a great investor, but Housel says the main secret of his huge wealth is time. He started investing as a child and kept going into old age. Most of his wealth came after his mid-60s.\n\nHousel also tells of Ronald Read, a janitor and gas station worker. He lived simply, saved what he could and invested for decades. When he died, he left millions of dollars, much of it to his local library and hospital. Meanwhile, a highly educated finance leader lost his fortune by borrowing too much.\n\nGetting money and keeping it are different skills. Keeping it needs humility, saving, and avoiding big risks that could wipe you out. Staying in the game for a long time matters more than big wins."
    },
    {
     "emoji": "🙈",
     "title": "Wealth is what you do not see",
     "body": "As a young man, Housel worked as a valet, parking cars at a hotel. He saw expensive sports cars and assumed the drivers were rich and impressive. Later he realized many of them were not wealthy at all. They had spent or borrowed their money to buy the car.\n\nExpensive cars and phones show money that was spent, not money that was kept. Real wealth is the savings no one can see. It is the car you did not buy and the upgrade you skipped.\n\nHe also describes what he calls the 'man in the car paradox'. When we see someone in a nice car, we rarely think how cool the driver is. We imagine ourselves in that car. So people buy nice things hoping to be admired, but others usually admire the things, not the person."
    },
    {
     "emoji": "🕊️",
     "title": "Freedom is the real reward",
     "body": "Housel says the best thing money can give you is control over your time. Being able to choose what you do, when you do it and who you do it with brings more happiness than more stuff.\n\nHe notes that many people in rich countries have far more money and comfort than their grandparents had, yet they are not much happier. One reason is that they have less control over their days. They work long hours, answer messages at night, and feel they cannot say no.\n\nEven a small amount of savings gives some freedom. It might mean you can wait for a better job, care for a sick family member, or take a break when you need it. Freedom is not only for the rich. It grows a little each time you spend less than you earn."
    },
    {
     "emoji": "🛟",
     "title": "Leave room for error",
     "body": "Plans almost never go exactly to plan. Housel says the most important part of any plan is planning for the plan not working. He calls this leaving room for error.\n\nA buffer of savings means one surprise does not destroy you. A medical bill, a broken motorbike or a family emergency can be handled without panic or new debt. Housel also says you can save without a specific reason. You do not need to know what the money is for, because the future will bring things no one can predict.\n\nHe adds a balance. Be hopeful about the long term, but careful about the short term. Things often get better over many years, but the road is full of bumps. Room for error helps you survive the bumps, so you can still be there for the good years."
    },
    {
     "emoji": "🏁",
     "title": "Know when you have enough",
     "body": "If you keep moving the finish line, you will never feel satisfied. Housel tells of Rajat Gupta, a businessman who rose from a poor childhood in India to great wealth and respect. Yet he wanted even more, broke the law by trading on secret information, and went to prison.\n\nHousel also shares a well-known story about two writers at a party at a billionaire's home. One writer said he had something the rich man would never have: the knowledge that he had enough.\n\nComparing yourself with others keeps the finish line moving, because there will always be someone with more. Knowing what 'enough' looks like for you is a quiet kind of strength. It stops you from taking risks you do not need. It protects what matters most: your character, freedom, family and peace."
    }
   ],
   "tryThis": [
    "Write down one money belief you learned from your family growing up. Is it still helping you?",
    "Start a small emergency fund, even if it is just a few dollars each month.",
    "Write one sentence that describes what 'enough' looks like for you right now."
   ],
   "forUs": "Many missionaries live on support, and many local staff support whole families, so money can feel tight and personal. This book is not about getting rich. It helps us be wise with what God has given, avoid comparing ourselves with each other, and keep a little margin so one emergency does not become a crisis. It also reminds us that Khmer and international staff come with very different money stories, and both deserve respect. Be slow to judge how others spend. Generosity helps too. When we give, even a little, we learn to hold money with open hands. And remember that contentment is a Bible value too: Paul learned to be content with much or with little.",
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
   "bigIdea": "Why do urban legends and proverbs spread easily, while important ideas from teachers and leaders are forgotten by lunch? Chip Heath is a professor who studied why some stories spread, and his brother Dan is an educator. Together they studied what makes ideas 'sticky': easy to understand, remember and pass on. Their good news is that sticky ideas are not about talent. They share six common traits, and anyone can learn them. The brothers made these into a simple checklist that spells SUCCESs: Simple, Unexpected, Concrete, Credible, Emotional and Stories. They also name the villain that makes good ideas fail. For anyone who teaches, preaches, trains or shares a message, this book is a practical toolkit.",
   "insights": [
    {
     "emoji": "🙉",
     "title": "The curse of knowledge",
     "body": "Once you know something, it is hard to imagine not knowing it. The authors call this the curse of knowledge.\n\nThey describe an experiment at Stanford. Some people tapped the rhythm of a well-known song, like Happy Birthday, on a table. Others listened and tried to guess the song. The tappers expected listeners to guess about half the songs. In fact, listeners guessed only about 1 in 40. The tappers could hear the music in their heads. The listeners only heard knocking.\n\nExperts and leaders are often like the tappers. We use words, ideas and shortcuts that are clear to us but not to others. The fix is to keep asking: what does my listener already know? Then use the SUCCESs tools to turn our knowledge into something others can grasp."
    },
    {
     "emoji": "🎯",
     "title": "Simple: find the core",
     "body": "Simple does not mean shallow. It means finding the one most important point and cutting everything else, even good things. The authors call this finding the core.\n\nThe military uses 'Commander's Intent': a short, clear statement of the goal, so soldiers know what to do when plans change in battle. Southwest Airlines had a simple core too: be the low-fare airline. When someone suggested adding a nice salad to a flight, the question was easy. Does it help us be the low-fare airline? If not, the answer is no.\n\nSimple ideas also build on what people already know. Proverbs are a great example: short, deep and easy to remember. Everything else in a message should serve the core. So ask yourself: if people remember only one thing from my message, what should it be?"
    },
    {
     "emoji": "😲",
     "title": "Unexpected: break the pattern",
     "body": "Surprise gets attention. Curiosity keeps it. The authors say to break people's guessing patterns first, then fill the gap.\n\nThey tell of a journalism teacher who gave students the facts about a school event and asked them to write the opening line of a news story. The students listed the speakers and topics. Then the teacher told them the real news: there would be no school next Thursday. In one surprising moment, they learned that news is about what matters to the reader.\n\nCuriosity works through gaps. When we notice a gap in our knowledge, like a question or a mystery, we want to close it. Instead of starting with facts, start with a puzzle. Make people wonder why, or what happens next, and they will stay with you to find out."
    },
    {
     "emoji": "🧱",
     "title": "Concrete: make it touchable",
     "body": "Abstract words slide out of our minds. Things we can see, hear or touch stay in. The authors point to an old fable about a fox who cannot reach some grapes and decides they were probably sour anyway. The story is so concrete that the phrase 'sour grapes' has lasted for thousands of years.\n\nThey also tell how a health group helped people understand how unhealthy movie theater popcorn was. A medium bag had about as much bad fat as a bacon-and-eggs breakfast, a burger and fries for lunch, and a steak dinner, all together. People could picture that, and many stopped buying it.\n\nUse real examples, real people and real objects instead of big general words. Do not just say you value welcome. Show what it looks like at the door."
    },
    {
     "emoji": "✅",
     "title": "Credible: help people believe",
     "body": "Why do people believe an idea? You do not always need an expert. The authors say vivid details, true stories and letting people test an idea for themselves can all build trust.\n\nOne doctor, Barry Marshall, believed that most stomach ulcers were caused by bacteria, but other doctors would not believe him. So he drank a glass of the bacteria, got sick, and helped prove his point. Years later he won a Nobel Prize. Another way is a claim people can check themselves, like a burger ad that simply invited customers to look and see the difference.\n\nBig numbers are hard to feel. The authors describe a speaker who dropped one small metal ball into a bucket to stand for one bomb, then poured in thousands to show the world's nuclear weapons. People could hear the size. Make big numbers human-sized."
    },
    {
     "emoji": "❤️",
     "title": "Emotional: make them care",
     "body": "People respond more to one person than to a huge statistic. The authors describe research where people gave much more money to help one hungry girl in Africa, named Rokia, than after reading facts about millions of hungry people. When the story and the statistics were combined, giving dropped. Thinking about numbers seemed to turn off feeling.\n\nSo show the one child, the one family, the one story. Help people care first, and the facts will mean more. Even one name and one face can make a cause feel real.\n\nAlso connect the idea to what people already care about, including who they are. A campaign against littering in Texas worked because it used famous football players and a message about Texan pride. People did not change because of facts about rubbish. They changed because it touched their identity."
    },
    {
     "emoji": "📖",
     "title": "Stories: show, do not just tell",
     "body": "Stories work like a practice run for real life. Hearing a story helps us imagine what we would do in that situation, so we are more ready when it happens.\n\nThe authors tell of Jared, a young man who lost a lot of weight by eating Subway sandwiches. A local store owner noticed his story, and it became a famous ad campaign. The story was already there. Someone just had to spot it.\n\nThey point to three common kinds of inspiring stories. The challenge story, where someone weak overcomes a big obstacle. The connection story, where people cross a gap of race, class or culture to help each other, like the good Samaritan. And the creativity story, where someone solves a problem in a new way. Look for these stories around you and tell them well."
    }
   ],
   "tryThis": [
    "Before your next talk, write your main point in one short sentence. If you cannot, simplify.",
    "Swap one statistic in your next presentation for the story of one real person (with permission).",
    "Ask a newcomer to explain your idea back to you to check for the curse of knowledge."
   ],
   "forUs": "We explain things all the time: teaching in DTS, sharing the gospel on outreach, training new staff, telling supporters what God is doing. Many listeners are hearing it in their second or third language, so simple and concrete matters even more. Watch for the curse of knowledge with YWAM words and Christian words that new students may not know. Jesus taught with seeds, coins, sheep and bread, things people could see every day. We can do the same with local examples, like rice fields, rain and family meals. Before you teach, ask a Khmer teammate to listen and tell you what was unclear. One clear point and one true story will often reach further than a long, perfect speech.",
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
   "bigIdea": "Godin got the idea for this book on a family drive through France. At first, the cows in the fields looked lovely. But after a while, nobody in the car even looked out the window. A field of brown cows becomes boring fast. A purple cow, though? Everyone would look. Godin's point is simple: the old way of getting noticed, buying lots of ads, works less and less. People have too many choices and too little time, so they filter out almost everything. The only thing that still gets through is something truly remarkable, something people want to talk about. For anyone who leads a team or serves people, this is a real challenge. It is not enough to do good work. The question is whether your work is worth telling someone else about.",
   "insights": [
    {
     "emoji": "🐄",
     "title": "Remarkable means worth a remark",
     "body": "Godin uses the word 'remarkable' in a very plain way: worth making a remark about. It is not about being fancy or expensive. It means people notice it and want to share it.\n\nHis key point is that this must be built into the thing itself. You cannot make a boring product and then fix it with a clever poster at the end. One example from the book is Dutch Boy paint. For many years, paint cans all looked the same: heavy metal tins that were hard to open and messy to pour. Dutch Boy made a plastic container with a handle and a twist-off lid. The paint inside did not change, but the container was new and useful, and people noticed and talked about it.\n\nSo when you plan something new, ask early: what about this is worth talking about? Put that answer into the design from the very start, not at the end."
    },
    {
     "emoji": "📺",
     "title": "Shouting does not work anymore",
     "body": "For many years, companies followed a simple recipe. Make an average product for average people, then buy lots of TV ads. Godin calls this the TV-industrial complex. It worked because people had few channels and few choices, so they paid attention to the ads.\n\nToday that has changed. People are busy, they already have most of what they need, and they see a huge number of messages every day. So they ignore ads and only look for things they already want. Godin says marketers used to talk about the 'P's of marketing, like product, pricing, promotion and packaging. He adds a new P: the Purple Cow. Without it, the other P's do not matter much.\n\nFor us, the lesson is that more noise is not the answer. More emails, more posters or louder talking will not help if what we offer is forgettable. Put your energy into making the thing itself worth noticing."
    },
    {
     "emoji": "😐",
     "title": "Very good is boring",
     "body": "This may be the most surprising idea in the book. We think that if we make something 'very good', people will come. Godin says no. There are already many very good options in almost every area. Very good is normal now, so it blends in like one more brown cow.\n\nHe goes further: the safe choice has become the risky choice. When a team plays it safe, avoids criticism and copies what others do, it often ends up invisible. Being remarkable means some people will not like what you do, and that feels risky. Godin points to the Aeron office chair from Herman Miller. It looked strange, and many people did not like it at first, but it became a famous design that people loved to talk about.\n\nCriticism is not always a sign that you are wrong. Sometimes it is the price of doing something worth noticing. Ask yourself honestly whether you are choosing 'safe' only because of fear."
    },
    {
     "emoji": "🗣️",
     "title": "Find the people who talk",
     "body": "You cannot reach everyone at once, so do not try. Godin uses a simple picture of how new ideas spread. First, a small group of early adopters tries something new. If they love it, it slowly spreads to the big middle group, who are more careful and wait to see what others do.\n\nGodin says to focus on two kinds of people at the start. 'Sneezers' are people who love to tell others about things they like, so ideas spread through them like a cold. 'Otaku' is a Japanese word he uses for people who are deeply excited about one topic, like someone who will travel across town to try a new hot sauce. These people go looking for new things.\n\nSo find the people who already care a lot and give them something worth sharing. Listen to them closely. If they get excited, they will do the talking for you."
    },
    {
     "emoji": "🎯",
     "title": "Design for the edges",
     "body": "Most teams design for the average person. But the average person does not care much and does not talk much. Something made to please everyone often excites no one.\n\nGodin suggests going to the edge. What would the fastest version look like? The simplest? The friendliest? The most surprising? Find an edge others are afraid to go near, and go there. He also says it is fine, even wise, to design for a small group who will love it, instead of a big crowd who will only feel okay about it. Silk soymilk is one example in the book. Instead of sitting on the normal shelf with other long-life drinks, it was placed in the cold section next to real milk, in a carton that looked like milk. That small move got it noticed.\n\nFor your own work, pick one edge and push it a little further than feels normal."
    },
    {
     "emoji": "🔄",
     "title": "Do not get stuck",
     "body": "A purple cow does not stay purple forever. Over time, people get used to it, others copy it, and it slowly becomes another brown cow.\n\nGodin's advice has two parts. First, when you have something remarkable, enjoy it and make the most of it. He calls this milking the cow: use the attention well, grow it and serve people with it. Second, while it is still working, start building the next remarkable thing. Many organisations get stuck because the old success feels safe, so they stop taking risks. Then, when the old idea fades, they have nothing new. A simple everyday example: a cafe might become famous for one special drink. That is great, but if it never tries anything new, in a few years that drink is just normal.\n\nSo keep a habit of trying small, fresh ideas, even when things are going well. Use what works, and test what is next."
    }
   ],
   "tryThis": [
    "Pick one thing your team does. Ask: what would make people want to tell a friend about it?",
    "List the 'sneezers' who love what you do, then ask them for honest feedback.",
    "Change one small detail this week to be surprising in a good way."
   ],
   "forUs": "Think about our cafe, our guest hospitality, or the way we welcome DTS students on day one. Being remarkable does not need a big budget. It can be a guest remembered by name, a handwritten welcome note, or a song from the Khmer team. It can be an outreach team that listens first, or a school week that ends with a surprise thank-you for the cooks and cleaners. Godin's 'sneezers' are already among us: students who post photos, partners who tell their churches, neighbours who tell their friends. But being remarkable is not about showing off or competing with other ministries. For us, it starts with loving people so well, and so personally, that they cannot help talking about it. And when they do talk, we hope they see Jesus, not just us.",
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
   "bigIdea": "Many people feel stuck with their thoughts. Worry, fear and old hurts can play again and again, like a song that will not stop. Caroline Leaf, a communication pathologist and Christian author, wrote this book to say we are not stuck. Her main claim is that your mind can change your brain. She mixes ideas from neuroscience with Bible teaching about renewing the mind, and she says the thoughts we choose actually shape our brain and body. Some of her scientific claims are debated by other scientists, so it is wise to read those parts with care. But her main message is full of hope: with God's help, we can notice our thinking, reject what is toxic and build new, healthy patterns. For anyone serving others, healthy thinking affects how we lead, love and last.",
   "insights": [
    {
     "emoji": "🌱",
     "title": "Thoughts are real things",
     "body": "Leaf argues that thoughts are physical, not just ideas floating in the air. In her view, each thought leaves a real trace in the brain. She often describes thoughts and memories as looking like little trees, with branches that grow as we think about something again and again.\n\nThis helps explain why some thoughts feel so strong. If you have told yourself 'I am a failure' a thousand times, that thought has had a lot of time to grow. It is not just a passing feeling; it has become a well-worn path. Leaf says the same is true for good thoughts. Truth and hope can also grow strong if we feed them.\n\nWhy does this matter? Because it means what we think about often is important. You cannot stop every thought from coming, but you can choose which ones you water and which ones you let die."
    },
    {
     "emoji": "🔧",
     "title": "The brain can change",
     "body": "Leaf leans on the idea of neuroplasticity. This is a big word with a simple meaning: the brain can change, adapt and rewire all through life. For a long time, many people believed the adult brain was fixed. Today, scientists widely agree that the brain keeps changing as we learn and practise new things.\n\nHere is a simple everyday example. When you learn a new language, like Khmer or English, the first weeks feel hard and slow. Your brain is building new connections. After months of practice, the words come faster. Your brain has changed to match what you kept doing.\n\nLeaf goes further than most scientists. She argues that our choices and thinking can drive much of this change, and she links some ideas to quantum physics, which many experts say stretches the science too far. Still, the basic hope is sound: you are not too old, too broken or too set in your ways to grow."
    },
    {
     "emoji": "🎛️",
     "title": "You are not a victim of your biology",
     "body": "A key message of the book is that your genes and your past are not the final word on who you become. Leaf says the mind is in control of the brain, not the other way round. She talks about free will and about epigenetics, a field that studies how things like stress and lifestyle can affect the way our genes work.\n\nIn her view, this means we are not just machines run by chemicals. We can make choices that change our direction. She encourages readers not to use 'this is just how I am' as an excuse to stay stuck.\n\nThis is her view, and many experts would describe it in a more balanced way. Biology, trauma and mental illness are real, and willpower alone does not fix everything. But there is a helpful truth here: you have more choice than you might think, and God's grace is bigger than your history."
    },
    {
     "emoji": "❤️",
     "title": "Made for love, not fear",
     "body": "Leaf argues that we are designed for love. She says love is our natural state, and that fear and toxic thinking are learned along the way, through hurt, stress and poor choices. Because they are learned, in her view, they can also be unlearned.\n\nShe links this to Bible verses. One is the promise that God has not given us a spirit of fear, but of power, love and a sound mind. Another is Paul's call to be changed by the renewing of our minds and to take every thought captive. She also writes about how long-term fear and stress can harm the body, not just the mind.\n\nWhy does this matter? Because it changes how we see our struggles. Fear is not our true identity. When we notice fear-based thinking, we can bring it to God and choose love instead. This does not happen in one day, but it can happen step by step."
    },
    {
     "emoji": "🔀",
     "title": "Multitasking does not really work",
     "body": "Leaf says that switching quickly between many tasks leads to shallow, scattered thinking. She calls the idea that we can do many things well at the same time a myth. When we try, our attention jumps around and we do each thing less well.\n\nInstead, she encourages focused, deep thinking about one thing at a time. She believes this kind of thinking is how real learning and healthy change happen. In her view, deep thinking builds strong, clear memories, while shallow thinking builds weak ones.\n\nHere is an everyday example. You sit down to study or pray, but your phone buzzes every two minutes. You check messages, come back, then check again. After an hour, you feel tired, but you have not gone deep at all. Try the same hour with your phone in another room, and it often feels very different. Focus is a gift you can give your mind."
    },
    {
     "emoji": "📝",
     "title": "A 21-day detox plan",
     "body": "The second part of the book is a practical plan for working on one toxic thought pattern at a time. Leaf calls it the 21-Day Brain Detox. She suggests spending a few minutes each day, for 21 days, on the same thought. She says it takes about 21 days to begin changing a thought, and longer to make the new way of thinking a habit, though other experts question these exact numbers.\n\nThe plan has five simple steps. Gather: become aware of your thoughts and feelings. Focused reflection: think deeply about one toxic thought. Write: put it on paper so you can see it clearly. Revisit: read it again and look for a healthier, truer way to see it. Active reach: do one small action that practises the new thought.\n\nThe big lesson is patience. Change is not a quick fix. Small steps, repeated every day with God, can slowly reshape how we think."
    }
   ],
   "tryThis": [
    "Notice one thought that keeps coming back this week. Write it down and ask: is this true?",
    "Find a Bible verse that speaks truth into that thought and read it every morning for 21 days.",
    "Spend 10 minutes doing one thing with full focus: no switching, no phone."
   ],
   "forUs": "Mission life can bring stress, homesickness, culture shock and old wounds to the surface. Many of us arrive with thought patterns we did not know we had. This book can help us notice our thinking and bring it to God. In DTS, on outreach or in a staff team, we can help one another by asking gentle questions, praying together and speaking truth from the Bible. At the same time, this book is not a replacement for medical or mental health care, and some of its science is debated. If someone is really struggling, please help them find proper support too. Renewing the mind and getting good care can go together.",
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
   "bigIdea": "Donald Miller is a writer who spent years studying how good stories are built. He noticed that many businesses and organisations have good products but still struggle, and he believes the main reason is confusing messages. People's brains filter out anything that is hard to understand. If a message makes people think too hard, they simply ignore it. Miller's fix is to use the shape of a good story. In this story, the customer is the hero and you are the helpful guide. His seven-part framework, called SB7, follows the pattern of most films: a hero wants something, meets a problem, finds a guide, gets a plan, is called to act, and then either fails or succeeds. If you use this pattern, people understand what you offer in seconds. For leaders and teams, clear words can be the difference between being ignored and being heard.",
   "insights": [
    {
     "emoji": "🧠",
     "title": "Clarity beats clever",
     "body": "Miller says the brain is always trying to save energy. Its main job is to help us survive and thrive, so it pays attention to things that help with that and ignores the rest. A confusing message costs energy, so the brain tunes it out.\n\nHe offers a simple check he calls the grunt test. Imagine a caveman looking at your website or poster for just a few seconds. Could he grunt back three answers? What do you offer? How will it make my life better? What do I need to do to get it? If he cannot, your message is not clear enough.\n\nMany teams try to sound smart or clever, using fancy words or inside jokes. Miller's view is that when you confuse people, you lose them. So choose simple, clear words over clever ones, every time. Clear is kind, especially for readers who use English as a second language."
    },
    {
     "emoji": "🦸",
     "title": "They are the hero",
     "body": "Every good story starts with a character who wants something. Miller says this character is your customer, not you. Your job is to find one clear thing they want and make your whole message about helping them get it.\n\nHe warns against two mistakes. The first is not naming a desire at all, so people do not know why they should care. The second is naming too many desires, so the message becomes blurry. Pick one. Miller also suggests the desire should connect to something people really need, like saving time or money, finding belonging or feeling safe.\n\nHere is a simple everyday example. A language school could talk about its building, its history and its teachers. Or it could promise that students will soon speak Khmer with confidence at the market. The second message puts the student at the centre. When people see themselves as the hero, they lean in and want to know what happens next."
    },
    {
     "emoji": "🐉",
     "title": "Name the problem",
     "body": "Every story needs a problem, and the clearer the problem, the more people care. Miller suggests showing the problem as a villain, something specific that people can stand against.\n\nHe says problems come in three levels. The external problem is the practical thing on the surface. The internal problem is how that makes people feel inside. The philosophical problem is why it is simply wrong that things are this way. Miller's main point is that people often buy solutions to the internal problem. He uses the car company CarMax as an example. The external problem is needing a car. But for many people, the internal problem is feeling nervous and pushed around by salespeople. CarMax spoke to that feeling by letting people buy without haggling over the price, and it worked.\n\nSo when you describe a need, go deeper than the surface. Ask: how does this problem make people feel?"
    },
    {
     "emoji": "🧙",
     "title": "Be the guide, not the hero",
     "body": "In films, the hero is not the one with all the answers. They need a guide, like Yoda in Star Wars or Haymitch in The Hunger Games. Miller says brands and organisations should play this guide role.\n\nA good guide shows two things. Empathy means showing people that you understand how they feel. Authority means showing that you can really help. You can show authority in simple ways, like stories from people you have helped, a few numbers, awards or years of experience. You do not need to brag; you just need to show you can be trusted.\n\nWhen brands make themselves the hero and talk only about their own story and success, people stop listening. Everyone is busy with their own story and is looking for someone to help them win. Miller's point is humbling: often the most helpful thing is to step back, care about people's struggles and offer them a hand."
    },
    {
     "emoji": "🗺️",
     "title": "Give a plan and a call",
     "body": "Even when people trust the guide, they can still feel unsure about the next step. So Miller says guides should give a simple plan, often just three or four steps, like book a call, get a plan, start growing. This makes the path feel clear and safe. He also mentions an agreement plan: a few promises that remove fear, like a clear refund policy.\n\nThen the guide must clearly call the hero to act. Many organisations only hint and hope people will work it out. Miller says to be direct, with a clear button or line like Book now or Join us. He calls this a direct call to action.\n\nHe also suggests a transitional call to action for people who are not ready yet. This could be a free guide, a short video or a sample. It keeps the relationship going until they are ready to take the bigger step."
    },
    {
     "emoji": "🏆",
     "title": "Show what's at stake",
     "body": "Stories need stakes. If nothing can be lost or gained, nobody cares what happens. Miller says many messages forget this and feel flat.\n\nFirst, show briefly what failure looks like if nothing changes. Miller warns not to overdo it. A little fear helps people see why it matters, but too much makes them turn away. Then paint a clear, positive picture of success. What will life look like after the hero accepts your help? Use simple, concrete pictures that people can imagine.\n\nMiller ends with the idea of transformation. In the end, people do not only want a product; they want to become someone better, more capable, more confident or more at peace. Good brands help people see who they could become. So in your message, show the change: from stressed to calm, from lost to clear, from alone to belonging. That picture of a better self is what moves people to act."
    }
   ],
   "tryThis": [
    "Write a one-liner for your ministry: the problem, your solution, and the result.",
    "Look at one poster or post and ask: is the audience the hero, or are we?",
    "Turn your sign-up process into three simple steps and share them clearly."
   ],
   "forUs": "We share many messages at GP: DTS promotion, school brochures, cafe menus, outreach reports and newsletters to supporters. It is easy to make ourselves the hero of every story, telling how busy we are and how much we did. StoryBrand reminds us that students, guests, partners and local communities are the heroes, and we are guides who walk alongside them, pointing toward growth and toward God. In a supporter letter, we can tell the story of one student who grew, not just list our activities. On a DTS poster, we can show what a student will gain, with one clear next step. Clear, simple words also help Khmer and international readers who use English as a second language. And as followers of Jesus, being the guide and not the hero fits who we want to be anyway.",
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
   "bigIdea": "Why is it so hard to do the things that matter most? Steven Pressfield, a novelist and screenwriter, says it is because every person who tries to create or do something good faces an invisible enemy. He calls it Resistance. It shows up as fear, delay, distraction, excuses and self-doubt. Pressfield knows this enemy well. He struggled for many years before he finally finished and published his work. In this short, punchy book, he names the enemy, shows how to fight it, and then points to a deeper source of help. His answer is not to wait for inspiration. It is to 'turn pro': to show up and do the work every day, no matter how you feel. For anyone with a calling, whether in art, ministry or leadership, this book is a strong wake-up call.",
   "insights": [
    {
     "emoji": "👻",
     "title": "Meet Resistance",
     "body": "Resistance is the inner force that stops you from starting or finishing anything that would help you grow. Pressfield gives a long list of things that trigger it: writing or any creative work, starting a business, a diet or exercise plan, spiritual practice, study, standing up for what is right, or any big commitment.\n\nHe describes Resistance as invisible, inside you, and never fully gone. It does not care who you are; it attacks beginners and experts alike. It is often strongest near the finish line, when you are close to completing something important.\n\nNaming the enemy helps. When you know Resistance is normal and expected, you stop thinking something is wrong with you. Then you can face it again today."
    },
    {
     "emoji": "🧭",
     "title": "It points to what matters",
     "body": "Here is the twist. Pressfield says Resistance is strongest against the things that matter most for our growth and calling. The more important a task is to your soul, the more you will feel a push to avoid it.\n\nSo that heavy, avoiding feeling can actually work like a compass. If you strongly avoid writing that teaching, having that hard talk or starting that project, it may be exactly what you are meant to do. Pressfield also says Resistance only pushes one way: it fights us when we move toward something higher, not when we drift toward something easy.\n\nHere is an everyday example. Few people feel Resistance about scrolling on their phone. But many feel it when they try to pray for thirty minutes or study a language. That is a clue. Next time you feel strong Resistance, do not just run away. Ask: is this showing me what really matters?"
    },
    {
     "emoji": "⏳",
     "title": "Its favourite tricks",
     "body": "Resistance is clever. Its favourite trick is procrastination, the voice that says 'I'll start tomorrow'. It rarely tells us to give up completely. It just says later, again and again, until later never comes.\n\nPressfield lists many other tricks. Resistance can use drama and trouble, creating problems that grab our attention. It can use busyness, unhealthy habits and ways of numbing ourselves. It can make us play the victim or wait for someone to rescue us. It can also hand us smart-sounding excuses. Pressfield says many of these reasons are actually true, which makes them harder to argue with, but they are still Resistance.\n\nHe also says fear can be a good sign. If you are afraid of something, it may be because it matters. Professionals feel fear too, but they act anyway. Learn to spot these tricks in your own life, and name them when they show up."
    },
    {
     "emoji": "💼",
     "title": "Amateur vs professional",
     "body": "The second part of the book is all about how to fight back. Pressfield's answer is to turn pro. An amateur works when they feel like it, when they are inspired or when life is easy. A professional shows up every day, no matter how they feel.\n\nPressfield tells a story about the writer Somerset Maugham. Someone asked Maugham if he wrote only when inspiration came. He answered that yes, he did, and he made sure it came every morning at nine o'clock. The point is that discipline comes first, and inspiration follows.\n\nPressfield lists more marks of a pro. They are patient, they keep learning their craft, they act even when afraid, they ask for help, and they do not take failure personally. They take the work seriously but not themselves, and they do not let praise or criticism control them. Anyone can turn pro. It is a decision, not a special talent."
    },
    {
     "emoji": "✍️",
     "title": "Just sit down and start",
     "body": "Pressfield describes his own working day. He gets up, does some ordinary tasks, then reads an old prayer from Homer's Odyssey that calls on the Muse, and sits down to write. He works for a set number of hours. When he is done, he stops. He does not keep judging what he wrote. He has done his job for the day, and that is enough.\n\nHis big point is that the hardest part is beginning. Resistance is strongest before we start. Once we sit down and begin, the work often starts to pull us forward, and ideas come that we did not expect.\n\nHere is an everyday example. You dread cleaning a messy room, and just thinking about it feels heavy. But once you pick up the first few things, it is easier to keep going. The same is true for writing, studying or praying. Do not wait to feel ready. Sit down, start small and keep a regular time."
    },
    {
     "emoji": "✨",
     "title": "Help from beyond",
     "body": "In the last part, Pressfield talks openly about a higher realm. He uses words like the Muse and angels. He believes that when we commit to our work and show up faithfully, unseen help comes alongside us, and ideas arrive that feel like gifts.\n\nHe also compares two ways of living. Some people live by hierarchy: they always compare themselves with others and care most about rank and approval. Pressfield says a creative person should live by territory instead. Their sense of worth comes from the work itself and from doing it day after day, whether anyone notices or not. He points to the old Hindu text the Bhagavad Gita, which teaches that we have a right to our work but not to its results.\n\nPressfield's spiritual view is not the same as Christian faith, so read this part wisely. But the lesson is still useful: do the work for its own sake, not for praise, and offer it up."
    }
   ],
   "tryThis": [
    "Name one task you keep avoiding, and write down how Resistance shows up for you.",
    "Set a fixed 25-minute time each day this week and do that task, no matter how you feel.",
    "When you finish, stop and let it go, without judging how good it was."
   ],
   "forUs": "On a busy base, Resistance often hides behind good things: one more meeting, one more chat, one more errand. It can keep us from prayer, language study, preparing a teaching or starting that new ministry idea God put on our heart. In DTS, it might look like putting off a hard but needed talk with a student. On outreach, it might look like staying busy so we do not have to share our faith. Pressfield writes from his own spiritual view, which is different from ours. But as followers of Jesus we can take the core lesson: be faithful every day, even in small things, and trust God to meet us in the work. We do not work to earn love or praise. We work as worship, and we leave the results to God.",
   "oneLine": "Resistance is real, but showing up every day like a pro is how you beat it."
  }
 ]
};
