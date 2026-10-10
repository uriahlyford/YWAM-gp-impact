/*  The Library — ten-minute reads of the books on Craig Groeschel's four
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
  },
  {
   "id": "gp",
   "name": "Made at GP",
   "emoji": "🌉",
   "color": "#A4572A",
   "ink": "#6B3315"
  }
 ],
 "cover": {
  "paper": "#FAF6F0",
  "ink": "#17150F",
  "accent": "#FFB323"
 },
 "palette": {
  "paper": "#FAF6F0",
  "ink": "#17150F",
  "cobalt": "#1F44FF",
  "marigold": "#FFB323",
  "blue": "#2D6CB0",
  "berry": "#B5475A",
  "teal": "#1F8A6F",
  "plum": "#6B4FA0",
  "laterite": "#A4572A"
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
   "mins": 10,
   "vibe": "Leadership is not a job title. It's influence — and you can grow it.",
   "bigIdea": "Many people think leaders are born, or that leadership comes with a title. John Maxwell disagrees. He was a pastor for many years and later became one of the best-known trainers of leaders in the world. In this book he says leadership is simply influence: the ability to get people to follow you because they want to, not because they have to. The good news is that influence can be learned. Some people start with more natural gifts, but anyone can grow. Maxwell also says real leadership growth starts on the inside. Before it shows in your team, it shows in your priorities, your integrity, your attitude and your self-discipline. Then it shows in how you handle problems and change, how clearly you see where you are going, and how much you invest in other people. The book walks through these one by one, almost like a training plan, and each chapter adds one more piece. That matters for anyone who serves. Most of us influence someone every day, at home, at work or in ministry, whether we notice it or not. This book helps you use that influence well. (He later released an updated version, Developing the Leader Within You 2.0.)",
   "insights": [
    {
     "emoji": "🧲",
     "title": "Leadership = influence",
     "body": "Maxwell opens with a simple definition: leadership is influence, nothing more and nothing less. He likes an old saying that a person who thinks they are leading, but has no one following, is only taking a walk. A title can give you authority, but it cannot make people trust you or want to follow you.\n\nHe also points out that everyone influences someone. A parent, a teacher, a friend, a coworker — all of them shape the people around them, often without noticing. Even a quiet person affects many others over a lifetime. Maxwell tells about his first church, a small church in the countryside. As the young pastor, he had the title. But he soon saw that the real leader was a farmer named Claude. When Claude spoke, people listened and followed. So Maxwell learned to talk with Claude first about new ideas, and then Claude helped bring the others along.\n\nSo instead of asking 'Am I a leader?', ask how you are using the influence you already have. Is it lifting people up or pulling them down? If influence can grow, leadership can grow too. You do not need to wait for a position to start leading well. Start with the people right in front of you."
    },
    {
     "emoji": "🪜",
     "title": "The 5 Levels of Leadership",
     "body": "Maxwell describes five levels of influence. Level 1 is Position: people follow because they have to. Level 2 is Permission: they follow because they like you and feel cared for. Level 3 is Production: they follow because of what you get done together. Level 4 is People Development: they follow because you helped them grow. Level 5 is Personhood: after many years of growing people, they follow because of who you are and what you stand for.\n\nEach level builds on the one before it. You cannot skip the relationship stage and jump to results. Maxwell also notes that climbing takes time and commitment, but the higher you go, the easier it becomes to lead, because people give you more trust. You may be on different levels with different people, and when you move to a new place you usually start again at the bottom.\n\nSimple everyday example: a new team leader may have the title on day one, but the team only follows half-heartedly. After weeks of listening, learning names and helping with real work, people start to follow because they want to. Use the levels as a mirror. With each person you lead, ask honestly where you are, and what the next step up would look like."
    },
    {
     "emoji": "🎯",
     "title": "Priorities first",
     "body": "Being busy is not the same as being effective. Maxwell says leaders must decide what matters most and give it their best time. He uses the Pareto Principle, or 80/20 idea: about 20 percent of your work brings about 80 percent of your results. He applies it to people too: a leader should give most of their training time to the few people who will make the biggest difference.\n\nHe also suggests sorting tasks by importance and urgency. Important and urgent things get done first. Important but not urgent things need planned time, or they get pushed aside forever. Urgent but unimportant things can often be handed off or done quickly. Some good things must be left undone so the best things get done. Maxwell adds three simple questions to help: What is required of me? What gives the greatest return? What gives me the most reward?\n\nSimple everyday example: a team leader who answers every message the moment it arrives may feel busy all day, yet never find time to train her team. Protect time for what really matters. Look at your priorities often, because they shift as life and ministry change."
    },
    {
     "emoji": "🧭",
     "title": "Integrity is the foundation",
     "body": "Maxwell calls integrity the most important ingredient of leadership. Integrity means your words and actions match, and you are the same person in public and in private. He contrasts image and integrity: your image is what people think you are, but your integrity is what you really are.\n\nPeople do not follow a plan first; they follow a person. If they cannot trust you, your good ideas will not matter much. Trust is built slowly, through many small promises kept, and it can be broken very quickly. Small compromises add up over time. Maxwell also says that people learn far more from what a leader does than from what a leader says. If you ask others to be on time but always come late, your team learns that time does not matter.\n\nIntegrity also brings freedom: when you have nothing to hide, you can lead with a clear conscience. To grow here, live the standards you ask of others before you ask them. Admit mistakes quickly instead of hiding them. Keep small promises, like starting meetings on time or calling back when you said you would. These small things become the ground people stand on when they decide to trust you."
    },
    {
     "emoji": "🔄",
     "title": "Change is the real test",
     "body": "Maxwell says the ultimate test of leadership is creating positive change. Keeping things running is not too hard. Helping a group move to a better place is much harder, and it shows whether people really trust you.\n\nHe reminds leaders that people naturally resist change, and he lists many reasons. They may not have chosen the change themselves. It may break their comfortable routine. They may fear the unknown or fear failing. The reason for the change may not be clear. They may feel they will lose something, or they may simply not trust the person leading it. Knowing these reasons helps a leader respond with patience instead of frustration.\n\nSo Maxwell gives practical advice. Change yourself first, before you ask others to change. Explain the why clearly. Involve people early, especially the key influencers in the group, so the change is partly theirs. Think about timing, and do not push big changes before you have earned enough trust. Simple everyday example: before moving a weekly meeting to a new day, a wise leader asks the team about it, listens to their concerns and explains the reason. The change is the same, but people accept it much more easily."
    },
    {
     "emoji": "🔧",
     "title": "Problems are your training ground",
     "body": "Maxwell says the quickest way to gain influence is to help solve problems. Every leader faces problems, and how you handle them shows people who you are. Leaders who stay calm, look for the real cause and invite others into the solution earn trust quickly.\n\nHe encourages leaders not to fear problems or run from them. Problems are a normal part of life and work, and they can make us stronger. What matters most is your attitude toward them and a simple, steady process. Name the problem clearly. Look for its real cause, not just the surface. Gather the right people and the facts. List possible solutions, choose the best one, act on it, and then check how it went. A leader does not need to have every answer, but they do need to keep the team moving toward one.\n\nSimple everyday example: when a schedule breaks down, one leader blames people, while another asks the team what went wrong and how to fix it together. The second leader grows in influence. Over time, people bring their problems to the leader who helps them think clearly and stays kind under pressure."
    },
    {
     "emoji": "☀️",
     "title": "Attitude and self-discipline",
     "body": "Maxwell says attitude often decides how far you go, more than skill or talent. People feel your attitude before you say anything. A leader's attitude also spreads: a team tends to catch the mood of the person in front. You cannot always choose what happens to you, but you can choose how you respond. Maxwell encourages leaders to guard their thinking, focus on what they can change and keep a teachable spirit.\n\nSelf-discipline is the price of growth. It means doing the right thing even when you do not feel like it. Maxwell says leaders must first lead themselves: manage their time, keep their commitments and keep learning. He suggests starting with small things, beginning now instead of waiting, refusing your usual excuses and not giving yourself the reward until the task is done.\n\nSimple everyday example: a leader who wants to read more decides to read ten pages every morning before checking her phone. It is a small habit, but after a year she has read many books. Before you ask others to follow you, show that you can follow your own good plans. Small daily choices, repeated over time, build a leader people can count on."
    },
    {
     "emoji": "🔭",
     "title": "Vision: see it, share it",
     "body": "Maxwell calls vision an indispensable quality of a leader. Vision is a clear picture of where the group is going and why it matters. Without it, people may work hard, but they move in different directions and soon lose energy.\n\nHe describes four kinds of people when it comes to vision. Some never see it. Some see it but never chase it on their own; they need someone to lead them. Some see it and chase it. And some see it, chase it and help others see it too. Maxwell says that last group are the leaders.\n\nHe also says a good vision usually grows from inside the leader, from what they care about deeply, and is shaped by learning from the past. A real vision is not only about the leader's dreams; it meets the needs of other people, and that is why others are willing to give their time and resources to it. A vision also needs to be shared clearly and often, because people forget and lose sight of it. Simple everyday example: a cafe team that only hears about tasks will clean tables. A team that knows the cafe exists to welcome people and build friendships will clean tables and also notice the lonely guest."
    },
    {
     "emoji": "🌱",
     "title": "Grow your people",
     "body": "Maxwell calls people a leader's most valuable asset, and he says the most important lesson is to develop them. The people closest to a leader often decide how far that leader can go. If you gather and grow good people, your impact multiplies.\n\nGrowing people is different from just using them to get work done. It means seeing their potential, giving them real responsibility, training them and cheering when they succeed. Maxwell describes the leader's part as showing the way by example, caring for people, giving them tools and training, and keeping them encouraged. It also means sharing a clear vision, so people know where the team is going and why their part matters.\n\nA leader who does everything alone soon hits a ceiling. A leader who raises other leaders keeps bearing fruit even after moving on. Simple everyday example: instead of always leading the team meeting yourself, let a younger team member lead it once a month, and talk with them afterwards about what went well. So ask: who am I helping to grow right now, and could they lead without me?"
    }
   ],
   "tryThis": [
    "For each person on your team, ask yourself honestly: which of the 5 Levels am I on with them?",
    "List your tasks this week, circle the few that bring the most results, and do those first.",
    "Pick one younger staff member or student and meet with them on purpose this month to help them grow."
   ],
   "forUs": "On a mission base, most of us lead without big titles. You might lead a kitchen shift, a small group, a worship team or an outreach team for a few weeks. That is good news: influence grows through trust, faithfulness and care, not position. Jesus led this way too, by serving and by investing deeply in a few people. For Khmer and international staff, the Permission level matters a lot. People need to feel known and valued before they follow, and that takes time across languages and cultures. When we bring change to a ministry, like a new cafe schedule or a new way of running a DTS week, it helps to explain the why and to listen first, especially to people who have been here longer. Our attitude on hard days spreads quickly in a small community, for good or for bad. And a clear, shared vision helps a team remember why we wash dishes, teach classes and visit villages. Leaders who keep their word, stay calm in problems and raise up others to lead after them are building something that will last long after their own season here ends.",
   "oneLine": "Real leadership is influence, and it grows from the inside out.",
   "cover": {
    "bg": "cobalt",
    "fg": "paper",
    "a": "marigold",
    "b": "blue",
    "motif": "steps",
    "layout": "top",
    "font": "serif"
   }
  },
  {
   "id": "first-break-all-the-rules",
   "title": "First, Break All the Rules",
   "author": "Marcus Buckingham & Curt Coffman",
   "year": 1999,
   "isbn": "9780684852867",
   "shelf": "lead",
   "mins": 10,
   "vibe": "Stop trying to fix people. Find their talent and set it free.",
   "bigIdea": "Most of us were taught that a good manager fixes people's weaknesses, treats everyone the same and promotes the best workers. Marcus Buckingham and Curt Coffman tested those ideas. Both worked for Gallup, a large research company that studies people at work. Their research included surveys of over a million employees and interviews with about 80,000 managers. They asked a simple question: what do the very best managers do differently? They found that the best managers often break these common rules. Great managers do not try to change people into something they are not. Instead, they find each person's natural talents and help them use those talents every day. They select people for talent, make the desired results clear, build on strengths and help each person find the right fit. They also treat each person as an individual, not as a copy of everyone else. The book is practical. It gives a simple way to check how healthy a team is, and clear habits that any manager can start using. If you lead even one person, a small team or a short project, this book can change how you see them, and how you spend your time with them.",
   "insights": [
    {
     "emoji": "👤",
     "title": "People leave managers",
     "body": "The research found that a person's direct manager matters more than the organization itself for how they feel at work. If that relationship is poor, people tend to leave, or they stay but stop giving their best. In short, people often join an organization but leave a manager. Good pay, nice buildings and a famous leader at the top cannot fully make up for a poor manager day to day.\n\nSo a strong workplace is built one team at a time. Two teams in the same organization can feel very different because of who leads them. That is a big responsibility, and also a hopeful one: a single good manager can make a real difference, even inside a difficult organization.\n\nThe authors describe the manager as a catalyst, someone who speeds up the reaction between a person's talent and the goals of the work. Leaders look outward, at the future and the big direction. Managers look inward, into each person, to turn their talent into good work. Both roles matter. If you lead people day to day, you shape their experience more than any policy or vision statement does. Simple everyday example: a volunteer may love the mission of a project, but still quit because the person they report to never listens."
    },
    {
     "emoji": "🔢",
     "title": "The 12 questions",
     "body": "Gallup found 12 questions that show if a workplace is strong. Teams whose people answered these questions positively tended to do better in productivity, profit, customer satisfaction and keeping their staff. The authors describe the questions like climbing a mountain. At base camp, people ask: Do I know what is expected of me? Do I have what I need to do my work? Next, they ask about what they give: Do I get to do what I do best every day? Have I been praised recently? Does someone at work care about me as a person? Does someone encourage my growth?\n\nHigher up come questions of belonging: Do my opinions count? Do I see meaning in our mission? Are my coworkers committed to good work? Do I have a close friend at work? At the top are questions of growth: Has someone talked with me about my progress? Do I have chances to learn and grow?\n\nThe order matters. If people do not know what is expected, team-building events will not help much. Start at the base. Make expectations clear, give the right tools, then build up to praise, belonging and growth. You can use the questions as a simple health check for any team, once or twice a year."
    },
    {
     "emoji": "💎",
     "title": "Talent is not the same as skill",
     "body": "The authors make a clear difference between skills, knowledge and talent. Skills are the how-to of a task, and they can be taught. Knowledge, like facts and experience, can also be learned. Talent is different. They describe it as a natural pattern of thinking, feeling or acting that keeps showing up and can be used well. They explain that as we grow up, the brain strengthens some connections and lets others fade, so by our teenage years each person has a unique pattern that is hard to change later.\n\nThey group talents into three kinds: striving talents (what drives you), thinking talents (how you think and decide) and relating talents (how you build trust and connect with others). They also say that every role done with excellence needs some talent, not only the famous or senior ones.\n\nSimple everyday example: you can teach anyone the steps for welcoming a guest. But the person who naturally remembers names and notices when someone feels left out has a relating talent. Training builds on talent; it cannot easily replace it. So choose and place people for talent first, and then add skills and knowledge."
    },
    {
     "emoji": "🙅",
     "title": "People don't change much",
     "body": "At the heart of the book is one big belief: people do not change that much. Great managers do not waste time trying to put in what was left out. Instead, they try to draw out what is already there. That is hard enough work on its own.\n\nThis does not mean ignoring weaknesses. When a weakness gets in the way, the authors suggest practical options: give the person a support system or tool, pair them with a partner whose strengths fill the gap, or find another way to get the task done. The goal is to manage around the weakness so it stops blocking the person's strengths.\n\nThe authors also found that the best managers spend the most time with their best people, not their weakest. This can feel unfair at first. But they explain that it is the best way to learn what excellence looks like in a role, and that your best people deserve your attention too. Simple everyday example: instead of spending every meeting on the one person who struggles, a leader also sits with the strongest team member to ask what makes their work go so well. Less fixing and more building is less tiring for everyone, and it usually brings better results."
    },
    {
     "emoji": "🗝️",
     "title": "The four keys",
     "body": "The book sums up what great managers do in four keys. First, select for talent, not only for experience, intelligence or determination. Second, define the right outcomes, and let each person find their own route. Third, focus on strengths, not weaknesses. Fourth, find the right fit for each person, so they can grow in a role that suits them.\n\nThe keys work together. If you select for talent but then control every step, you waste that talent. If you focus on strengths but leave someone in the wrong role, they will still struggle.\n\nWhen choosing people, the authors suggest open questions about what someone has actually done before, because past patterns are the best guide to future ones. They advise listening for specific details, not general claims, and paying attention to a person's first, natural answer, because it often shows how they really think. It also helps to know which talents a role truly needs before you start looking. Simple everyday example: ask someone to tell you about a time they helped a new person feel at home, and listen for a real story with names and details."
    },
    {
     "emoji": "🏁",
     "title": "Outcomes, not control",
     "body": "Great managers tell people clearly what result they want, and then let them find their own way to get there. Everyone is different, so one 'best way' often fits nobody perfectly. Clear outcomes build ownership, because people feel trusted to use their own talents and judgment.\n\nThere are limits. The authors say some steps should be required: anything needed for safety or accuracy, and the key standards of the organization or industry. Outside those few firm rules, people have freedom. This also changes how you check work. Instead of watching every move, you look at the results and talk about them together. The authors add that a good outcome usually looks at what the customer or the person being served really needs, not only at the task itself.\n\nSimple everyday example: tell a cafe team the goal is that every guest feels welcome and gets their order quickly, instead of writing a long script. Give clear safety and hygiene rules, then trust their style. One person may welcome guests with jokes, another with a quiet smile. Both can reach the same good outcome."
    },
    {
     "emoji": "🎭",
     "title": "Treat each person differently",
     "body": "Many of us learned the Golden Rule: treat others as you want to be treated. The authors say great managers break even this rule at work. They treat each person as that person would like to be treated. People are different, so the same approach will not help everyone grow.\n\nGreat managers take time to learn what makes each person tick. What motivates them? How do they like to be praised: in public, in private, in writing or face to face? How do they learn best? The authors describe three common ways people learn: some like to analyse and study first, some learn by doing and trying, and some learn best by watching someone skilled.\n\nSimple everyday example: one team member feels honoured when you thank them in front of the whole team, while another feels embarrassed and would rather get a short personal note. The goal is the same, to show you value their work, but the way is different. This takes more effort than one rule for everyone. But it tells each person that you see them as a real individual, and that is when people begin to give their best."
    },
    {
     "emoji": "🧩",
     "title": "Right person, right role",
     "body": "Many organizations reward good workers by promoting them into management. But being great at a role does not mean you will be a great manager. Often the organization loses a great worker and gains a frustrated manager.\n\nThe authors suggest creating 'heroes in every role'. Every role, done with excellence, should be honoured and should have room to grow. They suggest levels of achievement inside each role, and pay ranges that overlap, so a truly excellent worker can earn as much as some managers without changing jobs.\n\nGreat managers also help people who are in the wrong role move to a better fit, kindly and honestly. The authors call this a kind of tough love. It is not a punishment; it is a gift, because staying in the wrong role slowly wears a person down. Help each person notice what they love, what drains them and where they truly shine. Then help them grow deeper there, instead of only climbing upward. Simple everyday example: a brilliant teacher may not enjoy running the school office. Honour the teaching, and let someone with a gift for organizing lead the office."
    },
    {
     "emoji": "🗓️",
     "title": "Talk about performance often",
     "body": "The book ends with practical tools. One of the most useful is a simple routine for talking with each person about their work. Instead of one stressful review a year, the authors suggest regular, short conversations, at least four times a year, that focus on the future more than the past.\n\nIt starts with a strengths conversation when someone joins your team. Ask questions like: What did you enjoy most in your last role? What do you think your strengths are? What are your goals here? How do you like to be praised? Who has helped you grow in the past? The answers help you understand how to manage this person well.\n\nAfter that, each meeting looks back briefly at what went well and then looks ahead: what will you focus on next, and how can I help? The authors also suggest that people keep track of their own progress and learning, so they own their growth. Keep the routine simple, so it actually happens. Simple everyday example: a team leader books thirty minutes with each team member every few months, with two questions: what is going well, and what do you want to grow in next?"
    }
   ],
   "tryThis": [
    "Ask each person on your team when they last felt they were doing what they do best, and listen well.",
    "For one task you lead, write down the outcome you want, add only the must-follow rules, and stop telling people every step.",
    "Encourage someone this week for one specific thing they did well, in the way they like to be praised."
   ],
   "forUs": "On base, we often put people where there is a gap, not where they fit. Gaps are real, and sometimes we all wash dishes. But leaders can still notice what each staff member and student is naturally good at — hospitality, teaching, details, prayer, encouragement — and lean into it when planning roles for DTS, outreach teams or the cafe. The 12 questions are a great check for any ministry team. Do our new staff know what is expected? Do they have what they need? Does someone care about them as a person? Has anyone talked with them about their growth? Clear expectations and real care matter even more when Khmer and international staff work side by side with different ways of doing things. Treating each person differently also fits cross-cultural life. Some staff feel honoured by public thanks, while others would feel shy. Some learn by watching first, others by jumping in. Regular, short talks about how someone is doing can build trust better than one big review. Seeing each person's God-given design, and helping them grow in it, is a way to honour the One who made them.",
   "oneLine": "Great managers find each person's talent and build on it, instead of trying to fix them.",
   "cover": {
    "bg": "paper",
    "fg": "ink",
    "a": "berry",
    "b": "marigold",
    "motif": "brokenline",
    "layout": "top",
    "font": "sans",
    "upper": true
   }
  },
  {
   "id": "good-to-great",
   "title": "Good to Great",
   "author": "Jim Collins",
   "year": 2001,
   "isbn": "9780066620992",
   "shelf": "lead",
   "mins": 10,
   "vibe": "Good is the biggest enemy of great. Don't settle.",
   "bigIdea": "Why do some organizations become truly great, while others stay just good? Jim Collins, a business researcher and teacher, and his research team spent five years looking for an answer. They searched through more than 1,400 large companies and found 11 that moved from average results to great results and kept them for at least 15 years. Then they compared each one with a similar company in the same industry that had the same chances but never made the jump. The difference was not luck, a famous leader or one big moment. It was humble leaders, the right people, honest facts, clear focus and steady discipline over time. Collins puts these together like a process: disciplined people first, then disciplined thinking, then disciplined action, with momentum building slowly like a heavy wheel. He also warns that being good is a hidden enemy, because it makes it easy to stop growing. When things are fine, few people feel the need to change. Although the research is about companies, Collins believes the same ideas apply to schools, churches and charities. That message matters for any team, including a ministry that wants to serve people well for many years.",
   "insights": [
    {
     "emoji": "🏔️",
     "title": "Good is the enemy of great",
     "body": "Collins opens with a bold claim: good is the enemy of great. Most schools, churches, governments and companies never become great, and the main reason is that they are already good. Good feels safe. When results are fine, there is little pressure to ask hard questions or make deep changes.\n\nTo study the jump from good to great, his team set strict rules. A company had to show about 15 years of ordinary results, then a turning point, then 15 years of results far better than the market. They compared these companies with similar ones that did not make the jump, and read thousands of articles and interviews. Many of their findings surprised them. Bringing in a famous leader from outside did not help; in fact, it was more common in the companies that failed to make the jump. There was no clear link to how much leaders were paid. Big mergers, fancy change programs and being in an exciting industry were not the keys either.\n\nWhy this matters: greatness is not mainly about circumstances. It is largely a matter of choices and discipline. Simple everyday example: a team that says 'we are doing fine' may stop learning, while a team that asks 'how could we serve even better?' keeps growing."
    },
    {
     "emoji": "🙇",
     "title": "Level 5 Leadership",
     "body": "The leaders of the great companies surprised the researchers. Collins even told his team at first to downplay the role of the top leaders, because he did not want a simple 'great leader' answer. But the data kept pushing back. These leaders were not loud celebrities. Collins calls them Level 5 leaders: they mix deep personal humility with a fierce will to do what is best for the organization. Below them are four other levels, from a capable individual to a strong, driving leader. Level 5 includes those skills but adds humility.\n\nOne example is Darwin Smith at Kimberly-Clark. He was quiet and plain, yet he made the bold choice to sell the company's paper mills and focus on consumer paper products. It was a hard decision, but it led to great results.\n\nCollins describes a 'window and mirror' habit. When things go well, Level 5 leaders look out the window and give credit to others or to good fortune. When things go badly, they look in the mirror and take responsibility. They also prepare the organization to do well after they leave, while many leaders of the comparison companies cared more about their own fame. Their ambition is for the work, not for themselves."
    },
    {
     "emoji": "🚌",
     "title": "First who, then what",
     "body": "Collins uses the picture of a bus. Great leaders first got the right people on the bus, the wrong people off the bus, and the right people in the right seats. Only then did they decide where to drive.\n\nThis sounds backwards, but it works. If people joined only because of the destination, they may leave when the direction changes. If they joined because of who else is on the bus, they can adapt. The right people do not need to be tightly managed or constantly motivated; they bring their own drive. Collins says people are not your most important asset; the right people are. One example is Wells Fargo, which hired outstanding people whenever it found them, often without a specific job ready.\n\nCollins also says to be rigorous, not ruthless. That means being careful and clear in people decisions, and when in doubt, not hiring yet but continuing to look. A wrong person in a key seat costs far more than an empty seat for a little longer. He adds one more wise habit: put your best people on your biggest opportunities, not only on your biggest problems."
    },
    {
     "emoji": "🧊",
     "title": "Face the brutal facts",
     "body": "Great teams look honestly at hard reality. One comparison in the book is between two grocery chains, Kroger and A&P. Both could see that shopping habits were changing. Kroger faced the facts and rebuilt its stores. A&P avoided the hard truth and slowly declined.\n\nCollins also tells the story of Admiral Jim Stockdale, a prisoner of war in Vietnam for years. Stockdale said the prisoners who did not survive were often the optimists, who kept expecting to be home by Christmas and then lost heart. He never lost faith that he would get out, but he also faced his brutal situation every day. Collins calls this the Stockdale Paradox.\n\nFor leaders, this means creating a place where truth can be heard. Collins gives four simple practices. Lead with questions, not answers. Allow real discussion and debate instead of forcing agreement. When something goes wrong, look back to learn from it without blaming people. And build simple ways for warning signs to reach leaders early. He also warns that a strong, charming leader can make people afraid to bring bad news, so leaders must work hard to invite it."
    },
    {
     "emoji": "🦔",
     "title": "The Hedgehog Concept",
     "body": "Collins borrows an old story about the fox and the hedgehog. The fox knows many things and keeps trying clever plans. The hedgehog knows one big thing and does it again and again — and it wins.\n\nGreat companies found a simple Hedgehog Concept where three circles overlap: what they are deeply passionate about, what they can be the best in the world at, and what drives their economic engine. For the third circle, they found one key measure. Walgreens, for example, focused on convenient drugstores and measured success by profit per customer visit.\n\nNote the second circle: it is not what you want to be best at, but what you truly can be best at. That takes honesty. Finding the Hedgehog was not quick. Collins says it usually took the great companies years of questions, debate and learning, not one planning weekend. Once you know your Hedgehog, you can say no to good ideas that do not fit. Collins even suggests a 'stop doing' list, which can be as important as a to-do list. Simple focus beats doing many things only okay."
    },
    {
     "emoji": "📏",
     "title": "A culture of discipline",
     "body": "Great organizations have disciplined people, disciplined thinking and disciplined action. Collins makes an important point: when people are self-disciplined, you need fewer rules and less control. Too many rules often grow to make up for a lack of discipline and a lack of the right people.\n\nIn the great companies, people had real freedom, but inside a clear framework. They stayed very consistent with their Hedgehog Concept and were willing to say no to anything outside it, even attractive opportunities. This is different from a harsh leader forcing discipline from the top. Collins notes that some comparison companies did improve for a while under a tough, controlling leader, but the results faded when that leader left, because the discipline was never part of the culture.\n\nCollins gives the picture of a champion triathlete who even rinsed his cottage cheese to remove a little extra fat. It sounds extreme, but it shows a person so committed to the goal that small details matter. Freedom and responsibility grow together when everyone shares the same focus. Simple everyday example: a team that agrees on its main purpose can let each member plan their own work, because everyone knows what matters most."
    },
    {
     "emoji": "🎡",
     "title": "The Flywheel",
     "body": "Looking back, great change seems dramatic. But leaders inside the great companies said there was no single big moment and no magic program. Many people inside did not even realize a big change was happening until later. There was no launch event and no slogan. Collins compares it to pushing a giant, heavy flywheel. At first it barely moves. You keep pushing in the same direction, turn after turn. Slowly it speeds up, until each push builds on all the pushes before it.\n\nThe comparison companies did the opposite. They fell into a 'doom loop': launching new programs, making big purchases, changing direction often, then reacting to poor results with yet another new plan. Momentum never built, and people grew tired of changes that never lasted.\n\nThe lesson is patience with a clear direction. Keep making small, steady pushes that fit your Hedgehog. When people see real progress, they join in pushing. Great leaders did not spend much energy trying to motivate people or win them over; the results did much of that work. Results attract commitment, which builds more results."
    },
    {
     "emoji": "💻",
     "title": "Tools are accelerators",
     "body": "Many people expected technology to be the main cause of the great companies' success. It was not. In interviews, most leaders of the great companies did not even name technology among the main reasons for their success. The great companies used technology carefully, as an accelerator of what already worked. They chose tools that fit their Hedgehog Concept, and then they used those specific tools very well.\n\nThe comparison companies often grabbed new technology out of fear of being left behind. They hoped a new tool would save them, but tools cannot fix a lack of focus or the wrong people. The great companies stayed calm about the latest trends. When the internet boom came, Walgreens chose a careful, step-by-step approach, starting small and then growing what worked, instead of rushing in. Their question was simple: does this help us do what we are already best at, faster or better? If yes, they went deep. If no, they ignored it.\n\nSimple everyday example: a new app will not fix a confused team, but it can help a clear, healthy team move faster. Choose tools after you know who you are."
    },
    {
     "emoji": "🏛️",
     "title": "From great to lasting",
     "body": "At the end of the book, Collins links this study to his earlier book, Built to Last, about companies that stayed great for many decades. He sees Good to Great as the first part of the story. The ideas in this book help an organization become great. Ideas from Built to Last help it stay great for a long time.\n\nThe key is a clear core: a few deep values and a purpose beyond only making money. This core should stay the same over time. At the same time, everything else, such as programs, methods and strategies, should keep changing and improving. Collins describes this as protecting the core while pushing for progress. Organizations that confuse their methods with their core values either get stuck or lose who they are.\n\nCollins closes with a personal question: why try to be great at all? His answer is that when you are doing work you care deeply about, and that fits your Hedgehog, the question almost answers itself. Meaningful work is worth doing well. Simple everyday example: a ministry can change its schedule, its tools and its programs many times, while its heart, such as loving God and serving people, stays exactly the same."
    }
   ],
   "tryThis": [
    "Draw the three Hedgehog circles for your ministry and write what goes in each one.",
    "Name one 'brutal fact' your team has been avoiding and talk about it honestly this week.",
    "Choose one small, steady push you will repeat every week instead of starting something new."
   ],
   "forUs": "Collins later wrote a short follow-up for non-profits. He noted that for them the 'economic engine' is more of a resource engine — time, money and support — than profit. He also said success should be measured by how well you serve your mission, not by money. And he noticed that leaders in non-profits often have less direct power, so they must lead more by persuasion, trust and shared decisions. That fits a mission base well. The Hedgehog questions are powerful for us. What are we deeply passionate about? What can we do really well here in Cambodia? What keeps our people, volunteers and resources strong? Answering honestly may mean saying no to some good ideas. The Stockdale Paradox fits faith well: we trust God for the final outcome, and we also face hard facts honestly in prayer and planning. For Khmer and international staff, creating a safe place to share bad news and honest questions takes care and humility, especially across cultures. Humble leaders, the right people in the right seats and steady faithfulness will take a ministry further than a new idea every season.",
   "oneLine": "Greatness comes from humble leaders, the right people, honest facts, clear focus and steady discipline.",
   "cover": {
    "bg": "paper",
    "fg": "berry",
    "a": "berry",
    "b": "ink",
    "motif": "flywheel",
    "layout": "top",
    "font": "sans",
    "upper": true
   }
  },
  {
   "id": "never-split-the-difference",
   "title": "Never Split the Difference",
   "author": "Chris Voss (with Tahl Raz)",
   "year": 2016,
   "isbn": "9780062407801",
   "shelf": "lead",
   "mins": 10,
   "vibe": "Hostage negotiation skills for everyday talks. Listen like it matters — because it does.",
   "bigIdea": "Chris Voss spent years as an FBI hostage negotiator, talking with kidnappers, bank robbers and terrorists, and later led the FBI's international kidnapping negotiation work. He noticed that many negotiation ideas taught in business schools assume people are logical. Real people are not. Emotions drive most of our decisions, and fear, pride and the need to feel safe often matter more than numbers. The title comes from a simple picture: if you want black shoes and your partner wants brown, splitting the difference and wearing one of each is a bad deal for everyone. Instead of quick compromise, Voss teaches a way of listening he calls tactical empathy: deeply understanding the other person and showing them that you understand. From there he gives simple tools: mirrors, labels, summaries, good questions, a calm voice and a clear plan for talking about money. It sounds soft, but he says it is the strongest tool in any hard talk — with a boss, a landlord, a seller at the market or a friend. For anyone who serves or leads, it is a practical guide to listening well when the stakes feel high.",
   "insights": [
    {
     "emoji": "🫶",
     "title": "Tactical empathy",
     "body": "Empathy in this book does not mean agreeing or being nice. It means understanding how the other person sees the situation and how they feel about it, and then showing them that you understand. Voss calls this tactical empathy, because you use it on purpose.\n\nHe tells how he once joined a negotiation course at Harvard. The other students and teachers had studied careful, logical bargaining methods. Voss had mostly his simple listening tools from hostage work, yet he did surprisingly well in their practice negotiations. That experience convinced him that understanding people's emotions is not a soft extra; it is the center of every negotiation.\n\nHe describes negotiation as a process of discovery, not a battle. The goal is to uncover as much information as you can: what the other person wants, what they fear and what pressures they face. People share more when they feel safe and heard. When people feel understood, they become less defensive and more open to new ideas. Simple everyday example: a frustrated coworker will often calm down not when you explain why they are wrong, but when you first show you really get why they are upset."
    },
    {
     "emoji": "🪞",
     "title": "Mirroring",
     "body": "A mirror is simple: repeat the last one to three important words the other person said, with a curious, gentle tone. Then wait. It feels almost too easy, but it makes people keep talking and explain more. Voss mentions research in which restaurant servers who simply repeated customers' orders back to them received bigger tips, because people like those who seem similar to them.\n\nVoss gives an office example. A demanding boss asks for two copies of all the paperwork. Instead of arguing, the employee simply mirrors: 'Two copies?' The boss then explains the real concern behind the request, and together they find a better plan.\n\nMirroring works because people feel that you are following them and that you are on their side. It also gives you time to think. You do not need a clever answer; you just need to keep them talking. The more they talk, the more you learn about what really matters to them. It is also a good tool when you feel nervous or do not know what to say next. A short mirror and a few seconds of silence are often better than a quick, defensive reply."
    },
    {
     "emoji": "🏷️",
     "title": "Labeling",
     "body": "A label names the feeling you notice. You might say, 'It seems like you're worried about the cost,' or 'It sounds like this week was hard.' Voss suggests starting with words like 'it seems', 'it sounds' or 'it looks', not 'I hear', so the focus stays on them.\n\nNaming a negative feeling helps calm it down. Feelings that stay hidden can grow stronger, but once they are spoken, they lose some of their power. Naming positive feelings, on the other hand, can make them stronger. Voss encourages looking beneath what people say they want. Under the stated demand there are usually fears, hopes and needs. Labels help you reach those deeper things, which is where real solutions are found.\n\nAfter you give a label, stop talking. Silence feels uncomfortable, but it gives the other person space to respond, correct you or say more. Even if your label is wrong, they will usually tell you what they really feel. That is still a win, because now you understand them better. Simple everyday example: when a team member says they cannot join the outreach, saying 'It sounds like something is making this hard for you' may open a real conversation."
    },
    {
     "emoji": "✅",
     "title": "Aim for 'That's right'",
     "body": "Voss says the words that matter most are not 'yes' or 'you're right', but 'that's right'. You get there with a summary: you repeat their view and their feelings in your own words so well that they say, 'That's right.'\n\n'You're right' is often just a polite way to end a talk. 'Yes' can be fake too. Voss describes a counterfeit yes, where people agree just to escape the conversation, and then they do not follow through.\n\nBut 'that's right' shows the person feels truly understood. In that moment, real trust begins, and they become more willing to work with you. Voss tells of a kidnapping case in the Philippines where he coached the local negotiator to stop arguing with the kidnapper. Instead, the negotiator carefully summed up the kidnapper's own view of his struggle and complaints. When the kidnapper answered that this was right, the conversation began to change. Simple everyday example: before you try to solve a friend's problem, sum up how they see it. If they answer, 'Yes, that's right,' you have earned the right to suggest an idea."
    },
    {
     "emoji": "🙅",
     "title": "'No' is a good start",
     "body": "Most people chase a 'yes' and fear a 'no'. Voss flips this. People feel safe and in control when they are allowed to say no. A 'no' protects them, and once they feel protected, the real conversation can begin. Voss says many sales and business habits push people to say yes again and again, and this often makes them feel trapped and defensive.\n\nSo he suggests questions that invite a 'no'. Instead of asking if someone has a few minutes, you might ask, 'Is now a bad time to talk?' Instead of asking whether they agree, you might ask whether your idea is a bad plan. When someone has gone silent, he suggests a short message asking if they have given up on the project. It often gets a fast reply, because people want to say no and explain.\n\nA 'no' is not the end. It can mean 'not yet', 'I need more information' or 'I do not feel safe'. It tells you what the person does not want, and it gives them dignity. That makes it easier to discover what they do want. Simple everyday example: asking 'Would it be a bad idea to meet on Friday?' can feel easier to answer than a direct request."
    },
    {
     "emoji": "❓",
     "title": "Calibrated questions",
     "body": "Calibrated questions are open questions, usually starting with 'how' or 'what'. They avoid 'why', which can sound like blame. Examples: 'What is the biggest problem here?' or 'How am I supposed to do that?'\n\nThese questions give the other person a feeling of control, but they also invite them to help solve your problem. Voss calls this creating the illusion of control: they feel in charge, while you are gently guiding the talk. In kidnapping cases, Voss used calm 'how' questions, such as asking how the family could know the victim was safe, to get proof of life without making demands.\n\n'How' questions are also a gentle way to say no. When someone asks for too much, you can ask how you are supposed to do that, and let them see the problem. Voss stresses that this needs self-control. If you cannot control your own emotions, you cannot expect to calm the other person. So stay calm, ask, and then really listen. Simple everyday example: instead of asking a staff member why a job was not done, ask what got in the way and what would help next time."
    },
    {
     "emoji": "🤝",
     "title": "Make sure it really happens",
     "body": "An agreement is only good if it is carried out. Voss warns that a 'yes' without a 'how' means little. So he uses 'how' and 'what' questions to check the plan: How will we know we are on track? What happens if something goes wrong? This makes the other person think through the steps and own them.\n\nHe also suggests a 'rule of three': get the person to agree to the same thing three times in different ways, for example by a summary, a label and a question about how it will work. It is harder to fake agreement three times. He reminds us to watch tone of voice and body language, not only words, because they often show doubt that words hide. If someone says yes but their face says no, gently name it.\n\nVoss also points to the people who are not in the room. A deal can be killed later by a boss, a spouse or a committee who were never part of the talk. So ask how this decision affects the others involved, and what they will think. Simple everyday example: before agreeing on a new cleaning plan with one person, ask how the rest of their team will feel about it."
    },
    {
     "emoji": "📻",
     "title": "Voice and the accusation audit",
     "body": "How you speak matters as much as what you say. Voss describes a calm, slow, warm voice — like a late-night radio host — that helps people feel safe, especially when you need to say something firm. Most of the time he suggests a positive, playful voice, because a relaxed and smiling voice helps both people think more clearly. A direct, firm voice should be used rarely, because it often makes people push back.\n\nBefore a hard talk, he suggests an accusation audit. List every negative thing the other person might think about you, and then say a few of them first: 'You probably think I'm being unfair.' Do not defend yourself after you say it. Just name it, and then pause and let them respond.\n\nThis seems risky, but it often removes fear and anger before they grow. The other person may even say it is not that bad. Simple everyday example: if you must tell a team that an outreach trip is cancelled, you might begin by saying they will probably feel disappointed and maybe think the leaders did not plan well. Naming it first lowers the tension, and people are then ready to hear the reasons."
    },
    {
     "emoji": "💰",
     "title": "Bargain with a plan",
     "body": "Voss does not pretend that money talks are easy. When it is time to bargain, he says to prepare well and to remember that people react strongly to fairness and to the fear of losing something. Use those feelings carefully and honestly.\n\nHe describes three common styles of negotiators. Analysts are careful and like time to think. Accommodators care about the relationship and enjoy talking. Assertive people want things done quickly and want to be heard first. Knowing your own style and theirs helps you avoid misunderstandings.\n\nFor bargaining, he teaches the Ackerman model. Decide your target price. Make a first offer well below it, around 65 percent of the target. Then raise your offer in smaller and smaller steps, to about 85, 95 and finally 100 percent. Between offers, use empathy and calm 'how' questions instead of simply giving in. For the final offer, use a precise, unusual number, which sounds carefully calculated, and you can add a small non-money item to show you have reached your limit. Simple everyday example: when buying furniture for a staff house, decide your limit before you go, and let your offers rise slowly and kindly."
    },
    {
     "emoji": "🦢",
     "title": "Find the Black Swans",
     "body": "The last idea in the book is about surprises. Voss uses the term Black Swan for a hidden piece of information that you did not even know to look for, but that changes everything once you find it. Every negotiation, he says, probably has a few of these unknown unknowns.\n\nTo find them, keep listening and asking, even when you think you already understand. Pay attention to small details that do not fit. Meet face to face when you can, because people share more in person. Try to understand the other person's worldview, what they believe and value, because that is often where the hidden reason lives.\n\nVoss also says that when someone seems unreasonable or even crazy, they usually are not. Most often they are missing some information, they are limited by something you cannot see, or they have other interests they have not shared. Instead of giving up on them, get curious. Simple everyday example: a landlord who suddenly refuses to renew a lease may not be angry with you at all; perhaps a family member needs the house. Finding that hidden fact can open new solutions for both sides."
    }
   ],
   "tryThis": [
    "In your next conversation, mirror the last few words someone says and see what happens.",
    "Before a hard talk, write down every negative thing they might think about you, and open by naming a few.",
    "Swap one 'why' question for a 'how' or 'what' question this week."
   ],
   "forUs": "Negotiation is everywhere on a mission base — with landlords, vendors at the market, local officials, partner churches and even with each other about schedules, rooms and team plans. These tools are really about listening well, which is a deeply Christ-like skill. Jesus often answered with questions and noticed what people felt underneath their words. Across cultures, slowing down, naming feelings and asking 'how' questions can protect relationships and help everyone save face. In Khmer culture, a direct 'no' can be hard to say, so leaders may need extra patience and gentle questions to learn what someone really thinks. A 'yes' in a meeting may be polite rather than a real agreement, so it is wise to check how a plan will actually work. For international staff, it also helps to remember that a person who seems unreasonable may simply see the situation from a different place, with family needs or pressures we cannot see. With DTS students or outreach teams, a good summary that earns a sincere 'that's right' can calm a tense moment. Use these skills to understand and serve people, never to trick or pressure them.",
   "oneLine": "Make people feel truly understood first, and better agreements will follow.",
   "cover": {
    "bg": "ink",
    "fg": "paper",
    "a": "marigold",
    "b": "paper",
    "motif": "split",
    "layout": "top",
    "font": "sans",
    "upper": true
   }
  },
  {
   "id": "predictable-success",
   "title": "Predictable Success",
   "author": "Les McKeown",
   "year": 2010,
   "isbn": "",
   "shelf": "lead",
   "mins": 10,
   "vibe": "Every team has a life cycle. Know your stage, know your next move.",
   "bigIdea": "Why do some teams grow smoothly while others stay stuck in chaos or slowly lose their life? Les McKeown is a business adviser who has started and advised many organizations. He noticed that organizations, big or small, move through the same predictable stages as they grow. He names seven: Early Struggle, Fun, Whitewater, Predictable Success, Treadmill, the Big Rut and Death Rattle. Each stage has its own typical problems, and each one needs a different kind of leadership. The goal is to reach, and then stay in, the stage he calls Predictable Success. Here a team can set goals and reach them again and again, without losing its energy and creativity. This matters because many leaders take normal growing pains personally. They blame themselves or their teammates for problems that are really just part of a stage. When you can name your stage, you can stop guessing and start asking a better question: what does this stage need from us now? For anyone leading or serving a team, that simple question brings calm, hope and a clear next step.",
   "insights": [
    {
     "emoji": "🗺️",
     "title": "Growth follows a pattern",
     "body": "McKeown's main claim is that growth is not random. Organizations move along a curve. The first four stages go up: Early Struggle, Fun, Whitewater and then Predictable Success at the top. If a team does not take care, it then slides down the other side through Treadmill, the Big Rut and Death Rattle.\n\nYour stage is not only about how old or how big you are. What decides the stage is how the team behaves: how it makes decisions, how it handles growth and how well it balances freedom with structure.\n\nEach stage also has its own main task, a key problem you must solve before you can move forward. If you try to skip a stage, or solve the wrong problem, you stay stuck. Simple everyday example: a team in Whitewater does not need more big dreams right now; it needs clearer roles. A team on the Treadmill does not need more rules; it needs fresh vision. Knowing the pattern helps you give each team what it truly needs, not just what worked last time. It also helps you see that your team is not strange or broken. It is simply in a stage, and every stage has a way forward."
    },
    {
     "emoji": "🌱",
     "title": "Early Struggle",
     "body": "At the start, everything is about survival. Can we find the people, the money and the right idea to keep going? Founders often work very long hours, and every day feels uncertain. Many new ventures do not make it past this stage.\n\nMcKeown says the key question in Early Struggle is simple: is there a real need for what we offer, and can we keep going long enough to prove it? The organization must find a clear group of people it serves, and a way to serve them that can last, before it runs out of money or energy. Until that happens, everything else is less important.\n\nLeaders in this stage need courage, flexibility and a willingness to change the plan quickly. It is not yet the time for detailed systems, long policy documents or a big organization chart. It is time to listen closely to the people you serve and adjust. Simple everyday example: a new ministry might try several ideas before finding the one that truly meets people's needs. That trying is normal, not failure. Once a real need is clearly met and the work can keep going, the team is ready to move into the next stage."
    },
    {
     "emoji": "🎉",
     "title": "Fun",
     "body": "Once the idea works, growth comes fast and it feels exciting. McKeown calls this stage Fun. Decisions are quick, everyone does a bit of everything, and people feel close and full of energy. Results come from hard work, strong instincts and a clear focus on the people you serve, more than from careful plans.\n\nBut Fun has a hidden weakness. It usually depends heavily on one or two key people, often the founder, who makes most of the decisions. While the group is small, this works well. Everyone can talk to the leader, and the leader can see almost everything that is happening.\n\nAs the organization grows, more people and more activities bring more complexity. The same quick, informal style that made this stage so fun starts to cause problems: things are forgotten, work is repeated, and people are unsure who decides what. These are early signs that Whitewater is coming. So enjoy this stage, but start noticing what will need to change. Simple everyday example: a leader might begin writing down how key tasks are done, so the knowledge does not live only in their head, and might start asking others to make some of the smaller decisions."
    },
    {
     "emoji": "🌊",
     "title": "Whitewater",
     "body": "Whitewater is like a small boat in rough water. The group is now bigger, and things get messy: mistakes, confusion and conflict. Growth may slow down, and even good results take more effort than before. The old informal way no longer works, but new systems are not in place yet.\n\nMcKeown says the team now needs clear processes, structures and ways of deciding that do not depend on one person. This change often causes tension. Founders and doers may feel the new rules slow them down and take away the freedom they loved. Others feel the chaos is wearing them out and wish someone would bring order.\n\nThere are two dangers. One is to go back to the founder making every decision, which shrinks the organization back toward Fun. The other is to stay stuck in chaos until people burn out, leave or the work fails. The way through is to agree together on simple systems, share decision-making and keep the original vision alive while you build structure. This is hard for founders, because they must let go of some control and trust others. Simple everyday example: instead of one leader approving every small purchase, a team agrees on a simple budget and lets each area leader decide within it."
    },
    {
     "emoji": "🎯",
     "title": "Predictable Success",
     "body": "This is the sweet spot. There is a good balance between structure and creativity. The team can set goals and reliably reach them. Decisions are made in a clear way, people know their roles, and there is still room for new ideas and flexibility. Work feels steady but still alive.\n\nMcKeown stresses that Predictable Success is not a place you reach once and then relax. It needs constant care. The natural drift is toward more and more systems, until the life is squeezed out. What helped you get here can slowly become too much if nobody is watching.\n\nSo the key work here is to stay balanced and keep renewing. Leaders regularly ask: are our systems still serving our people and our purpose, or are we now serving the systems? Are we still taking some wise risks and trying new things? Are the creative people and the doers still being heard, or only the planners? Simple everyday example: a healthy school keeps its clear schedule and policies, but each year it also reviews what is working, removes rules that no longer help and makes room for fresh ideas. That steady habit of checking and renewing is what keeps a team in this stage for a long time."
    },
    {
     "emoji": "🐹",
     "title": "Treadmill, Big Rut and Death Rattle",
     "body": "If structure keeps growing without new ideas, the team slides onto the Treadmill. Rules, reports and paperwork become the main focus. How things are done starts to matter more than why they are done. Creativity and risk-taking fade. People are busy, but the work feels heavy, and decisions get slow.\n\nNext comes the Big Rut. From the outside things look stable, maybe even comfortable. But inside, the organization has lost its ability to change. It looks inward and keeps doing the same things in the same way, while the world around it moves on. People may not notice the slow decline.\n\nThe final stage, Death Rattle, is decline toward closing or being taken over. By then it is usually too late to save the organization in its old form. McKeown says it is possible to climb back from the Treadmill, but much harder from the Big Rut, because things feel comfortable and people often do not see the need to change. That is why it is so important to notice the early signs. Simple everyday example: if most of your meetings are about forms and reports, and almost none are about the people you serve, take that as a warning light."
    },
    {
     "emoji": "🔄",
     "title": "Climbing back to Predictable Success",
     "body": "How does a team get off the Treadmill? McKeown's answer is to bring back what was squeezed out. In the early stages, Visionaries and Operators brought energy, ideas and action. On the Treadmill, the systems have taken over, and the risk-takers have often gone quiet or left.\n\nSo the cure is to welcome back vision and action. Leaders reconnect the team to its original purpose and ask what it is really here to do. They listen to frontline people, who often see problems long before the leaders do. They give people permission to try new things again, even if some tries fail.\n\nAt the same time, they take an honest look at the systems. Which rules, reports and meetings still help the mission, and which only exist because they always have? Removing what no longer helps frees time and energy for what matters. This is not about throwing away all structure and going back to chaos. The goal is balance again, with structure serving people instead of people serving structure. Simple everyday example: a long-running program might keep its good schedule and safety rules, but invite a few creative staff to redesign one part of it from the beginning this year."
    },
    {
     "emoji": "🧑‍🤝‍🧑",
     "title": "Different leaders for different needs",
     "body": "McKeown describes four leadership styles. The Visionary loves big ideas and new possibilities, and is comfortable with risk. The Operator loves action and getting things done now. The Processor loves systems, order and clear data, and wants things done carefully and correctly. The Synergist is the one who helps the others work together toward a shared goal.\n\nEach style is needed, but at different times. Visionaries and Operators drive Early Struggle and Fun. Processors become vital in Whitewater, when the team needs structure. But the styles often clash. Operators think Processors slow everything down. Processors think Operators create chaos. Visionaries can frustrate both by bringing new ideas just as everyone is busy with the last one.\n\nThese clashes are not just personality problems. When one style wins too completely, the balance is lost, and the team can get stuck or start to slide. Knowing your own natural style helps you see your blind spots and value people who are different from you. Simple everyday example: a person who loves quick action can learn to ask a careful planner what could go wrong, instead of seeing the planner's questions as a wall."
    },
    {
     "emoji": "🧩",
     "title": "Learn to be a Synergist",
     "body": "McKeown says the Synergist role is the key to staying in Predictable Success. A Synergist is not loyal to one style or one department. Their focus is the good of the whole organization. They help Visionaries, Operators and Processors understand each other and work as one team.\n\nThe good news is that McKeown says people of any style can learn to act more like Synergists. It is not only a gift some people are born with. It is a way of leading that you can practise.\n\nWhat does that look like? A Synergist puts the shared goal ahead of being right. They see the value each style brings and make room for every voice in a decision. When a conflict comes, they ask what each person is trying to protect, and look for a way forward that serves the whole team. They are willing to slow down a little so that the team can move together. Simple everyday example: in a planning meeting, a Synergist might notice that the quiet planner has not spoken yet, and ask for their view before the group decides. Or they might remind an excited dreamer to explain how the new idea fits the shared goal. Small habits like these keep a team balanced, healthy and growing."
    }
   ],
   "tryThis": [
    "With your team, discuss honestly: which of the seven stages are we in right now?",
    "Notice whether you lean more Visionary, Operator or Processor, and thank someone whose style is different from yours.",
    "If you are in a messy growth season, choose one simple process to put in place this month."
   ],
   "forUs": "A mission base has many small 'organizations' inside it: a new cafe, a long-running DTS, an outreach that just started, a community project that has run for years. Each may be in a different stage, so each needs a different kind of leadership. A new ministry may need freedom and quick tries. A growing one may need simple systems, like clear roles and a basic budget. An older one may need fresh vision so it does not become a treadmill of forms and meetings. Because staff change often, a team can also fall back into Whitewater when key people leave, and that is normal too. Visionaries, doers and system-builders on our teams often frustrate each other, especially across cultures, where people show their ideas and concerns in different ways. Some staff may see a problem clearly but wait to be asked, because speaking up to a leader can feel rude. Leaders can learn to be Synergists by inviting every voice and putting our shared calling first. Valuing each style, and asking God for unity, helps us grow without losing the life and passion that started the work in the first place.",
   "oneLine": "Know your team's stage of growth, and balance vision, action and structure to stay healthy.",
   "cover": {
    "bg": "blue",
    "fg": "paper",
    "a": "marigold",
    "b": "paper",
    "motif": "curve",
    "layout": "top",
    "font": "sans"
   }
  },
  {
   "id": "the-4-disciplines-of-execution",
   "title": "The 4 Disciplines of Execution",
   "author": "Chris McChesney, Sean Covey & Jim Huling",
   "year": 2012,
   "isbn": "9781451627053",
   "shelf": "lead",
   "mins": 10,
   "vibe": "Great plans die in the busyness. Here's how to actually get it done.",
   "bigIdea": "Most goals do not fail because the plan is bad. They fail because the daily urgent work eats up all our time and attention. Chris McChesney, Sean Covey and Jim Huling worked with many organizations through FranklinCovey, and they call this daily pressure the whirlwind. Leaders announce a big new goal, everyone agrees, and then the whirlwind of normal work slowly swallows it. A few months later, nobody remembers it. The authors found that many workers could not even name their team's most important goals. The 4 Disciplines of Execution, often called 4DX, give teams a simple way to keep their most important goal alive in the middle of the whirlwind. The four disciplines are: focus on the wildly important, act on lead measures, keep a compelling scoreboard and create a cadence of accountability. Each one builds on the one before. The ideas are simple, but not easy, because they ask people to change what they do each week. For anyone leading a team, school or ministry, 4DX is a practical way to turn good intentions into real results, without pretending the daily work will ever go away.",
   "insights": [
    {
     "emoji": "🧭",
     "title": "Two kinds of goals",
     "body": "The authors start with a simple observation. Some goals can be reached with a stroke of the pen. A leader decides, signs and pays for something, and it happens: a new building, a new computer system, a new staff position. These goals need money and a decision, but not many people changing how they work.\n\nOther goals are very different. They need many people to change their everyday behaviour, and to keep doing it week after week. Better customer service, more follow-up visits, healthier habits in a team: none of these happen just because a leader announces them. The book is mainly about this second kind of goal, because it is much harder.\n\nWhen people are asked to work in new ways, they face the daily pressure of their normal work, old habits and many competing priorities. Even willing people slip back. This is why leaders need more than a good plan and a motivating speech. They need a clear system that helps ordinary people change their behaviour, little by little, in the middle of a busy life. Simple everyday example: buying new chairs for a classroom is a quick decision. Getting every teacher to start class on time, every day, is a change in behaviour, and it needs steady support to last."
    },
    {
     "emoji": "🌪️",
     "title": "The whirlwind",
     "body": "The whirlwind is all the urgent daily work that keeps things running: messages, meetings, customers and problems that need fixing today. It is necessary. If you ignore it, things fall apart. But it always shouts louder than new goals.\n\nThe authors point out a key difference. The whirlwind is urgent, and it acts on you. A new goal is important, but you must act on it, and it rarely feels urgent. So the whirlwind wins almost every time. It is not that people do not care about the goal. They are simply busy keeping the daily work alive.\n\n4DX does not try to remove the whirlwind. That is impossible, and it would not be wise. Instead, it protects a small part of your time and energy for what matters most, while most of your time still goes to the daily work. The four disciplines are the rules for doing this in the middle of real life, not in a perfect world. Simple everyday example: a cafe team still needs to serve every guest, clean the tables and order supplies. But it can protect a little time each week to work on one big improvement, and that steady small effort adds up over the months."
    },
    {
     "emoji": "🎯",
     "title": "Discipline 1: Focus on the Wildly Important",
     "body": "Choose one, or at most two, Wildly Important Goals, which the authors call WIGs. A WIG is a goal that will make a real difference, where failing would be a serious loss. The authors explain that focus works almost like a law: teams with two or three goals often reach them well, but teams with many goals often reach none of them with excellence.\n\nThis is hard, because many good goals compete for attention, and leaders like to say yes. The authors suggest asking: if everything else stayed the same, which one area would make the biggest difference? Saying no to good ideas is part of the discipline.\n\nEach WIG should be written as a clear finish line: from X to Y by when. Simple example: grow repeat guests from 20 to 35 a week by December. Without a finish line, a goal stays a nice wish. A team's WIG should help the bigger organization's WIG, like small battles that help win a war. Senior leaders can guide and can say no to a weak choice, but they should not simply hand the goal down. Teams should help choose their own WIGs, so they own them and truly care about the result."
    },
    {
     "emoji": "🧮",
     "title": "Discipline 2: Act on lead measures",
     "body": "Lag measures tell you the result: income, attendance, weight lost. They matter, because they show whether you reached your goal. But by the time you see them, it is too late to change them. Lead measures are the actions you can control that drive the result.\n\nA good lead measure has two features. It is predictive: if it moves, the result will likely move too. And it is influenceable: the team can directly make it happen, without depending mostly on others.\n\nThe book's simple example is weight loss. Weight lost is the lag measure. Calories eaten and exercise each day are lead measures. You cannot control the scale directly, but you can control your meals and your walks, and if you do them well, the scale will follow. The authors say this discipline makes the biggest difference, and it is also the hardest. Lead measures can feel strange, because most people are used to watching only results. They are easy to forget, and they are often hard to track, because nobody is collecting that information yet. So the team must decide how it will track them, simply and honestly, and then do it every single week."
    },
    {
     "emoji": "🪜",
     "title": "Two kinds of lead measures",
     "body": "The authors describe two types of lead measures. The first is a small outcome: a short-term result the team commits to reach, while staying free to choose how to get there. The second is a leveraged behaviour: one specific action the team commits to doing, in the same way, again and again.\n\nBoth can work. A small outcome gives the team freedom to be creative. A leveraged behaviour gives clarity, because everyone knows exactly what to do. Teams choose the type that best fits their goal and their situation.\n\nFinding good lead measures takes careful thinking. The authors encourage teams to ask questions like: what could we do that we have never done before, or what could we do better, that would make the biggest difference to the goal? Many ideas will come up, and that is good. The team then picks just a few that are both predictive and in their control. Simple everyday example, going back to weight loss: a small outcome might be staying under a set number of calories each day, however you manage it. A leveraged behaviour might be a thirty-minute walk every evening. Both are actions you can track this week, long before the scale shows the final result."
    },
    {
     "emoji": "📊",
     "title": "Discipline 3: Keep a compelling scoreboard",
     "body": "People play differently when they keep score. The authors say that when a team can see if it is winning or losing, energy and focus rise. Simple everyday example: kids playing football in the street play with much more energy when someone is keeping score.\n\nSo make a scoreboard for the players, not only for the leaders. A leader's scoreboard is often complex and full of data. A players' scoreboard is simple and easy to see. Within a few seconds, anyone should know the goal, the lead measures, the lag measure and whether the team is winning right now.\n\nIdeally, the team designs the scoreboard itself, so people own it. It does not need to be fancy; a hand-drawn chart can work well if it is clear. Put it where everyone sees it often, like on an office wall, and update it regularly. When people can see the progress made through their own actions, they start to care more about the goal. The scoreboard also keeps the goal visible in the middle of the whirlwind, so it is harder to forget. And when the team is losing, the scoreboard shows it early, while there is still time to change what they are doing."
    },
    {
     "emoji": "🗓️",
     "title": "Discipline 4: A cadence of accountability",
     "body": "The fourth discipline is where execution really happens. Teams meet regularly for a short WIG session, usually weekly and around 20 to 30 minutes. It is held on the same day and at the same time each week, so it becomes a habit. Each meeting follows the same simple pattern.\n\nFirst, account: each person reports on the commitments they made last week. Second, review the scoreboard: are we winning or losing, and what did we learn from what worked and what did not? Third, plan: each person makes one or two new commitments for the coming week that will move the lead measures. There is one strict rule: no whirlwind talk. Daily problems, schedules and other issues belong in other meetings. This keeps the session short, focused and full of energy.\n\nThe rhythm matters. When people know they will report to their team every week, they keep the goal in mind during the busy days in between. Without this regular check-in, even good goals slowly slip back into the whirlwind. Simple everyday example: a ministry team might meet every Monday morning for twenty minutes, standing around the scoreboard, before the rest of the week begins."
    },
    {
     "emoji": "🤝",
     "title": "Commitments, not orders",
     "body": "In WIG sessions, people choose their own commitments instead of only receiving tasks. Each person asks: what are the one or two most important things I can do this week to move the scoreboard? Because they chose it, they own it. A good commitment is specific, it is something the person can really do this week, and it goes beyond the normal daily work.\n\nThe authors say people are more committed to their own ideas than to orders from above. Keeping a promise to your team builds trust and real accountability. It is not mainly about the boss checking on you; it is about teammates keeping their word to each other.\n\nLeaders make commitments too, and they can ask what they can do to clear the path for their people this week. Sometimes a team member is blocked by something only a leader can fix. Over time, as people keep commitments and see the scoreboard move, the team starts to feel like winners. That feeling of winning is very motivating, and it can slowly change the culture of a whole team. People begin to see that they can make a real difference, even in a very busy season."
    },
    {
     "emoji": "📈",
     "title": "Change happens in stages",
     "body": "The authors also explain what happens when a team starts using 4DX. They describe five stages of behaviour change. First, getting clear: leaders and the team agree on the WIG, the lead measures and the scoreboard. Second, launch: the team starts, often with a kickoff meeting and lots of attention. Third, adoption: the team follows the process, even when it feels awkward, until it starts to show results.\n\nFourth comes optimization. Now the team is used to the disciplines, and it starts to find better ways of moving the lead measures. People bring more ideas and take more ownership. Fifth, habits: the disciplines become simply the way the team works, and they keep going even when the goal changes.\n\nKnowing these stages helps leaders stay patient. The early weeks can feel slow and a little forced, and some people will resist. That is normal, not a sign of failure. Steady leaders keep the weekly rhythm going until results begin to build trust. Simple everyday example: a new weekly check-in may feel stiff for the first month, but after a few wins on the scoreboard, people often start to look forward to it."
    }
   ],
   "tryThis": [
    "With your team, choose one Wildly Important Goal and write it as 'from X to Y by when'.",
    "Name two lead measures — actions you control — that will move that goal.",
    "Start a 20-minute weekly check-in: report, review the scoreboard, make one commitment each."
   ],
   "forUs": "Base life is a strong whirlwind: guests arriving, meals, worship, school schedules, visa runs, sickness and surprises. Many good plans start at a staff meeting and are forgotten a month later. 4DX offers a gentle structure. If your ministry has a big goal, such as more Khmer leaders trained, a stronger cafe or better follow-up after outreach, pick one. Choose a few simple actions you can control, and check in weekly for twenty minutes. A whiteboard scoreboard in the office can bring Khmer and international staff together around one clear win, even with limited shared language, because everyone can see the progress. Letting each person choose their own weekly commitment also shows respect, instead of only giving orders from the top. In a DTS or school, the same idea can help students build a habit, like daily Bible reading or language practice. Expect the first weeks to feel slow, and be patient with each other. Keep it humble. Goals are tools to serve people well, not a way to measure anyone's worth, and we still pray, rest and trust God with the results.",
   "oneLine": "Pick one big goal, track the actions that drive it, keep score and check in every week.",
   "cover": {
    "bg": "paper",
    "fg": "ink",
    "a": "cobalt",
    "b": "marigold",
    "c": "teal",
    "d": "berry",
    "motif": "four",
    "layout": "top",
    "font": "sans"
   }
  },
  {
   "id": "thou-shall-prosper",
   "title": "Thou Shall Prosper",
   "author": "Rabbi Daniel Lapin",
   "year": 2002,
   "shelf": "lead",
   "mins": 10,
   "vibe": "Money is not dirty. Done right, it's a sign that you served people well.",
   "bigIdea": "Many people, including many Christians, feel that money and business are a bit dirty. Rabbi Daniel Lapin disagrees. He is a rabbi and teacher who often speaks about faith, culture and economics, and he draws on old Jewish wisdom and teaching. He argues that business is moral, honourable work. In his view, money is mostly about relationships: you earn it by meeting the real needs of other people, who freely choose to pay you. He shares ten 'commandments' for making money, and most of them are really about character, trust and serving others well. They cover how you see business, how you build friendships, how you know yourself, how you lead, how you plan for the future and how you handle money. Wealth is not the goal of life. It is a tool, and how you earn it, use it and give it says a lot about who you are. That makes this a book about faithfulness, not only about finances. For anyone who leads a team, runs a ministry business or lives on support, it offers a healthy, hopeful way to think about money, without fear or shame.",
   "insights": [
    {
     "emoji": "🤝",
     "title": "Business is moral work",
     "body": "Lapin pushes back on the idea that business is greedy or second-class work. His first commandment is to believe in the dignity and morality of business. If you secretly feel that making money is wrong, you will struggle to do it well, and you may even feel guilty about serving customers or asking for a fair price.\n\nSimple everyday example: when you sell good coffee at a fair price, you make someone's day better, and they freely choose to pay you. Both sides win, and nobody was forced. The customer wants the coffee more than the money, and you want the money more than the coffee.\n\nLapin says that in a free exchange, you gain only by first giving someone else something they value. That is a good thing. It means honest business keeps pushing people to think about the needs of others. Believing this changes how you work. You can serve with pride, honesty and care, knowing that excellent work is a way to bless people and not just a way to get paid. It also helps you give honour to people who work in business, instead of quietly looking down on them. Their daily work of meeting needs can be good and worthy work."
    },
    {
     "emoji": "🧾",
     "title": "Money as a thank-you note",
     "body": "Lapin describes money as a kind of certificate. Each one is a record that says you served someone and they valued what you did. In a sense, money is a thank-you note from the people you helped. It is proof that you did something useful for another person.\n\nThis changes the question we ask. Instead of asking how to get more money, the better question is how you can serve more people, and serve them better. Money tends to follow real service. So when you want to grow, start by looking closely at the needs of the people around you.\n\nIt also changes how we see honest success. If someone earned money fairly, it usually means they served many people well. That does not make a rich person a better person, and money can still be misused. But it helps us stop seeing honest earning as shameful, and it helps us respect people who have earned more than us instead of feeling jealous of them. Simple everyday example: a tuk-tuk driver who is safe, kind and on time soon has more regular customers. His growing income is a sign of the trust that many people now place in him, and of the real help he gives them each day."
    },
    {
     "emoji": "🕸️",
     "title": "Grow your circle of people",
     "body": "Making money is a team sport, because it always happens between people. Nobody earns a living alone on an island. One of Lapin's commandments is to keep widening your network of real connections.\n\nHe encourages you to build many true friendships, not only useful contacts you call when you need something. Show real interest in people. Remember their names and their stories. Look for ways to help them, even when there is nothing to gain right away. People can usually tell whether you care about them or only about what they can give you.\n\nThe more people you know and care about, the more ways you can serve them, and the more chances come your way through them. A new job, a new customer or a helpful idea often comes through a friend. Part of this is becoming the kind of person others enjoy being around. Be reliable, be pleasant and keep learning, so you have something to offer in every conversation. Simple everyday example: someone who keeps in touch with old classmates, asks about their families and helps when they can will have many friends to call on, and many people to bless, for years to come."
    },
    {
     "emoji": "🪞",
     "title": "Know yourself, then change",
     "body": "Lapin urges you to look honestly at your own habits, strengths and weak spots. Getting to know yourself is hard, because we easily fool ourselves. We tend to see our good side clearly and our weak side hardly at all. So take time to reflect, and listen carefully to how others see you, even when it is uncomfortable.\n\nKnowing yourself shows you where you need to grow. It also helps you understand why you react the way you do with money, with people and under pressure.\n\nAnother of his commandments is about change itself: keep changing the things that should change, while holding firmly to the things that must never change. Methods, tools and styles can change with the times. Values, honesty and promises must not. People who change everything become hard to trust, and people who change nothing get left behind. Simple everyday example: a shop can update its menu and prices, and learn to take payments by phone, but it should never cheat on weights or break its word to a supplier. Wisdom is knowing which things belong in which group, and having the courage to act on it. Asking this question regularly keeps both your work and your character healthy."
    },
    {
     "emoji": "🧭",
     "title": "Lead consistently",
     "body": "Many people think leadership is only for bosses. But in daily life you also lead in small ways: with customers, coworkers, family and even yourself. One of Lapin's commandments is to lead consistently.\n\nPeople need to know what to expect from you, on good days and bad days. A leader whose mood or promises keep changing is hard to trust or follow. If you are warm one day and harsh the next, people spend their energy guessing instead of working. If you say one thing and do another, they stop believing your words.\n\nConsistency grows from clear values. When you know what you stand for, you can act in the same way even when you are tired, stressed or tempted to take a shortcut. Over time, that steady behaviour builds trust, and trust is the ground that every good working relationship stands on. Simple everyday example: a team leader who always starts meetings on time, keeps small promises and responds calmly to mistakes soon finds that people relax, speak honestly and follow willingly. Nothing dramatic happened. The leader simply became someone others could count on, day after day, in small things as well as big ones."
    },
    {
     "emoji": "🔭",
     "title": "Look ahead and know your money",
     "body": "Lapin sees the ability to look ahead as an important human gift. We can plan, save and give up something today for something better later. He encourages readers to grow this skill: think long term, notice patterns and prepare for what is coming, instead of living only for today.\n\nHe also urges you to know your money. That means understanding how money works, keeping track of what comes in and what goes out, and not being afraid to look at the numbers. Many people avoid this because it feels stressful, but not knowing usually makes things worse. Problems that are small and easy to fix can grow quietly when nobody is watching.\n\nSimple everyday example: someone who writes down every expense for one month often finds small leaks they never noticed, like daily snacks or phone top-ups that add up. Clear knowledge brings calm, and it helps you make wise choices instead of reacting to each new crisis. Looking ahead and knowing your money work together. When you know where you stand today, you can make a realistic plan for tomorrow, and you can be ready to help others when they are in need."
    },
    {
     "emoji": "🎁",
     "title": "Give a tenth away",
     "body": "Lapin teaches giving about ten percent of what you earn to charity. This comes from a long Jewish tradition where giving is seen as doing what is right, not just a nice extra for people who have plenty. In that tradition, giving is for everyone, not only for the rich.\n\nGiving reminds you that what you have is not only yours. It also breaks the grip that money can have on your heart. You become the master of your money instead of its servant. Lapin also links giving to the way you see yourself: when you give, you start to see yourself as someone who has enough to share, and that changes how you act.\n\nGiving keeps you connected to others and keeps you generous when things are good and when they are hard. It turns your attention outward, toward the needs around you, which is the same habit that helps someone serve people well in business. Simple everyday example: a person who gives first, at the start of each month, usually gives more steadily than one who waits to see what is left over. The amount may be small at first. What matters most is building a steady habit of open hands."
    },
    {
     "emoji": "🎬",
     "title": "Act the part",
     "body": "Another of Lapin's commandments is to act the part. He draws on a Jewish idea that our actions shape our hearts. We often think we must first feel confident, generous or disciplined, and then we will act that way. Lapin says it often works the other way around. When you act like the person you want to become, your feelings and character slowly follow.\n\nThis applies to small, everyday things. How you dress, how you speak, how you greet people and how you keep your workspace all send a message, both to others and to yourself. If you hope to be trusted with more responsibility, start behaving like a responsible person now.\n\nThis is not about pretending or being fake. It is about choosing good actions on purpose, even before they feel natural, and letting those actions train you. Simple everyday example: a shy new staff member who decides to greet every guest with a smile and a clear hello may feel awkward at first. But after some weeks, the warmth feels real, guests feel welcome, and the person has grown into someone more confident and caring than before. Good habits, practised on purpose, slowly become part of who we are."
    },
    {
     "emoji": "🚫",
     "title": "Don't chase perfection, don't retire",
     "body": "Waiting for the perfect plan or the perfect moment keeps you stuck. Lapin warns against chasing perfection. People and businesses grow by acting, making mistakes and improving as they go. A good plan started today is often better than a perfect plan that never starts. Fear of getting it wrong can quietly stop us from ever trying.\n\nHis last commandment is never to retire. He does not mean you must keep the same job until you die. He argues against the idea that the goal of life is to stop working and do nothing. Work is one of the main ways we serve others and find meaning.\n\nSo as you get older, you may slow down or change roles, but keep serving and stay useful as long as you can. Purposeful work keeps your mind and relationships healthy, and it lets you keep blessing people with the skills and wisdom you have gained over the years. Simple everyday example: an older staff member who can no longer lead outreach trips might mentor young leaders, pray with teams or teach a practical skill. The role changes, but the serving goes on, and so does the joy of being useful."
    }
   ],
   "tryThis": [
    "Think of one customer, guest or supporter and ask: what real need am I meeting for them?",
    "Reach out to one person outside your usual circle this week, just to get to know them.",
    "Look at your budget and decide on one clear, planned gift you will give this month."
   ],
   "forUs": "On a mission base we can feel awkward about money. Some of us run a cafe, a guesthouse or a small business, and many of us live on support from churches and friends. This book helps us see both as relational and honourable. Serving guests with excellence is ministry, not a distraction from it. A fair price, a clean table and a warm welcome all show care. Partners who give are real relationships to care for, not just bank deposits, so thank them, update them and pray for them. Leaders can practise being consistent and keeping their word, which matters even more when Khmer and international staff come from different cultures and are still learning to trust each other. Knowing our money, keeping simple records and giving generously from what we have, even when support is small, protects us from fear and secret worry. Lapin writes from a Jewish view, and we read him through our faith in Jesus. Still, Khmer and international staff alike can learn to handle money with honesty, generosity and joy, trusting God as the true provider.",
   "oneLine": "Serve people well, keep your word, give generously, and money becomes a tool for good.",
   "cover": {
    "bg": "laterite",
    "fg": "paper",
    "a": "marigold",
    "b": "paper",
    "motif": "tablets",
    "layout": "top",
    "font": "serif"
   }
  },
  {
   "id": "the-e-myth-revisited",
   "title": "The E-Myth Revisited",
   "author": "Michael E. Gerber",
   "year": 1995,
   "isbn": "9780887307287",
   "shelf": "lead",
   "mins": 10,
   "vibe": "Stop just working IN your business. Start working ON it.",
   "bigIdea": "Michael Gerber worked with thousands of small business owners and saw the same sad pattern again and again. Most small businesses fail, he says, because of a myth: the belief that people who are good at a skill will be good at running a business that uses that skill. A great baker opens a bakery and is soon drowning in work, with no time for family or rest. The business owns them. Gerber is a business adviser who built a company to help small business owners, and he follows one pie shop owner, Sarah, through the book as he explains his ideas. His answer is to build simple, clear systems so the business runs well without depending on one tired person. Think of your work as a model that anyone could follow, and write down how it should be done. His big message: stop only working in your business, and start working on it. That idea matters far beyond business. Any team, ministry or project that depends on one exhausted person is fragile. Building good systems lets ordinary people do excellent work, and it lets leaders rest, think and plan.",
   "insights": [
    {
     "emoji": "🥧",
     "title": "The great myth",
     "body": "Many businesses start when a skilled worker gets tired of working for someone else. Gerber calls this an 'entrepreneurial seizure'. The worker decides they could do it better on their own and keep all the profit. Then they assume that knowing the technical work means they know how to run a business. Gerber calls this the fatal assumption.\n\nHe tells the story of Sarah, who loved baking pies and opened her own pie shop. At first it was exciting. Soon she was working long hours, doing everything herself: baking, cleaning, buying, selling and keeping the books. She started to dislike the very thing she once loved, and she felt trapped by the business she had hoped would set her free.\n\nBeing good at the work is not the same as building a business. A business needs planning, systems, marketing, money management and people. If you only know how to do the work, you have simply bought yourself a demanding new job, often with a boss who is harder on you than any boss before. So the first step is honesty. Ask whether you are running your business, or whether it is running you."
    },
    {
     "emoji": "🎭",
     "title": "Three people inside you",
     "body": "Gerber says everyone who goes into business has three people inside. The Entrepreneur is the dreamer, who lives in the future and sees new possibilities. The Manager loves order and planning, and wants things to be predictable. The Technician is the doer, who lives in the present and just wants to get the work done.\n\nEach one wants to be the boss, and they often fight. The Entrepreneur keeps bringing new ideas, the Manager wants to control them, and the Technician wishes both would stop talking so the real work can get done. Gerber says the typical small business owner is about 10 percent Entrepreneur, 20 percent Manager and 70 percent Technician. So the Technician runs everything, and the business never grows beyond what one person can do.\n\nA healthy business needs all three voices working together, in balance. The dreamer gives direction, the manager brings order, and the technician does excellent work. Simple everyday example: someone running a small cafe needs to dream about what it could become, plan how it will work, and still make great coffee. If they only make coffee, the cafe will stay exactly where it is, and so will they."
    },
    {
     "emoji": "🌱",
     "title": "The stages of growth",
     "body": "Gerber describes three stages of growth. In infancy, the owner and the business are the same thing. The owner does everything, and if the owner stops, the business stops. Infancy ends when the owner sees that the business cannot go on like this.\n\nIn adolescence, the owner gets help, often by hiring someone. But Gerber warns against what he calls management by abdication: handing work to someone and then walking away, with no clear systems or standards. When things go wrong, the owner takes everything back and works even harder. Sooner or later the business grows beyond the owner's comfort zone, the size they feel able to control. Many businesses then shrink back to what the owner can handle alone, or crash under the pressure.\n\nMaturity is different. A mature business is built from the start with a clear picture of what it will become. Gerber points to IBM, whose leader Tom Watson described having a clear picture from the beginning of how the company would look when it was finally done. He then built for that future picture, not just for today. Simple everyday example: a small ministry that writes down what it hopes to look like in five years can make today's choices with that picture in mind."
    },
    {
     "emoji": "🔭",
     "title": "Think like an Entrepreneur",
     "body": "Gerber explains that the Technician and the Entrepreneur look at a business in very different ways. The Technician asks: what work has to be done? The Entrepreneur asks a bigger question: how must the business work? The Technician sees the business as a place to practise a craft. The Entrepreneur sees the business as a system that produces good results for customers.\n\nGerber says the Entrepreneur's view starts with a clear picture of the customer. Who are they? What do they need, want and hope for? Only after that does it ask what kind of business would serve them best. The Technician often does the opposite, starting with what they like to make and hoping customers will come.\n\nThis view also sees the business itself as a product, something to be designed with care. The goal is a business that works well, again and again, whether or not the owner is there. Simple everyday example: a person who loves cooking might open a restaurant serving only their favourite dishes. Someone with the Entrepreneur's view first asks who lives nearby, what they need and what would truly make their day better, and then designs the restaurant around those answers."
    },
    {
     "emoji": "🍔",
     "title": "Build it like a franchise",
     "body": "Gerber's big idea is the 'franchise prototype'. He is not saying you must sell franchises. He means build your business as if you will copy it 5,000 times. McDonald's under Ray Kroc is his favourite example: the system itself is the product, so young workers anywhere can serve the same meal.\n\nHe also tells of staying at a small hotel where everything was just right: a warm fire, a mint on the pillow, and his favourite coffee waiting the next morning. The manager explained that none of it was luck; it all came from a clear system the staff followed.\n\nGerber gives some simple rules for this model. It should give people steady value, more than they expect. It should be run by people with the lowest possible level of skill, because the system carries the load. It should be a place of clear order. All the work should be written down in manuals. Service should be the same every time, and things like dress, colours and the building should follow a clear standard. The result is steady quality. Customers know what to expect, no matter who is on shift, and workers know exactly how to do well."
    },
    {
     "emoji": "📋",
     "title": "Systems over heroes",
     "body": "When things depend on one superstar, everything breaks when that person is sick, tired or leaves. Gerber says good businesses are built so ordinary people can do excellent work, with the help of good systems.\n\nThis is not about treating people like machines. Good systems free people to focus, grow and serve well, because they do not have to guess or reinvent everything each day. A clear system also makes training much easier, and it lets the owner step back without the work falling apart.\n\nGerber suggests a simple cycle he calls innovation, quantification and orchestration. First, try a new way of doing something. Second, measure the results with real numbers, so you know what actually works instead of guessing. Third, when something works, make it the standard way, so everyone does it. Then keep looking for better ways, because the cycle never really ends. Simple everyday example: a guesthouse might test a new welcome checklist, see whether guests feel more at home and leave better feedback, and then train every staff member to use it. Later, someone may suggest an even better welcome, and the cycle begins again."
    },
    {
     "emoji": "🗺️",
     "title": "Plan the whole thing",
     "body": "Gerber gives a simple program for building a business, step by step. First comes your primary aim: what do you want your life to look like? The business should serve your life, not swallow it. Next is your strategic objective: a clear picture of what the business must become to support that aim, with standards you can measure.\n\nThen comes your organizational strategy: draw an org chart of roles, not names. Even if one person fills many roles today, write down each role and what it is responsible for. Then, as the business grows, you can hand over one role at a time, with clear results expected.\n\nAfter that, plan your management, people, marketing and systems strategies. Good management, in Gerber's view, is a set of clear steps that gives every customer the same good experience. The people part is not only about rules. Gerber says people need to understand why the work matters, so the business should feel like a game worth playing, with clear rules and a clear purpose. Simple everyday example: a small team that writes down every role soon sees which roles are empty and who needs help."
    },
    {
     "emoji": "🎯",
     "title": "Marketing starts with the customer",
     "body": "In his marketing strategy, Gerber's message is clear: what matters most is not what you want, but what your customer wants. And customers often decide in ways they do not fully notice. They react to how a place looks, feels and sounds, often before they think it through.\n\nGerber talks about two ways of knowing your customer. Demographics tell you who your customers are: their age, income, family and where they live. Psychographics tell you why they buy: what they value, what they hope for and what makes them feel good. Both matter, but the second is often forgotten.\n\nBecause customers notice so much without thinking about it, every detail of a business speaks to them. Colours, shapes, words, uniforms and even the way the phone is answered all send a message. Gerber encourages owners to test these details and keep what works best. Simple everyday example: two cafes may sell the same coffee at the same price. One is clean, bright and quick to greet people; the other is messy and quiet. Most guests will choose the first one, even if they could not say exactly why."
    },
    {
     "emoji": "⚙️",
     "title": "Three kinds of systems",
     "body": "The last step in Gerber's program is the systems strategy. He says a business is made of systems, and he names three kinds.\n\nHard systems are things that are not alive: the building, the furniture, the equipment, even the colour of the walls. Soft systems are people, and the ideas, scripts and methods they use. For example, Gerber shows how a simple, well-planned sales conversation can help any staff member serve a customer well. Information systems give you facts about how the other systems are working: how many customers came, what they bought and what went wrong.\n\nAll three work together. A good building with untrained people does not work well. Trained people without good information cannot see what to improve. And information is useless if nobody acts on it. Gerber's point is that each of these can be designed on purpose, not left to chance. Simple everyday example: a school office might arrange its room so forms are easy to find, write a short script for welcoming new students, and keep a simple record of common questions. Each small system makes the next day smoother for everyone, especially for the next person who takes over the job."
    }
   ],
   "tryThis": [
    "Write a simple step-by-step checklist for one task you do every week.",
    "Draw an org chart of roles in your ministry, then write who fills each one today.",
    "Block one hour this week to work ON your ministry, not IN it."
   ],
   "forUs": "Our cafe, guesthouse, school office and kitchen all run better with simple systems. Staff come and go every few months, so if knowledge lives only in one person's head, it leaves with them. Written checklists in English and Khmer, with pictures where helpful, help new staff and volunteers serve well from day one. An org chart of roles, not names, shows which jobs are empty and who is carrying too much. Thinking like Gerber's Entrepreneur also helps: before starting a new ministry, ask who we are serving and what they truly need, not only what we enjoy doing. Small details, like a clean entrance, a warm greeting and clear signs, tell guests and neighbours that they matter. Good systems also free leaders to think, pray and plan instead of putting out fires all day. This is not about being cold or businesslike. Good systems are a form of love: they protect people from burnout and make it easier for the next team to carry the work forward. Build so the ministry can thrive long after you leave.",
   "oneLine": "Build simple systems so your work can thrive without you holding it all.",
   "cover": {
    "bg": "paper",
    "fg": "berry",
    "a": "berry",
    "b": "ink",
    "motif": "gears",
    "layout": "top",
    "font": "serif"
   }
  },
  {
   "id": "the-tipping-point",
   "title": "The Tipping Point",
   "author": "Malcolm Gladwell",
   "year": 2000,
   "isbn": "9780316346627",
   "shelf": "lead",
   "mins": 10,
   "vibe": "Small things can start big waves. Here's how ideas go viral.",
   "bigIdea": "Why do some ideas, products and habits suddenly spread everywhere, while others die quietly? Malcolm Gladwell, a journalist who writes about how people think and behave, says social change often works like a flu. For a long time almost nothing seems to happen. Then one day the idea reaches a 'tipping point', and it spreads very fast.\n\nGladwell believes this is not luck or magic. He looks at shoes, crime, children's TV, health campaigns and more, and he finds three rules behind them. First, a few special people do most of the spreading. Second, the message must be 'sticky', so people remember it and act on it. Third, the setting around people shapes what they do, often more than we think.\n\nHis big claim is hopeful. Change does not always need huge money or huge effort. It needs the right push in the right place.\n\nThis matters for anyone who leads or serves. You may not have money, fame or a big team. But if you understand these three rules, you can stop wasting energy on things that do not help, and put your small strength where it can make a huge difference.",
   "insights": [
    {
     "emoji": "🦠",
     "title": "Change spreads like a virus",
     "body": "Gladwell asks us to think about trends like epidemics. Epidemics have three features. They are contagious, passing from person to person. Little causes can have big effects. And change happens suddenly, at one dramatic moment, not slowly and evenly. That moment is the tipping point.\n\nHis opening example is Hush Puppies, an old American brand of shoes. By the early 1990s almost nobody bought them. Then a few young people in New York started wearing them, partly because nobody else did. Fashion designers noticed. Soon the shoes were everywhere, and sales grew many times over in a short time. The company did not plan any of it. He also points to New York City in the 1990s, where violent crime had been high for years and then fell sharply in a short time. No single huge change explained it, yet the whole city seemed to tip.\n\nThis idea gives hope. We often expect change to need huge effort over a long time. But when the conditions are right, a small push can tip a whole group. It also means bad habits can spread just as fast as good ones. So watch for small signs that something is starting to spread in your team, good or bad, and respond early, while it is still small."
    },
    {
     "emoji": "👥",
     "title": "The Law of the Few",
     "body": "Most people do not spread ideas much. A small group does most of the work. Gladwell names three kinds of people. Connectors know a huge number of people across many different worlds. Mavens collect information, like where to find the best price, and love to help others make good choices. Salesmen have energy and charm that make people say yes, often without even noticing why.\n\nHis famous example is the night ride of Paul Revere in 1775, at the start of the American war for independence. Revere rode to warn towns that British soldiers were coming, and many men came out to fight. Another man, William Dawes, carried the same news on the same night, but few people responded. Gladwell says the difference was Revere himself. He was a Connector and a Maven. He knew everyone, and people trusted his news.\n\nThe message was the same, but the messenger was different. So if you want an idea to spread, do not try to reach everyone at once. Find the few trusted people others listen to, and win them first. And notice which kind you are. Maybe you are the friend who knows everyone, the one who knows the facts, or the one who can encourage people to act."
    },
    {
     "emoji": "🕸️",
     "title": "Connectors and weak ties",
     "body": "Gladwell looks more closely at Connectors, because they matter so much. He describes an experiment by the psychologist Stanley Milgram in the 1960s. Milgram asked people in the middle of the United States to pass a letter, through friends, to a stranger in Boston. Most letters arrived in only a few steps, which gave us the idea of 'six degrees of separation'. But many of the letters reached the man through the same few people. A small number of people connected everyone else.\n\nHe also introduces Lois Weisberg, a woman in Chicago who seemed to know people in every world: artists, politicians, doctors, park lovers and more. She loved meeting people and kept in touch with them. And he mentions a study by the sociologist Mark Granovetter. Many people found their jobs not through close friends, but through acquaintances, people they knew only a little. Close friends often know the same things we know. Acquaintances open doors to new worlds.\n\nThis helps us see that 'weak ties' are not weak at all. A light friendship with someone from another team, church or culture can carry an idea to places you could never reach. So value those connections, and keep them alive with a quick message or a short visit."
    },
    {
     "emoji": "🍯",
     "title": "The Stickiness Factor",
     "body": "Spreading is not enough. The message must also stick. People need to remember it, and it must move them to act. Gladwell says stickiness often does not come from a bigger or louder message. It comes from small, careful changes in how a message is presented.\n\nHe studies two children's TV shows. The makers of Sesame Street tested their episodes with real children and watched closely for the moments when the children lost interest. Then they changed those parts. For example, children got bored in the street scenes with only adults, so the makers brought the puppets into those scenes, even though some experts had advised against mixing them. Blue's Clues went even further. It showed the same episode five days in a row, because young children love repeating things and learn more each time. Small details, like pausing so kids could shout out the answer, made the learning stick.\n\nFor us, this means testing our messages. Do not just announce something and hope. Watch how people actually respond. Then change one small thing, such as making it shorter, adding a picture, telling a story or repeating it, and see what helps. Good teaching is often less about saying more, and more about saying it in a way people can hold on to."
    },
    {
     "emoji": "🗺️",
     "title": "Give people a clear next step",
     "body": "Sometimes a message fails, not because people do not care, but because they do not know exactly what to do next. Gladwell shows that a small practical change can make a message stick.\n\nHe tells of a study at Yale University in the 1960s. Researchers wanted students to get a tetanus shot, to protect them from a dangerous disease. They gave students booklets about the danger of tetanus. Some booklets were very scary, with frightening pictures, and some were mild. The scary version did make students more worried. But a month later, only about 3 percent of the students had gone to get the shot. Then the researchers made one small change. They added a map of the campus, with the health centre circled and the times when shots were available. With that simple addition, the number of students who got the shot rose to 28 percent.\n\nThe students already knew the facts. What they needed was a clear, practical way to fit the message into their own busy lives. This is good news for anyone who teaches or leads. Before you share a message, ask: what exactly should people do, where and when? Give them that next step in plain words. A simple map, a time or a sign-up sheet can turn good intentions into real action."
    },
    {
     "emoji": "🏙️",
     "title": "The Power of Context",
     "body": "People are more sensitive to their surroundings than we think. Small details in a place can change how people behave, sometimes more than their character does. Gladwell calls this the Power of Context.\n\nHe describes the 'broken windows' idea used in New York City. The idea is that if a broken window is left unrepaired, people think nobody cares, and more disorder follows. So leaders cleaned graffiti off subway trains and stopped people skipping fares. These were small problems, but they sent a message that nobody was in charge. Fixing them was linked with a big drop in serious crime, though later writers have argued about how much it really explains.\n\nHe also tells of a study with students training to be pastors. Students told they were late for a talk often walked past a man in need, even when the talk was about the Good Samaritan. Students with more time stopped to help much more often. Being in a hurry mattered more than what they believed or were about to preach.\n\nSo if you want to change behaviour, look at the setting, not only at the people. Before you blame someone's character, ask what the situation is pushing them to do. A clean space, a calmer schedule or a simple sign can help people do the right thing."
    },
    {
     "emoji": "1️⃣5️⃣0️⃣",
     "title": "The Rule of 150",
     "body": "Groups are also a kind of context. Gladwell explains research suggesting that humans can only keep real social relationships with about 150 people. Above that size, people stop knowing each other well, and groups start to need rules and bosses instead of friendship and trust.\n\nHe describes the company that makes Gore-Tex fabric. When one of its factories grew to about 150 people, the company built a new factory and split the group. Everyone could still know each other, so care and peer pressure worked naturally. He also mentions the Hutterites, a Christian farming community that divides a colony when it grows too big. And he talks about how close groups share memory. In a good team, each person remembers different things and trusts the others to remember the rest, a bit like a married couple where one person keeps track of money and the other remembers the birthdays. When a group grows too big, that shared knowledge breaks down.\n\nThis matters for spreading ideas too. In a small group where people really know each other, a new idea or value passes easily from friend to friend. If your group is growing, think about smaller teams or family groups where every person truly belongs and is truly known."
    },
    {
     "emoji": "🛹",
     "title": "From the few to the many",
     "body": "How does an idea move from a small group of fans to everyone? Gladwell uses a model from a famous study of farmers in Iowa, who slowly started using a new kind of seed corn. First a few Innovators tried it. Then came the Early Adopters, then the large Early and Late Majority, and finally the Laggards. Innovators and the majority are very different people. Innovators love what is new and risky. The majority wants what is safe and useful. Some writers say there is a gap, or 'chasm', between them that many ideas never cross.\n\nSo who carries an idea across? Gladwell says it is the Connectors, Mavens and Salesmen. They act like translators. They take a strange new idea and change it a little, so normal people can understand it and accept it. He tells of Airwalk, a shoe company that grew fast with ads built around ideas taken from young trendsetters, made easy for everyone else to enjoy. Later, the company stopped protecting the special shoes that the trendsetters loved. The innovators lost interest, and the brand faded.\n\nSo when you bring a new idea, do not expect everyone to love it at first. Win the early adopters. Then help trusted people translate it into simple words and examples that the rest of the group can accept."
    },
    {
     "emoji": "🎯",
     "title": "Focus your effort",
     "body": "At the end of the book, Gladwell shares a hopeful lesson. You do not need huge resources to start change. You need to put a small amount of effort in the right places. He calls this focusing your resources, instead of spreading them thinly over everyone.\n\nHe tells of Georgia Sadler, a health worker in San Diego who wanted to teach Black women about breast cancer. Her talks in churches and community events reached only a small number of women. So she moved her teaching into beauty salons, where women spend hours talking and trust their stylists. The stylists learned the message and shared it naturally with their customers, in their own words. It reached many more women than her events ever did.\n\nThe pattern is simple. Find the key people. Shape a message that sticks. Choose the right setting. Then test, watch what happens and adjust. Gladwell also says that real change needs us to believe it is possible, and that people can change when the right push comes at the right time.\n\nChange can feel impossible when you look at the whole problem at once. But with the right small push in the right place, the world can move. That is a good reason to keep trying."
    }
   ],
   "tryThis": [
    "Name the Connectors, Mavens and Salesmen in your team or community, and talk with one of them about an idea you care about.",
    "Take one announcement or poster and make it shorter and clearer, and add a clear next step with a time and place. Then watch if people respond better.",
    "Fix one small 'broken window' in your shared space this week, like a messy corner or a broken sign."
   ],
   "forUs": "When we want a new value or habit to spread on base, like prayer, hospitality or cleaning up together, we can think like Gladwell. Who are the trusted people, Khmer and international, that others listen to? Win them first. They will translate the idea into words and examples that fit their friends. How can we make the message simple and sticky in both languages, maybe with a picture, a short phrase people repeat, or a clear next step with a time and place? Is our shared space saying the right thing about who we are?\n\nIn DTS and on outreach, small groups of people who really know each other spread faith and love more naturally than big meetings. As our base grows, family groups and small teams help everyone stay known. Our light friendships with local churches, neighbours and other ministries matter too, because they carry good news to places our own team cannot reach. And in a village or at the cafe, the right setting can open hearts.\n\nWe do not control the results. Only God can change a heart. But small, faithful steps by the right people, in the right place, can bring real change in a team or a community.",
   "oneLine": "The right people, a sticky message and the right setting can tip small ideas into big change.",
   "cover": {
    "bg": "paper",
    "fg": "ink",
    "a": "marigold",
    "b": "laterite",
    "motif": "match",
    "layout": "top",
    "font": "serif"
   }
  },
  {
   "id": "the-21-irrefutable-laws-of-leadership",
   "title": "The 21 Irrefutable Laws of Leadership",
   "author": "John C. Maxwell",
   "year": 1998,
   "isbn": "9780785288374",
   "shelf": "lead",
   "mins": 10,
   "vibe": "Leadership has laws, like gravity. Learn them and people will follow.",
   "bigIdea": "John Maxwell has taught leadership for decades, first as a pastor and later as a speaker and trainer around the world. In this book he claims that leadership works by laws, like gravity. They are true in every culture and every kind of group, from a business to a church to a sports team. You can ignore them, but you cannot escape them.\n\nHe gives 21 laws, each with stories from business, sport, history and the Bible. Some laws are about who you are, like trust and character. Others are about how you work with people, like connection and empowerment. Others look to the future, like training new leaders. Nobody is great at all 21, and Maxwell says he is not either. But you can grow in each one, and you can build a team whose strengths cover your gaps.\n\nWhy does this matter? Maxwell believes everything rises and falls on leadership. A good plan with weak leadership will struggle, but a strong leader can help an ordinary team do great things. And leadership is not only for people at the top. Anyone who influences others can learn these laws. Here are some of the most important ones, grouped together.",
   "insights": [
    {
     "emoji": "📏",
     "title": "The Law of the Lid",
     "body": "Your leadership ability is like a lid. It sets the limit on how effective you and your team can be. A team rarely rises above its leader. The lower your ability to lead, the lower the lid on your potential. The higher your ability, the more you can achieve.\n\nMaxwell's example is the McDonald brothers. In the 1940s and 1950s they built a fast, clever hamburger restaurant in California. They had a great system and made good money, but they could not grow it much beyond a few restaurants. Then Ray Kroc, a strong leader, joined them. He built a team and a plan to grow, and McDonald's spread across the world. The food and the idea were the same. Only the lid was higher.\n\nMaxwell notes that when a team or company is in trouble, it often looks for a new leader first. So if you want to see more fruit, the best place to start is yourself. Read, learn, ask for feedback and grow. If leading is not your strength yet, work closely with someone who leads well. When your lid rises, your whole team has more room to grow too."
    },
    {
     "emoji": "🧲",
     "title": "Influence and Process",
     "body": "Maxwell says the true measure of leadership is influence, nothing more and nothing less. A title does not make you a leader. He quotes an old saying: if you think you lead but nobody follows, you are only taking a walk.\n\nHe points to Princess Diana. She had no official power, yet millions were moved by her care for the sick and the poor, and she helped bring attention to causes like banning landmines. Her influence came from who she was and what she did, not from a position. The opposite is also true. Some people have a big title, but nobody really follows them.\n\nInfluence is not built in a day. The Law of Process says leadership grows daily, not in a day. Maxwell's example is Theodore Roosevelt, a weak and sickly child who trained his body and mind step by step and became a brave American president. Small daily growth adds up over many years, like money saved bit by bit. There are no shortcuts.\n\nSo ask yourself two questions. Who actually follows me, and why? And what am I doing today to grow, even a little?"
    },
    {
     "emoji": "🧭",
     "title": "The Law of Navigation",
     "body": "Anyone can steer the ship, Maxwell says, but it takes a leader to plan the route. Good navigators see the whole trip in their mind before they leave. They learn from past experience, look honestly at the facts, listen to others, count the cost and prepare for problems.\n\nHis story is the race to the South Pole in 1911. Roald Amundsen from Norway planned with great care. He learned from the ways people in the Arctic travelled, chose dogs to pull his sleds, and left extra food along the way. His whole team reached the Pole and came home safely. Robert Falcon Scott from Britain was brave, but he planned poorly. He relied on motor sleds and ponies that failed in the cold, and his supplies were not enough. His team reached the Pole after Amundsen, and none of them survived the journey back.\n\nBoth men had courage. The difference was preparation. When a leader plans badly, the followers pay the price. So before you lead a team somewhere, do the hard thinking first. Ask what could go wrong, what you will need and who has done this before. Then share the plan clearly, so people can follow with confidence."
    },
    {
     "emoji": "🪨",
     "title": "Solid Ground and Respect",
     "body": "Trust is the foundation of all leadership. Maxwell says leaders build trust by showing competence, connection and character, and character matters most. Each time you break trust, you lose some influence, like spending coins from your pocket. Each good choice puts coins back in. Break trust too often and you have nothing left, even if you still have the title.\n\nThe Law of Respect adds that people naturally follow leaders who are stronger than themselves. When a group meets, people quickly sense who the strongest leader is, and they tend to follow that person. Maxwell tells the story of Harriet Tubman. She was a small woman who escaped slavery, then went back again and again to lead others to freedom. She could not read and had no title, and there were rewards offered for her capture. But her courage and faith were so strong that people trusted her with their lives.\n\nSo earn respect through character, courage and care. Keep your promises, even small ones. Admit your mistakes quickly. People follow the person they respect, even when that person is not the official boss."
    },
    {
     "emoji": "❤️",
     "title": "Connection and Magnetism",
     "body": "Leaders touch a heart before they ask for a hand. People need to feel that you care about them before they will follow your plans. Maxwell says starting this connection is the leader's job, not the follower's. Do not wait for people to come to you. Go to them, learn their names and listen to their stories. Connect with people one by one, and also learn to speak to a group in a way that reaches their hearts.\n\nThe Law of Magnetism says that who you are is who you attract. If you are negative, you will gather negative people. If you are generous, faithful and kind, you will draw people like that. Maxwell notes that people are often drawn to leaders who are like them in things such as values, attitude and energy. Many leaders wish their team had more energy or commitment, but those things usually start with the leader.\n\nThis also means a team can easily become full of people who are just like you, and miss other gifts. So welcome people who are different on purpose.\n\nBefore you ask why your team is the way it is, ask what you are showing them. Grow in yourself the qualities you want to see in them."
    },
    {
     "emoji": "⭕",
     "title": "Inner Circle and Empowerment",
     "body": "A leader's potential depends on the people closest to them. No leader succeeds alone. So choose your inner circle wisely: people with good character, real skill and a healthy influence on others. Ask whether each person close to you adds value to you and to the team.\n\nThe Law of Empowerment says that only secure leaders give power to others. Maxwell's warning example is Henry Ford. Ford changed the world with his car factory, but he did not like others to have power. He refused to change his famous Model T even when other companies did better, and he weakened leaders around him, including his own son Edsel. His company suffered for years.\n\nWhy do leaders hold power so tightly? Maxwell says it is often because they want to feel needed, they fear change, or they do not feel secure in who they are. Secure leaders do the opposite. They trust people, train them and let them lead, even if those people may one day do better than them. Their worth does not depend on being the only one who can do the job. When you give power away, the team gets stronger, and so do you."
    },
    {
     "emoji": "🤲",
     "title": "Buy-In and Sacrifice",
     "body": "People buy into the leader first, then the vision. If people do not trust you, even a great plan will struggle. If they trust you, they will follow even when the plan is not perfect. The leader and the vision travel together.\n\nMaxwell points to Mahatma Gandhi. Millions in India followed his peaceful way to freedom because they believed in him as a person. They had seen how he lived, and so they trusted his message.\n\nThe Law of Sacrifice says a leader must give up to go up. The higher you go, the more you are asked to lay down your own comfort and rights. Maxwell tells how Martin Luther King Jr. was arrested, threatened and finally killed for the cause he led. Sacrifice is not a one-time payment either. Each new level of leadership asks for something new.\n\nSo build trust before you share big plans. If people are not yet following your ideas, ask whether they trust you yet. And when leadership asks you to give something up, like time, comfort or credit, see it as part of the calling, not as something unfair. Jesus himself led this way."
    },
    {
     "emoji": "🏆",
     "title": "Victory and Momentum",
     "body": "The Law of Victory says that leaders find a way for the team to win. Strong leaders do not accept defeat easily. They keep looking for a way forward, even when things look hopeless.\n\nMaxwell's great example is Winston Churchill. In 1940, Nazi Germany had taken much of Europe, and Britain stood almost alone. Some people wanted to make peace with Hitler. Churchill refused. He gave the British people courage, and they kept fighting until, with their allies, they won. Maxwell says a winning team needs a shared vision, a mix of skills, and a leader committed to winning and to helping each person grow.\n\nThe Law of Big Mo says momentum is a leader's best friend. With momentum, problems seem smaller and people work harder. Without it, even small problems feel huge. Maxwell tells of Jaime Escalante, a maths teacher at a struggling school in Los Angeles. He believed his students could pass a very hard calculus exam. He started small, and each success brought more students and more success.\n\nCreating momentum is the leader's job. So celebrate early wins. Start with something small that can succeed, then build on it."
    },
    {
     "emoji": "⏳",
     "title": "Priorities and Timing",
     "body": "Busy is not the same as fruitful. The Law of Priorities says that activity is not necessarily accomplishment. A leader must keep stepping back to ask what really matters most.\n\nMaxwell uses the 80/20 idea. Often, the top 20 percent of your priorities bring about 80 percent of your results. So give most of your time and energy to that most important part. He also gives three questions, which he calls the three Rs. What is required of me that only I can do? What gives the greatest return? And what brings me the greatest reward, the work that gives me life? Work that fits none of these can often be given to others, or stopped.\n\nThe Law of Timing says that when to lead is as important as what to do and where to go. Maxwell describes four results. The wrong action at the wrong time leads to disaster. The right action at the wrong time brings resistance. The wrong action at the right time is a mistake. Only the right action at the right time brings success.\n\nSo before you act, ask two questions. Is this the most important thing? And is now the right time? Pray, watch your team and be patient when you need to be."
    },
    {
     "emoji": "🌳",
     "title": "Explosive Growth and Legacy",
     "body": "Leaders who develop followers grow slowly, one person at a time. Leaders who develop other leaders multiply, because every new leader brings their own followers. Maxwell says this is harder work, but it brings the biggest growth. He also says it takes a leader to raise up a leader. People learn to lead best by watching and working beside someone who leads well.\n\nThe Law of Legacy says a leader's lasting value is seen in what happens after they leave. Maxwell admires Roberto Goizueta, a leader of Coca-Cola, who prepared the next leaders so well that when he died in 1997, the company carried on strongly without crisis. His success continued through others.\n\nMany leaders find this hard. Training others takes time, and it often feels easier to do the job yourself. But a leader who holds everything alone builds something that will end with them.\n\nSo do not hold all the knowledge and keys yourself. Train someone to do your job, and give them real chances to lead while you are still there to help. Plan for your work to continue long after you are gone. As Christians we might say it like this: we plant, others water, and God gives the growth."
    }
   ],
   "tryThis": [
    "Pick one law where you feel weak and ask a trusted friend to rate you honestly from 1 to 10.",
    "Have one real heart-level conversation with a team member before talking about tasks.",
    "Give away one responsibility you usually keep, and coach the person who takes it."
   ],
   "forUs": "On a YWAM base, many of us lead small teams for a short time, like a DTS outreach team, a ministry shift or a cafe crew. These laws remind us that leadership is about influence, trust and serving, which fits the way Jesus led. He had no official title, yet he changed the world through twelve people he trained.\n\nThe laws also help in practical ways. Before an outreach, good navigation means planning well and listening to those who have gone before, especially Khmer staff who know the language, the culture and the roads. When a team is tired, a small early win can bring back momentum. When the calendar is full, the Law of Priorities helps us ask what only we can do, and what we could hand to someone else.\n\nWhen we connect with hearts, give power away and raise up Khmer and international leaders to replace us, the work keeps growing even after we move on. Staff come and go often in missions, so this matters even more for us. The question for each of us is simple: who am I training right now?",
   "oneLine": "Leadership is influence built on trust, and its best fruit is new leaders.",
   "cover": {
    "bg": "ink",
    "fg": "paper",
    "a": "marigold",
    "b": "paper",
    "motif": "bignum",
    "text": "21",
    "layout": "bottom",
    "font": "sans",
    "upper": true
   }
  },
  {
   "id": "how-to-win-friends-and-influence-people",
   "title": "How to Win Friends & Influence People",
   "author": "Dale Carnegie",
   "year": 1936,
   "isbn": "9780671027032",
   "shelf": "people",
   "mins": 10,
   "vibe": "People skills are not magic. They are habits of kindness you can learn.",
   "bigIdea": "Dale Carnegie taught public speaking to business people in New York in the early 1900s. He noticed that his students needed more than speaking skills. They needed to get along with people, at work and at home. He looked for a practical book on this and could not find one. So he collected stories, read about famous leaders, tested ideas with his students and wrote this book. It became one of the best-selling books of all time.\n\nHis main point is simple. People are not machines that run on logic. They run on feelings, pride and a deep need to feel important. If you push, criticise or argue, people resist. But if you sincerely care about people, listen well and honour them, they will want to work with you.\n\nThe book has four parts: basic ways to handle people, ways to make people like you, ways to win people to your way of thinking, and ways to change people without hurting them.\n\nCarnegie warns that these ideas only work when they come from the heart. They are not tricks. For anyone who leads or serves, they are a daily way to show respect and love.",
   "insights": [
    {
     "emoji": "🚫",
     "title": "Stop criticising, complaining and condemning",
     "body": "Criticism makes people defensive. They protect their pride and look for reasons why they were right. It almost never changes them, and it often leaves bitterness that lasts for years. Carnegie reminds us that people are creatures of emotion, not only of logic.\n\nCarnegie shows that even criminals rarely blame themselves. He tells of a violent New York gunman, 'Two Gun' Crowley, who still saw himself as a kind-hearted man who would hurt no one. If such people excuse themselves, the ordinary people we work with will too.\n\nCarnegie also describes how Abraham Lincoln, as a young man, wrote letters that made fun of people. One of them made a man so angry that he challenged Lincoln to a duel, and they nearly fought. Lincoln learned from this. Years later, during the war, a general failed to follow his orders and let the enemy army escape. Lincoln wrote him a sharp letter, but he never sent it.\n\nSo before you criticise, try to understand. Ask why the person did what they did, and what you might have done in their place. Carnegie says anyone can criticise, but it takes character to understand and forgive. Patience changes people far more than blame."
    },
    {
     "emoji": "🙌",
     "title": "Give real appreciation",
     "body": "Everyone wants to feel important. Carnegie calls it one of the deepest desires of human nature. People will work hard, change and even do strange things to feel valued. We feed our bodies every day, he notes, but we often forget to feed people's hearts with kind and honest words.\n\nHe tells of Charles Schwab, who was paid a huge salary to run a steel company in the early 1900s. Schwab said his greatest skill was not knowing about steel. It was bringing out the best in people, through appreciation and encouragement, and by being slow to find fault. He was generous with praise and careful with blame.\n\nBut Carnegie is clear that flattery is different. Flattery is fake praise used to get something, and people can tell. In his words, it comes from the teeth, not the heart. Real appreciation is honest and specific. It notices something true and good, and says it.\n\nPeople forget flattery, but they remember sincere thanks for years. So stop thinking about yourself for a moment and look for the good in the people around you. Then tell them, clearly and specifically. It costs nothing, and it can change a person's whole day."
    },
    {
     "emoji": "🎯",
     "title": "Start from what they want",
     "body": "If you want someone to act, connect it to what they care about. Your own goals do not move other people. They are busy thinking about their own needs and hopes, just like you are.\n\nCarnegie uses a simple picture. He loved strawberries and cream, but when he went fishing, he did not put strawberries on the hook. He used worms, because that is what fish want. So why, he asks, do we talk to people only about what we want?\n\nHe also tells how Andrew Carnegie, the rich steel businessman, got his nephews at university to answer his letters. Their mother was worried because they never wrote home. Andrew sent them a friendly letter and mentioned that he was including some money for each of them, but he did not put it in. They wrote back quickly to thank him and ask about it.\n\nCarnegie shares an idea from the car maker Henry Ford. The secret of success, Ford said, is to understand the other person's point of view and see things from their side as well as your own. So before you ask for something, ask yourself why it would matter to them. This is not manipulation when you truly want their good too."
    },
    {
     "emoji": "👂",
     "title": "Be interested, not interesting",
     "body": "Carnegie says you will make more friends in two months by caring about other people than in two years by trying to make them care about you. He points to dogs. A dog does not try to impress you. It is just happy to see you, and so everybody loves it.\n\nHe tells a story from his own life. At a dinner party he met a famous expert on plants. Carnegie listened to him for hours, asking questions with real interest about plants and gardens, and hardly spoke about himself. At the end of the night, the man told others that Carnegie was a wonderful person to talk with. Carnegie had barely said anything. He had simply listened well.\n\nCarnegie also tells of an angry telephone customer who shouted at staff for a long time. He calmed down when one patient person simply let him speak and showed sympathy, without arguing. Often people do not need an answer first. They need to feel heard.\n\nSo ask questions the other person will enjoy answering. Let them talk about themselves and the things they love. Listen without just waiting for your turn, and do not interrupt. A good listener is rare, and people remember how you made them feel."
    },
    {
     "emoji": "😊",
     "title": "Smile and remember names",
     "body": "A warm smile says, 'I am happy to see you.' Carnegie says actions speak louder than words, and a real smile is one of the simplest ways to make people feel welcome. A fake smile does not work. It must come from real goodwill inside. He tells of a businessman who decided to smile at his wife, his staff and strangers every day. Both his home and his work became happier, and people were glad to see him coming.\n\nNames matter too. To most people, their own name is one of the sweetest sounds there is. Carnegie tells of Jim Farley, an American political leader who could remember the first names of tens of thousands of people. It helped him win friends everywhere. Carnegie also notes that forgetting or misspelling a name can quietly tell people they do not matter to us.\n\nSo learn names, use them and say them correctly. If you did not hear a name clearly, it is fine to ask again. Then repeat it in the conversation, and write it down later if that helps you remember. In a busy community, being remembered by name tells people that they matter. It costs nothing, but it means a lot."
    },
    {
     "emoji": "💬",
     "title": "Talk about what they love",
     "body": "Two more principles complete Carnegie's advice on making people like you. Talk about the things the other person is interested in. And make the other person feel important, sincerely.\n\nHe describes Theodore Roosevelt. His visitors were often surprised by how much he knew about their own world, whether they were cowboys, politicians or diplomats. The secret was simple. Whenever he expected a visitor, Roosevelt stayed up late the night before, reading about the subject his guest cared about most. He knew that the road to a person's heart is to talk about the things they treasure.\n\nCarnegie also tells a small story from a post office in New York. A clerk there looked bored with his job, weighing letters all day. While waiting in line, Carnegie decided to find something he could honestly admire about the man. He noticed his fine hair and told him so. The clerk was clearly pleased, and they had a happy little chat. Later someone asked Carnegie what he had wanted to get from the clerk. Nothing at all, he said. He just wanted to give a little happiness.\n\nSo learn what matters to the people around you. Ask about their family, their hobby or their home town, and honour them, expecting nothing back."
    },
    {
     "emoji": "🤝",
     "title": "You cannot win an argument",
     "body": "Even if you win an argument, you lose. The other person feels smaller, and their mind usually has not changed. Carnegie says the best way to win an argument is to avoid it.\n\nHe learned this the hard way. At a dinner, a man told a story using a famous saying and said it came from the Bible. Carnegie knew it really came from Shakespeare, and he corrected him in front of everyone. An older friend who knew Shakespeare well was sitting nearby. He quietly said the man was right, and the saying was from the Bible. On the way home, the friend explained. Of course it was Shakespeare, he said, but why prove a man wrong at a party? It only makes him dislike you. Carnegie had actually been correct, but that was not the point.\n\nSo respect other people's opinions. Never tell someone bluntly that they are wrong. If you are wrong, admit it quickly and clearly, which often softens an angry person. Begin with things you agree on, so the talk starts with yes. Let the other person do much of the talking, and let them feel the idea is partly theirs. The goal is not to win. It is to keep the relationship and find the truth together."
    },
    {
     "emoji": "🫂",
     "title": "Give people sympathy",
     "body": "Carnegie says that many of the people we meet are hungry for sympathy. Give it to them, and they will love you for it. He suggests a simple attitude. If I had this person's background, pressures and feelings, I would probably act just like them. So try honestly to see things from their point of view, and tell them you understand why they feel the way they do.\n\nHe tells of Sol Hurok, a famous American manager of singers and dancers. One of his stars, the Russian singer Feodor Chaliapin, was often difficult. On the day of a concert, he would sometimes call and say his throat felt terrible and he could not sing. Hurok never argued. He went to the singer's hotel and agreed sadly that he must not sing. He said he would cancel the concert at once, because losing some money was nothing compared to the singer's good name. Chaliapin would then ask him to come back later in the day. Often, by evening, he decided to sing after all.\n\nArguing would only have made Chaliapin more stubborn. Sympathy helped him find his own courage. So when someone is upset, start by understanding, not correcting. People soften when they feel understood."
    },
    {
     "emoji": "🌱",
     "title": "Lead by building people up",
     "body": "In the last part of the book, Carnegie explains how to change people without hurting them or making them angry. Begin with praise and honest appreciation before you correct. Point to mistakes gently and indirectly. Talk about your own mistakes first, so the other person does not feel alone.\n\nHe tells of Charles Schwab finding some workers smoking right under a 'No Smoking' sign. He did not shout or point at the sign. He gave each man a cigar and said he would be glad if they smoked them outside. The men knew they had broken the rule, and they respected him even more.\n\nCarnegie also tells how Schwab helped a steel mill that was not producing enough. He asked the day shift how many batches they had made that day, and wrote the number, six, in chalk on the floor. The night shift saw it, worked hard and wrote seven. Soon the two shifts were competing, and the mill became one of the best. Schwab simply gave them a challenge.\n\nAsk questions instead of giving orders. Let people keep their dignity. Praise every small step forward, make faults seem easy to fix, and give people a good name to live up to. People grow toward the trust we show them."
    }
   ],
   "tryThis": [
    "Learn the full name of three people on base you do not know well, and use their names this week.",
    "In your next conversation, ask two questions about the other person before you share anything about yourself.",
    "Before you correct someone, first tell them one specific thing they are doing well."
   ],
   "forUs": "In Cambodia, 'face' and respect matter a lot, which makes Carnegie's advice even more important. Correct people privately and gently, never in front of the group. Honour Khmer staff and elders by name, and say thank you in specific ways. Celebrate small wins in DTS, at the cafe and on outreach. Learn to say names well in both Khmer and English.\n\nDisagreements across cultures can hurt, because we often misunderstand each other. Before we defend our own view, we can try to see the situation from the other person's side and say that we understand why they feel that way. When a teammate is tired or homesick, sympathy usually helps more than advice. And taking time to ask about someone's home town, family or favourite food shows them that they matter.\n\nInternational staff can learn a lot here from Khmer culture, which often already values politeness and saving face. And Khmer staff may find that warm, direct appreciation is a gift to foreign teammates far from home. In the end, this book is basically loving your neighbour, applied to everyday conversations. Jesus noticed people, called them by name and met them with compassion. We can do the same.",
   "oneLine": "Care about people sincerely, and influence will follow.",
   "cover": {
    "bg": "marigold",
    "fg": "ink",
    "a": "paper",
    "b": "berry",
    "motif": "smile",
    "layout": "top",
    "font": "serif"
   }
  },
  {
   "id": "extreme-ownership",
   "title": "Extreme Ownership",
   "author": "Jocko Willink & Leif Babin",
   "year": 2015,
   "isbn": "9781250067050",
   "shelf": "people",
   "mins": 10,
   "vibe": "No excuses. No blame. If it is your team, it is your problem, and your chance to fix it.",
   "bigIdea": "Jocko Willink and Leif Babin were officers in the US Navy SEALs, a special forces unit. In 2006 they led SEAL teams in the city of Ramadi, Iraq, during some of the hardest fighting of the war. Jocko commanded the SEAL task unit, and Leif led one of its platoons. Later they left the military and started a company that teaches leadership to businesses.\n\nEach chapter tells a true story from battle or training, explains one leadership principle, and then shows how it works in a company. Their main idea: a leader owns everything in their world, the wins and the failures. There is no one else to blame.\n\nThis may sound heavy, but it is freeing. When leaders take full responsibility instead of blaming others, they can actually fix problems, and the whole team improves fast. The book also teaches how teams can support each other under pressure, keep plans simple, and trust each other to make good decisions.\n\nYou do not need to be a soldier for this to matter. Anyone who leads a team, a project or even just their own life can learn to stop making excuses and start owning the result.",
   "insights": [
    {
     "emoji": "🙋",
     "title": "Own it all",
     "body": "When something goes wrong, the leader does not point at the team, the plan or bad luck. The leader says, 'This is on me,' and then works to fix it. The authors call this Extreme Ownership.\n\nThe book opens with the worst day of Jocko's time in Iraq. In a confusing operation, friendly units fired on each other by mistake. One Iraqi soldier died and others were hurt. Many people had made errors, and Jocko could have blamed them. Instead, at the review, he stood up and said the fault was his, because he was the commander and responsible for everything. His bosses trusted him more after that, not less.\n\nOwning a failure is hard, because our pride wants to protect us. But a leader who makes excuses never fixes the real problem. A leader who owns it can find out what went wrong and change it, so it does not happen again.\n\nThis kind of honesty also builds trust. When the leader owns mistakes, team members feel safe to own theirs. Soon the team stops looking for someone to blame and starts looking for solutions. So next time something fails, start with your own part. Ask what you could have done better, then make a plan to fix it."
    },
    {
     "emoji": "🚣",
     "title": "No bad teams, only bad leaders",
     "body": "In basic SEAL training, students race heavy boats in crews of about seven men. They carry the boats on their heads, run with them and paddle them through cold waves. In one class, Boat Crew II kept winning, while Boat Crew VI was almost always last. The leader of Boat Crew VI blamed his men. The instructors swapped the two crew leaders. The worst crew, with its new leader, quickly started winning almost every race. The old winning crew still did well, because its members had learned to work as a team.\n\nSame people, new leader, different result. The authors say there are no bad teams, only bad leaders. A team becomes what its leader allows. What a leader accepts as normal becomes the team's real standard, no matter what the rules on paper say. If a leader lets poor work pass without a word, poor work becomes the new normal.\n\nSo if your team is struggling, look first at your own leadership. What are you tolerating? What standard are you really showing them? Raising the standard is hard at first, and some people may push back. But people often rise to meet it when the leader believes they can and keeps pushing forward with them."
    },
    {
     "emoji": "💡",
     "title": "Believe in the mission",
     "body": "You cannot lead people well if you do not believe in what you are asking them to do. If you doubt the mission, your team will feel it, and they will not give their full effort.\n\nIn Ramadi, the SEALs were ordered to train and fight alongside Iraqi soldiers. Many SEALs hated this. The Iraqi troops were poorly trained and poorly equipped, and working with them felt dangerous. The leaders did not like it either at first. But they stepped back and asked why it mattered. They saw that Iraq could only be safe in the long run if its own soldiers could protect it, because American troops could not stay forever. Once they understood that bigger reason, they could explain it to their men, and the men committed.\n\nThe authors also describe business teams who resisted a change from their bosses, often because nobody had explained why it was needed. Leaders in the middle must find out the reason themselves.\n\nSo if you are unsure why a decision was made, ask your own leaders until it is clear. If you still disagree, share your concerns honestly. Then explain the 'why' to your team, not just the 'what'. People commit when they understand."
    },
    {
     "emoji": "🪞",
     "title": "Check your ego",
     "body": "Ego makes it hard to listen, admit mistakes or accept help. The authors say ego gets in the way of everything: planning, taking advice and accepting criticism. It can even stop a leader from seeing a danger that is right in front of them.\n\nThey warn that success can be dangerous. After many wins, a team can start to feel too good for basic rules or for other people's advice. That kind of pride is often when mistakes happen. In their business work, they also met leaders who blamed others and refused to admit their part, so the problems never got fixed. Their pride was protected, but the team paid the price.\n\nConfidence is good, and a leader needs it. You need belief in yourself and your team to act boldly. But pride that blocks learning is dangerous. Stay humble enough to say, 'I was wrong,' and to ask for help. Listen to advice, even from people with less experience or a lower position than you.\n\nRemember that the mission matters more than your image. The best leaders are confident and humble at the same time. They care more about the team winning than about looking good themselves."
    },
    {
     "emoji": "🧭",
     "title": "The four laws of combat",
     "body": "The middle of the book teaches four laws of combat. They work in any team.\n\nFirst, Cover and Move: every part of the team supports the others. In battle, one group covers while another moves. In a company, departments must help each other instead of competing, because the whole team wins or loses together. Second, Simple: plans and orders must be clear enough for everyone to understand. When things go wrong, complex plans fall apart. If people do not understand the plan, they cannot carry it out.\n\nThird, Prioritize and Execute. When many problems hit at once, the leader stays calm, steps back, picks the most important problem and solves it, then moves to the next. The authors sum it up as relax, look around, make a call. Leaders often need to step back from the action a little, so they can see the bigger picture.\n\nFourth, Decentralized Command: small teams of about four or five people, with clear goals, led by people who understand the leader's intent and can decide for themselves. Junior leaders must know what the mission is and why, and senior leaders must trust them.\n\nTogether these laws help a team act fast and well under pressure."
    },
    {
     "emoji": "📋",
     "title": "Plan well, then debrief",
     "body": "Part three of the book begins with planning. The authors say good planning starts with a clear mission. Everyone must understand the purpose and the result the leader wants, which the military calls the commander's intent. This should be short and simple, so anyone can remember it.\n\nThen the leader hands out parts of the planning to others. In the SEAL teams, junior leaders and even ordinary team members planned parts of each operation and explained them to the group. This helped them understand the plan and own it, instead of just obeying it. The senior leader stayed above the details, so he could check the whole plan and spot gaps.\n\nA good plan also thinks about risk. Not every risk can be removed, but leaders should find the risks they can control and reduce them. Ask what could go wrong, and decide ahead of time what you will do if it does.\n\nAfter the briefing, the leader asks questions to make sure everyone truly understands. And after every operation, the team holds a debrief. They talk honestly about what went well, what went wrong and how to do better next time. Over time this cycle makes the team stronger and wiser. The same process works for an event, a project or an outreach."
    },
    {
     "emoji": "↕️",
     "title": "Lead up and down",
     "body": "Leading down means making sure your team understands the big picture and why decisions are made. Leaders at the top can forget that the people doing the work do not see everything they see. If the team is confused, it is the leader's job to explain better.\n\nLeading up means helping the leaders above you. In Ramadi, Leif was frustrated by the many questions and approvals his commanders wanted before each operation. They seemed far away and slow. Jocko told him to stop complaining and own it. So Leif learned to give the commanders the information they needed, clearly and early, so they could feel confident about the plan. Approvals came faster, trust grew, and his team got to do more of the work they cared about.\n\nThe people above you are not your enemies. They have their own pressures, and they often cannot see what you see on the ground.\n\nSo if your boss does not support you, ask yourself: have I explained it well? Do they have what they need to understand? Do not complain about the leaders above you. Help them see what you see. This is also part of owning your situation, because the person above you is part of your team too."
    },
    {
     "emoji": "⚡",
     "title": "Decide when you are not sure",
     "body": "In battle, and in life, leaders almost never have all the facts. Information is incomplete, things change fast, and there is often no way to be certain. The authors say leaders must still decide. Waiting for a perfect picture often means doing nothing, and doing nothing can be the worst choice of all.\n\nIn Ramadi, the situation on the streets changed constantly, and there was rarely time to know everything. The leaders learned to make the best call they could with what they knew, then stay ready to change as new facts came in. The authors say the same is true in business, where leaders who wait too long for more data often let problems grow.\n\nHere is a simple everyday example. A team leader on outreach hears that heavy rain may close the road to a village. Nobody knows for sure. The leader can wait and hope, or decide now, perhaps to leave early or to prepare a backup plan. Either choice is better than freezing.\n\nThis does not mean being careless. Gather what information you can in the time you have, think about the risks, and then act. If the decision turns out to be wrong, own it and adjust quickly. When your team is waiting on you, make the call."
    },
    {
     "emoji": "🗓️",
     "title": "Discipline brings freedom",
     "body": "The last chapter's big idea is that discipline equals freedom. Early mornings, clear routines and strong standards may feel restrictive. But they create freedom to act and adapt when things get hard.\n\nThe SEAL teams practised standard ways of moving, communicating and checking on each other until everyone knew them well. Because the basics were automatic, the team could change plans quickly without confusion. Jocko himself is known for getting up very early every day to train. He believes small daily habits of discipline give him more freedom in the rest of life.\n\nThe authors also say that leadership is full of balances, which they call the dichotomies of leadership. Be confident but not proud. Be strict but not harsh. Lead, but also know how to follow. Care deeply about your people, but still be willing to give them hard tasks. Pay attention to details, but do not get lost in them. Going too far in either direction causes problems, so a good leader keeps checking the balance.\n\nDisciplined teams can be flexible, because the basics are solid. So choose one small habit, practise it every day, and notice how it gives you more freedom, not less."
    }
   ],
   "tryThis": [
    "Think of one recent problem you blamed on someone else. Write down what part of it was yours to own.",
    "When your team is overwhelmed, list every problem, choose the single most important one, and solve it first.",
    "After your next event or task, hold a ten-minute debrief: what went well, what went wrong, and what will we change next time?"
   ],
   "forUs": "On a mission base it is easy to blame the schedule, the heat, the budget or 'other teams'. Ownership sounds like this: the outreach plan failed, that is on me, and here is how we fix it. It is close to what the Bible calls confession, and it builds trust fast. Nobody has to defend themselves, so everyone can focus on fixing the problem.\n\nCover and Move reminds every ministry, from DTS to the cafe to community work, that we are one team, not competitors. Simple plans matter even more when we work in two languages. And because staff change often, Decentralized Command matters: train Khmer and international leaders to understand the 'why', so they can make good decisions without waiting for you.\n\nGood planning and honest debriefs can help our outreaches and events grow better every year. A short, kind talk after each one, about what went well and what to change, is a gift to the next team.\n\nOf course, we are not soldiers, and our mission is about love, not war. But taking responsibility, staying humble and serving the team fit well with following Jesus, who served others and carried what was not his own fault.",
   "oneLine": "Leaders take responsibility for everything, so their teams can win.",
   "cover": {
    "bg": "ink",
    "fg": "marigold",
    "a": "marigold",
    "b": "paper",
    "motif": "chevrons",
    "layout": "top",
    "font": "display",
    "upper": true
   }
  },
  {
   "id": "thanks-for-the-feedback",
   "title": "Thanks for the Feedback",
   "author": "Douglas Stone & Sheila Heen",
   "year": 2014,
   "isbn": "9780143127130",
   "shelf": "people",
   "mins": 10,
   "vibe": "Feedback is hard to give, but even harder to receive. This is a book about the receiving side.",
   "bigIdea": "Douglas Stone and Sheila Heen teach at Harvard Law School and help people with difficult conversations. They noticed that most training teaches people how to give feedback. But the person receiving it is the one who decides whether to learn from it. So they wrote a book for the receiver.\n\nFeedback is everywhere: in staff reviews, in a friend's comment, in a leader's advice, even in a look across the room. It often hurts, because we are caught between two needs. We want to learn and grow. But we also want to be accepted and loved just as we are. Feedback touches both needs at the same time.\n\nThe authors show that our strong reactions come from three triggers. Sometimes the feedback seems untrue. Sometimes we struggle with the person who gives it. And sometimes it shakes how we see ourselves. When you understand these triggers, you can stay calm, sort the useful from the unfair, and grow without losing yourself.\n\nThis matters for anyone who leads or serves. Leaders who receive feedback well learn faster, and they show their teams that it is safe to be honest. Receiving well is a skill, and like any skill, it can be learned.",
   "insights": [
    {
     "emoji": "📦",
     "title": "Three kinds of feedback",
     "body": "The authors say feedback comes in three kinds. Appreciation says, 'I see you, and you matter.' Coaching says, 'Here is how to get better.' Evaluation says, 'Here is where you stand.' We need all three, but for different reasons. Appreciation fills our heart, coaching helps us grow, and evaluation tells us what to expect.\n\nMany conversations go wrong because people are talking about different kinds without noticing. Here is a simple everyday example. A volunteer asks how she can improve, which is a request for coaching. Her leader gives her a score, which is evaluation, and she feels judged. Or someone works hard all year and just wants to feel noticed, but only receives tips. The authors also warn that evaluation is loud. When a score or a decision is involved, people often cannot hear the coaching at all. So it can help to have the coaching talk at a different time.\n\nSo be clear. Before a feedback talk, ask: what kind is this, and what kind do I need? If you are the receiver, you can say it out loud: today I would love some coaching. That small question can save a lot of hurt on both sides."
    },
    {
     "emoji": "❌",
     "title": "The truth trigger",
     "body": "Sometimes feedback just feels wrong, and we want to reject it. The authors call this the truth trigger. Before you decide it is wrong, first make sure you understand it.\n\nFeedback often comes as vague labels, like be more confident or you are too negative. A label is short, but the giver and the receiver may picture very different things. So ask where the feedback comes from: what did the person see, and how did they understand it? Then ask where it is going: what exactly would they like you to do differently? Here is a simple everyday example. Be more confident might simply mean: speak up earlier in meetings, and do not start every idea with an apology.\n\nThe authors suggest a useful shift. Instead of looking for what is wrong in the feedback, which is easy, look for what is different. People notice different things and understand them through different stories, so of course they reach different conclusions. Ask how the other person sees this differently from you, and why. Often there is something useful hidden inside the part that feels unfair. You do not have to agree with all of it to learn from some of it."
    },
    {
     "emoji": "👥",
     "title": "The relationship trigger",
     "body": "Sometimes the problem is not the feedback but the person giving it. We think, 'Who are you to tell me that?' or 'After how you treated me?' Our feelings about the giver can block the message completely, even when the message is true.\n\nThen something strange happens. The receiver starts talking about the giver, while the giver keeps talking about the first issue. The authors call this switchtracking. Two topics run on two tracks, and the two people talk past each other. Here is a simple everyday example: someone says your report was late, and you reply that they never thank you for anything. Both points may be true, but they are different conversations. Neither person feels heard, and both leave more frustrated.\n\nThe answer is to notice the two topics, name them out loud and give each its own time. Discuss the late report. Then, separately, discuss feeling unappreciated. Both matter, and neither should get lost. The authors also remind us that useful feedback sometimes comes from people we find difficult. They may see something our friends are too kind to say. Separating the message from the messenger helps us keep the good part."
    },
    {
     "emoji": "🪪",
     "title": "The identity trigger",
     "body": "Sometimes feedback shakes how we see ourselves. Maybe I am not a good leader. Maybe I am a bad friend. This is the identity trigger, and it can feel very strong, even when the feedback itself is small.\n\nThe authors explain that people are wired differently. They describe three differences: our normal mood level, how far our feelings swing when we hear criticism, and how long it takes us to recover. Some people bounce back in minutes. Others feel low for days. Some people hardly notice praise but feel criticism very deeply. Neither is wrong, but it helps to know yourself, so you are not surprised by your own reaction.\n\nThey also warn against all-or-nothing thinking. One piece of feedback is not the whole truth about you. You can have weaknesses and still be a good person. They encourage a growth identity: see yourself as someone still learning, so a mistake becomes part of your story, not the end of it. The authors add a hopeful idea. When you get feedback, you also get a second score: how well you handle the first one. Even after a hard review, you can earn a good second score by listening and growing."
    },
    {
     "emoji": "🎈",
     "title": "Keep the story its real size",
     "body": "When feedback hurts, our minds can make it much bigger than it really is. The authors describe how a single comment can grow in our heads. It spreads into the past: I have always been like this. It spreads into the future: I will never be good at this job. And it spreads to everything: maybe my whole life is a failure. The feeling becomes huge, but the feedback was only about one thing.\n\nThe authors offer ways to bring it back to its real size. First, notice the story your feelings are telling. Then separate that story from the facts. Here is a simple everyday example. Your leader says your talk was too long. That is feedback about one talk, not about your gifts, your calling or your worth. You can even write it down: this is what the feedback is about, and this is what it is not about.\n\nThey also suggest looking from a different place. Imagine yourself a year from now, looking back. Or imagine how a calm friend would describe what happened. These simple steps do not make the feedback disappear. But they help you see it clearly, so you can decide what is true and what to do next."
    },
    {
     "emoji": "🔦",
     "title": "Everyone has blind spots",
     "body": "Others can see things about us that we cannot. The authors point out that we cannot see our own face, especially when we are stressed. We do not hear our own tone of voice the way others do. These things leak our feelings even when our words are calm. So other people may be reacting to something we do not even know we are showing.\n\nThere is also a gap between intention and impact. We know what we meant, so we judge ourselves by our good intentions. Other people only see what we did and how it affected them. We also tend to explain our own mistakes by the situation, but other people's mistakes by their character. Here is a simple everyday example: you think you are being efficient in a meeting, but others feel you are rushing them and not listening.\n\nSo feedback can show us what we miss. It may be the most valuable kind, because we cannot find it any other way. Ask a trusted friend what you do that gets in your own way. When the answer surprises you, do not argue straight away. Ask for examples, listen, and say thank you. Then watch for the pattern yourself over the next few weeks."
    },
    {
     "emoji": "🧩",
     "title": "Look at the system",
     "body": "Problems often come from how people and roles fit together, not just from one person. The authors suggest stepping back to look at the whole system, instead of asking only who is to blame.\n\nThey describe a few ways to look. First, what is each person adding to the problem? Often both people contribute something, even if one part is bigger. Second, what about roles? Two people with different jobs may naturally clash, because each job pulls in a different direction. Third, what about the bigger setting, like rules, schedules or busy seasons that push people into bad patterns? Here is a simple everyday example: the cooks blame the servers for slow orders, and the servers blame the cooks. Maybe the real problem is how orders are passed between them. Fix that, and both teams can relax.\n\nAsking 'What is my part in this?' reduces blame. It does not mean everything is your fault. It means you look honestly at what you add, so you can change your part. It also finds better solutions, because you can fix the system instead of just accusing a person. When everyone steps back together, feedback stops feeling like an attack and starts feeling like shared problem solving."
    },
    {
     "emoji": "🛑",
     "title": "You can say no",
     "body": "Receiving feedback well does not mean accepting everything. You can listen, think about it honestly and still decide not to change. That is your choice. Feedback is information, not an order.\n\nThe authors describe healthy boundaries. You can say that you will hear someone's advice, but may not take it. You can ask someone to stop giving you feedback on a certain topic for now, perhaps because you are already working on it. And in rare cases, when a relationship keeps hurting you, you can step back from it. Saying no is not the same as being defensive, as long as you have really listened first. When you do say no, it helps to explain clearly what will happen as a result, so the other person is not surprised. Here is a simple everyday example: I hear that you want me to answer messages at night, but I need my evenings to rest, so I will reply each morning.\n\nBoundaries can also protect relationships. If one person keeps giving advice on everything, kindly saying enough for now can keep the friendship healthy. The goal is to stay open to learning, while still being the one who decides what to do with what you hear."
    },
    {
     "emoji": "🙋",
     "title": "Ask for one thing, then experiment",
     "body": "The authors say the best receivers do not just wait for feedback. They go and look for it. But a big question like 'Any feedback for me?' usually gets a polite answer: no, you are doing fine. So they suggest a smaller, sharper question: what is one thing you see me doing, or not doing, that gets in my own way?\n\nOne thing is easy to answer, and it is easy to work on. Ask it regularly, and ask different people, so you start to see patterns. Then try the advice as a small experiment, instead of arguing about whether it is true. Here is a simple everyday example. Someone says you interrupt in meetings. Instead of defending yourself, try waiting a few seconds before you speak for one week, and notice what changes.\n\nThe authors also hope for teams and families where asking for feedback is normal. Leaders can go first, by asking for feedback openly and thanking people when they give it. When people feel safe and heard, learning becomes something we do together, not something that is done to us. Growth is a long road, and the receiver is the one who decides how far to go."
    }
   ],
   "tryThis": [
    "Ask a teammate: 'What is one thing I do that holds me back?' Then just listen and say thank you.",
    "Next time feedback stings, name the trigger to yourself: truth, relationship or identity? Then write down what the feedback is about and what it is not about.",
    "Before a feedback conversation, agree together: is this appreciation, coaching or evaluation?"
   ],
   "forUs": "On a cross-cultural team, feedback is extra tricky. Some cultures are very direct, others are very indirect, and both can hurt by accident. A Khmer staff member may hint at a problem very gently, and an international teammate may miss it completely. Or a direct comment from a foreigner may feel like a loss of face, even when it was meant kindly.\n\nLearning to receive well, and to ask what someone really meant, helps Khmer and international staff trust each other. In DTS, staff reviews and outreach debriefs, growth starts with how we listen. Leaders can go first by asking their team for one thing, and by thanking people who are brave enough to answer. In busy places like the cafe or community service, it helps to look at the system together before blaming a person.\n\nIt is also fine to set gentle boundaries. Not every comment needs to change us, and new staff can feel flooded by advice from everyone at once. As followers of Jesus, our identity rests in God's love, not in our last review. So we can face hard feedback without fear, admit our blind spots with humility, and keep growing together as one family.",
   "oneLine": "You cannot control the feedback you get, but you can learn to receive it well.",
   "cover": {
    "bg": "marigold",
    "fg": "ink",
    "a": "ink",
    "b": "paper",
    "motif": "bubbles",
    "layout": "top",
    "font": "sans"
   }
  },
  {
   "id": "the-five-dysfunctions-of-a-team",
   "title": "The Five Dysfunctions of a Team",
   "author": "Patrick Lencioni",
   "year": 2002,
   "isbn": "9780787960759",
   "shelf": "people",
   "mins": 10,
   "vibe": "Smart people, bad teamwork? The problem is probably trust, and everything built on it.",
   "bigIdea": "Patrick Lencioni is a business consultant and writer who helps leadership teams work better together. He tells this book as a story, like a novel. Kathryn Petersen becomes the new CEO of DecisionTech, a technology company in Silicon Valley. The company has money, smart people and good products, but it is falling behind its competitors. The real problem is the leadership team. They are polite in meetings, avoid hard issues and protect their own departments.\n\nOver several retreats, Kathryn patiently helps them change. It is slow and uncomfortable. Some team members grow, and one leaves. After the story, Lencioni explains his model in simple terms, with a short questionnaire that teams can use to check their own health.\n\nHis big idea is that five problems destroy teams. They stack like a pyramid, and each one grows from the one below: no trust, fear of conflict, lack of commitment, avoiding accountability, and not caring about shared results. Fix trust first, and the rest becomes possible.\n\nFor anyone who leads or serves on a team, this matters because great teamwork is not mainly about being clever. It is about humility, courage and steady practice. Real teamwork is powerful because it is so rare.",
   "insights": [
    {
     "emoji": "🧱",
     "title": "1. Absence of trust",
     "body": "At the bottom of the pyramid is a lack of trust. Lencioni does not mean trusting that someone will do their job well. He means trust based on vulnerability: being willing to say 'I was wrong', 'I need help' or 'I am sorry' without fear that it will be used against you.\n\nAt the first retreat, Kathryn asks each person to share where they grew up, how many children were in their family, and the hardest challenge of their childhood. It is a simple exercise, but it surprises the team. People who have worked together for a long time learn new things about each other. Later they also talk about personality types, so they can understand each other's strengths and weaknesses instead of judging them.\n\nWithout trust, people hide weaknesses, do not ask for help and waste energy protecting their image. Meetings feel heavy, and people find reasons to avoid spending time together. With trust, they can be honest and put their energy into the work. Lencioni says this kind of trust grows slowly, through shared experiences over time. Leaders must go first, showing real weakness, not a fake humble act."
    },
    {
     "emoji": "🤐",
     "title": "2. Fear of conflict",
     "body": "Teams without trust avoid honest debate. Their meetings feel peaceful but boring, and real problems are only discussed in private, in the hallway or behind people's backs. Lencioni calls this artificial harmony. Everyone seems to agree, but nobody really does.\n\nHealthy conflict is passionate debate about ideas, not attacks on people. In the story, Kathryn surprises the team by saying they need more conflict, not less. When disagreements come up, she lets them continue instead of calming things down too fast. Lencioni suggests leaders go looking for hidden disagreements and bring them into the open. When a debate gets uncomfortable, the leader can stop for a moment and remind people that this kind of conflict is good and needed. That simple reminder takes away much of the fear.\n\nAvoiding conflict does not remove it. It pushes it underground, where it becomes gossip and frustration. It also means the team never hears some of its best ideas, because people keep them to themselves. A team that can argue well about ideas decides better, and often finishes meetings faster too, because it does not keep coming back to the same unsolved issues."
    },
    {
     "emoji": "⚖️",
     "title": "Find the right amount of conflict",
     "body": "Lencioni draws a simple line to show the range of conflict. At one end is artificial harmony, where nobody disagrees out loud. At the other end are mean, personal attacks, where people try to hurt each other. Many teams are so afraid of the attacking end that they stay close to the harmony end, far away from any danger.\n\nBut the healthy place is in the middle. Lencioni says a good team aims for the point where debate is strong and honest but not yet destructive. It may even cross the line a little now and then. That is normal and can be repaired, because the team trusts each other. Here is a simple everyday example: two teammates disagree strongly about a plan and raise their voices. Afterwards one says sorry for being sharp, and they still eat lunch together. The relationship is fine, and the plan is better.\n\nThis helps leaders know what they are aiming for. The goal is not to remove all tension. The goal is honest debate about ideas that leaves people respected. It can also help a team to talk openly about this, because people from different families and cultures are used to very different levels of directness."
    },
    {
     "emoji": "🤷",
     "title": "3. Lack of commitment",
     "body": "If people never shared their real opinion, they will not truly support the decision. They may nod in the meeting and then quietly do something else. Lencioni sees this as the natural result of fear of conflict.\n\nHe says commitment needs two things: clarity and buy-in. People do not need to get their way. Most reasonable people just need to know their ideas were heard and considered. Then they can support the team's decision even if they argued against it. Waiting for everyone to agree, or for perfect information, only causes delay, and the team may miss the right moment to act.\n\nIn the story, Kathryn ends meetings by asking the team to say clearly what they decided and what each person will tell their own staff. Lencioni calls this cascading communication. This simple habit quickly shows if people are leaving with different ideas about what was agreed. It also means everyone in the organisation hears the same message, so the departments below do not get confused. A clear decision, even an imperfect one, is better than a vague one. If it turns out to be wrong, a committed team can change direction together."
    },
    {
     "emoji": "⏱️",
     "title": "Decide without being sure",
     "body": "Lencioni knows that commitment is scary when the future is unclear. So he offers a few simple tools to help a team decide and move forward, even without full certainty.\n\nThe first is clear deadlines. A team should agree when a decision will be made, and keep to it. Small decisions along the way need deadlines too, or they quietly slip. The second is to talk through the worst case. If the team asks what is the worst thing that could happen if we choose this and we are wrong, the answer is often not as bad as people feared. Naming the risk out loud makes it smaller and helps people move. The third is to practise making decisions where little is at stake, so the team gets used to deciding without endless research.\n\nHere is a simple everyday example. A team cannot choose between two dates for an event. They agree to decide by Friday, talk about what could go wrong with each date, and see that both would be fine. They pick one and move on.\n\nThe point is that a slow, careful team is not always a wise team. Clear, timely decisions build confidence, and confidence makes the next decision easier."
    },
    {
     "emoji": "📏",
     "title": "4. Avoiding accountability",
     "body": "When nobody is really committed to a clear plan, nobody calls out a teammate who falls behind. People feel awkward and do not want to damage the relationship, especially with friends. So standards slowly drop, and the leader becomes the only one who corrects anybody.\n\nLencioni says the best teams hold each other accountable, peer to peer, not only through the boss. Pressure from respected teammates is often stronger than pressure from a leader, because nobody wants to let their peers down. In the story, Kathryn leads an exercise where each person names one thing each teammate does that helps the team, and one thing that hurts it. It is uncomfortable, but it is honest and kind, and it shows people clearly what to change.\n\nAvoiding a hard conversation is not really kind. It lets a teammate keep failing, and it makes others quietly resent them. Holding someone to a high standard can actually be a way of showing respect, because it shows you believe they can reach it. When goals and standards are clear and public, it becomes much easier to remind each other gently, before small problems grow into big ones."
    },
    {
     "emoji": "🏆",
     "title": "5. Inattention to results",
     "body": "At the top of the pyramid, people care more about their status, ego or own department than the team's shared goals. They want their area to look good, even when the whole organisation is struggling. This can quietly ruin a team full of talented people.\n\nIn the story, Kathryn tells the leaders that this leadership team must be their first team, more important than the departments they lead. That is hard for some of them, because they feel loyal to their own staff. She also makes a painful choice. Mikey, a gifted marketing leader, keeps putting herself above the team and will not change. She is talented, but she will not join in. In the end, Mikey leaves the company, and the team becomes healthier.\n\nLencioni says great teams make shared results clear, public and the true measure of success. When everyone looks at the same scoreboard, it is harder for individual egos to take over. Kathryn keeps reminding the leaders that what counts is whether the whole company reaches its goals, not how busy or important each person looks. Talent matters, but a team that wins together matters more."
    },
    {
     "emoji": "🔺",
     "title": "The healthy team, step by step",
     "body": "After explaining the five problems, Lencioni describes the opposite: what a healthy team looks like. Members of a strong team trust one another. They engage in honest, open conflict about ideas. They commit to decisions and plans. They hold one another accountable for keeping those plans. And they focus on achieving shared results.\n\nHe also includes a short team questionnaire in the book. Team members answer simple questions about how their team behaves, for example whether people admit their mistakes, whether meetings are lively, and whether people point out unhelpful behaviour in each other. The scores show which level of the pyramid needs the most attention. This turns a vague feeling, our team is not working well, into something specific that the team can talk about.\n\nHere is a simple everyday example. A team reads the five healthy behaviours aloud at the start of each month, and each person says which one the team is doing best and which one is weakest. In ten minutes, the model stays alive instead of being forgotten after one retreat. Clear, shared words give a team a simple way to talk about its own health without blaming anyone."
    },
    {
     "emoji": "🗣️",
     "title": "Simple tools to start",
     "body": "Lencioni gives practical tools for each level. For trust, share personal histories and talk about personality types and strengths. For conflict, make it clear that disagreement is welcome, look for hidden disagreements and invite quieter voices to speak. For commitment, end every meeting by saying out loud what was decided and who will tell whom. For accountability, make goals and standards visible, and review progress together regularly. For results, keep a simple scoreboard of shared goals that everyone can see.\n\nNone of this is complicated. The hard part is discipline and courage. Lencioni admits that building a real team is simple in theory but hard in practice, because it asks people to stay humble and vulnerable for a long time, even when they are tired or busy. The leader has a special role: to go first in being vulnerable, to allow healthy conflict, to push for clear decisions, and to keep the focus on shared results.\n\nSo start small. Pick one tool, use it at your next team meeting, and keep using it until it feels normal. Then add another. Change takes months, not one retreat. Even in the story, Kathryn's team improves slowly, with setbacks along the way, and that is normal."
    }
   ],
   "tryThis": [
    "In your next team meeting, have everyone share where they grew up and one challenge from their childhood.",
    "End every meeting by asking: 'What did we decide?' and 'Who will tell whom?'",
    "Ask one teammate directly about a concern you have been avoiding, kindly and in private."
   ],
   "forUs": "In many cultures, including Khmer culture, open disagreement can feel rude, so artificial harmony is a real temptation on our base. People may smile and agree in a meeting, then share their real thoughts later with friends. International staff can fall into it too, because they do not want to seem pushy. Leaders can make it safer by being vulnerable first, by asking quieter people for their view one by one, and by thanking people who disagree respectfully.\n\nThe personal histories exercise works well with DTS teams, outreach teams and new staff, and it helps Khmer and international staff see each other as people, not just roles. At the end of staff meetings, asking 'What did we decide, and who will tell whom?' can save a lot of confusion between ministries.\n\nAccountability can feel hard in a community of friends and volunteers. But gently keeping our promises to each other is part of loving one another well. And remember: everyone's first team is the whole base and its mission, not just their own ministry. When the cafe, the school and the outreach teams cheer for each other's results, the whole base grows stronger, and we show the unity Jesus prayed for.",
   "oneLine": "Build trust first; it opens the door to honest debate, real commitment, accountability and results.",
   "cover": {
    "bg": "paper",
    "fg": "ink",
    "a": "teal",
    "b": "cobalt",
    "motif": "pyramid",
    "layout": "top",
    "font": "serif"
   }
  },
  {
   "id": "emotional-intelligence",
   "title": "Emotional Intelligence",
   "author": "Daniel Goleman",
   "year": 1995,
   "isbn": "9780553383713",
   "shelf": "people",
   "mins": 10,
   "vibe": "Being smart is not enough. How you handle feelings, yours and others', shapes your life.",
   "bigIdea": "Why do some very clever people make a mess of their lives, while people with average grades do well? Daniel Goleman, a psychologist who wrote about the brain and behaviour for The New York Times, says IQ cannot explain it. IQ is only one part of the picture.\n\nHe argues that emotional intelligence matters a great deal. It includes knowing your own emotions, managing them, motivating yourself, understanding other people's feelings and handling relationships well. These skills shape our marriages, friendships, work and even our health. A person with great talent but little self-control can lose a lot in one angry moment.\n\nThe good news is that these skills are not fixed at birth. Goleman uses brain science and many studies to show that emotional habits are learned, much of it in childhood, and can still be improved at any age. He also argues that families and schools can teach these skills on purpose, just like reading or maths.\n\nFor anyone who leads or serves, this is hopeful. We are not stuck with the way we react today. With practice, we can become calmer, kinder and wiser with people, and help others grow in the same way.",
   "insights": [
    {
     "emoji": "🧠",
     "title": "The emotional hijack",
     "body": "Goleman says we have two minds: one that thinks and one that feels. Usually they work together. But a small part of the brain called the amygdala works like an alarm. It reacts to danger very fast, faster than the thinking part of the brain can check what is happening. This helped humans survive real danger. But sometimes the alarm takes over when it should not, and we say or do things we deeply regret. Goleman calls this an emotional hijacking.\n\nHe opens with true stories where the alarm went off before the mind could think, and people did in a second what they regretted for years. Here is a simple everyday example: someone slams a door behind you and, before you know why, your heart jumps and your fists are ready. Only a moment later does your thinking brain say, it was just the wind.\n\nMost of our hijacks are much smaller, like snapping at a teammate or sending an angry message. The first step to controlling them is noticing the moment: my heart is racing, I feel attacked. That small pause gives the thinking brain time to catch up. Over time, these pauses can become a habit."
    },
    {
     "emoji": "🪞",
     "title": "Self-awareness comes first",
     "body": "You cannot manage a feeling you do not notice. Knowing what you feel, while you feel it, is the foundation of emotional intelligence. Goleman points out that feelings can be at work before we are aware of them. A bad mood can colour a whole day, and we may not know why we are so short with people.\n\nGoleman retells an old Japanese story. A proud samurai asked a Zen teacher to explain heaven and hell. The teacher insulted him. The samurai became furious and raised his sword. The teacher said calmly that this was hell. The samurai understood, put his sword away and bowed in thanks. The teacher said that this was heaven. The moment the samurai saw his own anger, he was free from it.\n\nGoleman says people handle their moods in different ways. Some are aware of them as they happen. Some are swamped by them and feel lost. Others accept them and do not try to change them. Simply naming an emotion, like I feel embarrassed or I feel left out, often calms it and helps us choose what to do next. People who know their feelings well are also better at making personal decisions, about work, friends and life."
    },
    {
     "emoji": "🧘",
     "title": "Managing your emotions",
     "body": "Feelings are not bad. They are part of being human. But we can choose how we respond. People who can calm themselves after anger, worry or sadness recover faster and make wiser decisions.\n\nGoleman looks closely at anger. Angry thoughts feed more anger, so going over the same story again and again makes it worse. Research he describes found that angry people calm down best when they cool off away from the trigger, for example by taking a walk, and when they see the situation in a new way. Perhaps the person was tired, not cruel. Shouting to let the anger out usually keeps it alive longer.\n\nWith worry, it helps to notice worried thoughts early, question them, and practise relaxing the body. With sadness, Goleman describes things that often help lift a low mood, such as exercise, doing something kind for someone else, small successes and looking at the situation in a more hopeful way. Sitting alone and going over sad thoughts again and again tends to keep the sadness going.\n\nThis is not about hiding feelings or pretending to be fine. It is about not letting one feeling take control of everything. Calm is a skill that grows with practice."
    },
    {
     "emoji": "🍬",
     "title": "Waiting for the bigger reward",
     "body": "Goleman describes a famous study from Stanford University. Four-year-old children were offered one marshmallow now, or two if they could wait until the researcher came back. Some ate it at once. Others found ways to wait, like covering their eyes, singing or playing games. Years later, the children who had waited were, on average, more confident and dependable, and did better on school tests. Later research suggests that family background also plays a big part, so this is not the whole story.\n\nGoleman's point is that self-control and hope keep us moving toward long-term goals. He sees the ability to motivate ourselves as a master skill, because it helps every other skill. He also talks about optimism and flow, the happy state of being fully absorbed in something you do well. Hopeful people believe they can find a way, so they do not give up easily. Optimists tend to see a failure as something they can change, not as proof that they are no good.\n\nStrong worry, on the other hand, makes it hard to think and learn. For leaders, this is encouraging. Self-control is like a muscle. We can help ourselves and others grow it through small daily habits, clear goals and plenty of encouragement."
    },
    {
     "emoji": "💞",
     "title": "Empathy",
     "body": "Most emotions are shown through tone of voice, face and body, not through words. Empathy is the skill of reading these signals and feeling with others. Goleman says it grows from self-awareness: the more open we are to our own feelings, the better we can read the feelings of others.\n\nHe describes research where people watched short films of a woman showing different feelings, with the words made impossible to understand. People who were good at reading the feelings without words were often better liked and more emotionally stable. Goleman also notes that even babies become upset when they hear another baby cry, and that small children often try to comfort someone who is sad. Empathy starts very early, and children learn much of it from how their parents respond to their feelings.\n\nEmpathy is the root of compassion and care. Goleman points out that people who do great harm to others often lack it. They do not feel the pain they cause. In daily life, empathy means slowing down, watching faces, listening to tone and gently asking how someone really is. When words and face say different things, the face and the tone usually tell the truth."
    },
    {
     "emoji": "🤝",
     "title": "Handling relationships",
     "body": "Emotions spread between people, almost like a cold. Goleman calls this emotional contagion. In every meeting, people are quietly passing moods to each other. Skilled people can calm a tense room, give criticism kindly, and help others feel understood.\n\nAt the start of the book, he describes a bus driver in New York City on a hot, sticky afternoon. The driver greeted each passenger warmly and chatted happily about the city as they rode. Tired, grumpy people stepped off the bus smiling. One person's mood changed the mood of many others.\n\nGoleman also shows how to give criticism well. Be specific about the problem, offer a way to fix it, and say it face to face with care. Attacking someone's character only creates anger and defensiveness, and the person stops listening. Good criticism focuses on what the person did and what they can do next, not on who they are.\n\nThese social skills, together with empathy and self-control, are what make great leaders, good team members and loyal friends. Goleman also warns that social skill without real feeling can become empty charm, where people only say what others want to hear. The aim is not to impress people, but to connect with them honestly."
    },
    {
     "emoji": "💬",
     "title": "Fighting fair in close relationships",
     "body": "Goleman gives a whole chapter to marriage, because that is where emotions are tested most. He draws on the research of psychologist John Gottman, who studied how couples argue. Healthy couples still disagree. The difference is how they do it.\n\nA complaint is about a specific action: you did not call to say you would be late, and I was worried. Criticism attacks the person: you never think about anyone but yourself. Criticism makes the other person defensive, and if it turns into contempt, mocking or disgust, the relationship is in real danger. Another warning sign is when one partner shuts down and stops responding. Goleman also describes flooding, when a person becomes so upset during an argument that they can no longer hear or think clearly.\n\nThe remedies are simple but take practice. Take a break and calm down when you feel flooded. Notice the angry story you are telling yourself about the other person, and look for a fairer one. Listen without defending yourself, and try to say back what the other person feels. Make complaints about actions, not character. These skills help not only in marriage, but also in close friendships and in teams that live and work together."
    },
    {
     "emoji": "🏢",
     "title": "Emotional intelligence at work",
     "body": "Goleman argues that emotional skills matter greatly at work, not only at home. He looks at how leaders give criticism, how teams think together, and how people build helpful relationships.\n\nHe describes a study of engineers at Bell Labs, a famous research centre. The researchers wanted to know why some engineers were stars and others were average, even though all of them were very clever. The difference was not IQ. The stars had built good relationships with colleagues before they needed help. So when a problem came, they got fast answers, while others waited for replies that came slowly or not at all.\n\nGoleman also writes about the group IQ of a team. In research he describes, the best groups were not simply the ones with the most talented members. They were the groups that worked in harmony, where everyone felt free to contribute. One person who was too dominant, or who would not take part, could pull the whole group down.\n\nThis matters for anyone who leads. A team's mood affects how well it thinks. Leaders can help by listening, valuing each person's voice and keeping conflict respectful. Steady, caring relationships turn a group of skilled people into a team that is clever together."
    },
    {
     "emoji": "🌱",
     "title": "Temperament is not destiny",
     "body": "Are we stuck with the emotional patterns we are born with? Goleman says no. Children are born with different temperaments. Some are bold, some are shy, some are cheerful and some worry easily. But temperament is not destiny.\n\nHe describes the work of psychologist Jerome Kagan, who studied very timid children. Many of them stayed shy, but some became more outgoing as they grew. One difference seemed to be the parents. Parents who gently encouraged their shy child to face small, manageable challenges helped the child grow braver. Parents who protected the child from every upset did not help as much. Experiences in childhood shape the brain, and later experiences can keep shaping it.\n\nGoleman ends the book by calling for emotional literacy in schools. He describes classes where children learn to name their feelings, calm themselves, solve conflicts and understand each other, as a normal part of school. The aim is to give every child skills that once depended on luck and family.\n\nFor anyone who teaches, mentors or leads, this is hopeful. People can keep growing emotionally. With patience, safety and practice, a shy, angry or anxious person can learn new ways to respond."
    }
   ],
   "tryThis": [
    "Three times today, pause and name your feeling in one word.",
    "When you feel anger rising, wait before you reply. Take a short walk or a few slow breaths first.",
    "In your next conversation, watch the other person's face and tone, and ask how they are really doing."
   ],
   "forUs": "Mission life is emotional: culture stress, heat, tiredness, homesickness and living close together in community. Emotional intelligence helps us notice what is happening inside before it spills onto our teammates. A short walk before replying to a hard message can save a friendship. Naming our feelings honestly, to God and to a trusted friend, helps us stay healthy for the long run.\n\nAcross languages, reading faces and tone with empathy is often how we understand each other best. Many Khmer people show feelings quietly, and many internationals show them openly, so we need to watch and ask with care. In DTS and the schools, staff can help students name their feelings and calm down after conflict, not just learn information. Outreach teams, living close together under pressure, can practise fair complaints instead of criticism. In the cafe or community service, a warm and steady mood from one person can lift a whole shift, just like the bus driver.\n\nThe Bible also calls us to be slow to anger and to weep with those who weep. Growing in these skills is part of growing in love, and the Holy Spirit helps us grow in self-control. None of us is stuck. God is still shaping our hearts.",
   "oneLine": "Know your feelings, manage them well, and read others with care.",
   "cover": {
    "bg": "cobalt",
    "fg": "paper",
    "a": "berry",
    "b": "paper",
    "motif": "pulse",
    "layout": "top",
    "font": "sans",
    "upper": true
   }
  },
  {
   "id": "leaders-eat-last",
   "title": "Leaders Eat Last",
   "author": "Simon Sinek",
   "year": 2014,
   "isbn": "9781591845324",
   "shelf": "people",
   "mins": 10,
   "vibe": "Real leaders protect their people first. Then people give everything back.",
   "bigIdea": "Why do some teams trust each other and work together so well, while others are full of fear and politics? Simon Sinek, a writer and speaker who helps leaders think about why they do what they do, found one clue in the US Marine Corps. At meals, the most junior Marines eat first and the most senior leaders eat last. It is not a written rule. It is simply the culture: leaders put their people's needs before their own.\n\nSinek argues that great leaders build a 'Circle of Safety' around their people. Inside it, people feel protected from dangers inside the group, like fear of being blamed, betrayed or suddenly fired. When people feel safe, they trust each other, work together and face outside problems bravely.\n\nHe uses biology, history, the military and real companies to show that this is not soft. Our bodies are made to feel good when we cooperate and to feel stress when we sense danger. A culture of care helps people thrive, while a culture of fear slowly wears them down.\n\nFor anyone who leads or serves, the message is clear and challenging. Leadership is not a rank. It is a choice to care for the people in your care, even when it costs you.",
   "insights": [
    {
     "emoji": "🛡️",
     "title": "The Circle of Safety",
     "body": "Every group faces dangers from outside: competition, hard economic times, sickness or opposition. Sinek says that is normal. The real problem comes when people also have to protect themselves from their own leaders and teammates. Then they waste energy on politics and self-protection, and they stop trusting.\n\nHe opens the book with Captain William Swenson, a US Army officer in Afghanistan. During an ambush, Swenson ran into danger again and again to rescue wounded soldiers. A video shows him gently kissing the head of a badly wounded man as he puts him on a helicopter. Sinek asks why people like this risk themselves for others. His answer: they feel part of a group that would do the same for them.\n\nSinek says leaders decide who is inside the circle and how wide it is. When the circle includes everyone, not just a favoured few, the whole team feels it belongs. Leaders who make the inside feel safe free people to focus on the mission and give their best. Here is a simple everyday example: a worker who knows a mistake will be treated as a chance to learn, not a reason for punishment, will report problems early instead of hiding them."
    },
    {
     "emoji": "🧪",
     "title": "The body's chemistry",
     "body": "Sinek explains four natural chemicals that make us feel good. Endorphins help us push through pain and tiredness. Dopamine gives us a happy feeling when we reach a goal or tick something off a list. These two help us work hard and achieve. Sinek calls them selfish chemicals, because they mostly reward individual effort.\n\nSerotonin and oxytocin are the selfless chemicals. Serotonin gives us a feeling of pride and respect, both when others honour us and when we see people we care for do well. Think of a student at graduation and the proud parents watching. Oxytocin is the feeling of trust, love and friendship. It grows through acts of kindness, warm physical touch like a handshake, and time spent together. Sinek says that even seeing someone else do something kind can give us a little of it.\n\nHealthy teams need both kinds. A culture driven only by dopamine can become obsessed with targets and numbers, and Sinek warns that this can become almost like an addiction. He also links it to the constant checking of phones and messages. Trust and care keep the team human, and they help people stay when work gets hard."
    },
    {
     "emoji": "⚠️",
     "title": "Stress kills trust",
     "body": "When people feel unsafe, the body releases cortisol, the stress chemical. It helps us react to danger in the short term. But if it stays high for a long time, it harms our health. It also blocks oxytocin, so people become more selfish, suspicious and closed. Fear spreads, and everyone starts looking after only themselves.\n\nSinek describes the Whitehall studies of British government workers. Researchers found that people lower down in the organisation had more stress-related health problems than those at the top. The pressure of big responsibility was not the main cause. The bigger problem was feeling that they had little control over their own work. Sinek also points out that stress at work does not stay at work. People carry it home to their families.\n\nSo bad leadership is not just unpleasant. It can actually make people sick. Leaders can lower stress by giving people more control over their work, clear information, and the feeling that someone has their back. Here is a simple everyday example: a team that hears early and honestly about a difficult change will feel much less fear than a team that only hears rumours. Leaders cannot remove all danger, but they can make sure nobody faces it alone."
    },
    {
     "emoji": "🎛️",
     "title": "Give control to your people",
     "body": "If lack of control causes stress, then leaders can help by giving control away. Sinek tells the story of Captain David Marquet, who took command of a US Navy submarine called the USS Santa Fe. It had one of the worst records in the fleet, and the crew felt low.\n\nMarquet had been trained on a different kind of submarine. Early on, he gave an order that was not possible on this boat, and an officer passed it on anyway. Marquet realised the crew were used to obeying orders without thinking. If the captain was wrong, everyone would follow him into the mistake. So he changed the culture. Instead of waiting for orders, crew members were asked to say what they intended to do, and the captain would agree or ask questions. Responsibility moved down to the people who knew the work best. Over time, the Santa Fe went from one of the worst to one of the best in the navy.\n\nSinek's point is that people grow when they are trusted with real decisions. A leader who controls everything creates followers who wait. A leader who shares control creates more leaders. It feels risky, but it builds confidence and trust on both sides."
    },
    {
     "emoji": "🍽️",
     "title": "Leadership is sacrifice",
     "body": "Leadership is not about rank or title. Sinek says leaders have a choice: to take care of the people in their care, or not. Real leaders give up their own comfort, time and sometimes safety for their people. In return, people give their trust and their best work. Sinek also points out that someone with no title at all can act like a leader, simply by looking after others.\n\nHe tells of a US Air Force pilot, known by the call sign Johnny Bravo, who flew low under thick clouds in Afghanistan to help soldiers under attack on the ground. It was very dangerous, and he could hardly see, but he would not leave them alone. When asked why he took such risks, his answer was simple: because they would do the same for him. Stories like this show how leaders earn deep loyalty.\n\nPeople notice when a leader gives something up for them. They also notice when a leader takes the best for themselves, like extra pay or special comforts while others struggle. The leaders we follow most gladly are the ones who would eat last. The cost is real, but so is the trust it builds."
    },
    {
     "emoji": "🏭",
     "title": "People before numbers",
     "body": "Sinek tells of Bob Chapman, the leader of a manufacturing company called Barry-Wehmiller. During the economic crisis of 2008, one part of the company lost many orders and needed to save a lot of money. Many companies would simply have laid people off. Instead, Chapman asked everyone, from the factory floor to the managers, to take four weeks of unpaid leave. Everyone shared a small pain so that nobody suffered a big one.\n\nThen something beautiful happened. Some workers who could afford it offered to take extra unpaid time, so that others who could not afford it would lose less. Trust grew, and so did loyalty. Chapman sees every worker as someone's precious child, and he wants leaders to care for them in that way.\n\nSinek contrasts this with leaders who protect profits by cutting people at the first sign of trouble. When people feel like numbers, they protect themselves. When they feel valued, they protect each other. Here is a simple everyday example: a team that knows its leader will stand with them in a hard season will work harder to get through it together, instead of quietly looking for the exit."
    },
    {
     "emoji": "👨‍👩‍👧",
     "title": "Lead like a good parent",
     "body": "Sinek often compares good leaders to good parents. Parents would never send away one of their children because the family was having a hard year. They would make sacrifices so the family can stay together. Sinek asks why leaders so easily do the opposite with the people in their care.\n\nHe tells the story of Next Jump, a technology company in New York led by Charlie Kim. The company chose a policy of lifetime employment. People would not be fired to save money or simply because they were struggling. If someone was not doing well, the company would coach and train them instead, like a family helping a child who is having a hard time. People could still choose to leave, but the company would not give up on them.\n\nThis sounds risky to many business leaders. But Sinek's point is that when people know they will not be thrown away, they stop protecting themselves and start investing in each other and in the work. Here is a simple everyday example: a volunteer who knows the team will help her improve, instead of quietly replacing her, will be honest about what she finds hard. Commitment from the leader creates commitment from the people."
    },
    {
     "emoji": "👀",
     "title": "Keep it human and close",
     "body": "When organisations grow very big, leaders can start seeing people as numbers on a screen. Sinek calls this abstraction, and he says it is dangerous. The further away people are, the easier it is to forget that they are real.\n\nHe describes the famous Milgram experiments from the 1960s. Ordinary people were told to give electric shocks to a stranger in another room. The shocks were not real, but the people did not know that. Many obeyed. But when the stranger was in the same room, where they could see him, far fewer people went all the way. When they had to touch him, even fewer did. Distance made it easier to hurt someone.\n\nThe same is true in leadership. It is easier to make harsh decisions about people you never see. Sinek also notes that a person can only truly know a limited number of people, so very large groups need leaders who personally know the people in their care. Leaders need to stay close enough to know names and stories. Face-to-face time, real meals and simple conversations build trust that emails and messages cannot."
    },
    {
     "emoji": "⏳",
     "title": "Trust grows through time and energy",
     "body": "Sinek says trust cannot simply be bought with money. It grows through time and energy given freely. When someone gives us their time, we feel that we matter, because time is something nobody can get back.\n\nHe explains that oxytocin, the trust chemical, builds slowly, while dopamine can come quickly when we get a reward. Trust takes many small moments: listening well, remembering something important, showing up when someone is struggling. This is why quick online messages cannot fully replace being together in person. Here is a simple everyday example: a leader who sits with a new staff member for an hour in their first week, asking about their family and dreams, may build more trust than one who sends a long welcome email.\n\nSinek also warns that trust is easily broken when leaders say one thing and do another. Integrity, telling the truth even when it is hard, protects the Circle of Safety. Leaders who admit their mistakes give others courage to admit theirs. So the work of leadership is often slow and quiet. It is built day by day, through care that costs time and energy, not through big speeches."
    }
   ],
   "tryThis": [
    "Ask your team what makes them feel worried or unsafe here. Then fix one small thing.",
    "Do one small act of service for your team this week that costs you time or comfort.",
    "Put your phone away in your next one-to-one meeting and give full attention."
   ],
   "forUs": "Jesus washed his disciples' feet, and servant leadership is at the heart of our mission. A base leader who protects staff from burnout, gossip and fear builds a team that can go out and serve Cambodia with joy. Safety inside the team gives courage for outreach outside. A team that feels protected can take risks for the gospel.\n\nFor us, building a Circle of Safety might mean defending a teammate who is being talked about, making sure Khmer and international staff are both heard, or checking on volunteers who are tired. It means sharing hard news early and honestly, so rumours do not spread. It can also mean sharing control: letting a Khmer staff member lead the outreach plan, or trusting a DTS student to run a cafe shift and learn from mistakes.\n\nLike a good parent, we can choose to coach people when they struggle instead of quietly giving up on them. And it means staying close: eating together, learning names and visiting people's homes. Our time is one of the best gifts we can give. Sometimes it literally means letting the team eat first.",
   "oneLine": "Make people feel safe, and they will trust you, follow you and serve together.",
   "cover": {
    "bg": "paper",
    "fg": "ink",
    "a": "berry",
    "b": "marigold",
    "motif": "circlesafety",
    "layout": "top",
    "font": "sans",
    "upper": true
   }
  },
  {
   "id": "lean-in",
   "title": "Lean In",
   "author": "Sheryl Sandberg",
   "year": 2013,
   "isbn": "9780385349949",
   "shelf": "people",
   "mins": 10,
   "vibe": "Women can lead. And everyone — men too — can help make room for them.",
   "bigIdea": "Why are there still so few women at the top of companies, governments and organisations? Sheryl Sandberg asked this question while she was chief operating officer at Facebook, after earlier years at Google and in the US government. Her answer has two sides. Some barriers are outside us: bias, unfair systems and little support for working parents. Other barriers are inside us: fear, self-doubt and the habit of holding back before anyone even asks. Sandberg says we need to fight both. She writes mostly about the inside barriers, because those are things each person can start to change today. She mixes research with honest stories from her own life, including her mistakes and the times she felt like a fraud. Her message to women is simple: lean in. Take the seat, raise your hand and keep growing. Her message to men, families and leaders matters just as much: make room, share the load at home, and notice bias when you see it. This is not only a book about business. It shows how teams lose gifts when half the people hold back, and how leaders can help everyone bring their full strength.",
   "insights": [
    {
     "emoji": "💭",
     "title": "The ambition gap",
     "body": "Sandberg starts with a hard question. Women today have more education and more chances than ever before. So why do so few of them reach the top? Part of her answer is what she calls a leadership ambition gap. From a young age, many girls learn that wanting to lead is not quite right for them. A boy who takes charge is called a leader. A girl who does the same is often called bossy. Sandberg says she heard that word about herself as a child.\n\nOver time, these messages shape what women dare to want. Many talented women aim a little lower, not because they lack ability, but because they have quietly learned that big ambition does not fit them. Fear plays a big part: fear of not being liked, of failing, or of being judged as a bad mother or wife.\n\nAt Facebook, posters on the walls asked a simple question: what would you do if you weren't afraid? Sandberg uses this question as a key to the whole book. Try asking it about your own life. Which dreams have you set aside because of fear? Is it time to pick one of them back up?"
    },
    {
     "emoji": "🪑",
     "title": "Sit at the table",
     "body": "Sandberg tells of a meeting she hosted at Facebook for the US Treasury Secretary, Tim Geithner, and his team. The women on his team took chairs at the side of the room, even though there was space at the main table. Sandberg invited them to come and sit at the table, but they stayed where they were. They did not feel they belonged there.\n\nMany capable women feel this way. Sandberg describes 'impostor syndrome': feeling like a fraud who will soon be found out, even after real success. She admits she felt it herself through school and work. She also shares a company report that men often apply for a job when they meet only some of the requirements, while women wait until they meet nearly all of them. And women often explain their success by luck or by help from others, while men more easily say it came from their own skill.\n\nThe lesson is simple. Doubt should not decide where you sit. You do not have to feel fully confident before you act. Sometimes you can act with confidence first, and the real feeling grows later. Take the seat, share the idea and ask for the opportunity."
    },
    {
     "emoji": "⚖️",
     "title": "The likeability problem",
     "body": "Sandberg describes a well-known class experiment at a business school. Students read a true story about a successful business leader. Half the class read it with a woman's name, Heidi. The other half read the same story with a man's name, Howard. Students rated both as equally capable. But they liked Howard more, and saw Heidi as selfish and not someone they would want to work with.\n\nThis shows a hidden bias. When men succeed, people tend to like them more. When women succeed, people often like them less. So women may hide their wins, avoid asking for more, or apologise for being strong. Sandberg admits that when Facebook first offered her the job, she was ready to accept without asking for more. People close to her urged her to negotiate, and she did it carefully, by pointing out that the company was hiring her partly for her skill at making deals.\n\nShe suggests ways to ask for what you need while staying warm, such as linking the request to the good of the whole team. But the deeper fix is for everyone to name this bias out loud, so teams can catch it. When someone calls a woman too pushy, ask: would we say this about a man who did the same thing?"
    },
    {
     "emoji": "🧗",
     "title": "A jungle gym, not a ladder",
     "body": "Sandberg borrows a picture from Pattie Sellers, a journalist friend: a career is more like a jungle gym than a ladder. On a ladder there is only one way up, and many people are stuck waiting. On a jungle gym you can move sideways, go down a little or climb in a new direction, and still reach somewhere great. This picture is good news for people who start late, take breaks or change fields.\n\nHer own path looked like this. She worked in government, then joined Google when it was still young, and later moved to Facebook. When she was deciding about Google, she made a careful list comparing the jobs she was offered, and the Google job looked the smallest. Its leader, Eric Schmidt, told her not to worry about the title. If you are offered a seat on a fast-growing rocket ship, just get on. She took the job, and it shaped the rest of her career.\n\nShe suggests two things. Have a long-term dream, even a vague one that may change over time. And have an 18-month plan: what will your team achieve, and what new skills will you learn? Be willing to take a sideways step if it helps you grow."
    },
    {
     "emoji": "🧑‍🏫",
     "title": "Mentors come from good work",
     "body": "Sandberg often met young women who walked up to senior leaders and asked, 'Will you be my mentor?' She compares this to a children's picture book where a baby bird wanders around asking every animal, 'Are you my mother?' If you have to ask, the answer is usually no.\n\nMentoring tends to grow the other way around. Senior people notice someone who does excellent work and shows promise, and they choose to invest. Sandberg herself was helped by Larry Summers, her university professor, who later hired her to work with him at the World Bank and the US Treasury.\n\nShe also tells of Lori Goler, a marketing leader who wanted to join Facebook. Instead of asking for a favour, Lori called Sandberg and asked what her biggest problem was and how she could help solve it. The answer was hiring good people, so Lori offered to work on that. She got the job.\n\nSo the better path is to do great work first and look for ways to help. When you do get time with someone wise, bring a specific question, not a vague request. Also look sideways: friends and peers at your own level can give some of the best support."
    },
    {
     "emoji": "🗣️",
     "title": "Speak your truth",
     "body": "Sandberg believes good teams need honest talk. But many people, especially those with less power, find it hard to speak up or give feedback to a boss. Women may also fear seeming too harsh. Her advice is to be honest in a humble way. Remember that your view is just your view, not the full truth. Speak about what you saw and how you felt, instead of telling someone what they are like. For example, 'I felt left out when the plan changed' is easier to hear than 'You never include me.'\n\nShe also asks for feedback herself, and tries to make it safe for others to give it. Early in her time at Facebook, Mark Zuckerberg told her that her wish to be liked by everyone would hold her back. It was hard to hear, but she knew he was right. A leader who tries to please everyone cannot make hard choices.\n\nSandberg even writes about crying at work. She has come to believe that sharing real feelings can build trust rather than break it, because people connect with leaders who are real. So speak up kindly, ask others how you are doing, and listen when the answer is uncomfortable."
    },
    {
     "emoji": "🚪",
     "title": "Don't leave before you leave",
     "body": "Sandberg noticed a pattern. Many women start stepping back from their careers long before they have children. They think ahead: one day I want a family, so I should not take on too much. So they stop raising their hand for new projects and turn down new chances. She tells of a young woman at Facebook who came to ask how to balance work and family. When Sandberg asked if she had a child, the woman said she did not even have a boyfriend yet.\n\nThe problem is that by the time a baby comes, these women may be in jobs that feel less interesting and less rewarding than they could have been. When they compare that job with caring for a child, leaving is the easier choice. A job that is challenging and meaningful is much harder to walk away from.\n\nSandberg is clear that staying at home is a good choice for many people. Her point is about not deciding too early. Keep your foot on the gas. Keep learning and saying yes. If the time comes to make a change, make it then, with the full picture, not years early out of fear."
    },
    {
     "emoji": "🏠",
     "title": "Make your partner a real partner",
     "body": "Sandberg calls the choice of a life partner one of the most important career decisions a woman makes. She encourages young women to look for a partner who wants a truly equal relationship, someone who sees both careers and the home as shared. In many homes, even when both people work outside the home, the woman still does most of the cooking, cleaning and child care. That leaves her less time and energy for her work and for rest.\n\nShe shares that she and her husband, Dave, worked hard at sharing things fairly, and that it did not happen by itself. It took honest talks and changes over time. She also warns about a habit she calls 'maternal gatekeeping'. A mother criticises how the father feeds or dresses the baby, so he slowly stops trying. If you want a partner to share the work, let them do it their own way, even when it is different from yours.\n\nShe points to research linking involved fathers with healthier, happier children. Fair sharing is good for the whole family, not only for the woman. It also frees fathers to be more present at home, which many of them truly want."
    },
    {
     "emoji": "✅",
     "title": "Let go of perfect",
     "body": "Sandberg says the idea of having it all is a trap. Nobody can do every part of life perfectly. Trying to be the perfect worker, parent, partner and friend at the same time leads to guilt and exhaustion. A poster on the wall at Facebook said that done is better than perfect, and she found that freeing.\n\nShe is honest about her own struggle. After her first child, she started leaving the office around 5:30 to be home for dinner with her children, and went back online after they were asleep. At first she worried people would think she was not committed, so she kept quiet about it. Over time she saw that her work did not suffer. She argues that teams should judge people by what they achieve, not by how many hours they sit at a desk.\n\nThe skill here is to set clear priorities and then be at peace with the things you chose not to do. Sandberg admits she still feels guilt at times, and that this is normal. Being clear about a few important things, and saying no to the rest, helps everyone. A focused, rested person can serve well for many years."
    }
   ],
   "tryThis": [
    "In your next meeting, notice who speaks and who stays quiet, and invite one quiet person to share.",
    "If you usually hold back, share one idea out loud this week, even if you feel unsure.",
    "Look at how tasks are shared in your home or team, and make one change to make it fairer."
   ],
   "forUs": "At GP, many of our most gifted leaders, teachers and servants are women, both Khmer and international. Yet in many cultures, including some of ours, women can still hold back or be overlooked, and young staff of any gender may feel it is not their place to speak. Leaders can help in simple ways. Notice who sits at the side of the room in staff meetings, and invite them to the table. Ask the quiet ones what they think before the loudest voices decide. Give real chances to lead a DTS, an outreach team or a ministry like the cafe, not only support roles. When a woman leads strongly, watch for the likeability bias in how we talk about her. Married couples on staff can model fair sharing of home and children, so both can serve well. Mentoring at GP can grow the way Sandberg describes: through faithful work, honest feedback and peers who cheer each other on. Ask God what you would do if you were not afraid. When everyone uses their gifts fully, the whole body of Christ gets stronger.",
   "oneLine": "Step forward with courage, and help make space for others to do the same.",
   "cover": {
    "bg": "paper",
    "fg": "berry",
    "a": "berry",
    "b": "ink",
    "motif": "lean",
    "layout": "top",
    "font": "display",
    "upper": true
   }
  },
  {
   "id": "start-with-why",
   "title": "Start with Why",
   "author": "Simon Sinek",
   "year": 2009,
   "isbn": "9781591846444",
   "shelf": "people",
   "mins": 10,
   "vibe": "People don't follow what you do. They follow why you do it.",
   "bigIdea": "Why do some leaders and groups inspire deep loyalty, while others with more money and talent do not? Simon Sinek, a speaker and writer who started his career in advertising, noticed a pattern. Most organisations can explain what they do, and some can explain how. Very few can clearly say why. By 'why' he does not mean making money, which is only a result. He means purpose, cause or belief: why does your group exist, and why should anyone care? Sinek claims that leaders who inspire, like Martin Luther King Jr. or the Wright brothers, all think, act and speak from the why first. People do not join a cause because of a list of features. They join because they share the belief and want to be part of something bigger than themselves. Sinek also shows what happens when the why is missing: groups fall back on tricks like discounts and pressure, and loyalty stays thin. For anyone leading a team or a ministry, this means purpose is not decoration. It is the heart of everything. It must be said clearly, lived every day and passed on to the next leaders.",
   "insights": [
    {
     "emoji": "🎯",
     "title": "The Golden Circle",
     "body": "Sinek draws three circles, one inside another. In the centre is Why: your purpose. Next is How: the special way you do things. On the outside is What: the things you actually do or sell. Every group knows its what. Some know their how. Very few can say their why. So most groups talk from the outside in, starting with what they offer.\n\nHis favourite example is Apple. A normal computer company might say: we make great computers, they are easy to use, do you want one? Sinek imagines Apple's message the other way round: everything we do challenges the normal way and thinks differently; we do this with beautiful, simple design; and we happen to make great computers. The facts are the same, but the order changes how people feel.\n\nBecause people knew what Apple believed, they were happy to buy music players and phones from a computer company. When other computer makers like Dell and Gateway tried to sell music players or televisions, people did not buy. Those companies were known only for their what.\n\nStart with what you believe. Then what you do becomes the proof of it, and it can grow into new forms without losing people."
    },
    {
     "emoji": "🧠",
     "title": "It matches the brain",
     "body": "Sinek says the Golden Circle is not just a nice idea. It matches how the human brain works. The newest, outer part of the brain handles facts, numbers and language. That lines up with What. The inner part, called the limbic brain, handles feelings, trust, loyalty and decisions. That lines up with Why and How. And the limbic brain does not use words.\n\nThis is why people often say a choice just feels right, even when the facts point another way. We decide with the feeling part and explain with the thinking part. Sinek gives a simple example. Ask people why they love their husband or wife, and they will say things like: she is kind, he makes me laugh. But many people are kind and funny, and we do not marry them all. The real reason is a feeling that is hard to put into words.\n\nThis also explains why simply asking people what they want does not always work. People cannot easily describe the feelings that drive their choices.\n\nSo if you only give people facts and features, they may understand you but not be moved. When you speak about your purpose, you reach the part of the brain that actually decides and commits."
    },
    {
     "emoji": "🎣",
     "title": "Inspire, don't manipulate",
     "body": "There are two ways to get people to act. You can manipulate them, or you can inspire them. Sinek lists common ways to manipulate: lower prices, special offers, fear, peer pressure, big promises and the excitement of something new. Think of an advert that promises a perfect body in six weeks, or one that warns something bad will happen if you do not buy. These tricks do work in the short term. That is why businesses use them so much.\n\nBut manipulation does not create loyalty. If a shop wins you only with a discount, you will leave the day someone else is cheaper. Sinek describes American car makers who offered cash discounts so often that customers would not buy a car without one. The tricks became a habit that was expensive and hard to stop.\n\nSinek says manipulation can be fine for a single deal, but it fails when you need people to stay. Inspired people behave differently. They stay even when it costs them more, or when a rival has a better offer, because they believe what you believe. They even speak up for you to others. That kind of loyalty is worth far more than any short-term trick."
    },
    {
     "emoji": "✈️",
     "title": "Purpose beats resources",
     "body": "In the early 1900s, Samuel Langley seemed sure to build the first powered airplane. He was a respected scientist with a senior post at the Smithsonian Institution, money from the US War Department, powerful friends and well-trained people. Newspapers followed his every move. Wilbur and Orville Wright had none of that. They paid for their dream with money from their bicycle shop, and nobody on their team had a college degree.\n\nThe difference was their why. Sinek says Langley wanted to be first and famous. The Wrights believed that flight could change the world. Their belief inspired the people around them, so their small team kept going through many failures and crashes at Kitty Hawk. On 17 December 1903, they flew, with only a few people there to see it. When Langley heard, he gave up, because he could not be famous for being second. He did not try to build on what the Wrights had done.\n\nA clear purpose can carry a small, poor team further than a rich team without one. Money and talent matter, but belief is what keeps people going when everything goes wrong."
    },
    {
     "emoji": "📈",
     "title": "Win the early believers",
     "body": "Sinek borrows an idea from a researcher named Everett Rogers, called the law of diffusion of innovations. When something new appears, people take it up in a certain order. First come the innovators and the early adopters, a small group who try new things because the idea matches what they believe. Next comes the large early majority, then the late majority, and last the laggards, who only change when they have no choice.\n\nThe early majority will not try something until they see that people they trust have tried it first. So Sinek says the key is to win the first fifteen to eighteen percent of people, the ones who share your belief. Once they are on board, the idea tips and spreads. He tells how TiVo had a brilliant product and plenty of money, but it sold its features to the mass market and struggled. It never told the early believers why it existed.\n\nMartin Luther King Jr. is his best example. In 1963, about a quarter of a million people came to Washington to hear him speak. Nobody sent them invitations. They came because they believed what he believed. He spoke about a dream, not a plan. Start with the people who share your why, and let them carry it."
    },
    {
     "emoji": "🔗",
     "title": "Clarity, discipline, consistency",
     "body": "Sinek says three things must work together. First, clarity of why: the leader must know, and be able to say, why the group exists. Second, discipline of how: the values and habits that guide the group must be lived every day, even when it is hard. Third, consistency of what: everything you say and do should prove what you believe.\n\nHe gives a practical tip for the how. Write your values as verbs, not nouns. Integrity is a nice word on a wall. Always do the right thing is something you can check yourself against each day.\n\nThis is how trust grows. People watch whether your actions match your words, again and again. Southwest Airlines is one of his examples. It set out to be the champion of the ordinary person, giving people who could not afford to fly the freedom to travel. Its low prices, simple service and fun attitude all pointed back to that purpose. Its leader, Herb Kelleher, believed that if the company cared for its staff, the staff would care for customers.\n\nWhen the what stops matching the why, people notice. They may not be able to explain it, but they feel it, and trust starts to fade."
    },
    {
     "emoji": "📣",
     "title": "Every dreamer needs a builder",
     "body": "Sinek observes that most people are either why-types or how-types. Why-types are visionaries. They see a future that others cannot see yet, and they have the energy to inspire. How-types are practical. They know how to build systems, make plans, organise people and turn a dream into something real. Sinek says most people are how-types, and that is a good thing. Many of the most successful how-types do their best work when they serve a vision they believe in.\n\nGreat organisations usually have both, working closely together. He points to Walt Disney, the dreamer, and his older brother Roy, who managed the money and built the company that made Walt's ideas possible. Apple had Steve Jobs, the visionary, alongside Steve Wozniak, the engineer who could build what Jobs imagined.\n\nSinek uses the picture of a megaphone. The leader at the top has the why, but a message needs a clear structure to carry it far and loud. That structure is made of how-people, systems and plans that all point the same way.\n\nSo do not look down on either kind of person. If you are a dreamer, find a builder you trust. If you are a builder, find a cause worth building for."
    },
    {
     "emoji": "🥬",
     "title": "The celery test",
     "body": "Imagine you go to a dinner party and people give you advice. Buy Oreos. Buy M&Ms. Buy rice milk. Buy celery. Each idea is good advice from someone, and each worked well for the person who said it. If you buy everything, you waste money, and nobody can tell what you stand for. But if you know your why is to be healthy, you buy only the rice milk and the celery.\n\nThen something else happens. Anyone who sees your shopping basket can tell at a glance what you value. Your choices make your belief visible, without a single word.\n\nSinek calls this the celery test. Use it whenever you face many options, ideas or opportunities. Ask: does this fit our why? Say yes to what fits, and no to the rest, even if the rest is popular or works well for others. This saves time and money, and it makes decisions faster, because you are not starting from zero each time.\n\nIt also helps people who are watching you. When your choices fit together, others can easily understand you, trust you and explain you to their friends. A clear why turns a long list of choices into one simple story."
    },
    {
     "emoji": "📉",
     "title": "When the why goes fuzzy",
     "body": "Sinek calls it a split. When an organisation is small, the founder's purpose is clear and everyone can feel it. As it grows, more systems and managers come in, and the why can get lost. People begin to focus only on what they do and how much they achieve.\n\nHe points to Walmart. Its founder, Sam Walton, deeply cared about ordinary people and their communities. After he died, the company kept chasing low prices but often lost that heart, and it faced scandals about how it treated workers and towns.\n\nSinek suggests a simple question he calls the school bus test. If the founder were suddenly gone, would the organisation keep going with the same purpose? If not, the why lives in one person, not in the group.\n\nSo leaders must keep the why alive on purpose. Tell the founding story again and again. Pass it on to new people. Hire people who believe what you believe, not only people with the right skills. Sinek admires the explorer Ernest Shackleton, whose job advert for a dangerous trip to Antarctica was honest about the cold and danger, so only people who shared the adventure applied. Growth is good, but only if the purpose grows too."
    }
   ],
   "tryThis": [
    "Write your personal 'why' in one sentence: 'To ___ so that ___.'",
    "Before your next announcement or recruiting talk, start with why it matters, then explain how and what.",
    "Look at one activity in your ministry and ask: does this clearly match our why?"
   ],
   "forUs": "YWAM has a strong why: to know God and to make Him known. But busy days on a base can make it fuzzy. Cleaning, cooking, paperwork and fixing the water pump can feel far from the mission. When we explain the why first, to DTS students, new staff or local partners, these tasks become part of the story. A meal cooked for students is part of making God known. Use the celery test before starting a new project: does it truly fit our calling here in Cambodia? It is fine to say no to good ideas that belong to someone else. Make sure every ministry, in Siem Reap and Poipet, can say its why in simple words, in both Khmer and English. Dreamers and builders need each other, and both are gifts to a team. When new staff arrive, tell the story of why GP began, and keep telling it. And remember that our deepest why is not our own idea. It comes from God's love for the people of Cambodia. People who share that belief will carry it further than any plan.",
   "oneLine": "Start with your purpose; it is what inspires people to follow.",
   "cover": {
    "bg": "paper",
    "fg": "ink",
    "a": "marigold",
    "b": "berry",
    "motif": "rings",
    "layout": "top",
    "font": "sans",
    "upper": true
   }
  },
  {
   "id": "boundaries",
   "title": "Boundaries",
   "author": "Henry Cloud & John Townsend",
   "year": 1992,
   "isbn": "9780310351801",
   "shelf": "people",
   "mins": 10,
   "vibe": "Saying 'no' can be one of the most loving words you ever say.",
   "bigIdea": "Do you feel guilty when you say no? Do you carry other people's problems as if they were your own? Christian psychologists Henry Cloud and John Townsend wrote for people like that. They open with a day in the life of a woman named Sherrie who cannot say no to her mother, her children, her boss or her church, and ends each day tired and resentful. She is a kind Christian woman who believes that being good means always saying yes. The authors' main idea is that a boundary is like a property line. It shows where you end and someone else begins. God made each of us responsible for our own heart, choices and feelings, but not for everyone else's. The book draws on the Bible, on how children grow, and on many years of counselling. It explains what boundaries are, where our boundary problems come from, and how to build healthy limits with family, friends, spouses, children, work, ourselves and even God. Healthy boundaries are not selfish. They are part of being a good steward of the life God gave you, so we can love freely, not out of fear or guilt.",
   "insights": [
    {
     "emoji": "🏡",
     "title": "Know your property line",
     "body": "Think of your life as a yard with a fence around it. Inside your yard are the things you own: your feelings, attitudes, behaviour, choices, values, thoughts, desires, limits and gifts. You are the one responsible for looking after them. Other people own what is inside their yard.\n\nThe authors put it in a short phrase: we are responsible to others, but responsible for ourselves. Being responsible to someone means we treat them with love, keep our promises and help where we can. Being responsible for someone means we take over what only they can do, like their choices or their mood.\n\nProblems start when we mix this up. We take responsibility for things that are not ours, like another adult's moods or choices. Or we let others take control of what is ours, like our time or our yes. Here is a simple everyday example: a friend is upset because you cannot lend them money. You can be kind about their feelings, but you do not have to fix them. Feelings like resentment are often a warning light that a line has been crossed.\n\nKnowing your property line is the first step. You cannot look after a yard if you do not know where it ends."
    },
    {
     "emoji": "🎒",
     "title": "Boulders and backpacks",
     "body": "Galatians 6 seems to say two opposite things. Verse 2 says to carry each other's burdens. Verse 5 says each person should carry their own load. The authors explain that the Greek words are different. A burden is like a boulder: a crisis too heavy for one person, like a serious illness, a death or a disaster. A load is like a backpack: the normal daily things each person must carry, like their own work, feelings and choices.\n\nLove helps with boulders. If a friend's house floods, we come and help. Refusing to help someone crushed by a boulder is not a healthy boundary; it is a lack of love. But if we carry someone's backpack every day, like always finishing their tasks or fixing their problems, they stay weak and we get crushed. They never learn to carry what God has given them.\n\nHere is a simple everyday example. A teammate's father dies, and the team covers her work for a few weeks. That is helping with a boulder. Another teammate is often late with his reports, and you quietly finish them for him every month. That is carrying his backpack.\n\nSo ask: is this a boulder or a backpack? The answer shows you when to step in and when to step back."
    },
    {
     "emoji": "🚪",
     "title": "Fences with gates, not walls",
     "body": "Some people hear the word boundaries and imagine a high wall that keeps everyone out. That is not what the authors mean. A healthy boundary is more like a fence with a gate. You let good things in, like love, support and wise advice. You keep harmful things out, like abuse, manipulation or someone's constant anger. You also let bad things out of your own yard, like confessing sin and releasing pain, instead of keeping them locked inside.\n\nBoundaries come in many forms. The most basic is your own skin, which shows where your body ends. Words, especially a clear no, are another. Telling the truth about what you think, and about what God says, is a boundary too. Distance can help, such as leaving a room when someone is shouting. Time can help, like taking a break from a hard relationship for a season. Other people can stand with you when you are too weak to hold a line alone. And natural consequences can show someone that you mean what you say.\n\nThe goal is not to be cold or closed. It is to have enough control over your gate that you can open it to love when it is safe, and close it when it is not."
    },
    {
     "emoji": "🧩",
     "title": "Four boundary problems",
     "body": "The authors describe four common patterns. 'Compliants' say yes to bad things. They cannot refuse, so they get pulled into things they should avoid, and they often feel guilty even thinking about saying no. 'Avoidants' say no to good things. They will not ask for help or let people in, even when they truly need it. 'Controllers' do not respect other people's no. Some push openly and hard; others use guilt and quiet pressure. 'Nonresponsives' do not hear the real needs of others, either because they are too busy with their own problems or because they look down on what others need.\n\nHere is a simple everyday example. A team member who takes every extra task and never refuses may be compliant. The person who keeps pushing tasks onto them may be a controller. The two can easily get stuck together in an unhealthy pattern.\n\nThe authors add a helpful difference. Some people have good boundaries with tasks but poor ones in relationships, or the other way round. Someone may be great at finishing projects, yet unable to tell a friend that something hurt.\n\nMost of us lean toward one or two of these patterns. Naming yours honestly is a humble and healthy first step toward change."
    },
    {
     "emoji": "👶",
     "title": "Boundaries start in childhood",
     "body": "Why do some people find boundaries so hard? The authors say we usually learn them, or fail to learn them, as children. Babies first need bonding: a safe, warm connection with the people who care for them. Only when a child feels securely loved can they start to become their own person.\n\nThen, step by step, children begin to separate. A toddler discovers the words no and mine. This can feel annoying to parents, but it is a healthy sign. The child is learning that they are a separate person with their own will. Wise parents allow the child's healthy no, while still keeping firm limits for the child's safety and growth.\n\nProblems come when this goes wrong. Some parents pull back their love when a child says no, so the child learns that having a boundary means losing love. Others get angry at every sign of independence. Some control too much, so the child never learns to choose. Others set no limits at all, so the child never learns to respect anyone else's no.\n\nThe good news is that it is never too late. The authors believe boundaries can be learned at any age, through safe relationships with God and with people who love us and accept our no."
    },
    {
     "emoji": "🌾",
     "title": "Let people reap what they sow",
     "body": "One of the book's laws of boundaries is the law of sowing and reaping. Our choices have results. But when someone always steps in to rescue us, the results land on them instead of us. The authors say the law is not broken, only interrupted. Someone else is reaping what we sowed.\n\nDr Cloud tells of parents who came to him worried about their grown-up son. He was drifting, with no steady job and no direction, and always needing money. They kept paying his bills and fixing his messes. Cloud told them he agreed there was a problem, but it was mainly theirs, not their son's. As long as they carried the pain of his choices, he felt no pain, so he had no reason to change. Cloud's advice was to stop paying for the son's problems, so the pain would move back to the person causing it.\n\nStepping back can feel unloving. But natural consequences are often a teacher God uses, and the Bible shows him letting his people face the results of their actions. Help in a real crisis, but do not stop people from learning. Sometimes the kindest thing you can do is let someone feel the weight of their own choices."
    },
    {
     "emoji": "🕊️",
     "title": "Say yes for the right reasons",
     "body": "Another law in the book is the law of motivation. The authors put it simply: freedom first, service second. If we help others only because we feel we have no choice, our giving is not real love. It is fear dressed up as kindness.\n\nThey list some false reasons we say yes. We fear losing someone's love, or we fear their anger. We are afraid of being lonely. We feel guilty and want to pay it off. We want something back, like approval or praise. Or we feel another person's loss so strongly that we cannot bear to let them be disappointed. Each of these can make us look very generous on the outside, while inside we are tired, afraid or resentful.\n\nHere is a simple everyday example. You agree to lead an extra meeting because you fear your leader will think less of you. You go, but you are angry the whole time. That anger is a sign the yes was not free.\n\nThe Bible says that God loves a cheerful giver, someone who gives by choice and not under pressure. When we know we are free to say no, our yes becomes a real gift. Look at your next yes and ask: am I choosing this out of love, or out of fear?"
    },
    {
     "emoji": "😤",
     "title": "Expect pushback",
     "body": "When you start setting boundaries, not everyone will clap. Some people will be angry, especially those who benefited from you having none. Others will use guilt, reminding you of all they have done for you. Some may pull away for a while. You may also feel resistance inside yourself, like fear of being alone, sadness about the past or old habits from childhood.\n\nThe authors say this does not mean you are wrong. They give a helpful test: is my boundary hurting this person, or harming them? Hurt is pain that can help someone grow, like the pain of hearing no. Harm is real damage. A boundary that causes hurt but not harm can still be loving. They also remind us that a boundary is about managing ourselves, not about controlling or punishing the other person. Their anger is theirs to deal with. It is not a sign that you must give in.\n\nStay kind, calm and clear. Do not fight back with anger, and do not keep explaining yourself again and again. Find supportive friends who will stand with you while you practise. Like any new skill, boundaries feel awkward at first, but they grow stronger with use."
    },
    {
     "emoji": "✝️",
     "title": "God has boundaries too",
     "body": "The authors show that boundaries come from God's own character. God is clear about who he is, what he loves and what he will not accept. He gives people real choices, and he lets them face the results of those choices, as he did with Adam and Eve in the garden.\n\nThink of the father in Jesus' story of the prodigal son. He did not chase his son or block the door. He let him go, and let him face hunger and loss. But his heart stayed open, and he ran to welcome him home when he returned.\n\nThe authors also write that our relationship with God works both ways. We are invited to be honest with him about what we feel and want, not to hide behind polite religious words. And we learn to respect his no, just as he respects ours. A relationship where both sides are real and free is a relationship where love can grow.\n\nGod respects our no, even when it grieves him. He does not force love. So healthy boundaries do not make us less loving. When we learn them, we are becoming more like the God who made us free and responsible, and who loves us enough to let us choose."
    }
   ],
   "tryThis": [
    "Notice one moment this week when you said yes but meant no. Write down what you were afraid of.",
    "Practise a short, kind no that offers what you can do instead, like: I can't this time, but I can help on Friday.",
    "Ask a friend for help with one real boulder instead of carrying it alone."
   ],
   "forUs": "On a mission base, the needs never stop. Someone always needs a ride, a meal, a talk or an extra hand, and it is easy to feel guilty for resting or saying no. Some of us grew up in cultures where saying no to an elder or leader feels impossible, and a direct no can feel rude. Others say no too quickly and keep everyone outside the fence. Staff from different cultures can learn from each other here: some know how to say no gently and with respect, and others know how to say it clearly. Talk as a team about what healthy boundaries look like, such as days off, sleep, family time and quiet evenings, so nobody has to fight for them alone. Leaders can protect their staff's limits instead of testing them, and show healthy rest in their own lives. In DTS, help students learn the difference between a boulder and a backpack, and to give their yes freely, not out of fear. Serving out of overflow lasts longer than serving out of exhaustion.",
   "oneLine": "Own your life, help with the boulders, and let love — not guilt — drive your yes.",
   "cover": {
    "bg": "teal",
    "fg": "paper",
    "a": "paper",
    "b": "marigold",
    "motif": "fence",
    "layout": "top",
    "font": "serif"
   }
  },
  {
   "id": "the-power-of-moments",
   "title": "The Power of Moments",
   "author": "Chip Heath & Dan Heath",
   "year": 2017,
   "isbn": "9781501147760",
   "shelf": "people",
   "mins": 10,
   "vibe": "Life is mostly ordinary days — so design the moments that people will never forget.",
   "bigIdea": "Think back on your life. What do you remember? Probably not ordinary Tuesdays, but a handful of moments: a first day, a wedding, a hard trip, a word of praise that changed you. Brothers Chip and Dan Heath, who teach and write about how people change and why some ideas stick, ask why some moments stay with us while others vanish. Their answer is that these defining moments are not just luck. We can create them on purpose. They found that memorable moments usually contain at least one of four elements: Elevation, Insight, Pride and Connection. Elevation lifts us above the everyday. Insight helps us see ourselves or the world in a new way. Pride captures us at our best. Connection ties us to other people. Teachers, managers, pastors and parents can all use these elements to turn ordinary experiences into ones people treasure. For anyone leading or serving, this book is a gentle reminder. People will forget most of what we planned, but they will remember how a few moments made them feel.",
   "insights": [
    {
     "emoji": "🏔️",
     "title": "Peaks and endings matter most",
     "body": "Psychologists have found that when people look back on an experience, they do not add up every minute. They mostly remember the peak, meaning the best or worst moment, and the ending. The middle fades away. This is called the peak-end rule. It helps explain why a family can wait in long lines at a theme park all day, yet come home remembering the best rides.\n\nThe Heaths give the example of the Magic Castle Hotel in Los Angeles. Its rooms are plain and its pool is small, yet guests rate it among the best hotels in the city. Why? It creates peaks. Beside the pool is a red phone on the wall. Pick it up and someone answers, 'Popsicle Hotline!' Minutes later a staff member wearing white gloves brings free ice pops on a silver tray. There is also a free snack menu and other small surprises.\n\nThe authors note that many organisations spend all their energy fixing small problems, and forget to create any peaks at all. Fixing problems matters, but it only makes things okay. It does not make them memorable.\n\nThe lesson: you do not need to make everything perfect. Many parts can simply be good. Put your energy into a few peaks, and make the ending strong."
    },
    {
     "emoji": "🚀",
     "title": "Elevation: break the script",
     "body": "Elevation moments lift us above the everyday. The Heaths say you can build them in three ways: make the senses come alive, raise the stakes, and break the script, which means doing something people do not expect.\n\nOne example is Signing Day at YES Prep, a group of schools in Houston that serve students from low-income families. Every spring, the graduating students stand on stage in front of a huge crowd and announce which college they will attend. Younger students watch, cheer and imagine their own future day. What could have been a letter in the mail becomes a celebration that students remember for years.\n\nAnother example is a high school where teachers turned the study of a novel into a full mock trial, with students acting as lawyers and witnesses. Because the stakes felt real, students worked harder than ever and never forgot it.\n\nThe authors warn that peaks are easy to lose. Sensible voices often say a special event costs too much, takes too long or is not really needed. Bit by bit, the moment gets squeezed out. But elevation does not need to be expensive. A small surprise, a ceremony or a celebration can make an ordinary day unforgettable, if someone cares enough to protect it."
    },
    {
     "emoji": "💡",
     "title": "Insight: trip over the truth",
     "body": "Some moments suddenly change how we see ourselves or the world. The Heaths say you can help these happen by letting people trip over the truth. This has three parts: a clear insight, packed into a short time, that people discover for themselves instead of being told.\n\nThey tell how Dr Kamal Kar helped villages in Bangladesh and other countries stop open defecation. Many groups had tried before, mostly by building toilets or giving lectures, and often it did not last. Kar's approach was different. His team walked with villagers to the places where people relieved themselves and asked simple questions. Later, they asked for a glass of drinking water, touched a hair to human waste, dipped it in the glass and offered it around. Nobody would drink. Then the villagers realised that flies were doing the same thing to their food every day. The shock came from their own discovery. Many villages decided to build toilets themselves.\n\nThe lesson for leaders is to explain less and show more. Long talks rarely change minds. A short, real experience where people see a problem with their own eyes can change them in minutes. Ask: how could the people I lead discover this truth for themselves?"
    },
    {
     "emoji": "🌱",
     "title": "Stretch: high standards, real support",
     "body": "The second path to insight is slower. The Heaths call it stretching: putting yourself, or others, in situations where failure is possible. When we stretch, we learn things about ourselves that we could never learn in comfort. We discover we are stronger, braver or more capable than we thought.\n\nGood mentors know this. They do not protect people from every hard task. Instead they give real responsibility, and they combine high standards with real support. The Heaths describe a study where teachers wrote comments on students' essays. Some students also got a short note saying the teacher had high standards and believed the student could reach them. Students who received this note were more likely to revise and improve their essays. The note did not lower the bar. It made the challenge feel possible.\n\nHere is a simple everyday example. A team leader asks a quiet young staff member to plan and lead a weekend event. The leader explains what good work looks like, checks in and stays nearby, but does not take over. The young person may make mistakes, yet they will likely discover gifts they did not know they had.\n\nStretching is uncomfortable, and it should be. But with the right support, the hard moment often becomes the defining one."
    },
    {
     "emoji": "🏅",
     "title": "Pride: celebrate the wins",
     "body": "We feel proud when others recognise us and when we reach milestones. The Heaths found a big gap here: many managers believe they often show appreciation, while most of their staff feel they rarely receive it. Praise that the giver forgets in a minute can stay with the person who receives it for years.\n\nGood recognition is personal and specific. It names exactly what someone did and why it mattered. A general good job is kind, but it is easy to forget. The authors also describe the gratitude letter from positive psychology. You write to someone who changed your life and read it to them in person. It becomes a powerful moment for both people.\n\nMilestones help too. Long goals can feel endless, so break them into smaller steps you can celebrate. Running programmes like Couch to 5K turn one big goal into weekly wins, and karate's coloured belts do the same. Each step is a small moment of pride that gives energy for the next one.\n\nThe Heaths suggest looking at any long journey and asking: where are the natural finish lines along the way? Then add a few of your own, and celebrate them when they come. People keep going when they can see that they are making progress."
    },
    {
     "emoji": "🦁",
     "title": "Practise courage before you need it",
     "body": "Some of our proudest moments come when we act bravely. The Heaths argue that courage is not only something you either have or lack. It can be practised, so that you are ready when the real test comes.\n\nTheir main example comes from the American civil rights movement. In Nashville, a minister named James Lawson ran workshops for students preparing to sit at whites-only lunch counters. The students role-played what might happen. Some acted as angry customers, shouting insults, blowing smoke and pushing. Others practised staying calm and peaceful. When the real sit-ins began, the students had already rehearsed their response many times. They stayed calm under terrible treatment, and their quiet courage helped change their country.\n\nThe Heaths also point to the way psychologists help people overcome strong fears, such as a fear of spiders. People move toward the fear in small steps, from looking at a picture to finally standing close to the real thing. Each small brave step makes the next one easier.\n\nFor us, practising courage might mean rehearsing a hard conversation with a friend before having it, or deciding ahead of time how we will respond when we are pressured to do wrong. Courage practised in small moments is ready for the big ones."
    },
    {
     "emoji": "🤝",
     "title": "Connection: share the moment",
     "body": "Moments become powerful when we share them. The Heaths name a few ways to build connection. One is to create a synchronised moment, where a group experiences something together at the same time, like a ceremony, a challenge or a celebration. Another is to invite a group into a shared struggle. People who work hard together toward a meaningful goal often become very close. A third is to connect people to meaning, reminding them why their work matters to real people.\n\nThe last way is about one-to-one relationships. Research on responsiveness shows that people feel close when they feel understood, valued and cared for. The authors describe hospitals where staff began asking patients 'What matters to you?' and not only 'What is the matter with you?' That simple question helped nurses and doctors see the person, not just the illness. It shaped how they cared for each patient, and patients felt truly heard.\n\nHere is a simple everyday example. A team that serves together through a long, hot week of outreach often feels closer than a team that only meets in an office. The shared effort becomes part of their story.\n\nConnection moments do not need big budgets. They need attention, presence and a reason to be together. Ask people what matters to them, and then really listen."
    },
    {
     "emoji": "🚪",
     "title": "Don't waste transitions",
     "body": "Some times in life naturally call for a moment. The Heaths point to three: transitions, like a first day, a graduation or a goodbye; milestones, like finishing a big project; and pits, the hard and painful times. Yet many organisations let these pass with paperwork and silence. Think of a typical first day at a new job: forms to fill in, a computer that is not ready, and a boss who is busy in meetings.\n\nThey describe how the tractor company John Deere redesigned the first day for new staff in Asia. Before you arrive, a friendly teammate contacts you. On the day, your name is on a welcome screen, your desk is ready, and you receive a small gift and a message from the company's leader about why the work matters. Your new friend takes you to lunch. You feel welcomed, not just processed.\n\nIn the pits, simply showing up for someone can become a moment they never forget. A visit, a meal or a short note when someone is sick or grieving often means more than any speech.\n\nLook at the transitions coming up and ask: how can we mark this, so people feel seen? A few minutes of planning can turn a forgettable day into one that shapes how someone feels for years."
    }
   ],
   "tryThis": [
    "Plan one small surprise for a teammate this week that breaks the normal routine.",
    "Write a short, specific thank-you note to someone, naming exactly what they did and why it mattered.",
    "Look at your calendar for the next month and find one transition you can turn into a moment."
   ],
   "forUs": "YWAM life is full of natural moments: a DTS student's first day, the send-off before outreach, the return, graduation, a new staff member arriving or a long-term worker leaving. These are gifts, so let's not rush past them. A new staff member's first day can feel like John Deere's: a friend who writes before they arrive, a clean room, a welcome sign with their name. Mix cultures in how we celebrate: Khmer hospitality, food and blessing alongside other traditions. Honour people in ways that fit them. For some, public praise feels great; for others, a quiet word means more. In teaching and outreach, let students discover truth for themselves, and stretch young leaders with real responsibility and steady support. Remember the pits too. When a teammate is sick, grieving or far from home, showing up matters. And many spiritual moments are also defining moments, like a night of worship or a breakthrough on outreach. Make space for God to meet people, and do not fill every minute with programme. The moments He creates are the ones we will remember most.",
   "oneLine": "Don't just wait for great moments — create them, especially at the peaks and transitions.",
   "cover": {
    "bg": "plum",
    "fg": "paper",
    "a": "marigold",
    "b": "paper",
    "motif": "spark",
    "layout": "top",
    "font": "sans"
   }
  },
  {
   "id": "the-advantage",
   "title": "The Advantage",
   "author": "Patrick Lencioni",
   "year": 2012,
   "isbn": "9780470941522",
   "shelf": "people",
   "mins": 10,
   "vibe": "Being smart is not enough. Healthy teams beat clever teams.",
   "bigIdea": "Most leaders spend their energy on being smart: strategy, marketing, finance and technology. Patrick Lencioni, a business consultant and the author of many popular books about teams, says this is only half the picture. The bigger advantage, and the one most groups ignore, is organisational health.\n\nA healthy organisation has little politics and little confusion. Morale is high, people get a lot done, and good people stay. Lencioni argues that health is simple, open to almost anyone, and costs no money. Yet leaders skip it, because it feels soft, takes courage and is hard to measure.\n\nHe offers four disciplines to get there. First, build a cohesive leadership team. Second, create clarity about a few big questions. Third, overcommunicate that clarity. Fourth, reinforce clarity in the everyday systems of the organisation. Running through all four is one simple tool that most groups already use badly: meetings.\n\nFor anyone leading a team, a school or a ministry, this is hopeful news. You do not need more money or cleverer people to make a real difference. You need leaders who are united, answers that are clear, and the discipline to keep saying and living those answers, month after month.",
   "insights": [
    {
     "emoji": "🩺",
     "title": "Health beats smarts",
     "body": "Lencioni compares a smart organisation with a healthy one. A smart one is good at strategy, marketing, finance and technology. A healthy one is whole: its people trust each other and are clear about what matters. The healthy one uses all the intelligence it already has. The unhealthy one wastes it through politics, confusion and mistrust.\n\nSo why do leaders ignore health? He names three biases. A sophistication bias: health seems too simple to be important. An adrenaline bias: leaders are too busy putting out fires to slow down. A quantification bias: health is hard to measure in numbers, so it feels less real than a budget.\n\nHere is a simple everyday example. Two teams have the same skills and the same money. In the first team, people hide problems and complain behind each other's backs. In the second, people speak openly and help each other. After a year, the second team is usually far ahead, even though it was not smarter at the start.\n\nHealth is the multiplier. Smart plans fail in an unhealthy team. A healthy team keeps getting smarter, because people speak up, learn from mistakes and work together. That is why Lencioni calls it the single greatest advantage any group can have."
    },
    {
     "emoji": "🤝",
     "title": "Step 1: Build a cohesive leadership team",
     "body": "The first discipline is to make the leadership team truly united. Lencioni uses the five behaviours from his earlier book on teams. Leaders build trust, where they can be open about weaknesses and mistakes. With trust, they can have healthy conflict, arguing honestly about ideas, not attacking people. Then they commit to decisions, even if they first disagreed. They hold each other accountable, peer to peer, not only through the boss. And they focus on shared results, not just their own department.\n\nHe also talks about the 'first team'. Leaders often feel more loyal to the team they lead than to the team of their peers. But the leadership team must come first. Otherwise each leader protects their own area, fights for their own budget, and the organisation splits into silos.\n\nLencioni adds that a leadership team should be small enough to talk openly. When it grows too big, people stop being honest with each other and start giving speeches instead.\n\nWhy does this come first? Because if the people at the top are divided, everyone below feels it. Staff notice when leaders send mixed messages, and they start choosing sides. No amount of clarity can fix a leadership team that does not trust itself."
    },
    {
     "emoji": "❓",
     "title": "Step 2: Create clarity",
     "body": "The second discipline is to get leaders fully aligned on six simple questions. Why do we exist? How do we behave? What do we do? How will we succeed? What is most important, right now? Who must do what?\n\nLencioni gives careful advice on each one. For example, on behaviour, he separates true core values from other kinds. Aspirational values are ones you wish you had but do not yet live. Permission-to-play values are just the minimum, like honesty, that every decent group needs. Accidental values grew without anyone choosing them, and they can be good or bad. Only a few real core values, usually two or three, should guide decisions, even when following them costs something.\n\nThe question about who must do what sounds simple, but it matters. Leaders agree clearly on each person's role on the leadership team, so nobody assumes someone else is handling a problem.\n\nThe answers do not need to be clever or polished. They need to be true, clear and agreed by the whole leadership team. When leaders answer these together, a lot of confusion lower down disappears, because people know what to do without asking every time. Clarity is a gift to the people you lead."
    },
    {
     "emoji": "🌅",
     "title": "Why do we exist?",
     "body": "The first of the six questions is about purpose. Lencioni says the answer should be idealistic. It is not about making money or growing bigger. It is about the deeper difference the organisation hopes to make in the world. He suggests leaders keep asking why, again and again, until they reach the real root of what they do.\n\nHe warns leaders not to treat purpose as a marketing exercise, something catchy for a poster or a website. A good purpose does not need to be unique, and it does not need to sound clever. It needs to be true, and the leaders need to believe it deeply enough to make decisions by it.\n\nHere is a simple everyday example. A small bakery might first say it exists to sell bread. If the owners keep asking why, they may find that what they really care about is giving families in their neighbourhood a warm place to meet. That deeper answer shapes how they treat customers and staff.\n\nPurpose matters because it gives people a reason to keep going on hard days. When everyone knows why the group exists, small tasks feel connected to something bigger, and decisions become easier to make."
    },
    {
     "emoji": "🎯",
     "title": "Have one top priority",
     "body": "The fifth question, what is most important right now, gets special attention. Lencioni calls the answer a thematic goal, or rallying cry. It is one single priority that the whole leadership team owns for a season, usually somewhere between three and twelve months. It is not a slogan. It is a shared focus.\n\nUnder the thematic goal are a few defining objectives, the concrete pieces that will achieve it. Alongside them are standard operating objectives, the ongoing work that must keep going, like finances, quality or caring for staff. These do not disappear, but they are not the main focus for this season.\n\nWhy only one? Because when everything is a priority, nothing is. Leaders of different departments each push their own needs, and staff get pulled in many directions. A single rallying cry gives everyone permission to say no to good things that do not serve the main thing right now.\n\nThe thematic goal should also be shared by every leader, not owned by one department. Even if one leader seems most connected to it, the whole team helps. This is where the first team becomes real: leaders put aside their own areas for a season to help the group win together."
    },
    {
     "emoji": "📒",
     "title": "Write it down in a playbook",
     "body": "Once the leaders have answered the six questions, Lencioni suggests putting the answers into one short document. He calls it a playbook. It is not a beautiful brochure or a long manual. It is a simple summary, often only a few pages, that leaders can look at again and again.\n\nThe playbook holds the purpose, the core values, a short description of what the organisation does, a few big commitments about how it will succeed, the current thematic goal with its objectives, and the main roles of each leader. Some parts, like the purpose and values, rarely change. Other parts, like the thematic goal, change every few months.\n\nHere is a simple everyday example. A new leader joins the leadership team. Instead of spending months guessing how things work, they read the playbook in an afternoon. They quickly understand what the group cares about and what the team is focused on right now.\n\nThe playbook helps leaders stay honest with themselves. In meetings, they can open it and ask whether a decision fits what they agreed. It also becomes the starting point for everything that comes next: the messages leaders repeat to staff, and the systems that build clarity into daily life."
    },
    {
     "emoji": "📣",
     "title": "Step 3: Overcommunicate clarity",
     "body": "Leaders often say something once and assume everyone understood. Lencioni says people need to hear a message many times, and in different ways, before they believe it is real. He suggests leaders see themselves as chief reminding officers. Repeating yourself is not boring. It is part of the job.\n\nLeaders often worry that staff will be tired of hearing the same thing. Lencioni says the opposite is usually true. Staff are more likely to doubt a message that they heard only once, because they wonder if leaders really mean it.\n\nHe also recommends cascading communication. At the end of a leadership meeting, the leaders agree together on the key messages to pass on. Then each leader shares the same message with their own team within a day or two. That way, staff in every part of the organisation hear the same thing, from their own leader, at about the same time. Staff can ask questions face to face, and leaders can bring the questions back.\n\nThis builds trust. People stop guessing what leaders really mean, and rumours have less room to grow. A message becomes real when people hear it from many directions, over months, not just once."
    },
    {
     "emoji": "⚙️",
     "title": "Step 4: Reinforce clarity",
     "body": "The fourth discipline is to build clarity into the everyday human systems, so it does not depend only on leaders reminding people. Lencioni points to hiring, welcoming new people, managing performance, rewards and recognition, and even letting people go.\n\nFor example, when hiring, use your core values to decide who fits, not only skills. When welcoming new people, teach them the answers to the six questions from the start, because the first weeks shape how people see everything later. When reviewing work, keep forms simple and focus on real conversations. When thanking people, praise behaviour that matches your values. And if someone keeps acting against the core values, have the courage to let them go.\n\nLencioni warns against too much structure. Systems should be simple and helpful, not heavy and full of paperwork. Their job is to make the right behaviour normal, so the culture holds even when leaders are busy.\n\nThink of it like the banks of a river. The water is the daily work of the organisation. The systems are the banks that keep the water flowing in the right direction. Without them, even good intentions spread out and become shallow. With them, clarity keeps moving forward without constant effort."
    },
    {
     "emoji": "🗓️",
     "title": "Meetings matter",
     "body": "Lencioni says meetings are where health is built or lost. Many meetings are boring and confusing because they mix everything together. He suggests four kinds.\n\nA daily check-in of about five minutes, often standing, to share what is happening today. A weekly tactical meeting that starts with a quick round of everyone's top priorities, then sets the agenda from what comes up, rather than from a list written days before. Topical meetings of a few hours to dig deep into one big strategic issue. And a quarterly review away from the office, to step back and look at the bigger picture, including how the team itself is doing.\n\nThe key is not to mix tactical and strategic topics. When you do, the urgent pushes out the important. If a big question comes up in the weekly meeting, it is better to set it aside for a separate topical meeting.\n\nGood meetings should also include healthy conflict. If nobody ever disagrees, the meeting is probably avoiding the real issues. Lencioni says the leader of a meeting should dig for disagreement and invite it, so that ideas are tested well. A meeting with honest debate is far more interesting, and far more useful, than a polite one."
    }
   ],
   "tryThis": [
    "Try answering the six questions for your ministry team in one sentence each, then compare your answers with a teammate.",
    "Agree with your team on one top priority for the next three months, and write it at the top of your next meeting notes.",
    "Pick one key message and repeat it clearly at least three times this week, in different settings."
   ],
   "forUs": "A YWAM base can have many ministries, each doing good work but not always pulling in the same direction. The cafe, the schools, community service and outreach can each become their own little world. Lencioni would say that leaders must see the base leadership as their first team.\n\nClarity helps everyone, especially staff working in a second language. Simple, repeated messages beat long, clever ones. A short playbook in both Khmer and English, with our purpose, values and current focus, could help new staff and students settle in faster.\n\nLeaders from different cultures may avoid conflict in different ways, so building trust is step one. Make room for honest disagreement in leadership meetings, in ways that feel safe for Khmer and international leaders alike. Sometimes that means asking for views one by one, or giving time to think before deciding.\n\nAsk your leaders the six questions together, and pray over the answers. Then choose one rallying cry for the season, like preparing well for the next DTS. Repeat it in base meetings, staff devotions and team check-ins. When the leadership team is united, the whole base feels safer and more peaceful, and our work becomes a clearer picture of the unity Jesus prayed for.",
   "oneLine": "Get your leaders united, get clear, say it again and again, and build it into how you work.",
   "cover": {
    "bg": "cobalt",
    "fg": "paper",
    "a": "marigold",
    "b": "paper",
    "motif": "arrowup",
    "layout": "top",
    "font": "sans",
    "upper": true
   }
  },
  {
   "id": "multipliers",
   "title": "Multipliers",
   "author": "Liz Wiseman (with Greg McKeown)",
   "year": 2010,
   "isbn": "9780061964398",
   "shelf": "people",
   "mins": 10,
   "vibe": "The best leaders don't make you feel small. They make you smarter.",
   "bigIdea": "Have you worked with one leader who made you feel smart, and another who made you feel small? Liz Wiseman, a former executive at Oracle who now trains leaders, studied this question through research on more than 150 leaders across four continents.\n\nShe found two kinds. 'Diminishers' drain intelligence and energy from the people around them. Deep down, they believe only they can figure things out, so they think, decide and talk for everyone. 'Multipliers' bring out more intelligence and effort than people knew they had. They believe people are smart and will work it out, so they ask, listen and stretch others.\n\nHer research found that Multipliers got roughly twice as much from their people as Diminishers did. That is like getting a whole second team without hiring anyone.\n\nThe difference is not mainly about skill or personality. It is about what a leader believes about others, and five habits, or disciplines, that grow from that belief. Wiseman also shows that many good-hearted leaders diminish people by accident.\n\nFor anyone leading a team, a school or a ministry, this is both a warning and an invitation. The people around you probably have far more to give. Your way of leading can either lock it away or set it free.",
   "insights": [
    {
     "emoji": "💭",
     "title": "It starts with what you believe",
     "body": "Wiseman says the biggest difference between Multipliers and Diminishers is not what they do, but what they believe about people. Diminishers quietly assume that people will not figure things out without them. So they hold on to decisions, give detailed instructions and stay at the centre of everything.\n\nMultipliers believe the opposite. They assume people are smart and will figure it out. They also believe intelligence keeps growing when people are given hard problems. So they ask more questions, give more space and expect more.\n\nThese beliefs are often hidden, even from the leader. A leader may say they trust the team, but their actions show something else. Wiseman encourages leaders to look honestly at their own assumptions, because behaviour follows belief.\n\nHere is a simple everyday example. Two teachers face a student who gets a maths problem wrong. The first teacher quickly shows the right answer, thinking the student cannot do it alone. The second asks a question that helps the student find the mistake. Both mean well. But only the second one believes the student can think.\n\nIf you want to change how you lead, start here. Ask yourself what you really believe about the people around you, and whether your daily habits show it."
    },
    {
     "emoji": "📈",
     "title": "More from the people you already have",
     "body": "Many leaders believe that to do more, they need more people or more money. Wiseman calls this the logic of addition. Multipliers use a different logic. They get much more out of the people they already have, because they use far more of each person's ability.\n\nIn her research, people said that Diminishers used only around half of what they could offer. Multipliers used almost all of it, and sometimes even more, because people grew while working for them.\n\nWiseman is clear that this does not mean Multipliers are soft or simply nice. Working for a Multiplier can be demanding. People are stretched and asked hard questions. But they describe it as energising, because they feel trusted and their work matters.\n\nHere is a simple everyday example. A small team is asked to run a big event. One leader says they cannot do it without five more helpers. Another leader looks at the team again, notices hidden skills, gives people real responsibility, and the event goes well without extra staff.\n\nThis matters for any group with few resources. Before asking for more, ask whether you are really using the gifts, ideas and energy of the people already in the room."
    },
    {
     "emoji": "🧲",
     "title": "Talent Magnet, not Empire Builder",
     "body": "Empire Builders gather talented people, but mainly to make themselves look strong. They hold on to resources, keep good people in a small box and underuse them. Talent Magnets attract talent and use it fully. People grow quickly around them, so more talented people want to join.\n\nWiseman describes four habits of a Talent Magnet. Look for talent everywhere, not only in the obvious places or in people with the right titles. Find each person's 'native genius', the thing they do easily, freely and well, often without even noticing. Use people to their fullest by connecting them with opportunities that fit that genius. And remove the blockers, including difficult people who hold the team back, and sometimes even yourself.\n\nNative genius is worth practising. Watch what someone does better than anything else, without being asked. Then tell them what you see. Many people are surprised, because the thing that is easy for them does not feel special.\n\nWhen people leave a Talent Magnet, they often move on to bigger roles. Good leaders see that as success, not loss. It builds a reputation as a place where people grow, and that attracts even more talent. A Talent Magnet is happy to be a stepping stone."
    },
    {
     "emoji": "🕊️",
     "title": "Liberator, not Tyrant",
     "body": "Tyrants create fear. People play it safe, hide mistakes and say what the boss wants to hear. Their best thinking stays locked away. Liberators create a calm, safe space where people can think, speak and try. But it is not a soft place. Liberators also expect people's best work. Safety and challenge go together.\n\nOne practical tool Wiseman shares is to talk less and listen more. Some leaders give themselves a few imaginary poker chips for a meeting. Every comment costs a chip, so they must choose carefully when to speak, which leaves room for others.\n\nLiberators also talk openly about their own mistakes. This shows people that failing and learning is normal. When the leader admits mistakes, others feel free to take risks, test new ideas and learn fast, without fear of being shamed.\n\nAt the same time, Liberators are honest about the quality of work. They do not pretend that weak work is good. They give clear feedback and ask for another try, because they believe people can do better.\n\nHere is a simple everyday example. A leader who calmly says this first draft is not ready yet, and asks what would make it great, helps far more than one who either shouts or says nothing at all."
    },
    {
     "emoji": "🧗",
     "title": "Challenger, not Know-It-All",
     "body": "Know-It-Alls think their job is to have all the answers. They give instructions and show off what they know, so the team stops thinking for itself. People learn to wait for the boss's opinion. Challengers think their job is to ask the right questions. They point to an opportunity that stretches people beyond what they believe they can do.\n\nWiseman describes three moves. Seed the opportunity: help people see a need or a challenge for themselves, instead of just telling them. Lay down a challenge: set a stretching goal and ask hard questions that you do not know the answer to. Generate belief: show that it is possible, perhaps by starting with a small win or a clear first step.\n\nHere is a simple everyday example. A leader wants the team to serve the neighbourhood better. Instead of handing out a plan, she takes the team for a walk to meet neighbours and then asks what they noticed and what they could do about it.\n\nA Challenger does not hand out the plan. A Challenger shows what is possible and asks how the team might get there. The team does the hard thinking, and grows through it. The ideas also belong to them, so they care more about making them work."
    },
    {
     "emoji": "🗣️",
     "title": "Debate Maker, not Decision Maker",
     "body": "Decision Makers decide alone or with a small inner circle. Everyone else hears about it later and has to guess why. Debate Makers bring the right people together to debate an important issue properly before a decision is made.\n\nWiseman describes three steps. Frame the issue: explain the question, why it matters and how the decision will be made. Spark the debate: ask for evidence, invite different views and make it safe to disagree, even with the leader. Drive a sound decision: be clear about who will decide, then explain the final choice and the reasons behind it.\n\nA good debate needs good questions. A Debate Maker might ask what the evidence shows, or what the other side of the argument might be. These questions move people away from opinions and towards careful thinking. The leader holds back their own view until others have spoken.\n\nNot every small decision needs a big debate. But for important ones, debate helps the leader learn what the team knows. It also builds ownership. People who helped think through a decision understand it, and they are much more likely to carry it out well, even if their own idea was not chosen. They know they were truly heard."
    },
    {
     "emoji": "🌱",
     "title": "Investor, not Micromanager",
     "body": "Micromanagers give someone a task, then jump back in, check every detail and take control when things get hard. Investors give real ownership and then support people to succeed.\n\nWiseman says they do three things. Define ownership: name who is in charge and give them the bigger part of the job. She describes giving someone 51 percent of the vote, so they know the final call is theirs. Invest resources: teach, coach and provide what they need. Hold people accountable: when they bring a problem, ask good questions and then give the problem back.\n\nThat giving back is the key. Many leaders take a problem off someone's desk just to be helpful. But then that person never grows. An Investor helps, and then makes clear that the problem still belongs to them, and that they believe they can solve it.\n\nInvestors also let natural consequences happen. If a project slips, they do not quietly fix it themselves. They let the owner feel the result, learn from it and try again, while still offering support.\n\nHere is a simple everyday example. A team member asks what colour the event posters should be. Instead of answering, the leader asks what they think would work best, and then backs their choice."
    },
    {
     "emoji": "🙈",
     "title": "Watch for accidental diminishing",
     "body": "This may be the most humbling part of the book. Many Diminishers do not mean to diminish anyone. They have good hearts and good intentions. Wiseman calls them accidental Diminishers.\n\nHere are some examples she describes. The idea person has so many ideas that the team cannot keep up and stops offering their own. The leader who is always on, full of energy and talk, leaves little space for others. The rescuer jumps in so quickly to help that people never learn to solve hard things. The pacesetter moves so fast that others give up trying to keep up. Even a constant optimist can make people feel their real worries are not heard.\n\nWhat makes these patterns tricky is that they often grow from strengths. Energy, ideas, kindness and speed are good things. But when they fill the room, other people shrink.\n\nThe fix is often simple. Talk less, ask more and wait longer. Ask your team honestly how your style affects them, and listen without defending yourself. You might also tell your team which habit you are working on, and invite them to point it out. Most leaders can grow toward being Multipliers with practice."
    },
    {
     "emoji": "🪜",
     "title": "Becoming a Multiplier, one step at a time",
     "body": "Wiseman does not expect anyone to change everything at once. She gives practical advice for growing as a Multiplier, step by step.\n\nFirst, start with your beliefs. Behaviour changes more easily when you truly believe people are smart and capable. Second, work the extremes. Look at the five disciplines and pick one where you are already fairly strong, to make it even stronger. Then pick the one where you are weakest, and work to bring it up to a reasonable level. Third, choose one small practice and try it for about thirty days, long enough for it to become a habit.\n\nShe also encourages patience. Old habits come back, especially under stress. That is normal. What matters is noticing, learning and trying again. Asking a friend or colleague to watch you and give honest feedback can help a lot.\n\nHere is a simple everyday example. A leader who usually speaks first in every meeting decides that for one month, she will speak last. At first it feels strange. But slowly her team starts sharing more, and she discovers ideas she never knew they had.\n\nSmall changes like this, repeated over time, can transform a team. The journey from Diminisher to Multiplier is open to everyone."
    }
   ],
   "tryThis": [
    "In your next meeting, ask questions instead of giving your opinion first, and speak last if you can.",
    "Give one task fully to a teammate, and resist the urge to take it back, even if it gets hard.",
    "Write down one person's native genius, the thing they do easily and well, and tell them what you see."
   ],
   "forUs": "On a mission base, older or more experienced staff can easily become the answer people without meaning to. We love to help, and we often have years of experience. But if we always solve the problem, others never learn to think it through.\n\nIn Khmer culture, younger staff may stay quiet out of respect, so leaders need to invite ideas on purpose. Maybe ask in small groups or one-to-one rather than in front of everyone, or give people time to think before answering. International staff may need to slow down and listen longer than feels natural.\n\nLook for the native genius in each staff member and student, not only the gifts that are easy to see. The quiet cook, the student who notices everyone, the driver who knows every village: these are gifts too. Hand real responsibility to local staff and students, and when they bring a problem, gently give it back with your support.\n\nWatch for accidental diminishing too, like rescuing too fast or talking too much in worship team or school meetings. Jesus did the opposite with his disciples. He asked good questions, sent them out before they felt ready, and trusted them to grow. We can lead the same way.",
   "oneLine": "Lead in a way that makes others smarter, braver and more capable — not more dependent on you.",
   "cover": {
    "bg": "berry",
    "fg": "paper",
    "a": "marigold",
    "b": "paper",
    "motif": "multiply",
    "layout": "top",
    "font": "sans",
    "upper": true
   }
  },
  {
   "id": "crucial-conversations",
   "title": "Crucial Conversations",
   "author": "Kerry Patterson, Joseph Grenny, Ron McMillan & Al Switzler",
   "year": 2002,
   "isbn": "9780071401944",
   "shelf": "people",
   "mins": 10,
   "vibe": "When it matters most, most of us do our worst talking. You can learn to do better.",
   "bigIdea": "Some conversations matter much more than others. The authors call them crucial conversations: talks where the stakes are high, opinions differ and emotions are strong. Think of asking a leader to change a decision, giving hard feedback to a friend, or talking with your spouse about money.\n\nSadly, these are the moments when most of us do our worst. We either go quiet and avoid the issue, or we push, attack or try to control. Then we live with the results: poor decisions, broken trust and problems that keep coming back.\n\nThe authors, a team of researchers and trainers who have taught these skills to people around the world, studied people who handle these moments well. They found that these people were not just born that way. They use skills that anyone can learn.\n\nThe goal is dialogue: a free and honest flow of meaning between people. The book walks through the skills step by step. Know what you really want. Notice when people stop feeling safe, and make it safe again. Manage the stories in your own head. Speak and listen with care. Then turn talk into action.\n\nBetter dialogue leads to better decisions, stronger teams and healthier relationships, at work, at home and in ministry.",
   "insights": [
    {
     "emoji": "📌",
     "title": "Why these moments matter so much",
     "body": "The authors begin by showing how much rides on a few key conversations. A relationship, a team or a project can go well or badly depending on how people handle a handful of hard talks. Many problems that seem big and complicated are really conversations that never happened, or happened badly.\n\nThey noticed something in their research. When they asked people in organisations to name the colleagues who really got things done, the people named were often not the ones with the biggest titles. They were the ones who could speak up well when the stakes were high. In one story, a manager they call Kevin calmly raised a concern about his boss's plan in a meeting where others stayed silent, and the group made a better choice.\n\nWhy is it so hard? The authors explain that our bodies are not built for these moments. When we feel threatened, adrenaline rushes in and our body prepares to fight or run. Blood goes to our arms and legs, and less goes to the parts of the brain we need for careful thinking.\n\nSo in the moments that matter most, we are often at our least wise. The good news is that skills can help us stay calm, honest and kind anyway."
    },
    {
     "emoji": "🏊",
     "title": "Fill the 'pool of shared meaning'",
     "body": "Everyone comes to a conversation with their own facts, feelings, ideas and experiences. The authors call this a person's meaning. Dialogue happens when each person adds their meaning to a shared pool. The bigger and fuller the pool, the better the decisions the group can make.\n\nWhen people stay silent or try to force their view, important meaning stays out of the pool. Decisions are then made with half the information. People also commit less, because they never felt heard. They may agree in the meeting and then quietly resist later.\n\nHere is a simple everyday example. A team plans an outreach trip. One member knows a road floods in the rainy season, but stays quiet because the leader seems so sure. The team goes anyway and gets stuck. The information existed; it just never reached the pool.\n\nThe pool also includes feelings and opinions, not only facts. If a team member feels worried or unhappy about a plan, that is useful meaning too. A wise leader wants to hear it.\n\nWhen everything is in the pool, people act with more unity, because they own the decision together. Even if they did not get their way, they know their view was considered."
    },
    {
     "emoji": "❤️",
     "title": "Start with heart",
     "body": "The first skill is about yourself, not the other person. The authors say the only person you can really control is you. In a heated moment, our motives slowly change without us noticing. We start wanting to win, to punish, to look good or to keep the peace at any cost.\n\nSo before and during a crucial conversation, ask yourself some questions. What do I really want for myself? What do I really want for the other person? What do I really want for our relationship? And how would I behave if I truly wanted these things?\n\nThe authors also warn against the 'fool's choice'. This is the belief that you must choose between being honest and being kind, or between speaking up and keeping a friend. Skilled people refuse that choice. They look for a way to be completely honest and fully respectful at the same time. They ask themselves what they want, what they do not want, and how they could get both.\n\nHere is a simple everyday example. You are upset that a roommate keeps leaving dishes in the sink. You can stay silent, or you can complain sharply. Starting with heart helps you find a third way: an honest, friendly talk that keeps the friendship strong."
    },
    {
     "emoji": "👀",
     "title": "Watch for safety",
     "body": "While people talk, skilled people watch two things at once: the content of the conversation and the conditions. The key condition is safety. When people feel unsafe, they move to silence or violence.\n\nSilence can look like masking (hiding real feelings or using sarcasm), avoiding (changing the subject) or withdrawing (leaving the conversation completely). Violence can look like controlling (forcing your view or talking over people), labelling (putting people in boxes) or attacking (insulting or threatening).\n\nIt also helps to notice when a normal conversation suddenly becomes crucial. Watch for signs in your body, like a tight stomach or a hot face. Watch your emotions, like fear or anger. And watch your behaviour, like raising your voice or going very quiet.\n\nThe authors also ask you to look at yourself. Each of us has a style under stress, a usual way we react when things heat up. Some of us go quiet; some of us get loud. Knowing yours helps you catch it early, before it does damage.\n\nWhen you notice silence or violence, take it as a signal, not an attack. Step out of the topic for a moment and rebuild safety before going on. The problem is usually not the topic, but the fear underneath it."
    },
    {
     "emoji": "🛡️",
     "title": "Make it safe",
     "body": "Safety rests on two things. Mutual purpose: the other person believes you care about their goals, not just your own. Mutual respect: they believe you respect them as a person. If either one is missing, the conversation quickly turns defensive.\n\nThe authors give practical tools. If you have truly hurt someone, apologise sincerely. If someone has misunderstood your purpose, use contrasting: first say what you do not mean, then what you do mean. For example, you might say you do not think their work is poor, because it is good, and you only want to talk about one missed deadline.\n\nWhen goals really clash, commit to finding a shared purpose. The authors describe four moves. Commit to keep talking until you find something you both want. Recognise the deeper purpose behind each person's demand. Invent a mutual purpose that you can both agree on. Then brainstorm new options together.\n\nHere is a simple everyday example. A couple argue about where to spend the holidays. The deeper goal for both might be a restful break and time with people they love. Once they see that, new options appear.\n\nOften both people want the same deeper thing, even when their first ideas look opposite."
    },
    {
     "emoji": "📖",
     "title": "Master your stories",
     "body": "The authors describe a path to action. We see or hear something. We quickly tell ourselves a story about what it means. That story creates a feeling, and the feeling drives what we do. We often say other people make us angry, but really it is the story we told ourselves.\n\nIn one example, a woman's coworker presents their shared project to the boss without her. She quickly decides he is stealing the credit, feels angry and starts acting coldly toward him. But she does not yet know the facts.\n\nWatch for three clever stories. The victim story says it is not my fault. The villain story says they are bad and want to hurt me. The helpless story says there is nothing I can do. These stories feel true, and they let us off the hook, but they keep us stuck.\n\nTo get back to the truth, retrace your path. Separate the facts, the things you actually saw or heard, from your story about them. Then tell the rest of the story. Ask what your own part in the problem might be. Ask why a reasonable, decent person might do this. And ask what you really want, and what you would do right now if you really wanted it."
    },
    {
     "emoji": "🧭",
     "title": "Speak honestly, listen deeply",
     "body": "When it is your turn to speak about something sensitive, the authors offer five steps. Share your facts, the least controversial part. Tell your story, what you are starting to conclude. Ask for the other person's view. Talk tentatively, as a possible story, not a final truth. And encourage them to test your view or disagree.\n\nThis order matters. Facts are easier to accept than conclusions, so starting with them builds safety. Being tentative is not being weak. It simply admits that you might be missing something.\n\nWhen it is your turn to listen, be truly curious. Ask questions. Mirror their feelings by gently naming what you notice, for example that they seem upset. Paraphrase what they said in your own words, to check you understood. If they are still silent, you can prime them by kindly guessing what they might be thinking, to show it is safe to say it.\n\nHere is a simple everyday example. Instead of telling a teammate they do not care about the team, you might say that they have missed the last three meetings, that you are starting to wonder if something is wrong, and then ask how they see it. The door stays open for a real conversation."
    },
    {
     "emoji": "🧱",
     "title": "Agree, build, compare",
     "body": "Once you have listened well, it is time to share your own view. The authors notice that many arguments are not real disagreements at all. People often agree on most things but fight over a small difference, because they focus only on where they differ.\n\nSo they suggest a simple pattern: agree, build, compare. First, agree where you do agree. Say it out loud, so the other person knows you see the common ground. Second, build. If the other person is right but has left something out, do not say they are wrong. Agree with what they said, then add the missing piece. Third, compare. If you truly see it differently, do not announce that they are wrong. Instead, explain that you see it differently, share your view, and compare the two views together.\n\nHere is a simple everyday example. A teammate says the event should start at six because people finish work then. You agree people finish work then. You build by adding that many families eat dinner at six. Then you compare ideas and settle on seven together.\n\nThis pattern keeps the conversation calm and respectful. It shows that you are trying to understand, not to win. It also helps the group find the best answer, which often combines ideas from both sides."
    },
    {
     "emoji": "✅",
     "title": "Move to action",
     "body": "Dialogue is not the same as decision making. Filling the pool of meaning is only half the job. Many good conversations fail simply because nobody leaves knowing what was decided or what comes next.\n\nFirst, be clear about how the decision will be made. The authors describe four ways. Command: someone else decides, or the group hands the decision to one person. Consult: the leader gathers ideas from others, then decides. Vote: the group chooses between clear options. Consensus: everyone talks until they all honestly agree. Each one fits different situations. To choose, ask who cares about this decision, who knows the most, who must agree for it to work, and how many people really need to be involved.\n\nThen agree clearly on the details. Who will do it? What exactly will they do? By when? And how and when will you follow up? The authors say to write these down, so that memories do not change later.\n\nHere is a simple everyday example. A team talks for an hour about fixing the meeting room. Everyone agrees it needs work, but nobody is named to do it. A month later, nothing has changed.\n\nClear next steps turn good talk into real change, and they build trust for the next hard conversation."
    }
   ],
   "tryThis": [
    "Before a hard talk, write down what you really want for you, for them and for the relationship.",
    "Next time you feel upset, separate the facts from the story you are telling yourself.",
    "Practise one contrasting sentence: 'I don't want ___. I do want ___.'"
   ],
   "forUs": "Across cultures, crucial conversations look different. Many Khmer staff prefer indirect, private conversations that protect face, while some international staff are very direct. Neither is wrong, but each can make the other feel unsafe. Choose the right setting, start with respect, and maybe use a trusted go-between when that fits.\n\nSilence can look like agreement when it is not. A smile and a nod may mean I hear you, not I agree. So gently check understanding, especially when people are speaking in a second language. Ask open questions and give time, rather than asking if everyone agrees.\n\nIn DTS and on outreach teams, tension often builds quietly, over small things like chores, money or schedules. Name it early and kindly, before it grows. Leaders can model this by inviting feedback on their own leadership.\n\nCheck your stories before you act on them, especially across cultures. What looks rude in one culture may be normal in another. Ask why a good person might act this way. And after a hard conversation, agree clearly on who will do what, so good talk becomes real change.\n\nSpeaking the truth in love, as Paul writes in Ephesians, is exactly what this book is trying to teach. Pray before a crucial conversation, and go in with a soft heart.",
   "oneLine": "Make it safe, check your story, and keep talking honestly when it matters most.",
   "cover": {
    "bg": "cobalt",
    "fg": "paper",
    "a": "marigold",
    "b": "paper",
    "motif": "bubbles",
    "layout": "top",
    "font": "sans"
   }
  },
  {
   "id": "the-ideal-team-player",
   "title": "The Ideal Team Player",
   "author": "Patrick Lencioni",
   "year": 2016,
   "isbn": "9781119209591",
   "shelf": "people",
   "mins": 10,
   "vibe": "Great teammates are humble, hungry and people smart — all three at once.",
   "bigIdea": "Patrick Lencioni, a consultant who has spent many years helping leadership teams work together, tells most of this book as a story. Jeff Shanley leaves a job in Silicon Valley to lead his uncle Bob's construction company in Napa Valley, California, as Bob steps back for health reasons.\n\nJeff soon learns that the company has two big new projects coming, and not enough strong team players to deliver them. The company has always said teamwork matters. But saying it is not the same as hiring and growing people who can actually live it.\n\nWorking with Clare, who leads the people side of the company, and Bobby, who runs the building work, Jeff asks a simple question. Why are some people great teammates, while others make teamwork hard? Together they discover three virtues: humble, hungry and smart, meaning people smart. When someone has all three, teamwork comes much more easily. When even one is missing, problems appear.\n\nAfter the story, Lencioni explains the model and how to use it in hiring, coaching current staff and building a healthy culture. For anyone who leads or serves on a team, it offers three simple words to look for in others, and to grow in yourself.",
   "insights": [
    {
     "emoji": "🧩",
     "title": "Teamwork is a choice",
     "body": "Lencioni starts with a strong claim. Teamwork is not something that just happens because people are nice or work in the same place. It is a choice that leaders and organisations make on purpose, and it takes real commitment to keep it.\n\nMany organisations say they value teamwork. It is on their walls and in their mission statements. But when it comes to hiring, rewards and daily decisions, they act as if individual stars matter more. Lencioni says that if you truly choose teamwork, you need people who are able to be good team members, and you need to know what that looks like.\n\nThis is where the three virtues come in. They give leaders a clear and simple picture of the kind of person who makes teamwork work. Without that picture, people talk about being a team player in vague ways, and nobody knows exactly what is expected.\n\nHere is a simple everyday example. A football team says it values passing and working together. But if the coach only praises the player who scores, everyone will start keeping the ball for themselves.\n\nIf your team really wants to work together, decide it clearly, and then look for and grow people who can make it real."
    },
    {
     "emoji": "🙇",
     "title": "Humble",
     "body": "Lencioni sees humility as the most important of the three virtues. Humble team players care more about the team than about their own image. They share credit, point to the group's success and praise others easily. They are not afraid to admit when they are wrong, and they do not need to be the centre of attention.\n\nHe warns about two problems. The first is obvious: arrogance, where people make everything about themselves. The second is quieter: people who put themselves down so much that they do not share their gifts or speak up. They may look humble, but they still keep the focus on themselves, and the team loses what they could give.\n\nA simple everyday example: after a successful event, a humble team member talks about what the team did and thanks the people who worked behind the scenes. If someone praises them, they accept it simply and point to others who helped.\n\nReal humility means seeing your gifts clearly, and using them for others. That is why Lencioni places it first. A team full of people who care about the group more than their own image is a team where trust can grow, and where the other two virtues can be used for good."
    },
    {
     "emoji": "🔥",
     "title": "Hungry",
     "body": "Hungry people are self-motivated and hard-working. They always want to learn more, do more and take on more responsibility. They do not need a manager to push them. They think about the next step and how they can help the team move forward.\n\nBut Lencioni is careful here. Hunger can become unhealthy if it is all about personal success, or if it turns into overwork that harms health and family. Healthy hunger is for the team's mission, not just for one person's career.\n\nHere is a simple everyday example. Two staff members notice the kitchen is a mess after an event. One walks past because it is not their job. The other quietly starts cleaning and asks a friend to help. The second person shows healthy hunger.\n\nHunger also shows in small things: coming prepared, following up and caring about results as if they were your own. Hungry people rarely need reminders. They look for what still needs doing, and they do it.\n\nHungry people make a team stronger because they lift the pace for everyone. When one person cares deeply about the mission, others often catch it. But leaders should protect them too, by helping them rest and by making sure their energy serves the team, not just their own goals."
    },
    {
     "emoji": "🧠",
     "title": "People smart",
     "body": "This kind of smart is not about IQ or education. It is common sense about people. People-smart team players read a room well. They notice how others feel, listen carefully and understand how their words and actions affect people. They know when to speak, when to stay quiet and how to say hard things in a way that can be heard.\n\nLencioni says this is similar to emotional intelligence, but simpler and more practical. Someone can be very clever and still weak in this area. They may say something true at the wrong moment, or miss that a teammate is struggling.\n\nHere is a simple everyday example. In a team meeting, one person notices that a new member has not said anything. Instead of putting them on the spot, they quietly ask for their opinion during the break, and later help them share it with the group.\n\nIn a team, people smarts helps the other two virtues work well. A humble, hungry person without people smarts can still cause hurt and confusion without meaning to. People-smart teammates help others feel respected, and that helps trust grow across the whole team. They also make hard conversations easier, because they know how to deliver honest words with care."
    },
    {
     "emoji": "⚠️",
     "title": "Missing one virtue is a problem",
     "body": "Lencioni describes what happens when people have only one or two of the virtues. He pictures the three virtues as overlapping circles, with the ideal team player in the middle where all three meet.\n\nWith only one virtue, the problems are easy to see. The 'pawn' is only humble and often gets left out. The 'bulldozer' is only hungry and pushes everyone aside. The 'charmer' is only smart and is fun to be with, but adds little.\n\nWith two virtues, the problems are harder to spot. Humble and hungry but not smart is the 'accidental mess-maker', who means well but leaves hurt feelings behind. Humble and smart but not hungry is the 'lovable slacker', who is pleasant but only does what is asked. Hungry and smart but not humble is the 'skillful politician', who is clever and ambitious but serves themselves.\n\nThe politician is the most dangerous, because they look great to leaders. They know how to say the right things and appear helpful. Watch how they treat people who cannot help their career.\n\nThese labels are not for judging people. They help leaders and teammates name a problem clearly, so they can talk about it and help someone grow."
    },
    {
     "emoji": "🔗",
     "title": "The virtues make teamwork easier",
     "body": "Lencioni connects this book to his earlier work on teams. In that book, he describes five behaviours of a strong team: trust, healthy conflict, commitment, accountability and a focus on results. Here, he explains that people with the three virtues find those behaviours much easier.\n\nHumble people can admit mistakes and weaknesses, which builds trust. They can disagree about ideas without making it personal. They can commit to a decision even if their own idea was not chosen. Hungry people do not want the team to accept low standards, so they are more willing to hold others accountable and to care about results. People-smart teammates know how to do all of this with tact, so that honest words do not cause unnecessary hurt.\n\nHere is a simple everyday example. A team leader asks for honest feedback on a plan. A humble person admits the part they are unsure about. A hungry person points out that the plan is not ambitious enough. A people-smart person helps the group discuss both points kindly.\n\nThis matters because many teams try to learn teamwork skills without the right people. Lencioni suggests that when you hire and grow people with the three virtues, the work of building a healthy team becomes far simpler."
    },
    {
     "emoji": "🔎",
     "title": "Hire for the three virtues",
     "body": "Lencioni gives practical advice for interviews. Ask questions that reveal the virtues, not only skills. For humility, ask about their biggest achievement and their biggest mistake, and notice whether they say I or we. For hunger, ask about the hardest they have ever worked. For people smarts, ask how others would describe them.\n\nIf an answer is vague, ask the same question again in a different way. Interview as a team, then compare notes quickly afterwards, rather than each interviewer deciding alone. Spend time together outside the formal interview, like sharing a meal or running errands, and watch how they treat a waiter or a stranger. You can even ask candidates to do some real work with the team.\n\nHe also suggests being very honest about what your team expects. People without these virtues often decide not to join once they hear how much humility and hard work the culture requires. That is a good outcome for everyone.\n\nThe goal is not to trick anyone. It is to see the real person, beyond a polished first impression, so both the team and the candidate can make a wise choice. A careful extra conversation costs little compared with a poor fit."
    },
    {
     "emoji": "🌱",
     "title": "Everyone can grow",
     "body": "Lencioni insists the three virtues are not fixed personality traits. They are habits that people can learn through honest feedback, coaching and practice. He suggests leaders use the model with current staff too, not only new hires. A simple self-assessment asks people to rate how often they show behaviours connected to each virtue.\n\nWhen someone is weak in one virtue, the leader's job is to name it kindly and clearly, and then help them grow. Regular reminders, honest conversations and real examples all help. For example, someone weak in humility might practise praising others and admitting mistakes. Someone weak in people smarts might learn to watch how others react, and ask a friend for honest feedback after meetings.\n\nIf a person truly will not change after real effort, they often discover the team is not a good fit for them. That can be a kind and honest outcome, for them and for the team.\n\nLeaders must also model all three themselves. If a leader is proud, lazy or careless with people, the virtues become empty words. When leaders live them, the whole culture shifts, and people begin to expect them from one another."
    },
    {
     "emoji": "📢",
     "title": "Make it part of the culture",
     "body": "Lencioni says the model works best when it becomes part of everyday life, not just an interview tool or a training day. Leaders should talk about the three virtues openly and often, so everyone knows that being humble, hungry and people smart really matters here.\n\nHe encourages leaders to notice the virtues in action and say so. When someone shows humility, hunger or people smarts, point it out and thank them, sometimes in front of others. When someone falls short, mention it quickly and kindly, rather than waiting for a yearly review. Over time, these small moments teach the whole team what good teamwork looks like.\n\nIn the story, Jeff, Clare and Bobby use the three words when they talk with staff, and when they make decisions about the people on their teams. The words become a shared language across the company.\n\nHere is a simple everyday example. At the end of a busy week, a team leader thanks one member for quietly staying late to finish a job. Everyone hears it, and everyone learns what the team values.\n\nWhen these three words become normal in daily conversations, the culture starts to protect itself. People hold each other to the standard, not only the leader."
    }
   ],
   "tryThis": [
    "Rate yourself from 1 to 3 on humble, hungry and smart. Which is your weakest?",
    "Ask a trusted teammate which of the three virtues they see most and least in you.",
    "Thank one teammate this week by name for a moment when they showed humility, hunger or people smarts."
   ],
   "forUs": "Humility is already a core value in YWAM and in Khmer culture, which is a great start. But humility without hunger can turn into waiting to be told. And hunger without people smarts can feel pushy, especially across cultures.\n\nPeople smarts also means learning what respect looks like for someone from a different background, like how to greet an elder, when to speak directly and when to talk privately. International staff may need to learn this slowly and humbly. Khmer staff can be great teachers here.\n\nUse these three words when inviting new staff, building outreach teams and coaching DTS students. They are simple enough to remember in Khmer and English. In the cafe or on a community service team, they can guide how we work and how we give feedback.\n\nRemember that the virtues can grow. A shy student may become a confident, humble leader. A hard worker may learn to slow down and notice people. Leaders can name these virtues when they see them, and gently coach when they are missing.\n\nLeaders can model them first, by serving quietly and asking for feedback. Jesus showed all three: he served humbly, worked with purpose and understood people deeply. As we follow him, we become better teammates too.",
   "oneLine": "Look for — and become — someone who is humble, hungry and people smart.",
   "cover": {
    "bg": "paper",
    "fg": "ink",
    "a": "cobalt",
    "b": "marigold",
    "c": "berry",
    "motif": "venn3",
    "layout": "top",
    "font": "serif"
   }
  },
  {
   "id": "atomic-habits",
   "title": "Atomic Habits",
   "author": "James Clear",
   "year": 2018,
   "isbn": "9780735211292",
   "shelf": "habits",
   "mins": 10,
   "vibe": "Tiny changes, wild results. You don't rise to your goals — you fall to your systems.",
   "bigIdea": "Most of us try to change our lives with big goals and a lot of willpower. We start strong, and a few weeks later we are back to our old ways. James Clear says the problem is usually not you. The problem is your system. Clear is a writer who studies habits, and his interest is personal: after a bad injury as a young sports player, small daily habits helped him rebuild his life. He shows that small habits, repeated every day, add up like interest in a bank account. Get 1% better each day and over a year the change is huge. Get 1% worse each day and the slide is just as big. In this book Clear explains how a habit works, why identity matters more than goals, and four simple laws that make good habits easier and bad habits harder. He also shows that you do not need to wait until you feel motivated. You need a better design for your days. If you lead or serve others, this matters twice: your own habits shape your life, and the systems you build shape your team's life too.",
   "insights": [
    {
     "emoji": "📈",
     "title": "1% better is a big deal",
     "body": "Improving by 1% a day does not feel like much on a Tuesday. But Clear does the maths: 1% better every day for a year makes you about 37 times better. 1% worse every day takes you almost down to zero. He calls habits the compound interest of self-improvement. This works both ways. Small good habits, like reading or saving, grow over time. Small bad habits, like late nights or unkind words, grow too.\n\nThe hard part is that results come late. Clear uses the picture of an ice cube in a cold room. The room warms one degree, then another, and nothing seems to happen. Then, at the melting point, the ice starts to melt. The earlier degrees were not wasted; they were building up. He also shares the picture of a stonecutter who hits a rock a hundred times with no crack, and then it splits on the next blow. It was not the last blow that did it, but all of them together. Clear calls the feeling of doing the work but seeing nothing the 'valley of disappointment'.\n\nSo when progress feels slow, do not quit. Look at your direction, not only your results. Are your daily habits moving you toward the person you want to be?"
    },
    {
     "emoji": "🧱",
     "title": "Fix the system, not the goal",
     "body": "Goals are about the results you want. Systems are the daily processes that lead to those results. Clear points out that winners and losers usually have the same goals. So the goal cannot be what makes the difference. The system is.\n\nHe tells the story of British Cycling. For about a hundred years British riders won very little. Then a new coach, Dave Brailsford, looked for tiny 1% improvements everywhere: more comfortable bike seats, the best pillows for good sleep, even teaching riders to wash their hands well so they got sick less. Each change was small. Together they changed everything, and within a few years British riders were winning the Tour de France and Olympic gold.\n\nClear names other problems with goals. Reaching a goal changes your life only for a moment. If you clean a messy room once but keep the same habits, the mess soon comes back. A goal also tells you to be happy only after you reach it, and once you reach it, you may stop. A system keeps you going. Fall in love with the process, and the results will follow."
    },
    {
     "emoji": "🪪",
     "title": "Become the kind of person who…",
     "body": "Clear describes three layers of change. The outer layer is outcomes: what you get. The middle layer is process: what you do. The inner layer is identity: what you believe about yourself. Most people start from the outside. Clear says the strongest habits start from the inside.\n\nImagine two people trying to stop smoking. Someone offers them a cigarette. The first says, 'No thanks, I'm trying to quit.' The second says, 'No thanks, I'm not a smoker.' The first person still sees themselves as a smoker who is fighting it. The second has a new identity, and that makes the choice much easier. Clear also warns that identity can hold us back. If you keep saying 'I am bad with money' or 'I am not a morning person', you will keep acting that way.\n\nEvery action is like a vote for the kind of person you are becoming. One run does not make you a runner, and one missed day does not ruin you. But each vote counts, and over time the votes add up to a new identity. So first decide who you want to be. Then prove it to yourself with small wins, one vote at a time."
    },
    {
     "emoji": "🔁",
     "title": "The four laws",
     "body": "Clear explains that every habit runs in a loop of four steps: a cue, a craving, a response and a reward. A simple everyday example: your phone buzzes (the cue). You want to know who sent the message (the craving). You pick up the phone (the response). You find out, and the craving is satisfied (the reward). Next time the phone buzzes, you reach for it even faster.\n\nFrom this loop come his four laws. Make it obvious, so you notice the cue. Make it attractive, so you want to do it. Make it easy, so little stands in your way. Make it satisfying, so your brain wants to do it again. To break a bad habit, turn each law around: make it invisible, unattractive, difficult and unsatisfying.\n\nOne story from the book shows the second law. A student in Ireland connected his exercise bike to his laptop and TV so that his shows would only play while he was cycling fast enough. He joined something he needed to do with something he loved to do. Clear calls this 'temptation bundling'. When a habit is not sticking, ask which of the four laws is missing. That usually shows you what to fix."
    },
    {
     "emoji": "👀",
     "title": "Notice what you already do",
     "body": "Before you can change a habit, you need to see it. Many of our habits run on autopilot. We pick up the phone, open the fridge or say the same sharp word without really choosing. Clear says the first step of change is awareness.\n\nHe describes how train drivers in Japan use a method called 'pointing-and-calling'. As the train moves, the driver points at each signal and says out loud what it shows. It can look strange, but pointing and speaking make the brain pay attention, and this greatly reduces mistakes. Clear suggests a similar tool for daily life, the Habits Scorecard. Write down your daily habits in order, from waking up to going to bed. Then mark each one as good, bad or neutral, based on whether it helps the person you want to become. You do not need to change anything yet. Just notice.\n\nOnce you see your habits clearly, you can make a clear plan. Clear recommends an 'implementation intention': I will do this behaviour at this time in this place. For example: I will pray for ten minutes at 6am on the balcony. A clear time and place make a new habit much more likely to happen, because you no longer wait for the right mood."
    },
    {
     "emoji": "👥",
     "title": "Your group shapes your habits",
     "body": "We all want to belong. Clear says one of the strongest ways to make a habit attractive is to join a group where that habit is normal. We tend to copy three groups: the close (family and friends), the many (the crowd around us) and the powerful (people with status and respect).\n\nHe tells the story of László Polgár, a Hungarian man who believed that great skill is made, not born. He and his wife taught their three daughters at home, with chess at the centre of family life. Chess was everywhere in the house, it was praised, and it was simply what their family did. All three daughters became strong players, and the youngest, Judit, became one of the best chess players in the world. For the Polgár girls, playing chess was not a battle of willpower. It was normal.\n\nThe lesson is simple. If you want a new habit, find a group where that habit is already normal and where you already share something in common with the people. A habit feels hard when you are fighting your group. It feels natural when it is part of belonging. This also works the other way: leaders help shape what feels normal for everyone around them."
    },
    {
     "emoji": "⏱️",
     "title": "The two-minute rule",
     "body": "When we start a new habit, we often aim too high. Clear's answer is the two-minute rule: shrink the habit until you can do it in two minutes or less. 'Read before bed each night' becomes 'read one page'. 'Go for a run' becomes 'put on my running shoes'. 'Read the Bible every day' could become 'open my Bible and read one verse'.\n\nThis can feel silly, but there is a reason. A habit must be started before it can be improved. First you master the skill of showing up. Once showing up is normal, it is easy to do a little more. This fits Clear's third law, make it easy. He says people naturally choose the path with the least effort, so the smaller the first step, the more likely you are to take it.\n\nClear tells of one reader who lost a lot of weight this way. At first he went to the gym every day but did not let himself stay longer than five minutes. He was building the identity of someone who goes to the gym. Later he added more. The two minutes are not the goal. They are the door into the habit. Start so small that you cannot say no."
    },
    {
     "emoji": "🧲",
     "title": "Stack it and shape your space",
     "body": "Two tools make good habits more obvious. The first is habit stacking, which builds on the work of researcher BJ Fogg. You attach a new habit to one you already do every day. The formula is simple: after my current habit, I will do my new habit. For example, after I pour my morning coffee, I will pray for one person. The old habit becomes the reminder for the new one.\n\nThe second tool is your environment. Clear says we often think we lack willpower, when really our space is working against us. He describes a hospital cafeteria where a doctor changed where the drinks were placed. Bottled water was put near the cash registers and in baskets around the room. With no new rules or messages, water sales went up and soda sales went down.\n\nClear adds that people who seem to have great self-control often just spend less time around temptation. He also suggests 'one space, one use' where you can: a desk only for work, a chair only for reading. Make the good choice easy to see, and the bad choice hard to reach."
    },
    {
     "emoji": "✅",
     "title": "Reward it right away",
     "body": "Clear's fourth law is make it satisfying. He calls it the main rule of behaviour change: what is rewarded is repeated, and what is punished is avoided. The problem is that many good habits pay off later, while many bad habits feel good now. So we need to add a small, quick reward to our good habits.\n\nClear tells a story from Karachi in Pakistan. A health researcher, Stephen Luby, wanted families in poor neighbourhoods to wash their hands more, to stop the spread of disease. His team gave families a special soap that foamed well and smelled nice. Washing became a pleasant moment, people did it more often, and children became sick much less. The good feeling helped the habit stick.\n\nOne of Clear's favourite tools is a habit tracker. Each day you do the habit, you mark a box on a calendar. Seeing a line of marks feels good, and you do not want to break it. When you do miss a day, his rule is simple: never miss twice. One missed day is an accident. Two can be the start of a new pattern. Bad habits can be made unsatisfying too, for example by asking a friend to hold you accountable."
    }
   ],
   "tryThis": [
    "Pick one habit and shrink it to a two-minute version you can do today.",
    "Write one habit stack: 'After I ___, I will ___.' Then do it every day this week.",
    "Never miss twice: if you skip a day, make sure you do it the next day."
   ],
   "forUs": "On a mission base, life is already full of rhythms: chores, cooking, worship, classes, outreach. You could stack prayer onto your morning coffee, Khmer or English practice onto lunch, or a quick check-in with your team onto the end of a work duty. In a DTS, staff can help students choose one small habit, like reading one chapter a day, instead of a big plan they will drop after a week. Teams can shape their space too: a Bible on the table, phones away during meetings, the cafe's cleaning checklist where everyone can see it. Our community is also a culture. When Khmer and international staff pray together, arrive on time and serve with joy, new people pick up those habits without being told. So it is worth asking what our base makes normal. Celebrate small wins with each other, and be gentle when someone misses a day. And remember identity. We are not trying to earn God's love with good habits. We are already his children, and small daily choices are a way to live like it. The Habit Tracker in this app is built for exactly this.",
   "oneLine": "Small habits + a good system + time = massive change.",
   "cover": {
    "bg": "paper",
    "fg": "ink",
    "a": "marigold",
    "b": "ink",
    "motif": "dotsgrow",
    "layout": "top",
    "font": "sans",
    "upper": true
   }
  },
  {
   "id": "decisive",
   "title": "Decisive",
   "author": "Chip Heath & Dan Heath",
   "year": 2013,
   "isbn": "9780307956392",
   "shelf": "habits",
   "mins": 10,
   "vibe": "Your gut is not a decision process. Here is a better one in four steps.",
   "bigIdea": "We make decisions every day, from small ones to choices that shape our whole lives. Most of us trust our gut, or we make a quick list of pros and cons. Chip and Dan Heath, two brothers who teach and write about how people and organisations change, say that is not enough. Research shows our minds fall into the same four traps again and again: we see too few options, we look only for proof that we are right, we let short-term feelings take over, and we feel too sure about the future. Being clever does not protect us. Experienced leaders fall into these traps too. The Heaths offer a simple four-step process called WRAP: Widen your options, Reality-test your assumptions, Attain distance before deciding, and Prepare to be wrong. Each step comes with practical tools you can use alone or with a team. The process will not make every choice perfect, and it does not remove all risk. But it makes wise choices much more likely. For anyone who leads a team or guides other people, that is a real gift: better decisions, fewer regrets, and more trust from the people who live with the results.",
   "insights": [
    {
     "emoji": "🧠",
     "title": "The four villains",
     "body": "The Heaths say bad decisions usually come from four 'villains'. Narrow framing means seeing only one or two options. Confirmation bias means looking for information that agrees with what we already want. Short-term emotion means feelings in the moment push us around. Overconfidence means being too sure about how the future will go.\n\nThey compare our attention to a spotlight. It shows what is inside the circle of light very clearly, but we forget how much is outside it. One example from the book is the food company Quaker Oats, which paid a huge amount of money to buy the drink brand Snapple. The leaders were confident it would work. It did not, and a few years later they sold it for a small part of what they paid.\n\nThe Heaths also look at the classic list of pros and cons, a method famously used by Benjamin Franklin. It is better than nothing, but it does not protect us from the villains. We still list only the options we already see, and our feelings still decide which points look heavy. Once you can name the four villains, you can build steps into your decisions to fight each one. That is what WRAP is for."
    },
    {
     "emoji": "🔭",
     "title": "W — Widen your options",
     "body": "Watch out for 'whether or not' decisions, like 'Should I take this job or not?' The Heaths share research showing that teenagers often decide this way, but so do many organisations. One study of business decisions found that choices made with only one option on the table failed far more often than choices where people compared two or more.\n\nA useful tool is the 'vanishing options' test. Imagine that you cannot choose any of the options you are thinking about now. What would you do then? This pushes your mind to search for something new, and often a better third option appears.\n\nAnother tool is to think about opportunity cost: what else could I do with this money or time? The Heaths describe a study where shoppers chose between a more expensive and a cheaper music system. When they were simply reminded that the cheaper one would leave money for other things, many more chose it. Where you can, also try 'multitracking', which means exploring more than one option at the same time instead of betting everything on one. Comparing options side by side helps you see the strengths and weaknesses of each."
    },
    {
     "emoji": "🧭",
     "title": "Find someone who has solved it",
     "body": "When you are stuck, the Heaths say, look for someone who has already solved a problem like yours. This is one of the best ways to widen your options, because you do not have to invent everything yourself.\n\nThey tell how Sam Walton, who started Walmart, kept visiting other shops to look for good ideas. In one story, he heard that two variety stores in Minnesota were trying a new self-service way for customers to pay at the front of the store. He travelled a long way to see it for himself, then brought the idea back to his own stores. He was not too proud to learn from others.\n\nThe Heaths also suggest looking for 'bright spots': places inside your own team or organisation that are already doing well. Ask what they do differently, and spread it. And for decisions you make again and again, they suggest a 'playlist', a short list of questions that reminds you of good options you might forget. A simple everyday example: a new teacher planning a class can ask an experienced teacher for ideas before starting from zero. Borrowing wisdom is not cheating. It is humble and smart."
    },
    {
     "emoji": "🧪",
     "title": "R — Reality-test your assumptions",
     "body": "Once you have options, you need honest information about them. The problem is confirmation bias: we ask questions that will give us the answer we want. The Heaths suggest a better question: what would have to be true for this option to be the best one? Then go and check whether those things are true. They also tell how Alfred Sloan, a famous leader of General Motors, once stopped a meeting where everyone agreed too quickly. He asked the team to come back later, after they had found some real disagreement.\n\nThe Heaths suggest asking questions that make it easy for people to share bad news. The book describes a study about selling a used music player that had a hidden problem. Buyers who asked a general question rarely heard about the problem. Buyers who asked directly what problems it had heard the truth much more often.\n\nFinally, where you can, test small before you commit big. The authors call this 'ooching'. For example, someone thinking about a new career can spend a few days with a person who already does that job before quitting their own."
    },
    {
     "emoji": "🔎",
     "title": "Zoom out, then zoom in",
     "body": "When we think about a choice, we usually focus on the details of our own case, and we feel sure. The Heaths say we should do two other things: zoom out and zoom in.\n\nZooming out means asking what usually happens to people in situations like ours. The Heaths call this looking at the 'base rate'. Our inside view says, 'My plan is special, it will work.' The outside view says, 'Here is what normally happens to plans like this.' The Heaths note that experts are often better at telling us what usually happens than at predicting one exact case. So when you ask an expert, ask about the usual pattern, not only their guess about you.\n\nZooming in means getting a close-up, real-life look at the option. Read the details, visit the place, and talk to people who live with it every day. Numbers can miss how something actually feels and works. A simple everyday example: someone thinking about opening a small shop can zoom out by asking how many new shops in that area are still open after a few years. Then they can zoom in by spending a week helping in a similar shop. The wide view and the close view together keep both hope and reality in the picture."
    },
    {
     "emoji": "🏔️",
     "title": "A — Attain distance before deciding",
     "body": "When we feel strongly, the short term looks huge and the long term looks small. Fear of losing what we have also makes us hold on to the way things are, even when change would be better. The Heaths offer simple tools to get some distance. One is the 10/10/10 test from writer Suzy Welch: how will I feel about this choice in 10 minutes, in 10 months and in 10 years? Another is to ask: what would I tell my best friend to do? We often see other people's choices more clearly than our own.\n\nThe book tells a famous story from the computer chip company Intel. In the 1980s the company was losing money on memory chips, which had been its main business. Leader Andy Grove asked his partner Gordon Moore what new leaders would do if the two of them were replaced. Moore said new leaders would get out of memory chips. So Grove asked why they should not do it themselves. They did, and Intel grew stronger.\n\nDistance does not mean ignoring your feelings. It means letting them settle, so you can see the whole picture and choose by what matters most, not by your mood in the moment."
    },
    {
     "emoji": "💎",
     "title": "Honor your core priorities",
     "body": "Some decisions are hard not because we lack information, but because two good things pull against each other. The Heaths say the answer is to know your core priorities: the long-term goals and values that matter most to you or your organisation. Then choose by those, not by whatever feels loudest today.\n\nThey tell the story of a charity that sent volunteer surgeons from the United States to poorer countries to give free operations to children. Over time its leaders faced a hard question. The visiting surgeons loved doing the operations themselves, but training local doctors could help far more people for many years. Being clear about their deepest aim helped the leaders make a difficult change, even though some volunteers were unhappy.\n\nThe Heaths also point out that many of us say we have clear priorities, but our calendars show something else. Urgent tasks push out important ones. One tool they share, from business writer Jim Collins, is a 'stop-doing list'. Just as you keep a to-do list, write down things you will stop doing, so there is room for what matters most. When a choice feels stuck, ask: which option best fits what we care about most?"
    },
    {
     "emoji": "🛟",
     "title": "P — Prepare to be wrong",
     "body": "We cannot know the future, but we often act as if we can. The Heaths suggest you 'bookend' the future: think about a range of outcomes, from very good to very bad, and prepare for both.\n\nOne strong tool is the 'premortem', an idea from psychologist Gary Klein. Before a project starts, the team imagines that it is a year later and the project has failed. Each person writes down why it failed. This makes it safe to share worries that people might otherwise keep quiet, and it shows problems while there is still time to fix them. The Heaths also describe giving new workers an honest preview of the hard parts of a job before they start. People who know what is coming cope better and are less likely to quit.\n\nAnother tool is setting 'tripwires'. These are clear signals or dates that wake you up and tell you it is time to stop and decide again. A simple everyday example: a team agrees that if no teacher is found by March, they will change the plan. Without tripwires, we often keep going without thinking, long after we should have stopped."
    },
    {
     "emoji": "⚖️",
     "title": "Fair process matters",
     "body": "When a decision affects a group, how you decide matters a lot. The Heaths explain that people accept hard decisions much more easily when they feel the process was fair. That means they were listened to, they could share their views, and they understand the reasons for the final choice.\n\nA simple everyday example: a team leader needs to change the weekly schedule. If she announces it with no explanation, people may complain for months. If she first asks for ideas, explains what she has to balance, and then shares the reasons for her choice, most people will accept it, even those who wanted something different.\n\nUsing WRAP together also helps the group. It turns a fight between two people's opinions into a shared search for the best option. It also gives a leader a kind of confidence that does not depend on being certain. You may not know how things will turn out, but you know you looked at real options, tested your ideas and planned for problems. The Heaths say a good process will not guarantee a good result, but it builds trust, and trust makes the next decision easier too."
    }
   ],
   "tryThis": [
    "For one decision this week, write down at least three real options before you choose.",
    "Do a 10/10/10 check on something you feel strongly about right now.",
    "Before a big plan starts, ask your team: 'Imagine this failed. What went wrong?'"
   ],
   "forUs": "On a base we make big choices all the time: where to send an outreach team, who to invite onto staff, whether to start a new ministry. We pray first, and we listen for God. WRAP does not replace that. It can be a way to listen well. Widen the options before you vote on just one idea, and ask who has done something similar before, like another YWAM base or a local church that already runs a children's program. Test plans with small steps, like running a cafe event once before making it weekly. Ask both Khmer and international staff for honest views, and ask in a way that makes bad news easy to share, because in many cultures people will not say no to a leader directly. Remember our core values when choices get hard, and be willing to stop something good to make room for something better. Run a premortem before a DTS outreach team leaves. Agree on a check-in date in case you need to change course. And explain your reasons, so the whole team can trust the process even when they hoped for a different answer. Wisdom and good process work together.",
   "oneLine": "Widen your options, test your ideas, get some distance, and plan for being wrong.",
   "cover": {
    "bg": "teal",
    "fg": "paper",
    "a": "marigold",
    "b": "paper",
    "motif": "fork",
    "layout": "top",
    "font": "sans",
    "upper": true
   }
  },
  {
   "id": "drive",
   "title": "Drive",
   "author": "Daniel H. Pink",
   "year": 2009,
   "isbn": "9781594484803",
   "shelf": "habits",
   "mins": 10,
   "vibe": "Rewards and punishments are old tech. People run on something deeper.",
   "bigIdea": "How do you get people to do good work? Many organisations still use the same answer: reward people when they do well and punish them when they do badly. Daniel Pink, an American writer who once wrote speeches for a US vice president, calls this 'carrots and sticks'. He shows from decades of science that this works fine for simple, routine tasks. But for creative, thinking work, it often fails and can even make things worse. What really drives people over time comes from inside. Pink names three parts: autonomy, the desire to direct our own lives; mastery, the desire to get better at something that matters; and purpose, the desire to serve something bigger than ourselves. He does not say money is unimportant. People must be paid fairly first. But once that is settled, the deepest motivation does not depend on more money. It depends on how we treat people and how we shape their work. For anyone who leads a team, trains students or serves alongside volunteers, this book is a challenge. Instead of asking how to control people, Pink asks how to create a place where people want to give their best.",
   "insights": [
    {
     "emoji": "💻",
     "title": "Motivation 1.0, 2.0, 3.0",
     "body": "Pink compares human motivation to the operating system of a computer. Motivation 1.0 was about survival: food, safety, staying alive. Motivation 2.0 is the carrot-and-stick system: people work for rewards and to avoid punishment. Most schools and workplaces still run on this.\n\nPink tells about an experiment from 1949 by scientist Harry Harlow. He gave monkeys a simple puzzle, with no food or reward for solving it. The monkeys solved it anyway, again and again, and seemed to enjoy it. Harlow suggested there was a third drive: the joy of the task itself. Twenty years later, psychologist Edward Deci tested this with students and a block puzzle. Students who were paid to solve the puzzles later spent less of their free time playing with them than students who were never paid. The money had made the puzzle feel like work.\n\nThat is the heart of Motivation 3.0. It is intrinsic motivation, which means doing something because it is interesting, meaningful or satisfying in itself. Pink argues that modern work, which needs creativity and problem solving, needs an upgrade to 3.0."
    },
    {
     "emoji": "🧩",
     "title": "Two kinds of work",
     "body": "Pink opens the book with a story about two encyclopaedias. In the 1990s Microsoft built one called Encarta. It paid experts and managers and had plenty of money. A few years later another encyclopaedia began, written and edited by volunteers who were not paid at all. Back then, most people would have bet on Microsoft. But Microsoft closed Encarta in 2009, while the volunteer project, Wikipedia, became one of the most used websites in the world.\n\nPink says Motivation 2.0 cannot explain this. Part of the reason is that work itself has changed. He describes two kinds of tasks. Algorithmic work follows a set of steps to one right answer, like filling in the same form again and again. Heuristic work has no set path. You must try ideas and discover a new answer, like designing a lesson or solving a conflict on a team. More and more work today is the second kind, because routine tasks can often be done by machines or done more cheaply elsewhere.\n\nCarrots and sticks were built for the first kind of work. For the second kind, people need room to think, explore and care. That is why Pink believes the old system needs an upgrade."
    },
    {
     "emoji": "🥕",
     "title": "When rewards backfire",
     "body": "For simple tasks with clear steps, rewards can help. But Pink shows that 'if you do this, then you get that' rewards often backfire on creative work. A well-known example is the candle problem. People must fix a candle to a wall using only a box of pins and some matches. In one version of the study, people offered money took longer to solve it, not less time. The reward narrowed their focus, and they missed the creative answer.\n\nRewards can also change how people see a task. Pink describes day-care centres in Israel that started fining parents who picked up their children late. Late pick-ups went up, not down. The fine turned a moral duty into something people could simply pay for. Pink lists other dangers too: rewards can reduce inner motivation, encourage shortcuts and cheating, and push people to think only short term. He calls one of these the 'Sawyer Effect', after the story of Tom Sawyer, who turned painting a fence into a game. Rewards can turn play into work.\n\nPink suggests a better option for creative work: an unexpected 'now that' reward, like a thank-you, given after the work is done, not promised before it."
    },
    {
     "emoji": "🧹",
     "title": "Doing routine work well",
     "body": "Pink does not say rewards are always bad. For routine work, which is not very interesting and needs little creative thinking, carrots and sticks can work fine. There is not much inner joy there for rewards to damage. But even then, Pink says, the way you ask people matters.\n\nHe shares three practices from research by Edward Deci and his colleagues. First, give a reason. Explain why the task matters, even if it is dull. Second, admit that the task is boring. Being honest shows respect and makes it easier to accept. Third, let people do it their own way where possible. Give the goal and the deadline, but not every small step. In the research, people treated this way took the task more to heart and worked with a better attitude.\n\nA simple everyday example: a team leader needs volunteers to fold hundreds of letters to supporters. She could just give orders. Or she could say, 'I know this is boring. These letters help people pray for the families we serve. Do it in whatever way works for you, as long as they are ready on Friday.' The job is the same, but the people doing it feel respected. If you do give a reward for routine work, Pink suggests it should feel like thanks and useful feedback, not a tool to control people."
    },
    {
     "emoji": "💵",
     "title": "First, pay people fairly",
     "body": "Pink is clear that his message is not that money does not matter. He calls pay a 'baseline reward'. If people feel underpaid, or treated unfairly compared to others, they will be unhappy and distracted, and no amount of freedom or purpose will fix that. Their attention goes to the unfairness, not the work.\n\nSo the first step is to make pay fair and adequate. Pink suggests paying people fairly for their role, and even a little more than average if you can. He also suggests not tying pay too closely to narrow targets that people will chase at the cost of everything else. If you measure performance, look at a wide picture and make the measures hard to game. The goal is that money stops being a constant worry, so people can focus on the work itself.\n\nA simple everyday example: if a worker is worried every month about paying rent, it is hard for them to feel creative or excited about a new project. Fairness also matters among volunteers, where it may be about shared tasks, time off and respect rather than money. Fair treatment is where motivation starts, not where it ends."
    },
    {
     "emoji": "🕊️",
     "title": "Autonomy",
     "body": "People want to direct their own lives. Pink names four areas where people can have freedom: task (what I do), time (when I do it), technique (how I do it) and team (who I do it with). Autonomy does not mean working alone or doing whatever you like. It means acting with choice, while still being connected to others and responsible for results.\n\nPink gives examples from companies. The Australian software company Atlassian began giving engineers a day to work on anything they wanted, as long as they showed what they made the next day. They called it a 'FedEx Day' because you had to deliver something overnight. Many new ideas and fixes came from those days. Pink also mentions Google, which allowed engineers to spend part of their time on their own projects, and some well-known products began that way.\n\nHe describes workplaces where people are judged by their results, not by how many hours they sit at a desk. Pink's main point is that control leads to compliance, but autonomy leads to engagement. Even a little freedom in one of the four areas can raise energy and ownership."
    },
    {
     "emoji": "🎯",
     "title": "Mastery",
     "body": "We want to get better at something that matters. Pink starts with 'flow', a state described by psychologist Mihaly Csikszentmihalyi, when a task fits your skill so well that you lose track of time. Flow happens with 'Goldilocks tasks', named after a children's story: not too easy and not too hard. Too easy, and we get bored. Too hard, and we get anxious.\n\nPink then gives three rules of mastery. First, mastery is a mindset: you must believe your ability can grow, an idea he takes from Carol Dweck. Second, mastery is a pain: it takes long, hard and sometimes boring effort, as Angela Duckworth's research on grit shows. Third, mastery is like a line you can get closer to but never touch. You never fully arrive.\n\nThat last rule might sound sad, but Pink sees it as part of the joy. There is always more to learn. Mastery also needs engagement. People who only obey can do adequate work, but people who are truly engaged keep growing. Leaders can help by giving people tasks that stretch them just enough, and by giving honest, kind feedback along the way."
    },
    {
     "emoji": "🌍",
     "title": "Purpose",
     "body": "Pink says the most motivated people connect their work to something bigger than themselves. He notes that as a large generation in the West reached their sixties, many began asking what really matters in life. He also sees more organisations, and more young workers, looking for purpose and not only profit.\n\nHe describes a study of university graduates in the United States. Some had 'profit goals', like becoming rich or famous. Others had 'purpose goals', like helping others or growing as a person. A year or two later, people who were reaching their purpose goals were happier. People who were reaching their profit goals were not happier, and some showed more anxiety and sadness. Pink also notices small signs of purpose in organisations, like whether people talk about 'we' or 'they' when they describe where they work.\n\nPink shares a simple tool. Ask: what is my sentence? A great life can often be described in one sentence, like saying of Abraham Lincoln that he kept his country together and freed the slaves. Then ask a smaller question each day: was I better today than yesterday? Purpose gives direction. Daily progress keeps you moving."
    },
    {
     "emoji": "🅧",
     "title": "Type X and Type I",
     "body": "Pink describes two kinds of behaviour. Type X behaviour is fuelled mostly by outside desires, like money, praise or status. Type I behaviour is fuelled mostly by inner desires: the work is interesting, it matters, and it helps you grow. The letters stand for extrinsic and intrinsic.\n\nType I people still care about money and recognition. The difference is that these are not the main reason they work. Pink says Type I people usually do better over time and are more satisfied, because their energy renews itself. It does not run out when the rewards stop. Pink also says this kind of motivation is better for our physical and mental well-being. It is a more sustainable way to work and to live.\n\nThe important news is that Type I is not a personality you are born with. It can be learned. A simple everyday example: a young worker who starts a job only for the pay can, with good support and real ownership, come to love the work itself. Leaders can create places where this growth happens, by giving autonomy, chances to grow and a clear reason why the work matters."
    }
   ],
   "tryThis": [
    "Ask one person on your team where they would like more freedom in their work.",
    "Pick one skill you want to master and spend 20 focused minutes on it today.",
    "Before a task, say out loud who it helps and why it matters."
   ],
   "forUs": "Most of us on a mission base are not here for the money, so purpose is already strong. But purpose alone does not keep people going. Give staff real ownership of their area, like the cafe menu, a DTS lecture week or a community project, and let them decide how to do it. Help Khmer and international team members grow real skills through training, feedback and tasks that stretch them. Be fair, too. Volunteers notice when some people always get the hard jobs or never get a day off. Much base work is routine, like cooking, cleaning, guarding and admin. We can still do it well: explain why it matters, admit when it is boring, and let people find their own way to do it. Be careful with prizes and competitions in ministry, because they can sometimes take the joy out of serving. Keep connecting daily tasks to the bigger story of what God is doing in Cambodia. And a sincere 'thank you, that made a difference' often means more than any reward.",
   "oneLine": "Pay people fairly, then give them freedom, room to grow and a reason that matters.",
   "cover": {
    "bg": "paper",
    "fg": "ink",
    "a": "berry",
    "b": "cobalt",
    "motif": "rise",
    "layout": "top",
    "font": "display",
    "upper": true
   }
  },
  {
   "id": "getting-things-done",
   "title": "Getting Things Done",
   "author": "David Allen",
   "year": 2001,
   "isbn": "9780143126560",
   "shelf": "habits",
   "mins": 10,
   "vibe": "Your brain is for having ideas, not for holding them.",
   "bigIdea": "Most of us carry a long, invisible list in our heads: messages to answer, things to buy, promises we made, ideas for later, worries about the future. David Allen, a consultant and coach who has spent many years helping busy people and organisations work better, says this is a big reason we feel stressed, even when we are not doing very much. Our minds are good at having ideas, but bad at holding them. Allen's system, known as GTD, is simple at its core. Get everything out of your head into a trusted place. Decide the very next physical step for each item. Keep it organised and review it regularly. Then choose what to do with a clear mind. The tools can be a paper notebook or a phone app. What matters is the habit, not the tool. Allen's promise is not that you will do everything. Nobody can. His promise is that you will know what you are not doing, and feel at peace about it. When your mind is clear, you can give full attention to what is in front of you. For leaders, this means fewer forgotten promises, less panic, and more calm focus for the people you serve.",
   "insights": [
    {
     "emoji": "🌀",
     "title": "Open loops drain you",
     "body": "Allen calls every unfinished thing an 'open loop'. It can be big, like 'decide about my future', or small, like 'buy rice'. Anything you have told yourself you should do, and have not yet finished or written down, is an open loop. Each one takes a little space in your mind. Your mind keeps reminding you about it, but usually at the wrong time.\n\nAllen gives an example like this. Your mind reminds you that you need new batteries when you pick up a torch that does not work. It does not remind you when you walk past the shop that sells them. So the reminder comes, but you cannot act on it, and you just feel a little stress. He also notices that many people feel calm and clear just before a holiday. Why? Because they finally finish, pass on or decide about all their open loops.\n\nMany open loops together create a low level of stress all day. The answer is not to try harder to remember. It is to write everything down in a place outside your head that you trust, and to check it often. Then your mind can relax."
    },
    {
     "emoji": "🧺",
     "title": "Five steps",
     "body": "The GTD system has five steps. Capture: collect everything that has your attention into a few inboxes, like a notebook, a tray or an app. Clarify: go through each item and decide what it is. Organise: put the results where they belong. Reflect: review your lists often enough to trust them. Engage: choose what to do now, and do it.\n\nAllen says capture must be complete. If you write down only some things, your mind will not trust the system and will keep holding the rest. But keep the number of inboxes small, and empty them regularly. An inbox is a place to collect, not a place to store things forever.\n\nClarify is where many people get stuck, so Allen gives a clear set of questions. First, is it actionable? If not, throw it away, keep it as reference, or put it on a 'someday/maybe' list. If it is actionable, what is the next action? If it takes less than two minutes, do it. If someone else should do it, pass it on. If not, put it on a list or in your calendar. One item at a time, the pile becomes clear."
    },
    {
     "emoji": "👣",
     "title": "What is the next action?",
     "body": "Allen's most famous question is: what is the next action? He means the next physical, visible thing you can do to move something forward.\n\nMany of our to-do lists are full of things we cannot actually do. 'Car' or 'mother's birthday' are not actions. Even 'plan the outreach' is not something you can sit down and do. 'Email Sokha to ask about dates' is. When an item is vague, our minds avoid it and leave it on the list. It is not that we are lazy. It is that we have not yet done the thinking about what doing it really means.\n\nAllen pairs this with a second question: what does 'done' look like? The outcome tells you where you are going. The next action tells you how to take the first step. Together, these two questions are some of the most useful thinking tools in the book. Allen says that asking them in meetings changes the culture of a team. Instead of leaving with a vague feeling, everyone leaves knowing who will do what next. Most of the time, the single question about the next action is enough to turn fuzzy worry into clear movement."
    },
    {
     "emoji": "⏱️",
     "title": "The two-minute rule",
     "body": "When you clarify your inbox, some items take only a moment to finish. Allen's rule is simple: if the next action takes less than two minutes, do it right now. Reply to the short message. Sign the form. Put the date in your calendar.\n\nThe reason is practical. For a very small task, writing it down, tracking it and coming back to it later takes more time and energy than just doing it. Many people are surprised how many small tasks they can clear in one sitting, and how much lighter they feel afterwards.\n\nBut the rule has limits. It is for when you are clarifying, not a reason to stop your real work every time something small appears. And if a task takes longer than two minutes, you do not do it now. Either you delegate it to someone else and track it on a 'waiting for' list, or you defer it by putting it on a list or in your calendar. So every item has three choices: do it, delegate it or defer it. The two minutes are only a guide. If you have more time, you can make it longer. The point is to stop small things from piling up."
    },
    {
     "emoji": "🗂️",
     "title": "Projects and lists",
     "body": "In GTD, a 'project' is any result that needs more than one action. Most people have more projects than they think, often thirty or more once they write them all down. Allen suggests keeping a simple set of lists.\n\nA projects list shows every result you have committed to. Next action lists hold the actions, often grouped by where you are or what tool you need, like calls, computer, errands or home. So when you are in town, you can look at your errands list and see only what you can do there. A 'waiting for' list tracks what others owe you. A 'someday/maybe' list holds ideas you are not ready to start. Allen also recommends a simple filing system for reference papers, sorted from A to Z, that is quick and easy to use.\n\nAllen is strict about the calendar. Only put things there that must happen on a certain day or at a certain time. If you fill it with wishes, you stop trusting it. Lists are for what you could do. The calendar is for what you must do on that day."
    },
    {
     "emoji": "🗺️",
     "title": "Plan the natural way",
     "body": "Allen notices that people already plan well without thinking about it. He uses the example of going out for dinner. First you have a purpose: you are hungry, or you want time with friends. Then you picture the outcome: good food in a nice place. Next you brainstorm: which restaurant, who is coming, how will we get there? Then you organise the ideas into an order. Finally you decide the next action: call your friend to ask if she is free.\n\nHe calls these five steps the natural planning model: purpose and principles, outcome vision, brainstorming, organising, and next actions. The problem is that many groups use an unnatural, reactive model. Someone says, 'Who has a good idea?' before anyone knows the purpose or what success looks like. Or people jump straight to action and then wonder why they keep getting stuck. The meeting goes in circles.\n\nAllen says most projects only need a little planning, often just a clear next action. But when a project feels stuck, move through the steps. If nothing is moving, decide the next action. If things are messy, brainstorm and organise. If people disagree, go back to purpose. A simple question like 'Why are we doing this?' can bring a whole team together."
    },
    {
     "emoji": "🔄",
     "title": "The weekly review",
     "body": "Allen calls the weekly review the key habit that makes the whole system work. Once a week, you sit down for an hour or two and make everything clear and current again.\n\nHe describes it in three parts. Get clear: empty all your inboxes, collect loose papers and notes, and write down anything new in your head. Get current: look over your action lists, your calendar for the past and coming weeks, your waiting-for list and every project, and make sure each project has a next action. Get creative: look at your someday/maybe list, ask if anything is ready to start, and add new ideas. Allen admits that most people find it hard to make time for this. He suggests choosing a regular time and place, like Friday afternoon, and protecting it like an important meeting.\n\nWithout this review, the lists slowly go out of date. When that happens, you stop trusting them, and things move back into your head. With it, you end the week calm and start the next one knowing where you stand. It is also a good moment to step back and ask whether your work still matches your bigger goals."
    },
    {
     "emoji": "🎚️",
     "title": "Choosing what to do now",
     "body": "Once everything is captured and organised, how do you choose what to do right now? Allen says you cannot rely only on priority. He offers four questions, in this order. Context: what can I do here, with the tools I have? Time: do I have ten minutes or two hours? Energy: am I fresh or tired? Priority: of the actions left, which matters most?\n\nThis helps in real life. If you are tired at the end of the day and have fifteen minutes, it is not the time to write a big report. But it may be a perfect time to make two short calls or tidy some files. Allen even suggests keeping a short list of easy tasks for low-energy times.\n\nHe also describes three kinds of daily work. You can do work you planned in advance from your lists. You can do work as it shows up, like a sudden visitor or problem. Or you can define your work, which means clearing your inboxes and deciding what new things mean. All three are valid. The trouble comes when we only react to what shows up and never get to our real commitments. The goal is not to be busy, but to feel at peace about what you are not doing, because you chose it on purpose."
    },
    {
     "emoji": "💧",
     "title": "Mind like water",
     "body": "Allen borrows a picture from martial arts. Imagine throwing a small stone into a calm pond. The water responds with exactly the right size of splash, no more and no less, and then it becomes calm again.\n\nThat is the state he wants for us. When something new comes, like an urgent request or a sudden problem, you can respond in the right way and then return to calm. You do not overreact, and you do not ignore it. This is only possible when you trust that nothing important is being forgotten. A clear mind is not an empty mind. It is a mind that is free to think, create and pay attention to people.\n\nAllen also talks about different levels of focus: today's actions, current projects, areas of responsibility, goals, vision and life purpose. He compares these to looking at your life from different heights, like from a plane. GTD starts at ground level, getting daily actions under control, because that frees your mind to think clearly about the bigger questions. Many people try to start with big life goals, but if their daily life feels out of control, those goals stay only words."
    }
   ],
   "tryThis": [
    "Do a 'mind sweep': spend 15 minutes writing down every task and worry in your head.",
    "For your top three items, write the very next physical action.",
    "Put a 30-minute weekly review in your calendar and protect it."
   ],
   "forUs": "Base life is full of interruptions: a visitor at the gate, a student who needs to talk, a broken water pump, a message from a supporter. A simple capture habit means you can say 'yes, I will get to that' and really mean it. Ministry leaders can use a projects list for things like DTS planning or a cafe repair, with a clear next action for each. In team meetings, try ending every topic with two questions: what does done look like, and who will do the next action? This is very helpful across languages and cultures, because it turns a long discussion into clear steps everyone understands. A 'waiting for' list helps you follow up kindly instead of forgetting. Leaders who run a weekly review forget fewer things, and their teams learn they can trust them. And GTD is not about doing more and more. Some days on base the most important thing is the person in front of you, not your list. With a clearer mind, it is easier to say yes to those moments, and to be fully present with God and with people.",
   "oneLine": "Get it all out of your head, decide the next action, and review it every week.",
   "cover": {
    "bg": "paper",
    "fg": "ink",
    "a": "teal",
    "b": "ink",
    "motif": "checklist",
    "layout": "top",
    "font": "sans"
   }
  },
  {
   "id": "grit",
   "title": "Grit",
   "author": "Angela Duckworth",
   "year": 2016,
   "isbn": "9781501111105",
   "shelf": "habits",
   "mins": 10,
   "vibe": "Talent is nice. Staying with it for years is what makes the difference.",
   "bigIdea": "Why do some people keep going when others give up? Psychologist Angela Duckworth asked this question for many years. Before she became a researcher, she taught maths, and she noticed that some of her strongest students were not the most gifted ones. They were the ones who kept working. Later she studied new cadets at the West Point military academy, salespeople, teachers, students and spelling bee champions. Again and again she found that talent alone did not predict who would succeed. What mattered more was something she calls grit: a mix of passion and perseverance for very long-term goals. Grit is not about working hard for one busy week. It is about caring about the same big goal for years, and getting up again after you fall. The good news is that grit is not fixed. It can grow, and we can help others grow it too. For anyone who serves long term, leads a team or trains young leaders, this book is a strong reminder. Steady faithfulness matters more than a flashy start, and the way we lead can help people keep going.",
   "insights": [
    {
     "emoji": "🏃",
     "title": "Grit beats talent alone",
     "body": "Duckworth says that talent matters, but we pay far too much attention to it. Grit, the steady mix of passion and perseverance, often predicts success better.\n\nHer clearest example is West Point, one of the hardest military schools in the United States. The school gives every applicant a score based on grades, fitness and leadership. Yet every year some new cadets quit during the very hard first summer of training. The school's score did not predict well who would stay. Duckworth's short grit questionnaire did much better. She saw the same pattern at the National Spelling Bee, where grittier children went further, partly because they practised more.\n\nShe also describes a study by Chia-Jung Tsay with professional musicians. The musicians said hard work mattered more than natural talent. But when they listened to recordings, they rated a player described as a 'natural' more highly than a player described as a hard worker, even though the same pianist played both. We say we value effort, but we are secretly more impressed by talent.\n\nWhy does this matter? When we decide someone is just gifted, we stop noticing how hard they worked, and we may write off people who seem ordinary. Talent is real, but people with talent still have to keep showing up."
    },
    {
     "emoji": "✖️",
     "title": "Effort counts twice",
     "body": "Duckworth offers two simple equations. Talent times effort equals skill. Skill times effort equals achievement. So effort appears twice. Talent tells you how fast your skills improve when you work. But without effort, talent stays as potential. And without more effort, skill does not turn into real results.\n\nShe points to sociologist Dan Chambliss, who spent years watching swimmers at every level. He found that top swimmers were not doing anything magic. They did many small, ordinary things very well and very often: good technique, careful habits, steady training. Over years, these ordinary actions added up to excellence. Greatness, he said, is made of everyday things done well.\n\nDuckworth also mentions the philosopher Nietzsche, who noticed that we like to call great people geniuses. If their gift seems magical, we do not need to compare ourselves with them or feel lazy.\n\nThis idea is freeing. You cannot change the gifts you were born with, but you can choose your effort today. Someone with less natural talent who keeps working can go further than a gifted person who stops. Ask yourself where you have been waiting to feel talented, when you simply need to keep going."
    },
    {
     "emoji": "🧭",
     "title": "One top goal",
     "body": "Duckworth describes goals as a kind of pyramid. At the bottom are many small, daily goals, like making a phone call or finishing a task. In the middle are goals that serve a bigger purpose. At the top is one top-level goal: the big direction of your life or work. Gritty people have their goals lined up, so the small ones serve the big one.\n\nShe tells a story about investor Warren Buffett. He once advised his pilot to list his top 25 career goals, circle the 5 most important, and then avoid the other 20 completely. Duckworth adds a gentle change: instead of throwing the others away, ask which ones can serve your top goal. She also describes the baseball pitcher Tom Seaver, who shaped his food, sleep and daily habits around one aim: pitching as well as he possibly could.\n\nSmall goals can change when they do not work. If one door closes, a gritty person looks for another way to reach the same top goal. The top goal stays steady. This gives direction and meaning to daily work, and helps you say no to good things that would pull you away. Many people feel tired and scattered because their goals do not connect to each other."
    },
    {
     "emoji": "📈",
     "title": "Grit can grow",
     "body": "Is grit something you are born with? Duckworth says genes play some part, as they do in almost every human quality. But experience matters too, and grit can change over a lifetime.\n\nWhen she looked at grit scores from a large group of American adults, she found that older people were, on average, grittier than younger people. Part of this may be a difference between generations. But she believes a bigger reason is what psychologists call the maturity principle. As we go through life, we learn lessons. We discover that quitting has a cost, that jobs and families need us to keep our promises, and that giving up too fast leaves us with nothing finished. Life slowly teaches us to keep going.\n\nDuckworth then names four inner strengths that gritty people tend to have: interest, practice, purpose and hope. Interest means you enjoy what you do. Practice means you work every day to get better. Purpose means you believe your work matters to other people. Hope means you believe you can keep improving, even after failure. The next ideas in the book look at each of these.\n\nThis is good news. If you do not feel very gritty today, that is not your final story. You can grow all four strengths, starting now."
    },
    {
     "emoji": "❤️",
     "title": "Interest comes first",
     "body": "Many young people are told to follow their passion, as if passion arrives in one big moment. Duckworth says that is rarely how it works. Passion usually starts with interest, often in a playful, low-pressure way. Then it grows as you learn more and go deeper. Over years, an interest can become a passion.\n\nShe points to research by Benjamin Bloom, who studied world-class performers like pianists, swimmers and scientists. In their early years, most of them were not serious or under pressure. They had fun, and they had warm, encouraging first teachers. Hard, focused training came later.\n\nDuckworth also notes a difference between beginners and experts. Beginners want new things all the time. Experts enjoy small details and fine differences in something they already know well. So interest does not stay alive by itself. It needs to be fed by new questions and deeper understanding.\n\nSo you often need to try several things before you find what you love. If you are waiting for passion to arrive, try exploring instead. Ask simple questions: What do I like to think about? Where does my mind go when it is free? What do I enjoy so much that I forget the time? Then go a little deeper there, and see what grows."
    },
    {
     "emoji": "🏋️",
     "title": "Practise the hard way",
     "body": "Grit is not only about working many hours. It is about working in the right way. Duckworth uses the research of Anders Ericsson on deliberate practice. This means setting a specific stretch goal just beyond your current level, focusing fully on it, getting quick feedback, and repeating until you improve. Then you set a new stretch goal.\n\nShe studied spelling bee finalists. The children who did the most deliberate practice, like quizzing themselves alone on hard words, did the best in the competition. But they also said this kind of practice was the least fun.\n\nDuckworth compares this with flow, the happy state of being fully absorbed in something, studied by Mihaly Csikszentmihalyi. Deliberate practice feels hard; flow feels easy. They seem opposite, but they belong to different moments. You practise with effort so that later, when you perform, you can enjoy flow. Gritty people do more of both.\n\nHer advice is practical. Make practice a habit, at the same time and place each day, so you do not need to decide again and again. Accept that struggle is normal and not a sign that you are failing. Aim your effort well, and every hour will count for much more."
    },
    {
     "emoji": "🌱",
     "title": "Purpose and hope",
     "body": "Over time, gritty people connect their work to the good of others. Duckworth tells an old story about three bricklayers. Asked what they were doing, the first said he was laying bricks. The second said he was building a church. The third said he was building the house of God. The first has a job, the second a career, the third a calling.\n\nShe explains research by Amy Wrzesniewski showing that people with the same job title can see their work in all three ways. A calling does not depend on having a special role. It depends on how you see the work you already do, and you can slowly shape your work to fit what you care about most.\n\nGritty people also have hope. This is not just wishing that things will turn out fine. It is the belief that your own effort can make things better. Duckworth explains research by Martin Seligman showing that when people feel nothing they do matters, they give up. But people can learn to explain setbacks in a hopeful way: this problem is specific and temporary, and I can do something about it.\n\nSo when gritty people fall, they expect to get up again, and they remember why the work matters."
    },
    {
     "emoji": "🏡",
     "title": "Grow it together",
     "body": "Grit is shaped by the people around us. Duckworth recommends what she calls wise parenting, which works for leaders and teachers too: be both warm and demanding. High support with low expectations lets people stay small. High expectations without warmth crushes them. Together, warmth and high standards help people grow.\n\nIn her own family, Duckworth uses a 'Hard Thing Rule'. Everyone, parents included, does one hard thing that needs daily practice. You choose your own hard thing. You cannot quit in the middle; you keep going until a natural stopping point, like the end of a season or term. Later, older children commit to one hard thing for at least two years.\n\nShe also says culture matters. When you join a group where everyone is gritty, you tend to become grittier, because we take on the habits of the group we belong to. She spent time with the Seattle Seahawks, an American football team whose coach, Pete Carroll, built a strong culture of effort, learning and encouragement.\n\nLeaders can shape a culture where grit becomes normal. Use shared words, set high standards and give lots of support. People often rise to the culture they live in."
    },
    {
     "emoji": "🎻",
     "title": "Follow through for years",
     "body": "Duckworth believes that sticking with an activity for a long time, outside of class or work, is one of the best training grounds for grit. Sports, music, drama or a school newspaper can all teach it.\n\nShe describes a large study led by Warren Willingham, who followed students from high school into college. He wanted to know which personal qualities best predicted success as a young adult. The clearest sign was what he called follow-through: a student had stayed with activities for several years and made real progress in them, instead of trying many things briefly. Students with strong follow-through were more likely to become leaders and achieve good things later.\n\nDuckworth tested a similar idea with new teachers. Those whose college records showed long commitment to an activity were more likely to stay in teaching and to help their students more.\n\nWhy does this work? A long-term activity gives two things at once: an adult who is warm and demanding, like a coach or teacher, and a hard goal that needs daily practice. Short tries are good for exploring. But at some point, staying with one thing for years teaches lessons that nothing else can. Help young people choose an activity and keep going, through the boring and difficult seasons too."
    }
   ],
   "tryThis": [
    "Write your top-level goal in one sentence, then list three smaller goals that serve it.",
    "Choose one 'hard thing' and commit to it until a clear stopping point, like the end of the term.",
    "Practise one skill for 20 minutes with a specific stretch goal and ask someone for feedback."
   ],
   "forUs": "Long-term missions need grit: learning Khmer or English, raising support, serving through hot seasons, slow results and team changes. Remember why you came, and keep your top goal clear even when smaller plans change. If one ministry plan closes, look for another way to serve the same calling. Treat language learning like deliberate practice: a clear stretch goal, short focused time each day, and feedback from a friend who speaks the language well. In DTS and schools, staff can be warm and demanding at the same time, cheering students on while believing they can do hard things. Encourage young staff to follow through on one thing for a full season, like a cafe shift, a kids program or a worship team, instead of trying many things for a few weeks. Khmer and international staff can learn endurance from each other, because every culture has its own strengths. On hard days, remember the third bricklayer. Washing dishes, teaching kids or fixing a pump can be part of building God's house. And our hope is not only in our own effort, but in his faithfulness. He finishes the work he begins in us.",
   "oneLine": "Long-term passion and steady effort matter more than talent alone, and both can grow.",
   "cover": {
    "bg": "paper",
    "fg": "ink",
    "a": "teal",
    "b": "marigold",
    "motif": "mountain",
    "layout": "top",
    "font": "display",
    "upper": true
   }
  },
  {
   "id": "mindset",
   "title": "Mindset",
   "author": "Carol S. Dweck",
   "year": 2006,
   "isbn": "9780345472328",
   "shelf": "habits",
   "mins": 10,
   "vibe": "Are you trying to prove yourself, or trying to grow?",
   "bigIdea": "Why do some people love a challenge, while others avoid anything that might make them look bad? Psychologist Carol Dweck, a professor at Stanford University, spent decades studying this question with children, students, athletes, workers and couples. She found that people hold one of two basic beliefs about their abilities. With a fixed mindset, you believe your intelligence and talents are set and cannot change much. With a growth mindset, you believe ability can grow through effort, good strategies and help from others. That one simple belief shapes how you handle challenge, failure, effort and feedback. It can decide whether you keep learning or quietly stop trying. Dweck shows how mindsets play out at school, in sports, in business, in marriages and in families. Her message is hopeful: mindsets can change, and even short lessons about how the brain learns can make a real difference. For leaders and teachers this matters a lot. How we talk about ability, how we praise, and how we respond to mistakes pushes the people around us toward one mindset or the other, often without us noticing.",
   "insights": [
    {
     "emoji": "🧱",
     "title": "The fixed mindset",
     "body": "If you believe your ability is fixed, every task becomes a test of who you are. Each success says you are smart or talented. Each failure says you are not. So you avoid challenges, hide mistakes and may feel threatened when other people do well. Even effort can feel like bad news: if you were really talented, you think, you would not need to try so hard.\n\nDweck uses tennis star John McEnroe as an example. He had great talent, but he often blamed others when things went wrong: the referee, the crowd, the conditions. He did not like to learn from losses. For him, a loss said something about who he was, so it had to be someone else's fault.\n\nIn her studies, students with a fixed mindset who got a poor grade often said they would study less next time, or even think about cheating. They tried to protect their image, not to fix the problem.\n\nIn a fixed mindset, failure stops being an event and becomes a label: I am a failure. That label is heavy, and it makes people stop trying just when trying matters most. Dweck notes that this mindset can be strong even in very talented people, because they feel they have so much to lose."
    },
    {
     "emoji": "🌱",
     "title": "The growth mindset",
     "body": "If you believe ability can grow, challenges look like chances to learn. Effort is the path to skill, not a sign that you are weak. Failure still hurts, but it becomes information: what can I learn from this?\n\nDweck tells how she first noticed this as a young researcher. She gave children puzzles that got harder and harder, to see how they coped with failure. Some children were upset. But one boy rubbed his hands together and said that he loved a challenge. These children did not think they were failing. They thought they were learning. Dweck says this moment changed the direction of her work.\n\nShe also points out that many people we call geniuses did not appear fully formed. Mozart worked for many years before he wrote his greatest music, and Darwin spent years of careful work, with help from many others, before his famous book.\n\nA growth mindset does not mean anyone can become anything, or that effort alone is enough. It means your current abilities are a starting point, not a final limit. With good strategies, hard work and help from others, people can grow far more than they expect. Nobody knows in advance how far a person can go."
    },
    {
     "emoji": "👏",
     "title": "Praise the process",
     "body": "In one of Dweck's best-known studies, children did a set of fairly easy problems. Afterwards, some were praised for their intelligence and told they must be smart. Others were praised for their effort and told they must have worked hard.\n\nThe difference was big. Children praised for being smart often chose easier tasks next, so they could keep looking smart. When the problems got hard, they lost confidence and did worse. Many even lied about their scores when they reported them to other children. Children praised for effort chose harder tasks, enjoyed them more and kept improving.\n\nThe lesson for leaders and parents is simple: praise what people do, not what they 'are'. Talk about effort, strategies, focus and progress. A simple everyday example: instead of telling a student they are so clever, say that you noticed how they tried different ways until one worked.\n\nDweck adds a warning. Praising effort that did not work is not helpful either. If someone worked hard but is stuck, do not just say well done. Help them look for a new strategy or a new source of help. The goal is learning, so praise the process that leads to learning, and keep the door open for the next step."
    },
    {
     "emoji": "💬",
     "title": "Feedback is a gift",
     "body": "In a fixed mindset, criticism feels like an attack on who you are. In a growth mindset, it is useful information for getting better.\n\nDweck describes a study where people answered hard questions while their brain activity was measured. After each answer, they were told if they were right, and then given the correct answer. People with a fixed mindset paid close attention when they heard whether they were right or wrong. But when the information that could help them learn came, their attention dropped. People with a growth mindset paid close attention to the learning information too.\n\nShe also tells about a nine-year-old girl named Elizabeth at her first gymnastics competition. She did well but won nothing, and she was very sad. Her father did not tell her she was the best or that the judges were unfair. He kindly said that others had worked longer and harder, and if she really wanted to win, she would need to do the same. She trained hard, and at later competitions she did very well.\n\nIf you only care about how you look, you miss the help that is right in front of you. Learning to welcome feedback, ask for it and act on it is one of the clearest signs that you are growing."
    },
    {
     "emoji": "🏆",
     "title": "Champions are made",
     "body": "In sports, people love the idea of the natural, the athlete who seems born to win. Dweck shows that this belief can be a trap, and that many great champions grew through a growth mindset.\n\nMichael Jordan was not seen as a natural at first. He was cut from his high school varsity team, and some college and professional teams did not choose him. He became famous for how hard he worked after every disappointment, practising the weak parts of his game again and again. Dweck also describes the boxer Muhammad Ali. By the body measurements experts used at the time, he did not look like a great boxer. What made him a champion was his speed, his mind and his careful study of his opponents.\n\nDweck says champions with a growth mindset have character. They find success in doing their best and in learning and improving, not only in winning. When things go badly, they dig deeper instead of falling apart. They take responsibility for their mistakes and work on them.\n\nThis matters far beyond sports. If we only look for natural talent, we will miss people who could become great. And if we believe we must be naturals, we will quit the moment something feels hard."
    },
    {
     "emoji": "👔",
     "title": "Leaders and teams",
     "body": "Dweck shows that mindset is a big deal in leadership. Fixed-mindset leaders often need to prove they are the smartest person in the room. They may surround themselves with people who agree with them, punish bad news and blame others when things go wrong. She describes car company leader Lee Iacocca this way: he became more focused on his own image while his company struggled. She also discusses Enron, an energy company that admired talent so much that people felt they had to look brilliant at all times. Admitting a problem felt dangerous, and the company collapsed.\n\nGrowth-mindset leaders focus on learning and on developing their people. Dweck points to Lou Gerstner, who led the computer company IBM through hard times. He broke down walls between departments, listened to customers and valued teamwork more than looking like a hero.\n\nTeams often take on the mindset of their leaders. In a fixed-mindset culture, people hide mistakes and stop sharing ideas, and groups can fall into everyone agreeing with the boss. In a growth-mindset culture, people are more honest, more creative and more willing to try new things. A leader who admits mistakes and asks for input makes it safe for everyone to grow."
    },
    {
     "emoji": "❤️",
     "title": "Relationships too",
     "body": "Mindset affects friendships, marriages and families, not only work. Dweck explains that a fixed mindset in relationships often believes that if a relationship is right, it should be easy. Partners should understand each other without talking, almost like reading minds. When problems come, someone must be to blame: me, the other person, or the relationship itself.\n\nA growth mindset sees it differently. Good relationships take work, honest talk and growing together. Problems are normal. They are chances to understand each other better, not proof that everything is wrong. In a healthy relationship, each person also helps the other grow and reach their goals, instead of feeling threatened by the other's progress.\n\nA simple everyday example: two friends have a misunderstanding. With a fixed mindset, one may decide the other is just a selfish person, and pull away. With a growth mindset, they talk, listen, and learn how to handle it better next time. Each person also asks what they could do differently, instead of only waiting for the other to change.\n\nThis applies to teams too. Conflict handled well can make a team stronger, and people who feel safe to grow will stay longer and serve with more joy."
    },
    {
     "emoji": "🧠",
     "title": "Your brain can grow",
     "body": "Can a mindset be taught? Dweck and her colleagues tested this in schools. They worked with students starting junior high school, a time when many young people's maths grades fall.\n\nThe students were put into two groups. Both groups had a series of workshops on useful study skills. But one group also learned about the brain: when you push yourself to learn something new and hard, the brain makes new connections, and over time you can become smarter. The other group learned other topics instead. The students who learned about the growing brain started to improve their maths grades, while the other group did not. Their teachers, who did not know which group the students were in, noticed changes in their effort and motivation. Dweck tells of one boy who had not tried hard before. With tears in his eyes, he asked if this meant he did not have to be dumb.\n\nLater, her team turned these lessons into an online program called Brainology, so many more students could learn them.\n\nThe point for us is this. People are not helped only by kind words. They are helped by understanding how learning really works. When people see that struggle builds the brain, they start to welcome hard things."
    },
    {
     "emoji": "🔀",
     "title": "Everyone is a mix",
     "body": "Nobody has a pure growth mindset, and Dweck is honest about this. We all have areas and situations that trigger fixed thinking: a new challenge, harsh criticism, a deadline, or meeting someone who is better than us. In later editions of the book, she also warns about a 'false growth mindset'. This is when people say the right words but do not really live them, for example by praising effort that is not helping, or by thinking a growth mindset just means being positive and open-minded.\n\nHer advice is to notice your fixed-mindset triggers. She even suggests giving your fixed-mindset voice a name, so that when it speaks you can recognise it and answer it calmly. Then you can choose a growth response: try a new strategy, ask for help, or keep going.\n\nA simple everyday example: someone joins a new team and hears a colleague praised. A small voice says they will never be that good. Instead of believing it, they notice the voice, and ask the colleague how they learned the skill.\n\nThe goal is not to pretend you are always growth-minded. The goal is to grow, little by little, in how you respond. Change is a journey, not a single decision."
    }
   ],
   "tryThis": [
    "When you think 'I'm just not good at this', add the word 'yet'.",
    "Praise one person this week for their effort or strategy, not their talent.",
    "After a mistake, write down one specific thing you learned from it."
   ],
   "forUs": "Mission life puts us in new places all the time: a new language, a new culture, a new role. A growth mindset lets a Khmer staff member try leading worship in English, or a new missionary try speaking Khmer at the market, without fear of looking foolish. In DTS and schools, staff can praise students for effort, strategy and learning, not for being gifted, and can teach them that struggle is how the brain grows. In outreach debriefs, teams can ask what they learned, not only whether it went well. In ministries like the cafe or community service, we can try new ideas and treat mistakes as lessons, not as proof that someone is not good enough. Leaders can share their own mistakes first, which makes it safe for others. In cultures where losing face is painful, this needs extra kindness and private feedback. And when conflict comes in a team or between cultures, we can choose to talk, listen and grow together instead of deciding the other person will never change. Most of all, we remember that God is patient with us as we grow. We can show that same patience to each other.",
   "oneLine": "Believe your abilities can grow, and challenges and mistakes become ways to learn.",
   "cover": {
    "bg": "marigold",
    "fg": "ink",
    "a": "teal",
    "b": "ink",
    "motif": "sprout",
    "layout": "top",
    "font": "sans",
    "upper": true
   }
  },
  {
   "id": "rich-dad-poor-dad",
   "title": "Rich Dad Poor Dad",
   "author": "Robert T. Kiyosaki",
   "year": 1997,
   "isbn": "9781612680194",
   "shelf": "habits",
   "mins": 10,
   "vibe": "School taught you to work for money. Nobody taught you how money works.",
   "bigIdea": "Why do some people with good salaries still struggle with money, while others with less income slowly become secure? Robert Kiyosaki, an American businessman and investor, tells the story of two father figures who shaped him as a boy in Hawaii. His own father was highly educated, worked hard in the state's education system, and often struggled with money. His best friend's father left school early, built businesses and became wealthy. Kiyosaki calls them his poor dad and his rich dad. The main lesson is that understanding how money works matters more than how much you earn. Kiyosaki wants readers to stop working only for a pay cheque, to learn the basic language of money, and to slowly build things that bring money in. He also writes about the fears and habits that keep people stuck. Some of his specific advice is strongly debated, and some of it is risky. But the basic ideas about money awareness are useful for anyone, including people serving on a small budget. For leaders, it is also a reminder that money worries affect many people on our teams, and simple, kind teaching can bring real freedom.",
   "insights": [
    {
     "emoji": "👨‍👦",
     "title": "Two dads, two ways of thinking",
     "body": "The 'poor dad' believed in good grades, a safe job and a steady salary. The 'rich dad' believed in learning how money works and building things that produce money. The book uses these two voices to show how our beliefs shape our choices.\n\nKiyosaki gives many small contrasts. His poor dad told him to study hard so he could find a good company to work for. His rich dad told him to study hard so he could find a good company to buy. His poor dad said he was not interested in money. His rich dad said that money is a kind of power, and that a lack of money causes many problems.\n\nOne example is about words. When something cost too much, his poor dad would say he could not afford it. His rich dad did not allow that sentence in his home. Instead he asked how he could afford it. Kiyosaki says the first sentence closes your mind, while the question makes your mind start working to find a way.\n\nThe point is not that one man was good and the other bad. The point is that the way we talk and think about money, often learned at home, quietly shapes what we do with it."
    },
    {
     "emoji": "📊",
     "title": "Assets vs liabilities",
     "body": "This is the core idea of the book. Kiyosaki gives very simple definitions. An asset is something that puts money into your pocket. A liability is something that takes money out of your pocket. He says the most important thing is to know the difference, and then to keep buying assets.\n\nHe draws simple pictures of cash flow. For a poor person, money comes in from a job and goes straight out to daily expenses. For a middle-class person, money also goes out to liabilities like loans, which they often think of as assets. For a rich person, money comes in from assets, like businesses or property that earns rent, and much of it is used to buy more assets.\n\nHis rich dad also taught that what matters is not how much money you make, but how much you keep, and for how many generations it lasts.\n\nA simple everyday example: a sewing machine used to make clothes that people pay for can be an asset, because it brings money in. A new motorbike bought with a loan, used only for fun, is a liability, because every month it takes money out.\n\nHis advice is to build your list of assets first, and to buy luxuries only with the money your assets produce."
    },
    {
     "emoji": "🐀",
     "title": "The rat race",
     "body": "Many people earn more and then simply spend more. Kiyosaki describes a common story. A young couple marry, both work, and they start earning more money. So they move to a bigger house, buy a new car and use credit cards, and their bills grow. They work harder and harder, but never feel secure. Kiyosaki calls this the 'rat race', like a rat running on a wheel that never goes anywhere.\n\nHe says that more money does not fix this, because the problem is not the income. It is the habit of spending all of it, and borrowing for more. Many people, he says, do not see the trap, because a bigger house and a new car look like success from the outside.\n\nA simple everyday example: someone gets a pay rise and quickly buys a more expensive phone on monthly payments. Now the rise is already gone, and there is a new bill every month. Earning more does not help if spending always grows with it.\n\nThe way out, in Kiyosaki's view, is to change where the money goes. Before buying the next bigger thing, ask whether it will bring money in or take money out. Even a small change in direction, kept for years, makes a big difference."
    },
    {
     "emoji": "🍔",
     "title": "Mind your own business",
     "body": "Kiyosaki says many people spend their whole lives minding someone else's business. They work hard for the owner of a company, they pay the government through taxes, and they pay the bank through loans. Their own business, which he defines as their own asset column, gets almost nothing.\n\nHe tells a story about Ray Kroc, the man who built McDonald's. Kroc once spoke to a business class and asked the students what business he was in. They laughed and said hamburgers. Kroc said no: his business was real estate. The restaurants sold burgers, but the company was also slowly buying the valuable land under its restaurants. That land became one of the company's biggest assets.\n\nKiyosaki is not telling everyone to quit their job. In fact, he says to keep your daily job, but to start building your own asset column on the side. Examples he lists include businesses that run without you being present, stocks, bonds, property that earns rent, and music or writing that keeps paying the creator.\n\nThe everyday lesson is simple. Your income pays today's bills, but also think about what you are slowly building for the future. Small steps, taken often, can add up over many years."
    },
    {
     "emoji": "📚",
     "title": "Learn financial basics",
     "body": "Kiyosaki says schools rarely teach money skills, so many smart, educated people never learn them. He calls this financial literacy: being able to read and understand the numbers in your own life. That includes income, expenses, assets, liabilities and cash flow.\n\nHe also talks about a wider 'financial IQ', which includes simple accounting, investing, understanding markets and knowing the rules about money, like taxes and laws. He spends time on how wealthy people in the United States use companies to pay less tax. This part is specific to his country and time, and it is one of the more debated sections.\n\nHe believes financial knowledge helps people see opportunities that others miss. He describes buying houses cheaply in the city of Phoenix when the market there was very bad and many people were afraid, and later selling them for more. Readers should remember that this kind of investing carries real risk, and that many people lose money trying it.\n\nYou do not need to be an expert. But you do need to understand your own numbers. If you do not know how much comes in each month and where it goes, it is very hard to make wise choices, or to notice when something needs to change."
    },
    {
     "emoji": "🛠️",
     "title": "Work to learn",
     "body": "Kiyosaki encourages people, especially young people, to choose work for the skills it teaches, not only for the pay. He did this himself. Even though he was shy, he took a job selling office machines for the company Xerox, to get over his fear of rejection and learn to communicate.\n\nHe tells a story about a young journalist in Singapore who interviewed him. She wrote well and dreamed of becoming a best-selling author. He suggested she take a course in selling. She was offended, because she saw selling as beneath her. Kiyosaki pointed out that he was known as a best-selling author, not a best-writing author. Good skills often need to be joined by the ability to sell and communicate.\n\nHe lists some skills he thinks almost everyone needs: selling and communicating, managing money, managing systems and managing people. He warns that becoming very specialised can make you depend on one employer, and makes it hard to change when your situation changes.\n\nThe idea is to keep learning a range of skills, instead of knowing more and more about less and less. A job that pays a little less but teaches you a lot may be the wiser choice when you are young."
    },
    {
     "emoji": "😨",
     "title": "Fear and feelings",
     "body": "Kiyosaki argues that fear and desire often control our money choices. Fear of not having enough keeps people in jobs they dislike. Desire for more things makes them spend as soon as they are paid. Then they feel afraid again, and the cycle continues.\n\nHe tells how, as a boy of nine, he and his friend Mike asked the rich dad to teach them about money. The rich dad gave them work in one of his shops for a very small wage, and later took the wage away completely. Robert was angry and wanted to complain. Then the rich dad explained the lesson: most people let fear and anger push them to work for money all their lives, without ever asking whether there is another way. He wanted the boys to notice those feelings and use their minds instead.\n\nLater in the book, Kiyosaki also writes about cynicism, the voice that always says an idea will not work. He says too much doubt can stop people from ever learning or trying anything new.\n\nNoticing these feelings does not make them disappear. But it helps you pause, think, and choose more wisely, instead of letting a feeling make the decision for you."
    },
    {
     "emoji": "🐷",
     "title": "Pay yourself first",
     "body": "In his chapter on obstacles, Kiyosaki names five things that hold people back with money: fear, cynicism, laziness, bad habits and arrogance. One bad habit he focuses on is paying everyone else first and keeping nothing for yourself.\n\nHe describes how many people get paid, then pay the rent, the bills and the loans, and only save if anything is left. Usually nothing is. Kiyosaki says he does the opposite. As soon as money comes in, he puts a part of it into his asset column, before paying anything else. Then the pressure of the bills pushes him to think harder and find ways to earn more.\n\nThis is one of the places where readers need care. Kiyosaki is willing to pay some bills later because of this habit. Most money advisers would not suggest that, because late payments can cost you fees and trust. You can keep the good part of the habit without the risky part: choose a small, realistic amount to save each time you receive money, and set it aside first. Then plan your spending with what is left.\n\nA simple everyday example: someone receives a gift and immediately puts one small part in a separate envelope. Over a year, that small habit becomes real savings."
    },
    {
     "emoji": "⚠️",
     "title": "Read with care",
     "body": "Rich Dad Poor Dad is one of the best-selling money books ever, but many financial experts question parts of it. Kiyosaki says your own home is not an asset, because it takes money out each month. Many advisers disagree, or say it depends on the situation. He also encourages fairly risky investing, and his advice about taxes and companies is built on American rules that do not apply everywhere.\n\nSome writers have even questioned whether the rich dad was one real person, or more of a teaching story. Kiyosaki has defended the story, but readers should know this question exists.\n\nThere is also a deeper question for people of faith. The book can make wealth sound like the main goal of life. Readers can learn from its practical wisdom without taking on that goal.\n\nSo take the big ideas with you: understand your cash flow, spend less than you earn, avoid debt for things that lose value, keep learning, and build things that help you over time. Be careful with the rest. Before any big financial decision, get advice from someone wise and trustworthy who knows your situation and your country's rules."
    }
   ],
   "tryThis": [
    "List what you own and what you owe. Mark each item as 'puts money in' or 'takes money out'.",
    "Track every dollar or riel you spend for one week.",
    "Set aside a small amount from every gift or payment before you spend anything else."
   ],
   "forUs": "Most of us live on support-raised budgets or modest local salaries, so we are not chasing wealth, and that is fine. Jesus warns us about loving money, and our security is in God, not in our savings. But money wisdom still matters. Knowing your cash flow, avoiding debt and saving a little each month help you stay on the field longer and serve with less stress. For Khmer staff, it can mean helping family wisely without taking loans you cannot repay, and saying no kindly when a purchase would trap you. For international staff, it can mean being honest with supporters and planning ahead for trips home or emergencies. The idea of working to learn also fits base life: serving in the cafe, in hospitality or in community service can teach skills like communication and handling money that will help for years. Leaders can help their teams by teaching simple budgeting in a kind, practical way, without shame. And ministries can think about small projects that bring steady support over time. Being faithful with what God provides, a little or a lot, is part of good stewardship.",
   "oneLine": "Understand where your money comes from and where it goes, and grow things that put money in, not take it out.",
   "cover": {
    "bg": "plum",
    "fg": "marigold",
    "a": "marigold",
    "b": "paper",
    "motif": "coins",
    "layout": "top",
    "font": "display",
    "upper": true
   }
  },
  {
   "id": "think-like-a-freak",
   "title": "Think Like a Freak",
   "author": "Steven D. Levitt & Stephen J. Dubner",
   "year": 2014,
   "isbn": "9780062218339",
   "shelf": "habits",
   "mins": 10,
   "vibe": "Ask simpler questions, admit what you don't know, and be brave enough to quit.",
   "bigIdea": "Steven Levitt is an economist at the University of Chicago, and Stephen Dubner is a journalist. Together they wrote Freakonomics, which used data to answer strange questions about everyday life. In this book they open up their toolbox and share how they think, so readers can use the same approach on their own problems, big or small. Their way of thinking is honest, curious and a bit playful. It does not follow the crowd or protect old opinions. Admit what you do not know. Ask a better or simpler question. Dig for the real cause of a problem, not only the part you can see. Look at the real incentives that drive people, and expect people to respond to them in surprising ways. Tell stories when you want to persuade. And know when it is time to quit. None of this needs a degree in economics. It needs humility, curiosity and a willingness to test ideas instead of only arguing about them. For leaders and teams, these tools help us stop doing things only because we always have, and start solving the problems that really matter.",
   "insights": [
    {
     "emoji": "🤷",
     "title": "Say 'I don't know'",
     "body": "The authors call 'I don't know' some of the hardest words to say. People often pretend to know things so they look smart or confident. That leads to bad decisions, because nobody checks whether the guess is right.\n\nThey point to research by Philip Tetlock, who studied hundreds of experts making predictions about politics and economics. The experts did not do much better than chance, and the most confident ones were often the least accurate. They also describe a study where children in England were asked questions that had no real answer. Many of the children made up an answer instead of saying they did not know.\n\nThe authors say this habit is common in organisations too. Leaders often feel they must have an answer, so they guess, and nobody tests whether the guess was right. Plans keep going for years without anyone knowing if they work.\n\nAdmitting 'I don't know' is the first step to finding out. Then you can gather real information, run small experiments and learn from feedback. For example, try a new idea in one place and not in another, then compare. Being honest about what you do not know is not weakness. It is the beginning of real learning."
    },
    {
     "emoji": "❓",
     "title": "Change the question",
     "body": "How you frame a problem decides which answers you can see. If you ask the wrong question, even hard work will not help much.\n\nThe book tells about Takeru Kobayashi, a young man from Japan who entered a famous hot dog eating contest in New York. The record was about 25 hot dogs in 12 minutes. Other eaters asked how they could eat more hot dogs. Kobayashi asked a different question: how can I make hot dogs easier to eat? He broke each hot dog in half and dipped the bread in water. He practised at home, filmed himself, and tested his methods carefully, like a scientist. In his first contest he ate 50, about double the old record.\n\nHe also refused to accept the old record as a real limit. He believed it was a barrier people had built in their own minds, so he simply ignored it.\n\nThe authors say many big problems are framed in a way that hides the real issue. When you are stuck, try rewriting your problem in a new way. Make it smaller, turn it around, or ask what everyone else is not asking. A small change in the question can open answers no one has seen before."
    },
    {
     "emoji": "🦷",
     "title": "Find the root cause",
     "body": "Many problems are treated at the surface, because the surface is easy to see. The authors encourage readers to dig down to the root cause, the thing that keeps the problem alive. It is like pulling a weed out by the roots, instead of only cutting the leaves.\n\nTheir main story is about Barry Marshall, a young doctor in Australia. For many years, doctors believed stomach ulcers were caused by stress or spicy food. Patients took medicine for life, and some needed surgery. Marshall and his colleague Robin Warren believed that a kind of bacteria was the real cause. Other doctors did not take them seriously. So Marshall did something dramatic: he drank a liquid full of the bacteria himself. He became sick, which helped show that the bacteria could cause the illness, and that it could be treated with antibiotics. Years later, he and Warren received the Nobel Prize for this work.\n\nThe authors note that people often argue loudly about the obvious causes of a problem, while the real roots lie further back and are harder to see.\n\nFinding root causes is not always easy, and it can make people uncomfortable. But treating only the symptoms means the problem keeps coming back. Keep asking why until you reach something you can really change."
    },
    {
     "emoji": "🧒",
     "title": "Think like a child",
     "body": "Children ask simple, obvious questions and are not afraid to look silly. The authors encourage adults to do the same.\n\nThey note that magicians often say children are harder to fool than adults. Adults think they know where to look, so they follow the magician's direction. Children look at things adults ignore, so they are more likely to notice the trick.\n\nThe authors also encourage thinking small. Big problems are tempting, but they are often too complicated to solve all at once. In some poor areas, many children were doing badly at school. Big plans to change the whole school system were slow and expensive. But one simple question was: can the children see the board? Many could not. Giving children glasses helped their learning a lot, at a low cost.\n\nThey add one more lesson from children: have fun. Children are not afraid to enjoy what they do, and people who enjoy their work tend to keep working at it longer and notice more.\n\nSo ask simple questions out loud, even if they seem obvious. They often show what everyone else has missed. And do not be ashamed to start with a small piece of a big problem. Small wins can grow into big change over time."
    },
    {
     "emoji": "🎁",
     "title": "Incentives are everything",
     "body": "To understand why people do what they do, look at their incentives. These can be financial, social or moral. The authors say the key is to find out what people really care about, which is often different from what they say.\n\nThey describe a study in California about saving electricity. Different homes got different signs on their doors. Some said saving energy would save money. Some said it would protect the environment. Some said it was good for society. One said that most of your neighbours were already saving energy. People said the neighbour message would matter least to them. But it was the one that changed their behaviour the most.\n\nThey also tell about the charity Smile Train, which helps children born with a cleft lip. It tried a surprising letter: give once, and we will never ask you again. Many people gave, and many did not even use the chance to stop hearing from the charity. The offer met a real desire people had: to give without being asked again and again.\n\nSo watch what people do, not only what they say. Treat people with respect, and design your plans around what truly moves them, not around what you think should move them."
    },
    {
     "emoji": "🐍",
     "title": "When incentives backfire",
     "body": "Incentives are powerful, but they can go wrong. People are clever, and they will often find a way to get the reward without doing what you really wanted.\n\nThe authors tell a funny family story about potty training a young daughter. To help, they offered her a few sweets every time she used the toilet. It worked quickly, a little too quickly. She soon learned to go many times, a tiny bit each time, so she could earn more sweets.\n\nThey also describe a famous case from colonial India, sometimes called the cobra effect. To reduce the number of cobras, the government offered money for every dead snake. Some people started breeding cobras to collect the reward. When the program was stopped, the snakes were let go, and the problem became worse. In another case, scientists who paid farmers for each piece of dinosaur bone found that people broke the bones into smaller pieces to earn more.\n\nThe lesson is not to stop using incentives. It is to think carefully before you start. Ask yourself how someone could game this plan. Then watch what really happens, and be ready to change the plan quickly when people respond in ways you did not expect."
    },
    {
     "emoji": "🍬",
     "title": "Let people sort themselves",
     "body": "Sometimes you can set things up so people show who they really are by their own choices. The authors describe this as teaching your garden to weed itself.\n\nOne of their examples comes from the Bible: King Solomon and the two women who both claimed the same baby. Solomon offered to cut the baby in two. The real mother begged him to give the baby to the other woman instead, and by this he knew she was the true mother.\n\nThey also tell about the rock band Van Halen. Its contract asked for a bowl of candies backstage, with all the brown ones removed. The contract had many important safety rules for the heavy stage equipment. If the band found brown candies, they knew the venue had not read the contract carefully, so they checked everything else again.\n\nAnother example is the online shoe company Zappos. After new workers finished their training, the company offered them money to quit. Most stayed. The ones who took the money were probably not a good fit, and the ones who stayed had shown they really wanted the job.\n\nA small, clever test can show what big questions cannot. It lets people reveal the truth through their own actions."
    },
    {
     "emoji": "🗣️",
     "title": "Persuading people",
     "body": "Facts alone rarely change minds. The authors note that people often hold on to their beliefs even when the evidence says otherwise, because strong opinions are often tied to identity and to the group we belong to. Changing your mind can feel like leaving your friends.\n\nSo how can you persuade someone who does not want to be persuaded? They give some simple advice. First, understand that it is hard, and that your own opinion may be shaped by your group too. Be humble, and do not pretend your idea is perfect. Admit its weak points; this makes people trust you more. Second, admit the strong points of the other side. Third, do not insult people who disagree. Insults only make people defend themselves and stop listening.\n\nFinally, tell stories. People remember a good story much longer than a list of numbers. A story shows how things happen over time, and it helps people feel why something matters. A simple everyday example: a story about one child helped by a project often moves people more than a chart about a thousand children.\n\nThe goal is not to win an argument. It is to help people see something new, while keeping the relationship strong."
    },
    {
     "emoji": "🚪",
     "title": "The upside of quitting",
     "body": "We often keep going with something that is not working. One reason is 'sunk cost': we think about the time and money we already spent and do not want to waste it. Another is that we forget 'opportunity cost': everything else we could do with that time and energy. Many of us also grew up believing that quitting means failure.\n\nLevitt set up a website where people facing a hard choice, like whether to quit a job or end a relationship, could flip a digital coin. Heads meant make the change; tails meant stay. Months later, people who had made the change, including those who quit, said they were happier on average than those who stayed.\n\nThe authors also say that failing early and cheaply is a kind of success. A small failure can save you from a big one. They mention a tool called a premortem. Before a project starts, the team imagines that it has already failed, and each person writes down why. This helps people share worries they might otherwise keep quiet.\n\nQuitting one thing can free you for something better. The question is not whether quitting is good or bad, but whether staying is still the best use of your life."
    }
   ],
   "tryThis": [
    "Next time you are stuck, rewrite your problem as a smaller, simpler question.",
    "Say 'I don't know, let's find out' at least once this week.",
    "Look at one ongoing activity and ask: if we were not already doing this, would we start it today?"
   ],
   "forUs": "On a base it is easy to keep doing things because we always have. These tools can help us serve better. Why are fewer people coming to this event? What do our students and our Khmer neighbours really value, not just what they say to be polite? Be humble enough to say 'I don't know', and test small ideas before making big plans, like trying a new cafe menu or outreach time for one month and then comparing. When a problem keeps coming back in a team, ask why several times until you find the root, instead of only fixing the same thing again. Think about incentives too. Rewards and rules can teach people the wrong lesson, so watch what really happens. When you share a vision with supporters or local leaders, tell real stories, not only numbers, and listen respectfully to those who see it differently. Before a big outreach, try a premortem as a team. And give yourself permission to stop a ministry activity that is no longer bearing fruit, so energy can go where God is moving. Stopping one good thing is not a failure if it makes room for what God is asking of us now.",
   "oneLine": "Admit what you don't know, ask simpler questions, follow the incentives, and don't fear quitting.",
   "cover": {
    "bg": "paper",
    "fg": "ink",
    "a": "marigold",
    "b": "berry",
    "motif": "apple",
    "layout": "top",
    "font": "sans",
    "upper": true
   }
  },
  {
   "id": "lead-like-jesus",
   "title": "Lead Like Jesus",
   "author": "Ken Blanchard & Phil Hodges",
   "year": 2005,
   "shelf": "habits",
   "mins": 10,
   "vibe": "The best leadership model ever? He washed feet.",
   "bigIdea": "Most leadership books start with skills and techniques. Ken Blanchard, a well-known business writer and co-author of The One Minute Manager, and his friend Phil Hodges start somewhere else: with Jesus. They say he is the greatest model of leadership we have, and that his way works in a family, a church, a school or a company. For them, leadership is any time you try to influence what other people think or do. That means everyone leads somewhere: parents, teammates, friends, small group leaders. So the big question is not if you lead, but how and why. Jesus told his followers that they must not be like the rulers of this world, who use power over people. Among them, the greatest must be the servant. The authors look at four parts of a leader: the heart, the head, the hands and the habits. The heart is about motivation. The head is about beliefs and vision. The hands are about how we act and coach people. The habits are about how we stay renewed. If the heart is wrong, the rest will not stay right for long. That is why this book matters for anyone who serves: it starts with who we are, not only with what we do.",
   "insights": [
    {
     "emoji": "👥",
     "title": "Everyone leads: life roles and organizations",
     "body": "Blanchard and Hodges say there are two kinds of leadership. The first is life role leadership. This is the influence you have as a parent, a husband or wife, a son or daughter, a friend or a neighbor. The second is organizational leadership. This is the influence you have because of a position, like a team leader, a manager or a pastor.\n\nThe authors point out an important difference. In an organization, people can resign, or you can be moved to another job. But in life roles, the relationships last. You cannot resign from being someone's mother or brother. So the authors say life role leadership often shapes people more deeply than any job title.\n\nThis takes leadership out of the office and into all of life. Think of a simple everyday example: an older sister helping a younger brother with homework is leading. So is a friend who chooses kindness when the group starts to gossip. Nobody gave them a title, but they influence what others think and do.\n\nWhy does this matter? It means every person can learn to lead like Jesus, right where they are. And it reminds people with big titles that the way they treat family and friends counts just as much as the way they run a meeting."
    },
    {
     "emoji": "❤️",
     "title": "The heart: why do you lead?",
     "body": "The first question is about motivation. Am I leading to serve others, or to serve myself? The authors say the heart is where leadership goes right or wrong, and the big enemy is our ego. They turn EGO into a phrase: 'Edging God Out'. This happens when we put ourselves at the center, trust our own strength and want our own way. They say it leads to separation from God and from others, to constant comparison with other people, and to a twisted view of the truth.\n\nThe answer is a different EGO: 'Exalting God Only'. This means we look to God for our worth and security, not to our title or to what people think of us. When our worth is settled in God, we are free to serve without needing applause. We can even celebrate other people's success, because it does not threaten us.\n\nWhy does this matter? A leader with a self-serving heart can still have good plans and good skills. But sooner or later people feel it, and trust breaks. A leader with a serving heart will still make mistakes, but people can tell that the leader is on their side. So the authors invite every leader to start with honest questions about their own heart."
    },
    {
     "emoji": "😨",
     "title": "Pride and fear",
     "body": "Ego usually shows up in two ways. Pride makes us think too highly of ourselves. We want credit, we want control, and we find it hard to admit we were wrong. Fear makes us protect ourselves. We avoid hard conversations, hold on to power, and hide our weak spots so no one sees them.\n\nThe two look different, but they grow from the same root. Both put me at the center instead of God and the people I serve. A proud leader pushes people down and stops listening. A fearful leader stays quiet when people need the truth, or tries to please everyone. Either way, the team suffers. And the same leader can swing between the two, proud one day and afraid the next.\n\nThink of Jesus in the wilderness. He was tempted to prove himself, to grab easy comfort and to take power the wrong way. He said no each time, answered with God's Word and stayed close to his Father. He did not need to prove anything, because he knew who he was.\n\nFor us, the first step is to notice pride and fear when they show up. Name them honestly, without excuses, and bring them to God. What we bring into the light loses much of its power over us."
    },
    {
     "emoji": "🌱",
     "title": "Humility and God-grounded confidence",
     "body": "If pride and fear are the problem, what is the answer? The authors point to two qualities that grow when we exalt God only: humility, and a confidence that rests in God.\n\nHumility is not thinking badly about yourself. The authors explain it as thinking of yourself less, not thinking less of yourself. A humble leader knows their gifts, but also knows those gifts came from God. So they can admit mistakes, ask for help and give credit away. Confidence grounded in God means you do not need to win every argument or please everyone, because your worth is already secure. You can make hard decisions and speak the truth in love.\n\nJesus showed both together. John's Gospel says he knew the Father had put all things under his power, and he knew where he came from and where he was going. Then, with that security, he got up and washed his friends' feet.\n\nThis matters because many leaders swing between too much self-belief and too little. Humility without confidence can become weak and silent. Confidence without humility can become proud. The mix of both, rooted in God's love, is what makes a leader safe to follow."
    },
    {
     "emoji": "🔍",
     "title": "Two quick tests: feedback and succession",
     "body": "How can you tell if a leader has a serving heart or a self-serving one? The authors suggest two quick tests.\n\nThe first is how a leader handles feedback. A self-serving leader often hears criticism as an attack. They defend themselves, punish the messenger or stop listening. Soon people stop telling them the truth. A servant leader sees feedback as a gift. They want to know how they are doing, because they care about the people and the mission more than their image.\n\nThe second test is how a leader thinks about succession, meaning who will lead after them. A self-serving leader may feel threatened by capable people and keep everything in their own hands. A servant leader is glad to train others who might one day do the job even better. Jesus spent much of his three years of ministry with a small group, preparing them to carry on the mission after he left.\n\nYou can use these tests on yourself. Think of the last time someone corrected you. How did you react inside? And ask: am I preparing someone to take my place, or quietly making myself the one nobody can replace? Honest answers show the real state of the heart."
    },
    {
     "emoji": "🧭",
     "title": "The head: a clear vision",
     "body": "Jesus knew who he was and why he came. He had a clear purpose, he taught a clear picture of the future, which he called the kingdom of God, and he lived by clear values. The authors say a servant leader also needs a clear and compelling vision.\n\nThey describe vision in simple parts. Purpose: what are we here to do, and why? Picture of the future: what will it look like if we succeed? Values: what will guide our choices on the way? When Jesus called fishermen to become fishers of people, he gave them a purpose they could understand.\n\nThe authors also say values work best when they are ranked, so people know what comes first when two good values clash. They give the example of Disney theme parks, where safety comes before courtesy, and courtesy comes before efficiency. For Jesus, the order was clear: love God first, then love your neighbor.\n\nServing people does not mean doing whatever they want. First the leader sets the direction with the team. Then the leader turns the pyramid upside down and serves people as they work toward that vision. Without direction, serving gets confusing. With direction, serving helps everyone move the same way."
    },
    {
     "emoji": "🙌",
     "title": "The hands: a coach, not a boss",
     "body": "Jesus took ordinary people and grew them step by step. The authors describe four stages a learner moves through: novice, apprentice, journeyman, and finally master or teacher. At each stage, the leader gives a different kind of help. This builds on Blanchard's earlier work on Situational Leadership.\n\nLook at Peter in the Gospels. When Jesus called him from his fishing boat, he was a beginner who needed clear direction. Later he stepped out of the boat to walk on water, then sank and needed Jesus to catch him. He was learning, with ups and downs. Jesus sent him out with the others to preach and heal, giving him more freedom. After the Holy Spirit came, Peter stood up, preached and helped lead the young church.\n\nGood leaders do the same. Give a beginner clear direction and lots of support. Stay close when they are discouraged and their first excitement fades. As people grow in skill and confidence, give them more freedom and less instruction. The leader changes their style to fit the person, not the other way around.\n\nThe goal is to send people out, not to keep them dependent on you. A good coach is happy when the learner no longer needs them."
    },
    {
     "emoji": "🙏",
     "title": "The habits: stay filled up",
     "body": "You cannot serve well for long if you are empty. Busy leaders often give and give until there is nothing left. The authors say Jesus shows us habits that kept him full, even under huge pressure from crowds, critics and his own friends.\n\nThey name five. Solitude: time alone with God, like when Jesus went to quiet places early in the morning. Prayer: honest talk with the Father, which Jesus also did before big decisions. Knowing and applying Scripture: knowing God's Word well enough to live it, as Jesus did when he answered temptation with Scripture. Accepting God's unconditional love: resting in the fact that you are loved before you do anything. And supportive relationships: a few close friends who know you, encourage you and keep you honest.\n\nThese habits are not extra tasks for super-spiritual people. They are how a leader's heart stays in the right place. When the habits slip, pride and fear grow back fast, and we start to lead from our own strength again.\n\nHere is a simple everyday picture: a phone that is never charged soon stops working, however good it is. Leaders are similar. Small daily rhythms of rest and prayer keep us ready to serve."
    },
    {
     "emoji": "🧼",
     "title": "Serving is the point",
     "body": "On the night before he died, Jesus took a towel and a bowl of water and washed his disciples' feet. This was a servant's job, and Peter at first refused to let him do it. Then Jesus told them to do the same for each other. He also taught that he came not to be served, but to serve and to give his life.\n\nIn this model, success is not how big your title is, or how many people obey you. The authors say a leader should be measured by what happens to the people they lead and to the mission. Do people grow? Are they becoming leaders themselves? Is the work moving forward in a good way? Both matter: good results and good care for people.\n\nThis changes daily choices. A servant leader listens before deciding, shares credit, admits mistakes and is not too proud for small jobs. They ask people what they need to do their work well.\n\nThis is not weakness. Jesus was clear and strong. He spoke hard truths and kept his direction, and he served. That mix of strength and humility is what the authors hope every leader will learn, one day and one choice at a time."
    }
   ],
   "tryThis": [
    "Before a meeting or task you lead this week, ask: am I doing this to serve or to look good?",
    "Notice one moment of pride or fear in yourself and name it honestly to God.",
    "Pick one person you lead and ask: what do you need from me to grow right now?"
   ],
   "forUs": "On a YWAM base almost everyone leads something: a DTS small group, a kitchen team, an outreach team, a ministry like the cafe or community service. And in life roles, we lead as parents, older siblings, roommates and friends. So this book is for all of us, not only base leaders. Try to notice ego in small places, like wanting your idea chosen, feeling hurt when someone gives you feedback, or avoiding a hard talk with a teammate because you fear their reaction. Coach new staff step by step. A new Khmer staff member and a new international volunteer may both be beginners in different ways. One may be new to the tasks, the other new to the language and culture, so give each the help they need. Give Khmer leaders real responsibility and trust, not just tasks, and think about who could lead your ministry after you. Guard your time with God, because a busy base can make even good leaders run on empty. Sometimes washing feet looks like cleaning up after a team meal when no one is watching. Sometimes it looks like listening patiently to a teammate who sees things differently. Jesus is patient with us as we learn, so we can be patient with each other.",
   "oneLine": "Lead from a heart that serves, with a clear vision, patient coaching and daily time with God.",
   "cover": {
    "bg": "laterite",
    "fg": "paper",
    "a": "paper",
    "b": "marigold",
    "motif": "basin",
    "layout": "top",
    "font": "serif"
   }
  },
  {
   "id": "the-4-hour-workweek",
   "title": "The 4-Hour Workweek",
   "author": "Tim Ferriss",
   "year": 2007,
   "isbn": "9780307465351",
   "shelf": "habits",
   "mins": 10,
   "vibe": "Do less of what doesn't matter, so you have more life for what does.",
   "bigIdea": "Tim Ferriss argues that many people waste their best years working long hours for a future they may never enjoy. They wait until retirement to rest, travel or do what they love. Ferriss calls this the deferred life plan. Ferriss is an American writer and entrepreneur. In his twenties he ran a small company selling sports nutrition supplements, and he burned himself out working very long days. Out of that experience he describes the 'New Rich', people who value time and freedom more than a big salary. He offers a four-step plan called DEAL: Definition, Elimination, Automation and Liberation. Definition means deciding what you really want and facing your fears. Elimination means cutting the work that does not matter. Automation means building systems so tasks run without you. Liberation means freedom to live and work from anywhere. His own goal is a small business that runs with little effort, so you can live fully now. Not all of this fits missionary life, and we will be honest about that. But his tools for cutting busywork, protecting focus, delegating well and planning real rest are very useful for anyone with too much to do and too little time.",
   "insights": [
    {
     "emoji": "🎯",
     "title": "D — Define what you really want",
     "body": "Many people never make a change because of a fear they have never looked at closely. Ferriss suggests an exercise called 'fear-setting'. Write down the worst thing that could happen if you make the change. Then write how you could fix the damage or get back to where you are now. Then write what it costs you to do nothing for another six months or a year.\n\nFerriss did this himself when he was burned out running his company. He feared a long trip would ruin his business. When he wrote it out, the worst case was not so bad and could be fixed. So he went, and the business kept going.\n\nHe also helps readers turn vague dreams into clear goals with dates, which he calls 'dreamlining'. You list what you want to have, to be and to do in the next six and twelve months. Then you work out what it would really cost each month. Often, he says, the dream costs less than people expect.\n\nMany of us are not stuck because of real danger, but because of a vague worry we have never written down. Putting fears and hopes on paper makes them clear, and clear things are easier to pray about and act on."
    },
    {
     "emoji": "💡",
     "title": "Question the rules everyone follows",
     "body": "Ferriss says many of the rules we live by are just habits that nobody questions. One is how we measure being rich. Most people look at absolute income: how much money you earn in a year. Ferriss looks at relative income: how much you earn compared to the time you spend earning it.\n\nHere is a simple example in the same spirit as his. One person earns a large salary but works eighty hours a week. Another earns half as much but works only ten hours a week. The first has more money. The second earns more for each hour and has far more free time. For Ferriss, time is part of the pay.\n\nHe questions another rule too: that we should only aim for realistic goals. He argues that because most people think big goals are impossible, they all compete for the same safe, middle-size goals. So aiming very high can sometimes be easier, with less competition and more excitement to keep you going.\n\nFor us, the point is not getting rich. It is noticing which of our 'rules' really come from God, and which are just habit or pressure. We copy some ways of working without thinking. It is worth asking, kindly and honestly, whether there is a better way."
    },
    {
     "emoji": "✂️",
     "title": "E — Eliminate with the 80/20 rule",
     "body": "The 80/20 rule comes from an Italian economist, Vilfredo Pareto. He noticed that about 80% of the land in Italy was owned by about 20% of the people. Ferriss uses the idea more widely: about 80% of results often come from about 20% of causes.\n\nWhen he looked at his own company, he found that a few customers brought most of the money, and another small group caused most of the stress. He stopped serving the difficult ones who gave little, and put his energy into the best ones. His income went up and his stress went down.\n\nYou can ask two simple questions. Which 20% of my activities bring 80% of the good results? Which 20% bring 80% of my problems? Do more of the first and less of the second.\n\nFerriss also says being busy is not the same as being productive. Being busy can even be a way to avoid the few important but uncomfortable tasks. A useless job done very well is still a useless job. So he says to cut first, then speed up. Ask whether a task needs doing at all before you ask how to do it faster."
    },
    {
     "emoji": "⏳",
     "title": "Work expands to fill the time",
     "body": "This is 'Parkinson's Law': a task grows to fill the time you give it. Give a report a whole week and it takes a whole week. Make the deadline tomorrow and you somehow finish it, often just as well. With a short deadline, there is no time to worry about small details, so you focus on what matters.\n\nFerriss says the 80/20 rule and Parkinson's Law work best together. Cut your tasks down to the few important ones, so you can work shorter hours. And give yourself shorter hours, so you are forced to focus only on the important tasks. He suggests a test question: if a health problem meant you could only work two hours a day, what would you choose to do?\n\nHere is a simple everyday example. If you tell yourself you will answer messages sometime this morning, it takes all morning. If you give it twenty minutes before a meeting, you get it done.\n\nShort, clear deadlines push us to stop polishing small things and decide what really matters. Set the finish line before you start, and you will often be surprised how much fits into less time."
    },
    {
     "emoji": "📥",
     "title": "Batch and guard your attention",
     "body": "Checking messages all day breaks your focus again and again, and each time it takes a while to get back. Ferriss suggests checking email only at set times, for example twice a day. He used an automatic reply to tell people when he would read messages and how to reach him if something was truly urgent. He also groups similar tasks together, like paying bills or making calls, and does them in one block.\n\nHe also suggests a 'low-information diet'. Most news, feeds and online noise do not change what we do. They just make us tired and worried. Ferriss suggests a one-week break from news and from reading that you do not need for work. He prefers learning what you need just in time, when you will use it, rather than collecting facts just in case.\n\nHe adds a hard but useful skill: learning to say no, and stopping interruptions before they start. For example, keep meetings short with a clear purpose, and ask people to send their questions together in one message instead of many.\n\nYour attention is limited. Spend it on purpose, not on whatever pings next."
    },
    {
     "emoji": "🦁",
     "title": "Comfort challenges: grow your courage",
     "body": "Ferriss knows that many of his ideas need a little courage. So at the end of several chapters he gives a 'comfort challenge': a small, slightly uncomfortable task to practice for a few days.\n\nOne challenge is to hold eye contact a little longer than usual when talking with people. Another is to stop asking open questions like where do you want to eat, and instead to propose a clear plan, such as a place and a time. He says people are often relieved when someone kindly makes a suggestion. Other challenges help readers practice asking for what they want and saying no.\n\nThe idea behind them is simple. Fear shrinks when we face it in small steps. Each tiny success shows us that the thing we were afraid of was not so dangerous. Over time, we become people who can have honest conversations and make clear decisions.\n\nFor a team leader, proposing instead of only asking can save a lot of time in meetings. Of course, in some cultures a very direct suggestion can feel rude, so wisdom and kindness are needed. But learning to speak up clearly, instead of staying silent and hoping someone else will decide, is a skill worth practicing."
    },
    {
     "emoji": "🤝",
     "title": "Automate and delegate",
     "body": "Ferriss hands repeat tasks to virtual assistants and builds systems, so his business does not need him for every decision. But first he gives a warning: eliminate before you delegate. Never hand off a task that should not be done at all. Then, for tasks that really need doing, write clear steps once and let someone else follow them.\n\nHe also gave his helpers permission to solve customer problems on their own, up to a set amount of money, without asking him. This freed him from many emails, and his team grew more confident. Clear limits and real trust together helped them act.\n\nDelegation can feel strange at first. Many people feel they are the only ones who can do the job right. But often that belief keeps them stuck, and keeps others from learning.\n\nA smaller version works for anyone. Write a simple checklist for a weekly job. Train a teammate. Agree on what decisions they can make without you. You stop being the bottleneck, and others get the chance to grow. Good delegation is not dumping work you do not like. It is trusting people with clear goals and real responsibility."
    },
    {
     "emoji": "🌴",
     "title": "L — Mini-retirements",
     "body": "The last step is Liberation: freedom to work from anywhere and to rest well. Ferriss explains how employees can ask to work remotely, starting with a day or two as a test, and showing their boss that they get more done that way.\n\nThen he suggests that instead of saving all rest for old age, we take longer breaks spread across life. He calls them 'mini-retirements'. He says living in another country for a few months can cost less than people think, and can teach you more than a rushed holiday. He encourages packing light and slowing down, staying long enough in one place to really know it.\n\nOn his own long trip, Ferriss learned languages and studied tango in Argentina. But he admits that endless free time is not the answer. With no purpose, people can feel empty and bored. So he ends the book with what he calls filling the void, encouraging readers to fill their time with learning and with serving others.\n\nThe heart of this is good. Rest and renewal are not just a reward at the very end of life. They are part of a healthy life now. Long before Ferriss, God gave his people a weekly Sabbath."
    },
    {
     "emoji": "⚖️",
     "title": "Where we see it differently",
     "body": "The book is built around automated income, a small business Ferriss calls a 'muse', and escaping work you dislike. Some of his tactics also push hard against rules and other people, which not every reader will feel good about. Missionaries on raised support are not trying to earn more with less effort.\n\nOur work is relational and comes from a calling. Many of our most important moments cannot be batched or planned: a long talk with a struggling student, a meal with a neighbor, an unplanned time of prayer, a visit to a sick friend. People are never tasks to outsource. Jesus often let interruptions become ministry.\n\nStill, the tools can serve a good goal. Cutting busywork can give you more time for people. Clear steps can help new staff serve with confidence. Batching messages can protect time for prayer and study. Planned rest can keep you healthy in the field for many years.\n\nSo take the tools, not the whole goal. Use them with wisdom and with love for the people around you. And when you do save time, ask God what that time is for."
    }
   ],
   "tryThis": [
    "List your weekly tasks and circle the 20% that bring most of the good fruit.",
    "Check messages at two or three set times a day for one week.",
    "Write simple step-by-step notes for one task you always do, so someone else could do it."
   ],
   "forUs": "On a base, life is full of meetings, messages and small jobs that can crowd out the things only you can do: discipling, praying, preparing teaching, being present with people. Use the 80/20 question with your team: which activities really bear fruit, and which just keep us busy? You may find a weekly meeting that could be shorter, or a report nobody reads. Batch admin and messages into set times, so you can give full attention to people the rest of the day. Write down simple processes, so new Khmer and international staff can step in with confidence, and give them real trust to make decisions. If something scares you, like a hard conversation or a new ministry idea, try writing out the worst case and how you would recover. Plan real rest between schools and outreaches, instead of waiting until you are exhausted. Sabbath was God's idea long before mini-retirements, and it is a gift, not a reward. Our aim is not a four-hour week. It is to be faithful and fruitful for many years without burning out, and to use the time we save to love God and people well.",
   "oneLine": "Cut the busywork, focus on what bears fruit, and build real rest into life now.",
   "cover": {
    "bg": "cobalt",
    "fg": "paper",
    "a": "marigold",
    "b": "paper",
    "motif": "hammock",
    "layout": "top",
    "font": "sans"
   }
  },
  {
   "id": "the-7-habits-of-highly-effective-people",
   "title": "The 7 Habits of Highly Effective People",
   "author": "Stephen R. Covey",
   "year": 1989,
   "isbn": "9780743269513",
   "shelf": "habits",
   "mins": 10,
   "vibe": "Character first, tips second. Change starts on the inside.",
   "bigIdea": "Stephen Covey was an American teacher and leadership consultant. During his doctoral studies he read about two hundred years of American writing on success. Older books focused on character, like honesty, patience, humility and hard work. Newer ones focused more on image, techniques and quick tricks. Covey says real effectiveness comes from character and lasting principles, working from the 'inside out'. He also shows how the way we see things, our paradigm, shapes everything we do. On a subway train in New York, he was annoyed by a father who let his children run wild, until the man said their mother had died about an hour earlier. In a moment, Covey saw everything differently, and his feelings changed too. His seven habits move us from dependence to independence, and then to interdependence, where we achieve more together than alone. Habits 1 to 3 are about leading yourself, which Covey calls the private victory. Habits 4 to 6 are about working well with others, the public victory. Habit 7 keeps you renewed. This matters for anyone who leads or serves, because in the long run people trust who we are more than any technique we use.",
   "insights": [
    {
     "emoji": "👓",
     "title": "See differently: paradigms and principles",
     "body": "A paradigm is the way we see the world, like a map in our head. Covey says we do not see the world as it is. We see it as we are. If our map is wrong, working harder will not help us find the way.\n\nHe tells how, in a class, half the students were shown a drawing of a young woman and the other half a drawing of an old woman. Then everyone was shown a third picture that mixed the two. Each group saw what they had been prepared to see, and they argued until they slowly began to see the other picture too.\n\nCovey says there are principles that do not change, like fairness, honesty, service and human dignity. He compares them to a lighthouse. In one story, a ship's captain at night orders another light to move out of his way. The reply comes back that it is a lighthouse. The ship has to change course, not the lighthouse.\n\nThis matters because lasting change starts with how we see. If we want to change a situation, we often need to change ourselves first, and to do that we need to change how we see. Covey calls this working from the inside out."
    },
    {
     "emoji": "🔑",
     "title": "Habit 1: Be proactive",
     "body": "Between what happens to you and how you respond, there is a space, and in that space you have a choice. Covey tells the story of Viktor Frankl, a Jewish psychiatrist held in Nazi death camps. Frankl lost almost everything, but he saw that no one could take away his freedom to choose his attitude.\n\nCovey points out that the word responsibility can be read as response-ability: the ability to choose your response. Proactive people take responsibility for their choices. They focus on their 'circle of influence', the things they can actually change. Reactive people focus on their 'circle of concern', the things they worry about but cannot change, and they feel more and more powerless. As proactive people act, their circle of influence often grows.\n\nListen to your words. Reactive language sounds like 'there is nothing I can do' or 'that is just how I am'. Proactive language sounds like 'I can choose another way'. Small changes in words can lead to big changes in action.\n\nCovey suggests a simple start: make a small promise and keep it. Each kept promise builds trust in yourself. He also invites readers to try a 30-day test of working only on what they can influence."
    },
    {
     "emoji": "🗺️",
     "title": "Habit 2: Begin with the end in mind",
     "body": "Covey asks readers to imagine their own funeral. Family, a friend, a coworker and someone from church or community each speak about your life. What would you want them to say?\n\nThis picture shows what really matters to you. Covey says all things are created twice: first in the mind, then in reality. A house is first a plan on paper, then a building. Your life works the same way. If you do not decide what you want it to become, other people and circumstances will decide for you.\n\nCovey also asks what sits at the center of your life. Some people center their life on work, money, a spouse, pleasure, or even an enemy. When that thing is shaken, they are shaken too. Covey encourages a center built on unchanging principles, which gives stability, wisdom and direction.\n\nSo he suggests writing a personal mission statement based on your values and your main roles, like son or daughter, teammate, leader and friend. It is not written in one night. You return to it, improve it, and let it guide daily choices, so you live on purpose and not by accident."
    },
    {
     "emoji": "📅",
     "title": "Habit 3: Put first things first",
     "body": "Covey sorts tasks with two questions: is it urgent, and is it important? This makes four boxes. Many of us live in the urgent and important box: crises, deadlines and problems. Others get pulled into urgent but unimportant things, like many interruptions and some meetings. Others drift into things that are neither, like endless scrolling.\n\nThe secret is the important but not urgent box. It holds planning, building relationships, preventing problems, learning and rest. Nothing forces us to do these today, so they get pushed aside. But the more time we spend here, the fewer crises we face later. For example, a regular friendly talk with a teammate can stop a big conflict before it starts.\n\nCovey's practical tool is weekly planning. List your roles, choose one or two important goals for each role, and put those into your week first. Then fit other tasks around them. In his view, the key is not to rank what is already on your schedule, but to put your priorities on the schedule first.\n\nTo make room, you will need to say no to some good things, kindly and without guilt, because you are saying yes to something better."
    },
    {
     "emoji": "🏦",
     "title": "The emotional bank account",
     "body": "Before Habits 4 to 6, Covey explains trust with a simple picture: the emotional bank account. Like a real bank account, a relationship has deposits and withdrawals. Deposits build trust. Withdrawals use it up. With high trust, even a clumsy word is understood. With low trust, every word is suspected.\n\nCovey names six main deposits. Understand the other person, so you know what really matters to them. Pay attention to little things, like small kindnesses. Keep your commitments. Make expectations clear. Show personal integrity, which includes being loyal to people who are not in the room. And when you make a withdrawal, apologize sincerely.\n\nHe tells of a friend whose son loved baseball. The father had no interest in baseball himself, but he took his son on a long trip to see major league games. He did it because his son mattered to him more than baseball did. What counts as a deposit depends on the other person, not on us.\n\nThis is why Covey puts the private victory first. Habits 1 to 3 make us people who keep our promises, so we have something real to give in our relationships. Trust is built slowly, deposit by deposit, but it can be lost quickly."
    },
    {
     "emoji": "🤝",
     "title": "Habit 4: Think win-win",
     "body": "Habit 4 says life is not a competition where someone must lose. Covey describes several ways people think when they work together. Win-lose means I win only if you lose. Lose-win means I give in to keep the peace, but often feel bitter inside. Lose-lose happens when two people care more about hurting each other than doing well. Win-win looks for a solution that is good for both sides.\n\nWin-win grows from what Covey calls an abundance mentality: the belief that there is plenty for everyone. A scarcity mentality sees life as one small pie, so if you get a big piece, there is less for me. People with a scarcity mentality find it hard to share credit or be happy for others. People with an abundance mentality can celebrate other people's success.\n\nWin-win needs both courage and consideration. Courage to say clearly what you need, and consideration to care about what the other person needs.\n\nCovey adds an honest option: win-win or no deal. If we cannot find something good for both of us, we agree kindly not to go ahead, instead of forcing a bad agreement. This protects the relationship, which is often worth more than winning one argument."
    },
    {
     "emoji": "👂",
     "title": "Habit 5: Seek first to understand",
     "body": "Most of us listen while planning our answer. We give advice before we understand the problem. Covey compares this to an eye doctor who hears that you cannot see well, takes off his own glasses and tells you to wear them because they work for him. Of course they do not help you.\n\nCovey says we often answer from our own life story. We quickly evaluate, by agreeing or disagreeing. We probe, asking questions from our own point of view. We advise, based on our own experience. Or we interpret, explaining the other person by our own feelings. None of these is always wrong, but done too early they block real understanding.\n\nInstead Covey asks for empathic listening: listening until you really understand the other person's feelings and point of view, from their side. This means reflecting back what you hear in your own words, without rushing to judge or fix. People who feel understood relax and open up.\n\nThe second half of the habit is to then be understood. After listening well, share your own view clearly and with respect. This order matters. When people feel heard, they are far more ready to listen to you."
    },
    {
     "emoji": "🧩",
     "title": "Habit 6: Synergize",
     "body": "Synergy means the whole is greater than the sum of the parts. When people with different views respect each other and stay open, they can find a 'third alternative', a way that is better than either first idea.\n\nCovey gives a family example. A husband has planned a holiday at a lake, with fishing he has looked forward to for months. But his wife wants to visit her sick mother, who lives far away, at the same time. Each could fight to win, or one could give in and feel bitter. Instead they listen deeply to each other and look for a new plan that meets the real needs of both.\n\nThe key is valuing differences. If two people always think the same, one of them is not really needed. Different cultures, personalities and skills are not problems to fix. They are the raw material for better ideas. Covey notes that even in nature, plants growing close together can help each other grow stronger.\n\nSynergy does not happen by force. It grows from trust, from the courage to be honest and from humble listening. That is why Habits 4 and 5 come first."
    },
    {
     "emoji": "🪚",
     "title": "Habit 7: Sharpen the saw",
     "body": "Covey tells of a man working hard to cut down a tree with a dull saw. Someone asks why he does not stop to sharpen it. He says he is too busy sawing. He works hard but gets little done.\n\nHabit 7 is about renewal in four areas. Physical: sleep, food, exercise and rest. Mental: reading, learning and thinking. Social and emotional: serving others and building deep relationships. Spiritual: prayer, reflection and anything that reconnects you to your deepest values. Covey suggests spending some time on these every day.\n\nCovey also uses an old fable about a goose that laid golden eggs. A greedy farmer killed the goose to get all the eggs at once, and ended up with nothing. Real effectiveness means caring for the goose, your health and relationships, not only the eggs, your results.\n\nRenewal keeps all the other habits alive. Covey describes growth as an upward spiral: we learn, we commit, and we do, and then we learn again at a higher level. Our conscience guides this spiral. Without renewal, even good habits slowly wear down."
    }
   ],
   "tryThis": [
    "Write down one worry and one thing in it that is inside your circle of influence. Act on that part.",
    "On Sunday, plan two important but not urgent things into your week.",
    "In one conversation, repeat back what the other person said before you give your opinion."
   ],
   "forUs": "A YWAM base is a picture of interdependence: Khmer and international staff from many cultures sharing a mission, a kitchen and a schedule. Covey reminds us that this only works when each of us also leads ourselves well, so the private victory comes first: keeping small promises, planning our week and staying close to God. Habit 5 is gold here, because so many misunderstandings come from language and culture, not bad hearts. Before you correct a teammate, try to understand what they meant and what their culture expects. Make deposits in each other's emotional bank account, like keeping your word, learning someone's story and apologizing quickly. Look for win-win when teams disagree, and value different cultural views as a way to find a better third option. Covey wrote for everyone, but much of this sounds like Jesus: serve, listen, keep your promises, and take time to be renewed by God. Try weekly planning around your roles in ministry, such as staff member, small group leader, friend and learner. Protect time for prayer, rest and friendship before the urgent things fill your week. Small changes from the inside out can bless a whole team.",
   "oneLine": "Lead yourself from the inside out, then work with others in trust, and keep renewing yourself.",
   "cover": {
    "bg": "teal",
    "fg": "paper",
    "a": "paper",
    "b": "marigold",
    "motif": "compass",
    "layout": "top",
    "font": "serif"
   }
  },
  {
   "id": "the-compound-effect",
   "title": "The Compound Effect",
   "author": "Darren Hardy",
   "year": 2010,
   "isbn": "9781593157241",
   "shelf": "habits",
   "mins": 10,
   "vibe": "No magic shortcut. Just small choices, done again and again, for a long time.",
   "bigIdea": "Darren Hardy was the publisher of SUCCESS magazine and spent years interviewing and learning from high achievers. His conclusion is simple, maybe too simple to feel exciting. Success is not about one big moment or a secret trick. It comes from small, smart choices repeated consistently over time. Each choice looks too small to matter, which is why it is easy to skip. Eating one donut will not make you sick. Reading ten pages will not make you wise. But over months and years, small choices add up, like interest on money in the bank. This works in both directions. Small bad habits also add up, slowly and quietly, until one day the result appears and we wonder how it happened. Hardy sums it up as a formula: small, smart choices, plus consistency, plus time, equals a radical difference. The book walks through how to make better choices, how to build good habits, how to keep momentum, how to manage the influences around you, and how to speed up your results. For anyone who leads or serves, this is good news. You do not need to be extraordinary. You need to be faithful in small things, day after day.",
   "insights": [
    {
     "emoji": "🪙",
     "title": "The magic penny",
     "body": "Hardy asks: would you take three million dollars in cash today, or one penny that doubles every day for 31 days? Most people take the cash. After 20 days the penny is still only worth a few thousand dollars, and it looks like a bad choice. Only in the last days does it jump past the cash. By day 31 it is worth more than ten million dollars.\n\nThe lesson is that compounding is slow and quiet at the start. The big results come late. That is why most people quit too early. They exercise for two weeks, see no change, and stop. They try a new habit for a month, feel nothing new, and give up. Hardy says a culture of instant results makes this worse, because we expect quick change.\n\nThe same is true in reverse. Small slips also look harmless for a long time, until the result finally shows. Nobody gains weight from one meal, or loses a friendship from one rude word.\n\nIf you understand the penny, you can stay patient in the boring middle. Keep doing the right small thing, even when it seems to be doing nothing. It is working under the surface, and the reward often comes later than you expect."
    },
    {
     "emoji": "👬",
     "title": "Three friends, three paths",
     "body": "Hardy imagines three friends, Larry, Scott and Brad, who grew up together and have similar lives, incomes and health. Larry changes nothing. Scott makes small good changes. He reads about ten pages of a helpful book a day, listens to something useful on his drive to work, and eats a little less each day. Brad makes small bad changes, like buying a big new TV, watching more of it, and snacking more.\n\nAfter five months, nobody can see a difference. After a year, still not much. But after about two and a half years, Scott is healthier and growing in his work and his marriage, while Brad is heavier, less happy and struggling.\n\nNone of their daily choices looked dramatic. That is the point. Life is not usually changed by one big decision, but by the little ones we hardly notice. The difference between the friends was not talent or luck. It was small choices, repeated day after day, until they added up to very different lives.\n\nAsk yourself which friend your daily choices are making you. And remember that you can start making Scott's kind of choices today. It is never too late to begin, and the first small step is enough for now."
    },
    {
     "emoji": "🙋",
     "title": "Take 100% responsibility",
     "body": "Hardy says you cannot control everything that happens, but you are fully responsible for your choices and responses. Stop blaming luck, your boss, your background, the economy or the weather. Even when something is not your fault, how you respond is still your choice.\n\nHe tells how he took this into his marriage. For one year he wrote down, every day, something he appreciated about his wife. Looking for good things changed how he saw her, and their relationship grew warmer. At the end of the year he gave her the journal as a gift, and she was deeply moved. He did not wait for her to change first. He changed what he could control.\n\nHe also says to track your choices. Carry a small notebook and write down what you actually do in one area, like spending money or eating, for a week or more. Most people are surprised by what they see. As a simple everyday example, small daily costs like snacks or drinks often add up to far more than we guess.\n\nTracking shows you the truth, and you cannot change what you do not notice. Awareness is the first small step toward a big change."
    },
    {
     "emoji": "🍀",
     "title": "Make your own luck",
     "body": "Many people explain success by luck. Hardy does not see luck as something that simply falls from the sky. He gives a formula instead: preparation, plus attitude, plus opportunity, plus action, equals luck.\n\nPreparation is the personal growth you do before the chance appears, like learning a skill or a language. Attitude is how you see things: do you look for possibilities, or only for problems? Opportunity is the good thing that comes your way. Hardy says opportunities are all around us, but many people do not notice them. Action is the part many people skip: actually doing something when the chance comes.\n\nHere is a simple everyday example. Two young people hear that a team needs someone who can translate. One has practiced English a little every day for a year, believes they can help, and offers. The other never practiced and stays quiet. People may say the first one was lucky. But the 'luck' was built slowly, through small choices long before the moment came.\n\nThis connects to the whole book. Small daily choices prepare you, so that when an open door appears, you are ready to walk through it."
    },
    {
     "emoji": "🔄",
     "title": "Build habits with a strong why",
     "body": "Willpower alone runs out. Hardy says what keeps you going is a strong reason, your 'why'. He calls this 'why-power'. When your goal is connected to your values and the people you love, you keep going when you feel tired or bored. He encourages readers to write down their core values and to set goals that fit them.\n\nTo break a bad habit, find its triggers. What time, place, feeling or person sets it off? Then remove what you can, like clearing junk food from the house. Swap the bad habit for a better one, rather than just leaving an empty space. Some habits you can ease out of slowly. Others you need to stop all at once.\n\nTo build good habits, start small, plan ahead and tell people. Hardy suggests finding a buddy with the same goal, because it is easier to keep going together. A little friendly competition or accountability makes a big difference. He also says to celebrate progress along the way.\n\nHere is a simple everyday example. Someone who learns a language because they love their neighbors will keep going longer than someone who only wants a certificate. A deep why carries you through the dull days."
    },
    {
     "emoji": "🎢",
     "title": "Momentum",
     "body": "Starting something new is hard. Hardy compares it to pushing a heavy merry-go-round at a playground. At first it barely moves, and you push with all your strength. But once it is spinning, a small push each time keeps it going fast.\n\nNew habits work the same way. The first weeks need lots of effort. Then routine takes over and the habit gets easier. Hardy encourages morning and evening routines, a set start and end to your day, so good choices happen without much thinking. A good morning routine sets you up for the day, and a good evening routine helps you rest and prepare.\n\nHe also talks about rhythm. Doing something at a steady pace, on the same days and times, helps momentum build. A simple chart where you mark each day you keep the habit can help you see your rhythm.\n\nThe danger is stopping. If you quit for a while and then start again, you are pushing from zero again, and that costs a lot of energy. This is why steady rhythm matters more than big bursts of effort. A short daily practice usually beats a huge effort once in a while. Keep the wheel turning, even slowly, on the hard days."
    },
    {
     "emoji": "🧲",
     "title": "Watch your influences",
     "body": "Three things shape you quietly, often without you noticing. Inputs: what you put into your mind through what you watch, read and listen to. Associations: the people you spend time with, whose habits and attitudes rub off on you. Environment: the spaces and things around you every day.\n\nHardy says to choose them on purpose. Guard your mind from a constant stream of negative news and talk. Instead, fill spare moments, like travel time, with something that helps you grow. Your mind will be filled with something, so choose what it is.\n\nWith people, Hardy suggests looking honestly at who you spend the most time with. Spend more time with people who help you grow, and less with people who pull you down. He also encourages finding a friend who shares your goals, so you can check in with each other and grow together.\n\nWith environment, arrange your space so good choices are easy and bad ones are harder. A simple everyday example: if your Bible or a good book is on your pillow, you are more likely to read it than if it is in a box.\n\nFor followers of Jesus, this is not about leaving friends who struggle. It is about being wise about what shapes us most."
    },
    {
     "emoji": "🚀",
     "title": "Acceleration: a little more than expected",
     "body": "In the last part of the book, Hardy talks about how to speed up your results. Most people stop when they reach the point that feels hard, or when they have done what is expected. Hardy calls these key points 'moments of truth'. What you do at that moment makes a big difference.\n\nHe uses exercise as an example. When you think you have finished your last push, do a few more. Those extra efforts at the edge are often what bring real change. The same is true in work and relationships. When you have done the expected job, add a little extra.\n\nHardy also encourages doing the unexpected, and going beyond what people expect from you. Small surprises of care and quality make people remember you, and these extras compound too, just like the small daily choices.\n\nThis is not about working until you collapse. It is about not quitting at the first point of discomfort, and adding a little more love and effort at key moments. Over time, the gap between good enough and excellent is often made of these small extras. Jesus spoke about going the extra mile, and Hardy's idea fits well with that."
    }
   ],
   "tryThis": [
    "Pick one small good choice and do it every day for seven days.",
    "Track one area, like phone time or spending, for a week without changing anything. Then look.",
    "Write down your 'why' for one goal and put it somewhere you will see it daily."
   ],
   "forUs": "Mission work rarely has quick wins. Language learning, discipleship, trust between Khmer and international staff, and fruit in a village all come from small faithful steps over years. This book is a good reminder that the daily things count: a few new Khmer or English words, a short time in the Word, a kind word to a teammate, showing up for intercession. Think about your team's small habits too, like how you welcome new students, how you start the day at the cafe, or how you end a hard week together. Be honest about small bad habits as well, like scrolling late at night or complaining, because they compound too. Find a friend on base who shares a goal with you, maybe prayer, exercise or language, and check in with each other each week. When you serve, look for the small extra that shows love, like remembering a name or staying a few minutes longer. Be patient in the slow middle, when nothing seems to change. Jesus said the kingdom is like a tiny seed that grows into a big tree. God often works through small and steady faithfulness, and he sees what is done in secret.",
   "oneLine": "Small, smart choices plus consistency plus time equals big change.",
   "cover": {
    "bg": "ink",
    "fg": "paper",
    "a": "marigold",
    "b": "paper",
    "motif": "expo",
    "layout": "top",
    "font": "sans",
    "upper": true
   }
  },
  {
   "id": "the-power-of-habit",
   "title": "The Power of Habit",
   "author": "Charles Duhigg",
   "year": 2012,
   "isbn": "9780812981605",
   "shelf": "habits",
   "mins": 10,
   "vibe": "Your brain runs on autopilot. Learn how the autopilot works and you can reprogram it.",
   "bigIdea": "Why do we keep doing things we have decided to stop, like staying up late on our phones or eating snacks we do not need? Charles Duhigg, an investigative journalist at the New York Times, set out to understand the science of habits in people, companies and whole communities. Researchers suggest that a large part of what we do each day is habit, not careful choice: how we brush our teeth, the route we take to work, or how we react when we are stressed. Habits save our brains energy, so we can think about other things. But they also mean we can get stuck in patterns we do not want. Duhigg tells many true stories, from a man who lost his memory, to athletes, coffee shops, big companies and churches. His message is hopeful. Every habit follows a simple loop, and once you understand the loop you can change it. The book moves in three steps: habits in our own lives, habits in organizations, and habits in whole societies. For anyone who wants to grow, or who leads and serves others, this is good news. Habits are not destiny. With understanding, patience and often the help of others, they can be rebuilt.",
   "insights": [
    {
     "emoji": "🔁",
     "title": "The habit loop",
     "body": "Every habit has three parts. A cue triggers it, like a time, a place, a feeling, a person or something that just happened. A routine is the behavior itself. A reward is what your brain gets at the end, and it teaches the brain to remember this loop for next time.\n\nDuhigg describes scientists at MIT who watched the brains of rats learning to find chocolate in a maze. At first their brains worked hard the whole time. As the route became a habit, their brains went quiet in the middle and were busy only at the start and the end. The scientists call this chunking: the brain turns a series of actions into one automatic block. He also tells of Eugene Pauly, a man who lost his memory after a serious brain infection. He could not remember new facts and could not even say where his own home was. Yet he learned to take a walk around his neighborhood and find his way back every day, because the habit lived in a different part of his brain.\n\nSo habits run deep, with little thinking. That is good news for good habits, and bad news for bad ones. The first step to change is simply to notice the loop."
    },
    {
     "emoji": "🤤",
     "title": "Craving is the engine",
     "body": "Habits get strong when your brain starts to expect the reward as soon as it sees the cue. That expectation is a craving, and it is the real engine of a habit.\n\nDuhigg describes a scientist, Wolfram Schultz, who studied a monkey named Julio. Julio learned that when a shape appeared on a screen and he pulled a lever, he got a drop of juice. Soon his brain showed pleasure as soon as the shape appeared, before any juice came. When the juice was late or missing, he became upset. The cue had created a craving. Duhigg also tells how an advertising man named Claude Hopkins made toothpaste popular in America about a hundred years ago. His ads told people to feel for a film on their teeth, which gave them a simple cue. The toothpaste also made the mouth tingle, and people began to want that fresh feeling. In the same way, a company could not sell a spray that removed bad smells, until they linked it to the nice moment at the end of cleaning a room.\n\nUnderstanding craving helps us. If we want a good habit to stick, we can make the reward clear and enjoyable, so we start to look forward to it. And when a bad habit pulls at us, we can ask what we are really craving."
    },
    {
     "emoji": "🔧",
     "title": "The golden rule of change",
     "body": "You usually cannot just delete a bad habit. Duhigg's golden rule: keep the same cue and the same reward, but swap in a new routine.\n\nHe tells his own story. Every afternoon he walked to the cafeteria and bought a chocolate chip cookie, and he was gaining weight. He tested different rewards and found that what he really wanted was not sugar but a break and a chat with colleagues. So when the afternoon cue came, he went to talk with a friend instead, and the cookie habit faded. He also tells of Tony Dungy, an American football coach. Dungy did not give his players many new, complicated plans. He trained them to react faster to the same cues they already watched for, so their new routines became automatic.\n\nBut under great stress, old habits often come back. Duhigg says belief helps new habits last. He shows how groups like Alcoholics Anonymous help people replace drinking routines, and how belief often grows in community, and for many people through faith in God. Dungy's team also grew closer and stronger after shared grief brought them together. People change more easily together than alone."
    },
    {
     "emoji": "🗝️",
     "title": "Keystone habits",
     "body": "Some habits start a chain reaction. Duhigg calls them keystone habits. They do not fix everything directly, but they change how people think and work together, and other good things follow.\n\nWhen Paul O'Neill became the leader of Alcoa, a big aluminum company, investors expected him to talk about profit. Instead he said his top goal was worker safety. He asked to be told quickly whenever someone was hurt, together with a plan to stop it from happening again. To make that work, the company had to change how workers reported problems, how managers listened and how ideas were shared. Those changes made the whole company run better, and profits grew.\n\nKeystone habits often create small wins, which build confidence for bigger change. The swimmer Michael Phelps followed the same routine before every race, so he started each one feeling calm and in control. Once, in an Olympic race, his goggles filled with water, but he kept going by counting his strokes, because he had practised for problems. For individuals, habits like regular exercise, keeping a food diary or eating together as a family look small, but they are linked with many other good changes. Look for the one habit that, if it changed, would pull others along with it."
    },
    {
     "emoji": "💪",
     "title": "Willpower can be trained",
     "body": "Willpower works like a muscle. It gets tired with use, but it can grow stronger with practice. Duhigg describes a study where hungry people sat near fresh cookies. Some were allowed to eat them, and others had to eat only radishes. Afterward, the radish eaters gave up much sooner on a hard puzzle, because their willpower was already tired.\n\nHe then tells how Starbucks trained its young staff. Many of them wanted to do well but struggled under stress, especially with an angry customer. Starbucks gave them simple plans for hard moments. One was called LATTE: listen, acknowledge the complaint, take action, thank the customer, and explain what happened. Staff practised these plans until they became habits, so in the hard moment they did not need to think. Duhigg also describes older patients in Scotland recovering from hip or knee surgery. Those who wrote down plans for painful moments, like getting up from a chair, recovered faster.\n\nThe lesson for us is simple. Plan your response before the hard moment comes. Write down what you will do when a known trigger appears. Then, when it comes, you just follow the plan. Duhigg also notes that people keep more willpower when they feel some control and are treated with respect."
    },
    {
     "emoji": "🛒",
     "title": "Make the new feel familiar",
     "body": "Companies study our habits closely, and Duhigg shows how far this can go. The store chain Target asked a statistician, Andrew Pole, to find out which shoppers were expecting a baby. New parents form many new shopping habits, so Target wanted to reach them early. By looking at changes in what women bought, like unscented lotion and certain vitamins, the company could guess with surprising accuracy. Duhigg tells of an angry father who complained that his teenage daughter was getting baby coupons, and later learned that she really was pregnant.\n\nTarget then learned that people felt uneasy when the ads seemed to know too much. So the company placed baby products among ordinary items, like a lawn mower next to the diapers. The offer felt normal, and people used the coupons. Duhigg tells a similar story about the song Hey Ya by OutKast. At first many radio listeners switched it off because it sounded too strange. So radio stations played it between songs people already loved, and soon it felt familiar and became a hit.\n\nThe lesson is that people accept new things more easily when they come wrapped in something familiar. For leaders, this means introducing a new habit by linking it to an old one that people already know and trust."
    },
    {
     "emoji": "🏘️",
     "title": "Habits in groups and movements",
     "body": "Organizations have habits too, often called routines or culture. Some are healthy, and some are dangerous. Duhigg says a crisis can be a chance to change them, because people are more open when they can see something is wrong. He describes a hospital where a culture of fear stopped nurses from speaking up to doctors, and serious mistakes in surgery followed. Only after a crisis became public did leaders finally change the routines.\n\nMovements also grow through habits. In the Montgomery bus boycott in 1955, Rosa Parks had many friends across different groups in her city. Those close friendships, plus looser ties across the community, spread the protest quickly. Then leaders like Martin Luther King Jr. gave people new habits, like meeting and walking together, so the movement kept going and people began to lead themselves.\n\nDuhigg also describes Rick Warren at Saddleback Church. He started small groups so people would build habits of faith in community, not only on Sunday. In the groups, people learned new spiritual habits from each other. For leaders, this means change is not only about inspiring speeches. It grows through relationships and new shared habits that people practise together."
    },
    {
     "emoji": "⚖️",
     "title": "Knowing a habit makes you responsible",
     "body": "At the end of the book, Duhigg asks a hard question. If habits run so deeply, are we responsible for what we do out of habit? He compares two true stories. Brian Thomas, a man in Britain, killed his wife during a night terror while he was asleep, believing he was fighting an attacker. The court decided he was not guilty, because he had no awareness or control at all. Angie Bachmann, a mother who felt lonely and bored at home, began to visit casinos. Gambling became a strong habit, and she lost a huge amount of money, including her family's inheritance, while the casino kept inviting her back.\n\nMany people feel sorry for Angie, and Duhigg does too. Yet he argues that her case is different, because she knew about her habit. Once we know a habit exists, he says, we have the responsibility to change it. He points to William James, the famous thinker, who struggled with deep sadness as a young man. James chose to believe that he could change, and later wrote that much of our life is a mass of habits.\n\nThis is both hard and hopeful. We cannot change what we do not see. But once we see it, change is possible, especially with a plan and with people who walk beside us."
    },
    {
     "emoji": "📝",
     "title": "A simple four-step plan",
     "body": "In a short guide at the end of the book, Duhigg turns everything into four practical steps. First, identify the routine: the behavior you want to change. Second, experiment with rewards. Try a different routine when the urge comes, then wait about fifteen minutes and notice whether you still want the old thing. If not, you may have found the real reward. Duhigg suggests writing down three words about how you feel after each test, so you notice your feelings honestly.\n\nThird, isolate the cue. Most cues fit into five groups: location, time, emotional state, other people, and the action that just happened. When the urge comes, quickly note all five. After a few days, a pattern usually appears. Duhigg did this with his cookie habit and found the cue was the same time every afternoon. Fourth, have a plan. Write it simply: when this cue comes, I will do this new routine, to get this reward.\n\nHere is a simple everyday example. If you check your phone every time you feel lonely at night, the cue may be the feeling, not the time. Your plan might be to message a friend or to pray instead. Small, clear experiments like this make change feel possible, not overwhelming."
    }
   ],
   "tryThis": [
    "Pick one habit you want to change. For three days, each time the urge comes, note the place, time, feeling, people around you and what just happened.",
    "Test what reward you really want by trying a different routine when the cue comes, then check after 15 minutes if the craving is gone.",
    "Plan ahead for one hard moment: decide now what you will do when it comes, and write it down."
   ],
   "forUs": "A base runs on shared habits: morning worship, intercession, meals, staff meetings, how we greet new students. Some help us and some just happen out of tradition. Ask your team which keystone habit could lift everything else, like a weekly team prayer time or eating lunch together across cultures. When you help a DTS student or teammate with a struggle, remember the golden rule: look for the real need behind the habit, and walk with them in community. Many students arrive carrying habits they want to leave behind, and a small group that meets every week can be the place where belief grows and change lasts. Habits also cross cultures, so ask Khmer and international teammates which team habits feel natural to them, and which feel strange. If you want to start something new, like a new prayer rhythm or a new way of serving at the cafe, link it to something people already know and love. On outreach, plan ahead for hard moments, like tiredness or conflict, so the team already knows how it will respond. And stay humble. We all have habits we do not see yet. Lasting change often comes with faith, with friends and with God's grace.",
   "oneLine": "Find the cue and the reward, change the routine, and lasting change becomes possible.",
   "cover": {
    "bg": "paper",
    "fg": "ink",
    "a": "cobalt",
    "b": "marigold",
    "c": "berry",
    "motif": "loop",
    "layout": "top",
    "font": "serif"
   }
  },
  {
   "id": "deep-work",
   "title": "Deep Work",
   "author": "Cal Newport",
   "year": 2016,
   "isbn": "9781455586691",
   "shelf": "create",
   "mins": 10,
   "vibe": "Focus is the new superpower. Most people have lost it. You can get it back.",
   "bigIdea": "Have you ever finished a full, busy day and realized you did nothing important? Cal Newport is a computer science professor at Georgetown University who writes books and research papers, and he has never had a social media account. He calls focused effort with no distractions 'deep work'. It is the kind of work that pushes your mind to its limit, helps you learn hard things and creates real value. Newport says this kind of focus is becoming rare, because phones, chats and busy offices break our attention all day. At the same time it is becoming more valuable, because the world needs people who can learn quickly and do excellent work. So the few people who can still focus deeply will do very well. The book has two parts. The first explains why deep work is valuable, rare and meaningful. The second gives four rules to train it: work deeply, embrace boredom, quit social media or use it with care, and drain the shallows, which means cutting down low-value busy work. Newport is not against technology. He wants us to use our attention on purpose. If you train your focus, you will produce better work, serve others better and find more meaning in what you do.",
   "insights": [
    {
     "emoji": "🌊",
     "title": "Deep vs shallow work",
     "body": "Deep work is hard, focused thinking that creates something new or grows your skill. Shallow work is easy, low-focus tasks like emails, quick messages, meetings and admin. You can do it even while distracted, and almost anyone could learn to do it quickly.\n\nShallow work fills the day and feels busy. But it rarely creates something that lasts. Newport opens with the psychologist Carl Jung, who built a simple stone tower in a quiet village by a lake in Switzerland. He went there to think and write without interruption, and much of his most important work came from that place. Newport describes other famous thinkers and writers who also guarded long stretches of quiet time. He contrasts them with a modern office worker who answers messages all day and goes home tired, but with little to show for it.\n\nWe all need some shallow work. The goal is not to remove it but to keep it in its place. Newport offers a helpful question: how long would it take to train a smart new graduate to do this task? If the answer is only a few weeks, it is probably shallow. Notice how much of your week is deep and how much is shallow. Many people are shocked to find that almost none of it is deep."
    },
    {
     "emoji": "💎",
     "title": "Rare and valuable",
     "body": "Newport's main claim is that the ability to focus deeply is getting rarer, and also more valuable. In a fast-changing world, two abilities help people do well: learning hard things quickly, and producing work of high quality. Both need deep focus.\n\nNewport says we learn hard skills through 'deliberate practice': working at the edge of our ability, with full attention, and getting feedback. You cannot do this while checking your phone every few minutes. He also gives a simple formula. The amount of high-quality work you produce depends on the time you spend multiplied by how intensely you focus. So if you focus more intensely, you can get more done in fewer hours.\n\nIn the first part of the book he also argues that deep work makes life more meaningful. People often feel most alive when they are fully absorbed in a hard and worthwhile task. Psychologists call this state flow. Think of a craftsman shaping wood, or a student finally solving a hard problem. Newport says you do not need a special job to find this. Almost any work can become a craft when you give it your full attention. So deep work is not only about getting more done. It can bring real satisfaction and the joy of doing something well."
    },
    {
     "emoji": "🧠",
     "title": "Attention residue",
     "body": "When you switch from one task to another, part of your mind stays on the first task. A business professor named Sophie Leroy called this attention residue. Her studies showed that people who switched tasks did worse on the next one, because their thoughts were still partly on the first. The effect was strong when the first task was left unfinished.\n\nThis is why a quick look at your phone is never really quick. You read one message, and even after you put the phone down, your mind keeps thinking about it. You may even be planning your reply while you try to read, pray or write. The message took ten seconds, but the distraction lasts much longer.\n\nIn a day full of small checks, you may never reach full focus at all. You are always half here and half somewhere else. Newport says this is a hidden cost of the always-connected life: we feel productive because we are busy, but our thinking is weaker. The fix is simple but not easy. Stay on one thing for a longer block of time, and keep messages for set times. Even one or two hours without switching can make a big difference. Treat your attention as precious, not as something anyone can take whenever they like."
    },
    {
     "emoji": "🌀",
     "title": "Busy is not the same as productive",
     "body": "If deep work is so valuable, why do so few workplaces support it? Newport gives a few reasons. First, the cost of distraction is hard to measure. No one sees the report that was never written or the idea that never came. He calls this a 'metric black hole'. One technology leader at a media company tried to calculate how much staff time went into email, and found it was costing the company a surprising amount of money.\n\nSecond, without clear measures, people do what is easiest in the moment. Always answering messages quickly feels helpful, so it becomes the culture. Newport describes research by Harvard professor Leslie Perlow at a consulting company. She asked each team member to take one planned day a week fully offline. People feared clients would suffer, but they did not. The staff enjoyed their work more and communicated better.\n\nThird, when it is hard to show the value of your work, being visibly busy becomes a way to look productive. Sending many emails and going to many meetings looks like hard work, even when little real progress is made. For leaders, this matters. Do not judge people by how fast they reply. Judge by the real fruit of their work, and give them space to produce it."
    },
    {
     "emoji": "🗓️",
     "title": "Pick your focus style",
     "body": "Newport describes four ways to make time for deep work. Monastic: cut out almost all distractions, like the computer scientist Donald Knuth, who does not use email. Bimodal: give whole days or seasons to deep work and stay open the rest of the time, as Carl Jung did with his tower. Rhythmic: do deep work at the same time every day, so it becomes a habit you do not have to decide about. Journalistic: fit it in whenever a gap appears, which only works for experienced people who can switch into focus quickly.\n\nMost people do best with the rhythmic style. For example, you might give the first 90 minutes of each morning to your most important task. Some people mark each day of deep work on a calendar and try not to break the chain of marks.\n\nNewport also suggests clear rituals: a set place, a set time, simple rules like no internet, and something to support the work, like coffee or a short walk first. Sometimes a big change helps, which he calls a grand gesture. J.K. Rowling checked into an expensive hotel to finish her last Harry Potter book. The new place and the cost told her mind that this work really mattered."
    },
    {
     "emoji": "📊",
     "title": "Execute like a business",
     "body": "Knowing what to do is easier than doing it. Newport borrows four ideas from a business book called The 4 Disciplines of Execution and applies them to deep work.\n\nFirst, focus on the wildly important. Choose a small number of big goals, not a long list, because a clear goal brings energy. Second, act on lead measures. You cannot control the final result directly, but you can control the actions that lead to it. For deep work, the best lead measure is simply the number of hours spent in deep focus. Third, keep a scoreboard you can see. Newport kept a simple card where he made a mark for each hour of deep work. Watching the marks grow pushed him to keep going. Fourth, create a regular time to review. Each week, look at your scoreboard, notice what made a good or bad week, and plan the next one.\n\nHere is a simple everyday example. A staff member learning a new language could set one big goal, mark hours of focused study on a paper on the wall, and review it every Friday. Small, visible progress builds motivation. It also turns deep work from a nice idea into a habit you can actually measure and celebrate."
    },
    {
     "emoji": "😴",
     "title": "Get comfortable with boredom",
     "body": "If you reach for your phone every time you are bored, your brain learns to need something new every few seconds. Then, when you sit down to do hard work, it fights you and wants a distraction. Newport says the ability to concentrate is a skill that must be trained, like a muscle.\n\nSo practise being bored. Wait in line or walk without a screen. Newport suggests planning set times for the internet, instead of set times away from it. Outside those times, stay offline, even if you have nothing else to do. He also suggests working like Teddy Roosevelt, the American president, who studied in short, very intense bursts as a student. Set a tight deadline for a task and push hard to meet it.\n\nAnother practice is 'productive meditation'. While you walk or travel, think about one clear problem. When your mind wanders, gently bring it back. A further training idea is memorizing things, like the order of a deck of cards, to build mental strength. These practices sound simple, even a bit strange. Over time they help your mind stay with one thing for longer, so focus starts to feel natural instead of painful."
    },
    {
     "emoji": "📵",
     "title": "Choose your tools on purpose",
     "body": "Many of us keep an app because it has some small benefit. Newport calls this the any-benefit approach. Instead, think like a craftsman choosing tools. Name your most important goals in life and work. Then ask: does this tool help those goals much more than it hurts them? If not, let it go. He gives the example of a farmer who only uses machines that clearly help the farm, not every machine that is available.\n\nFor social media, he suggests a test. Quit a platform for 30 days without telling anyone. After the month, ask two questions. Would the last month have been clearly better if I had used it? Did people care that I was gone? If both answers are no, you may not need it. Many people discover that very few others even noticed.\n\nHe also warns against filling free time with aimless browsing. Many websites are designed to keep you clicking. Plan your free time with good things, like reading, hobbies, sport or time with friends. Chosen rest is usually more refreshing than endless scrolling. This is not about rejecting technology. It is about choosing tools that serve your life, instead of letting them run it."
    },
    {
     "emoji": "🔚",
     "title": "End the day properly",
     "body": "Newport suggests planning every minute of your work day in blocks, on paper. When things change, and they will, just make a new plan for the rest of the day. The point is not to be strict. It is to choose, not drift.\n\nHe also suggests limiting shallow work on purpose, even agreeing with your boss on how much of your time it should take. He sets a firm time to finish work each day, which forces him to cut low-value tasks. And he says to make yourself a bit harder to reach. Write emails that solve the whole problem in one go, instead of starting long chains of replies. It is also fine not to answer every message, especially when the sender has not made a clear request.\n\nAt the end of the day, use a simple shutdown routine: check your tasks, write a plan for tomorrow, then stop. Newport even says a short phrase to himself to mark that work is finished. Rest is not lazy. Evenings off let your mind recharge and even work on problems in the background. You cannot do deep work all day, so protect your rest too."
    }
   ],
   "tryThis": [
    "Block 90 minutes this week for one important task. Phone in another room, door closed.",
    "Next time you wait in line, do not touch your phone. Just notice and pray.",
    "Create a 3-step shutdown routine for the end of your work day and use it for one week."
   ],
   "forUs": "Base life is full of interruptions: someone at the door, a group chat, a guest who needs help. Those moments matter, and people come first. But preparing DTS teaching, writing a newsletter to supporters, planning outreach or learning Khmer needs protected time. Agree as a team on some quiet hours, so everyone gets space to do their best work. Leaders can help by not expecting instant replies to every message, especially in the evening and on days off. Try one morning a week with no meetings, so deep tasks get the best hours, not the leftovers. Ask together what busy work could be dropped or shared. Many of us learned that a good worker is always available. In some cultures, asking for quiet time can feel rude, so talk about it openly and kindly between Khmer and international staff. Explain why the quiet matters, and when you will be free again. At the cafe or in community service, focus can simply mean giving full attention to the person in front of you, with the phone away. Time alone with God is deep work too. Jesus often went to quiet places to pray, even when crowds were waiting for him.",
   "oneLine": "Protect your focus, because your best work only happens when your whole mind is in the room.",
   "cover": {
    "bg": "paper",
    "fg": "ink",
    "a": "marigold",
    "b": "cobalt",
    "motif": "depth",
    "layout": "top",
    "font": "sans",
    "upper": true
   }
  },
  {
   "id": "the-psychology-of-money",
   "title": "The Psychology of Money",
   "author": "Morgan Housel",
   "year": 2020,
   "isbn": "9780857197689",
   "shelf": "create",
   "mins": 10,
   "vibe": "Money is less about maths and more about how you behave.",
   "bigIdea": "Most people think money is about maths: earn more, spend less, invest well. Morgan Housel, a writer about finance and investing, says doing well with money is not mainly about being smart. It is about behavior: patience, humility, and how you act when things feel scary or exciting. A person with little education can do very well if they behave wisely, while a trained expert can lose everything through pride or greed. In short chapters, Housel tells true stories to show that our past, our feelings and our ego shape our money choices more than spreadsheets do. He looks at luck and risk, the power of time, the danger of never feeling satisfied, the value of saving, and why freedom is the best reward money can give. He does not tell you which investments to buy. Instead he helps you understand yourself, so you can make choices you will not regret later. This matters for everyone, rich or poor, because money touches our worries, our families and our freedom. For leaders and people who serve, it also helps us understand others with kindness, because everyone's money story is different.",
   "insights": [
    {
     "emoji": "🌍",
     "title": "Nobody is crazy",
     "body": "Everyone's money habits make sense to them, based on what they have lived through. Housel notes that people who grew up when prices were rising very fast think about money very differently from people who grew up in calm, stable times. Someone who lived through a big crash may never trust investing again, while someone who has only seen good years may take too much risk. Your own experience feels like the whole truth, but it is only a small part of what has happened in the world.\n\nHe gives a surprising example. In the United States, people with low incomes spend a lot on lottery tickets. To outsiders it looks foolish. But for someone who feels there is no other path to a better life, a ticket feels like buying a dream. It makes sense from inside their story. Housel also points out that many ideas about money, like saving for retirement, are quite new in human history. We are all still learning.\n\nSo before you judge someone's money choices, ask about their story. And look at your own. Some of your strong beliefs about money may come from your family's experience, not from wisdom."
    },
    {
     "emoji": "🎲",
     "title": "Luck and risk are twins",
     "body": "Some success is luck, and some failure is bad luck. Housel says they are two sides of the same coin, because both come from forces outside our control. Every result comes from our own choices plus many things we did not choose.\n\nHe tells the story of Bill Gates, who went to one of very few high schools in the world that had a computer in the late 1960s. That was a huge piece of luck. Gates had a close friend there, Kent Evans, who was just as gifted and shared his dreams. But Kent died in a mountain climbing accident before finishing school. Similar talent, similar start, very different outcome. Gates had the luck, and Kent had the risk.\n\nSo be careful copying one famous person's success, because luck is part of every story. Housel suggests looking at broad patterns from many people, instead of copying extreme examples. And be kind to yourself and others about failures, because not every bad result comes from a bad decision. When things go well, stay humble. When things go badly, learn what you can, but do not carry shame for things you could not control."
    },
    {
     "emoji": "⏳",
     "title": "Time is the secret ingredient",
     "body": "Compounding means small growth that builds on itself over many years. Warren Buffett is a great investor, but Housel says the main secret of his huge wealth is time. He started investing as a child and kept going into old age. Most of his wealth came after his mid-60s. Our minds are not good at imagining this kind of growth, so we often underestimate it.\n\nHousel also tells of Ronald Read, a janitor and gas station worker. He lived simply, saved what he could and invested for decades. When he died, he left millions of dollars, much of it to his local library and hospital. Meanwhile, Richard Fuscone, a highly educated finance leader, lost his fortune by borrowing too much to pay for a very expensive lifestyle. Patience beat brilliance.\n\nGetting money and keeping it are different skills. Getting money often needs risk and confidence. Keeping it needs humility, saving, and some healthy fear that what you have could be lost. Housel says the first goal is to survive and to avoid big risks that could wipe you out. Staying in the game for a long time matters more than big wins, because time can only work for you if you are still there."
    },
    {
     "emoji": "🎨",
     "title": "A few events drive most results",
     "body": "Housel says that in money, business and many parts of life, a small number of events make most of the difference. He calls these the tails. You can be wrong often and still do very well, because a few big successes can outweigh many small failures.\n\nHis example is Heinz Berggruen, an art dealer who built one of the great art collections of the last century, with works by artists like Picasso and Matisse. Housel says the secret was not that he chose every piece wisely. He collected a large number of works and held them for a long time, and a small number turned out to be hugely valuable. Walt Disney's early studio made many short cartoons that lost money. Then one film, Snow White, was a giant success that changed the company. Housel also notes that in a large stock market index, many companies lose most of their value, yet the index still grows because a few companies do extremely well.\n\nThis should give us patience. Most of our efforts will be ordinary. Do not panic when many things do not work. Keep showing up. Housel adds that how you act in a few moments of fear, when everyone else is panicking, can matter more than everything you do on normal days."
    },
    {
     "emoji": "🙈",
     "title": "Wealth is what you do not see",
     "body": "As a young man, Housel worked as a valet, parking cars at a hotel. He saw expensive sports cars and assumed the drivers were rich and impressive. Later he realized many of them were not wealthy at all. They had spent or borrowed their money to buy the car.\n\nExpensive cars and phones show money that was spent, not money that was kept. Real wealth is the savings no one can see. It is the car you did not buy, the upgrade you skipped and the money still in the bank. Housel says being rich and being wealthy are different. Rich is a high income you can see. Wealth is hidden, and it gives you choices later. Because we cannot see other people's savings, it is hard to learn good money habits just by watching others.\n\nHe also describes what he calls the 'man in the car paradox'. When we see someone in a nice car, we rarely think how cool the driver is. We imagine ourselves in that car. So people buy nice things hoping to be admired, but others usually admire the things, not the person. If you want respect, Housel says, kindness and humility will earn far more of it than an expensive car."
    },
    {
     "emoji": "🕊️",
     "title": "Freedom is the real reward",
     "body": "Housel says the best thing money can give you is control over your time. Being able to choose what you do, when you do it and who you do it with brings more happiness than more stuff. He sees this as the highest reward that money pays.\n\nHe notes that many people in rich countries have far more money and comfort than their grandparents had, yet they are not much happier. One reason is that they have less control over their days. They work long hours, answer messages at night, and feel they cannot say no. Many jobs today are done in the head, so work follows people home. Housel also mentions a project where many older Americans were asked about the most important lessons of their lives. Almost no one said that working hard to buy bigger things mattered. They talked about friendships, family and being part of something bigger than themselves.\n\nEven a small amount of savings gives some freedom. It might mean you can wait for a better job, care for a sick family member, or take a break when you need it. Freedom is not only for the rich. It grows a little each time you spend less than you earn."
    },
    {
     "emoji": "🛟",
     "title": "Leave room for error",
     "body": "Plans almost never go exactly to plan. Housel says the most important part of any plan is planning for the plan not working. He calls this leaving room for error, or a margin of safety.\n\nA buffer of savings means one surprise does not destroy you. A medical bill, a broken motorbike or a family emergency can be handled without panic or new debt. Housel also says you can save without a specific reason. You do not need to know what the money is for, because the future will bring things no one can predict. He points out that many of the biggest events in history were surprises that almost no expert saw coming. If even experts are surprised by the biggest events, we should all expect surprises in our own lives.\n\nHe adds a balance. Be hopeful about the long term, but careful about the short term. Things often get better over many years, but the road is full of bumps. Avoid debts or risks that could force you out of the game at the worst moment. Room for error helps you survive the bumps, so you can still be there for the good years."
    },
    {
     "emoji": "🌱",
     "title": "Your future self will be different",
     "body": "Housel warns that we are bad at predicting what we will want in the future. He refers to psychologists who describe the 'end of history illusion'. People of all ages agree that they changed a lot in the past ten years, but they expect to change very little in the next ten. In fact, they keep changing.\n\nThis matters for money and life plans. Here is a simple everyday example. A young person may plan to work very hard for a high salary forever, or to live in one place forever, and then find that marriage, children, health or a new calling changes everything. Housel says this is why extreme plans are risky. If you save nothing and spend everything, or you work so hard that you have no life outside work, your future self may deeply regret it. A balanced middle path is easier to keep going, and keeping going is what lets compounding work over many years.\n\nHe also says it is fine to change your mind. Do not stay stuck in a choice just because you already spent years on it. Letting go of a path that no longer fits is not failure. It is honesty about who you are now, and it frees you to follow what really matters."
    },
    {
     "emoji": "🏁",
     "title": "Know when you have enough",
     "body": "If you keep moving the finish line, you will never feel satisfied. Housel tells of Rajat Gupta, a businessman who rose from a poor childhood in India to lead a famous global company and gain great wealth and respect. Yet he wanted even more, broke the law by trading on secret information, and went to prison. Housel also mentions Bernie Madoff, who already had a successful and honest business before he chose fraud.\n\nHe also shares a well-known story about the writers Kurt Vonnegut and Joseph Heller at a party at a billionaire's home. Heller said he had something the rich man would never have: the knowledge that he had enough.\n\nComparing yourself with others keeps the finish line moving, because there will always be someone with more. Knowing what 'enough' looks like for you is a quiet kind of strength. Housel says some things are never worth risking, however much you could gain: your reputation, your freedom, your family and friends, and the love of the people who matter to you. Knowing when you have enough stops you from taking risks you do not need. It protects what matters most, including your character and your peace."
    }
   ],
   "tryThis": [
    "Write down one money belief you learned from your family growing up. Is it still helping you?",
    "Start a small emergency fund, even if it is just a few dollars each month.",
    "Write one sentence that describes what 'enough' looks like for you right now."
   ],
   "forUs": "Many missionaries live on support, and many local staff support whole families, so money can feel tight and personal. This book is not about getting rich. It helps us be wise with what God has given, avoid comparing ourselves with each other, and keep a little margin so one emergency does not become a crisis. It also reminds us that Khmer and international staff come with very different money stories, and both deserve respect. Some grew up with very little and carry worries about tomorrow. Others grew up with plenty and are learning to live simply. Be slow to judge how others spend. When a teammate asks for help, listen to their story first. In DTS and schools, students may come with debt or family pressure, so talk about money openly and kindly, without shame. Leaders can model patience too, by planning ahead for the base, with a small buffer for repairs and surprises. Generosity helps as well. When we give, even a little, we learn to hold money with open hands. And remember that contentment is a Bible value too: Paul learned to be content with much or with little.",
   "oneLine": "Good money choices come from patience, humility and knowing what is enough, not from being a genius.",
   "cover": {
    "bg": "paper",
    "fg": "ink",
    "a": "marigold",
    "b": "laterite",
    "c": "teal",
    "motif": "cointree",
    "layout": "top",
    "font": "serif"
   }
  },
  {
   "id": "made-to-stick",
   "title": "Made to Stick",
   "author": "Chip Heath & Dan Heath",
   "year": 2007,
   "isbn": "9781400064281",
   "shelf": "create",
   "mins": 10,
   "vibe": "Why some ideas live forever and others are forgotten by lunch.",
   "bigIdea": "Why do urban legends and proverbs spread easily, while important ideas from teachers and leaders are forgotten by lunch? Chip Heath is a professor at Stanford who studied why some stories spread, and his brother Dan is an educator who has helped create learning materials for students. Together they studied what makes ideas 'sticky': easy to understand, remember and pass on, so that they change what people think or do. Their good news is that sticky ideas are not about talent or charisma. They share six common traits, and anyone can learn them. The brothers made these into a simple checklist that spells SUCCESs: Simple, Unexpected, Concrete, Credible, Emotional and Stories. They also name the villain that makes good ideas fail: the curse of knowledge, which makes it hard for experts to remember what it was like not to know. The book is full of stories from teachers, nurses, soldiers, business people and charities who made their messages stick. For anyone who teaches, preaches, trains or shares a message, this book is a practical toolkit. You do not need to be a great speaker. You need to think carefully about your listener.",
   "insights": [
    {
     "emoji": "🧊",
     "title": "Some ideas are built to stick",
     "body": "The book opens with a famous urban legend. A man on a business trip has a drink with a stranger. He wakes up in a hotel bathtub full of ice, with a note telling him to call for help. A doctor tells him that one of his kidneys has been removed. The story is false, but people remember it and retell it for years.\n\nThe authors compare it with a paragraph from a real report by a charity. It is full of long, abstract words about communities and investment. It may be true and important, but almost no one can remember it a minute later. The authors invite readers to read both and then try to retell them. Most people can retell the kidney story in detail. The charity paragraph is mostly gone.\n\nWhy? The legend is simple, surprising, concrete, believable because of its small details, emotional, and told as a story. The authors' point is that sticky ideas are not lucky accidents. They follow patterns we can learn. We do not want to spread false stories, of course. We want true and important ideas to have the same power. If a rumor can stick, then good news, wise teaching and important instructions can stick too, if we shape them well."
    },
    {
     "emoji": "🙉",
     "title": "The curse of knowledge",
     "body": "Once you know something, it is hard to imagine not knowing it. The authors call this the curse of knowledge, and they see it as the main villain of the book.\n\nThey describe an experiment at Stanford by a student named Elizabeth Newton. Some people tapped the rhythm of a well-known song, like Happy Birthday, on a table. Others listened and tried to guess the song. The tappers expected listeners to guess about half the songs. In fact, listeners guessed only about 1 in 40. The tappers could hear the music in their heads. The listeners only heard knocking. The tappers were often surprised that the listeners found it so hard.\n\nExperts and leaders are often like the tappers. We use words, ideas and shortcuts that are clear to us but not to others. A leader might tell the team to 'maximize value', which means a lot to the leader and almost nothing to the team. The fix is to keep asking: what does my listener already know? Then use the SUCCESs tools to turn our knowledge into something others can grasp. Testing your message on a real listener is one of the best cures."
    },
    {
     "emoji": "🎯",
     "title": "Simple: find the core",
     "body": "Simple does not mean shallow. It means finding the one most important point and cutting everything else, even good things. The authors call this finding the core. If you try to say many things at once, people cannot tell what matters most, and they remember nothing.\n\nThe military uses 'Commander's Intent': a short, clear statement of the goal, so soldiers know what to do when plans change in battle. Plans often fall apart, but the purpose stays clear. Southwest Airlines had a simple core too: be the low-fare airline. When someone suggested adding a nice chicken salad to a flight, the question was easy. Does it help us be the low-fare airline? If not, the answer is no. Journalists learn a similar lesson. They put the most important information first, so the reader gets the main point even if they stop reading early.\n\nSimple ideas are also compact. Proverbs are a great example: short, deep and easy to remember, and they guide people in many situations. Everything else in a message should serve the core. So ask yourself: if people remember only one thing from my message, what should it be? Then say that first, and say it clearly."
    },
    {
     "emoji": "🍊",
     "title": "Build on what people already know",
     "body": "To make a new idea simple, the authors say, connect it to something your listener already understands. Our minds store ideas in patterns, which psychologists call schemas. When you link a new idea to an old pattern, people can grasp it quickly.\n\nThey give the example of a pomelo, a fruit many Americans had never seen. You could describe it with a long list of facts about its size, color and taste. Or you could say it is like a very large grapefruit with a thick, soft skin. Suddenly people can picture it. Hollywood uses the same trick. A new film might be pitched as a famous old film, but set on a bus or in space. In one short phrase, the listener understands the kind of story.\n\nThe best comparisons do more than explain. They guide behavior. Disney calls its theme park workers cast members, not employees. That one idea helps workers think like actors in a show: they stay in their role whenever guests can see them, and they work hard to create a good experience. Look for a picture your listeners already know well, and use it to carry your new idea. For many listeners, a local picture works far better than a foreign one."
    },
    {
     "emoji": "😲",
     "title": "Unexpected: break the pattern",
     "body": "Surprise gets attention. Curiosity keeps it. The authors say to break people's guessing patterns first, then fill the gap. Surprise works best when it points to the core message, not when it is just a trick.\n\nThey tell of a journalism teacher who gave students the facts about a school event and asked them to write the opening line of a news story. The students listed the speakers and topics. Then the teacher told them the real news: there would be no school next Thursday. In one surprising moment, they learned that news is about what matters to the reader. The authors also describe the store Nordstrom, which shared surprising stories of staff who went far beyond normal service, like warming up customers' cars on a cold day. These stories showed new workers what great service really meant.\n\nCuriosity works through gaps. When we notice a gap in our knowledge, like a question or a mystery, we want to close it. Instead of starting with facts, start with a puzzle. Make people wonder why, or what happens next, and they will stay with you to find out. A good teacher opens a gap, then fills it step by step."
    },
    {
     "emoji": "🧱",
     "title": "Concrete: make it touchable",
     "body": "Abstract words slide out of our minds. Things we can see, hear or touch stay in. The authors point to an old fable about a fox who cannot reach some grapes and decides they were probably sour anyway. The story is so concrete that the phrase 'sour grapes' has lasted for thousands of years.\n\nThey also tell how a health group helped people understand how unhealthy movie theater popcorn was. A medium bag had about as much bad fat as a bacon-and-eggs breakfast, a burger and fries for lunch, and a steak dinner, all together. People could picture that, and many stopped buying it. The authors explain that memory works a bit like Velcro. The more hooks an idea has, like a picture, a sound, a feeling or a place, the more easily it sticks in the mind.\n\nConcrete ideas also help teams work together, because everyone can see the same thing. A vague goal like 'better service' means something different to each person. A clear picture of what good service looks like does not. Use real examples, real people and real objects instead of big general words. Do not just say you value welcome. Show what it looks like at the door."
    },
    {
     "emoji": "✅",
     "title": "Credible: help people believe",
     "body": "Why do people believe an idea? You do not always need an expert. The authors say vivid details, true stories and letting people test an idea for themselves can all build trust.\n\nOne doctor, Barry Marshall, believed that most stomach ulcers were caused by bacteria, but other doctors would not believe him. So he drank a glass of the bacteria, got sick, and helped prove his point. Years later he won a Nobel Prize. Another way is a claim people can check themselves, like a burger ad that simply invited customers to look and see the difference. The authors also describe the 'Sinatra test', named after a song about New York: one strong example that proves you can handle anything. A delivery company in India won big new customers after showing it had safely delivered the new Harry Potter books on time, before release day.\n\nBig numbers are hard to feel. The authors describe a speaker who dropped one small metal ball into a bucket to stand for one bomb, then poured in thousands to show the world's nuclear weapons. People could hear the size. Make big numbers human-sized, and let people test your idea for themselves."
    },
    {
     "emoji": "❤️",
     "title": "Emotional: make them care",
     "body": "People respond more to one person than to a huge statistic. The authors describe research where people gave much more money to help one hungry girl in Africa, named Rokia, than after reading facts about millions of hungry people. When the story and the statistics were combined, giving dropped. Thinking about numbers seemed to turn off feeling.\n\nSo show the one child, the one family, the one story. Help people care first, and the facts will mean more. Also connect the idea to what people already care about, including who they are. A campaign against littering in Texas worked because it used famous football players and a message about Texan pride. People did not change because of facts about rubbish. They changed because it touched their identity. The authors also tell of an army cook in Iraq who saw his job not as making food, but as lifting the spirits of tired soldiers. That bigger purpose shaped how he and his team worked.\n\nDo not assume people only care about money or comfort. Most people also care about meaning, belonging and doing something good. Appeal to those deeper things, and your message will reach the heart, not only the head."
    },
    {
     "emoji": "📖",
     "title": "Stories: show, do not just tell",
     "body": "Stories work like a practice run for real life. Hearing a story helps us imagine what we would do in that situation, so we are more ready when it happens. Stories also carry both the lesson and the reason, so people remember them and act on them.\n\nThe authors tell of Jared, a young man who lost a lot of weight by eating Subway sandwiches. A local store owner noticed his story, and it became a famous ad campaign. The story was already there. Someone just had to spot it. They also tell how Stephen Denning, a manager at the World Bank, struggled to explain why sharing knowledge mattered. Then he told a short, true story about a health worker in Zambia who found an answer she needed through the internet. That story helped leaders imagine a new future.\n\nThe authors point to three common kinds of inspiring stories. The challenge story, where someone weak overcomes a big obstacle. The connection story, where people cross a gap of race, class or culture to help each other, like the good Samaritan. And the creativity story, where someone solves a problem in a new way. Look for these stories around you and tell them well."
    }
   ],
   "tryThis": [
    "Before your next talk, write your main point in one short sentence. If you cannot, simplify.",
    "Swap one statistic in your next presentation for the story of one real person (with permission).",
    "Ask a newcomer to explain your idea back to you to check for the curse of knowledge."
   ],
   "forUs": "We explain things all the time: teaching in DTS, sharing the gospel on outreach, training new staff, telling supporters what God is doing. Many listeners are hearing it in their second or third language, so simple and concrete matters even more. Watch for the curse of knowledge with YWAM words and Christian words that new students may not know, like intercession, base or outreach phase. Jesus taught with seeds, coins, sheep and bread, things people could see every day. We can do the same with local examples, like rice fields, rain, mango trees and family meals. Before you teach, ask a Khmer teammate to listen and tell you what was unclear. When you write a newsletter, share one real story with one name and one face, with permission, instead of only numbers. At the cafe or in community service, help new volunteers picture good service with a short, true story from your own team. Stories of God's faithfulness here at GP are powerful too, so collect them and tell them. One clear point and one true story will often reach further than a long, perfect speech.",
   "oneLine": "Make your message Simple, Unexpected, Concrete, Credible, Emotional and told as a Story, and people will remember it.",
   "cover": {
    "bg": "cobalt",
    "fg": "paper",
    "a": "marigold",
    "b": "paper",
    "motif": "tape",
    "layout": "top",
    "font": "display",
    "upper": true
   }
  },
  {
   "id": "purple-cow",
   "title": "Purple Cow",
   "author": "Seth Godin",
   "year": 2003,
   "isbn": "9781591840213",
   "shelf": "create",
   "mins": 10,
   "vibe": "Brown cows are boring. Be the purple one.",
   "bigIdea": "Seth Godin, a well-known marketing writer and blogger, got the idea for this book on a family drive through France. At first, the cows in the fields looked lovely, and everyone in the car was excited. But after a while, nobody even looked out the window. A field of brown cows becomes boring fast. A purple cow, though? Everyone would look. Godin's point is simple: the old way of getting noticed, buying lots of ads, works less and less. People have too many choices and too little time, so they filter out almost everything. The only thing that still gets through is something truly remarkable, something people want to talk about. In this short book, Godin explains why 'very good' is no longer enough, why playing it safe has become risky, and how ideas now spread from person to person instead of through big ads. He fills the book with real examples of companies that found their purple cow. For anyone who leads a team or serves people, this is a real challenge. It is not enough to do good work. The question is whether your work is worth telling someone else about.",
   "insights": [
    {
     "emoji": "🐄",
     "title": "Remarkable means worth a remark",
     "body": "Godin uses the word 'remarkable' in a very plain way: worth making a remark about. It is not about being fancy, expensive or loud. It means people notice it, remember it and want to share it with someone else. Something can be small and simple and still be remarkable.\n\nHis key point is that this must be built into the thing itself. You cannot make a boring product and then fix it with a clever poster at the end. One example from the book is Dutch Boy paint. For many years, paint cans all looked the same: heavy metal tins that were hard to open, hard to close and messy to pour. Dutch Boy made a plastic container with a handle and a twist-off lid. The paint inside did not change, but the container was new and useful, and people noticed and talked about it.\n\nSo when you plan something new, ask early: what about this is worth talking about? Put that answer into the design from the very start, not at the end. If you cannot find a good answer, that is a sign to go back and change the thing itself, not just the words you use to describe it."
    },
    {
     "emoji": "📺",
     "title": "Shouting does not work anymore",
     "body": "For many years, companies followed a simple recipe. Make an average product for average people, then buy lots of TV ads. Godin calls this the TV-industrial complex. It worked because people had few channels and few choices, so they paid attention to the ads. Big companies with big budgets could simply buy attention.\n\nToday that has changed. People are busy, they already have most of what they need, and they see a huge number of messages every day. So they ignore ads and only look for things they already want. Godin says marketers used to talk about the 'P's of marketing, like product, pricing, promotion and packaging. He adds a new P: the Purple Cow. Without it, the other P's do not matter much.\n\nFor us, the lesson is that more noise is not the answer. More emails, more posters or louder talking will not help if what we offer is forgettable. In fact, extra noise can make people tune us out even faster. Put your energy into making the thing itself worth noticing, and let that do the work the ads used to do."
    },
    {
     "emoji": "💬",
     "title": "Ideas that spread, win",
     "body": "Before this book, Godin wrote about what he called the ideavirus: an idea that moves from person to person, like a cold moving through an office. Purple Cow builds on this. In a world where ads are ignored, the main way people now hear about new things is from each other. A friend tells a friend, who tells another friend. So the real question for any product or project is not how to reach everyone, but whether it will spread.\n\nFor an idea to spread, two things need to be true. People must care enough to talk about it, and it must be easy for them to share. Here is a simple everyday example. A youth event with a long, confusing name is hard to talk about. An event with a clear, fun name and one photo that tells the story is easy to pass on. The event itself might be the same, but one spreads and the other does not.\n\nThis changes how we think about our work. Instead of asking how loud we can be, we ask what people will say to their friends after they meet us. If the honest answer is 'nothing much', that is the real problem to fix."
    },
    {
     "emoji": "😐",
     "title": "Very good is boring",
     "body": "This may be the most surprising idea in the book. We think that if we make something 'very good', people will come. Godin says no. Think of how many good restaurants, good phones or good schools there already are. In almost every area, very good is normal now, so it blends in like one more brown cow.\n\nHe goes further: the safe choice has become the risky choice. When a team plays it safe, avoids criticism and copies what others do, it often ends up invisible. Being remarkable means some people will not like what you do, and that feels risky. Godin points to the Aeron office chair from Herman Miller. It looked strange, and many people did not like it at first, but it became a famous design that people loved to talk about.\n\nGodin is not saying to be strange just to get attention. He is saying not to hide in the safe middle. Criticism is not always a sign that you are wrong. Sometimes it is the price of doing something worth noticing. Ask yourself honestly whether you are choosing 'safe' only because of fear, and what you might do if that fear were smaller."
    },
    {
     "emoji": "🗣️",
     "title": "Find the people who talk",
     "body": "You cannot reach everyone at once, so do not try. Godin uses a simple picture of how new ideas spread. First, a small group of early adopters tries something new. If they love it, it slowly spreads to the big middle group, who are more careful and wait to see what others do. Many marketers make the mistake of aiming at that big middle group from the start, but those people are not looking for anything new, so they ignore it.\n\nGodin says to focus on two kinds of people at the start. 'Sneezers' are people who love to tell others about things they like, so ideas spread through them like a cold. 'Otaku' is a Japanese word he uses for people who are deeply excited about one topic, like someone who will travel across town to try a new hot sauce. These people go looking for new things, and they enjoy being the first to find them.\n\nSo find the people who already care a lot and give them something worth sharing. Listen to them closely, and make it easy for them to pass the story on. If they get excited, they will do the talking for you."
    },
    {
     "emoji": "🎯",
     "title": "Design for the edges",
     "body": "Most teams design for the average person. But the average person does not care much and does not talk much. Something made to please everyone often excites no one, so it ends up pleasing nobody very much.\n\nGodin suggests going to the edge. What would the fastest version look like? The simplest? The friendliest? The most surprising? Find an edge others are afraid to go near, and go there. He also says it is fine, even wise, to design for a small group who will love it, instead of a big crowd who will only feel okay about it. Silk soymilk is one example in the book. Instead of sitting on the normal shelf with other long-life drinks, it was placed in the cold section next to real milk, in a carton that looked like milk. That small move got it noticed.\n\nBeing at the edge does not mean being extreme for no reason. It means being clearly the best at one thing that a certain group really cares about. For your own work, pick one edge and push it a little further than feels normal. Then watch who gets excited."
    },
    {
     "emoji": "🛠️",
     "title": "Everyone helps build the cow",
     "body": "In the old model, one team made the product and another team, the marketers, tried to sell it at the end. Godin says this no longer works. If being remarkable must be built into the thing itself, then marketing is not just ads and posters. It is part of deciding what to make, how it looks, how it is priced and how people are treated when they use it.\n\nSo Godin urges marketers to get involved much earlier, at the stage of inventing and designing. And he urges everyone else in an organisation to think about what makes their part worth talking about. The person who answers the phone, the person who designs the box and the person who sets the price all shape whether the product is a purple cow or a brown one.\n\nHere is a simple everyday example. A cafe can print a lovely menu, but if the coffee is ordinary and the staff seem bored, the menu will not save it. If the barista remembers your name and the drinks are a little surprising, people will tell their friends with no menu at all. The lesson is that every person on a team can help make the work remarkable, not only the people who promote it."
    },
    {
     "emoji": "🤝",
     "title": "Keep the people who noticed",
     "body": "Godin is also known for an earlier idea he called permission marketing. Instead of interrupting strangers with ads, you ask people for permission to keep in touch, and then you send them things they actually want. In Purple Cow, he shows how these two ideas work together.\n\nThe purple cow is how you get noticed in the first place. But attention does not last long. Once people have noticed something remarkable, the wise next step is to invite them to stay connected, so that next time you have something new, you can tell them directly. You do not have to shout at strangers again. You already have a group of people who liked what you did and said yes to hearing more.\n\nHere is a simple everyday example. A small bakery makes one surprising cake that everyone talks about. Visitors come from across town to try it. If the bakery invites them to join a simple message list, it can tell them about the next new cake. If it does not, those visitors may never come back. So when something you do gets noticed, do not just enjoy the moment. Build a real, respectful connection with the people who cared, and serve them well."
    },
    {
     "emoji": "🔄",
     "title": "Do not get stuck",
     "body": "A purple cow does not stay purple forever. Over time, people get used to it, others copy it, and it slowly becomes another brown cow. What was surprising last year can feel normal this year.\n\nGodin's advice has two parts. First, when you have something remarkable, enjoy it and make the most of it. He calls this milking the cow: use the attention well, grow it and serve people with it. Second, while it is still working, start building the next remarkable thing. Many organisations get stuck because the old success feels safe, so they stop taking risks. Then, when the old idea fades, they have nothing new. A simple everyday example: a cafe might become famous for one special drink. That is great, but if it never tries anything new, in a few years that drink is just normal.\n\nSo keep a habit of trying small, fresh ideas, even when things are going well. Some of them will fail, and that is okay. Use what works, and test what is next, so you are never left with only a brown cow."
    }
   ],
   "tryThis": [
    "Pick one thing your team does. Ask: what would make people want to tell a friend about it?",
    "List the 'sneezers' who love what you do, then ask them for honest feedback.",
    "Change one small detail this week to be surprising in a good way."
   ],
   "forUs": "Think about our cafe, our guest hospitality, or the way we welcome DTS students on day one. Being remarkable does not need a big budget. It can be a guest remembered by name, a handwritten welcome note, or a song from the Khmer team. It can be an outreach team that listens first, or a school week that ends with a surprise thank-you for the cooks and cleaners. Godin reminds us that everyone helps build the cow, so the person at the gate, the cook and the speaker all matter. His 'sneezers' are already among us: students who post photos, partners who tell their churches, neighbours who tell their friends. We can stay in touch with them kindly and keep trying fresh ideas, even when an old one still works. But being remarkable is not about showing off or competing with other ministries. For us, it starts with loving people so well, and so personally, that they cannot help talking about it. And when they do talk, we hope they see Jesus, not just us.",
   "oneLine": "In a world full of 'very good', only the remarkable gets noticed, so build something worth talking about.",
   "cover": {
    "bg": "plum",
    "fg": "paper",
    "a": "paper",
    "b": "marigold",
    "motif": "cow",
    "layout": "top",
    "font": "sans",
    "upper": true
   }
  },
  {
   "id": "switch-on-your-brain",
   "title": "Switch On Your Brain",
   "author": "Dr. Caroline Leaf",
   "year": 2013,
   "isbn": "9780801015625",
   "shelf": "create",
   "mins": 10,
   "vibe": "Your thoughts are not just in your head. Leaf says they shape your brain.",
   "bigIdea": "Many people feel stuck with their thoughts. Worry, fear and old hurts can play again and again, like a song that will not stop. Caroline Leaf, a communication pathologist and Christian author who has studied the link between the mind and the brain for many years, wrote this book to say we are not stuck. Her main claim is that your mind can change your brain. She mixes ideas from neuroscience with Bible teaching about renewing the mind, and she says the thoughts we choose actually shape our brain and body. The book has two parts. The first part explains her view of how thinking works and why our choices matter so much. The second part gives a practical 21-day plan for working on one unhealthy thought pattern at a time. Some of her scientific claims are debated by other scientists, so it is wise to read those parts with care. But her main message is full of hope: with God's help, we can notice our thinking, reject what is toxic and build new, healthy patterns. For anyone serving others, healthy thinking affects how we lead, how we love and how long we last.",
   "insights": [
    {
     "emoji": "🌱",
     "title": "Thoughts are real things",
     "body": "Leaf argues that thoughts are physical, not just ideas floating in the air. In her view, each thought leaves a real trace in the brain. She often describes thoughts and memories as looking like little trees, with branches that grow as we think about something again and again. Thoughts that we feed grow bigger, and thoughts that we stop feeding slowly weaken.\n\nThis helps explain why some thoughts feel so strong. If you have told yourself 'I am a failure' a thousand times, that thought has had a lot of time to grow. It is not just a passing feeling; it has become a well-worn path, like a track across a field where many people have walked. Leaf says the same is true for good thoughts. Truth and hope can also grow strong if we feed them.\n\nWhy does this matter? Because it means what we think about often is important. You cannot stop every thought from coming into your mind, but you can choose which ones you water and which ones you let die. That is a hopeful picture: your inner life is more like a garden than a prison, and gardens can change."
    },
    {
     "emoji": "🔧",
     "title": "The brain can change",
     "body": "Leaf leans on the idea of neuroplasticity. This is a big word with a simple meaning: the brain can change, adapt and rewire all through life. For a long time, many people believed the adult brain was fixed. Today, scientists widely agree that the brain keeps changing as we learn and practise new things.\n\nHere is a simple everyday example. When you learn a new language, like Khmer or English, the first weeks feel hard and slow. Your brain is building new connections. After months of practice, the words come faster, and one day you notice you are thinking in the new language without trying. Your brain has changed to match what you kept doing.\n\nLeaf goes further than most scientists. She argues that our choices and thinking can drive much of this change, and she links some ideas to quantum physics, which many experts say stretches the science too far. Still, the basic hope is sound and widely accepted: you are not too old, too broken or too set in your ways to grow. What you practise again and again really does shape who you become."
    },
    {
     "emoji": "🔦",
     "title": "What you focus on grows",
     "body": "Leaf puts a lot of weight on attention. In her view, a thought becomes stronger when we keep paying close attention to it, and weaker when we stop. She borrows an idea from physics called the quantum Zeno effect to explain this. Put simply, she says that repeated, focused attention holds a thought in place in the brain long enough for it to grow and become part of us.\n\nMany physicists and brain scientists would say this is a stretch, so it is better not to lean too hard on the physics. But the everyday point is easy to see. If you keep replaying an angry conversation, the anger grows. If you keep thinking about how kind someone was to you, gratitude grows. Whatever gets our attention again and again gets bigger in our lives.\n\nThis is why Leaf links her teaching to the Bible's call to think about whatever is true, noble, right, pure and lovely. It is not about pretending problems are not there. It is about choosing, many times a day, where we point our attention. A simple way to start is to notice what you think about when your mind is free, and ask if it is helping you grow."
    },
    {
     "emoji": "🎛️",
     "title": "You are not a victim of your biology",
     "body": "A key message of the book is that your genes and your past are not the final word on who you become. Leaf says the mind is in control of the brain, not the other way round. She talks about free will and about epigenetics, a field that studies how things like stress and lifestyle can affect the way our genes work.\n\nIn her view, this means we are not just machines run by chemicals. We can make choices that change our direction. She encourages readers not to use 'this is just how I am' as an excuse to stay stuck. Here is a simple everyday example: someone who grew up in a home full of shouting may react to stress with anger. That pattern is real, but it is not a life sentence. With help, time and practice, a new way of responding can grow.\n\nThis is her view, and many experts would describe it in a more balanced way. Biology, trauma and mental illness are real, and willpower alone does not fix everything. But there is a helpful truth here: you have more choice than you might think, and God's grace is bigger than your history."
    },
    {
     "emoji": "❤️",
     "title": "Made for love, not fear",
     "body": "Leaf argues that we are designed for love. She says love is our natural state, and that fear and toxic thinking are learned along the way, through hurt, stress and poor choices. Because they are learned, in her view, they can also be unlearned. She also says our brains lean toward hope and optimism, because that is how God made us.\n\nShe links this to Bible verses. One is the promise that God has not given us a spirit of fear, but of power, love and a sound mind. Another is Paul's call to be changed by the renewing of our minds and to take every thought captive. She also writes about how long-term fear and stress can harm the body, not just the mind. Short bursts of stress can help us act, but stress that never stops wears us down.\n\nWhy does this matter? Because it changes how we see our struggles. Fear is not our true identity. When we notice fear-based thinking, we can bring it to God and choose love instead. This does not happen in one day, but it can happen step by step, as we keep returning to the truth of how much we are loved."
    },
    {
     "emoji": "🪞",
     "title": "Step back and watch your thinking",
     "body": "Leaf describes a skill she calls the Multiple Perspective Advantage. It is the ability to step outside your own thoughts and look at them, almost as if you were watching yourself from above. Instead of being carried along by a feeling, you pause and observe: what am I thinking right now, how am I feeling, and why?\n\nShe believes God gave humans this unusual ability, and that using it is a key part of taking thoughts captive. When you can see a thought, you can question it. When you can question it, you can choose whether to keep it. Here is a simple everyday example. A team leader gives you short feedback, and you feel hurt. Without stepping back, you might spend the whole day thinking 'she does not like me'. If you step back, you might notice that she was busy and tired, and that your hurt comes partly from an old fear of not being good enough.\n\nThis skill grows with practice. Pausing to pray, writing in a journal or talking honestly with a friend are all ways to step back. The goal is not to judge yourself harshly, but to see clearly, so that you can respond with wisdom instead of just reacting."
    },
    {
     "emoji": "🔀",
     "title": "Multitasking does not really work",
     "body": "Leaf says that switching quickly between many tasks leads to shallow, scattered thinking. She calls the idea that we can do many things well at the same time a myth. When we try, our attention jumps around, we do each thing less well, and we often feel more stressed.\n\nInstead, she encourages focused, deep thinking about one thing at a time. She believes this kind of thinking is how real learning and healthy change happen. In her view, deep thinking builds strong, clear memories, while shallow thinking builds weak ones that fade quickly.\n\nHere is an everyday example. You sit down to study or pray, but your phone buzzes every two minutes. You check messages, come back, then check again. After an hour, you feel tired, but you have not gone deep at all. Try the same hour with your phone in another room, and it often feels very different. You remember more, you think more clearly and you may even feel more at peace. Focus is a gift you can give your mind, and in a busy world it is a gift worth protecting."
    },
    {
     "emoji": "📝",
     "title": "A 21-day detox plan",
     "body": "The second part of the book is a practical plan for working on one toxic thought pattern at a time. Leaf calls it the 21-Day Brain Detox. She suggests spending a few minutes each day, for 21 days, on the same thought. She says it takes about 21 days to begin changing a thought, and longer to make the new way of thinking a habit, though other experts question these exact numbers.\n\nThe plan has five simple steps. Gather: become aware of your thoughts and feelings. Focused reflection: think deeply about one toxic thought. Write: put it on paper so you can see it clearly. Revisit: read it again and look for a healthier, truer way to see it. Active reach: do one small action that practises the new thought. For example, if the toxic thought is that nobody values you, the active reach might be to remember one time you were valued, or to thank God for one person who cares.\n\nThe big lesson is patience. Change is not a quick fix, and missing a day is not failure. Small steps, repeated every day with God, can slowly reshape how we think."
    }
   ],
   "tryThis": [
    "Notice one thought that keeps coming back this week. Write it down and ask: is this true?",
    "Find a Bible verse that speaks truth into that thought and read it every morning for 21 days.",
    "Spend 10 minutes doing one thing with full focus: no switching, no phone."
   ],
   "forUs": "Mission life can bring stress, homesickness, culture shock and old wounds to the surface. Many of us arrive with thought patterns we did not know we had, and a new culture or a hard outreach can make them louder. This book can help us notice our thinking and bring it to God. In DTS, on outreach or in a staff team, we can help one another by asking gentle questions, praying together and speaking truth from the Bible. Stepping back to watch our thinking can help a lot when Khmer and international staff misunderstand each other. Before we decide someone does not respect us, we can pause and ask what is really happening. Quiet time with our phones away is also a simple gift we can give ourselves on a busy base. At the same time, this book is not a replacement for medical or mental health care, and some of its science is debated. If someone is really struggling, please help them find proper support too. Renewing the mind and getting good care can go together.",
   "oneLine": "Leaf's message is that your thoughts matter and, with God's help, you can choose to renew them one day at a time.",
   "cover": {
    "bg": "ink",
    "fg": "paper",
    "a": "marigold",
    "b": "cobalt",
    "motif": "switchon",
    "layout": "top",
    "font": "sans"
   }
  },
  {
   "id": "building-a-storybrand",
   "title": "Building a StoryBrand",
   "author": "Donald Miller",
   "year": 2017,
   "isbn": "9780718033323",
   "shelf": "create",
   "mins": 10,
   "vibe": "Your audience is the hero. You're the guide. Tell the story clearly.",
   "bigIdea": "Donald Miller is a writer who spent years studying how good stories are built, and later started a company that helps businesses with their messages. He noticed that many businesses and organisations have good products but still struggle, and he believes the main reason is confusing messages. People's brains filter out anything that is hard to understand. If a message makes people think too hard, they simply ignore it. Miller's fix is to use the shape of a good story. In this story, the customer is the hero and you are the helpful guide. His seven-part framework, called SB7, follows the pattern of most films: a hero wants something, meets a problem, finds a guide, gets a plan, is called to act, and then either fails or succeeds. The first half of the book explains each part. The second half shows how to use it in real life, through a short one-line message, a clear website and simple emails. If you use this pattern, people understand what you offer in seconds. For leaders and teams, clear words can be the difference between being ignored and being heard.",
   "insights": [
    {
     "emoji": "🧠",
     "title": "Clarity beats clever",
     "body": "Miller says the brain is always trying to save energy. Its main job is to help us survive and thrive, so it pays attention to things that help with that and ignores the rest. A confusing message costs energy, so the brain tunes it out. People are not being rude when they skip our long posters; their brains are just protecting them.\n\nHe offers a simple check he calls the grunt test. Imagine a caveman looking at your website or poster for just a few seconds. Could he grunt back three answers? What do you offer? How will it make my life better? What do I need to do to get it? If he cannot, your message is not clear enough, no matter how beautiful it looks.\n\nMany teams try to sound smart or clever, using fancy words or inside jokes. Miller's view is that when you confuse people, you lose them. So choose simple, clear words over clever ones, every time. Clear is kind, especially for readers who use English as a second language. A good habit is to show your message to someone outside your team and ask them to explain it back to you in their own words."
    },
    {
     "emoji": "🦸",
     "title": "They are the hero",
     "body": "Every good story starts with a character who wants something. Miller says this character is your customer, not you. Your job is to find one clear thing they want and make your whole message about helping them get it.\n\nHe warns against two mistakes. The first is not naming a desire at all, so people do not know why they should care. The second is naming too many desires, so the message becomes blurry. Pick one. Miller also suggests the desire should connect to something people really need, like saving time or money, finding belonging, feeling safe or growing as a person.\n\nHere is a simple everyday example. A language school could talk about its building, its history and its teachers. Or it could promise that students will soon speak Khmer with confidence at the market. The second message puts the student at the centre. When people see themselves as the hero, they lean in and want to know what happens next. So before you write anything, finish this sentence: the people we serve want to... If you cannot finish it in a few words, your message is not ready yet."
    },
    {
     "emoji": "🐉",
     "title": "Name the problem",
     "body": "Every story needs a problem, and the clearer the problem, the more people care. Miller suggests showing the problem as a villain, something specific that people can stand against. A good villain is easy to name and easy to dislike.\n\nHe says problems come in three levels. The external problem is the practical thing on the surface. The internal problem is how that makes people feel inside. The philosophical problem is why it is simply wrong that things are this way. Miller's main point is that people often buy solutions to the internal problem. He uses the car company CarMax as an example. The external problem is needing a car. But for many people, the internal problem is feeling nervous and pushed around by salespeople. CarMax spoke to that feeling by letting people buy without haggling over the price, and it worked.\n\nSo when you describe a need, go deeper than the surface. Ask: how does this problem make people feel? A student may need a visa, but the real feeling may be fear of being alone in a new country. When we speak to that feeling with honesty and care, people feel understood, and that is when they start to trust us."
    },
    {
     "emoji": "🧙",
     "title": "Be the guide, not the hero",
     "body": "In films, the hero is not the one with all the answers. They need a guide, like Yoda in Star Wars or Haymitch in The Hunger Games. Miller says brands and organisations should play this guide role. The guide has already been through the struggle and now helps someone else win.\n\nA good guide shows two things. Empathy means showing people that you understand how they feel. Authority means showing that you can really help. You can show authority in simple ways, like stories from people you have helped, a few numbers, awards or years of experience. You do not need to brag; you just need to show you can be trusted. Miller suggests a balance: too much empathy without skill feels weak, and too much skill without care feels cold.\n\nWhen brands make themselves the hero and talk only about their own story and success, people stop listening. Everyone is busy with their own story and is looking for someone to help them win. Miller's point is humbling: often the most helpful thing is to step back, care about people's struggles and offer them a hand. A guide is happy when the hero gets the glory."
    },
    {
     "emoji": "🗺️",
     "title": "Give a plan and a call",
     "body": "Even when people trust the guide, they can still feel unsure about the next step. So Miller says guides should give a simple plan, often just three or four steps, like book a call, get a plan, start growing. This makes the path feel clear and safe. He also mentions an agreement plan: a few promises that remove fear, like a clear refund policy.\n\nThen the guide must clearly call the hero to act. Many organisations only hint and hope people will work it out. Miller says to be direct, with a clear button or line like Book now or Join us. He calls this a direct call to action. In films, heroes rarely act until something pushes them, and real people are the same.\n\nHe also suggests a transitional call to action for people who are not ready yet. This could be a free guide, a short video or a sample. It keeps the relationship going until they are ready to take the bigger step. Both calls matter. Without the direct call, people do not know what to do. Without the gentle one, people who are still thinking may drift away."
    },
    {
     "emoji": "🏆",
     "title": "Show what's at stake",
     "body": "Stories need stakes. If nothing can be lost or gained, nobody cares what happens. Miller says many messages forget this and feel flat. They describe a nice product, but they never show why it matters today.\n\nFirst, show briefly what failure looks like if nothing changes. Miller warns not to overdo it. A little fear helps people see why it matters, but too much makes them turn away. Then paint a clear, positive picture of success. What will life look like after the hero accepts your help? Use simple, concrete pictures that people can imagine, like a family at peace, a full classroom or a calm morning.\n\nMiller ends the framework with the idea of transformation. In the end, people do not only want a product; they want to become someone better, more capable, more confident or more at peace. Good brands help people see who they could become. So in your message, show the change: from stressed to calm, from lost to clear, from alone to belonging. That picture of a better self is what moves people to act, because deep down every hero wants to grow. Just make sure the stakes and the success you describe are honest and true."
    },
    {
     "emoji": "💬",
     "title": "Say it in one line",
     "body": "In the second half of the book, Miller turns the framework into tools. The first tool is a one-liner: a short statement, often just one or two sentences, that anyone on your team can say when someone asks what you do. It has four parts: the character, the problem, your plan or solution, and the good result.\n\nHere is a simple everyday example. Instead of saying 'we are a training centre with many programmes', a team might say: many young people feel lost about their future, so we offer a six-month course where they grow in faith and skills, and they leave with clear direction and real friends. In a few seconds, the listener knows who it is for, what the problem is and what will change.\n\nMiller suggests that the whole team learns the one-liner and uses it often, in conversations, on business cards and in email signatures. When everyone says the same clear thing, people start to remember it and repeat it. A one-liner is not about sounding smart. It is about making sure that the next person who asks gets an answer they can understand and pass on."
    },
    {
     "emoji": "🖥️",
     "title": "Make your website pass the test",
     "body": "Miller says a website is often the first place people meet you, and most websites say far too much. He gives a simple plan for building a clear one. At the very top, where people look first, there should be a short line about what you offer, a picture of happy people who have been helped, and one clear button to take the next step.\n\nFurther down, the page can follow the story. Show the stakes, so people see what they could lose. Show the value, so they see what they could gain. Show that you are a caring and capable guide, with a few short stories or reviews. Show the simple plan in three steps. Then add a short paragraph that tells the whole story for people who want more. Miller suggests that other links and details go at the bottom, in what he calls a junk drawer, so they do not distract from the main message.\n\nHe also reminds readers that people scan websites; they do not read every word. So use fewer words, more white space and clear headings. Then run the grunt test again. If a stranger cannot tell what you offer in a few seconds, keep cutting."
    },
    {
     "emoji": "✉️",
     "title": "Stay in touch with kind emails",
     "body": "Most people will not say yes the first time they meet you. Miller's next tools help build trust over time. First, create something truly helpful that people can get for free, like a short guide, a checklist or a video. He calls this a lead generator. In return, people share their email address, because they want the help.\n\nThen send a series of simple emails that keep helping them. These emails share useful ideas, answer common questions and remind people of the next step. Miller says this kind of regular, helpful contact turns strangers into friends and friends into customers. He also encourages organisations to collect stories of transformation from the people they have helped, and to tell those stories often, because real stories show the change better than any claim.\n\nHere is a simple everyday example. A mission school might offer a free short guide called 'Ten questions to ask before your first outreach'. People who download it then get a few short emails with tips and stories from past students. The school is not pushing; it is guiding. When the reader is ready to apply, the school is already a trusted friend."
    }
   ],
   "tryThis": [
    "Write a one-liner for your ministry: the problem, your solution, and the result.",
    "Look at one poster or post and ask: is the audience the hero, or are we?",
    "Turn your sign-up process into three simple steps and share them clearly."
   ],
   "forUs": "We share many messages at GP: DTS promotion, school brochures, cafe menus, outreach reports and newsletters to supporters. It is easy to make ourselves the hero of every story, telling how busy we are and how much we did. StoryBrand reminds us that students, guests, partners and local communities are the heroes, and we are guides who walk alongside them, pointing toward growth and toward God. In a supporter letter, we can tell the story of one student who grew, not just list our activities. On a DTS poster, we can show what a student will gain, with one clear next step. Our cafe and our DTS office could try the grunt test on their signs and posts. Each ministry could write its own one-liner, so that Khmer and international staff can all explain it the same simple way. Clear, simple words also help readers who use English as a second language, and they make translation into Khmer easier. And as followers of Jesus, being the guide and not the hero fits who we want to be anyway.",
   "oneLine": "Make your audience the hero, be the guide, and say it so clearly anyone gets it.",
   "cover": {
    "bg": "paper",
    "fg": "ink",
    "a": "berry",
    "b": "ink",
    "motif": "map",
    "layout": "top",
    "font": "sans",
    "upper": true
   }
  },
  {
   "id": "the-war-of-art",
   "title": "The War of Art",
   "author": "Steven Pressfield",
   "year": 2002,
   "isbn": "9781936891023",
   "shelf": "create",
   "mins": 10,
   "vibe": "There's a force fighting your best work. Its name is Resistance.",
   "bigIdea": "Why is it so hard to do the things that matter most? Steven Pressfield, a novelist and screenwriter, says it is because every person who tries to create or do something good faces an invisible enemy. He calls it Resistance. It shows up as fear, delay, distraction, excuses and self-doubt. Pressfield knows this enemy well. For many years he ran from his own writing, worked many different jobs and struggled before he finally finished and published his work. In this short, punchy book, written in many very short sections, he does three things. First, he names the enemy and shows its many tricks. Second, he shows how to fight it. Third, he points to a deeper source of help beyond ourselves. His answer is not to wait for inspiration or for the perfect moment. It is to 'turn pro': to show up and do the work every day, no matter how you feel. For anyone with a calling, whether in art, ministry or leadership, this book is a strong wake-up call. It is honest about how hard the battle is, but it also gives real hope that the battle can be won, one day at a time.",
   "insights": [
    {
     "emoji": "🌙",
     "title": "The life you have not lived yet",
     "body": "Pressfield begins with a simple but strong picture. Most of us, he says, have two lives. There is the life we live, and there is the unlived life inside us: the book we have not written, the dream we have not started, the person we could become. Between these two lives stands Resistance.\n\nHe gives a dark example to show how serious this is. Before he became a dictator, Adolf Hitler wanted to be an artist. Pressfield suggests that it may have been easier for him to start a world war than to face an empty canvas and keep painting. The point is not that everyone who avoids their calling becomes evil. The point is that running from our true work has a cost, not only for us but for the people around us.\n\nHere is a simple everyday example. Someone feels a quiet call to teach children, but every year they say they will start next year. Life goes on, and nothing seems wrong. But something good that could have grown never does. Pressfield wants us to take that unlived life seriously. It is not just a nice dream. It may be the very thing we were made to give."
    },
    {
     "emoji": "👻",
     "title": "Meet Resistance",
     "body": "Resistance is the inner force that stops you from starting or finishing anything that would help you grow. Pressfield gives a long list of things that trigger it: writing or any creative work, starting a business, a diet or exercise plan, spiritual practice, study, standing up for what is right, or any big commitment of the heart.\n\nHe describes Resistance as invisible, inside you, and never fully gone. You cannot see it, touch it or hear it, but you can feel it. It does not care who you are; it attacks beginners and experts alike. It never sleeps and never takes a day off. It is often strongest near the finish line, when you are close to completing something important. Many people who have almost finished a big project know this feeling: suddenly everything else seems more urgent.\n\nNaming the enemy helps a lot. When you know Resistance is normal and expected, you stop thinking something is wrong with you. You are not lazy or broken just because starting feels hard. Everyone who tries to do good work feels it. Then you can stop being surprised by it, stop feeling ashamed, and simply face it again today."
    },
    {
     "emoji": "🧭",
     "title": "It points to what matters",
     "body": "Here is the twist. Pressfield says Resistance is strongest against the things that matter most for our growth and calling. The more important a task is to your soul, the more you will feel a push to avoid it. He even says that the strength of Resistance shows how much we love the work.\n\nSo that heavy, avoiding feeling can actually work like a compass. If you strongly avoid writing that teaching, having that hard talk or starting that project, it may be exactly what you are meant to do. Pressfield also says Resistance only pushes one way: it fights us when we move toward something higher, not when we drift toward something easy.\n\nHere is an everyday example. Few people feel Resistance about scrolling on their phone. But many feel it when they try to pray for thirty minutes or study a language. That is a clue. The easy things do not fight back; the important things do. Next time you feel strong Resistance, do not just run away. Stop and ask: is this showing me what really matters? Then take one small step toward it, even if the feeling is still there."
    },
    {
     "emoji": "⏳",
     "title": "Its favourite tricks",
     "body": "Resistance is clever. Its favourite trick is procrastination, the voice that says 'I'll start tomorrow'. It rarely tells us to give up completely. It just says later, again and again, until later never comes.\n\nPressfield lists many other tricks. Resistance can use drama and trouble, creating problems that grab our attention. It can use busyness, unhealthy habits and ways of numbing ourselves. It can make us play the victim or wait for someone to rescue us. It can tell us we must first be fully healed, or get everyone's support, before we begin. It can also hand us smart-sounding excuses. Pressfield says many of these reasons are actually true, which makes them harder to argue with, but they are still Resistance.\n\nHe also says fear can be a good sign. If you are afraid of something, it may be because it matters. Professionals feel fear too, but they act anyway. The goal is not to stop feeling afraid; it is to stop letting fear decide. Learn to spot these tricks in your own life, and name them when they show up. A simple sentence like 'this is Resistance' can be enough to break its power for today."
    },
    {
     "emoji": "🤔",
     "title": "Doubt and criticism as clues",
     "body": "Pressfield has a surprising view of self-doubt. We often think doubt means we should give up. He says the opposite can be true. Self-doubt can be an ally, because it shows that we care and that we are reaching for something. In his view, the person who is completely sure they are a great genius is often the one who never does the real work.\n\nHe also looks at criticism of others. When we find ourselves judging other people harshly, especially people who are doing what we secretly wish we were doing, Pressfield suggests it may be Resistance. Harsh critics are often people who are not living out their own calling. Their criticism can be a way to feel better about the unlived life inside them.\n\nHere is a simple everyday example. A staff member keeps finding faults in every worship song a teammate writes. Maybe the songs do need work. But maybe this staff member also has songs inside them that they are afraid to write. So when you feel strong doubt about your work, take it as a sign that you care. And when you feel a strong urge to criticise someone, pause and ask whether your own calling is waiting for you."
    },
    {
     "emoji": "💼",
     "title": "Amateur vs professional",
     "body": "The second part of the book is all about how to fight back. Pressfield's answer is to turn pro. An amateur works when they feel like it, when they are inspired or when life is easy. A professional shows up every day, no matter how they feel.\n\nPressfield tells a story about the writer Somerset Maugham. Someone asked Maugham if he wrote only when inspiration came. He answered that yes, he did, and he made sure it came every morning at nine o'clock. The point is that discipline comes first, and inspiration follows. Pressfield is not talking about money here. A professional, in his sense, is anyone who treats their calling with full seriousness.\n\nPressfield lists more marks of a pro. They are patient, they keep learning their craft, they act even when afraid, they ask for help, and they do not take failure personally. They keep working even when they are tired or hurt. They take the work seriously but not themselves, and they do not let praise or criticism control them. Anyone can turn pro. It is a decision, not a special talent, and it is a decision we can make again each morning."
    },
    {
     "emoji": "✍️",
     "title": "Just sit down and start",
     "body": "Pressfield describes his own working day. He gets up, does some ordinary tasks, then reads an old prayer from Homer's Odyssey that calls on the Muse, and sits down to write. He works for a set number of hours. When he is done, he stops. He does not keep judging what he wrote. He has done his job for the day, and that is enough.\n\nHis big point is that the hardest part is beginning. Resistance is strongest before we start. Once we sit down and begin, the work often starts to pull us forward, and ideas come that we did not expect. Pressfield says that when we commit to the work in this way, something shifts, and help seems to arrive.\n\nHere is an everyday example. You dread cleaning a messy room, and just thinking about it feels heavy. But once you pick up the first few things, it is easier to keep going. The same is true for writing, studying or praying. Do not wait to feel ready, because that feeling may never come. Sit down, start small and keep a regular time and place. Over weeks, those small daily starts add up to real work."
    },
    {
     "emoji": "✨",
     "title": "Help from beyond",
     "body": "In the last part, Pressfield talks openly about a higher realm. He uses words like the Muse and angels. He believes that when we commit to our work and show up faithfully, unseen help comes alongside us, and ideas arrive that feel like gifts. He describes the work as something we serve, not something we own.\n\nHe also compares two ways of living. Some people live by hierarchy: they always compare themselves with others and care most about rank and approval. Pressfield says a creative person should live by territory instead. Their sense of worth comes from the work itself and from doing it day after day, whether anyone notices or not. He points to the old Hindu text the Bhagavad Gita, which teaches that we have a right to our work but not to its results.\n\nPressfield's spiritual view is not the same as Christian faith, so read this part wisely. As followers of Jesus, we believe our help comes from a personal God who loves us, not from a vague force. But the lesson is still useful: do the work for its own sake, not for praise, and offer it up."
    }
   ],
   "tryThis": [
    "Name one task you keep avoiding, and write down how Resistance shows up for you.",
    "Set a fixed 25-minute time each day this week and do that task, no matter how you feel.",
    "When you finish, stop and let it go, without judging how good it was."
   ],
   "forUs": "On a busy base, Resistance often hides behind good things: one more meeting, one more chat, one more errand. It can keep us from prayer, language study, preparing a teaching or starting that new ministry idea God put on our heart. In DTS, it might look like putting off a hard but needed talk with a student. On outreach, it might look like staying busy so we do not have to share our faith. For Khmer and international staff alike, learning each other's language takes daily, faithful work, and that is exactly where Resistance likes to attack. We can also watch our hearts when we feel like criticising a teammate, and ask if our own calling is waiting. Pressfield writes from his own spiritual view, which is different from ours. But as followers of Jesus we can take the core lesson: be faithful every day, even in small things, and trust God to meet us in the work. We do not work to earn love or praise. We work as worship, and we leave the results to God.",
   "oneLine": "Resistance is real, but showing up every day like a pro is how you beat it.",
   "cover": {
    "bg": "ink",
    "fg": "paper",
    "a": "berry",
    "b": "marigold",
    "motif": "brush",
    "layout": "top",
    "font": "serif"
   }
  },
  {
   "id": "working-well-with-westerners",
   "title": "Working Well with Westerners",
   "author": "GP Library",
   "year": 2026,
   "shelf": "gp",
   "mins": 14,
   "original": true,
   "vibe": "They are not rude, and you are not too quiet. You learned different ways to show respect.",
   "bigIdea": "At GP, Khmer and Western staff serve side by side every day. We pray together, eat together, teach together and go on outreach together. We love each other, but sometimes we confuse each other. A Westerner says no in a meeting, and you feel shocked. You say yes to be polite, and later they feel let down. Nobody meant harm.\n\nThis guide explains why many Westerners act as they do and what they usually mean. It looks at words and feedback, meetings and decisions, time and plans, money, conflict, the body, friendship and language. It shows how to speak up, say no, ask for help and disagree, while you keep your Khmer strengths of respect, patience and warmth. Under each pattern there is a good value, like honesty, fairness or care. When you see that value, it is easier to believe the best.\n\nThese are tendencies, not rules. An American is not a Brit, and a Brit is not a Dutch person. Personality, family, age, education and faith shape people too. Some Westerners have lived in Asia for many years. Use these ideas to start conversations, not to put people in boxes. And remember: you do not need to become Western. You only need to understand, and to be understood.",
   "insights": [
    {
     "emoji": "🗣️",
     "title": "Straight words, kind heart",
     "body": "Many Westerners grew up learning that clear words are honest and kind. Researchers like Erin Meyer call this low-context communication: the meaning is in the words. In Khmer culture, much of the meaning is in the tone, the timing and what is not said. A wise Khmer listener hears the message behind the words. A Westerner often puts the whole message inside the words, so you do not need to guess. Both ways carry respect, just differently.\n\nAt a cafe meeting, Emma says, 'I don't think this menu will work.' Dara feels embarrassed for Bopha, who made the menu. He waits for Bopha to be hurt. But Emma is talking about the menu, not about Bopha. Five minutes later she is laughing with everyone, and she asks Bopha to help write the new menu. For Emma, the problem is finished. For Dara, it takes the whole day to feel normal again.\n\nSo when a Westerner speaks directly, try not to hear anger. Usually it means, 'I trust you enough to be honest.' Listen to the words, and do not add a hidden meaning that is not there. If the words still sting, you can ask later, 'What did you mean by that?' Most Westerners will be glad you asked, and they may learn to speak more gently with you."
    },
    {
     "emoji": "🤝",
     "title": "When yes is not a promise",
     "body": "In Khmer, baat or chas is often a polite way to say, 'I heard you.' It does not always mean, 'I agree,' or 'I will do it.' Everyone in a Khmer room usually understands this. But many Westerners hear yes as a promise. They write it in their plan and stop worrying about it. When the task is not done, they feel confused, and you feel blamed.\n\nJosh asks Sokha to finish the outreach budget by Friday. Sokha says yes, though he already has three jobs that week. He does not want to disappoint Josh, who is his leader. Friday comes, and the budget is not ready. Josh is not upset that Sokha is busy. He is upset only that he did not know earlier, because now the team cannot buy bus tickets in time. If Sokha had told him on Monday, Josh could have asked someone else to help.\n\nFor many Westerners, a clear no is kinder than a yes that cannot happen. A no gives them time to make a new plan. Try honest, polite words: 'I can do it by Monday.' Or, 'This week is full. What is first?' If you start a task and then see a problem, tell them as soon as you can. A smile and an honest answer can go together."
    },
    {
     "emoji": "🪞",
     "title": "Feedback is about the work",
     "body": "Saving face (មុខមាត់) protects people's dignity, and that is a beautiful value. Many Westerners care about dignity too, but they honour someone by helping them grow. So they give feedback often, sometimes in front of others, and they aim it at the work, not the person. In many Western schools and workplaces, people get feedback every week. They learned to hear it as normal, even as a sign that the leader cares.\n\nAfter a DTS lecture week, Hannah tells Srey Leak that her notes for the speaker came late. Srey Leak smiles, but inside she is embarrassed. All evening she wonders if Hannah still likes her, and if she should stop serving in the school. Hannah does not know that a Khmer smile can hide hurt. The next day she thanks Srey Leak for her good work and asks her to lead again. For Hannah, feedback and friendship were never in conflict. One small comment was not a judgement on the whole person.\n\nWhen you hear feedback, separate the task from your worth. God's love for you does not change when your notes are late. You can say, 'Thank you. Can you show me how?' You can also kindly tell a Western leader, 'Please give me feedback in private.' Most will be happy to do that."
    },
    {
     "emoji": "🕊️",
     "title": "Anger, conflict and making peace",
     "body": "In Khmer culture, showing open anger often brings shame, both to the angry person and to the person in front of them. So many Khmer people keep peace by staying calm, waiting, or asking a trusted friend to speak for them. Many Westerners handle conflict another way. They often want to talk face to face, soon, and name the problem in clear words. Many Western Christians think of Jesus' teaching in Matthew 18: if someone wrongs you, go and talk to them alone. For them, talking openly is how peace comes back.\n\nMark is frustrated because the cafe keys keep going missing. He says so loudly in the kitchen, and his face goes red. Vanna is shocked and avoids him for days. But by lunch Mark has forgotten it. The next week he asks Vanna, 'Are we okay? Did I upset you?' Vanna smiles and says everything is fine, but it is not. Mark only wants to say sorry and make things right.\n\nMany Westerners also say sorry in words and hope to hear words back. A Khmer friend may show peace by bringing food or acting kind again. Both are real. When a Westerner raises a problem with you, it usually means they want to keep the friendship, not end it. If face to face is too hard, ask a trusted friend to come with you. And when someone says sorry, you can say, 'Thank you. I forgive you.'"
    },
    {
     "emoji": "🙋",
     "title": "Your idea is a gift",
     "body": "In Khmer culture, you show respect by honouring age and position. You call an older person bong, you wait for the leader, and you hold back so you do not trouble anyone. This is kraeng chet (ក្រែងចិត្ត), and it comes from care. Many Westerners show respect another way. They use first names, even with older leaders, and ask everyone for ideas. They believe the best plan comes from many voices, and that a good leader listens before deciding. Disagreeing with the leader in a meeting is normal for them, and it is not rude.\n\nIn a staff meeting, the leader asks, 'Any concerns?' Everyone is quiet, so the leader thinks all agree. Later Dara tells a friend the plan will not work in the village, because the pastor there is away that month. The leader hears about it only after outreach starts. She is sad, not because Dara was wrong, but because his wisdom came too late to help.\n\nWhen a Westerner asks for your opinion, they truly want it. To them, silence often sounds like agreement. You know the language, the culture and the villages better than they do, so your idea is a gift to the team. If speaking up in the group is hard, share your idea after the meeting, send a message, or write it down. You can start softly: 'Maybe we can think about one more thing.'"
    },
    {
     "emoji": "🆘",
     "title": "Ask for help early",
     "body": "Many Khmer staff do not want to be a burden, so they try to solve everything alone. Some families learned, especially after the Khmer Rouge years, that it is safer to be careful and quiet. That caution makes sense, and it shows strength. Many Westerners were raised to see asking for help as wise and normal. In their schools, a good student asks many questions. Saying 'I don't know' is not shameful to them, even for a leader. Leaving you alone with a task can even show respect: they trust you and do not want to watch over you like a child. So they may not check on you. They expect you to come to them when you need something.\n\nAt the guesthouse, Sophea does not understand the new booking system. She guesses for two weeks rather than bother Lucy, who looks very busy. Two groups get the same room on the same night. Lucy finds the mistakes and feels sad, not angry. She says, 'I wish you had asked me sooner. It would have taken ten minutes.'\n\nSo ask early, before small problems grow. Say, 'Can you show me how this works?' or 'I am not sure I understand. Can you explain again?' Asking is not weakness. Asking early protects both the work and the friendship, and it helps your leader trust you more."
    },
    {
     "emoji": "⏰",
     "title": "Time, plans and family",
     "body": "Many Westerners see time as something to plan and protect. A meeting at nine means nine. A plan in an email feels like a promise. A calendar shows the weeks ahead. This comes from fairness: they do not want to waste other people's time, and they want everyone to know what will happen. Khmer life often moves around relationships, so plans stay more flexible. If a relative needs you, the plan can change. Both ways care about people.\n\nFamily duty is a strong Khmer value. Weddings, funerals, Khmer New Year, Pchum Ben and caring for parents matter deeply. Most Westerners respect this, and many wish they were closer to their own families. But they need to know in time. When Vanna left for a family funeral without telling anyone, Mark had to close the cafe for a day. He was not upset about the funeral. He was only sad that nobody told him, because he wanted to pray for Vanna and help.\n\nSo tell people early. When you know about a wedding or a trip home, tell your leader that same week. Write down dates and plans. If something sudden happens, like a funeral, send one quick message before you go. If you will be late, send a message too. Clear information is one way to love a Western teammate."
    },
    {
     "emoji": "💵",
     "title": "Money, lending and who pays",
     "body": "Money is a place where kind people often misunderstand each other. In Khmer culture, the older person or the one who invites often pays for the meal, and friends and family help each other with loans. Many Westerners grew up differently. Friends often split the bill, and each person pays for their own food. Lending money to friends can feel uncomfortable, because it may hurt the friendship. Many Western staff at GP, like many YWAM staff, are volunteers. They raise support from churches and friends, and they must give an account of how they use it.\n\nDara needs money for his mother's medicine, so he asks Emma for a loan. Emma has a phone and a laptop, so Dara thinks she has plenty. But Emma lives on gifts from her church, and she feels unsure. She says she needs to think and pray. Dara feels ashamed and rejected. Later, Emma helps Dara talk with the base leaders, and together they find a way to help his mother.\n\nWhen a Westerner says no, or asks to talk with a leader first, it is usually not about you. They may have promises to keep to their supporters, or they may want to help in a way that keeps the friendship safe. If you need help, it is okay to ask clearly and kindly. And when you go out to eat, it is fine to ask, 'Shall we each pay?'"
    },
    {
     "emoji": "🫂",
     "title": "Hugs, space, men and women",
     "body": "People show care with their bodies in different ways. In Cambodia, friends of the same sex often hold hands or walk arm in arm, and it simply means friendship. Between men and women, people are usually more careful in public, so that no one starts gossip and everyone's good name stays safe. Many Westerners grew up with other habits. A hug can be a normal hello, even between a man and a woman. Men and women can be close friends, and they may drink coffee alone together or work late in the same office without any romance. Many also like more personal space in a line or on a bench.\n\nDuring a DTS, Josh hugs Srey Leak to thank her after a long outreach day. For Josh it is like a handshake. But Srey Leak feels shy, and later some students joke about them. Josh is sad when he learns this. He never wanted to hurt her name.\n\nSo try not to judge a Western teammate's hug or friendship as something bad. Usually it is innocent. But you can kindly explain how things look in Cambodia, and what you are comfortable with. You can offer a sampeah instead of a hug, with a smile. If you have questions about dating or friendships between men and women on the base, ask a leader you trust. Good guidelines protect everyone."
    },
    {
     "emoji": "☕",
     "title": "From work to friendship",
     "body": "In Cambodia, friendship often comes first, and work grows from that trust. Many Westerners build trust the other way: first they see that you are reliable at work, then friendship grows. Both roads can lead to deep friendship. So if a new Western teammate seems focused only on tasks, do not think they are cold. Often they are showing you they are serious, and friendship is on the way.\n\nMany Westerners value privacy. Questions about age, marriage or salary are friendly in Khmer culture, but some Westerners feel uneasy, especially when asked about their weight or why they are not married. Many like time alone after a busy day. This is how they rest, not a sign that they dislike you. They may also joke with sarcasm, saying the opposite of what they mean. 'Great weather!' in a storm is a joke, not a lie.\n\nWhen Josh did not eat the food Sokha shared, Sokha felt hurt. Later he learned Josh thought it was Sokha's lunch and did not want to take it. Now they eat together every Friday, and Josh always says yes. So be patient. Share food, and gently teach them about the head and feet. Invite them home. Your hospitality is a gift, and many Westerners remember it all their lives."
    },
    {
     "emoji": "💬",
     "title": "Learning each other's language",
     "body": "Language is one of the best gifts we can give each other. Many Khmer staff already speak English every day, which is hard work. Many Western staff are trying to learn Khmer, which is hard work too. Khmer has many sounds that English does not have, and Westerners often make funny mistakes. English speakers also talk fast, use slang and make jokes that are hard to follow. Neither side is slow. Learning a language as an adult is simply humbling.\n\nEmma tries to order rice in Khmer at the market and uses the wrong word. The sellers laugh, and Emma laughs too, but inside she feels shy and stops trying for a week. At the same time, Sopheap stays quiet in English worship meetings because she is afraid of grammar mistakes. When the two finally talk, they agree to swap: Emma teaches English, Sopheap teaches Khmer, and both promise to be gentle.\n\nTrying matters more than being right. When a Westerner speaks Khmer, encourage them, even when it is not correct. Teach them to say bong and oun, and explain what those words mean. And do not let fear of mistakes keep you silent in English. Most Westerners care about your ideas, not your grammar. If someone speaks too fast, you can say, 'Can you speak more slowly, please?'"
    }
   ],
   "tryThis": [
    "This week, say one polite, honest no or 'not yet', for example: 'I can't today, but I can on Monday.'",
    "Ask a Western teammate what they hope you do with their feedback, and share how feedback and conflict feel for you.",
    "Invite a Western teammate to eat with you. Teach them one Khmer word, ask about their family, and share about yours."
   ],
   "forUs": "GP is a picture of Revelation 7:9: people from every nation and language, worshipping God together. That happens when we honour one another and learn each other's language of love. Romans 12 asks us to outdo one another in showing honour. Across cultures, that means learning what honour looks like for the other person.\n\nYour Khmer ways are not something to fix. Your patience, respect, loyalty, peacemaking and warm hospitality bless this base every day, and Westerners need them. You also understand Cambodia, its language and its people in a way they may never fully understand. You do not need to become Western. You only need to understand them, and help them understand you.\n\nAt GP this happens in small moments: a clear answer in a staff meeting, a private talk after a mistake, a message before you go home for a funeral, a kind word about hugs and the sampeah. Each one builds trust.\n\nRemember: these are tendencies, not rules. Every person is different, so ask, listen and stay curious. When something confuses you, believe the best and ask a friend. In meetings, on outreach and in the cafe, we learn this together, as one family in Christ.",
   "oneLine": "Understand their ways, keep your own, and build a bridge of love.",
   "cover": {
    "bg": "laterite",
    "fg": "paper",
    "a": "marigold",
    "b": "paper",
    "motif": "bridge",
    "layout": "top",
    "font": "sans"
   }
  },
  {
   "id": "working-well-with-cambodians",
   "title": "Working Well with Cambodians",
   "author": "GP Library",
   "year": 2026,
   "shelf": "gp",
   "mins": 14,
   "original": true,
   "vibe": "You are a guest who is still learning. Here is how respect, trust and care often work in Khmer culture.",
   "bigIdea": "Many Western staff come to GP ready to work hard and help. But good intentions can still hurt people in a new culture. A direct question can embarrass someone. A quick yes may not mean yes. A hug, a loan or a joke can carry a meaning you did not intend.\n\nThis guide explains some common Khmer patterns and the values underneath them: respect, harmony, care and loyalty. It looks at face, respect, communication, conflict, relationships, family, money, the body, language and leadership. Each pattern has a good reason behind it. When you understand the reason, you can stop feeling frustrated and start feeling curious.\n\nThese are tendencies, not rules. Every person is different. Family, generation, region, education and faith shape people as much as culture does. A young Khmer staff member from Phnom Penh may be very different from an older pastor from a village. Use these ideas to start conversations, not to put people in boxes.\n\nCome as a learner. Your Khmer teammates are not your project. They are your colleagues, leaders and friends, and they have a lot to teach you. Many of them already work across cultures every day, with more skill than you might see.",
   "insights": [
    {
     "emoji": "🙂",
     "title": "Face belongs to everyone",
     "body": "In Cambodia, face (មុខមាត់) is a person's dignity and good name in front of others. Face is not only personal. When someone loses face, their family and team can feel the shame too. So people protect each other's face, by speaking gently, avoiding public blame and helping others look good. This is a way of showing love and respect, not a way of hiding the truth.\n\nAt a staff meeting, Josh points out mistakes in the cafe accounts and asks Dara, the cafe leader, to explain them in front of everyone. Josh only wants to fix the problem quickly. But Dara goes quiet, and for weeks he keeps away from Josh. The other Khmer staff also feel uneasy and become careful around Josh. Nobody tells Josh why. The accounts are fixed in the end, but trust takes months to come back.\n\nHonest feedback is still needed. It just needs the right setting. Give hard feedback in private, and start with real thanks. Talk about the work and the next step, not the person's character. Instead of 'Why did you do this?', try 'How can we fix this together?' Praise in public, correct in private. If a problem must be raised in a group, talk to the person first so they are not surprised. Feedback that builds people up is heard. Feedback that shames makes people hide."
    },
    {
     "emoji": "🙏",
     "title": "Respect has a shape",
     "body": "Khmer culture honours age and position. People call an older person bong (older sibling) and a younger person oun (younger sibling). Leaders, teachers and parents receive special respect, and people often bend a little when they walk past an older person. The sampeah, palms together, shows honour, and higher hands show more respect. The head is seen as high and respected, and the feet as low. These forms say that everyone has a place in the family, and the family stays strong when people honour each other.\n\nIn DTS, Emma calls an older Khmer pastor by his first name only and sits with her feet pointing at him. She means to be friendly and equal, as she would be at home. He smiles kindly, but the students feel uncomfortable for her. Later a Khmer staff member gently explains, and Emma is grateful. The next week she greets the pastor with a sampeah and uses the title the students use. He beams.\n\nAsk how people like to be called, and use bong or a title. Learn the sampeah and return it. Do not touch an adult's head or point with your feet, and take off your shoes when you enter a home. Dress modestly, especially at a pagoda or in a village. Small acts of respect build deep trust, and Khmer friends notice them."
    },
    {
     "emoji": "👍",
     "title": "Yes can mean I heard you",
     "body": "Many Western cultures see directness as honesty. Khmer communication is often more indirect. Meaning is carried in hints, tone and silence, because peace and face matter. Researchers call this high-context communication. Baat or chas, the polite yes, often means I hear you and I respect you. It does not always mean I agree, or I can do this. A smile may show embarrassment or worry, not happiness. No is often said softly: maybe, it is a bit difficult, or I will try.\n\nOn outreach, Emma asks Sokha if the team can be ready to leave at 5 a.m. Sokha says yes. At 5, half the team is still asleep. Sokha knew it would not work, because the team had a late church service the night before. But saying no to a leader in front of others felt rude. Emma feels let down. Sokha feels he did his best to be respectful. Each was true to their own values.\n\nSo listen for the soft no. Watch for long pauses, a smile with no words, or 'I will try'. Instead of asking 'Can you do it?', ask 'What might make this hard?', and wait for the answer. Ask in private, not in front of the group. Offer real choices, like 'Is 5 or 6 better?' Then an honest answer has a safe door."
    },
    {
     "emoji": "🤲",
     "title": "Kraeng chet and the open door",
     "body": "Kraeng chet (ក្រែងចិត្ត) means holding back so you do not burden, bother or upset someone. It comes from humility and care. Because of it, a Khmer teammate may not ask you for help, may not disagree with you, and may not tell you that your plan is hard for them. They may not even ask for a glass of water in your home. It is not that they have no opinion. They are thinking about your feelings before their own.\n\nIn the lecture phase, Srey Leak has a better idea for the outreach schedule. But Josh is the leader and older, so she stays quiet. She also worries that her idea will make extra work for him. Later Josh wonders why nobody spoke up. He feels alone in planning, while Srey Leak feels her idea was not wanted.\n\nYou cannot remove kraeng chet by saying 'just be honest with me'. But you can make speaking up feel safe. Ask open questions, not yes-or-no ones. Give time to think, and let people answer later or in writing. Talk one-on-one or in small groups. Ask 'What would you change?' or 'What do people in the village think?' When someone shares, thank them warmly, and use their idea when you can. When people see that honesty is welcome, they slowly share more."
    },
    {
     "emoji": "🕊️",
     "title": "Conflict without losing face",
     "body": "In Khmer culture, open anger is often seen as losing control, and it brings shame on everyone in the room. So many Khmer people avoid direct conflict. They may stay quiet, show hurt by keeping distance, or ask a trusted person to speak for them. A go-between, often an older or respected friend, can carry a hard message so that no one loses face. Peace is often shown more by actions than by words: a shared meal, a kind greeting, a normal conversation again.\n\nMark is frustrated because the cafe keys keep going missing. He raises his voice in the kitchen, and his face goes red. By lunch he has forgotten it. But Vanna avoids him for days, and the other staff are careful near him. When Mark asks Vanna, 'Are we okay?', she smiles and says yes. Finally an older Khmer leader gently tells Mark what happened. Mark says sorry to Vanna in private, and the next day she brings him fruit. That fruit is her answer.\n\nSo keep your voice calm, even when you are upset. Take a break before you speak. Raise problems in private, and think about asking a respected Khmer friend to help. Learn to see peace offered in actions, not only in words. And when you are wrong, say sorry simply and humbly."
    },
    {
     "emoji": "🍚",
     "title": "Relationship comes first",
     "body": "Many Westerners build trust through tasks: good work earns trust, and friendship may come later. Many Khmer build trust the other way: first friendship, then work. Time spent eating, chatting and visiting is not wasted. It is the foundation. A team that has laughed together will work hard together. For some families, the Khmer Rouge years left a deep caution, so trust may take longer. Never rush it, and never push someone to tell their family's story.\n\nThis shapes time too. A meeting may start late because someone stopped to help a relative or greet a neighbour. For many Khmer, people matter more than the clock, and leaving a friend in the middle of a talk can feel rude. Josh wants to start a new program in his first month at GP. He has a plan, a budget and a timeline. The Khmer staff are polite but slow to join, and Josh feels they do not care. A year later, after many meals, motorbike rides and village visits, they build it together, and it is better than his first plan.\n\nSo invest in friendship before projects. Be patient. Clear times still matter at GP, for classes and transport, so kindly explain why a start time is important. Then show you value the person too: ask about their family before you ask about the task."
    },
    {
     "emoji": "👨‍👩‍👧",
     "title": "Family, food and the gift of care",
     "body": "For most Khmer staff, family duty is deep and good. Staff may need to go home for a wedding, a funeral, Khmer New Year or Pchum Ben. A funeral may need them for several days, and plans can change quickly. Many send part of a small income to support their parents and siblings. This is love and loyalty, not a lack of commitment to ministry. Khmer culture is also very generous. People share food, invite you home and ask personal questions: How old are you? Are you married? How much do you earn? These are a friendly way to know you, and to know how to address you. They are not rudeness. If you do not want to answer, you can smile and give a light answer.\n\nWhen Dara's grandmother dies, Emma travels three hours to the funeral and sits with the family. She does not understand much of what is said, but she stays. Dara never forgets it. Years later, he still calls Emma his sister.\n\nSo plan for family seasons. Put Khmer New Year and Pchum Ben in the team calendar early. Go to weddings and funerals when you can. Receive hospitality gladly, and try the food you are offered. Let people care for you, not only the other way around."
    },
    {
     "emoji": "💵",
     "title": "Money, sharing and who pays",
     "body": "In Khmer culture, money is often shared within a web of family and friends. The person with more is expected to help the one with less. The older person, or the one who invites, often pays for the meal. Borrowing from friends and family is normal, and it is part of being close. Questions about your salary are not rude; they help people understand your life. To many Khmer people, Westerners look rich. Compared to many families in Cambodia, that is often true, even for volunteers who raise their own support.\n\nDara needs money for his mother's medicine, so he asks Emma for a loan. Emma lives on gifts from her church, and she feels unsure. She says she needs to think and pray. Dara hears this as a no, and he feels ashamed for asking. A few days later, Emma talks with a base leader, and together with Dara they find a wise way to help his mother.\n\nSo think about money before the moment comes. Ask your leaders about the base's guidelines on lending and giving. If you say no, say it kindly, and keep the friendship warm. Never make someone feel ashamed for asking. When you invite, you pay. When a Khmer friend pays for you, receive it gladly, and pay next time. Give in ways that honour people, not in ways that make them feel small."
    },
    {
     "emoji": "🫂",
     "title": "The body, men and women",
     "body": "Khmer culture has gentle norms about the body. Friends of the same sex often hold hands or walk arm in arm, and it means friendship. Between men and women, people are usually careful in public. Even married couples rarely kiss or hug where others can see. A woman's good name is precious to her and to her family, and gossip can harm it quickly. A man and a woman who spend a lot of time alone together may cause people to talk. Modest dress also shows respect, especially covering shoulders and knees in villages and at pagodas.\n\nDuring a DTS, Josh hugs Srey Leak to thank her after a long outreach day. For Josh, a hug is like a handshake. But Srey Leak feels shy, and later some students joke about them. Her family hears about it too. Josh is sad when he learns this. He never wanted to hurt her name.\n\nSo greet with a sampeah, not a hug, unless a friend clearly shows you otherwise. Keep friendships between men and women in groups when you can. If you are dating, learn what is wise here, and ask a Khmer leader about the base's guidelines. Your actions also shape how people see GP. Simple care for how things look protects your teammates' good name."
    },
    {
     "emoji": "💬",
     "title": "Learning Khmer, one word at a time",
     "body": "Many Khmer staff at GP work in English every day. That takes energy, courage and skill. When you learn Khmer, you share that load, and you show that you came to stay, not only to help. Even a little Khmer opens doors. Hello, chum reap suor (ជម្រាបសួរ), thank you, arkun (អរគុណ), and sorry, som toh (សុំទោស), make people smile. Using bong and oun shows that you understand the family shape of Khmer life.\n\nEmma tries to order rice in Khmer at the market and uses the wrong word. The sellers laugh, and Emma laughs too, but inside she feels shy and stops trying for a week. At the same time, Sopheap stays quiet in English worship meetings because she is afraid of grammar mistakes. When the two finally talk, they agree to swap: Emma teaches English, Sopheap teaches Khmer, and both promise to be gentle. Now Emma prays in simple Khmer at the cafe.\n\nTrying matters more than being right. Laughter at your mistakes is usually warm, not mocking, so laugh too and keep going. Speak English slowly and clearly, and avoid slang and fast jokes. Check understanding with open questions, not 'Do you understand?', which will almost always get a yes. Learn words for your ministry first. Each word is a small act of love."
    },
    {
     "emoji": "🌱",
     "title": "Empower leaders, not just helpers",
     "body": "Where hierarchy is honoured, people often wait for the leader to decide. A Western leader may see a lack of initiative. Usually it is respect. Decisions in Khmer teams may also be made more quietly, through private talks before a meeting, not through open debate. So growing leaders takes intention, and you may need to change your own habits.\n\nJosh asks Chanthy to lead the cafe team. But Josh still makes every decision and corrects her in front of the team. When Chanthy makes a choice, Josh changes it the next day. The team keeps coming to Josh, and Chanthy feels like an assistant. Josh thinks she is not confident. In fact, she is waiting for him to truly step back.\n\nReal empowerment shares authority, not just work. Explain the why behind plans. Ask Khmer leaders for their view before you give yours, because once the foreigner speaks, others may simply agree. Let them make decisions, even ones you would make differently. Support them in public, and talk through problems in private. When team members come to you, send them back to the Khmer leader. Many Khmer leaders understand the language, culture and people far better than you. Often the best help is to step back, and cheer them on."
    }
   ],
   "tryThis": [
    "Ask a Khmer teammate how they like to be addressed, and ask them to teach you the sampeah and three useful Khmer phrases.",
    "Before your next meeting, prepare one open question, and let people answer later or in private.",
    "Say yes to the next invitation to a meal or family event. Go to listen and learn."
   ],
   "forUs": "At GP, Khmer and Western staff serve side by side in every ministry. Many Khmer staff already move between two cultures every day, and often adjust to us more than we adjust to them. They speak our language, eat our food at team meals and forgive our mistakes. We can honour that by learning too: some Khmer language, eating together, asking good questions, keeping our anger soft and letting Khmer leaders lead.\n\nRemember that these patterns are tendencies, not rules. Your teammate is a person first, not a culture. Some Khmer friends will be more direct than you, and some Westerners more quiet. When you are unsure, ask with humility. A good question, like 'How would this look in your family?', is often better than a good guess.\n\nPhilippians 2 tells us to value others above ourselves, and Jesus himself came as a servant. That is the posture of a guest. We are guests in Cambodia, and also brothers and sisters. Revelation 7:9 shows people from every nation and language worshipping God together. That is our family. Let us honour one another, protect each other's face and learn each other's language of love.",
   "oneLine": "Come as a learner, protect people's face, and let trust and Khmer leaders grow.",
   "cover": {
    "bg": "teal",
    "fg": "paper",
    "a": "marigold",
    "b": "ink",
    "motif": "angkor",
    "layout": "top",
    "font": "sans"
   }
  }
 ]
};
