import { Submission } from '../../models';

// Three sample submissions, one per region of the spectrum. They are
// run through the real analysis pipeline when loaded, so the sample
// reports always match the current heuristics.
//
// The first sample deliberately uses Word-style curly quotes and em
// dashes. It should still read as a human process: that is the point.

export interface FixtureSubmission {
  submission: Submission;
  /** Days before today, so the archive looks lived-in. */
  daysAgo: number;
}

const HUMAN_ESSAY = `When the city council voted to close the Salt River market in 1968, nobody at the meeting seemed to think they were ending anything. The minutes are almost boring. A traffic engineer spoke for eleven minutes about congestion on Victoria Road; a councillor asked whether the fish stalls could be moved “somewhere less pungent”; the vote passed. That was it.

But the market wasn’t just a place to buy snoek. My grandmother sold there for twenty-two years, and when I asked her about it last winter she didn’t talk about prices at all. She talked about who owed whom, which stallholder’s son was courting which daughter, where you went if the police were coming. The market was a credit system, a marriage bureau and an early-warning network. Closing it was a planning decision on paper. In practice it pulled the floor out from under a whole neighbourhood.

I think historians have been slow to see this because the archive points the other way. Council records measure footfall and rates. They don’t measure trust. So when Hendricks (1994) argues that the closure “had negligible economic effect,” he is right by the only numbers he had, and wrong about almost everything else. You can’t count a favour.

There’s a second problem, and it’s mine as much as his. Oral history is selective too — my grandmother remembers the market as warmer than it probably was. She left out the fights. She left out the protection money, which I only found out about from a cousin. Memory and minutes both flatten the past, just in opposite directions.

What I want to suggest, then, is fairly modest. The closure of Salt River market should be read as a social event and not only a municipal one, and the evidence for that has to be pieced together from sources that disagree with each other. Interviews, yes. But also the rates books, which show eleven stallholders defaulting within two years. And the church registers, where the number of marriages between families from the market drops by almost half after 1970.

I tried this out on one street. Of the fourteen households on Kipling Lane that had someone selling at the market in 1966, I could trace nine through the 1975 voters' roll. Five had moved, three of them to Mitchells Plain, which in those years meant moving under pressure and not by choice. That is a small sample and I wouldn't build much on it alone. Still, it lines up with what the rates books suggest, and it is the kind of check the council itself could have run and never did.

The obvious objection is that the market was dying anyway. Supermarkets were arriving, and younger people wanted shop jobs, not stalls. Fair enough. But a slow decline lets people adjust and a sudden closure doesn't, and the difference shows in the defaults.

None of this proves a single cause. It does show that something held people together there, and that the council never noticed it was holding anything at all.`;

const HUMAN_BASELINE_1 = `I didn't expect the archive at the Cape Town library to be so quiet. You fill in a slip, you wait, and then forty minutes later a box arrives with the wrong year in it. That happened twice. The third time I got the 1952 rates books, which were what I needed, and also somebody's lunch receipt from 1987 tucked inside the cover. I kept wondering who they were.

My argument in this piece is that municipal records tell you what a city wanted to see. They are honest about drains. They are much less honest about people, and that gap is where the interesting history lives.`;

const HUMAN_BASELINE_2 = `Most people in my family don't like talking about District Six, and I understand why. When my uncle finally did, it took three visits. The first time he talked about football. The second time he talked about football and a bakery. On the third visit he talked for two hours and I barely wrote anything down because I didn't want to interrupt him.

So this reflection is partly about method. You can't schedule memory. Sometimes the useful answer comes after the recorder is off, and you have to decide whether you're allowed to use it.`;

const GENERATED_ESSAY = `## The Role of Urban Markets in Community Life

Urban markets play a crucial role in fostering community cohesion and economic resilience. In today's rapidly changing cities, it is important to note that markets serve as more than commercial spaces — they are vital social infrastructure.

**Economic Impact.** Markets provide accessible entry points for small-scale entrepreneurs. They enable vendors to build sustainable livelihoods while offering affordable goods to local residents. Furthermore, they create a multifaceted network of supply relationships that strengthens the broader regional economy.

**Social Significance.** Beyond their economic function, markets serve as a rich tapestry of cultural exchange. They foster a sense of belonging among diverse communities. Moreover, they provide informal spaces where residents can build trust and share information. This social dimension is a testament to the enduring importance of public gathering places.

## Key Challenges

Despite their benefits, urban markets face several significant challenges:

• Municipal planning priorities often favour traffic flow over community needs.
• Formal regulations can be difficult for informal vendors to navigate.
• Gentrification pressures may displace long-standing traders and customers.

## Policy Recommendations

To address these challenges effectively, municipalities should adopt a comprehensive and inclusive framework. First, they should conduct thorough social impact assessments before approving any closure. Second, they should establish dedicated consultation forums that give vendors a meaningful voice. Third, they should provide adequate relocation support, including transitional funding and suitable alternative premises. These measures can help ensure that development benefits all stakeholders rather than a select few.

Navigating the complexities of urban development requires a nuanced understanding of these competing interests. Policymakers must carefully balance efficiency with equity. Additionally, they should engage meaningfully with affected communities throughout the decision-making process.

## Conclusion

In conclusion, urban markets represent a pivotal element of healthy city life. They underscore the deep connection between economic activity and social wellbeing. Their closure can have far-reaching consequences that extend well beyond measurable financial indicators. Overall, preserving and supporting these vital spaces should remain a key priority for urban planners. By recognising their multifaceted value, cities can ensure that markets continue to thrive. Ultimately, this holistic approach will help build more inclusive and resilient urban communities for future generations.`;

const L2_ESSAY = `In this essay I will discuss the importance of public markets for the people in the city. Markets are very important for many families. They give people a place to buy food and other things. They also give people a place to work and to earn money for the family.

In my home town there was a big market near the station. Every Saturday my mother went there with me. She bought vegetables, fish and bread. She also talked with many people. Some people were her friends from church. Some people were from the same village as her family. The market was a place for meeting people and for sharing news.

When the government closed the market, many people lost their work. The sellers had to find a new place to sell. Some sellers moved to the street, but the police did not allow them to stay there. Other sellers stopped working. My mother said that the town was not the same after the market was closed. People did not meet each other so often. The community became more quiet.

The government said that the market was closed because of the traffic. There were many cars and taxis near the station. But I think the government did not think about the people who used the market. They only thought about the cars. This is a problem because a city is for people and not only for cars.

In conclusion, public markets are very important for the economy and for the community. They help poor families to earn money. They also help people to stay connected with each other. When a city wants to close a market, it must talk with the sellers and the buyers first. It must also give the sellers a new place to work. If the city does this, the community can stay strong. I believe that every city needs a market where people can meet and work together, because this is good for everybody in the city.`;

export const FIXTURES: readonly FixtureSubmission[] = [
  {
    daysAgo: 9,
    submission: {
      studentId: '219047341',
      course: 'HIST 214 · Urban Histories of the Cape',
      assignmentType: 'Argumentative essay',
      aiDisclosure: 'none',
      isL2: false,
      text: HUMAN_ESSAY,
      baselines: [HUMAN_BASELINE_1, HUMAN_BASELINE_2],
      submittedBy: 'Dr N. Mahlangu',
    },
  },
  {
    daysAgo: 4,
    submission: {
      studentId: '220381176',
      course: 'HIST 214 · Urban Histories of the Cape',
      assignmentType: 'Argumentative essay',
      aiDisclosure: 'none',
      isL2: false,
      text: GENERATED_ESSAY,
      baselines: [],
      submittedBy: 'Dr N. Mahlangu',
    },
  },
  {
    daysAgo: 1,
    submission: {
      studentId: '221560928',
      course: 'HIST 214 · Urban Histories of the Cape',
      assignmentType: 'Reflective writing',
      aiDisclosure: 'editing',
      isL2: true,
      text: L2_ESSAY,
      baselines: [],
      submittedBy: 'Dr N. Mahlangu',
    },
  },
];
