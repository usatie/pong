import { Skeleton } from "@/components/ui/skeleton";
import { HStack, Stack } from "@/app/ui/layout/stack";
import { Input } from "@/components/ui/input";

type Message = {
  id: number;
  user_id: number;
  user_name: string;
  text: string;
  created_at: string;
};

const messages: Message[] = [
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

function AvatarSkeleton() {
  return <Skeleton className="flex-none rounded-full h-10 w-10" />;
}

function ChatMessage({ message }: { message: Message }) {
  return (
    <HStack spacing={4} className="hover:opacity-60">
      <AvatarSkeleton />
      <Stack>
        <HStack spacing={2}>
          <div className="text-xs">{message.user_name}</div>
          <div className="text-xs text-muted">{message.created_at}</div>
        </HStack>
        <div className="text-sm text-muted-foreground">{message.text}</div>
      </Stack>
    </HStack>
  );
}

function SimpleMessage({ message }: { message: Message }) {
  const created_at_hhmm = message.created_at.split(" ")[1].slice(0, 5);
  return (
    <HStack spacing={4} className="group hover:opacity-60 mt-0">
      <div className="group-hover:text-muted flex-none text-background text-xs w-10 text-center">
        {created_at_hhmm}
      </div>
      <div className="text-sm text-muted-foreground">{message.text}</div>
    </HStack>
  );
}

function MessageBlock({ messages }: { messages: Message[] }) {
  return (
    <Stack spacing={1}>
      {<ChatMessage message={messages[0]} />}
      {messages.slice(1).map((msg) => (
        <SimpleMessage message={msg} key={msg.id} />
      ))}
    </Stack>
  );
}

export default function ChatPage() {
  let prev_user_id: number | undefined;
  let block: Message[] = [];
  let blocks: Message[][] = [];
  for (const msg of messages) {
    if (prev_user_id === msg.user_id) {
      block.push(msg);
    } else {
      if (block.length > 0) {
        blocks.push(block);
      }
      block = [msg];
    }
    prev_user_id = msg.user_id;
  }
  if (block.length > 0) {
    blocks.push(block);
  }
  return (
    <>
      <Stack spacing={4}>
        {blocks.map((block) => (
          <MessageBlock messages={block} key={block[0].id} />
        ))}
      </Stack>

      {/*
        I don't know why I need pr-32
        1. `fixed + width:inherited` doesn't work
           (only works if the parent has a set width in px.)
           https://jsfiddle.net/4bGqF/9/
        2. `sticky bottom-0` doesn't work
            (it's sticky, I want it to be fixed.)
        https://stackoverflow.com/questions/5873565/set-width-of-a-position-fixed-div-relative-to-parent-div
        https://tailwindcss.com/docs/position
      */}
      <div className="fixed w-full pr-32 bottom-0">
        <Input placeholder="Type message here" />
        {/* relative -z-10 to be below the Input's hover-ring */}
        <div className="bg-background h-4 relative -z-10"></div>
      </div>
    </>
  );
}
