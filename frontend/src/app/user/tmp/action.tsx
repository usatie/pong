'use server'

export default async function submit(event: React.FormEvent<HTMLFormElement>) {
  const tmp = Object.fromEntries(new FormData(event.currentTarget));
  console.log(tmp);
  event.preventDefault();
  const { id, ...tmp_obj } = tmp;
  const res = await fetch(`http://localhost:4242/api/user/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tmp_obj),
  });
  const user = await res.json();
  console.log(user);
}
