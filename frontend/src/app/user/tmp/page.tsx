async function submit(event: React.FormEvent<HTMLFormElement>) {
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

async function getUser(id: number) {
  try {
    const res = await fetch(`http://backend:3000/api/user/${id}`, {
      cache: "no-cache",
    });
    if (res.ok) {
      const user = await res.json();
      return user;
    } else {
      console.log("ko");
    }
  } catch (e) {
    console.log(e);
  }
}

export default async function SignUp() {
  const tmp_user = await getUser(1);
  console.log(tmp_user);
  console.log("ok");
  return (
    <form className="flex flex-col gap-4">
      <label>
        <span>Id</span>
        <input type="text" name="id" defaultValue={String(tmp_user.id)} />
      </label>
      <label>
        <span>Name</span>
        <input type="text" name="name" defaultValue={tmp_user.name} />
      </label>
      <label>
        <span>Email</span>
        <input type="email" name="email" />
      </label>
      <button type="submit">Update</button>
    </form>
  );
}
