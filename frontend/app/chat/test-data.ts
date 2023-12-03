export type Message = {
  id: number;
  user_id: number;
  user_name: string;
  text: string;
  created_at: string;
};

export type User = {
  id: number;
  name: string;
};

export const users: User[] = [
  { id: 29387, name: "susami" },
  { id: 29388, name: "shongou" },
  { id: 29389, name: "kakiba" },
  { id: 29390, name: "thara" },
  { id: 29391, name: "very long name user" },
  { id: 29392, name: "John Doe" },
  { id: 29393, name: "Quick Bear" },
  { id: 29394, name: "Friendly Fox" },
  { id: 29395, name: "Lazy Lion" },
  { id: 29396, name: "Quiet Tiger" },
  { id: 29397, name: "Clever Elephant" },
  { id: 29398, name: "Shy Deer" },
  { id: 29399, name: "Brave Rabbit" },
  { id: 29400, name: "Happy Wolf" },
  { id: 29401, name: "Sad Monkey" },
  { id: 29402, name: "Funny Eagle" },
  { id: 29403, name: "Friendly Tiger" },
  { id: 29404, name: "Lazy Elephant" },
  { id: 29405, name: "Quick Monkey" },
  { id: 29406, name: "Funny Deer" },
  { id: 29407, name: "Shy Wolf" },
  { id: 29408, name: "Happy Rabbit" },
  { id: 29409, name: "Brave Bear" },
  { id: 29410, name: "Sad Fox" },
];

export const messages: Message[] = [
  {
    id: 1,
    user_id: 29387,
    user_name: "susami",
    text: "Hi guys",
    created_at: "2023-11-18 12:19:31",
  },
  {
    id: 2,
    user_id: 29387,
    user_name: "susami",
    text: "How are you?",
    created_at: "2023-11-18 12:20:32",
  },
  {
    id: 3,
    user_id: 29388,
    user_name: "shongou",
    text: "I'm fine, thanks",
    created_at: "2023-11-18 12:20:33",
  },
  {
    id: 4,
    user_id: 29388,
    user_name: "shongou",
    text: "What about you?",
    created_at: "2023-11-18 12:21:34",
  },
  {
    id: 5,
    user_id: 29389,
    user_name: "kakiba",
    text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Qui expedita provident voluptas, in modi voluptate accusamus voluptatem voluptatum, assumenda eligendi, quibusdam quis laborum porro quo ut. Odit corrupti quos unde sed nemo possimus cumque obcaecati at aliquid voluptatibus itaque quisquam, reiciendis eveniet est repellat id et maxime quam! Ea, aliquam dolor minima voluptate placeat quas expedita nisi fugiat debitis aliquid ad molestiae illo reprehenderit voluptatem libero, iusto, est fuga. Recusandae fugiat dolorum, nulla eaque, aperiam officia perspiciatis hic quidem debitis accusamus obcaecati illo ea animi tenetur unde itaque reprehenderit cupiditate modi magni officiis? Veritatis, reprehenderit quisquam dolorem excepturi commodi quam!",
    created_at: "2023-11-18 12:21:34",
  },
  {
    id: 6,
    user_id: 29389,
    user_name: "kakiba",
    text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Qui expedita provident voluptas, in modi voluptate accusamus voluptatem voluptatum, assumenda eligendi, quibusdam quis laborum porro quo ut. Odit corrupti quos unde sed nemo possimus cumque obcaecati at aliquid voluptatibus itaque quisquam, reiciendis eveniet est repellat id et maxime quam! Ea, aliquam dolor minima voluptate placeat quas expedita nisi fugiat debitis aliquid ad molestiae illo reprehenderit voluptatem libero, iusto, est fuga. Recusandae fugiat dolorum, nulla eaque, aperiam officia perspiciatis hic quidem debitis accusamus obcaecati illo ea animi tenetur unde itaque reprehenderit cupiditate modi magni officiis? Veritatis, reprehenderit quisquam dolorem excepturi commodi quam!",
    created_at: "2023-11-18 12:22:34",
  },
  {
    id: 7,
    user_id: 29387,
    user_name: "susami",
    text: "I'm fine too",
    created_at: "2023-11-18 12:23:35",
  },
  {
    id: 8,
    user_id: 29389,
    user_name: "kakiba",
    text: "Where are you from?",
    created_at: "2023-11-18 12:24:36",
  },
  {
    id: 9,
    user_id: 29390,
    user_name: "thara",
    text: "I'm from London",
    created_at: "2023-11-18 12:25:37",
  },
  {
    id: 10,
    user_id: 29387,
    user_name: "susami",
    text: "I'm from New York",
    created_at: "2023-11-18 12:25:38",
  },
  {
    id: 11,
    user_id: 29388,
    user_name: "shongou",
    text: "I'm from Paris",
    created_at: "2023-11-18 12:26:39",
  },
  {
    id: 12,
    user_id: 29389,
    user_name: "kakiba",
    text: "I'm from Tokyo",
    created_at: "2023-11-18 12:28:40",
  },
];
