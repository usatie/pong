"use client"; // Error components must be Client Components

async function submit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
  const res = await fetch("http://localhost:4242/api/user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))),
  });
  const user = await res.json();
  console.log(user);
}

export default function SignUp() {
  return (
    <form className="flex flex-col gap-4" onSubmit={submit}>
      <label>
        <span>Name</span>
        <input type="text" name="name" />
      </label>
      <label>
        <span>Email</span>
        <input type="email" name="email" />
      </label>
      <button type="submit">Sign Up</button>
    </form>
  );
}
